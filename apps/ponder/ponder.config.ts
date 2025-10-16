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
    berachain: { id: 80094, rpc: process.env.PONDER_RPC_URL_80094 },
  },
  contracts: {
    Morpho: {
      abi: morphoBlueAbi,
      chain: {
        berachain: {
          address: "0x24147243f9c08d835C218Cda1e135f8dFD0517D0",
          startBlock: 11160919,
        },
      },
    },
    MetaMorphoFactory: {
      abi: metaMorphoFactoryAbi,
      chain: {
        berachain: {
          address: "0x5EDd48C6ACBd565Eeb31702FD9fa9Cbc86fbE616",
          startBlock: 11161176,
        },
      },
    },
    MetaMorpho: {
      abi: metaMorphoAbi,
      chain: {
        berachain: {
          address: factory({
            address: "0x5EDd48C6ACBd565Eeb31702FD9fa9Cbc86fbE616",
            event: getAbiItem({ abi: metaMorphoFactoryAbi, name: "CreateMetaMorpho" }),
            parameter: "metaMorpho",
          }),
          startBlock: 11161176,
        },
      },
    },
    AdaptiveCurveIRM: {
      abi: adaptiveCurveIrmAbi,
      chain: {
        berachain: {
          address: "0xcf247Df3A2322Dea0D408f011c194906E77a6f62",
          startBlock: 11160919,
        },
      },
    },
    PreLiquidationFactory: {
      abi: preLiquidationFactoryAbi,
      chain: {
        // berachain: {
        //   address: "0x",
        //   startBlock: 451328,
        // },
      },
    },
  },
});
