import { createConfig, factory } from "ponder";
import { getAbiItem } from "viem";

import { adaptiveCurveIrmAbi } from "./abis/AdaptiveCurveIrm";
import { metaMorphoAbi } from "./abis/MetaMorpho";
import { metaMorphoFactoryAbi } from "./abis/MetaMorphoFactory";
import { morphoBlueAbi } from "./abis/MorphoBlue";
import { preLiquidationFactoryAbi } from "./abis/PreLiquidationFactory";

export default createConfig({
  ordering: "multichain",
  chains: {
    polygon: { id: 137, rpc: process.env.PONDER_RPC_URL_137 },
  },
  contracts: {
    Morpho: {
      abi: morphoBlueAbi,
      chain: {
        polygon: {
          address: "0x1bF0c2541F820E775182832f06c0B7Fc27A25f67",
          startBlock: 66931042,
        },
      },
    },
    MetaMorphoFactory: {
      abi: metaMorphoFactoryAbi,
      chain: {
        polygon: {
          address: "0xa9c87daB340631C34BB738625C70499e29ddDC98",
          startBlock: 66931118,
        },
      },
    },
    MetaMorpho: {
      abi: metaMorphoAbi,
      chain: {
        polygon: {
          address: factory({
            address: "0xa9c87daB340631C34BB738625C70499e29ddDC98",
            event: getAbiItem({ abi: metaMorphoFactoryAbi, name: "CreateMetaMorpho" }),
            parameter: "metaMorpho",
          }),
          startBlock: 66931118,
        },
      },
    },
    AdaptiveCurveIRM: {
      abi: adaptiveCurveIrmAbi,
      chain: {
        polygon: {
          address: "0xe675A2161D4a6E2de2eeD70ac98EEBf257FBF0B0",
          startBlock: 66931042,
        },
      },
    },
    PreLiquidationFactory: {
      abi: preLiquidationFactoryAbi,
      chain: {
        polygon: {
          address: "0xeDadDe37D76c72b98725614d0b41C20Fe612d304",
          startBlock: 68074185,
        },
      },
    },
  },
});
