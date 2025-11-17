import { chains } from "@/constants";
import { type PickFrom, type PonderContract, pick } from "@/types";

type ChainName = keyof typeof chains;

function setDifference<T>(a: T[], ...bs: T[][]): T[] {
  const set = new Set(a);
  for (const b of bs) {
    for (const item of b) {
      set.delete(item);
    }
  }

  return [...set];
}

const TIER_1 = [
  "mainnet",
  "base",
  "unichain",
  "katana",
  "arbitrum",
  "hyperevm",
] satisfies ChainName[];

const TIER_2 = [
  "celo",
  "hemi",
  "lisk",
  "optimism",
  "plume",
  "soneium",
  "tac",
  "worldchain",
] satisfies Exclude<ChainName, (typeof TIER_1)[number]>[];

// chains that should be in tiers 1/2, but have too many reorgs / RPC issues
const TIER_3 = ["sei", "polygon"] satisfies Exclude<
  ChainName,
  (typeof TIER_1)[number] | (typeof TIER_2)[number]
>[];

const TIER_4 = setDifference(Object.keys(chains), TIER_1, TIER_2, TIER_3) as Exclude<
  ChainName,
  (typeof TIER_1)[number] | (typeof TIER_2)[number] | (typeof TIER_3)[number]
>[];

const tiers = {
  "1": TIER_1,
  "2": TIER_2,
  "3": TIER_3,
  "4": TIER_4,
  all: Object.keys(chains) as (keyof typeof chains)[],
};

type Tiers = typeof tiers;

export function getChainNames<K extends keyof Tiers>(tier: K): Tiers[K] {
  return tiers[tier];
}

export function getChains<K extends keyof Tiers>(tier: K): PickFrom<typeof chains, Tiers[K]> {
  return pick(chains, tiers[tier]);
}

export function getPartialContract<
  Contract extends PonderContract<keyof typeof chains>,
  K extends keyof Tiers,
>(
  contract: Contract,
  tier: K,
): Omit<Contract, "chain"> & { chain: PickFrom<Contract["chain"], Tiers[K]> } {
  return {
    ...contract,
    chain: pick(contract.chain, getChainNames(tier)),
  };
}
