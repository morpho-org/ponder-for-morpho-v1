import { type ReadonlyDrizzle, sql } from "ponder";
import { type Address, type BlockNumber, type Hex, type LogTopic, type RpcLog, toHex } from "viem";

interface IntervalRow {
  min_block: string;
  max_block: string;
}

export async function readPonderSyncInterval({
  db,
  chainId,
}: {
  db: ReadonlyDrizzle;
  chainId: number;
}) {
  const q = sql<IntervalRow>`
    SELECT
      MIN(LOWER(r)) AS min_block,
      MAX(UPPER(r)) AS max_block
    FROM (
      SELECT UNNEST(blocks) AS r
      FROM ponder_sync.intervals
      WHERE chain_id = ${chainId}
    );
  `;

  const res = (await db.execute(q)) as { rows?: IntervalRow[] };

  if (res.rows?.[0] === undefined) {
    throw new Error(`Finalized block intervals missing for chain ${chainId.toFixed(0)}`);
  }

  return {
    min: BigInt(res.rows[0].min_block),
    max: BigInt(res.rows[0].max_block),
  };
}

interface LogsRow {
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

export async function readPonderSyncLogs({
  db,
  chainId,
  fromBlock,
  toBlock,
  address,
  topics,
  blockHash,
  limit = 10_000,
}: {
  db: ReadonlyDrizzle;
  chainId: number;
  fromBlock?: BlockNumber;
  toBlock?: BlockNumber;
  address?: Address | Address[];
  topics?: LogTopic[];
  blockHash?: Hex;
  limit?: number;
}): Promise<RpcLog[]> {
  const conditions = [sql`chain_id = ${chainId.toFixed(0)}`];

  if (fromBlock) {
    conditions.push(sql`block_number >= ${fromBlock.toString(10)}`);
  }

  if (toBlock) {
    conditions.push(sql`block_number <= ${toBlock.toString(10)}`);
  }

  if (address) {
    conditions.push(lowercasedSqlMatch(sql.identifier("address"), address));
  }

  if (topics) {
    topics.forEach((topic, i) => {
      if (topic == null) return;
      conditions.push(lowercasedSqlMatch(sql.identifier(`topic${i.toFixed(0)}`), topic));
    });
  }

  if (blockHash) {
    conditions.push(lowercasedSqlMatch(sql.identifier("block_hash"), blockHash));
  }

  const w = sql.join(conditions, sql` AND `);
  const q = sql<LogsRow>`
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
    WHERE ${w}
    ORDER BY block_number, transaction_index, log_index
    LIMIT ${limit}
  `;

  const res = (await db.execute(q)) as { rows?: LogsRow[] };

  if (res.rows === undefined) {
    return [];
  }

  return res.rows.map((row) => {
    const topics = [row.topic0, row.topic1, row.topic2, row.topic3].filter(
      (topic) => topic != null,
    ) as [] | [Hex, ...Hex[]];

    return {
      address: row.address,
      blockNumber: toHex(BigInt(row.block_number)),
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

export async function hasPonderSyncLogs(args: {
  db: ReadonlyDrizzle;
  chainId: number;
  address?: Address | Address[];
}) {
  const logs = await readPonderSyncLogs({ ...args, limit: 1 });
  return logs.length > 0;
}

function lowercasedSqlMatch(column: ReturnType<typeof sql.identifier>, valid: string | string[]) {
  if (Array.isArray(valid)) {
    return sql`LOWER(${column}) IN (${lowercasedSqlList(valid)})`;
  } else {
    return sql`LOWER(${column}) = ${valid.toLowerCase()}`;
  }
}

function lowercasedSqlList(list: string[]) {
  return sql.join(
    list.map((item) => sql`${item.toLowerCase()}`),
    sql`, `,
  );
}
