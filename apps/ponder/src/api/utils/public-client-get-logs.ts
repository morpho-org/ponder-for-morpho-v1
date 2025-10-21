import {
  type PublicClient,
  type BlockTag,
  type BlockNumber,
  type PublicRpcSchema,
  toHex,
  type RpcLog,
} from "viem";

import { RpcParametersOf } from "./types";

type BlockNumberish = BlockNumber | BlockTag;

async function resolveBlockNumber(client: PublicClient, b: BlockNumberish) {
  if (typeof b === "bigint") return b;
  if (b === "latest") return client.getBlockNumber();

  const block = await client.getBlock({ blockTag: b, includeTransactions: false });
  if (block.number == null) {
    throw new Error(`Resolved block number was null for tag '${b}'`);
  }
  return block.number;
}

export async function publicClientGetLogs(
  client: PublicClient,
  opts: Omit<RpcParametersOf<"eth_getLogs">["params"][0], "fromBlock" | "toBlock" | "blockHash"> & {
    fromBlock?: BlockNumberish;
    toBlock?: BlockNumberish;
    /** Max retry attempts per chunk before splitting. Default: 3 */
    maxRetries?: number;
    /** Initial backoff in milliseconds. Default: 300 */
    initialBackoffMs?: number;
    /** Max backoff cap in milliseconds. Default: 5_000 */
    maxBackoffMs?: number;
    /** The block range above which no retries are performed. Default: 2_000 */
    blockRangeRetryLevel?: bigint;
  },
): Promise<RpcLog[]> {
  const maxRetries = opts.maxRetries ?? 3;
  const initialBackoffMs = opts.initialBackoffMs ?? 100;
  const maxBackoffMs = opts.maxBackoffMs ?? 2_000;
  const blockRangeRetryLevel = opts.blockRangeRetryLevel ?? 2_000n;

  const [from, to] = await Promise.all([
    resolveBlockNumber(client, opts.fromBlock ?? "earliest"),
    resolveBlockNumber(client, opts.toBlock ?? "latest"),
  ]);
  if (from > to) return [];

  const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

  // Core recursive fetcher that retries, then splits on persistent failure.
  const fetchRange = async (lo: bigint, hi: bigint): Promise<RpcLog[]> => {
    let attempt = 0;
    // Try the whole chunk with bounded retries & exponential backoff.
    // If it still fails, split the range in half and recurse.
    // For single-block ranges that keep failing, surface the error.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while (true) {
      try {
        return await client.request<Extract<PublicRpcSchema[number], { Method: "eth_getLogs" }>>({
          method: "eth_getLogs",
          params: [{ ...opts, fromBlock: toHex(lo), toBlock: toHex(hi) }],
        });
      } catch (err) {
        if (to - from <= blockRangeRetryLevel && attempt < maxRetries) {
          const backoff = Math.min(maxBackoffMs, initialBackoffMs * Math.pow(2, attempt));
          await sleep(backoff);
          attempt += 1;
          continue;
        }

        // Out of retries. If the chunk spans multiple blocks, split.
        if (lo < hi) {
          const mid = lo + ((hi - lo) >> 1n); // midpoint, avoids overflow
          const [left, right] = await Promise.all([fetchRange(lo, mid), fetchRange(mid + 1n, hi)]);
          return left.concat(right);
        }

        // Single block and still failing → bubble up.
        throw err;
      }
    }
  };

  return fetchRange(from, to);
}
