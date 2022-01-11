// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.
async function main() {
  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  // ethers is avaialble in the global scope
  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const name = process.env.TOKEN_NAME;
  if (name == null) {
    console.error("TOKEN_NAME required");
    process.exit(1);
  }
  const symbol = process.env.TOKEN_SYMBOL;
  if (symbol == null) {
    console.error("TOKEN_SYMBOL required");
    process.exit(1);
  }
  const cap = process.env.TOKEN_CAP;
  if (cap == null) {
    console.error("TOKEN_CAP required");
    process.exit(1);
  }
  const initialSupply = process.env.TOKEN_INITIAL_SUPPLY;
  if (initialSupply == null) {
    console.error("TOKEN_INITIAL_SUPPLY required");
    process.exit(1);
  }

  console.log(`Creating token: ${name} (${symbol})`);
  console.log(`Cap: ${cap}`);
  console.log(`Initial supply: ${initialSupply}`);

  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy(name, symbol, cap, initialSupply);
  await token.deployed();

  console.log("Token address:", token.address);

  // We also save the contract's artifacts and address in the frontend + backend directories
  saveContractFiles(__dirname + "/../frontend/src/contracts", token);
  saveContractFiles(__dirname + "/../backend/src/contracts", token);
}

function saveContractFiles(contractsDir, token) {
  const fs = require("fs");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ Token: token.address }, undefined, 2)
  );

  const TokenArtifact = artifacts.readArtifactSync("Token");

  fs.writeFileSync(
    contractsDir + "/Token.json",
    JSON.stringify(TokenArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
