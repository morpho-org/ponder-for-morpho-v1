import { Hono } from "hono";
import { and, client, eq, graphql, isNotNull, replaceBigInts as replaceBigIntsBase } from "ponder";
import { db, publicClients } from "ponder:api";
import schema from "ponder:schema";
import { type Address, type Hex } from "viem";

import { getLiquidatablePositions } from "./liquidatable-positions";
import { oracleAbi } from "~/abis/Oracle";

function replaceBigInts<T>(value: T) {
  return replaceBigIntsBase(value, (x) => `${String(x)}n`);
}

const app = new Hono();

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

  const publicClient = Object.values(publicClients).find(
    (publicClient) => publicClient.chain?.id === chainId,
  );

  if (!publicClient) {
    return c.json(
      {
        error: `${chainIdRaw} is not one of the supported chains: [${Object.keys(publicClients).join(", ")}]`,
      },
      400,
    );
  }

  const response = getLiquidatablePositions({ db, chainId, publicClient, marketIds });
  return c.json(
    JSON.parse(JSON.stringify(response, (x) => (typeof x === "bigint" ? `${String(x)}n` : x))),
  );
});

app.get("/chain/:chainId/preliquidations", async (c) => {
  const { chainId } = c.req.param();
  const { marketIds } = (await c.req.json()) as unknown as { marketIds: Hex[] };

  if (!Array.isArray(marketIds)) {
    return c.json({ error: "Request body must include a `marketIds` array." }, 400);
  }

  if (marketIds.length === 0) {
    return c.json({ positions: [] });
  }

  const preLiquidationData = await Promise.all(
    marketIds.map(async (marketId) => {
      const [preLiquidations, marketPositions] = await Promise.all([
        db
          .select()
          .from(schema.preLiquidationContract)
          .where(
            and(
              eq(schema.preLiquidationContract.chainId, Number(chainId)),
              eq(schema.preLiquidationContract.marketId, marketId),
            ),
          ),
        db
          .select()
          .from(schema.position)
          .where(
            and(
              eq(schema.position.chainId, Number(chainId)),
              eq(schema.position.marketId, marketId),
            ),
          ),
      ]);

      return await Promise.all(
        preLiquidations.map(async (preLiquidation) => {
          const enabledPositions = await Promise.all(
            marketPositions.filter(async (position) => {
              const authorization = await db
                .select()
                .from(schema.authorization)
                .where(
                  and(
                    eq(schema.authorization.chainId, Number(chainId)),
                    eq(schema.authorization.authorizer, position.user),
                    eq(schema.authorization.authorizee, preLiquidation.address as Address),
                  ),
                );
              return authorization[0]?.isAuthorized ?? false;
            }),
          );

          return {
            address: preLiquidation.address,
            marketId: preLiquidation.marketId,
            params: {
              preLltv: `${preLiquidation.preLltv}`,
              preLCF1: `${preLiquidation.preLcf1}`,
              preLCF2: `${preLiquidation.preLcf2}`,
              preLIF1: `${preLiquidation.preLif1}`,
              preLIF2: `${preLiquidation.preLif2}`,
              preLiquidationOracle: `${preLiquidation.preLiquidationOracle}%`,
            },
            enabledPositions: enabledPositions.map((position) => position.user),
            price: await publicClients[
              chainId as unknown as keyof typeof publicClients
            ].readContract({
              address: preLiquidation.preLiquidationOracle,
              abi: oracleAbi,
              functionName: "price",
            }),
          };
        }),
      );
    }),
  );

  return c.json({ preLiquidationData: preLiquidationData.flat() });
});

export default app;
