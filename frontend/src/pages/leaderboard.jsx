import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import { getLeaderboard, getLeaderboardByDifficulty, getMyLeaderboardPosition } from "../api/leaderboard";

function formatTime(seconds) {
  if (!seconds && seconds !== 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

const TABS = [
  { key: "all",          label: "🌐 All" },
  { key: "beginner",     label: "🟢 Beginner" },
  { key: "intermediate", label: "🟡 Intermediate" },
  { key: "advanced",     label: "🔴 Advanced" },
];

const MEDALS = ["🥇", "🥈", "🥉"];

export default function Leaderboard() {
  const navigate = useNavigate();

  const [activeTab,   setActiveTab]   = useState("all");
  const [users,       setUsers]       = useState([]);
  const [myPosition,  setMyPosition]  = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  // Get current user's username for row highlighting
  let currentUsername = null;
  try {
    const stored = localStorage.getItem("user");
    if (stored) currentUsername = JSON.parse(stored)?.username;
  } catch { /* ignore */ }

  // ── Fetch leaderboard when tab changes ──
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = activeTab === "all"
          ? await getLeaderboard(20)
          : await getLeaderboardByDifficulty(activeTab, 20);
        setUsers(data);
      } catch {
        setError("Failed to load leaderboard.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [activeTab]);

  // ── Fetch current user's position once on mount ──
  useEffect(() => {
    const fetchMyPos = async () => {
      try {
        const pos = await getMyLeaderboardPosition();
        setMyPosition(pos);
      } catch { /* not critical */ }
    };
    fetchMyPos();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1c", color: "#e5e7eb" }}>
      <Navbar />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "30px 20px" }}>
        <h2 style={{ color: "#00bfff", marginBottom: 6 }}>🏆 Leaderboard</h2>
        <p style={{ color: "#64748b", marginBottom: 24, fontSize: 13 }}>
          Top scores across all difficulty levels
        </p>

        {/* ── My position banner ── */}
        {myPosition && (
          <div style={{
            background: "#0f172a",
            border: "1px solid #00bfff33",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 13,
          }}>
            <span style={{ color: "#64748b" }}>Your rank</span>
            <span>
              <strong style={{ color: "#00bfff", fontSize: 18 }}>#{myPosition.rank}</strong>
              <span style={{ color: "#64748b", marginLeft: 8 }}>of {myPosition.total_entries}</span>
            </span>
            <span style={{ color: "#00ff88", fontWeight: "bold" }}>{myPosition.score} pts</span>
          </div>
        )}

        {/* ── Tabs ── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "8px 16px",
                background: activeTab === tab.key ? "#00bfff" : "transparent",
                color: activeTab === tab.key ? "#000" : "#64748b",
                border: `1px solid ${activeTab === tab.key ? "#00bfff" : "#1e293b"}`,
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: activeTab === tab.key ? "bold" : "normal",
                fontSize: 13,
                transition: "all 0.2s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Table header ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "50px 1fr 90px 80px 80px",
          gap: 10,
          padding: "8px 14px",
          fontSize: 11,
          color: "#475569",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          borderBottom: "1px solid #1e293b",
        }}>
          <span>Rank</span>
          <span>Player</span>
          <span style={{ textAlign: "right" }}>Score</span>
          <span style={{ textAlign: "right" }}>Time</span>
          <span style={{ textAlign: "right" }}>Mode</span>
        </div>

        {/* ── Rows ── */}
        {loading && <p style={{ color: "#64748b", padding: "20px 0", textAlign: "center" }}>Loading...</p>}
        {error   && <p style={{ color: "#f87171", padding: "20px 0" }}>{error}</p>}

        {!loading && !error && users.length === 0 && (
          <p style={{ color: "#475569", padding: "20px 0", textAlign: "center" }}>
            No scores yet for this category.
          </p>
        )}

        {!loading && !error && users.map((entry, index) => {
          const isMe    = entry.username && entry.username === currentUsername;
          const isTop3  = index < 3;
          const rankLabel = isTop3 ? MEDALS[index] : `#${entry.rank ?? index + 1}`;

          return (
            <div
              key={index}
              style={{
                display: "grid",
                gridTemplateColumns: "50px 1fr 90px 80px 80px",
                gap: 10,
                padding: "12px 14px",
                borderBottom: "1px solid #0f172a",
                borderRadius: 6,
                background: isMe ? "#0d2137" : "transparent",
                border: isMe ? "1px solid #00bfff44" : "1px solid transparent",
                fontSize: 14,
                alignItems: "center",
                transition: "background 0.1s",
              }}
            >
              {/* Rank */}
              <span style={{
                fontWeight: "bold",
                fontSize: isTop3 ? 18 : 14,
                textAlign: "center",
              }}>
                {rankLabel}
              </span>

              {/* Username */}
              <span style={{ fontWeight: isMe ? "bold" : "normal", color: isMe ? "#00bfff" : "#e5e7eb" }}>
                {/* ✅ Show username not raw user_id */}
                {entry.username || `User #${entry.user_id}`}
                {isMe && <span style={{ fontSize: 11, color: "#00bfff", marginLeft: 6 }}>(you)</span>}
              </span>

              {/* Score */}
              <span style={{ textAlign: "right", color: isTop3 ? "#facc15" : "#e5e7eb", fontWeight: isTop3 ? "bold" : "normal" }}>
                {entry.score} pts
              </span>

              {/* Time */}
              <span style={{ textAlign: "right", color: "#64748b", fontSize: 13 }}>
                {/* ✅ Formatted time not raw seconds */}
                {formatTime(entry.time_seconds)}
              </span>

              {/* Mode */}
              <span style={{ textAlign: "right", color: "#475569", fontSize: 12, textTransform: "capitalize" }}>
                {entry.mode || "—"}
              </span>
            </div>
          );
        })}

        {/* ── CTA ── */}
        <div style={{ marginTop: 28, textAlign: "center" }}>
          <button
            onClick={() => navigate("/labinfo")}
            style={{ padding: "11px 24px", background: "#00bfff", color: "#000", border: "none", borderRadius: 8, fontWeight: "bold", cursor: "pointer", fontSize: 14 }}
          >
            Start a Lab →
          </button>
        </div>
      </div>
    </div>
  );
}