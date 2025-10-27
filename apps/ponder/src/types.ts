import type { ContractConfig } from "ponder";

export type PonderContractChainEntry = NonNullable<
  Exclude<ContractConfig["chain"], string>[string]
>;

export type PonderContractChain<K extends string> = Record<K, PonderContractChainEntry>;

export type PonderContract<K extends string> = {
  abi: ContractConfig["abi"];
  chain: PonderContractChain<K>;
};

export type PickFrom<T, K extends readonly (keyof T)[]> = { [P in K[number]]: T[P] };

export function pick<T extends object, const K extends readonly (keyof T)[]>(
  obj: T,
  keys: K,
): PickFrom<T, K> {
  const out: Partial<T> = {};
  for (const k of keys) {
    if (k in obj) {
      out[k] = obj[k];
    }
  }
  return out as PickFrom<T, K>;
}

export function typedFromEntries<K extends PropertyKey, V>(
  entries: readonly (readonly [K, V])[],
): Record<K, V> {
  return Object.fromEntries(entries) as Record<K, V>;
}
