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
    // polygon: { id: 137, rpc: process.env.PONDER_RPC_URL_137 },
    katana: { id: 747474, rpc: process.env.PONDER_RPC_URL_747474 },
    arbitrum: { id: 42161, rpc: process.env.PONDER_RPC_URL_42161 },
    tac: { id: 239, rpc: process.env.PONDER_RPC_URL_239 },
    abstract: { id: 2741, rpc: process.env.PONDER_RPC_URL_2741 },
    // bitlayer: { id: 200901, rpc: process.env.PONDER_RPC_URL_200901 },
    botanix: { id: 3637, rpc: process.env.PONDER_RPC_URL_3637 },
    // camp: { id: 484, rpc: process.env.PONDER_RPC_URL_484 },
    celo: { id: 42220, rpc: process.env.PONDER_RPC_URL_42220 },
    // corn: { id: 21000000, rpc: process.env.PONDER_RPC_URL_21000000 },
    etherlink: { id: 42793, rpc: process.env.PONDER_RPC_URL_42793 },
    // flame: { id: 253368190, rpc: process.env.PONDER_RPC_URL_253368190 },
    fraxtal: { id: 252, rpc: process.env.PONDER_RPC_URL_252 },
    // hemi: { id: 43111, rpc: process.env.PONDER_RPC_URL_43111 },
    // hyperevm: { id: 999, rpc: process.env.PONDER_RPC_URL_999 },
    ink: { id: 57073, rpc: process.env.PONDER_RPC_URL_57073 },
    // lisk: { id: 1135, rpc: process.env.PONDER_RPC_URL_1135 },
    // mode: { id: 34443, rpc: process.env.PONDER_RPC_URL_34443 },
    // plume: { id: 98866, rpc: process.env.PONDER_RPC_URL_98866 },
    scroll: { id: 534352, rpc: process.env.PONDER_RPC_URL_534352 },
    soneium: { id: 1868, rpc: process.env.PONDER_RPC_URL_1868 },
    sonic: { id: 146, rpc: process.env.PONDER_RPC_URL_146 },
    worldchain: { id: 480, rpc: process.env.PONDER_RPC_URL_480 },
    // zircuit: { id: 48900, rpc: process.env.PONDER_RPC_URL_48900 },
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
        /* polygon: {
          address: "0x1bF0c2541F820E775182832f06c0B7Fc27A25f67",
          startBlock: 66931042,
        }, */
        katana: {
          address: "0xD50F2DffFd62f94Ee4AEd9ca05C61d0753268aBc",
          startBlock: 2741069,
        },
        arbitrum: {
          address: "0x6c247b1F6182318877311737BaC0844bAa518F5e",
          startBlock: 296446593,
        },
        tac: {
          address: "0x918B9F2E4B44E20c6423105BB6cCEB71473aD35c",
          startBlock: 853025,
        },
        abstract: {
          address: "0xc85CE8ffdA27b646D269516B8d0Fa6ec2E958B55",
          startBlock: 13947713,
        },
        botanix: {
          address: "0x8183d41556Be257fc7aAa4A48396168C8eF2bEAD",
          startBlock: 450759,
        },
        celo: {
          address: "0xd24ECdD8C1e0E57a4E26B1a7bbeAa3e95466A569",
          startBlock: 40249329,
        },
        etherlink: {
          address: "0xbCE7364E63C3B13C73E9977a83c9704E2aCa876e",
          startBlock: 21047448,
        },
        fraxtal: {
          address: "0xa6030627d724bA78a59aCf43Be7550b4C5a0653b",
          startBlock: 15317931,
        },
        ink: {
          address: "0x857f3EefE8cbda3Bc49367C996cd664A880d3042",
          startBlock: 4078776,
        },
        scroll: {
          address: "0x2d012EdbAdc37eDc2BC62791B666f9193FDF5a55",
          startBlock: 12842868,
        },
        soneium: {
          address: "0xE75Fc5eA6e74B824954349Ca351eb4e671ADA53a",
          startBlock: 6440817,
        },
        sonic: {
          address: "0xd6c916eB7542D0Ad3f18AEd0FCBD50C582cfa95f",
          startBlock: 9100931,
        },
        worldchain: {
          address: "0xE741BC7c34758b4caE05062794E8Ae24978AF432",
          startBlock: 9025669,
        },
        /* 
        bitlayer: {
          address: "0xAeA7eFF1bD3c875c18ef50F0387892dF181431C6",
          startBlock: 13516997,
        },
        camp: {
          address: "0xea4f2979D7A99B40404b447Cf71c008e3805760F",
          startBlock: 2410315,
        },
        corn: {
          address: "0xc2B1E031540e3F3271C5F3819F0cC7479a8DdD90",
          startBlock: 251401,
        },
        flame: {
          address: "0x63971484590b054b6Abc4FEe9F31BC6F68CfeC04",
          startBlock: 5991116,
        },
        hemi: {
          address: "0xa4Ca2c2e25b97DA19879201bA49422bc6f181f42",
          startBlock: 1188872,
        },
        hyperevm: {
           address: "0x68e37dE8d93d3496ae143F2E900490f6280C57cD",
           startBlock: 1988429,
        },
        lisk: {
          address: "0x00cD58DEEbd7A2F1C55dAec715faF8aed5b27BF8",
          startBlock: 15731231,
        },
        mode: {
          address: "0xd85cE6BD68487E0AaFb0858FDE1Cd18c76840564",
          startBlock: 19983370,
        },
        plume: {
          address: "0x42b18785CE0Aed7BF7Ca43a39471ED4C0A3e0bB5",
          startBlock: 765994,
        },
        zircuit: {
          address: "0xA902A365Fe10B4a94339B5A2Dc64F60c1486a5c8",
          startBlock: 14640172,
        }, */
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
        /* polygon: {
          address: "0xa9c87daB340631C34BB738625C70499e29ddDC98",
          startBlock: 66931118,
        }, */
        katana: {
          address: "0x1c8De6889acee12257899BFeAa2b7e534de32E16",
          startBlock: 2741420,
        },
        arbitrum: {
          address: "0x878988f5f561081deEa117717052164ea1Ef0c82",
          startBlock: 296447195,
        },
        tac: {
          address: "0xcDA78f4979d17Ec93052A84A12001fe0088AD734",
          startBlock: 978654,
        },
        abstract: {
          address: "0x83A7f60c9fc57cEf1e8001bda98783AA1A53E4b1",
          startBlock: 13949369,
        },
        botanix: {
          address: "0xADfE7FF70F98157E020aD7725e149D2E573480Ee",
          startBlock: 451126,
        },
        celo: {
          address: "0x6870aA9f66C1e5Efe8Dbe8730e86E9e91f688275",
          startBlock: 40259931,
        },
        etherlink: {
          address: "0x997a79c3C04c5B9eb27d343ae126bcCFb5D74781",
          startBlock: 21050315,
        },
        fraxtal: {
          address: "0x27D4Af0AC9E7FDfA6D0853236f249CC27AE79488",
          startBlock: 15318007,
        },
        ink: {
          address: "0xd3f39505d0c48AFED3549D625982FdC38Ea9904b",
          startBlock: 4078830,
        },
        scroll: {
          address: "0x56b65742ade55015e6480959808229Ad6dbc9295",
          startBlock: 12842903,
        },
        soneium: {
          address: "0x7026b436f294e560b3C26E731f5cac5992cA2B33",
          startBlock: 6440899,
        },
        sonic: {
          address: "0x0cE9e3512CB4df8ae7e265e62Fb9258dc14f12e8",
          startBlock: 9101319,
        },
        worldchain: {
          address: "0x4DBB3a642a2146d5413750Cca3647086D9ba5F12",
          startBlock: 9025733,
        },
        /*
        bitlayer: {
          address: "0xb95De4a9C81Ba6240378F383f88592d30937d048",
          startBlock: 13638155,
        },
        camp: {
          address: "0x3F4b9246b7Cd3F7671c70BeBd5AAFC08e5bb5f16",
          startBlock: 2410440,
        },
        corn: {
          address: "0xe430821595602eA5DD0cD350f86987437c7362fA",
          startBlock: 253027,
        },
        flame: {
          address: "0xf2BD176D3A89f6E9f6D0c7F17C4Ae6A3515007a8",
          startBlock: 5991179,
        },
        hemi: {
          address: "0x8e52179BeB18E882040b01632440d8Ca0f01da82",
          startBlock: 1188885,
        },
        hyperevm: {
           address: "0xec051b19d654C48c357dC974376DeB6272f24e53",
           startBlock: 1988677,
        },
        lisk: {
          address: "0x01dD876130690469F685a65C2B295A90a81BaD91",
          startBlock: 15731333,
        },
        mode: {
          address: "0xae5b0884bfff430493D6C844B9fd052Af7d79278",
          startBlock: 19983443,
        },
        plume: {
          address: "0x2525D453D9BA13921D5aB5D8c12F9202b0e19456",
          startBlock: 766078,
        },
        zircuit: {
          address: "0xd2c9068aD68c4c9F1A4fE1Ea650BdFE13DC5EaF1",
          startBlock: 14812082,
        }, */
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
        /* polygon: {
          address: factory({
            address: "0xa9c87daB340631C34BB738625C70499e29ddDC98",
            event: getAbiItem({ abi: metaMorphoFactoryAbi, name: "CreateMetaMorpho" }),
            parameter: "metaMorpho",
          }),
          startBlock: 66931118,
        }, */
        katana: {
          address: factory({
            address: "0x1c8De6889acee12257899BFeAa2b7e534de32E16",
            event: getAbiItem({ abi: metaMorphoFactoryAbi, name: "CreateMetaMorpho" }),
            parameter: "metaMorpho",
          }),
          startBlock: 2741420,
        },
        arbitrum: {
          address: factory({
            address: "0x878988f5f561081deEa117717052164ea1Ef0c82",
            event: getAbiItem({ abi: metaMorphoFactoryAbi, name: "CreateMetaMorpho" }),
            parameter: "metaMorpho",
          }),
          startBlock: 296447195,
        },
        tac: {
          address: factory({
            address: "0xcDA78f4979d17Ec93052A84A12001fe0088AD734",
            event: getAbiItem({ abi: metaMorphoFactoryAbi, name: "CreateMetaMorpho" }),
            parameter: "metaMorpho",
          }),
          startBlock: 978654,
        },
        abstract: {
          address: factory({
            address: "0x83A7f60c9fc57cEf1e8001bda98783AA1A53E4b1",
            event: getAbiItem({ abi: metaMorphoFactoryAbi, name: "CreateMetaMorpho" }),
            parameter: "metaMorpho",
          }),
          startBlock: 13949369,
        },
        botanix: {
          address: factory({
            address: "0xADfE7FF70F98157E020aD7725e149D2E573480Ee",
            event: getAbiItem({ abi: metaMorphoFactoryAbi, name: "CreateMetaMorpho" }),
            parameter: "metaMorpho",
          }),
          startBlock: 450759,
        },
        celo: {
          address: factory({
            address: "0x6870aA9f66C1e5Efe8Dbe8730e86E9e91f688275",
            event: getAbiItem({ abi: metaMorphoFactoryAbi, name: "CreateMetaMorpho" }),
            parameter: "metaMorpho",
          }),
          startBlock: 40259931,
        },
        etherlink: {
          address: factory({
            address: "0x997a79c3C04c5B9eb27d343ae126bcCFb5D74781",
            event: getAbiItem({ abi: metaMorphoFactoryAbi, name: "CreateMetaMorpho" }),
            parameter: "metaMorpho",
          }),
          startBlock: 21050315,
        },
        fraxtal: {
          address: factory({
            address: "0x27D4Af0AC9E7FDfA6D0853236f249CC27AE79488",
            event: getAbiItem({ abi: metaMorphoFactoryAbi, name: "CreateMetaMorpho" }),
            parameter: "metaMorpho",
          }),
          startBlock: 15318007,
        },
        ink: {
          address: factory({
            address: "0xd3f39505d0c48AFED3549D625982FdC38Ea9904b",
            event: getAbiItem({ abi: metaMorphoFactoryAbi, name: "CreateMetaMorpho" }),
            parameter: "metaMorpho",
          }),
          startBlock: 4078830,
        },
        scroll: {
          address: factory({
            address: "0x56b65742ade55015e6480959808229Ad6dbc9295",
            event: getAbiItem({ abi: metaMorphoFactoryAbi, name: "CreateMetaMorpho" }),
            parameter: "metaMorpho",
          }),
          startBlock: 12842903,
        },
        soneium: {
          address: factory({
            address: "0x7026b436f294e560b3C26E731f5cac5992cA2B33",
            event: getAbiItem({ abi: metaMorphoFactoryAbi, name: "CreateMetaMorpho" }),
            parameter: "metaMorpho",
          }),
          startBlock: 6440899,
        },
        sonic: {
          address: factory({
            address: "0x0cE9e3512CB4df8ae7e265e62Fb9258dc14f12e8",
            event: getAbiItem({ abi: metaMorphoFactoryAbi, name: "CreateMetaMorpho" }),
            parameter: "metaMorpho",
          }),
          startBlock: 9101319,
        },
        worldchain: {
          address: factory({
            address: "0x4DBB3a642a2146d5413750Cca3647086D9ba5F12",
            event: getAbiItem({ abi: metaMorphoFactoryAbi, name: "CreateMetaMorpho" }),
            parameter: "metaMorpho",
          }),
          startBlock: 9025733,
        },
        /*
        bitlayer: {
          address: factory({
            address: "0xb95De4a9C81Ba6240378F383f88592d30937d048",
            event: getAbiItem({ abi: metaMorphoFactoryAbi, name: "CreateMetaMorpho" }),
            parameter: "metaMorpho",
          }),
          startBlock: 13638155,
        },
        camp: {
          address: factory({
            address: "0x3F4b9246b7Cd3F7671c70BeBd5AAFC08e5bb5f16",
            event: getAbiItem({ abi: metaMorphoFactoryAbi, name: "CreateMetaMorpho" }),
            parameter: "metaMorpho",
          }),
          startBlock: 2410440,
        },
        corn: {
          address: factory({
            address: "0xe430821595602eA5DD0cD350f86987437c7362fA",
            event: getAbiItem({ abi: metaMorphoFactoryAbi, name: "CreateMetaMorpho" }),
            parameter: "metaMorpho",
          }),
          startBlock: 253027,
        },
        flame: {
          address: factory({
            address: "0xf2BD176D3A89f6E9f6D0c7F17C4Ae6A3515007a8",
            event: getAbiItem({ abi: metaMorphoFactoryAbi, name: "CreateMetaMorpho" }),
            parameter: "metaMorpho",
          }),
          startBlock: 5991179,
        },
        hemi: {
          address: factory({
            address: "0x8e52179BeB18E882040b01632440d8Ca0f01da82",
            event: getAbiItem({ abi: metaMorphoFactoryAbi, name: "CreateMetaMorpho" }),
            parameter: "metaMorpho",
          }),
          startBlock: 1188885,
        },
        hyperevm: {
          address: factory({
            address: "0xec051b19d654C48c357dC974376DeB6272f24e53",
            event: getAbiItem({ abi: metaMorphoFactoryAbi, name: "CreateMetaMorpho" }),
            parameter: "metaMorpho",
          }),
          startBlock: 1988677,
        },
        lisk: {
          address: factory({
            address: "0x01dD876130690469F685a65C2B295A90a81BaD91",
            event: getAbiItem({ abi: metaMorphoFactoryAbi, name: "CreateMetaMorpho" }),
            parameter: "metaMorpho",
          }),
          startBlock: 15731333,
        },
        mode: {
          address: factory({
            address: "0xae5b0884bfff430493D6C844B9fd052Af7d79278",
            event: getAbiItem({ abi: metaMorphoFactoryAbi, name: "CreateMetaMorpho" }),
            parameter: "metaMorpho",
          }),
          startBlock: 19983443,
        },
        plume: {
          address: factory({
            address: "0x2525D453D9BA13921D5aB5D8c12F9202b0e19456",
            event: getAbiItem({ abi: metaMorphoFactoryAbi, name: "CreateMetaMorpho" }),
            parameter: "metaMorpho",
          }),
          startBlock: 766078,
        },
        zircuit: {
          address: factory({
            address: "0xd2c9068aD68c4c9F1A4fE1Ea650BdFE13DC5EaF1",
            event: getAbiItem({ abi: metaMorphoFactoryAbi, name: "CreateMetaMorpho" }),
            parameter: "metaMorpho",
          }),
          startBlock: 14812082,
        }, */
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
        /* polygon: {
          address: "0xe675A2161D4a6E2de2eeD70ac98EEBf257FBF0B0",
          startBlock: 66931042,
        }, */
        katana: {
          address: "0x4F708C0ae7deD3d74736594C2109C2E3c065B428",
          startBlock: 2741069,
        },
        arbitrum: {
          address: "0x937Ce2d6c488b361825D2DB5e8A70e26d48afEd5",
          startBlock: 296446593,
        },
        tac: {
          address: "0x7E82b16496fA8CC04935528dA7F5A2C684A3C7A3",
          startBlock: 853025,
        },
        abstract: {
          address: "0xd334eb112CfD1EB4a50FB871b7D9895EBB955C43",
          startBlock: 13947713,
        },
        botanix: {
          address: "0x28021Ef0269C83302c09D2A89f7b202C4AeDf0C2",
          startBlock: 450759,
        },
        celo: {
          address: "0x683CAAADdfA2F42e24880E202676526d501a5dED",
          startBlock: 40249329,
        },
        etherlink: {
          address: "0xC1523BE776e66ba07b609b1914D0925278f21FE5",
          startBlock: 21047448,
        },
        fraxtal: {
          address: "0xA0D4D77b5D9933073572E19C172BFE866312673b",
          startBlock: 15317931,
        },
        ink: {
          address: "0x9515407b1512F53388ffE699524100e7270Ee57B",
          startBlock: 4078776,
        },
        scroll: {
          address: "0xa5EA7500A27C0079961D93366A6e93aafF18CB90",
          startBlock: 12842868,
        },
        soneium: {
          address: "0x68F9b666b984527A7c145Db4103Cc6d3171C797F",
          startBlock: 6440817,
        },
        sonic: {
          address: "0xDEfCf242226425f93d8DD0e314735C28517C473F",
          startBlock: 9100931,
        },
        worldchain: {
          address: "0x34E99D604751a72cF8d0CFDf87069292d82De472",
          startBlock: 9025669,
        },
        /* 
        bitlayer: {
          address: "0xefB565442B9Eb740B50Cf928C14d21c0111254F9",
          startBlock: 13516997,
        },
        camp: {
          address: "0xd5661D965cc60ed1954d4f6725b766051De3ef97",
          startBlock: 2410315,
        },
        corn: {
          address: "0x58a42117d753a0e69694545DfA19d64c2fB759fB",
          startBlock: 251401,
        },
        flame: {
          address: "0x69b29378a45B46A5c68a5436dCfF6C301E923833",
          startBlock: 5991116,
        },
        hemi: {
          address: "0xdEbdEa31624552DF904A065221cD14088ABDeD70",
          startBlock: 1188872,
        },
        hyperevm: {
          address: "0xD4a426F010986dCad727e8dd6eed44cA4A9b7483",
          startBlock: 1988429,
        },
        lisk: {
          address: "0x5576629f21D528A8c3e06C338dDa907B94563902",
          startBlock: 15731231,
        },
        mode: {
          address: "0xE3d46Ae190Cb39ccA3655E966DcEF96b4eAe1d1c",
          startBlock: 19983370,
        },
        plume: {
          address: "0x7420302Ddd469031Cd2282cd64225cCd46F581eA",
          startBlock: 765994,
        },
        zircuit: {
          address: "0xBADb1809ecF658F36e31CcC980F72de029e1cE46",
          startBlock: 14640172,
        }, */
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
        /* polygon: {
          address: "0xeDadDe37D76c72b98725614d0b41C20Fe612d304",
          startBlock: 68074185,
        }, */
        katana: {
          address: "0x678EB53A3bB79111263f47B84989d16D81c36D85",
          startBlock: 2741993,
        },
        arbitrum: {
          address: "0x635c31B5DF1F7EFbCbC07E302335Ef4230758e3d",
          startBlock: 307326238,
        },
        tac: {
          address: "0x5851C1e423A2F93aFb821834a63cA052D19ae4Ef",
          startBlock: 978967,
        },
        abstract: {
          address: "0x1058DA51242dF63bA3A61c838A61405ea6Edb083",
          startBlock: 13949482,
        },
        botanix: {
          address: "0x2e999ddEbd85bdA0B87C370f30ad18cCb943De60",
          startBlock: 451328,
        },
        celo: {
          address: "0x717a3eF7D366F5ce4636011924D0Bd65ea5eCE2f",
          startBlock: 41808392,
        },
        etherlink: {
          address: "0xd1c37fDd941256FC184eF3A07Be540a90b81Ec21",
          startBlock: 21050766,
        },
        fraxtal: {
          address: "0x373ccddcd3F09D2e1430B3F2b290B9bF56Ae7336",
          startBlock: 16536231,
        },
        ink: {
          address: "0x30607fEa77168d2c0401B6f60F0B40E32F9339E3",
          startBlock: 6385077,
        },
        scroll: {
          address: "0xeD960178e4aDA0296786Fa79D84e8FDF7bd44B25",
          startBlock: 13504587,
        },
        soneium: {
          address: "0xcBD0710425613d666C5Ffb4dE2eE73554F21c34B",
          startBlock: 6443359,
        },
        sonic: {
          address: "0xc72129DA4CC808e955699111b8c22B22Ca8A10b8",
          startBlock: 9102286,
        },
        worldchain: {
          address: "0xe3cE2051a24e58DBFC0eFBe4c2d9e89c5eAe4695",
          startBlock: 10273494,
        },
        /*
        bitlayer: {
          address: "0x4E28CAE07A008FF2D7D345992C969118eb253CD6",
          startBlock: 13638316,
        },
        camp: {
          address: "0xD55fA5DF6F1A21C2B93009A702aad3a0891C1B48",
          startBlock: 2471517,
        },
        corn: {
          address: "0xb9065AC18d3EBdb3263B77B587f9c5CD570545D1",
          startBlock: 253107,
        },
        flame: {
          address: "0x78acCefb2A81a5827C672080cB0b9C98b07d39C4",
          startBlock: 5991315,
        },
        hemi: {
          address: "0x40F2896C551194e364F7C846046C34d8a9FE97e4",
          startBlock: 1188907,
        },
        hyperevm: {
          address: "0x1b6782Ac7A859503cE953FBf4736311CC335B8f0",
          startBlock: 1988956,
        },
        lisk: {
          address: "0xF2c325F26691b6556e6f66451bb38bDa37FEbaa7",
          startBlock: 15731595,
        },
        mode: {
          address: "0x249E4808264c545861e43728186a731dE7c7D745",
          startBlock: 19983599,
        },
        plume: {
          address: "0xF184156Cf6Ad4D3dA7F6449D40755A0f9de97ef3",
          startBlock: 789925,
        },
        zircuit: {
          address: "0x09d7629E82DdD80890495672201fe5FE1f909B0b",
          startBlock: 14812316,
        }, */
      },
    },
  },
});
