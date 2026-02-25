import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleLeaderboard = () => {
    navigate("./pages/leaderboard");
  };

  return (
    <nav
      style={{
        padding: "12px 20px",
        background: "#0a0f1f",
        color: "#00bfff",
        fontWeight: "bold",
        borderBottom: "1px solid #00bfff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Back Button */}
      <button
        onClick={handleBack}
        style={{
          background: "transparent",
          border: "1px solid #00bfff",
          color: "#00bfff",
          padding: "6px 12px",
          cursor: "pointer",
        }}
      >
        ← Back
      </button>

      {/* Title */}
      <div style={{ fontSize: "18px" }}>
        CyberCare Password Cracking Lab
      </div>

      {/* Right Side Buttons */}
      <div style={{ display: "flex", gap: "10px" }}>
        {/* Leaderboard Button */}
        <button
          onClick={handleLeaderboard}
          style={{
            background: "transparent",
            border: "1px solid #00bfff",
            color: "#00bfff",
            padding: "6px 12px",
            cursor: "pointer",
          }}
        >
          🏆 Leaderboard
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            background: "#00bfff",
            border: "none",
            color: "#0a0f1f",
            padding: "6px 12px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}