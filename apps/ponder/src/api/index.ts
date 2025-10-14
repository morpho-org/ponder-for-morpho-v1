import { Hono } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import {
  and,
  client,
  eq,
  graphql,
  inArray,
  isNotNull,
  type ReadonlyDrizzle,
  replaceBigInts as replaceBigIntsBase,
} from "ponder";
import { db, publicClients } from "ponder:api";
import schema from "ponder:schema";
import { type Address, type Hex } from "viem";

import ponderConfig from "../../ponder.config";

import { getLiquidatablePositions } from "./liquidatable-positions";
import { getPreliquidations } from "./preliquidations";
import { requestFn } from "./rpc";
import { keyGenerator } from "./utils/rate-limiting";
import type { JsonRpcMetadata, RpcParameters } from "./utils/types";

function replaceBigInts<T>(value: T) {
  return replaceBigIntsBase(value, (x) => `${String(x)}n`);
}

function getPublicClientFor(chainId: number) {
  const name = Object.entries(ponderConfig.chains).find(([, v]) => v.id === chainId)?.[0] as
    | keyof typeof ponderConfig.chains
    | undefined;
  return name ? publicClients[name] : undefined;
}

const app = new Hono();

app.use(
  rateLimiter({
    windowMs: 1000,
    limit: 10, // Limit each IP to 10 requests per second
    keyGenerator,
  }),
);

app.use("/", graphql({ db, schema }));
app.use("/graphql", graphql({ db, schema }));
app.use("/sql/*", client({ db, schema }));

/**
 * Fetch a given market, optionally including open positions and/or vaults that reference it.
 */
app.post("/chain/:chainId/market/:marketId", async (c) => {
  const { chainId, marketId } = c.req.param();
  const { withPositions, withVaults } = (await c.req.json()) as unknown as {
    withPositions: boolean;
    withVaults: boolean;
  };

  const market = await db.query.market.findFirst({
    where: and(eq(schema.market.chainId, Number(chainId)), eq(schema.market.id, marketId as Hex)),
    with: {
      positions: withPositions ? true : undefined,
      relatedVaultWithdrawQueues: withVaults ? { with: { vault: true } } : undefined,
    },
  });

  return c.json(replaceBigInts(market));
});

/**
 * Fetch a given vault's withdraw queue.
 */
app.post("/chain/:chainId/withdraw-queue/:address", async (c) => {
  const { chainId, address } = c.req.param();

  const vault = await db.query.vault.findFirst({
    where: and(
      eq(schema.vault.chainId, Number(chainId)),
      eq(schema.vault.address, address as Address),
    ),
    with: {
      withdrawQueue: { where: isNotNull(schema.vaultWithdrawQueueItem.marketId) },
    },
  });

  const withdrawQueue = vault?.withdrawQueue.map((x) => x.marketId).filter((x) => x != null) ?? [];
  return c.json(replaceBigInts(withdrawQueue));
});

/**
 * Fetch the set of markets from all vaults' withdraw queues.
 */
app.post("/chain/:chainId/markets", async (c) => {
  const { chainId } = c.req.param();
  const { vaults: vaultsRaw } = (await c.req.json()) as unknown as { vaults: Address[] };

  const withdrawQueueItems = await db.query.vaultWithdrawQueueItem.findMany({
    where: (row) =>
      and(
        eq(row.chainId, Number(chainId)),
        isNotNull(row.marketId),
        inArray(row.address, vaultsRaw),
      ),
  });

  const marketsSet = new Set(withdrawQueueItems.map((item) => item.marketId));
  marketsSet.delete(null);

  return c.json(replaceBigInts([...marketsSet]));
});

/**
 * Fetch a given vault, including markets in its withdraw queue.
 */
app.post("/chain/:chainId/vault/:address", async (c) => {
  const { chainId, address } = c.req.param();

  const vault = await db.query.vault.findFirst({
    where: and(
      eq(schema.vault.chainId, Number(chainId)),
      eq(schema.vault.address, address as Address),
    ),
    with: {
      config: true,
      withdrawQueue: {
        where: isNotNull(schema.vaultWithdrawQueueItem.marketId),
        with: { market: true },
      },
    },
  });

  return c.json(replaceBigInts(vault));
});

/**
 * Fetch all liquidatable (and pre-liquidatable) positions for a given set of markets.
 */
app.post("/chain/:chainId/liquidatable-positions", async (c) => {
  const { chainId: chainIdRaw } = c.req.param();
  const { marketIds: marketIdsRaw } = (await c.req.json()) as unknown as { marketIds: Hex[] };

  if (!Array.isArray(marketIdsRaw)) {
    return c.json({ error: "Request body must include a `marketIds` array." }, 400);
  }

  const chainId = parseInt(chainIdRaw, 10);
  const marketIds = [...new Set(marketIdsRaw)];

  const publicClient = getPublicClientFor(chainId);
  if (!publicClient) {
    return c.json(
      {
        error: `${chainIdRaw} is not one of the supported chains: [${Object.keys(publicClients).join(", ")}]`,
      },
      400,
    );
  }

  const response = await getLiquidatablePositions({ db, chainId, publicClient, marketIds });
  return c.json(replaceBigInts(response));
});

app.post("/chain/:chainId/preliquidations", async (c) => {
  const { chainId: chainIdRaw } = c.req.param();
  const { marketIds: marketIdsRaw } = (await c.req.json()) as unknown as { marketIds: Hex[] };

  if (!Array.isArray(marketIdsRaw)) {
    return c.json({ error: "Request body must include a `marketIds` array." }, 400);
  }

  const chainId = parseInt(chainIdRaw, 10);
  const marketIds = [...new Set(marketIdsRaw)];

  const publicClient = getPublicClientFor(chainId);
  if (!publicClient) {
    return c.json(
      {
        error: `${chainIdRaw} is not one of the supported chains: [${Object.keys(publicClients).join(", ")}]`,
      },
      400,
    );
  }

  const response = await getPreliquidations({ db, chainId, publicClient, marketIds });
  return c.json(replaceBigInts(response));
});

/**
 * JSON-RPC endpoint for eth_getLogs (subset implementation).
 */
app.post("/rpc/:chainId", async (c) => {
  const { chainId: chainIdRaw } = c.req.param();

  const chainId = parseInt(chainIdRaw, 10);

  const publicClient = getPublicClientFor(chainId);
  if (!publicClient) {
    return c.json(
      {
        error: `${chainIdRaw} is not one of the supported chains: [${Object.keys(publicClients).join(", ")}]`,
      },
      400,
    );
  }

  const jsonRpcReq = (await c.req.json()) as unknown as JsonRpcMetadata & RpcParameters;
  return c.json(
    await requestFn({ db: db as unknown as ReadonlyDrizzle, chainId, publicClient, jsonRpcReq }),
  );
});

export default app;
