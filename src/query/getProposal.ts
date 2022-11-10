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
    console.log(provider);
    const out = await provider.getBlock();
    console.log(out);
    }

    main()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });