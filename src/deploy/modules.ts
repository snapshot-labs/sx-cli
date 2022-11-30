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
  // Obtained via declaring the space account contract:
  // starknet declare --contract ./starknet-artifacts/contracts/starknet/SpaceAccount.cairo/SpaceAccount.json
  const spaceClassHash =
    "0x1c34af419b5e573e3f8bf2f302947b2bb55efa789266d1b1bd4a39c7a3a0aab";

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

  let response = await provider.deployContract({
    contract: compiledVanillaAuthenticator,
  });
  const vanillaAuthenticatorAddress = response.contract_address!;
  sleep();
  console.log(1);
  response = await provider.deployContract({
    contract: compiledEthSigAuthenticator,
  });
  const ethSigAuthenticatorAddress = response.contract_address!;
  await sleep();
  console.log(1);
  response = await provider.deployContract({
    contract: compiledEthTxAuthenticator,
    constructorCalldata: [starknetCommitAddress],
  });
  const ethTxAuthenticatorAddress = response.contract_address!;
  await sleep();
  console.log(1);
  response = await provider.deployContract({
    contract: compiledStarkSigAuthenticator,
  });
  const starkSigAuthenticatorAddress = response.contract_address!;
  sleep();
  console.log(1);
  response = await provider.deployContract({
    contract: compiledEthSigSessionKeyAuthenticator,
  });
  const ethSigSessionKeyAuthenticatorAddress = response.contract_address!;
  await sleep();
  console.log(1);
  response = await provider.deployContract({
    contract: compiledEthTxSessionKeyAuthenticator,
    constructorCalldata: [starknetCommitAddress],
  });
  const ethTxSessionKeyAuthenticatorAddress = response.contract_address!;
  await sleep();
  console.log(1);
  response = await provider.deployContract({
    contract: compiledVanillaVotingStrategy,
  });
  const vanillaVotingStrategyAddress = response.contract_address!;
  await sleep();
  console.log(1);
  response = await provider.deployContract({
    contract: compiledEthBalanceOfVotingStrategy,
    constructorCalldata: [
      fossilFactRegistryAddress,
      fossilL1HeadersStoreAddress,
    ],
  });
  const ethBalanceOfVotingStrategyAddress = response.contract_address!;
  await sleep();
  response = await provider.deployContract({
    contract: compiledVanillaExecutionStrategy,
  });
  const vanillaExecutionStrategyAddress = response.contract_address!;
  await sleep();
  console.log(1);
  response = await provider.deployContract({
    contract: compiledEthRelayerExecutionStrategy,
  });
  const ethRelayerExecutionStrategyAddress = response.contract_address!;
  await sleep();
  console.log(1);
  response = await provider.deployContract({
    contract: compiledSpaceFactory,
    constructorCalldata: [spaceClassHash],
  });
  const spaceFactoryAddress = response.contract_address!;
  await sleep();
  console.log(1);

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
    "./deployments/modules-goerli2.json",
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
