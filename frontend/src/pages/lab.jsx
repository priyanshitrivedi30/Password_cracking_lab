import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/navbar";
import Timer from "../components/timer";
import Terminal from "../components/terminal";
import ScoreCard from "../components/scorecard";
import InstructionPanel from "../components/instructionpanel";
import { startLab, getLabHint, resetLabSession } from "../api/lab";
import SidePanel from "../components/sidepanel";
import api from "../api/api";

export default function Lab() {
  const navigate  = useNavigate();
  const location  = useLocation();

  // ✅ Both difficulty and consent_given come from labinfo navigation state
  const difficulty   = location.state?.difficulty   || "beginner";
  const consentGiven = location.state?.consent_given || false;
  const hasStartedRef = useRef(false); 

  const getCompleted = () => {
    try { return JSON.parse(localStorage.getItem("lab_progress") || "{}"); } catch { return {}; }
  };
  const [completed, setCompleted] = useState(getCompleted);

  const [session,      setSession]      = useState(null);
  const [labActive,    setLabActive]    = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [startError,   setStartError]   = useState(null);
  const [resetting,    setResetting]    = useState(false); // ✅ must be top-level, not inside if(startError)

  // Live state updated from terminal responses
  const [currentStep,   setCurrentStep]   = useState(1);
  const [hintsUsed,     setHintsUsed]     = useState(0);
  const [currentScore,  setCurrentScore]  = useState(null);

  // Submission
  const [password,  setPassword]  = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result,    setResult]    = useState(null);
  const [submitErr, setSubmitErr] = useState(null);

  // ─────────────────────────────────────────────────────────
  // Start lab on mount — passes consent_given to backend
  // ─────────────────────────────────────────────────────────
useEffect(() => {
  if (hasStartedRef.current) return;   // ✅ prevents double call
  hasStartedRef.current = true;

  if (!consentGiven) {
    navigate("/labinfo", { replace: true });
    return;
  }

  const init = async () => {
    try {
      const data = await startLab(difficulty, true);
      setSession(data);
      setLabActive(true);
      setCurrentScore(data.points || null);
    } catch (err) {
      const data = err.response?.data;
      let msg = "Failed to start lab. Please try again.";
      if (typeof data?.detail === "string") msg = data.detail;
      else if (Array.isArray(data?.detail)) msg = data.detail.map(e => e.msg || JSON.stringify(e)).join(", ");
      else if (err.message) msg = err.message;
      setStartError(msg);
    } finally {
      setLoading(false);
    }
  };

  init();
}, []);   // ✅ empty dependency array

  // ─────────────────────────────────────────────────────────
  // ✅ onStepUpdate — driven by backend terminal response
  // Called by Terminal component after every execTerminal() call
  // Signature: (currentStep, hintsUsed, currentScore)
  // ─────────────────────────────────────────────────────────
  const handleStepUpdate = useCallback((step, hints, score) => {
    if (step   !== null && step   !== undefined) setCurrentStep(step);
    if (hints  !== null && hints  !== undefined) setHintsUsed(hints);
    if (score  !== null && score  !== undefined) setCurrentScore(score);
  }, []);

  // ─────────────────────────────────────────────────────────
  // Request hint (Intermediate only)
  // ─────────────────────────────────────────────────────────
  const requestHint = async () => {
    if (!session) return;
    try {
      const res = await getLabHint(session.session_id);
      setHintsUsed(res.hints_used ?? hintsUsed + 1);
      if (res.current_score !== undefined) setCurrentScore(res.current_score);
    } catch (err) {
      alert(err.response?.data?.detail || "No hints available");
    }
  };

  // ─────────────────────────────────────────────────────────
  // Submit password
  // ─────────────────────────────────────────────────────────
  const submitPassword = async () => {
    if (!password.trim()) {
      setSubmitErr("Please enter a password first");
      return;
    }
    setSubmitting(true);
    setSubmitErr(null);

    try {
      // ✅ Submission in request body, not query params
      const res = await api.post("/submission/submit", {
        session_id: session.session_id,
        submitted_password: password,
      });

      setResult(res.data);
      setLabActive(false);
    } catch (err) {
      const data = err.response?.data;
      // FastAPI 422 returns { detail: [ {type, loc, msg} ] } — extract readable message
      let detail = "Submission failed. Please try again.";
      if (typeof data?.detail === "string") {
        detail = data.detail;
      } else if (Array.isArray(data?.detail)) {
        detail = data.detail.map(e => e.msg || JSON.stringify(e)).join(", ");
      }

      if (err.response?.status === 400 && detail?.includes("expired")) {
        setLabActive(false);
        setSubmitErr("Session has expired. Check your results below.");
      } else {
        setSubmitErr(detail);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────
  // Timer expire
  // ─────────────────────────────────────────────────────────
  const handleTimeExpire = () => {
    setLabActive(false);
    // Don't navigate away — show expired state inline
    // User can still see their session info and go to analytics
  };

  // ─────────────────────────────────────────────────────────
  // Render states
  // ─────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a0f1c", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <div style={{ display: "flex", flex: 1 }}>
        <SidePanel completed={completed} />
        <p style={{ padding: 40, color: "#64748b" }}>⏳ Starting lab environment...</p>
      </div>
    </div>
  );

  if (startError) {
    const isDuplicateSession = startError.toLowerCase().includes("running lab session");

    const handleReset = async () => {
      setResetting(true);
      try {
        await resetLabSession();
        // Retry starting the lab after reset
        window.location.reload();
      } catch {
        setResetting(false);
      }
    };

    return (
      <div style={{ minHeight: "100vh", background: "#0a0f1c", display: "flex", flexDirection: "column" }}>
        <Navbar />
        <div style={{ display: "flex", flex: 1 }}>
          <SidePanel completed={completed} />
          <div style={{ padding: 40, maxWidth: 560 }}>

            {/* Error message */}
            <div style={{
              background: "#1a0a0a",
              border: "1px solid #f8717144",
              borderRadius: 12,
              padding: "20px 24px",
              marginBottom: 24,
            }}>
              <p style={{ color: "#f87171", margin: 0, fontWeight: 600, fontSize: 15 }}>
                ❌ {startError}
              </p>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {isDuplicateSession && (
                <button
                  onClick={handleReset}
                  disabled={resetting}
                  style={{
                    padding: "12px 24px",
                    background: resetting ? "#1e293b" : "linear-gradient(135deg,#00bfff,#00e5ff)",
                    color: resetting ? "#475569" : "#000",
                    border: "none", borderRadius: 8,
                    fontWeight: 700, fontSize: 14,
                    cursor: resetting ? "not-allowed" : "pointer",
                  }}
                >
                  {resetting ? "⏳ Resetting..." : "🔄 Clear Old Session & Start Fresh"}
                </button>
              )}
              <button
                onClick={() => navigate("/labinfo")}
                style={{
                  padding: "11px 24px",
                  background: "transparent",
                  color: "#00bfff",
                  border: "1px solid #00bfff",
                  borderRadius: 8, fontWeight: 600, fontSize: 14,
                  cursor: "pointer",
                }}
              >
                ← Back to Lab Info
              </button>
            </div>

            {isDuplicateSession && (
              <p style={{ color: "#334155", fontSize: 12, marginTop: 16, lineHeight: 1.6 }}>
                This happens when a previous lab session didn't close properly
                (browser was closed, server restarted, etc).
                Clicking "Clear Old Session" safely expires it so you can start fresh.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1c", color: "#e5e7eb", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <div style={{ display: "flex", flex: 1 }}>
        <SidePanel completed={completed} />
        <div style={{ flex: 1, padding: "24px 28px", overflowY: "auto" }}>

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ color: "#00bfff", margin: 0 }}>
              🔐 Password Cracking Lab
            </h2>
            <span style={{ fontSize: 13, color: "#64748b", textTransform: "capitalize" }}>
              {difficulty} mode
            </span>
          </div>

          {/* ✅ Timer uses expires_at from session for server-sync */}
          {labActive && session?.expires_at && (
            <Timer
              expires_at={session.expires_at}
              onExpire={handleTimeExpire}
            />
          )}
        </div>

        {/* Expired banner */}
        {!labActive && !result && (
          <div style={{ background: "#2a0a0a", border: "1px solid #f87171", borderRadius: 8, padding: "14px 18px", marginBottom: 20 }}>
            <p style={{ color: "#f87171", margin: 0 }}>⏰ Lab session has ended. Submit your answer below or view analytics.</p>
          </div>
        )}

        {/* ── Main workspace ── */}
        {session && (
          <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>

            {/* LEFT — Terminal + submit */}
            <div style={{ flex: "2 1 500px", minWidth: 0 }}>

              {/* Target hash display */}
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, padding: "12px 16px", marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>
                  TARGET HASH ({session.algorithm?.toUpperCase()})
                </div>
                <code style={{ color: "#00ffcc", wordBreak: "break-all", fontSize: 13 }}>
                  {session.target_hash}
                </code>
              </div>

              {/* Terminal */}
              <Terminal
                sessionId={session.session_id}
                difficulty={difficulty}          
                onStepUpdate={handleStepUpdate}  
              />

              {/* Password submission */}
              <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Enter the cracked password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !submitting && submitPassword()}
                  style={{
                    flex: 1,
                    padding: "11px 14px",
                    background: "#0f172a",
                    color: "#e5e7eb",
                    border: "1px solid #1e3a5f",
                    borderRadius: 8,
                    fontSize: 14,
                    outline: "none",
                  }}
                />
                <button
                  onClick={submitPassword}
                  disabled={submitting || !password.trim()}
                  style={{
                    padding: "11px 22px",
                    background: submitting || !password.trim() ? "#1e293b" : "#00bfff",
                    color: submitting || !password.trim() ? "#475569" : "#000",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: "bold",
                    cursor: submitting || !password.trim() ? "not-allowed" : "pointer",
                    fontSize: 14,
                    whiteSpace: "nowrap",
                  }}
                >
                  {submitting ? "Submitting..." : "Submit Password"}
                </button>
              </div>

              {submitErr && (
                <p style={{ color: "#f87171", fontSize: 13, marginTop: 8 }}>{submitErr}</p>
              )}
            </div>

            {/* RIGHT — Instructions */}
            <div style={{ flex: "1 1 320px" }}>
              <InstructionPanel
                difficulty={difficulty}
                currentStep={currentStep}
                hintsUsed={hintsUsed}
                hintsRemaining={Math.max(5 - hintsUsed, 0)}
                currentScore={currentScore}
                maxHints={5}
                onRequestHint={difficulty === "intermediate" ? requestHint : undefined}
              />
            </div>
          </div>
        )}

        {/* ── Result ScoreCard ── */}
        {result && (
          <div style={{ marginTop: 32, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
            <ScoreCard
              score={result.score}
              attempts={result.attempts}
              time={result.time_taken_seconds}
              difficulty={result.difficulty || difficulty}
              mode={result.mode}
              hintsUsed={result.hints_used}
              baseScore={result.base_score}
              timePenalty={result.time_penalty}
              attemptPenalty={result.attempt_penalty}
              hintPenalty={result.hint_penalty}
            />

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* ✅ Per spec: navigate to /result with full result state */}
              <button
                onClick={() => {
                  // Mark lab step complete
                  const prev = (() => { try { return JSON.parse(localStorage.getItem("lab_progress") || "{}"); } catch { return {}; } })();
                  localStorage.setItem("lab_progress", JSON.stringify({ ...prev, lab: true }));
                  navigate("/result", { state: {
                    success:            result.success,
                    score:              result.score,
                    attempts:           result.attempts,
                    time_taken_seconds: result.time_taken_seconds,
                    difficulty:         result.difficulty || difficulty,
                    mode:               result.mode,
                    algorithm:          result.algorithm,
                    hints_used:         result.hints_used,
                    base_score:         result.base_score,
                    time_penalty:       result.time_penalty,
                    attempt_penalty:    result.attempt_penalty,
                    hint_penalty:       result.hint_penalty,
                  }});
                }}
                style={{ padding: "11px 22px", background: "#00bfff", color: "#000", border: "none", borderRadius: 8, fontWeight: "bold", cursor: "pointer" }}
              >
                📊 View Result →
              </button>
              <button
                onClick={() => navigate("/leaderboard")}
                style={{ padding: "11px 22px", background: "transparent", color: "#00bfff", border: "1px solid #00bfff", borderRadius: 8, fontWeight: "bold", cursor: "pointer" }}
              >
                🏆 Leaderboard
              </button>
              <button
                onClick={() => { localStorage.removeItem("lab_progress"); navigate("/overview"); }}
                style={{ padding: "11px 22px", background: "transparent", color: "#64748b", border: "1px solid #334155", borderRadius: 8, cursor: "pointer" }}
              >
                🔄 Try Another Lab
              </button>
            </div>
          </div>
        )}
        </div>{/* end main */}
      </div>{/* end flex */}
    </div>
  );
}