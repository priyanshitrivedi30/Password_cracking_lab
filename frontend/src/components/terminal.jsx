import { useState, useEffect, useRef } from "react";
import { execTerminal } from "../api/terminal";

// ─────────────────────────────────────────────────────────────
// Terminal.jsx
//
// ✅ Steps come from BACKEND response (res.currentStep), NOT
//    from frontend string matching. This means:
//    - Step only advances if the command actually SUCCEEDED
//    - Backend verifies command output and sets the step
//    - onStepUpdate(currentStep, hintsUsed, currentScore) is
//      called after each successful command with all live state
// ─────────────────────────────────────────────────────────────

export default function Terminal({
  sessionId,
  difficulty,
  onStepUpdate,    // (currentStep, hintsUsed, currentScore) => void
}) {
  const [history, setHistory] = useState([
    "Welcome to the Password Cracking Lab Terminal",
    `Difficulty: ${difficulty || "unknown"} | Session: ${sessionId}`,
    "─────────────────────────────────────",
    "",
  ]);
  const [command, setCommand] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // ✅ Auto-scroll to bottom after every new history entry
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleCommand = async () => {
    const trimmed = command.trim();
    if (!trimmed || !sessionId || loading) return;

    // Show the typed command immediately
    setHistory((prev) => [...prev, `$ ${trimmed}`]);
    setCommand("");
    setLoading(true);

    try {
      const res = await execTerminal(sessionId, trimmed);

      // Strip ANSI escape codes (color codes from john/hashcat output)
      // e.g. \x1b[0;33m or [0;33m that appear as garbled text
      const stripAnsi = (str) =>
        str.replace(/(\x1b|\x1B)\[[0-9;]*[mGKHF]/g, "")  // standard ESC sequences
           .replace(/\[[0-9;]*[mGKHF]/g, "");             // sequences missing ESC byte

      // Show output lines (split on newline for proper display)
      const outputLines = stripAnsi(res.output || "No output")
        .split("\n")
        .map((line) => line || " "); // preserve blank lines

      setHistory((prev) => [...prev, ...outputLines, ""]);

      // ✅ If hashcat finished cracking, auto-run --show to display password clearly
      const outputText = res.output || "";
      const isHashcatCmd = trimmed.toLowerCase().startsWith("hashcat") && !trimmed.includes("--show");
      const crackedInOutput = outputText.includes("Status") && outputText.includes("Cracked");
      if (isHashcatCmd && crackedInOutput) {
        // Small delay then auto-show the cracked password
        setTimeout(async () => {
          try {
            const showRes = await execTerminal(sessionId, "hashcat --show --session=lab hash.txt");
            const showLines = stripAnsi(showRes.output || "")
              .split("\n")
              .filter(l => l.trim())
              .map(l => {
                // hashcat --show returns: hash:password
                if (l.includes(":") && l.split(":").length === 2) {
                  const pwd = l.split(":")[1].trim();
                  return pwd ? `🔓 PASSWORD FOUND: ${pwd}` : l;
                }
                return l;
              });
            if (showLines.length > 0) {
              setHistory((prev) => [...prev, "--- hashcat --show result ---", ...showLines, ""]);
            }
          } catch { /* ignore */ }
        }, 500);
      }

      // ✅ Step advancement driven ENTIRELY by backend response
      if (onStepUpdate) {
        onStepUpdate(
          res.currentStep,
          res.hintsUsed,
          res.currentScore,
        );
      }

    } catch (err) {
      // ✅ Safely extract error message — never render an object
      let errMsg = "Command failed";
      if (typeof err === "string") errMsg = err;
      else if (err?.message && typeof err.message === "string") errMsg = err.message;
      else if (err?.response?.data?.detail) errMsg = String(err.response.data.detail);

      setHistory((prev) => [
        ...prev,
        `❌ ${errMsg}`,
        "",
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: "#000",
        color: "#00ff88",
        fontFamily: "'Courier New', Courier, monospace",
        borderRadius: "10px",
        border: "1px solid #00bfff",
        boxShadow: "0 0 14px rgba(0,191,255,0.3)",
        height: "400px",
        overflow: "hidden",
      }}
      // ✅ Click anywhere in terminal to focus input
      onClick={() => inputRef.current?.focus()}
    >
      {/* Terminal header bar */}
      <div style={{
        background: "#0a0f1f",
        padding: "8px 14px",
        borderBottom: "1px solid #1e3a5f",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        flexShrink: 0,
      }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f87171", display: "inline-block" }} />
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#facc15", display: "inline-block" }} />
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#00ff88", display: "inline-block" }} />
        <span style={{ marginLeft: "8px", fontSize: "12px", color: "#475569" }}>
          lab-terminal — session {sessionId}
        </span>
      </div>

      {/* Output history — scrollable */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "12px 16px",
        fontSize: "13px",
        lineHeight: "1.6",
      }}>
        {history.map((line, i) => {
          // ✅ Detect hashcat cracked output: "hash:password" or "Status.........: Cracked"
          const isCracked = line.includes(":") && !line.startsWith("$") && !line.startsWith("❌")
            && !line.includes("http") && !line.includes("//")
            && line.split(":").length === 2
            && line.split(":")[0].length >= 32   // hash part is long
            && line.split(":")[1].trim().length > 0; // password part not empty

          const isStatus = line.includes("Status") && line.includes("Cracked");
          const isProgress = line.startsWith("Progress") || line.startsWith("Speed") || line.startsWith("Recovered");

          return (
            <div
              key={i}
              style={{
                color: line.startsWith("$") ? "#00bfff"
                     : line.startsWith("❌") ? "#f87171"
                     : line.startsWith("🎉") ? "#00ff88"
                     : isCracked ? "#000"
                     : isStatus ? "#facc15"
                     : isProgress ? "#94a3b8"
                     : "#00ff88",
                background: isCracked ? "#00ffcc" : "transparent",
                padding: isCracked ? "4px 8px" : "0",
                borderRadius: isCracked ? "4px" : "0",
                fontWeight: isCracked ? "900" : "normal",
                fontSize: isCracked ? "14px" : "13px",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                marginBottom: isCracked ? "4px" : "0",
              }}
            >
              {isCracked ? `🔓 CRACKED: ${line.split(":")[1].trim()}  ← Submit this password!` : line}
            </div>
          );
        })}

        {loading && (
          <div style={{ color: "#facc15", animation: "pulse 1s infinite" }}>
            ⏳ Running...
          </div>
        )}

        {/* Auto-scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <div style={{
        display: "flex",
        alignItems: "center",
        padding: "10px 16px",
        borderTop: "1px solid #1e3a5f",
        background: "#000",
        flexShrink: 0,
      }}>
        <span style={{ color: "#00bfff", marginRight: "8px", fontSize: "14px" }}>$</span>
        <input
          ref={inputRef}
          style={{
            flex: 1,
            background: "transparent",
            color: "#00ff88",
            border: "none",
            outline: "none",
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: "13px",
            // ✅ Disable input while command is running
            opacity: loading ? 0.4 : 1,
            cursor: loading ? "not-allowed" : "text",
          }}
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading) handleCommand();
          }}
          disabled={loading}
          placeholder={loading ? "Running..." : "Type a command..."}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </div>
    </div>
  );
}