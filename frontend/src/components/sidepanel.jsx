// components/sidepanel.jsx
//
// ALWAYS-VISIBLE left sidebar (not a drawer).
// On narrow screens it collapses to icon-only (48px wide).
// Props:
//   completed — { overview: bool, consent: bool, lab: bool }

import { useNavigate, useLocation } from "react-router-dom";

const styles = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .sp-wrap {
    width: 240px;
    min-width: 240px;
    height: 100vh;
    position: sticky;
    top: 0;
    background: #070c19;
    border-right: 1px solid #1a2744;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    z-index: 10;
  }

  .sp-item {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 10px 14px 10px 16px;
    border: none;
    border-left: 3px solid transparent;
    border-radius: 0 8px 8px 0;
    background: transparent;
    cursor: pointer;
    text-align: left;
    font-size: 13.5px;
    transition: background 0.15s, border-color 0.15s;
    margin-bottom: 2px;
    color: #64748b;
  }
  .sp-item.active {
    background: rgba(0,191,255,0.09);
    border-left-color: #00bfff;
    color: #00bfff;
    font-weight: 600;
  }
  .sp-item.unlocked:not(.active):hover {
    background: rgba(0,191,255,0.05);
    border-left-color: #00bfff55;
    color: #cbd5e1;
  }
  .sp-item.locked {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .sp-section-label {
    padding: 16px 16px 7px;
    font-size: 10px;
    color: #1e3a5f;
    letter-spacing: 1.5px;
    text-transform: uppercase;
  }

  .retry-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 9px 14px;
    border: 1px solid #1e3a5f;
    border-radius: 7px;
    background: transparent;
    color: #00bfff;
    font-size: 13px;
    cursor: pointer;
    transition: background 0.15s;
    text-align: left;
  }
  .retry-btn:hover { background: rgba(0,191,255,0.07); }

  .logout-sp {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 9px 14px;
    border: 1px solid #2d1a1a;
    border-radius: 7px;
    background: transparent;
    color: #f87171;
    font-size: 13px;
    cursor: pointer;
    transition: background 0.15s;
    text-align: left;
  }
  .logout-sp:hover { background: rgba(248,113,113,0.07); }

  @media (max-width: 768px) {
    .sp-wrap { display: none; }
  }
`;

// Round checkbox indicator
function RoundCheck({ done, active }) {
  if (done) {
    return (
      <div style={{
        width: 20, height: 20, borderRadius: "50%",
        background: "linear-gradient(135deg,#00bfff,#00ffcc)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 10, color: "#000", fontWeight: 800, flexShrink: 0,
      }}>✓</div>
    );
  }
  return (
    <div style={{
      width: 20, height: 20, borderRadius: "50%",
      border: `2px solid ${active ? "#00bfff" : "#1e3a5f"}`,
      background: active ? "rgba(0,191,255,0.08)" : "transparent",
      flexShrink: 0,
    }} />
  );
}

const STEPS = [
  { key: "overview", label: "Overview of Lab",      icon: "📋", path: "/overview",    needsPrev: null       },
  { key: "consent",  label: "Consent & Difficulty", icon: "📝", path: "/labinfo",     needsPrev: "overview" },
  { key: "lab",      label: "Lab Performance",      icon: "💻", path: "/lab",         needsPrev: "consent"  },
];

const EXTRA = [
  { label: "View Result",  icon: "🎯", path: "/result",      needsKey: "lab"  },
  { label: "Leaderboard",  icon: "🏆", path: "/leaderboard", needsKey: null   },
];

export default function SidePanel({ completed = {} }) {
  const navigate = useNavigate();
  const location = useLocation();

  const go = (path) => navigate(path);

  const handleRetry = () => {
    localStorage.removeItem("lab_progress");
    navigate("/overview");
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("lab_progress"); // ✅ clear progress on logout
    } catch { /**/ }
    navigate("/login");
  };

  let username = null;
  try {
    const s = localStorage.getItem("user");
    if (s) username = JSON.parse(s)?.username;
  } catch { /**/ }

  return (
    <>
      <style>{styles}</style>
      <aside className="sp-wrap">

        {/* ── Logo / Brand ── */}
        <div style={{
          padding: "18px 16px 14px",
          borderBottom: "1px solid #1a2744",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ fontSize: 22 }}>🔐</span>
          <div>
            <div style={{ color: "#00bfff", fontWeight: 700, fontSize: 13 }}>CyberCare Lab</div>
            <div style={{ color: "#1e3a5f", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase" }}>
              Password Cracking
            </div>
          </div>
        </div>

        {/* ── User pill ── */}
        {username && (
          <div style={{
            margin: "12px 12px 0",
            padding: "9px 12px",
            background: "#0f172a",
            border: "1px solid #1e293b",
            borderRadius: 8,
            display: "flex", alignItems: "center", gap: 9,
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "linear-gradient(135deg,#00bfff22,#00ffcc11)",
              border: "1px solid #00bfff33",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, color: "#00bfff", flexShrink: 0,
            }}>
              {username.charAt(0).toUpperCase()}
            </div>
            <span style={{
              color: "#e2e8f0", fontSize: 13, fontWeight: 600,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{username}</span>
          </div>
        )}

        {/* ── Lab Steps ── */}
        <div className="sp-section-label">Lab Steps</div>

        <nav style={{ padding: "0 8px", flex: 1, overflowY: "auto" }}>
          {STEPS.map((step, index) => {
            const isDone   = !!completed[step.key];
            const isActive = location.pathname === step.path;
            const isLocked = step.needsPrev ? !completed[step.needsPrev] : false;

            return (
              <button
                key={step.key}
                className={`sp-item ${isActive ? "active" : ""} ${isLocked ? "locked" : "unlocked"}`}
                onClick={() => !isLocked && go(step.path)}
                disabled={isLocked}
              >
                {/* Step number */}
                <span style={{ fontSize: 10, color: "#1e3a5f", minWidth: 12, flexShrink: 0 }}>
                  {index + 1}
                </span>
                {/* Icon */}
                <span style={{ fontSize: 16, flexShrink: 0 }}>
                  {isLocked ? "🔒" : step.icon}
                </span>
                {/* Label */}
                <span style={{ flex: 1, lineHeight: 1.3 }}>{step.label}</span>
                {/* Round checkbox */}
                <RoundCheck done={isDone} active={isActive} />
              </button>
            );
          })}

          {/* Divider */}
          <div style={{ height: 1, background: "#1a2744", margin: "10px 4px" }} />

          {/* Extra links */}
          {EXTRA.map((item) => {
            const isLocked = item.needsKey ? !completed[item.needsKey] : false;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                className={`sp-item ${isActive ? "active" : ""} ${isLocked ? "locked" : "unlocked"}`}
                onClick={() => !isLocked && go(item.path)}
                disabled={isLocked}
              >
                <span style={{ fontSize: 10, color: "transparent", minWidth: 12 }}>·</span>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{isLocked ? "🔒" : item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ── Footer ── */}
        <div style={{ padding: "10px 12px 16px", borderTop: "1px solid #1a2744", display: "flex", flexDirection: "column", gap: 7 }}>
          <button className="retry-btn" onClick={handleRetry}>
            <span style={{ fontSize: 16 }}>🔄</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 12 }}>Retry Lab</div>
              <div style={{ fontSize: 10, color: "#1e3a5f", marginTop: 1 }}>Restart from Overview</div>
            </div>
          </button>
          <button className="logout-sp" onClick={handleLogout}>
            <span style={{ fontSize: 16 }}>🚪</span> Log Out
          </button>
          <div style={{ marginTop: 6, fontSize: 9, color: "#1a2744", textAlign: "center", letterSpacing: "1px", fontFamily: "monospace" }}>
            CYBERCARE LAB v1.0
          </div>
        </div>

      </aside>
    </>
  );
}