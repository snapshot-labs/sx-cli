import fs from "fs";
import * as dotenv from "dotenv";
import yargs from "yargs";
import { Provider, defaultProvider, Account, ec } from "starknet";
import { utils } from "@snapshot-labs/sx";
dotenv.config();

async function main() {
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

  const starkAccount = new Account(
    provider,
    process.env.ACCOUNT_ADDRESS!,
    ec.getKeyPair(process.env.ACCOUNT_PRIVATE_KEY!)
  );

  const argv = yargs(process.argv.slice(2))
    .options({
      name: { type: "string", alias: "n", default: "My Space" },
      "voting-delay": { type: "string", alias: "d", default: "0x0" },
      "min-voting-duration": { type: "string", alias: "i", default: "0x0" },
      "max-voting-duration": { type: "string", alias: "x", default: "0x15180" },
      "proposal-threshold": { type: "string", alias: "t", demandOption: true },
      quorum: { type: "string", alias: "q", demandOption: true },
      controller: {
        type: "string",
        alias: "c",
        default: process.env.ACCOUNT_ADDRESS,
      },
      "metadata-uri": { type: "string", alias: "u", default: "" },
      authenticators: { type: "array", alias: "a", demandOption: true },
      "voting-strategies": { type: "array", alias: "v", demandOption: true },
      "voting-strategy-params": {
        type: "array",
        alias: "p",
      },
      "execution-strategies": { type: "array", alias: "e", demandOption: true },
      "modules-path": {
        type: "string",
        alias: "m",
        default: "./deployments/modules.json",
      },
      "output-path": {
        type: "string",
        alias: "o",
        default: "./deployments/space.json",
      },
    })
    .parseSync();
  const modules = JSON.parse(fs.readFileSync(argv.modulesPath).toString());
  console.log(argv);
  const authenticators = argv.authenticators.map(
    (x) => modules["authenticators"][x].address
  );
  const votingStrategies = argv.votingStrategies.map(
    (x) => modules["votingStrategies"][x].address
  );

  const votingStrategyParams: string[][] = [[]];
  if (argv.votingStrategyParams != undefined) {
    // We split the array at each 'x' to reconstruct the 2D array
    argv.votingStrategyParams.forEach((x) =>
      x == "x"
        ? votingStrategyParams.push([])
        : votingStrategyParams[votingStrategyParams.length - 1].push(
            `0x${x.toString(16)}`
          )
    );
  }
  const votingStrategyParamsFlat =
    utils.encoding.flatten2DArray(votingStrategyParams);
  const executionStrategies = argv.executionStrategies.map(
    (x) => modules["executionStrategies"][x].address
  );
  const quorum = utils.splitUint256.SplitUint256.fromUint(BigInt(1));
  const proposalThreshold = utils.splitUint256.SplitUint256.fromUint(BigInt(1));
  const metadataUriArr = utils.strings.strToShortStringArr(argv.metadataUri);

  // Deploy space through space factory
  // We set the public key for the account to zero which renders it impossible to execute regular account txs
  const { transaction_hash: txHash } = await starkAccount.execute(
    [
      {
        contractAddress: modules.spaceFactory.address,
        entrypoint: "deploySpace",
        calldata: [
          0,
          argv.votingDelay,
          argv.minVotingDuration,
          argv.maxVotingDuration,
          proposalThreshold.low,
          proposalThreshold.high,
          argv.controller,
          quorum.low,
          quorum.high,
          votingStrategies.length,
          ...votingStrategies,
          votingStrategyParamsFlat.length,
          ...votingStrategyParamsFlat,
          authenticators.length,
          ...authenticators,
          executionStrategies.length,
          ...executionStrategies,
          metadataUriArr.length,
          ...metadataUriArr,
        ],
      },
    ],
    undefined,
    { maxFee: "558180000000000000" }
  );
  console.log("waiting for spaces to be deployed, transaction hash: ", txHash);
  await provider.waitForTransaction(txHash);

  // Extracting space address from the event emitted by the space factory.
  const receipt = (await provider.getTransactionReceipt(txHash)) as any;
  const spaceAddress = receipt.events[1].data[1];

  // Storing deployment config.
  const authenticatorsObj: any = {};
  argv.authenticators.map(
    (x, i) => (authenticatorsObj[x] = { address: authenticators[i] })
  );
  const votingStrategiesObj: any = {};
  argv.votingStrategies.map(
    (x, i) =>
      (votingStrategiesObj[x] = {
        index: i,
        address: votingStrategies[i],
        parameters: votingStrategyParams[i],
      })
  );
  const executionStrategiesObj: any = {};
  argv.executionStrategies.map(
    (x, i) => (executionStrategiesObj[x] = { address: executionStrategies[i] })
  );
  const deployment = {
    version: modules.version,
    name: argv.name,
    address: spaceAddress,
    classHash: modules.spaceFactory.spaceClassHash,
    controller: argv.controller,
    votingDelay: argv.votingDelay,
    minVotingDuration: argv.minVotingDuration,
    maxVotingDuration: argv.maxVotingDuration,
    proposalThreshold: argv.proposalThreshold,
    quorum: argv.quorum,
    metadataUri: argv.metadataUri,
    authenticators: authenticatorsObj,
    executionStrategies: executionStrategiesObj,
    votingStrategies: votingStrategiesObj,
  };

  fs.writeFileSync(argv.outputPath, JSON.stringify(deployment));
  console.log("---- DEPLOYMENT COMPLETE ----");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
