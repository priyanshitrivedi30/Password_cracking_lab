import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js";

export default function Login({ setToken }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new URLSearchParams();
      formData.append("username", email); // FastAPI expects "username"
      formData.append("password", password);

      const response = await api.post("/auth/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const token = response.data.access_token;
      localStorage.setItem("token", token);
      setToken(token);

      navigate("/overview"); // or "/labinfo"
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Invalid email or password");
      } else {
        setError("Server error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
        background: "#0a0f1c",
      }}
    >
      <div
        style={{
          background: "#111827",
          padding: "40px",
          borderRadius: "10px",
          width: "350px",
          boxShadow: "0 0 20px #1e3a8a",
          color: "white",
        }}
      >
        <h2 style={{ textAlign: "center", color: "#3b82f6" }}>
          Login
        </h2>

        {error && (
          <p style={{ color: "#f87171", fontSize: "14px" }}>
            {error}
          </p>
        )}

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            background: loading ? "#1e40af" : "#2563eb",
            border: "none",
            color: "white",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={{ textAlign: "center", marginTop: "10px", fontSize: "14px" }}>
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            style={{
              color: "#3b82f6",
              cursor: "pointer",
              textDecoration: "underline",
            }}
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
  marginBottom: "10px",
  padding: "10px",
  background: "#1f2937",
  border: "1px solid #2563eb",
  color: "white",
  borderRadius: "6px",
};