import React from "react";

export function Mint({ mint, canMint }) {
  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          mint();
        }}
      >
        <div className="form-group">
          <input
            disabled={!canMint}
            className="btn btn-lg btn-outline-light"
            type="submit"
            value="Get tokens!"
          />
        </div>
      </form>
    </div>
  );
}
