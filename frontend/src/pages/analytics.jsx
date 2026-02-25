import { useEffect, useState } from "react";
import api from "../api/api.js";

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/analytics/me");

      setData(res.data);
    } catch (err) {
      console.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) return <h3 style={{ padding: 20 }}>Loading analytics...</h3>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Your Performance</h2>

        {data ? (
          <>
            <p><strong>Total Score:</strong> {data.total_score}</p>
            <p><strong>Total Time:</strong> {data.total_time_seconds}s</p>
            <p><strong>Completed Labs:</strong> {data.completed_labs}</p>
          </>
        ) : (
          <p>No data available.</p>
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
    width: "400px",
    boxShadow: "0 0 20px #1e3a8a",
    color: "white",
  },
};
