import fs from "fs";
import * as dotenv from "dotenv";
import { ethers } from "ethers";
import fetch from "cross-fetch";

dotenv.config();

const ARTIFACTS_PATH = "./node_modules/@orland0x/sx-core/artifacts";

async function main() {
  global.fetch = fetch;
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.GOERLI_NODE_URL!
  );
  const ethAccount = new ethers.Wallet(process.env.ETH_PK_1!, provider);
  const starknetCoreAddress = "0xde29d060D45901Fb19ED6C6e959EB22d8626708e";
  const metadata = JSON.parse(
    fs
      .readFileSync(
        ARTIFACTS_PATH +
          "/contracts/ethereum/StarkNetCommit/StarkNetCommit.sol/StarkNetCommit.json"
      )
      .toString()
  );

  const starknetCommitFactory = new ethers.ContractFactory(
    metadata.abi,
    metadata.bytecode,
    ethAccount
  );
  const starknetCommit = await starknetCommitFactory.deploy(
    starknetCoreAddress
  );
  console.log(starknetCommit);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
