export default function DifficultyCard({
  title,
  description,
  points,
  onSelect,
  disabled = false,
}) {
  return (
    <div
      onClick={!disabled ? onSelect : undefined}
      style={{
        cursor: disabled ? "not-allowed" : "pointer",
        padding: "20px",
        background: "#0f172a",
        color: "#00bfff",
        borderRadius: "12px",
        border: "1px solid #00bfff",
        width: "260px",
        textAlign: "center",
        boxShadow: "0 0 10px rgba(0,191,255,0.3)",
        opacity: disabled ? 0.4 : 1,
        pointerEvents: disabled ? "none" : "auto",
        transition: "transform 0.2s",
      }}
    >
      <h2 style={{ marginBottom: "10px" }}>{title}</h2>

      <p style={{ fontSize: "14px", marginBottom: "12px" }}>
        {description}
      </p>

      <strong>🏆 Points: {points}</strong>

      {disabled && (
        <p style={{ marginTop: "10px", fontSize: "12px", color: "#94a3b8" }}>
          Accept disclaimer to unlock
        </p>
      )}
    </div>
  );
}