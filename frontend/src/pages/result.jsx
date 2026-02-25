import { useLocation, useNavigate } from "react-router-dom";

export default function Result() {
  const navigate = useNavigate();
  const { state } = useLocation();

  if (!state) {
    return (
      <div style={styles.container}>
        <h2 style={{ color: "white" }}>No result data found</h2>
        <button style={styles.button} onClick={() => navigate("/")}>
          Go Home
        </button>
      </div>
    );
  }

  const {
    success,
    score,
    attempts,
    time_taken,
    difficulty,
    hints_used,
  } = state;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ color: success ? "#22c55e" : "#ef4444" }}>
          {success ? "✅ Lab Completed Successfully!" : "❌ Lab Failed"}
        </h2>

        <div style={styles.row}>
          <span>Difficulty</span>
          <span>{difficulty}</span>
        </div>

        <div style={styles.row}>
          <span>Score</span>
          <span>{score}</span>
        </div>

        <div style={styles.row}>
          <span>Attempts</span>
          <span>{attempts}</span>
        </div>

        <div style={styles.row}>
          <span>Time Taken</span>
          <span>{time_taken}s</span>
        </div>

        {hints_used !== undefined && (
          <div style={styles.row}>
            <span>Hints Used</span>
            <span>{hints_used}</span>
          </div>
        )}

        <div style={{ marginTop: 30 }}>
          <button
            style={styles.primaryButton}
            onClick={() => navigate("/analytics")}
          >
            View Analytics
          </button>

          <button
            style={styles.secondaryButton}
            onClick={() => navigate("/leaderboard")}
          >
            Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#0a0f1c",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    background: "#111827",
    padding: 40,
    borderRadius: 12,
    width: 420,
    boxShadow: "0 0 25px #1e3a8a",
    color: "white",
    textAlign: "center",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 12,
    borderBottom: "1px solid #1f2937",
    paddingBottom: 6,
  },
  primaryButton: {
    width: "100%",
    padding: "12px",
    background: "#2563eb",
    border: "none",
    color: "white",
    borderRadius: 6,
    fontWeight: "bold",
    cursor: "pointer",
    marginBottom: 10,
  },
  secondaryButton: {
    width: "100%",
    padding: "12px",
    background: "#1f2937",
    border: "1px solid #2563eb",
    color: "white",
    borderRadius: 6,
    cursor: "pointer",
  },
  button: {
    padding: "12px 20px",
    background: "#2563eb",
    border: "none",
    color: "white",
    borderRadius: 6,
    cursor: "pointer",
  },
};