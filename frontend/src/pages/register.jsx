import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Register({ setToken }) {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");

  const handleRegister = async () => {
    // Client-side validation
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required");
      return;
    }
    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // ✅ Sends username field — required by updated auth.py
      const res = await api.post("/auth/register", {
        username: username.trim(),
        email:    email.trim(),
        password,
      });

      const { access_token, user } = res.data;

      // ✅ Auto-login after register — auth.py returns token on register
      if (access_token) {
        localStorage.setItem("token", access_token);
        if (user) localStorage.setItem("user", JSON.stringify(user));
        localStorage.removeItem("lab_progress"); // clear any previous user progress
        if (setToken) setToken(access_token);

        setSuccess("Account created! Redirecting...");
        setTimeout(() => navigate("/overview"), 800);
      } else {
        // Fallback: redirect to login if no token returned
        setSuccess("Account created! Please login.");
        setTimeout(() => navigate("/login"), 1000);
      }

    } catch (err) {
      // ✅ Extract FastAPI validation errors properly
      let msg = "Registration failed. Please try again.";
      if (err.response?.data) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail)) {
          msg = detail.map((e) => e.msg).join(", ");
        } else if (typeof detail === "string") {
          msg = detail;
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) handleRegister();
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
          <div style={{ fontSize: 32, marginBottom: 8 }}>🛡️</div>
          <h2 style={{ color: "#00bfff", margin: 0 }}>Create Account</h2>
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

        {success && (
          <div style={{
            background: "#052e16",
            border: "1px solid #00ff88",
            borderRadius: 6,
            padding: "10px 14px",
            marginBottom: 16,
            color: "#00ff88",
            fontSize: 13,
          }}>
            ✅ {success}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* ✅ Username field — required by updated auth.py */}
          <div>
            <input
              type="text"
              placeholder="Username (min 3 characters)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              style={inputStyle}
              autoComplete="username"
            />
          </div>

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            style={inputStyle}
            autoComplete="email"
          />

          <div>
            <input
              type="password"
              placeholder="Password (min 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              style={inputStyle}
              autoComplete="new-password"
            />
          </div>

          <button
            onClick={handleRegister}
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
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <button
            onClick={() => navigate("/login")}
            disabled={loading}
            style={{
              padding: "10px",
              background: "transparent",
              border: "1px solid #1e3a5f",
              color: "#64748b",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 13,
            }}
          >
            Already have an account? Login
          </button>
        </div>
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
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};