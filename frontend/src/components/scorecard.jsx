// ScoreCard.jsx — shows full score breakdown with penalty itemisation

function formatTime(seconds) {
  if (!seconds && seconds !== 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function ScoreCard({
  score,
  attempts,
  time,                  // time in seconds
  difficulty,            // beginner | intermediate | advanced
  mode,                  // guided | hints | free
  hintsUsed,             // intermediate only
  // Score breakdown from ScoringService.get_score_breakdown()
  baseScore,
  timePenalty,
  attemptPenalty,
  hintPenalty,
}) {
  const finalScore = score ?? 0;
  const maxScore = { beginner: 50, intermediate: 100, advanced: 200 }[difficulty] || 50;
  const isPerfect = finalScore === maxScore;
  const isLow = finalScore <= 10;

  // Color based on score quality
  const scoreColor = isPerfect
    ? "#00ff88"
    : finalScore >= maxScore * 0.7
    ? "#00bfff"
    : finalScore >= maxScore * 0.4
    ? "#facc15"
    : "#f87171";

  const difficultyLabel = {
    beginner: "🟢 Beginner",
    intermediate: "🟡 Intermediate",
    advanced: "🔴 Advanced",
  }[difficulty] || difficulty;

  const modeLabel = {
    guided: "Fully Guided",
    hints: "Hints-Based",
    free: "Free Mode",
  }[mode] || mode;

  const hasBreakdown = baseScore !== undefined;

  return (
    <div style={{
      padding: "20px",
      background: "#0f172a",
      color: "#e5e7eb",
      borderRadius: "12px",
      width: "280px",
      border: `1px solid ${scoreColor}`,
      boxShadow: `0 0 14px ${scoreColor}33`,
    }}>
      <h3 style={{ color: scoreColor, marginBottom: "14px", fontSize: "16px" }}>
        {isPerfect ? "🏆 Perfect Score!" : "📊 Lab Results"}
      </h3>

      {/* Difficulty + Mode context */}
      {difficulty && (
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "12px",
          color: "#64748b",
          marginBottom: "12px",
          paddingBottom: "10px",
          borderBottom: "1px solid #1e293b",
        }}>
          <span>{difficultyLabel}</span>
          {modeLabel && <span>{modeLabel}</span>}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
          <span style={{ color: "#94a3b8" }}>⏱ Time</span>
          <span>{formatTime(time)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
          <span style={{ color: "#94a3b8" }}>🔁 Attempts</span>
          <span>{attempts ?? 0}</span>
        </div>
        {hintsUsed !== undefined && hintsUsed !== null && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
            <span style={{ color: "#94a3b8" }}>💡 Hints Used</span>
            <span>{hintsUsed}</span>
          </div>
        )}
      </div>

      {/* Score breakdown */}
      {hasBreakdown && (
        <div style={{
          background: "#020617",
          borderRadius: "8px",
          padding: "10px 12px",
          marginBottom: "12px",
          fontSize: "13px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8" }}>
            <span>Base score</span>
            <span style={{ color: "#00ff88" }}>+{baseScore}</span>
          </div>
          {timePenalty < 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8" }}>
              <span>Time penalty</span>
              <span style={{ color: "#f87171" }}>{timePenalty}</span>
            </div>
          )}
          {attemptPenalty < 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8" }}>
              <span>Attempt penalty</span>
              <span style={{ color: "#f87171" }}>{attemptPenalty}</span>
            </div>
          )}
          {hintPenalty < 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8" }}>
              <span>Hint penalty</span>
              <span style={{ color: "#f87171" }}>{hintPenalty}</span>
            </div>
          )}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: "1px solid #1e293b",
            paddingTop: "6px",
            marginTop: "4px",
            fontWeight: "bold",
          }}>
            <span style={{ color: "#94a3b8" }}>Final</span>
            <span style={{ color: scoreColor }}>{finalScore}</span>
          </div>
        </div>
      )}

      {/* Final score */}
      <div style={{
        textAlign: "center",
        padding: "12px",
        background: "#020617",
        borderRadius: "8px",
        border: `1px solid ${scoreColor}`,
      }}>
        <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Final Score</div>
        <div style={{ fontSize: "32px", fontWeight: "bold", color: scoreColor }}>
          {finalScore}
        </div>
        <div style={{ fontSize: "12px", color: "#475569" }}>/ {maxScore} pts</div>
      </div>

      {isLow && (
        <p style={{ fontSize: "11px", color: "#f87171", marginTop: "10px", textAlign: "center" }}>
          Minimum score applied — keep practising!
        </p>
      )}
    </div>
  );
}