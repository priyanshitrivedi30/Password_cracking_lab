import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { getErrorMessage } from "../utils/error";

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      alert("Email and password required");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/register", {
        email,
        password,
      });

      alert("Registration successful. Please login.");
      navigate("/");
    } catch (err) {
       // ✅ Proper error extraction
    let msg = "Registration failed";

    if (err.response?.data) {
      if (Array.isArray(err.response.data.detail)) {
        // FastAPI validation errors
        msg = err.response.data.detail.map(e => e.msg).join(", ");
      } else if (typeof err.response.data.detail === "string") {
        msg = err.response.data.detail;
      }
    }
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>

        <input
          style={styles.input}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          style={{
            ...styles.button,
            background: loading ? "#374151" : "#2563eb",
            cursor: loading ? "not-allowed" : "pointer",
          }}
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <button
          style={styles.secondaryButton}
          onClick={() => navigate("/")}
          disabled={loading}
        >
          Back to Login
        </button>
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
    width: "350px",
    boxShadow: "0 0 20px #1e3a8a",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  title: {
    color: "#3b82f6",
    textAlign: "center",
  },
  input: {
    padding: "10px",
    background: "#1f2937",
    border: "1px solid #2563eb",
    color: "white",
    borderRadius: "6px",
  },
  button: {
    padding: "10px",
    border: "none",
    color: "white",
    borderRadius: "6px",
    fontWeight: "bold",
  },
  secondaryButton: {
    padding: "8px",
    background: "transparent",
    border: "1px solid #3b82f6",
    color: "#3b82f6",
    borderRadius: "6px",
  },
};