import { useState } from "react";

export default function DisclaimerBox({ text, onAccept }) {
  const [checked, setChecked] = useState(false);

  return (
    <div
      style={{
        padding: "20px",
        background: "#0a0f1f",
        color: "#e5e7eb",
        border: "1px solid #00bfff",
        borderRadius: "10px",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <h3 style={{ color: "#00bfff", marginBottom: "10px" }}>
        Disclaimer
      </h3>

      <div
        style={{
          maxHeight: "150px",
          overflowY: "auto",
          fontSize: "14px",
          marginBottom: "15px",
          paddingRight: "5px",
        }}
      >
        {text}
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        I understand and agree
      </label>

      <button
        disabled={!checked}
        onClick={onAccept}
        style={{
          marginTop: "15px",
          padding: "10px 16px",
          background: checked ? "#00bfff" : "#334155",
          color: "#000",
          border: "none",
          borderRadius: "6px",
          cursor: checked ? "pointer" : "not-allowed",
          fontWeight: "bold",
        }}
      >
        Continue
      </button>
    </div>
  );
}