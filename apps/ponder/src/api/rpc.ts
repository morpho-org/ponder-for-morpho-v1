import { type ReadonlyDrizzle } from "ponder";
import { fromHex, type RpcLog, type PublicClient, BlockNumber, BlockTag } from "viem";

import { hasPonderSyncLogs, readPonderSyncInterval, readPonderSyncLogs } from "./utils/ponder-sync";
import { publicClientGetLogs } from "./utils/public-client-get-logs";
import {
  type JsonRpcMetadata,
  type RpcReturnTypeOf,
  hasMethod,
  type RpcParametersOf,
  type RpcParameters,
} from "./utils/types";

export async function requestFn({
  db,
  chainId,
  publicClient,
  jsonRpcReq,
}: {
  db: ReadonlyDrizzle;
  chainId: number;
  publicClient: PublicClient;
  jsonRpcReq: JsonRpcMetadata & RpcParameters;
}): Promise<RpcReturnTypeOf<typeof jsonRpcReq.method>> {
  if (hasMethod(jsonRpcReq, "eth_getLogs")) {
    try {
      const rpcLogs = await eth_getLogs({
        db,
        chainId,
        publicClient,
        parameters: jsonRpcReq.params,
      });
      return {
        jsonrpc: "2.0",
        id: jsonRpcReq.id,
        result: rpcLogs,
      };
    } catch (e) {
      return {
        jsonrpc: "2.0",
        id: jsonRpcReq.id,
        error: {
          code: -32603,
          message: e instanceof Error ? e.message : "Internal error",
        },
      };
    }
  }

  return {
    jsonrpc: "2.0",
    id: jsonRpcReq.id,
    error: {
      code: -32601,
      message: `Unsupported method ${jsonRpcReq.method}`,
    },
  };
}

async function eth_getLogs({
  db,
  chainId,
  publicClient,
  parameters: [params],
}: {
  db: ReadonlyDrizzle;
  chainId: number;
  publicClient: PublicClient;
  parameters: RpcParametersOf<"eth_getLogs">["params"];
}): Promise<RpcLog[]> {
  const ponderSyncInterval = await readPonderSyncInterval({ db, chainId });

  const ponderBlockRange = { fromBlock: 0n, toBlock: 0n };
  const rpcBlockRange: { fromBlock: bigint; toBlock: BlockNumber | BlockTag } = {
    fromBlock: 1n, // `publicClientGetLogs` returns empty array when from > to
    toBlock: 0n,
  };

  switch (params.fromBlock) {
    case "safe":
    case "finalized":
      throw new Error(`fromBlock cannot be ${params.fromBlock}`);
    case undefined:
    case "earliest":
      ponderBlockRange.fromBlock = ponderSyncInterval.min;
      break;
    case "latest":
    case "pending":
      ponderBlockRange.fromBlock = ponderSyncInterval.max;
      break;
    default:
      ponderBlockRange.fromBlock = fromHex(params.fromBlock, "bigint");
      break;
  }

  switch (params.toBlock) {
    case "safe":
    case "finalized":
      throw new Error(`toBlock cannot be ${params.toBlock}`);
    case "earliest":
      ponderBlockRange.toBlock = ponderSyncInterval.min;
      break;
    case undefined:
    case "latest":
    case "pending":
      ponderBlockRange.toBlock = ponderSyncInterval.max;
      rpcBlockRange.fromBlock = ponderSyncInterval.max + 1n;
      rpcBlockRange.toBlock = params.toBlock ?? "latest";
      break;
    default: {
      const toBlock = fromHex(params.toBlock, "bigint");
      if (toBlock <= ponderSyncInterval.max) {
        ponderBlockRange.toBlock = toBlock;
      } else {
        ponderBlockRange.toBlock = ponderSyncInterval.max;
        rpcBlockRange.fromBlock = ponderSyncInterval.max + 1n;
        rpcBlockRange.toBlock = toBlock;
      }
    }
  }

  const [ponderLogs, rpcLogs] = await Promise.all([
    readPonderSyncLogs({
      db,
      chainId,
      ...ponderBlockRange,
      address: params.address,
      topics: params.topics,
      blockHash: params.blockHash,
      limit: 10_000,
    }),
    publicClientGetLogs(publicClient, {
      ...rpcBlockRange,
      address: params.address,
      topics: params.topics,
    }),
  ]);

  // Check if we have any logs for the specified address
  if (ponderLogs.length === 0 && params.address) {
    if (!(await hasPonderSyncLogs({ db, chainId, address: params.address }))) {
      throw new Error(`Requested address not yet indexed`);
    }
  }

  return ponderLogs.concat(rpcLogs);
}
