import { useEffect, useState } from "react";
import api from "../api/api.js";

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState("beginner");

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await api.get("/leaderboard/top", {
        params: {
          difficulty: difficulty,
          limit: 10,
        },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [difficulty]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🏆 Leaderboard</h2>

        {/* Difficulty Filter */}
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          style={styles.select}
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        {loading ? (
          <p>Loading...</p>
        ) : users.length === 0 ? (
          <p>No scores yet.</p>
        ) : (
          <div style={{ marginTop: "20px" }}>
            {users.map((entry, index) => (
              <div key={index} style={styles.row}>
                <span>#{index + 1}</span>
                <span>User {entry.user_id}</span>
                <span>{entry.score} pts</span>
                <span>{entry.time_taken}s</span>
                <span>{entry.mode}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0a0f1c",
  },
  card: {
    background: "#111827",
    padding: "40px",
    borderRadius: "10px",
    width: "520px",
    boxShadow: "0 0 20px #1e3a8a",
    color: "white",
  },
  title: {
    textAlign: "center",
    color: "#3b82f6",
    marginBottom: "20px",
  },
  select: {
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    background: "#020617",
    color: "#fff",
    border: "1px solid #3b82f6",
    borderRadius: "6px",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "40px 1fr 90px 90px 80px",
    gap: "10px",
    padding: "8px 0",
    borderBottom: "1px solid #1f2937",
    fontSize: "14px",
  },
};