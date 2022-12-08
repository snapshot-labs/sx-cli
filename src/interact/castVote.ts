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
      "proposal-id": { type: "number", alias: "p", demandOption: true },
      choice: { type: "string", alias: "c", demandOption: true },
    })
    .parseSync();
  const choice =
    argv.choice == "FOR"
      ? utils.choice.Choice.FOR
      : argv.choice == "AGAINST"
      ? utils.choice.Choice.AGAINST
      : argv.choice == "ABSTAIN"
      ? utils.choice.Choice.ABSTAIN
      : undefined;
  const space = JSON.parse(fs.readFileSync(argv.spacePath).toString());
  const client = new clients.EthereumSig({
    ethUrl: process.env.ETHEREUM_URL!,
    starkProvider: provider,
    manaUrl: process.env.STARKNET_PROVIDER_BASE_URL!,
  });
  const payload = await client.vote(ethAccount, ethAccount.address, {
    space: space.address,
    authenticator: space.authenticators[argv.authenticator].address,
    strategies: argv.votingStrategies.map((x) => Number(x)),
    proposal: argv.proposalId,
    choice: choice!,
  });
  const txClient = new clients.StarkNetTx({
    ethUrl: process.env.STARKNET_PROVIDER_BASE_URL!,
    starkProvider: provider,
  });
  const out = await txClient.vote(starkAccount, payload);
  console.log(out);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
