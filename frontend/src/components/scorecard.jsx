export default function ScoreCard({ score, attempts, time }) {
  return (
    <div
      style={{
        padding: "20px",
        background: "#0f172a",
        color: "#00bfff",
        borderRadius: "10px",
        marginTop: "20px",
        width: "250px",
        border: "1px solid #00bfff",
      }}
    >
      <h3 style={{ marginBottom: "10px" }}>Lab Results</h3>

      <p>⏱ Time: {time ?? "0s"}</p>
      <p>🔁 Attempts: {attempts ?? 0}</p>

      <h2 style={{ marginTop: "10px" }}>
        🏆 Score: {score ?? 0}
      </h2>
    </div>
  );
}
