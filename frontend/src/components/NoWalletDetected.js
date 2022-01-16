import React from "react";

export function NoWalletDetected() {
  return (
    <div className="card bg-light mb-3">
      <div className="card-body">
        <h5 className="card-title">No Ethereum wallet was detected.</h5>
        <p className="card-text">
          Please install{" "}
          <a
            href="http://metamask.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            MetaMask
          </a>
          .
        </p>
      </div>
    </div>
  );
}
