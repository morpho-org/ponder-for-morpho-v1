import { Hono } from "hono";
import { and, client, eq, graphql, isNotNull, replaceBigInts, inArray } from "ponder";
import { db, publicClients } from "ponder:api";
import schema from "ponder:schema";
import type { Address, Hex } from "viem";

import { oracleAbi } from "../../abis/Oracle";

import { accrueInterest, liquidationValues } from "./helpers";

const app = new Hono();

app.use("/", graphql({ db, schema }));
app.use("/graphql", graphql({ db, schema }));
app.use("/sql/*", client({ db, schema }));

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
          .from(schema.preLiquidation)
          .where(
            and(
              eq(schema.preLiquidation.chainId, Number(chainId)),
              eq(schema.preLiquidation.marketId, marketId),
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
            params: {
              preLltv: `${preLiquidation.preLltv}%`,
              preLCF1: `${preLiquidation.preLCF1}%`,
              preLCF2: `${preLiquidation.preLCF2}%`,
              preLIF1: `${preLiquidation.preLIF1}%`,
              preLIF2: `${preLiquidation.preLIF2}%`,
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

  return c.json({ preLiquidationData });
});

app.get("/chain/:chainId/market/:marketId", async (c) => {
  const { chainId, marketId } = c.req.param();

  // just market
  const market = await db.query.market.findFirst({
    where: and(eq(schema.market.chainId, Number(chainId)), eq(schema.market.id, marketId as Hex)),
  });

  // market with positions
  // const marketWithPositions = await db.query.market.findFirst({
  //   where: and(eq(schema.market.chainId, Number(chainId)), eq(schema.market.id, marketId as Hex)),
  //   with: { positions: true },
  // });

  // market with vaults that reference them
  // const marketWithVaults = await db.query.market.findFirst({
  //   where: and(eq(schema.market.chainId, Number(chainId)), eq(schema.market.id, marketId as Hex)),
  //   with: { relatedWithdrawQueues: { with: { vault: { with: { withdrawQueue: true } } } } },
  // });

  return c.json(market);
});

app.get("/chain/:chainId/vault/:address", async (c) => {
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

  return c.json(replaceBigInts(vault, (x) => String(x)));
});

app.post("/chain/:id/liquidatable-positions", async (c) => {
  const { id: chainId } = c.req.param();
  const { marketIds }: { marketIds: Hex[] } = await c.req.json();

  const liquidatablePositions = await Promise.all(
    marketIds.map((marketId) => getLiquidatablePositions(Number(chainId), marketId)),
  );

  return c.json(liquidatablePositions.flat());
});

async function getLiquidatablePositions(chainId: number, marketId: Hex) {
  const [market, positions] = await Promise.all([
    db
      .select()
      .from(schema.market)
      .where(and(eq(schema.market.chainId, Number(chainId)), eq(schema.market.id, marketId)))
      .limit(1),
    db
      .select()
      .from(schema.position)
      .where(
        and(eq(schema.position.chainId, Number(chainId)), eq(schema.position.marketId, marketId)),
      ),
  ]);

  if (!market[0]) return [];

  if (!Object.keys(publicClients).includes(String(chainId))) return [];

  const { oracle, lltv, loanToken, collateralToken, irm } = market[0];

  const { totalBorrowAssets, totalBorrowShares } = accrueInterest(
    market[0],
    market[0].rateAtTarget,
  );

  const collateralPrice = await publicClients[
    chainId as unknown as keyof typeof publicClients
  ].readContract({
    address: oracle,
    abi: oracleAbi,
    functionName: "price",
  });

  return positions
    .map((position) => {
      const { seizableCollateral, repayableAssets } = liquidationValues(
        position.collateral,
        position.borrowShares,
        totalBorrowShares,
        totalBorrowAssets,
        lltv,
        collateralPrice,
      );
      return {
        ...position,
        loanToken,
        collateralToken,
        irm,
        oracle,
        lltv,
        seizableCollateral,
        repayableAssets,
      };
    })
    .filter((position) => position.seizableCollateral !== 0n && position.repayableAssets !== 0n);
}

export default app;
