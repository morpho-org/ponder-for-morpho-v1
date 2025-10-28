import { createConfig } from "ponder";

import {
  AdaptiveCurveIRM,
  MetaMorpho,
  MetaMorphoFactory,
  Morpho,
  PreLiquidationFactory,
} from "@/constants";
import { getChains, getPartialContract } from "@/chains";

const tierToIndex = process.env.TIER_TO_INDEX ?? "all";
const tierToServe = process.env.TIER_TO_SERVE ?? tierToIndex;

export default createConfig({
  ordering: "multichain",
  chains: getChains(tierToServe),
  contracts: {
    Morpho: getPartialContract(Morpho, tierToIndex),
    MetaMorphoFactory: getPartialContract(MetaMorphoFactory, tierToIndex),
    MetaMorpho: getPartialContract(MetaMorpho, tierToIndex),
    AdaptiveCurveIRM: getPartialContract(AdaptiveCurveIRM, tierToIndex),
    PreLiquidationFactory: getPartialContract(PreLiquidationFactory, tierToIndex),
  },
});
