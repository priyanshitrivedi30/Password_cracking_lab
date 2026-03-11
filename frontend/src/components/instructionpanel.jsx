// InstructionPanel.jsx
// ─────────────────────────────────────────────────────────────
// ✅ Steps update LIVE based on terminal output:
//    - currentStep prop comes from backend terminal.py response
//    - Parent (LabPage) updates currentStep after every execTerminal() call
//    - Panel re-renders showing the correct next instruction automatically
//
// Props flow:
//   LabPage → execTerminal() → gets { currentStep } from response
//           → setState(currentStep) → passes down to InstructionPanel
// ─────────────────────────────────────────────────────────────

const commandStyle = {
  background: "#000",
  padding: "8px 12px",
  borderRadius: "6px",
  fontFamily: "monospace",
  color: "#00ffcc",
  fontSize: "13px",
  marginTop: "6px",
  marginBottom: "6px",
  overflowX: "auto",
  whiteSpace: "pre",
  border: "1px solid #0d3b2e",
};

const stepDoneStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  color: "#00ff88",
  fontSize: "13px",
  margin: "6px 0",
};

// Individual step entry — shows checkmark if completed, highlight if active
function StepRow({ stepNum, currentStep, label }) {
  const done = currentStep > stepNum;
  const active = currentStep === stepNum;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "6px 10px",
      borderRadius: "6px",
      background: active ? "#0d2137" : done ? "#052e16" : "transparent",
      border: active ? "1px solid #00bfff" : done ? "1px solid #00ff88" : "1px solid transparent",
      marginBottom: "4px",
      fontSize: "13px",
      color: active ? "#e5e7eb" : done ? "#00ff88" : "#475569",
    }}>
      <span>{done ? "✅" : active ? "▶" : "○"}</span>
      <span>Step {stepNum}: {label}</span>
    </div>
  );
}

export default function InstructionPanel({
  difficulty,
  currentStep = 1,       // ✅ Live from backend — updates after each terminal command
  hintsUsed = 0,         // intermediate: how many hints used so far
  hintsRemaining = 5,    // intermediate: hints remaining before penalty kicks in
  currentScore = null,   // intermediate: live score with deductions applied
  maxHints = 5,
  onRequestHint,
}) {
  const isBeginner     = difficulty === "beginner";
  const isIntermediate = difficulty === "intermediate";
  const isAdvanced     = difficulty === "advanced";

  return (
    <div style={{
      padding: "18px",
      background: "#020617",
      color: "#e5e7eb",
      borderRadius: "10px",
      border: "1px solid #00bfff",
      maxWidth: "440px",
      width: "100%",
    }}>
      <h3 style={{ color: "#00bfff", marginBottom: "14px", fontSize: "16px" }}>
        📋 Instructions
      </h3>

      {/* ═══════════════════════════════════════════════
          🟢 BEGINNER — GUIDED MODE (John + Dictionary)
          Steps advance automatically as user runs each command.
          currentStep comes from backend terminal.py response.
          ═══════════════════════════════════════════════ */}
      {isBeginner && (
        <>
          {/* Step overview — all 4 steps visible, with done/active/pending state */}
          <div style={{ marginBottom: "14px" }}>
            <StepRow stepNum={1} currentStep={currentStep} label="List files (ls)" />
            <StepRow stepNum={2} currentStep={currentStep} label="View hash file (cat)" />
            <StepRow stepNum={3} currentStep={currentStep} label="Crack with John the Ripper" />
            <StepRow stepNum={4} currentStep={currentStep} label="Reveal cracked password" />
          </div>

          {/* Active step instruction */}
          <div style={{
            background: "#0d2137",
            border: "1px solid #00bfff",
            borderRadius: "8px",
            padding: "12px",
          }}>
            <p style={{ fontWeight: "bold", marginBottom: "8px", color: "#00bfff" }}>
              ▶ Step {Math.min(currentStep, 4)} of 4
            </p>

            {currentStep === 1 && (
              <>
                <p style={{ marginBottom: "6px" }}>List the files in the directory to see what's available.</p>
                <div style={commandStyle}>ls</div>
                <p style={{ fontSize: "12px", color: "#94a3b8" }}>
                  You should see <code style={{ color: "#00ffcc" }}>hash.txt</code> in the output.
                </p>
              </>
            )}

            {currentStep === 2 && (
              <>
                <p style={{ marginBottom: "6px" }}>View the hash file to see the target hash.</p>
                <div style={commandStyle}>cat hash.txt</div>
                <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px" }}>
                  The hash is <b>32 hexadecimal characters</b> — this is an <b style={{ color: "#00ffcc" }}>MD5</b> hash.
                </p>
              </>
            )}

            {currentStep === 3 && (
              <>
                <p style={{ marginBottom: "6px" }}>
                  Use <b>John the Ripper</b> with a dictionary attack against the MD5 hash.
                </p>
                <div style={commandStyle}>
                  {`john --format=raw-md5 --wordlist=/usr/share/wordlists/rockyou.txt hash.txt`}
                </div>
                <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px" }}>
                  The cracked password will appear in the output. Look for it between the hash lines.
                </p>
              </>
            )}

            {currentStep >= 4 && (
              <>
                <p style={{ marginBottom: "6px" }}>Reveal the cracked password from John's cache.</p>
                <div style={commandStyle}>john --show --format=raw-md5 hash.txt</div>
                <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px" }}>
                  If it shows 0 cracked, check the output from step 3 — the password appeared there.
                  Enter it in the Submit box below.
                </p>
                <p style={{ fontSize: "12px", color: "#00ff88", marginTop: "4px" }}>
                  🎉 Copy the password and submit it below!
                </p>
              </>
            )}
          </div>

          <p style={{ marginTop: "10px", fontSize: "12px", color: "#475569" }}>
            💡 Each step unlocks automatically after you run the correct command.
          </p>
        </>
      )}

      {/* ═══════════════════════════════════════════════
          🟡 INTERMEDIATE — HINTS MODE (Hashcat + Hybrid)
          No step locking. User gets up to 5 hints.
          After 3rd hint, each additional hint costs -5 pts.
          ═══════════════════════════════════════════════ */}
      {isIntermediate && (
        <>
          {/* Live score display */}
          {currentScore !== null && (
            <div style={{
              background: "#0d2137",
              border: "1px solid #facc15",
              borderRadius: "8px",
              padding: "10px 14px",
              marginBottom: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <span style={{ color: "#94a3b8", fontSize: "13px" }}>Current Score</span>
              <span style={{ color: "#facc15", fontWeight: "bold", fontSize: "18px" }}>
                {currentScore} pts
              </span>
            </div>
          )}

          <p style={{ marginBottom: "8px", fontSize: "14px" }}>
            Crack the <b style={{ color: "#facc15" }}>SHA-256</b> hash using <b>Hashcat</b> in hybrid mode.
            <br />
            <span style={{ color: "#94a3b8", fontSize: "12px" }}>
              The password is a common word followed by 2 digits — e.g. <code style={{ color: "#facc15" }}>sunshine47</code>
            </span>
          </p>

          {/* Hint button with counter */}
          <div style={{ marginBottom: "12px" }}>
            <button
              onClick={onRequestHint}
              disabled={hintsUsed >= maxHints}
              style={{
                padding: "9px 16px",
                background: hintsUsed >= maxHints ? "#1e293b" : "#facc15",
                color: hintsUsed >= maxHints ? "#475569" : "#000",
                border: `1px solid ${hintsUsed >= maxHints ? "#334155" : "#facc15"}`,
                borderRadius: "6px",
                cursor: hintsUsed >= maxHints ? "not-allowed" : "pointer",
                fontWeight: "bold",
                fontSize: "13px",
                width: "100%",
              }}
            >
              {hintsUsed >= maxHints
                ? "No hints remaining"
                : `💡 Get Hint (${maxHints - hintsUsed} remaining${hintsUsed >= 3 ? " — costs -5 pts" : ""})`}
            </button>

            {hintsUsed >= 3 && hintsUsed < maxHints && (
              <p style={{ fontSize: "11px", color: "#f87171", marginTop: "4px", textAlign: "center" }}>
                ⚠ Each hint from this point deducts 5 points
              </p>
            )}
          </div>

          {/* Progressive hint reveal */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {hintsUsed >= 1 && (
              <div style={{ background: "#1e293b", borderRadius: "6px", padding: "8px 12px", fontSize: "13px" }}>
                <span style={{ color: "#facc15" }}>💡 Hint 1:</span>
                <span style={{ color: "#cbd5e1" }}> Start by viewing the hash file and note its length.</span>
              </div>
            )}
            {hintsUsed >= 2 && (
              <div style={{ background: "#1e293b", borderRadius: "6px", padding: "8px 12px", fontSize: "13px" }}>
                <span style={{ color: "#facc15" }}>💡 Hint 2:</span>
                {/* ✅ Fixed: was saying MD5 — intermediate uses SHA-256 (64 hex chars) */}
                <span style={{ color: "#cbd5e1" }}> 64 hexadecimal characters = <b>SHA-256</b> hash.</span>
              </div>
            )}
            {hintsUsed >= 3 && (
              <div style={{ background: "#1e293b", borderRadius: "6px", padding: "8px 12px", fontSize: "13px" }}>
                <span style={{ color: "#facc15" }}>💡 Hint 3:</span>
                <span style={{ color: "#cbd5e1" }}> The password is a common dictionary word with digits appended.</span>
              </div>
            )}
            {hintsUsed >= 4 && (
              <div style={{ background: "#1e293b", borderRadius: "6px", padding: "8px 12px", fontSize: "13px" }}>
                <span style={{ color: "#f87171", fontSize: "11px" }}>(-5 pts)</span>
                <span style={{ color: "#facc15" }}> 💡 Hint 4:</span>
                <span style={{ color: "#cbd5e1" }}> Use Hashcat hybrid attack mode (-a 6): wordlist + mask.</span>
              </div>
            )}
            {hintsUsed >= 5 && (
              <div style={{ background: "#1e293b", borderRadius: "6px", padding: "8px 12px", fontSize: "13px" }}>
                <span style={{ color: "#f87171", fontSize: "11px" }}>(-5 pts)</span>
                <span style={{ color: "#facc15" }}> 💡 Hint 5:</span>
                <span style={{ color: "#cbd5e1" }}> Use this exact command:</span>
                <div style={commandStyle}>
                  {`hashcat -m 1400 hash.txt /usr/share/wordlists/rockyou.txt -a 6 ?d?d`}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════
          🔴 ADVANCED — FREE MODE (bcrypt, no hints)
          ═══════════════════════════════════════════════ */}
      {isAdvanced && (
        <>
          <div style={{
            background: "#2a0a0a",
            border: "1px solid #f87171",
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "12px",
          }}>
            <p style={{ color: "#f87171", fontWeight: "bold", marginBottom: "8px" }}>
              🔴 Advanced Mode — No Guidance
            </p>
            <ul style={{ fontSize: "13px", lineHeight: "1.8", color: "#cbd5e1", paddingLeft: "16px" }}>
              <li>Identify the hash type yourself</li>
              <li>No hints available</li>
              <li>Choose your own tool (Hashcat or John)</li>
              <li>Consider <b>mask</b> or <b>brute-force</b> attack strategy</li>
              <li>Password is 5 lowercase letters</li>
            </ul>
          </div>

          <p style={{ fontSize: "12px", color: "#64748b" }}>
            ⏱ Speed and attempts affect your final score.
          </p>
        </>
      )}

      {/* Universal blocked commands reminder */}
      <p style={{ marginTop: "14px", fontSize: "12px", color: "#475569", borderTop: "1px solid #1e293b", paddingTop: "10px" }}>
        🚫 Blocked: <code style={{ color: "#f87171" }}>rm, wget, curl, sudo, bash, nc, python</code>
      </p>
    </div>
  );
}