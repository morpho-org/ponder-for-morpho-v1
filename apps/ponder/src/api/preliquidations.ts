import { type IPreLiquidationParams } from "@morpho-org/blue-sdk";
import { and, eq, gt, inArray, ReadonlyDrizzle } from "ponder";
import { type Address, zeroAddress, type Hex, type PublicClient } from "viem";

import { oracleAbi } from "~/abis/Oracle";
// NOTE: Use relative path rather than "ponder:schema" so that tests can import from this file
import * as schema from "~/ponder.schema";

export async function getPreliquidations({
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
  // Grab (position, preLiquidationContract) tuples, relating them by authorization
  const preLiquidationRows = await db
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
    );
  // TODO: could use orderBy to make coalesce step slightly more efficient

  // Coalesce rows so we have one entry per contract
  const preLiquidationCandidates = new Map<Address, typeof preLiquidationRows>();
  for (const row of preLiquidationRows) {
    if (!preLiquidationCandidates.has(row.preLiquidationContract.address)) {
      preLiquidationCandidates.set(row.preLiquidationContract.address, []);
    }
    preLiquidationCandidates.get(row.preLiquidationContract.address)?.push(row);
  }

  const oracleSet = new Set(
    preLiquidationRows.map((c) => c.preLiquidationContract.preLiquidationOracle),
  );
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

  const warnings: string[] = [];
  const results: {
    address: Address;
    marketId: Hex;
    preLiquidationParams: IPreLiquidationParams;
    enabledPositions: Address[];
    price: bigint | null;
  }[] = [];

  [...preLiquidationCandidates.values()].forEach((rows) => {
    const contract = rows.at(0)?.preLiquidationContract;
    if (contract === undefined) return;

    const oracle = contract.preLiquidationOracle;
    const price = prices[oracle];

    if (price === undefined) {
      warnings.push(`${oracle} was skipped when fetching prices -- SHOULD NEVER HAPPEN.`);
      return;
    } else if (price.status === "failure") {
      warnings.push(`${oracle} failed to return a price ${price.error}`);
      return;
    }

    const enabledPositions = [...new Set(rows.map((row) => row.position.user))];

    results.push({
      address: contract.address,
      marketId: contract.marketId,
      preLiquidationParams: (({ chainId, marketId, address, ...rest }) => rest)(contract),
      enabledPositions,
      price: price.result,
    });
  });

  return { warnings, results };
}
