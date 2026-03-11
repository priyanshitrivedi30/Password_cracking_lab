import { useState } from "react";

// Color theme per difficulty
const DIFFICULTY_THEME = {
  beginner: {
    color: "#00ff88",
    border: "#00ff88",
    shadow: "rgba(0,255,136,0.3)",
    badge: "#052e16",
    label: "🟢 Beginner",
  },
  intermediate: {
    color: "#facc15",
    border: "#facc15",
    shadow: "rgba(250,204,21,0.3)",
    badge: "#2d2004",
    label: "🟡 Intermediate",
  },
  advanced: {
    color: "#f87171",
    border: "#f87171",
    shadow: "rgba(248,113,113,0.3)",
    badge: "#2a0a0a",
    label: "🔴 Advanced",
  },
};

export default function DifficultyCard({
  id,               // beginner | intermediate | advanced
  title,
  description,
  points,
  mode,             // guided | hints | free
  algorithm,        // md5 | sha256 | bcrypt
  timer_seconds,    // 600
  expected_tool,    // john | hashcat | null
  onSelect,
  disabled = false,
}) {
  const [hovered, setHovered] = useState(false);

  const theme = DIFFICULTY_THEME[id] || DIFFICULTY_THEME.beginner;

  // Format timer as "10 min"
  const timerLabel = timer_seconds ? `${Math.floor(timer_seconds / 60)} min` : "10 min";

  // Format mode label nicely
  const modeLabel = {
    guided: "Fully Guided",
    hints:  "Hints-Based",
    free:   "Free Mode",
  }[mode] || mode;

  // Tool display
  const toolLabel = expected_tool
    ? expected_tool.charAt(0).toUpperCase() + expected_tool.slice(1)
    : "Your Choice";

  return (
    <div
      onClick={!disabled ? onSelect : undefined}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: disabled ? "not-allowed" : "pointer",
        padding: "24px 20px",
        background: "#0f172a",
        color: theme.color,
        borderRadius: "14px",
        border: `1px solid ${hovered ? theme.color : theme.border}`,
        width: "100%",      // ✅ fill grid column
        height: "100%",     // ✅ equal height across all cards
        boxSizing: "border-box",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        boxShadow: hovered
          ? `0 0 22px ${theme.shadow}`
          : `0 0 10px ${theme.shadow}`,
        opacity: disabled ? 0.4 : 1,
        pointerEvents: disabled ? "none" : "auto",
        transition: "transform 0.2s, box-shadow 0.2s",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
      }}
    >
      {/* Difficulty badge */}
      <div style={{
        display: "inline-block",
        background: theme.badge,
        color: theme.color,
        fontSize: "12px",
        fontWeight: "bold",
        padding: "3px 10px",
        borderRadius: "20px",
        marginBottom: "10px",
        border: `1px solid ${theme.color}`,
      }}>
        {theme.label}
      </div>

      <h2 style={{ marginBottom: "8px", fontSize: "20px" }}>{title}</h2>

      <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "14px", lineHeight: "1.5" }}>
        {description}
      </p>

      {/* Info grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "8px",
        marginBottom: "14px",
        fontSize: "12px",
        textAlign: "left",
      }}>
        <div style={{ background: "#1e293b", padding: "6px 10px", borderRadius: "6px" }}>
          <span style={{ color: "#64748b" }}>Algorithm</span>
          <div style={{ color: theme.color, fontWeight: "bold", textTransform: "uppercase" }}>
            {algorithm}
          </div>
        </div>

        <div style={{ background: "#1e293b", padding: "6px 10px", borderRadius: "6px" }}>
          <span style={{ color: "#64748b" }}>Mode</span>
          <div style={{ color: theme.color, fontWeight: "bold" }}>{modeLabel}</div>
        </div>

        <div style={{ background: "#1e293b", padding: "6px 10px", borderRadius: "6px" }}>
          <span style={{ color: "#64748b" }}>Timer</span>
          <div style={{ color: theme.color, fontWeight: "bold" }}>⏱ {timerLabel}</div>
        </div>

        <div style={{ background: "#1e293b", padding: "6px 10px", borderRadius: "6px" }}>
          <span style={{ color: "#64748b" }}>Tool</span>
          <div style={{ color: theme.color, fontWeight: "bold" }}>{toolLabel}</div>
        </div>
      </div>

      {/* Points */}
      <div style={{
        background: theme.badge,
        border: `1px solid ${theme.color}`,
        borderRadius: "8px",
        padding: "8px",
        fontWeight: "bold",
        fontSize: "16px",
        marginTop: "auto",  // ✅ push to bottom so all cards align
      }}>
        🏆 {points} Points
      </div>

      {/* Disabled overlay message */}
      {disabled && (
        <p style={{ marginTop: "10px", fontSize: "12px", color: "#94a3b8" }}>
          🔒 Accept disclaimer to unlock
        </p>
      )}
    </div>
  );
}