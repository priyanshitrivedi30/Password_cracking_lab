import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Read username from localStorage for display
  let username = null;
  try {
    const stored = localStorage.getItem("user");
    if (stored) username = JSON.parse(stored)?.username;
  } catch {
    // ignore parse errors
  }

  const handleBack = () => navigate(-1);

  const handleLogout = () => {
    // ✅ Clear both token AND user — no stale data left behind
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch { /* ignore */ }
    navigate("/login");
  };

  const handleLeaderboard = () => {
    // ✅ Fixed: was "./pages/leaderboard" (broken relative path)
    navigate("/leaderboard");
  };

  const btnStyle = (active = false) => ({
    background: active ? "#00bfff" : "transparent",
    border: "1px solid #00bfff",
    color: active ? "#0a0f1f" : "#00bfff",
    padding: "6px 14px",
    cursor: "pointer",
    fontWeight: "bold",
    borderRadius: "6px",
    fontSize: "13px",
    transition: "background 0.2s, color 0.2s",
  });

  const isLeaderboard = location.pathname === "/leaderboard";

  return (
    <nav style={{
      padding: "12px 24px",
      background: "#0a0f1f",
      color: "#00bfff",
      fontWeight: "bold",
      borderBottom: "1px solid #1e3a5f",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
    }}>
      {/* Back Button */}
      <button onClick={handleBack} style={btnStyle()}>
        ← Back
      </button>

      {/* Title */}
      <div style={{ fontSize: "17px", letterSpacing: "0.5px" }}>
        🔐 CyberCare Password Cracking Lab
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

        {/* ✅ Show logged-in username */}
        {username && (
          <span style={{
            fontSize: "13px",
            color: "#64748b",
            borderRight: "1px solid #1e3a5f",
            paddingRight: "10px",
          }}>
            👤 {username}
          </span>
        )}

        {/* Leaderboard — highlighted if active route */}
        <button onClick={handleLeaderboard} style={btnStyle(isLeaderboard)}>
          🏆 Leaderboard
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            ...btnStyle(),
            background: "transparent",
            borderColor: "#f87171",
            color: "#f87171",
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}