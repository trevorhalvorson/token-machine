# Token Machine

Easily create your own ERC20 token and minting app.

- Customize your token name, symbol, initial supply, total cap, and mint amount
- Deploy your contract to the blockchain
- Allow users to mint tokens from your web app by solving a captcha

Built with:

- [Hardhat](https://hardhat.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/4.x/)
- [Alchemy](https://www.alchemy.com/)
- [ethers.js](https://docs.ethers.io/v5/)
- [hCaptcha](https://www.hcaptcha.com/)
- [Express](https://expressjs.com/)
- [React](https://reactjs.org/)

**Setup prerequisites**

- [node](https://nodejs.org/en/download/)
- [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [npx](https://www.npmjs.com/package/npx)

## Components

### Contract

[Token.sol](./contracts/Token.sol) is the Solidity contract for the token.
Tests can be found [here](./test/Token.js).

The contract development, testing, and deployment is managed using Hardhat.
See [hardhat.config.js](./hardhat.config.js) and [deploy.js](./scripts/deploy.js).

A `.env` file (at the root of the project directory) with the following variables set is required:

```
# API Key from Alchemy - https://www.alchemy.com/
ALCHEMY_API_KEY=
# Private key from wallet deploying the contract
PRIVATE_KEY=
# Name for your token e.g. "Test Token"
TOKEN_NAME=
# Symbol for your token e.g. TEST
TOKEN_SYMBOL=
# Total cap for your token
TOKEN_CAP=
# Tokens minted to the wallet deploying the contract
TOKEN_INITIAL_SUPPLY=
```

**Setup**

Install dependencies:

```
npm install
```

**Deployment**

```
npx hardhat run scripts/deploy.js --network rinkeby
```

### Backend

HTTP APIs to interact with the contract.

**Setup**

A `.env` file (at the root of the `backend` directory) with the following variables set is required:

```
# Port number to run/expose the web server on
PORT=
# Common network name e.g. rinkeby - https://docs.ethers.io/v5/api/providers/types/#providers-Network
NETWORK_NAME=
# API Key from Alchemy - https://www.alchemy.com/
ALCHEMY_API_KEY=
# Address of wallet that deployed the contract
SIGNER_ADDRESS=
# Private key from wallet deploying the contract
PRIVATE_KEY=
# Amount of tokens to mint to users
MINT_AMOUNT=
# Secret from hcaptcha.com
HCAPTCHA_SECRET=
```

Install dependencies:

```
npm install
```

**Run**

```
npm start
```

**Deployment**

The web server can be deployed using its [Dockerfile](./backend/Dockerfile).

### Frontend

Web app to interact with the contract.

**Setup**

A `.env` file (at the root of the `backend` directory) with the following variables set is required:

```
# Base URL for `backend` e.g. http://localhost:3333
REACT_APP_API_BASE_URL=
# hCaptcha site key - hcaptcha.com
REACT_APP_HCAPTCHA_SITE_KEY=
# Ethereum Chain ID - e.g. 0x4 - https://docs.metamask.io/guide/ethereum-provider.html#chain-ids
REACT_APP_CHAIN_ID=
# Token name
REACT_APP_TOKEN_NAME=
# Token symbol
REACT_APP_TOKEN_SYMBOL=
```

Install dependencies:

```
npm install
```

**Run**

```
npm start
```

# Hardhat Hackathon Boilerplate

This repository contains a sample project that you can use as the starting point
for your Ethereum project. It's also a great fit for learning the basics of
smart contract development.

This project is intended to be used with the
[Hardhat Beginners Tutorial](https://hardhat.org/tutorial), but you should be
able to follow it by yourself by reading the README and exploring its
`contracts`, `tests`, `scripts` and `frontend` directories.

## Quick start

The first things you need to do are cloning this repository and installing its
dependencies:

```sh
git clone https://github.com/nomiclabs/hardhat-hackathon-boilerplate.git
cd hardhat-hackathon-boilerplate
npm install
```

Once installed, let's run Hardhat's testing network:

```sh
npx hardhat node
```

Then, on a new terminal, go to the repository's root folder and run this to
deploy your contract:

```sh
npx hardhat run scripts/deploy.js --network localhost
```

Finally, we can run the frontend with:

```sh
cd frontend
npm install
npm start
```

> Note: There's [an issue in `ganache-core`](https://github.com/trufflesuite/ganache-core/issues/650) that can make the `npm install` step fail.
>
> If you see `npm ERR! code ENOLOCAL`, try running `npm ci` instead of `npm install`.

Open [http://localhost:3000/](http://localhost:3000/) to see your Dapp. You will
need to have [Metamask](https://metamask.io) installed and listening to
`localhost 8545`.

## User Guide

You can find detailed instructions on using this repository and many tips in [its documentation](https://hardhat.org/tutorial).

- [Project description (Token.sol)](https://hardhat.org/tutorial/4-contracts/)
- [Setting up the environment](https://hardhat.org/tutorial/1-setup/)
- [Testing with Hardhat, Mocha and Waffle](https://hardhat.org/tutorial/5-test/)
- [Setting up Metamask](https://hardhat.org/tutorial/8-frontend/#setting-up-metamask)
- [Hardhat's full documentation](https://hardhat.org/getting-started/)

For a complete introduction to Hardhat, refer to [this guide](https://hardhat.org/getting-started/#overview).

## What’s Included?

Your environment will have everything you need to build a Dapp powered by Hardhat and React.

- [Hardhat](https://hardhat.org/): An Ethereum development task runner and testing network.
- [Mocha](https://mochajs.org/): A JavaScript test runner.
- [Chai](https://www.chaijs.com/): A JavaScript assertion library.
- [ethers.js](https://docs.ethers.io/ethers.js/html/): A JavaScript library for interacting with Ethereum.
- [Waffle](https://github.com/EthWorks/Waffle/): To have Ethereum-specific Chai assertions/mathers.
- [A sample frontend/Dapp](./frontend): A Dapp which uses [Create React App](https://github.com/facebook/create-react-app).

## Troubleshooting

- `Invalid nonce` errors: if you are seeing this error on the `npx hardhat node`
  console, try resetting your Metamask account. This will reset the account's
  transaction history and also the nonce. Open Metamask, click on your account
  followed by `Settings > Advanced > Reset Account`.

## Feedback, help and news

We'd love to have your feedback on this tutorial. Feel free to reach us through
this repository or [our Discord server](https://invite.gg/HardhatSupport).

Also you can [follow us on Twitter](https://twitter.com/HardhatHQ).

**Happy _buidling_!**
