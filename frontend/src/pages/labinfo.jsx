// pages/labinfo.jsx
// Step 2 — Consent Form + Difficulty Selection
// Per spec:
//   - Start Lab button DISABLED until consent accepted
//   - On Start Lab: marks consent step complete in lab_progress, navigates to /lab

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import SidePanel from "../components/sidepanel";
import DifficultyCard from "../components/difficultycard";
import DisclaimerBox from "../components/disclaimerbox";
import { getDifficulties } from "../api/overview";

const DISCLAIMER_TEXT = `This password cracking lab is strictly for educational purposes only.

By proceeding, you acknowledge and agree to the following:

1. AUTHORIZED USE ONLY: All tools, techniques, and knowledge gained in this lab must only be used in authorized environments. Using these techniques against real systems, networks, or accounts without explicit written permission is illegal under computer crime laws including the Computer Fraud and Abuse Act (CFAA) and equivalent legislation worldwide.

2. NO REAL SYSTEMS: You must not attempt to apply any techniques learned here to real passwords, accounts, systems, or networks outside this lab environment.

3. EDUCATIONAL PURPOSE: This lab is designed to demonstrate how weak passwords are vulnerable to cracking attacks, in order to promote better password hygiene and security practices.

4. ISOLATED ENVIRONMENT: All cracking activities occur within an isolated Docker container. No real credentials are involved.

5. LEGAL RESPONSIBILITY: You are solely responsible for ensuring your use of this knowledge complies with all applicable laws and institutional policies.

6. DATA PRIVACY: No real personal data is used in this lab. All passwords and hashes are synthetically generated for educational purposes.

Failure to comply with these terms may result in legal consequences. By clicking "Start Lab", you confirm you have read, understood, and agree to all the above terms.`;

const styles = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .li-section {
    background: #0d1526;
    border: 1px solid #1e293b;
    border-radius: 14px;
    padding: 26px;
    margin-bottom: 24px;
    animation: fadeUp 0.4s ease both;
  }
  .start-btn {
    width: 100%;
    padding: 15px;
    border-radius: 10px;
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
    border: none;
    transition: filter 0.15s, transform 0.15s;
  }
  .start-btn:not(:disabled):hover {
    filter: brightness(1.08);
    transform: translateY(-1px);
  }
`;

export default function LabInfo() {
  const navigate = useNavigate();
  const [difficulties, setDifficulties] = useState([]);
  const [selectedDiff, setSelectedDiff] = useState(null);
  const [consentAccepted, setConsent]   = useState(false);
  const [loadingDiffs, setLoadingDiffs] = useState(true);
  const [diffError, setDiffError]       = useState(null);

  const getCompleted = () => {
    try { return JSON.parse(localStorage.getItem("lab_progress") || "{}"); }
    catch { return {}; }
  };
  const [completed, setCompleted] = useState(getCompleted);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    getDifficulties()
      .then((data) => setDifficulties(Array.isArray(data) ? data : data?.levels || []))
      .catch(() => setDiffError("Failed to load difficulties. Please refresh."))
      .finally(() => setLoadingDiffs(false));
  }, [navigate]);

  const canStart = consentAccepted && !!selectedDiff;

  const handleStart = () => {
    if (!canStart) return;
    // Mark consent step complete
    const prev = getCompleted();
    const next = { ...prev, consent: true };
    localStorage.setItem("lab_progress", JSON.stringify(next));
    setCompleted(next);
    navigate("/lab", { state: { difficulty: selectedDiff, consent_given: true } });
  };

  return (
    <>
      <style>{styles}</style>
      <div style={{ minHeight: "100vh", background: "#080d1a", color: "#e2e8f0", display: "flex", flexDirection: "column" }}>

        <Navbar />

        <div style={{ display: "flex", flex: 1 }}>
          <SidePanel completed={completed} />

          <div style={{ flex: 1, overflowY: "auto", padding: "36px 28px 60px" }}>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ color: "#00ffcc", fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8, fontFamily: "monospace" }}>
              Step 2 of 3
            </div>
            <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800, margin: "0 0 8px" }}>
              Consent & Difficulty
            </h1>
            <p style={{ color: "#475569", fontSize: 14, margin: 0 }}>
              Read and accept the disclaimer, then choose your difficulty to begin.
            </p>
          </div>

          {/* ── Disclaimer ── */}
          <div className="li-section" style={{ animationDelay: "0s" }}>
            <h3 style={{ color: "#94a3b8", fontSize: 14, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                width: 24, height: 24, borderRadius: "50%",
                background: consentAccepted ? "linear-gradient(135deg,#00bfff,#00ffcc)" : "transparent",
                border: `2px solid ${consentAccepted ? "transparent" : "#334155"}`,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, color: "#000", fontWeight: 700, flexShrink: 0,
              }}>
                {consentAccepted ? "✓" : "1"}
              </span>
              Read &amp; Accept the Disclaimer
            </h3>

            <DisclaimerBox text={DISCLAIMER_TEXT} onAccept={() => setConsent(true)} />

            {consentAccepted && (
              <p style={{ color: "#00ffcc", marginTop: 12, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                ✅ Disclaimer accepted
              </p>
            )}
          </div>

          {/* ── Difficulty Selection ── */}
          <div className="li-section" style={{
            animationDelay: "0.1s",
            opacity: consentAccepted ? 1 : 0.45,
            transition: "opacity 0.3s",
          }}>
            <h3 style={{ color: "#94a3b8", fontSize: 14, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                width: 24, height: 24, borderRadius: "50%",
                background: selectedDiff ? "linear-gradient(135deg,#00bfff,#00ffcc)" : "transparent",
                border: `2px solid ${selectedDiff ? "transparent" : "#334155"}`,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, color: "#000", fontWeight: 700, flexShrink: 0,
              }}>
                {selectedDiff ? "✓" : "2"}
              </span>
              Choose Your Difficulty
              {!consentAccepted && (
                <span style={{ color: "#475569", fontSize: 12, marginLeft: 4 }}>
                  — accept disclaimer first
                </span>
              )}
            </h3>

            {loadingDiffs && <p style={{ color: "#64748b" }}>Loading...</p>}
            {diffError    && <p style={{ color: "#f87171" }}>{diffError}</p>}

            {!loadingDiffs && !diffError && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 16,
              }}>
                {difficulties.map((diff) => (
                  <div
                    key={diff.id}
                    onClick={() => consentAccepted && setSelectedDiff(diff.id)}
                    style={{
                      outline: selectedDiff === diff.id ? "2px solid #00bfff" : "2px solid transparent",
                      borderRadius: 16,
                      transition: "outline 0.15s",
                      cursor: consentAccepted ? "pointer" : "not-allowed",
                      display: "flex",        // ✅ makes child stretch to fill
                      flexDirection: "column",
                    }}
                  >
                    <DifficultyCard
                      id={diff.id}
                      title={diff.title}
                      description={diff.description}
                      points={diff.points}
                      mode={diff.mode_label || diff.mode}
                      algorithm={diff.hash_algorithm}
                      timer_seconds={diff.timer_seconds}
                      expected_tool={diff.expected_tool}
                      disabled={!consentAccepted}
                    />
                  </div>
                ))}
              </div>
            )}

            {selectedDiff && (
              <p style={{ color: "#00bfff", marginTop: 14, fontSize: 13 }}>
                ✅ Selected: <strong style={{ textTransform: "capitalize" }}>{selectedDiff}</strong>
              </p>
            )}
          </div>

          {/* ── Start Button ── */}
          <button
            className="start-btn"
            onClick={handleStart}
            disabled={!canStart}
            style={{
              background: canStart
                ? "linear-gradient(135deg,#00bfff,#00e5ff)"
                : "#111827",
              color: canStart ? "#000" : "#334155",
              border: `1px solid ${canStart ? "transparent" : "#1f2937"}`,
              cursor: canStart ? "pointer" : "not-allowed",
            }}
          >
            {!consentAccepted
              ? "🔒 Accept the disclaimer to unlock"
              : !selectedDiff
              ? "Select a difficulty to continue"
              : "🚀 Start Lab"}
          </button>

          </div>{/* end main content */}
        </div>{/* end flex row */}
      </div>
    </>
  );
}