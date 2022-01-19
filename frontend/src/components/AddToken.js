import React from "react";

export function AddToken({ enabled, onAdd }) {
  return (
    <button
      className="btn btn-outline-light"
      type="button"
      disabled={!enabled}
      onClick={() => {
        onAdd();
      }}
    >
      +
    </button>
  );
}
