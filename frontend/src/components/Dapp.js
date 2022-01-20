import "./Dapp.css";

import React from "react";

// We'll use ethers to interact with the Ethereum network and our contract
import { ethers } from "ethers";

// We import the contract's artifacts and address here, as we are going to be
// using them with ethers
import TokenArtifact from "../contracts/Token.json";
import contractAddress from "../contracts/contract-address.json";

// All the logic of this dapp is contained in the Dapp component.
// These other components are just presentational ones: they don't have any
// logic. They just render HTML.
import { NoWalletDetected } from "./NoWalletDetected";
import { Wallet } from "./Wallet";
import { Loading } from "./Loading";
import { Mint } from "./Mint";
import { Captcha } from "./Captcha";
import { AddToken } from "./AddToken";
import { TransactionErrorMessage } from "./TransactionErrorMessage";
import { WaitingForTransactionMessage } from "./WaitingForTransactionMessage";

// https://docs.metamask.io/guide/ethereum-provider.html#chain-ids
const CHAIN_ID = process.env.REACT_APP_CHAIN_ID || "0x4";

// Needed to reset captcha state after each mint
let captchaRef = null;

// This component is in charge of doing these things:
//   1. It connects to the user's wallet
//   2. Initializes ethers and the Token contract
//   3. Polls the user balance to keep it updated.
//   4. Lets user mint tokens to their wallet
//   5. Renders the whole application
export class Dapp extends React.Component {
  constructor(props) {
    super(props);

    // We store multiple things in Dapp's state.
    // You don't need to follow this pattern, but it's an useful example.
    this.initialState = {
      // The info of the token (i.e. It's Name and symbol)
      tokenData: undefined,
      // The user's address and balance
      selectedAddress: undefined,
      balance: undefined,
      // The ID about transactions being sent, and any possible error with them
      txBeingSent: undefined,
      transactionError: undefined,
      networkError: undefined,
      // hCaptcha ref
      captchaRef: undefined,
      // hCaptcha verification token
      captchaToken: undefined,
    };

    this.state = this.initialState;
  }

  render() {
    // Ethereum wallets inject the window.ethereum object. If it hasn't been
    // injected, we instruct the user to install MetaMask.
    if (window.ethereum === undefined) {
      return <NoWalletDetected />;
    }

    // If the token data or the user's balance hasn't loaded yet, we show
    // a loading component.
    if (
      this.state.selectedAddress &&
      (!this.state.tokenData || !this.state.balance)
    ) {
      return <Loading />;
    }

    // If everything is loaded, we render the application.
    return (
      <div className="container">
        <div className="row d-flex justify-content-between align-items-center">
          <div>
            {(this.state.selectedAddress && (
              <h1 className="primary-text">
                {this.state.tokenData.name} ({this.state.tokenData.symbol})
                Machine
              </h1>
            )) || <h1 className="primary-text">Token Machine</h1>}
          </div>
          <div className="row d-flex justify-content-end align-items-center">
            <Wallet
              connectWallet={() => this._connectWallet()}
              selectedAddress={this.state.selectedAddress}
              networkError={this.state.networkError}
              dismiss={() => this._dismissNetworkError()}
            />
            <AddToken
              enabled={this.state.selectedAddress != null}
              onAdd={() => this._addTokenToWallet()}
            />
          </div>
        </div>
        <div className="row d-flex justify-content-center align-items-center">
          {/* 
              Sending a transaction isn't an immidiate action. You have to wait
              for it to be mined.
              If we are waiting for one, we show a message here.
            */}
          {this.state.txBeingSent && (
            <WaitingForTransactionMessage txHash={this.state.txBeingSent} />
          )}

          {/* 
              Sending a transaction can fail in multiple ways. 
              If that happened, we show a message here.
            */}
          {this.state.transactionError && (
            <TransactionErrorMessage
              message={this._getRpcErrorMessage(this.state.transactionError)}
              dismiss={() => this._dismissTransactionError()}
            />
          )}
        </div>
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "100vh" }}
        >
          <div>
            {this.state.selectedAddress && (
              <Captcha
                onRef={(r) => {
                  captchaRef = r;
                }}
                onVerify={(captchaToken) => {
                  this.setState({ captchaToken });
                }}
                onExpire={() => {
                  this.setState({ captchaToken: null });
                }}
              />
            )}
            <div>&nbsp;</div>
            <div className="d-flex justify-content-center align-items-center">
              <Mint
                canMint={
                  this.state.selectedAddress != null &&
                  this.state.captchaToken != null
                }
                mint={() => this._mint()}
              />
            </div>
            <div>&nbsp;</div>
            <div className="d-flex justify-content-center align-items-center">
              {this.state.selectedAddress != null ? (
                <p className="primary-text">
                  Balance:{" "}
                  {ethers.utils.formatEther(
                    ethers.BigNumber.from(this.state.balance)
                  )}{" "}
                  {this.state.tokenData.symbol}
                </p>
              ) : (
                <p />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  componentWillUnmount() {
    // We poll the user's balance, so we have to stop doing that when Dapp
    // gets unmounted
    this._stopPollingData();
  }

  async _connectWallet() {
    // This method is run when the user clicks the Connect. It connects the
    // dapp to the user's wallet, and initializes it.

    // To connect to the user's wallet, we have to run this method.
    // It returns a promise that will resolve to the user's connected accounts.
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    // Once we have the address, we can initialize the application.

    // First we check the network
    const isCorrectNetwork = await this._checkNetwork();
    if (!isCorrectNetwork) {
      this.setState({
        networkError: `Please connect Metamask to chain ${CHAIN_ID}`,
      });
      return;
    }

    this._initialize(accounts[0]);

    // We reinitialize it whenever the user changes their account.
    window.ethereum.on("accountsChanged", ([newAddress]) => {
      this._stopPollingData();
      // `accountsChanged` event can be triggered with an undefined newAddress.
      // This happens when the user removes the Dapp from the "Connected
      // list of sites allowed access to your addresses" (Metamask > Settings > Connections)
      // To avoid errors, we reset the dapp state
      if (newAddress === undefined) {
        return this._resetState();
      }

      this._initialize(newAddress);
    });

    // We reset the dapp state if the chain is changed
    window.ethereum.on("chainChanged", ([chainId]) => {
      this._stopPollingData();
      this._resetState();
    });
  }

  _initialize(userAddress) {
    // This method initializes the dapp

    // We first store the user's address in the component's state
    this.setState({
      selectedAddress: userAddress,
    });

    // Then, we initialize ethers, fetch the token's data, and start polling
    // for the user's balance.

    // Fetching the token data and the user's balance are specific to this
    // sample project, but you can reuse the same initialization pattern.
    this._intializeEthers();
    this._getTokenData();
    this._startPollingData();
  }

  async _intializeEthers() {
    // We first initialize ethers by creating a provider using window.ethereum
    this._provider = new ethers.providers.Web3Provider(window.ethereum);

    // When, we initialize the contract using that provider and the token's
    // artifact. You can do this same thing with your contracts.
    this._token = new ethers.Contract(
      contractAddress.Token,
      TokenArtifact.abi,
      this._provider.getSigner(0)
    );
  }

  // The next two methods are needed to start and stop polling data. While
  // the data being polled here is specific to this example, you can use this
  // pattern to read any data from your contracts.
  //
  // Note that if you don't need it to update in near real time, you probably
  // don't need to poll it. If that's the case, you can just fetch it when you
  // initialize the app, as we do with the token data.
  _startPollingData() {
    this._pollDataInterval = setInterval(() => this._updateBalance(), 1000);

    // We run it once immediately so we don't have to wait for it
    this._updateBalance();
  }

  _stopPollingData() {
    clearInterval(this._pollDataInterval);
    this._pollDataInterval = undefined;
  }

  // The next two methods just read from the contract and store the results
  // in the component state.
  async _getTokenData() {
    const name = await this._token.name();
    const symbol = await this._token.symbol();

    this.setState({ tokenData: { name, symbol } });
  }

  async _updateBalance() {
    const balance = await this._token.balanceOf(this.state.selectedAddress);
    this.setState({ balance });
  }

  // This method just clears part of the state.
  _dismissTransactionError() {
    this.setState({ transactionError: undefined });
  }

  // This method just clears part of the state.
  _dismissNetworkError() {
    this.setState({ networkError: undefined });
  }

  // This is an utility method that turns an RPC error into a human readable
  // message.
  _getRpcErrorMessage(error) {
    if (error.data) {
      return error.data.message;
    }

    return error.message;
  }

  // This method resets the state
  _resetState() {
    this.setState(this.initialState);
  }

  async _addTokenToWallet() {
    try {
      await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: contractAddress.Token,
            symbol: this.state.tokenData.symbol,
            decimals: 18,
          },
        },
      });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  // This method checks if Metamask selected network is process.env.CHAIN_ID
  async _checkNetwork() {
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    if (CHAIN_ID == chainId) {
      return true;
    }
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [
          {
            chainId: CHAIN_ID,
          },
        ],
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // This method mints tokens for the connected address
  async _mint() {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/token/mint`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: this.state.selectedAddress,
            token: this.state.captchaToken,
          }),
        }
      );
      const { hash } = await response.json();
      this.setState({
        txBeingSent: hash,
        captchaToken: null,
      });
      // Listen for transaction to be mined
      this._provider.once(hash, (transaction) => {
        this.setState({
          txBeingSent: null,
        });
        this._updateBalance();
        if (captchaRef != null) {
          captchaRef.resetCaptcha();
        }
      });
    } catch (error) {
      this.setState({ transactionError: { message: "Failed to mint" } });
    }
  }
}
