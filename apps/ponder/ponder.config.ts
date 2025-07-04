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
    unichain: { id: 130, rpc: process.env.PONDER_RPC_URL_130 },
    polygon: { id: 137, rpc: process.env.PONDER_RPC_URL_137 },
    katana: { id: 747474, rpc: process.env.PONDER_RPC_URL_747474 },
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
        unichain: {
          address: "0x8f5ae9CddB9f68de460C77730b018Ae7E04a140A",
          startBlock: 9139027,
        },
        polygon: {
          address: "0x1bF0c2541F820E775182832f06c0B7Fc27A25f67",
          startBlock: 66931042,
        },
        katana: {
          address: "0xD50F2DffFd62f94Ee4AEd9ca05C61d0753268aBc",
          startBlock: 2741069,
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
        unichain: {
          address: "0xe9EdE3929F43a7062a007C3e8652e4ACa610Bdc0",
          startBlock: 9316789,
        },
        polygon: {
          address: "0xa9c87daB340631C34BB738625C70499e29ddDC98",
          startBlock: 66931118,
        },
        katana: {
          address: "0x1c8De6889acee12257899BFeAa2b7e534de32E16",
          startBlock: 2741420,
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
        unichain: {
          address: factory({
            address: "0xe9EdE3929F43a7062a007C3e8652e4ACa610Bdc0",
            event: getAbiItem({ abi: metaMorphoFactoryAbi, name: "CreateMetaMorpho" }),
            parameter: "metaMorpho",
          }),
          startBlock: 9316789,
        },
        polygon: {
          address: factory({
            address: "0xa9c87daB340631C34BB738625C70499e29ddDC98",
            event: getAbiItem({ abi: metaMorphoFactoryAbi, name: "CreateMetaMorpho" }),
            parameter: "metaMorpho",
          }),
          startBlock: 66931118,
        },
        katana: {
          address: factory({
            address: "0x1c8De6889acee12257899BFeAa2b7e534de32E16",
            event: getAbiItem({ abi: metaMorphoFactoryAbi, name: "CreateMetaMorpho" }),
            parameter: "metaMorpho",
          }),
          startBlock: 2741420,
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
        unichain: {
          address: "0x9a6061d51743B31D2c3Be75D83781Fa423f53F0E",
          startBlock: 9139027,
        },
        polygon: {
          address: "0xe675A2161D4a6E2de2eeD70ac98EEBf257FBF0B0",
          startBlock: 66931042,
        },
        katana: {
          address: "0x4F708C0ae7deD3d74736594C2109C2E3c065B428",
          startBlock: 2741069,
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
        unichain: {
          address: "0xb04e4D3D59Ee47Ca9BA192707AF13A7D02969911",
          startBlock: 9381237,
        },
        polygon: {
          address: "0xeDadDe37D76c72b98725614d0b41C20Fe612d304",
          startBlock: 68074185,
        },
        katana: {
          address: "0x678EB53A3bB79111263f47B84989d16D81c36D85",
          startBlock: 2741993,
        },
      },
    },
  },
});
