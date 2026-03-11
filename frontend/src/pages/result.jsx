// pages/result.jsx
// Per spec:
//   - Thank you message for attempting the lab
//   - Two buttons: View Result | Go to Leaderboard
//   - View Result shows: Success/Timeout, Time, Attempts, Score
//   - Go to Leaderboard → /leaderboard

import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import SidePanel from "../components/sidepanel";
import ScoreCard from "../components/scorecard";

const styles = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes confettiPop {
    0%   { transform: scale(0.5); opacity: 0; }
    60%  { transform: scale(1.2); }
    100% { transform: scale(1);   opacity: 1; }
  }
  .result-card {
    background: #0d1526;
    border: 1px solid #1e293b;
    border-radius: 14px;
    padding: 24px;
    animation: fadeUp 0.4s ease both;
  }
  .result-stat {
    background: #080d1a;
    border: 1px solid #1a2744;
    border-radius: 10px;
    padding: 18px;
    text-align: center;
  }
  .action-btn {
    flex: 1;
    padding: 14px 0;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    border: none;
    transition: filter 0.15s, transform 0.15s;
  }
  .action-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }
`;

function formatTime(s) {
  if (!s && s !== 0) return "—";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

export default function Result() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [showDetail, setShowDetail] = useState(false);
  const [fetchedResult, setFetchedResult] = useState(null);
  const [fetching, setFetching] = useState(!state); // only fetch if no state

  const getCompleted = () => {
    try { return JSON.parse(localStorage.getItem("lab_progress") || "{}"); }
    catch { return {}; }
  };
  const [completed, setCompleted] = useState(getCompleted);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    // Mark lab step complete
    const prev = getCompleted();
    if (!prev.lab) {
      const next = { ...prev, lab: true };
      localStorage.setItem("lab_progress", JSON.stringify(next));
      setCompleted(next);
    }

    // If no navigation state, fetch last completed session from backend
    if (!state) {
      import("../api/api").then(({ default: api }) => {
        api.get("/session/me", { params: { status: "completed" } })
          .then((res) => {
            const sessions = res.data?.sessions || [];
            if (sessions.length > 0) {
              const last = sessions[0]; // most recent first
              setFetchedResult({
                success:            last.status === "completed",
                score:              last.score,
                attempts:           last.attempts,
                time_taken_seconds: last.time_taken_seconds,
                difficulty:         last.difficulty,
                mode:               last.mode,
                algorithm:          last.algorithm,
                hints_used:         last.hints_used,
              });
            }
          })
          .catch(() => {})
          .finally(() => setFetching(false));
      });
    }
  }, [navigate, state]);

  // Use navigation state OR fetched result
  const resultData = state || fetchedResult;

  // Loading state while fetching
  if (fetching) {
    return (
      <div style={{ minHeight: "100vh", background: "#080d1a", display: "flex", flexDirection: "column" }}>
        <Navbar />
        <div style={{ display: "flex", flex: 1 }}>
          <SidePanel completed={completed} />
          <div style={{ flex: 1, padding: "60px 28px", textAlign: "center" }}>
            <p style={{ color: "#475569" }}>⏳ Loading result...</p>
          </div>
        </div>
      </div>
    );
  }

  // No result found at all
  if (!resultData) {
    return (
      <div style={{ minHeight: "100vh", background: "#080d1a", color: "#e2e8f0", display: "flex", flexDirection: "column" }}>
        <Navbar />
        <div style={{ display: "flex", flex: 1 }}>
          <SidePanel completed={completed} />
          <div style={{ flex: 1, padding: "60px 28px", textAlign: "center" }}>
            <p style={{ color: "#475569", marginBottom: 20 }}>No result data found.</p>
            <button
              onClick={() => navigate("/labinfo")}
              style={{ padding: "12px 28px", background: "#00bfff", color: "#000", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
            >
              Start a Lab
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    success, score, attempts, time_taken_seconds, difficulty, mode, algorithm,
    hints_used, base_score, time_penalty, attempt_penalty, hint_penalty,
  } = resultData;

  const maxScore  = { beginner: 50, intermediate: 100, advanced: 200 }[difficulty] || 50;
  const diffColor = { beginner: "#00ffcc", intermediate: "#fbbf24", advanced: "#f87171" }[difficulty] || "#00bfff";

  const STATS = [
    { label: "Outcome",    value: success ? "✅ Cracked" : "⏱ Timed Out", color: success ? "#00ffcc" : "#f87171" },
    { label: "Final Score", value: `${score ?? 0} / ${maxScore}`,           color: "#00bfff" },
    { label: "Time Taken", value: formatTime(time_taken_seconds),            color: "#a78bfa" },
    { label: "Attempts",   value: attempts ?? "—",                           color: "#fbbf24" },
  ];

  return (
    <>
      <style>{styles}</style>
      <div style={{ minHeight: "100vh", background: "#080d1a", color: "#e2e8f0", display: "flex", flexDirection: "column" }}>

        <Navbar />

        <div style={{ display: "flex", flex: 1 }}>
          <SidePanel completed={completed} />
          <div style={{ flex: 1, overflowY: "auto", padding: "48px 28px 60px", maxWidth: 720 }}>

          {/* ── Thank you hero ── */}
          <div style={{
            textAlign: "center",
            marginBottom: 36,
            animation: "fadeUp 0.5s ease both",
          }}>
            <div style={{
              fontSize: 64, marginBottom: 16,
              display: "inline-block",
              animation: "confettiPop 0.6s ease both",
            }}>
              {success ? "🏆" : "⏱️"}
            </div>
            <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800, margin: "0 0 10px" }}>
              {success ? "Lab Completed!" : "Time's Up!"}
            </h1>
            <p style={{ color: "#64748b", fontSize: 15, margin: 0, lineHeight: 1.7 }}>
              Thank you for attempting the <strong style={{ color: diffColor, textTransform: "capitalize" }}>
              {difficulty}</strong> lab.
              {success
                ? " You successfully cracked the password."
                : " The timer expired before the password was cracked."}
            </p>
          </div>

          {/* ── Action buttons ── */}
          <div style={{ display: "flex", gap: 14, marginBottom: 28 }}>
            <button
              className="action-btn"
              onClick={() => setShowDetail(true)}
              style={{
                background: "linear-gradient(135deg,#00bfff,#00e5ff)",
                color: "#000",
              }}
            >
              📊 View Result
            </button>
            <button
              className="action-btn"
              onClick={() => navigate("/leaderboard")}
              style={{
                background: "transparent",
                border: "1px solid #00bfff",
                color: "#00bfff",
              }}
            >
              🏆 Go to Leaderboard
            </button>
          </div>

          {/* ── Result detail (shown after clicking View Result) ── */}
          {showDetail && (
            <>
              {/* Stat grid */}
              <div className="result-card" style={{ marginBottom: 20, animationDelay: "0.05s" }}>
                <h2 style={{ color: "#94a3b8", fontSize: 14, marginBottom: 16, textTransform: "uppercase", letterSpacing: "1px" }}>
                  Session Summary
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {STATS.map((s) => (
                    <div key={s.label} className="result-stat">
                      <div style={{ fontSize: 20, fontWeight: 800, color: s.color, marginBottom: 4 }}>
                        {s.value}
                      </div>
                      <div style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: "1px" }}>
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags row */}
              <div className="result-card" style={{ marginBottom: 20, animationDelay: "0.1s" }}>
                <h2 style={{ color: "#94a3b8", fontSize: 14, marginBottom: 14, textTransform: "uppercase", letterSpacing: "1px" }}>
                  Session Details
                </h2>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {[
                    { label: "Difficulty", value: difficulty, color: diffColor },
                    { label: "Mode",       value: mode,       color: "#a78bfa" },
                    { label: "Algorithm",  value: algorithm,  color: "#00bfff" },
                    hints_used != null && { label: "Hints Used", value: hints_used, color: "#fbbf24" },
                  ].filter(Boolean).map((tag) => (
                    <div key={tag.label} style={{
                      padding: "6px 14px",
                      background: "rgba(255,255,255,0.04)",
                      border: `1px solid ${tag.color}44`,
                      borderRadius: 8,
                      fontSize: 13,
                    }}>
                      <span style={{ color: "#475569" }}>{tag.label}: </span>
                      <span style={{ color: tag.color, fontWeight: 600, textTransform: "capitalize" }}>{tag.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Score breakdown */}
              {base_score != null && (
                <div className="result-card" style={{ animationDelay: "0.15s" }}>
                  <h2 style={{ color: "#94a3b8", fontSize: 14, marginBottom: 14, textTransform: "uppercase", letterSpacing: "1px" }}>
                    Score Breakdown
                  </h2>
                  <ScoreCard
                    score={score}
                    maxScore={maxScore}
                    base={base_score}
                    timePenalty={time_penalty}
                    attemptPenalty={attempt_penalty}
                    hintPenalty={hint_penalty}
                  />
                </div>
              )}
            </>
          )}

          {/* Try again */}
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <button
              onClick={() => {
                // Clear progress so they go through all steps again
                localStorage.removeItem("lab_progress");
                navigate("/overview");
              }}
              style={{
                background: "transparent",
                border: "1px solid #1e293b",
                color: "#475569",
                padding: "10px 24px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              🔄 Try Another Lab
            </button>
          </div>

          </div>{/* end main */}
        </div>{/* end flex */}
      </div>
    </>
  );
}