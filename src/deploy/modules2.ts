import fs from "fs";
import { Provider, defaultProvider, Account, ec, json } from "starknet";
import * as dotenv from "dotenv";
// const { dependencies } = require('./package.json');

function sleep() {
  return new Promise((resolve) => setTimeout(resolve, 10000));
}

dotenv.config();

const ARTIFACTS_PATH = "./node_modules/@orland0x/sx-core/starknet-artifacts";

async function main() {
  // starknet.js is not able to calculate the class hash for contracts so we must use the Starknet CLI to obtain them
  const spaceClassHash =
    "0x1c34af419b5e573e3f8bf2f302947b2bb55efa789266d1b1bd4a39c7a3a0aab";
  const spaceFactoryClassHash =
    "0x8b29d8f1a2ac7c67d761c8c7585dbf99ad764047484b0687f51d102628fcc7";
  const vanillaAuthenticatorClassHash =
    "0x649662d8458b2fa9982e3353d90d29ff2d444bdf372359f1dc33fbeb4de5676";
  const ethSigAuthenticatorClassHash =
    "0x383a368ef2bad4cbac04ef4dd22b9d36f741041215ab60631562f694e623be0";
  const ethTxAuthenticatorClassHash =
    "0xc4f3330bf07b800f44634a18609230075afda7cc9c0282cf4dc86077e4c1e7";
  const starkSigAuthenticatorClassHash =
    "0x312256f0668acb967c00c887d5442e058bc69987e4c120e9901b562dd4635d9";
  const ethSigSessionKeyAuthenticatorClassHash =
    "0x6c15b1d9dc3160a33d3a1e1b9572f23b01abf3d7aeea26a0f000d8dc10783a6";
  const ethTxSessionKeyAuthenticatorClassHash =
    "0x7847d3dc88481e3419f3d8aa608bab2ca6c99b47e14da44bdf594860ba156ea";
  const vanillaVotingStrategyClassHash =
    "0x71928b5f634d627e59459cab19460271a29292c6e9f318ed80e87c72f89a47c";
  const ethBalanceOfVotingStrategyClassHash =
    "0x3f453618a4de68ccb1774806315c0583ea8b1e8dc44fb7fe99c34fc716305fa";
  const vanillaExecutionStrategyClassHash =
    "0x12ae07a8e851313b2371a9f7dd0fe5e13b3973e459142b4d451e9b710e5291b";
  const ethRelayerExecutionStrategyClassHash =
    "0x21f71fec8ff0f94fb0dace0d17891775c5ccc56573ac4483ea3df0f01fd6976";

  const starknetCommitAddress = "0x76AE9330aA4f807A2e134d2fb2FcBBAfB806985E";

  // Goerli2 Herodotus Deployment:
  const l1MessagesSenderAddress = "0x456Cb24d30eaA6AfFC2A6924Dae0d2a0a8c99C73";
  const fossilFactRegistryAddress =
    "0x2e39818908f0da118fde6b88b52e4dbdf13d2e171e488507f40deb6811bde3f";
  const fossilL1HeadersStoreAddress =
    "0x69606dd1655fdbbf8189e88566c54890be8f7e4a3650398ac17f6586a4a336d";

  // Goerli Herodotus Deployment:
  // const l1MessagesSenderAddress = "0x738bfb83246156b759165d244077865B994F9d33";
  // const fossilFactRegistryAddress =
  //   "0x363108ac1521a47b4f7d82f8ba868199bc1535216bbedfc1b071ae93cc406fd";
  // const fossilL1HeadersStoreAddress =
  //   "0x6ca3d25e901ce1fff2a7dd4079a24ff63ca6bbf8ba956efc71c1467975ab78f";

  const provider =
    process.env.STARKNET_PROVIDER_BASE_URL === undefined
      ? defaultProvider
      : new Provider({
          sequencer: {
            baseUrl: process.env.STARKNET_PROVIDER_BASE_URL!,
            feederGatewayUrl: "feeder_gateway",
            gatewayUrl: "gateway",
          },
        });

  const account = new Account(
    provider,
    process.env.ACCOUNT_ADDRESS!,
    ec.getKeyPair(process.env.ACCOUNT_PRIVATE_KEY!)
  );

  const compiledVanillaAuthenticator = json.parse(
    fs
      .readFileSync(
        ARTIFACTS_PATH +
          "/contracts/starknet/Authenticators/Vanilla.cairo/Vanilla.json"
      )
      .toString("ascii")
  );

  const compiledEthSigAuthenticator = json.parse(
    fs
      .readFileSync(
        ARTIFACTS_PATH +
          "/contracts/starknet/Authenticators/EthSig.cairo/EthSig.json"
      )
      .toString("ascii")
  );
  const compiledEthTxAuthenticator = json.parse(
    fs
      .readFileSync(
        ARTIFACTS_PATH +
          "/contracts/starknet/Authenticators/EthTx.cairo/EthTx.json"
      )
      .toString("ascii")
  );
  const compiledStarkSigAuthenticator = json.parse(
    fs
      .readFileSync(
        ARTIFACTS_PATH +
          "/contracts/starknet/Authenticators/StarkSig.cairo/StarkSig.json"
      )
      .toString("ascii")
  );
  const compiledEthSigSessionKeyAuthenticator = json.parse(
    fs
      .readFileSync(
        ARTIFACTS_PATH +
          "/contracts/starknet/Authenticators/EthSigSessionKey.cairo/EthSigSessionKey.json"
      )
      .toString("ascii")
  );
  const compiledEthTxSessionKeyAuthenticator = json.parse(
    fs
      .readFileSync(
        ARTIFACTS_PATH +
          "/contracts/starknet/Authenticators/EthTxSessionKey.cairo/EthTxSessionKey.json"
      )
      .toString("ascii")
  );
  const compiledVanillaVotingStrategy = json.parse(
    fs
      .readFileSync(
        ARTIFACTS_PATH +
          "/contracts/starknet/VotingStrategies/Vanilla.cairo/Vanilla.json"
      )
      .toString("ascii")
  );
  const compiledEthBalanceOfVotingStrategy = json.parse(
    fs
      .readFileSync(
        ARTIFACTS_PATH +
          "/contracts/starknet/VotingStrategies/EthBalanceOf.cairo/EthBalanceOf.json"
      )
      .toString("ascii")
  );
  const compiledVanillaExecutionStrategy = json.parse(
    fs
      .readFileSync(
        ARTIFACTS_PATH +
          "/contracts/starknet/ExecutionStrategies/Vanilla.cairo/Vanilla.json"
      )
      .toString("ascii")
  );
  const compiledEthRelayerExecutionStrategy = json.parse(
    fs
      .readFileSync(
        ARTIFACTS_PATH +
          "/contracts/starknet/ExecutionStrategies/EthRelayer.cairo/EthRelayer.json"
      )
      .toString("ascii")
  );
  const compiledSpaceFactory = json.parse(
    fs
      .readFileSync(
        ARTIFACTS_PATH +
          "/contracts/starknet/SpaceFactory.cairo/SpaceFactory.json"
      )
      .toString("ascii")
  );
  const compiledSpace = json.parse(
    fs
      .readFileSync(
        ARTIFACTS_PATH +
          "/contracts/starknet/SpaceAccount.cairo/SpaceAccount.json"
      )
      .toString("ascii")
  );

  let response = await account.declareDeploy({
    classHash: vanillaAuthenticatorClassHash,
    contract: compiledVanillaAuthenticator,
  });
  const vanillaAuthenticatorAddress = response.deploy.contract_address!;
  console.log("vanillaAuthenticatorAddress: ", vanillaAuthenticatorAddress);
  await sleep();

  response = await account.declareDeploy({
    classHash: ethSigAuthenticatorClassHash,
    contract: compiledEthSigAuthenticator,
  });
  const ethSigAuthenticatorAddress = response.deploy.contract_address!;
  console.log("ethSigAuthenticatorAddress: ", ethSigAuthenticatorAddress);
  await sleep();

  response = await account.declareDeploy({
    classHash: ethTxAuthenticatorClassHash,
    contract: compiledEthTxAuthenticator,
    constructorCalldata: [starknetCommitAddress],
  });
  const ethTxAuthenticatorAddress = response.deploy.contract_address!;
  console.log("ethTxAuthenticatorAddress: ", ethTxAuthenticatorAddress);
  await sleep();

  response = await account.declareDeploy({
    classHash: starkSigAuthenticatorClassHash,
    contract: compiledStarkSigAuthenticator,
  });
  const starkSigAuthenticatorAddress = response.deploy.contract_address!;
  console.log("starkSigAuthenticatorAddress: ", starkSigAuthenticatorAddress);
  await sleep();

  response = await account.declareDeploy({
    classHash: ethSigSessionKeyAuthenticatorClassHash,
    contract: compiledEthSigSessionKeyAuthenticator,
  });
  const ethSigSessionKeyAuthenticatorAddress =
    response.deploy.contract_address!;
  console.log(
    "ethSigSessionKeyAuthenticatorAddress: ",
    ethSigSessionKeyAuthenticatorAddress
  );
  await sleep();

  response = await account.declareDeploy({
    classHash: ethTxSessionKeyAuthenticatorClassHash,
    contract: compiledEthTxSessionKeyAuthenticator,
    constructorCalldata: [starknetCommitAddress],
  });
  const ethTxSessionKeyAuthenticatorAddress = response.deploy.contract_address!;
  console.log(
    "ethTxSessionKeyAuthenticatorAddress: ",
    ethTxSessionKeyAuthenticatorAddress
  );
  await sleep();

  response = await account.declareDeploy({
    classHash: vanillaVotingStrategyClassHash,
    contract: compiledVanillaVotingStrategy,
  });
  const vanillaVotingStrategyAddress = response.deploy.contract_address!;
  console.log("vanillaVotingStrategyAddress: ", vanillaVotingStrategyAddress);
  await sleep();

  response = await account.declareDeploy({
    classHash: ethBalanceOfVotingStrategyClassHash,
    contract: compiledEthBalanceOfVotingStrategy,
    constructorCalldata: [
      fossilFactRegistryAddress,
      fossilL1HeadersStoreAddress,
    ],
  });
  const ethBalanceOfVotingStrategyAddress = response.deploy.contract_address!;
  console.log(
    "ethBalanceOfVotingStrategyAddress: ",
    ethBalanceOfVotingStrategyAddress
  );
  await sleep();

  response = await account.declareDeploy({
    classHash: vanillaExecutionStrategyClassHash,
    contract: compiledVanillaExecutionStrategy,
  });
  const vanillaExecutionStrategyAddress = response.deploy.contract_address!;
  console.log(
    "vanillaExecutionStrategyAddress: ",
    vanillaExecutionStrategyAddress
  );
  await sleep();

  response = await account.declareDeploy({
    classHash: ethRelayerExecutionStrategyClassHash,
    contract: compiledEthRelayerExecutionStrategy,
  });
  const ethRelayerExecutionStrategyAddress = response.deploy.contract_address!;
  console.log(
    "ethRelayerExecutionStrategyAddress: ",
    ethRelayerExecutionStrategyAddress
  );
  await sleep();

  response = await account.declareDeploy({
    classHash: spaceFactoryClassHash,
    contract: compiledSpaceFactory,
    constructorCalldata: [spaceClassHash],
  });
  const spaceFactoryAddress = response.deploy.contract_address!;
  console.log("spaceFactoryAddress: ", spaceFactoryAddress);

  const modules = {
    version: process.env.npm_package_dependencies__orland0x_sx_core,
    authenticators: {
      vanilla: { address: vanillaAuthenticatorAddress },
      ethSig: { address: ethSigAuthenticatorAddress },
      ethSigSessionKey: { address: ethSigSessionKeyAuthenticatorAddress },
      ethTx: {
        address: ethTxAuthenticatorAddress,
        starknetCommit: starknetCommitAddress,
      },
      ethTxSessionKey: {
        address: ethTxSessionKeyAuthenticatorAddress,
        starknetCommit: starknetCommitAddress,
      },
      starkSig: { address: starkSigAuthenticatorAddress },
    },
    votingStrategies: {
      vanilla: { address: vanillaVotingStrategyAddress },
      ethBalanceOf: {
        address: ethBalanceOfVotingStrategyAddress,
        l1MessagesSender: l1MessagesSenderAddress,
        fossilFactRegistry: fossilFactRegistryAddress,
        fossilL1HeadersStore: fossilL1HeadersStoreAddress,
      },
    },
    executionStrategies: {
      vanilla: { address: vanillaExecutionStrategyAddress },
      ethRelayer: { address: ethRelayerExecutionStrategyAddress },
    },
    spaceFactory: {
      address: spaceFactoryAddress,
      spaceClassHash: spaceClassHash,
    },
  };

  fs.writeFileSync(
    "./deployments/modules-goerli2b.json",
    JSON.stringify(modules)
  );
  console.log("---- MODULE DEPLOYMENT COMPLETE ----");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
