import { factory, type ContractConfig } from "ponder";
import {
  abstract,
  arbitrum,
  base,
  celo,
  etherlink,
  fraxtal,
  hemi,
  ink,
  lisk,
  mainnet,
  mode,
  plume,
  polygon,
  scroll,
  sei,
  soneium,
  sonic,
  unichain,
  worldchain,
  zircuit,
} from "viem/chains";
import { getAbiItem } from "viem";
import { adaptiveCurveIrmAbi } from "~/abis/AdaptiveCurveIrm";
import { metaMorphoFactoryAbi } from "~/abis/MetaMorphoFactory";
import { morphoBlueAbi } from "~/abis/MorphoBlue";
import { preLiquidationFactoryAbi } from "~/abis/PreLiquidationFactory";
import { metaMorphoAbi } from "~/abis/MetaMorpho";

import { type PonderContract, typedFromEntries } from "@/types";

function asPonderChain<chainId extends number>(
  chainId: chainId,
): { id: chainId; rpc: string | undefined } {
  return {
    id: chainId,
    rpc: process.env[`PONDER_RPC_URL_${chainId}`],
  };
}

export const chains = {
  mainnet: asPonderChain(mainnet.id),
  base: asPonderChain(base.id),
  unichain: asPonderChain(unichain.id),
  polygon: asPonderChain(polygon.id),
  katana: asPonderChain(747474),
  arbitrum: asPonderChain(arbitrum.id),
  tac: asPonderChain(239),
  abstract: asPonderChain(abstract.id),
  botanix: asPonderChain(3637),
  celo: asPonderChain(celo.id),
  etherlink: asPonderChain(etherlink.id),
  fraxtal: asPonderChain(fraxtal.id),
  hemi: asPonderChain(hemi.id),
  hyperevm: asPonderChain(999),
  ink: asPonderChain(ink.id),
  lisk: asPonderChain(lisk.id),
  mode: asPonderChain(mode.id),
  plume: asPonderChain(plume.id),
  scroll: asPonderChain(scroll.id),
  sei: asPonderChain(sei.id),
  soneium: asPonderChain(soneium.id),
  sonic: asPonderChain(sonic.id),
  worldchain: asPonderChain(worldchain.id),
  zircuit: asPonderChain(zircuit.id),
} as const;

export const Morpho = {
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
    hemi: {
      address: "0xa4Ca2c2e25b97DA19879201bA49422bc6f181f42",
      startBlock: 1188872,
    },
    hyperevm: {
      address: "0x68e37dE8d93d3496ae143F2E900490f6280C57cD",
      startBlock: 1988429,
    },
    ink: {
      address: "0x857f3EefE8cbda3Bc49367C996cd664A880d3042",
      startBlock: 4078776,
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
    scroll: {
      address: "0x2d012EdbAdc37eDc2BC62791B666f9193FDF5a55",
      startBlock: 12842868,
    },
    sei: {
      address: "0xc9cDAc20FCeAAF616f7EB0bb6Cd2c69dcfa9094c",
      startBlock: 166036723,
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
    zircuit: {
      address: "0xA902A365Fe10B4a94339B5A2Dc64F60c1486a5c8",
      startBlock: 14640172,
    },
  },
} as const satisfies PonderContract<keyof typeof chains>;

export const MetaMorphoFactory = {
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
    hemi: {
      address: "0x8e52179BeB18E882040b01632440d8Ca0f01da82",
      startBlock: 1188885,
    },
    hyperevm: {
      address: "0xec051b19d654C48c357dC974376DeB6272f24e53",
      startBlock: 1988677,
    },
    ink: {
      address: "0xd3f39505d0c48AFED3549D625982FdC38Ea9904b",
      startBlock: 4078830,
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
    scroll: {
      address: "0x56b65742ade55015e6480959808229Ad6dbc9295",
      startBlock: 12842903,
    },
    sei: {
      address: "0x8Dea49ec5bd5AeAc8bcf96B3E187F59354118291",
      startBlock: 168896078,
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
    zircuit: {
      address: "0xd2c9068aD68c4c9F1A4fE1Ea650BdFE13DC5EaF1",
      startBlock: 14812082,
    },
  },
} as const satisfies PonderContract<keyof typeof chains>;

export const MetaMorpho = {
  abi: metaMorphoAbi,
  chain: typedFromEntries(
    Object.entries(MetaMorphoFactory.chain).map(([key, values]) => [
      key as keyof typeof MetaMorphoFactory.chain,
      {
        address: factory({
          address: values.address,
          event: getAbiItem({
            abi: MetaMorphoFactory.abi,
            name: "CreateMetaMorpho",
          }),
          parameter: "metaMorpho",
        }),
        startBlock: values.startBlock,
      } satisfies Exclude<ContractConfig["chain"], string>[string],
    ]),
  ),
} satisfies PonderContract<keyof typeof chains>;

export const AdaptiveCurveIRM = {
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
    hemi: {
      address: "0xdEbdEa31624552DF904A065221cD14088ABDeD70",
      startBlock: 1188872,
    },
    hyperevm: {
      address: "0xD4a426F010986dCad727e8dd6eed44cA4A9b7483",
      startBlock: 1988429,
    },
    ink: {
      address: "0x9515407b1512F53388ffE699524100e7270Ee57B",
      startBlock: 4078776,
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
    scroll: {
      address: "0xa5EA7500A27C0079961D93366A6e93aafF18CB90",
      startBlock: 12842868,
    },
    sei: {
      address: "0x6eFA8e3Aa8279eB2fd46b6083A9E52dA72EA56c4",
      startBlock: 166036723,
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
    zircuit: {
      address: "0xBADb1809ecF658F36e31CcC980F72de029e1cE46",
      startBlock: 14640172,
    },
  },
} as const satisfies PonderContract<keyof typeof chains>;

export const PreLiquidationFactory = {
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
    hemi: {
      address: "0x40F2896C551194e364F7C846046C34d8a9FE97e4",
      startBlock: 1188907,
    },
    hyperevm: {
      address: "0x1b6782Ac7A859503cE953FBf4736311CC335B8f0",
      startBlock: 1988956,
    },
    ink: {
      address: "0x30607fEa77168d2c0401B6f60F0B40E32F9339E3",
      startBlock: 6385077,
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
    scroll: {
      address: "0xeD960178e4aDA0296786Fa79D84e8FDF7bd44B25",
      startBlock: 13504587,
    },
    sei: {
      address: "0x65eD61058cEB4895B7d62437BaCEA39b04f6D27B",
      startBlock: 168897284,
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
    zircuit: {
      address: "0x09d7629E82DdD80890495672201fe5FE1f909B0b",
      startBlock: 14812316,
    },
  },
} as const satisfies PonderContract<keyof typeof chains>;
