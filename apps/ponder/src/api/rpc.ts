import { sql } from "ponder";
import { db } from "ponder:api";
import {
  type Address,
  type Hex,
  type EIP1193Parameters,
  type PublicRpcSchema,
  fromHex,
  toHex,
  type RpcLog,
} from "viem";

interface BlockRangeRow {
  min_block: string;
  max_block: string;
}

interface LogRow {
  address: Address;
  block_hash: Hex;
  block_number: bigint;
  data: Hex;
  log_index: number;
  topic0: Hex | null;
  topic1: Hex | null;
  topic2: Hex | null;
  topic3: Hex | null;
  transaction_hash: Hex;
  transaction_index: number;
}

type RpcParameters = EIP1193Parameters<PublicRpcSchema>;

interface JsonRpcMetadata {
  jsonrpc: "2.0";
  id: number | string | null;
}

interface RpcParametersOf<M extends RpcParameters["method"]> extends JsonRpcMetadata {
  method: M;
  params: Extract<RpcParameters, { method: M }>["params"];
}

interface RpcReturnTypeOf<M extends PublicRpcSchema[number]["Method"]> extends JsonRpcMetadata {
  jsonrpc: "2.0";
  id: number | string | null;
  result?: Extract<PublicRpcSchema[number], { Method: M }>["ReturnType"];
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

function hasMethod<M extends RpcParameters["method"]>(
  x: unknown,
  method: M,
): x is RpcParametersOf<M> {
  return x != null && typeof x === "object" && "method" in x && x.method === method;
}

export async function requestFn(
  chainId: number,
  parameters: JsonRpcMetadata & RpcParameters,
): Promise<RpcReturnTypeOf<typeof parameters.method>> {
  if (hasMethod(parameters, "eth_getLogs")) {
    try {
      const rpcLogs = await eth_getLogs(chainId, parameters.params);
      return {
        jsonrpc: "2.0",
        id: parameters.id,
        result: rpcLogs,
      };
    } catch (e) {
      return {
        jsonrpc: "2.0",
        id: parameters.id,
        error: {
          code: -32603,
          message: e instanceof Error ? e.message : "Internal error",
        },
      };
    }
  }

  return {
    jsonrpc: "2.0",
    id: parameters.id,
    error: {
      code: -32601,
      message: `Unsupported method ${parameters.method}`,
    },
  };
}

async function getBlockRange(chainId: number) {
  const q = sql<BlockRangeRow>`
    SELECT
      MIN(LOWER(r)) AS min_block,
      MAX(UPPER(r)) AS max_block
    FROM (
      SELECT UNNEST(blocks) AS r
      FROM ponder_sync.intervals
      WHERE chain_id = ${chainId}
    );
  `;

  const res = (await db.execute(q)) as { rows?: BlockRangeRow[] };

  if (res.rows?.[0] === undefined) {
    throw new Error(`Finalized block intervals missing for chain ${chainId.toFixed(0)}`);
  }

  return {
    min: BigInt(res.rows[0].min_block),
    max: BigInt(res.rows[0].max_block),
  };
}

async function eth_getLogs(
  chainId: number,
  [params]: RpcParametersOf<"eth_getLogs">["params"],
): Promise<RpcLog[]> {
  const blockRange = await getBlockRange(chainId);

  let fromBlock: bigint;
  let toBlock: bigint;

  switch (params.fromBlock) {
    case undefined:
    case "earliest":
      fromBlock = blockRange.min;
      break;
    case "finalized":
      fromBlock = blockRange.max;
      break;
    case "pending":
    case "latest":
    case "safe":
      throw new Error(`fromBlock cannot be ${params.fromBlock}`);
    default:
      fromBlock = fromHex(params.fromBlock, "bigint");
      break;
  }

  switch (params.toBlock) {
    case "earliest":
      toBlock = blockRange.min;
      break;
    case undefined:
    case "finalized":
      toBlock = blockRange.max;
      break;
    case "pending":
    case "latest":
    case "safe":
      throw new Error(`toBlock cannot be ${params.toBlock}`);
    default:
      toBlock = fromHex(params.toBlock, "bigint");
      break;
  }

  if (fromBlock < blockRange.min || toBlock > blockRange.max) {
    throw new Error(
      `Requested range outside of indexed interval. Available range: ${blockRange.min.toString(10)} ⩥ ${blockRange.max.toString(10)}`,
    );
  }

  const conditions: ReturnType<typeof sql>[] = [
    sql`chain_id = ${chainId.toFixed(0)}`,
    sql`block_number >= ${fromBlock.toString(10)}`,
    sql`block_number <= ${toBlock.toString(10)}`,
  ];

  if (params.address) {
    const addresses = Array.isArray(params.address) ? params.address : [params.address];
    const addressList = sql.join(
      addresses.map((addr) => sql`${addr.toLowerCase()}`),
      sql`, `,
    );
    conditions.push(sql`LOWER(address) IN (${addressList})`);
  }

  if (params.topics) {
    params.topics.forEach((topic, i) => {
      if (topic == null) {
        return;
      }

      const topicColumn = sql.identifier(`topic${i.toFixed(0)}`);
      if (Array.isArray(topic)) {
        const topicList = sql.join(
          topic.map((t) => sql`${t.toLowerCase()}`),
          sql`, `,
        );
        conditions.push(sql`LOWER(${topicColumn}) IN (${topicList})`);
      } else {
        conditions.push(sql`LOWER(${topicColumn}) = ${topic.toLowerCase()}`);
      }
    });
  }

  if (params.blockHash) {
    conditions.push(sql`LOWER(block_hash) = ${params.blockHash.toLowerCase()}`);
  }

  // Query logs
  const whereClause = sql.join(conditions, sql` AND `);
  const q = sql<LogRow>`
    SELECT 
      address,
      block_hash,
      block_number,
      data,
      log_index,
      topic0,
      topic1,
      topic2,
      topic3,
      transaction_hash,
      transaction_index
    FROM ponder_sync.logs
    WHERE ${whereClause}
    ORDER BY block_number, transaction_index, log_index
    LIMIT 10000
  `;

  const res = (await db.execute(q)) as { rows?: LogRow[] };

  // Check if we have any logs for the specified address
  if (params.address && res.rows?.length === 0) {
    const addresses = Array.isArray(params.address) ? params.address : [params.address];
    const addressList = sql.join(
      addresses.map((addr) => sql`${addr.toLowerCase()}`),
      sql`, `,
    );
    const addressCheck = (await db.execute(sql`
      SELECT COUNT(*) as count
      FROM ponder_sync.logs
      WHERE chain_id = ${chainId.toFixed(0)}
        AND LOWER(address) IN (${addressList})
    `)) as { rows?: { count: number }[] };

    if (addressCheck.rows?.[0]?.count === 0) {
      throw new Error(`Requested address not yet indexed`);
    }
  }

  if (res.rows === undefined) {
    return [];
  }

  return res.rows.map((row) => {
    const topics = [row.topic0, row.topic1, row.topic2, row.topic3].filter(
      (topic) => topic != null,
    ) as [] | [Hex, ...Hex[]];

    return {
      address: row.address,
      blockNumber: toHex(row.block_number),
      blockHash: row.block_hash,
      data: row.data,
      logIndex: toHex(row.log_index),
      transactionHash: row.transaction_hash,
      transactionIndex: toHex(row.transaction_index),
      removed: false,
      topics,
    };
  });
}
