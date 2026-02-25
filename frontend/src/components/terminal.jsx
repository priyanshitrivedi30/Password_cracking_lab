import { useState } from "react";
import { execTerminal } from "../api/terminal";

export default function Terminal({ sessionId, onStepUpdate }) {
  const [history, setHistory] = useState([]);
  const [command, setCommand] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCommand = async () => {
    if (!command.trim() || !sessionId) return;

    const trimmed = command.trim().toLowerCase();

    // Show typed command immediately
    setHistory((prev) => [...prev, `> ${command}`]);
    setLoading(true);

    try {
      const res = await execTerminal(sessionId, command);

      setHistory((prev) => [
        ...prev,
        res.output || "No output",
      ]);

      // 🔥 FRONTEND STEP LOGIC (Beginner Mode)
      if (onStepUpdate) {
        if (trimmed === "ls") {
          onStepUpdate(2);
        } else if (trimmed.startsWith("cd")) {
          onStepUpdate(3);
        } else if (trimmed.startsWith("cat")) {
          onStepUpdate(4);
        }
      }

    } catch (err) {
      setHistory((prev) => [
        ...prev,
        `❌ ${err.message || "Command failed"}`,
      ]);
    } finally {
      setCommand("");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "#000",
        color: "#00ff88",
        padding: "20px",
        height: "350px",
        overflowY: "auto",
        fontFamily: "monospace",
        borderRadius: "10px",
        border: "1px solid #00bfff",
        boxShadow: "0 0 10px #00bfff",
      }}
    >
      {history.map((line, index) => (
        <div key={index}>{line}</div>
      ))}

      {loading && <div>Running...</div>}

      <div style={{ marginTop: "10px" }}>
        <span style={{ color: "#00bfff" }}>&gt; </span>
        <input
          style={{
            background: "black",
            color: "#00ff88",
            border: "none",
            outline: "none",
            width: "85%",
          }}
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCommand()}
        />
      </div>
    </div>
  );
}