import {
  AccrualPosition,
  Market,
  MarketParams,
  PreLiquidationParams,
  PreLiquidationPosition,
} from "@morpho-org/blue-sdk";
import { and, eq, inArray, gt, ReadonlyDrizzle } from "ponder";
import { type Address, zeroAddress, type Hex, PublicClient } from "viem";

import { oracleAbi } from "~/abis/Oracle";
// NOTE: Use relative path rather than "ponder:schema" so that tests can import from this file
import * as schema from "~/ponder.schema";

export async function getLiquidatablePositions({
  db,
  chainId,
  publicClient,
  marketIds,
}: {
  db: ReadonlyDrizzle<typeof schema>;
  chainId: number;
  publicClient: PublicClient;
  marketIds: Hex[];
}) {
  const [marketRows, preLiquidationRows] = await Promise.all([
    // Grab markets for all `marketIds`, along with associated borrow positions
    db.query.market.findMany({
      where: (row) => and(eq(row.chainId, chainId), inArray(row.id, marketIds)),
      with: { positions: { where: (row) => gt(row.borrowShares, 0n) } },
    }),
    // Grab (position, preLiquidationContract) tuples, relating them by authorization
    db
      .select({
        position: schema.position,
        preLiquidationContract: schema.preLiquidationContract,
      })
      .from(schema.preLiquidationContract)
      .leftJoin(
        schema.authorization,
        and(
          eq(schema.authorization.chainId, schema.preLiquidationContract.chainId),
          eq(schema.authorization.authorizee, schema.preLiquidationContract.address),
          eq(schema.authorization.isAuthorized, true),
        ),
      )
      .innerJoin(
        schema.position,
        and(
          eq(schema.position.chainId, schema.preLiquidationContract.chainId),
          eq(schema.position.marketId, schema.preLiquidationContract.marketId),
          eq(schema.position.user, schema.authorization.authorizer),
          gt(schema.position.borrowShares, 0n),
        ),
      )
      .where(
        and(
          eq(schema.preLiquidationContract.chainId, chainId),
          inArray(schema.preLiquidationContract.marketId, marketIds),
        ),
      ),
  ]);

  // Coalesce rows so we have one entry per market
  const preLiquidationCandidates = new Map<Address, typeof preLiquidationRows>();
  for (const row of preLiquidationRows) {
    if (!preLiquidationCandidates.has(row.position.marketId)) {
      preLiquidationCandidates.set(row.position.marketId, []);
    }
    preLiquidationCandidates.get(row.position.marketId)?.push(row);
  }

  const oracleSet = new Set([
    ...marketRows.map((market) => market.oracle),
    ...preLiquidationRows.map((c) => c.preLiquidationContract.preLiquidationOracle),
  ]);
  oracleSet.delete(zeroAddress);
  const oracles = [...oracleSet];

  // Fetch prices from each unique oracle
  const pricesArr = await publicClient.multicall({
    contracts: oracles.map((oracle) => ({
      abi: oracleAbi,
      address: oracle,
      functionName: "price",
    })),
    allowFailure: true,
    batchSize: 2 ** 16,
  });
  const prices: Record<Address, (typeof pricesArr)[number]> = {};
  for (let i = 0; i < oracles.length; i += 1) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    prices[oracles[i]!] = pricesArr[i]!;
  }

  const now = (Date.now() / 1000).toFixed(0);

  const warnings: string[] = [];
  const results: { market: Market; positions: (AccrualPosition | PreLiquidationPosition)[] }[] = [];

  marketRows.forEach(({ positions: dbPositions, ...dbMarket }) => {
    const price = prices[dbMarket.oracle];
    if (price === undefined) {
      warnings.push(`${dbMarket.oracle} was skipped when fetching prices -- SHOULD NEVER HAPPEN.`);
      return;
    } else if (price.status === "failure") {
      warnings.push(`${dbMarket.oracle} failed to return a price ${price.error}`);
      return;
    }

    const market = new Market({
      ...dbMarket,
      params: new MarketParams(dbMarket),
      price: price.result,
    }).accrueInterest(now);
    const positionsLiq = dbPositions.map((dbPosition) => new AccrualPosition(dbPosition, market));
    const positionsPreLiq = (preLiquidationCandidates.get(market.id) ?? []).map(
      (c) =>
        new PreLiquidationPosition(
          {
            ...c.position,
            preLiquidation: c.preLiquidationContract.address,
            preLiquidationParams: new PreLiquidationParams(
              (({ preLcf1, preLcf2, preLif1, preLif2, ...rest }) => ({
                ...rest,
                // TODO: Update capitalization in SDK so that we don't have to rename these
                preLCF1: preLcf1,
                preLCF2: preLcf2,
                preLIF1: preLif1,
                preLIF2: preLif2,
              }))(c.preLiquidationContract),
            ),
          },
          market,
        ),
    );

    const positions: (AccrualPosition | PreLiquidationPosition)[] = [
      ...positionsLiq,
      ...positionsPreLiq,
    ];
    positions.sort((a, b) =>
      (a.seizableCollateral ?? 0n) > (b.seizableCollateral ?? 0n) ? -1 : 1,
    );

    // Only keep the first occurrence of each user. They may have approved multiple PreLiquidation
    // contracts, but we only care about the one with the largest `seizableCollateral`.
    const bestPositions: typeof positions = [];
    const userSet = new Set<Address>();

    for (const position of positions) {
      if (!userSet.has(position.user)) {
        bestPositions.push(position);
        userSet.add(position.user);
      }
    }

    return { market, positions };
  });

  return { warnings, results };
}
