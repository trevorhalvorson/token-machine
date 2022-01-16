import React from "react";

import { NetworkErrorMessage } from "./NetworkErrorMessage";

export function Wallet({
  connectWallet,
  selectedAddress,
  networkError,
  dismiss,
}) {
  return (
    <div className="row justify-content-md-end">
      <div className="col-12 text-center">
        {/* Metamask network should be set to Localhost:8545. */}
        {networkError && (
          <NetworkErrorMessage message={networkError} dismiss={dismiss} />
        )}
      </div>
      <div className="p-4 text-center">
        <button
          className="btn btn-outline-light"
          type="button"
          disabled={selectedAddress != null}
          onClick={connectWallet}
        >
          {selectedAddress == null
            ? "Connect Wallet"
            : `${selectedAddress.substring(0, 5)}...${selectedAddress.substring(
                selectedAddress.length - 4
              )}`}
        </button>
      </div>
    </div>
  );
}
