import { useState, useRef } from "react";

export default function DisclaimerBox({ text, onAccept }) {
  const [checked, setChecked] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const scrollRef = useRef(null);

  // ✅ User must scroll to bottom before checkbox is enabled
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 10; // 10px buffer
    if (atBottom) setHasScrolled(true);
  };

  const canCheck = hasScrolled;
  const canContinue = checked && hasScrolled;

  return (
    <div style={{
      padding: "24px",
      background: "#0a0f1f",
      color: "#e5e7eb",
      border: "1px solid #00bfff",
      borderRadius: "12px",
      maxWidth: "620px",
      margin: "0 auto",
    }}>
      <h3 style={{ color: "#00bfff", marginBottom: "12px", fontSize: "18px" }}>
        ⚠️ Disclaimer &amp; Consent Form
      </h3>

      {/* Scrollable text area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          maxHeight: "200px",
          overflowY: "auto",
          fontSize: "14px",
          lineHeight: "1.7",
          marginBottom: "12px",
          paddingRight: "8px",
          color: "#cbd5e1",
          border: "1px solid #1e3a5f",
          borderRadius: "8px",
          padding: "12px",
          background: "#020617",
        }}
      >
        {text}
      </div>

      {/* Scroll prompt — disappears once user scrolls */}
      {!hasScrolled && (
        <p style={{
          fontSize: "12px",
          color: "#facc15",
          marginBottom: "10px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}>
          ↓ Please scroll down to read the full disclaimer before accepting
        </p>
      )}

      {/* Checkbox — disabled until scrolled to bottom */}
      <label style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        cursor: canCheck ? "pointer" : "not-allowed",
        opacity: canCheck ? 1 : 0.4,
        fontSize: "14px",
      }}>
        <input
          type="checkbox"
          checked={checked}
          disabled={!canCheck}
          onChange={(e) => setChecked(e.target.checked)}
          style={{ width: "16px", height: "16px", cursor: canCheck ? "pointer" : "not-allowed" }}
        />
        I have read and understood the disclaimer. I agree to the terms.
      </label>

      {/* Continue button */}
      <button
        disabled={!canContinue}
        onClick={onAccept}
        style={{
          marginTop: "16px",
          padding: "11px 24px",
          background: canContinue ? "#00bfff" : "#1e293b",
          color: canContinue ? "#000" : "#475569",
          border: `1px solid ${canContinue ? "#00bfff" : "#334155"}`,
          borderRadius: "8px",
          cursor: canContinue ? "pointer" : "not-allowed",
          fontWeight: "bold",
          fontSize: "14px",
          width: "100%",
          transition: "background 0.2s",
        }}
      >
        {canContinue ? "✅ Continue to Lab" : "Read the full disclaimer to continue"}
      </button>
    </div>
  );
}