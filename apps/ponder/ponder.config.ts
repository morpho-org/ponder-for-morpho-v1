import { createConfig } from "ponder";

import {
  AdaptiveCurveIRM,
  MetaMorpho,
  MetaMorphoFactory,
  Morpho,
  PreLiquidationFactory,
} from "@/constants";
import { getChains, getPartialContract } from "@/chains";

const tier = process.env.CHAIN_TIER ?? "all";

export default createConfig({
  ordering: "multichain",
  chains: getChains(tier),
  contracts: {
    Morpho: getPartialContract(Morpho, tier),
    MetaMorphoFactory: getPartialContract(MetaMorphoFactory, tier),
    MetaMorpho: getPartialContract(MetaMorpho, tier),
    AdaptiveCurveIRM: getPartialContract(AdaptiveCurveIRM, tier),
    PreLiquidationFactory: getPartialContract(PreLiquidationFactory, tier),
  },
});
