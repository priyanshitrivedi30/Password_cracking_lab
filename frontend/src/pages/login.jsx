import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js";

export default function Login({ setToken }) {
  const navigate = useNavigate();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // FastAPI OAuth2 expects form-encoded body with "username" key
      const formData = new URLSearchParams();
      formData.append("username", email.trim());
      formData.append("password", password);

      const response = await api.post("/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const { access_token, user } = response.data;

      // ✅ Save token and user
      localStorage.setItem("token", access_token);
      if (user) localStorage.setItem("user", JSON.stringify(user));

      // ✅ Always clear previous user's lab progress on login
      // This ensures a new login always starts from step 1
      localStorage.removeItem("lab_progress");

      if (setToken) setToken(access_token);

      navigate("/overview");
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError("Server error. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Enter key submits from either field
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) handleLogin();
  };

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      justifyContent: "center",
      alignItems: "center",
      background: "#0a0f1c",
    }}>
      <div style={{
        background: "#0f172a",
        padding: "40px",
        borderRadius: "12px",
        width: "360px",
        boxShadow: "0 0 30px rgba(0,191,255,0.15)",
        color: "white",
        border: "1px solid #1e3a5f",
      }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔐</div>
          <h2 style={{ color: "#00bfff", margin: 0 }}>Welcome Back</h2>
          <p style={{ color: "#475569", fontSize: 13, marginTop: 6 }}>
            CyberCare Password Cracking Lab
          </p>
        </div>

        {error && (
          <div style={{
            background: "#2a0a0a",
            border: "1px solid #f87171",
            borderRadius: 6,
            padding: "10px 14px",
            marginBottom: 16,
            color: "#f87171",
            fontSize: 13,
          }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            style={inputStyle}
            autoComplete="email"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            style={inputStyle}
            autoComplete="current-password"
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: loading ? "#1e3a5f" : "#00bfff",
              border: "none",
              color: loading ? "#64748b" : "#000",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "bold",
              fontSize: 14,
              transition: "background 0.2s",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>

        <p style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: "#475569" }}>
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            style={{ color: "#00bfff", cursor: "pointer", textDecoration: "underline" }}
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  background: "#020617",
  border: "1px solid #1e3a5f",
  color: "white",
  borderRadius: "8px",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box", // ✅ prevents overflow
  transition: "border-color 0.2s",
};