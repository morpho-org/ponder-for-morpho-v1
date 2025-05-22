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
    mainnet: { id: 1, rpc: process.env.PONDER_RPC_URL_1 },
    base: { id: 8453, rpc: process.env.PONDER_RPC_URL_8453 },
  },
  contracts: {
    Morpho: {
      abi: morphoBlueAbi,
      chain: {
        mainnet: {
          address: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb",
          startBlock: 18883124,
        },
        base: {
          address: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb",
          startBlock: 13977148,
        },
      },
    },
    MetaMorphoFactory: {
      abi: metaMorphoFactoryAbi,
      chain: {
        mainnet: {
          address: [
            "0x1897A8997241C1cD4bD0698647e4EB7213535c24",
            "0xA9c3D3a366466Fa809d1Ae982Fb2c46E5fC41101",
          ],
          startBlock: 18925584,
        },
        base: {
          address: [
            "0xFf62A7c278C62eD665133147129245053Bbf5918",
            "0xA9c3D3a366466Fa809d1Ae982Fb2c46E5fC41101",
          ],
          startBlock: 13978134,
        },
      },
    },
    MetaMorpho: {
      abi: metaMorphoAbi,
      chain: {
        mainnet: {
          address: factory({
            address: [
              "0x1897A8997241C1cD4bD0698647e4EB7213535c24",
              "0xA9c3D3a366466Fa809d1Ae982Fb2c46E5fC41101",
            ],
            event: getAbiItem({ abi: metaMorphoFactoryAbi, name: "CreateMetaMorpho" }),
            parameter: "metaMorpho",
          }),
          startBlock: 18925584,
        },
        base: {
          address: factory({
            address: [
              "0xFf62A7c278C62eD665133147129245053Bbf5918",
              "0xA9c3D3a366466Fa809d1Ae982Fb2c46E5fC41101",
            ],
            event: getAbiItem({ abi: metaMorphoFactoryAbi, name: "CreateMetaMorpho" }),
            parameter: "metaMorpho",
          }),
          startBlock: 13978134,
        },
      },
    },
    AdaptiveCurveIRM: {
      abi: adaptiveCurveIrmAbi,
      chain: {
        mainnet: {
          address: "0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC",
          startBlock: 18883124,
        },
        base: {
          address: "0x46415998764C29aB2a25CbeA6254146D50D22687",
          startBlock: 13977152,
        },
      },
    },
    PreLiquidationFactory: {
      abi: preLiquidationFactoryAbi,
      chain: {
        mainnet: {
          address: "0x6FF33615e792E35ed1026ea7cACCf42D9BF83476",
          startBlock: 21414664,
        },
        base: {
          address: "0x8cd16b62E170Ee0bA83D80e1F80E6085367e2aef",
          startBlock: 23779056,
        },
      },
    },
  },
});
