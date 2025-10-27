import { createConfig } from "ponder";

import {
  AdaptiveCurveIRM,
  chains,
  MetaMorpho,
  MetaMorphoFactory,
  Morpho,
  PreLiquidationFactory,
} from "@/constants";
import { getPartialContract } from "@/chains";

const tier = process.env.CHAIN_TIER ?? "all";

console.log(getPartialContract(Morpho, tier))

export default createConfig({
  ordering: "multichain",
  chains,
  contracts: {
    Morpho: getPartialContract(Morpho, tier),
    MetaMorphoFactory: getPartialContract(MetaMorphoFactory, tier),
    MetaMorpho: getPartialContract(MetaMorpho, tier),
    AdaptiveCurveIRM: getPartialContract(AdaptiveCurveIRM, tier),
    PreLiquidationFactory: getPartialContract(PreLiquidationFactory, tier),
  },
});
