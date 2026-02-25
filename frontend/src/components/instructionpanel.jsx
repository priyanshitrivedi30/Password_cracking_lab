export default function InstructionPanel({
  difficulty,
  currentStep = 1,
  hint,
  hintsUsed = 0,
  onRequestHint,
}) {
  const isBeginner = difficulty === "beginner";
  const isIntermediate = difficulty === "intermediate";
  const isAdvanced = difficulty === "advanced";

  const commandStyle = {
    background: "#000",
    padding: "8px 10px",
    borderRadius: "6px",
    fontFamily: "monospace",
    color: "#00ffcc",
    marginTop: "6px",
    marginBottom: "6px",
  };

  return (
    <div
      style={{
        padding: "18px",
        background: "#020617",
        color: "#e5e7eb",
        borderRadius: "10px",
        border: "1px solid #00bfff",
        maxWidth: "420px",
      }}
    >
      <h3 style={{ color: "#00bfff", marginBottom: "10px" }}>
        Instructions
      </h3>

     
    {/* 🟢 BEGINNER MODE — JOHN + DICTIONARY */}
{isBeginner && (
  <>
    <p style={{ fontWeight: "bold" }}>Step {currentStep}</p>

    {currentStep === 1 && (
      <>
        <p>List the files in the directory.</p>
        <div style={commandStyle}>ls</div>
      </>
    )}

    {currentStep === 2 && (
      <>
        <p>View the hash file and identify the hash type.</p>
        <div style={commandStyle}>cat hash.txt</div>
        <p style={{ fontSize: "14px", color: "#94a3b8" }}>
          If it is 32 hexadecimal characters, it is likely <b>MD5</b>.
        </p>
      </>
    )}

    {currentStep === 3 && (
      <>
        <p>Use <b>John the Ripper</b> with a dictionary attack.</p>
        <div style={commandStyle}>
          john --format=raw-md5 hash.txt --wordlist=/usr/share/wordlists/rockyou.txt
        </div>
      </>
    )}

    {currentStep >= 4 && (
      <>
        <p>Reveal the cracked password:</p>
        <div style={commandStyle}>john --show hash.txt</div>
      </>
    )}

    <p style={{ marginTop: "10px", color: "#94a3b8" }}>
      💡 Complete each step to unlock the next instruction.
    </p>
  </>
)}

      {/* 🟡 INTERMEDIATE MODE — HASHCAT + HYBRID */}
      {isIntermediate && (
        <>
          <p>
            You are in <b>Intermediate Mode</b>.
          </p>
          <p style={{ fontSize: "14px", color: "#94a3b8" }}>
            Tool expected: <b>Hashcat</b>
          </p>

          <button
            onClick={onRequestHint}
            disabled={hintsUsed >= 3}
            style={{
              padding: "8px 12px",
              background: hintsUsed >= 3 ? "#334155" : "#00bfff",
              color: "#000",
              border: "none",
              borderRadius: "6px",
              cursor: hintsUsed >= 3 ? "not-allowed" : "pointer",
              fontWeight: "bold",
            }}
          >
            Get Hint ({3 - hintsUsed} left)
          </button>

         {hintsUsed >= 1 && (
  <p style={{ marginTop: "10px", fontSize: "14px", color: "#64748b" }}>
    Hint 1: Inspect the hash file and determine its length.
  </p>
)}

{hintsUsed >= 2 && (
  <p style={{ marginTop: "6px", fontSize: "14px", color: "#64748b" }}>
    Hint 2: 32 hexadecimal characters usually indicate MD5.
  </p>
)}

{hintsUsed >= 3 && (
  <p style={{ marginTop: "6px", fontSize: "14px", color: "#64748b" }}>
    Hint 3: The password may contain a common word.
  </p>
)}

{hintsUsed >= 4 && (
  <p style={{ marginTop: "6px", fontSize: "14px", color: "#64748b" }}>
    Hint 4: Try combining a dictionary word with numbers.
  </p>
)}

{hintsUsed >= 5 && (
  <>
    <p style={{ marginTop: "6px", fontSize: "14px", color: "#64748b" }}>
      Hint 5: Use Hashcat hybrid mode.
    </p>
    <div style={commandStyle}>
      hashcat -m 0 hash.txt /usr/share/wordlists/rockyou.txt -a 6 ?d?d
    </div>
  </>
)}
          {hint && (
            <div style={{ marginTop: "12px", fontSize: "14px", color: "#94a3b8" }}>
              💡 {hint}
            </div>
          )}
        </>
      )}

      {/* 🔴 ADVANCED MODE — OPEN CHALLENGE */}
      {isAdvanced && (
        <>
          <p>
            You are in <b>Advanced Mode</b>.
          </p>

          <ul style={{ fontSize: "14px", lineHeight: "1.6" }}>
            <li>No predefined tool</li>
            <li>No hints available</li>
            <li>Identify the hash type yourself</li>
            <li>Choose the correct attack strategy</li>
            <li>Consider mask or brute-force techniques</li>
          </ul>

          <p style={{ fontSize: "13px", color: "#64748b" }}>
            Scoring depends on speed and number of attempts.
          </p>
        </>
      )}

      <p style={{ marginTop: "12px", color: "#64748b" }}>
        ⚠ Destructive or network commands are blocked.
      </p>
    </div>
  );
}