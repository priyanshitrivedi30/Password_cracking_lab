import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js";
import Navbar from "../components/navbar";

function formatTime(seconds) {
  if (!seconds && seconds !== 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

const DIFF_COLOR = {
  beginner:     "#00ff88",
  intermediate: "#facc15",
  advanced:     "#f87171",
};

export default function Analytics() {
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/analytics/me");
        setData(res.data);
      } catch (err) {
        setError("Failed to load analytics. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1c", color: "#e5e7eb" }}>
      <Navbar />

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "30px 20px" }}>
        <h2 style={{ color: "#00bfff", marginBottom: 24 }}>📊 Your Performance</h2>

        {loading && <p style={{ color: "#64748b" }}>Loading analytics...</p>}
        {error   && <p style={{ color: "#f87171" }}>{error}</p>}

        {!loading && !error && data && (
          <>
            {/* ── Summary row ── */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
              {[
                { label: "Total Score",     value: data.total_score ?? 0,          color: "#00bfff" },
                { label: "Completed Labs",  value: data.completed_labs ?? 0,        color: "#00ff88" },
                { label: "Total Time",      value: formatTime(data.total_time_seconds), color: "#facc15" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{
                  flex: "1 1 180px",
                  background: "#0f172a",
                  border: `1px solid ${color}`,
                  borderRadius: 10,
                  padding: "18px 20px",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: 26, fontWeight: "bold", color }}>{value}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* ── Per-difficulty breakdown ── */}
            {data.difficulty_breakdown && (
              <>
                <h3 style={{ color: "#94a3b8", marginBottom: 12, fontSize: 15 }}>
                  Performance by Difficulty
                </h3>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
                  {Object.entries(data.difficulty_breakdown).map(([diff, stats]) => {
                    const color = DIFF_COLOR[diff] || "#00bfff";
                    return (
                      <div key={diff} style={{
                        flex: "1 1 200px",
                        background: "#0f172a",
                        border: `1px solid ${color}33`,
                        borderRadius: 10,
                        padding: "16px 18px",
                      }}>
                        <div style={{ color, fontWeight: "bold", textTransform: "capitalize", marginBottom: 10 }}>
                          {diff === "beginner" ? "🟢" : diff === "intermediate" ? "🟡" : "🔴"} {diff}
                        </div>
                        <div style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 5, color: "#94a3b8" }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>Completed</span>
                            <span style={{ color }}>{stats.completed ?? 0}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>Best Score</span>
                            <span style={{ color }}>{stats.total_score ?? 0}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>Avg Time</span>
                            <span style={{ color }}>{formatTime(stats.total_time)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* ── Recent labs ── */}
            {data.recent_labs?.length > 0 && (
              <>
                <h3 style={{ color: "#94a3b8", marginBottom: 12, fontSize: 15 }}>
                  Recent Lab Sessions
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {data.recent_labs.map((lab, i) => {
                    const color = DIFF_COLOR[lab.difficulty] || "#00bfff";
                    return (
                      <div key={i} style={{
                        background: "#0f172a",
                        border: "1px solid #1e293b",
                        borderRadius: 8,
                        padding: "12px 16px",
                        display: "grid",
                        gridTemplateColumns: "1fr 80px 80px 80px 90px",
                        gap: 10,
                        alignItems: "center",
                        fontSize: 13,
                      }}>
                        <span style={{ color, textTransform: "capitalize", fontWeight: "bold" }}>
                          {lab.difficulty}
                        </span>
                        <span style={{ color: "#64748b" }}>{lab.mode}</span>
                        <span>{lab.score ?? "—"} pts</span>
                        <span style={{ color: "#64748b" }}>{formatTime(lab.time_taken_seconds)}</span>
                        <span style={{
                          color: lab.status === "completed" ? "#00ff88" : "#f87171",
                          fontSize: 11,
                          textTransform: "capitalize",
                        }}>
                          {lab.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {!data.completed_labs && (
              <p style={{ color: "#475569", marginTop: 20 }}>
                No labs completed yet. <span
                  style={{ color: "#00bfff", cursor: "pointer" }}
                  onClick={() => navigate("/labinfo")}
                >Start your first lab →</span>
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}