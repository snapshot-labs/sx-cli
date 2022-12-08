import fs from "fs";
import * as dotenv from "dotenv";
import yargs from "yargs";
import { Provider, defaultProvider, Account, ec } from "starknet";
import { ethers } from "ethers";
import { utils, clients } from "@snapshot-labs/sx";
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

  const ethAccount = new ethers.Wallet(process.env.ETH_PK_1!);
  const starkAccount = new Account(
    provider,
    process.env.ACCOUNT_ADDRESS!,
    ec.getKeyPair(process.env.ACCOUNT_PRIVATE_KEY!)
  );

  const argv = yargs(process.argv.slice(2))
    .options({
      "space-path": {
        type: "string",
        alias: "s",
        default: "./deployments/space.json",
      },
      authenticator: { type: "string", alias: "a", demandOption: true },
      "voting-strategies": { type: "array", alias: "v", demandOption: true },
      "execution-strategy": { type: "string", alias: "e", demandOption: true },
      "execution-params": { type: "array", alias: "p", demandOption: true },
      "metadata-uri": { type: "string", alias: "m", demandOption: true },
    })
    .parseSync();
  const space = JSON.parse(fs.readFileSync(argv.spacePath).toString());

  const client = new clients.EthereumSig({
    ethUrl: process.env.ETHEREUM_URL!,
    starkProvider: provider,
    manaUrl: process.env.STARKNET_PROVIDER_BASE_URL!,
  });

  const payload = await client.propose(ethAccount, ethAccount.address, {
    space: space.address,
    authenticator: space.authenticators[argv.authenticator].address,
    strategies: argv.votingStrategies.map((x) => Number(x)),
    executor: space.executionStrategies[argv.executionStrategy].address,
    executionParams: argv.executionParams.map((x) => `0x${x.toString(16)}`),
    metadataUri: argv.metadataUri,
  });
  console.log(payload);

  const txClient = new clients.StarkNetTx({
    ethUrl: process.env.STARKNET_PROVIDER_BASE_URL!,
    starkProvider: provider,
  });

  const out = await txClient.propose(starkAccount, payload);
  // TODO: signature is wrong, could be a chaidID problem
  console.log(out);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
