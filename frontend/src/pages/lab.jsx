import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/api";

import Timer from "../components/timer";
import Terminal from "../components/terminal";
import ScoreCard from "../components/scorecard";
import InstructionPanel from "../components/instructionpanel";

export default function Lab() {
  const navigate = useNavigate();
  const location = useLocation();

  const difficulty = location.state?.difficulty || "beginner";

  const [session, setSession] = useState(null);
  const [labActive, setLabActive] = useState(false);
  const [loading, setLoading] = useState(true);

  const [currentStep, setCurrentStep] = useState(1);
  const [hint, setHint] = useState(null);

  const [password, setPassword] = useState("");
  const [result, setResult] = useState(null);

  // 🚀 Start Lab Automatically
  useEffect(() => {
    const startLab = async () => {
      try {
        const res = await api.post("/lab/start", { difficulty });
        setSession(res.data);
        setLabActive(true);
      } catch (error) {
        alert("Failed to start lab");
        navigate("/labinfo");
      } finally {
        setLoading(false);
      }
    };

    startLab();
  }, [difficulty, navigate]);

  // 🔥 Beginner Step Logic
  const handleCommandExecute = (command) => {
    if (difficulty !== "beginner") return;

    const trimmed = command.trim().toLowerCase();

    if (currentStep === 1 && trimmed === "ls") {
      setCurrentStep(2);
    } else if (currentStep === 2 && trimmed.startsWith("cd")) {
      setCurrentStep(3);
    } else if (currentStep === 3 && trimmed.startsWith("cat")) {
      setCurrentStep(4);
    }
  };

  // 💡 Request Hint (Intermediate)
  const requestHint = async () => {
    if (!session) return;

    try {
      const res = await api.post("/lab/hint", null, {
        params: { session_id: session.session_id },
      });
      setHint(res.data.hint);
    } catch (error) {
      alert(error.response?.data?.detail || "No hints available");
    }
  };

  // 🔐 Submit Password
  const submitPassword = async () => {
    if (!password.trim()) {
      alert("Enter a password first");
      return;
    }

    try {
      const res = await api.post("/submission/submit", null, {
        params: {
          session_id: session.session_id,
          submitted_password: password,
        },
      });

      setResult(res.data);
      setLabActive(false);
    } catch (error) {
      alert("Submission failed");
    }
  };

  // ⏳ Timer Expire
  const handleTimeExpire = () => {
    alert("Time expired");
    setLabActive(false);
    navigate("/analytics");
  };

  if (loading) return <p style={{ padding: 30 }}>Starting Lab...</p>;

  return (
    <div style={{ padding: 30 }}>
      <h2>Password Cracking Lab ({difficulty})</h2>

      {/* Timer */}
      {labActive && (
        <div style={{ marginTop: 20 }}>
          <Timer duration={600} onExpire={handleTimeExpire} />
        </div>
      )}

      {/* Lab Workspace */}
      {session && labActive && (
        <div style={{ display: "flex", gap: 30, marginTop: 20 }}>
          
          {/* LEFT SIDE */}
          <div style={{ flex: 2 }}>
            <h4>Target Hash</h4>
            <p style={{ wordBreak: "break-all" }}>
              {session.target_hash}
            </p>

            <Terminal
              sessionId={session.session_id}
              onStepUpdate={setCurrentStep}
            />

            <div style={{ marginTop: 10 }}>
              <input
                type="text"
                placeholder="Enter cracked password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                onClick={submitPassword}
                style={{ marginLeft: 10 }}
              >
                Submit
              </button>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div style={{ flex: 1 }}>
            <InstructionPanel
              difficulty={difficulty}
              currentStep={currentStep}
              hint={hint}
            />

            {difficulty === "intermediate" && (
              <button
                onClick={requestHint}
                style={{ marginTop: 10 }}
              >
                Get Hint
              </button>
            )}
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div style={{ marginTop: 30 }}>
          <ScoreCard
            score={result.score}
            attempts={result.attempts}
            time={result.time_taken}
          />
        </div>
      )}
    </div>
  );
}