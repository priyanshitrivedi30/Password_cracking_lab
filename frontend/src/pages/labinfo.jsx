import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function LabInfo() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState("beginner");
  const [accepted, setAccepted] = useState(false);

  const startLab = () => {
    if (!accepted) return;
    navigate("/lab", { state: { difficulty } });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Password Cracking Lab</h2>

        {/* Short Overview */}
        <p style={{ marginTop: 10 }}>
          You are about to enter a controlled cybersecurity lab designed to
          demonstrate how weak passwords are cracked using real-world tools.
        </p>

        {/* Disclaimer */}
        <div style={styles.disclaimer}>
          <p>
            <strong>Disclaimer:</strong> This lab is for educational purposes
            only. Attempting to crack passwords on real systems without
            authorization is illegal.
          </p>

          <label style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            I understand and agree
          </label>
        </div>

        {/* Difficulty */}
        <label style={{ marginTop: 20, display: "block" }}>
          <strong>Select Difficulty</strong>
        </label>

        <select
          style={styles.select}
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="beginner">Beginner (Guided)</option>
          <option value="intermediate">Intermediate (Hints)</option>
          <option value="advanced">Advanced (Free)</option>
        </select>

        {/* Start */}
        <button
          style={{
            ...styles.button,
            background: accepted ? "#2563eb" : "#374151",
            cursor: accepted ? "pointer" : "not-allowed",
          }}
          disabled={!accepted}
          onClick={startLab}
        >
          Start Lab
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
    width: "420px",
    boxShadow: "0 0 20px #1e3a8a",
    color: "white",
  },
  disclaimer: {
    marginTop: 15,
    padding: 12,
    background: "#020617",
    borderRadius: 6,
    fontSize: 14,
  },
  select: {
    marginTop: 10,
    padding: "10px",
    width: "100%",
    background: "#1f2937",
    color: "white",
    border: "1px solid #2563eb",
    borderRadius: "6px",
  },
  button: {
    marginTop: 20,
    padding: "12px",
    width: "100%",
    border: "none",
    color: "white",
    borderRadius: "6px",
    fontWeight: "bold",
  },
};