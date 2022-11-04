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

  const space = JSON.parse(
    fs.readFileSync("./deployments/local-space.json").toString()
  );
  const client = new clients.EthereumSig({
    ethUrl: process.env.ETHEREUM_URL!,
    manaUrl: process.env.STARKNET_PROVIDER_BASE_URL!,
  });
  const payload = await client.propose(ethAccount, ethAccount.address, {
    space: space.address,
    authenticator: space.authenticators.ethSig.address,
    strategies: [0],
    executor: space.executionStrategies.vanilla.address,
    executionParams: [],
    metadataUri: "hello",
  });
  console.log(payload);

  const txClient = new clients.StarkNetTx({
    ethUrl: process.env.STARKNET_PROVIDER_BASE_URL!,
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
