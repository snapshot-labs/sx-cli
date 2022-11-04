import fs from "fs";
import { Provider, defaultProvider, Account, ec, json } from "starknet";
import * as dotenv from "dotenv";
// const { dependencies } = require('./package.json');

dotenv.config();

const ARTIFACTS_PATH = "./node_modules/@orland0x/sx-core/starknet-artifacts";

async function main() {
  // Obtained via declaring the space account contract:
  // starknet declare --contract ./starknet-artifacts/contracts/starknet/SpaceAccount.cairo/SpaceAccount.json
  const spaceClassHash =
    "0x591469387a06fb88dd66559f4bc91e4c0c1e61e65c259b14a4d43f274fdabd9";

  const starknetCommitAddress = "0x76AE9330aA4f807A2e134d2fb2FcBBAfB806985E";

  const l1MessagesSenderAddress = "0x738bfb83246156b759165d244077865B994F9d33";
  const fossilFactRegistryAddress =
    "0x363108ac1521a47b4f7d82f8ba868199bc1535216bbedfc1b071ae93cc406fd";
  const fossilL1HeadersStoreAddress =
    "0x6ca3d25e901ce1fff2a7dd4079a24ff63ca6bbf8ba956efc71c1467975ab78f";

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

  const deployTxs = [
    provider.deployContract({ contract: compiledVanillaAuthenticator }),
    provider.deployContract({ contract: compiledEthSigAuthenticator }),
    provider.deployContract({
      contract: compiledEthTxAuthenticator,
      constructorCalldata: [starknetCommitAddress],
    }),
    provider.deployContract({ contract: compiledStarkSigAuthenticator }),
    provider.deployContract({
      contract: compiledEthSigSessionKeyAuthenticator,
    }),
    provider.deployContract({
      contract: compiledEthTxSessionKeyAuthenticator,
      constructorCalldata: [starknetCommitAddress],
    }),
    provider.deployContract({ contract: compiledVanillaVotingStrategy }),
    provider.deployContract({
      contract: compiledEthBalanceOfVotingStrategy,
      constructorCalldata: [
        fossilFactRegistryAddress,
        fossilL1HeadersStoreAddress,
      ],
    }),
    provider.deployContract({ contract: compiledVanillaExecutionStrategy }),
    provider.deployContract({ contract: compiledEthRelayerExecutionStrategy }),
    provider.deployContract({
      contract: compiledSpaceFactory,
      constructorCalldata: [spaceClassHash],
    }),
  ];
  const responses = await Promise.all(deployTxs);
  const vanillaAuthenticatorAddress = responses[0].contract_address!;
  const ethSigAuthenticatorAddress = responses[1].contract_address!;
  const ethTxAuthenticatorAddress = responses[2].contract_address!;
  const starkSigAuthenticatorAddress = responses[3].contract_address!;
  const ethSigSessionKeyAuthenticatorAddress = responses[4].contract_address!;
  const ethTxSessionKeyAuthenticatorAddress = responses[5].contract_address!;
  const vanillaVotingStrategyAddress = responses[6].contract_address!;
  const ethBalanceOfVotingStrategyAddress = responses[7].contract_address!;
  const vanillaExecutionStrategyAddress = responses[8].contract_address!;
  const ethRelayerExecutionStrategyAddress = responses[9].contract_address!;
  const spaceFactoryAddress = responses[10].contract_address!;

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
      starkSig: starkSigAuthenticatorAddress,
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
      zodiac: { address: ethRelayerExecutionStrategyAddress },
    },
    spaceFactory: {
      address: spaceFactoryAddress,
      spaceClassHash: spaceClassHash,
    },
  };

  fs.writeFileSync("./deployments/local-modules.json", JSON.stringify(modules));
  console.log("---- MODULE DEPLOYMENT COMPLETE ----");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
