import { useEffect, useState, useRef } from "react";

// ─────────────────────────────────────────────────────────────
// Timer.jsx
//
// Two modes:
// 1. expires_at prop (ISO string from backend) — server-synced ✅
//    Calculates remaining time from server timestamp.
//    Survives page refresh — always shows accurate time.
//
// 2. duration prop (seconds fallback) — local countdown
//    Used when expires_at is not available yet.
// ─────────────────────────────────────────────────────────────

export default function Timer({ duration = 600, expires_at = null, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(() => {
    if (expires_at) {
      const remaining = Math.floor((new Date(expires_at) - Date.now()) / 1000);
      return Math.max(remaining, 0);
    }
    return duration;
  });

  // ✅ Guard to ensure onExpire fires only once
  const expiredRef = useRef(false);

  useEffect(() => {
    // If already expired on mount
    if (timeLeft <= 0) {
      if (!expiredRef.current) {
        expiredRef.current = true;
        onExpire?.();
      }
      return;
    }

    const interval = setInterval(() => {
      let remaining;

      if (expires_at) {
        // ✅ Re-calculate from server timestamp every tick — stays accurate after tab switch/refresh
        remaining = Math.floor((new Date(expires_at) - Date.now()) / 1000);
      } else {
        remaining = timeLeft - 1;
      }

      const clamped = Math.max(remaining, 0);
      setTimeLeft(clamped);

      if (clamped <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, expires_at]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formatted = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  // ✅ Color changes as time runs low
  const isWarning = timeLeft <= 120 && timeLeft > 30;  // < 2 min — yellow
  const isDanger  = timeLeft <= 30;                     // < 30s  — red + pulse

  const color = isDanger ? "#f87171" : isWarning ? "#facc15" : "#00bfff";
  const borderColor = isDanger ? "#f87171" : isWarning ? "#facc15" : "#00bfff";

  return (
    <div style={{
      padding: "10px 16px",
      background: isDanger ? "#2a0a0a" : isWarning ? "#2d2004" : "#0f172a",
      color,
      borderRadius: "8px",
      minWidth: "120px",
      border: `1px solid ${borderColor}`,
      boxShadow: isDanger ? `0 0 12px rgba(248,113,113,0.4)` : "none",
      textAlign: "center",
      fontWeight: "bold",
      fontSize: "18px",
      // ✅ Pulse animation when under 30 seconds
      animation: isDanger ? "pulse 0.8s ease-in-out infinite alternate" : "none",
      transition: "background 0.5s, border-color 0.5s, color 0.5s",
    }}>
      <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "2px" }}>
        TIME LEFT
      </div>
      {timeLeft <= 0 ? "⏰ Expired" : `⏳ ${formatted}`}
    </div>
  );
}