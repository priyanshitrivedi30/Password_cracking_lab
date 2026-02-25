import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Overview() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    async function loadOverview() {
      try {
        const res = await api.get("/overview");
        setData(res.data);
      } catch (err) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        navigate("/");
      } finally {
        setLoading(false);
      }
    }

    loadOverview();
  }, [navigate]);

  if (loading) return <p style={{ color: "white", padding: 30 }}>Loading...</p>;
  if (!data) return <p style={{ color: "red" }}>Failed to load overview</p>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Password Cracking – Lab Overview</h2>

        <p>{data.purpose}</p>

        {/* Learning Outcomes */}
        <h3>Learning Outcomes</h3>
        <ul>
          {data.learning_outcomes.map((o, i) => (
            <li key={i}>{o}</li>
          ))}
        </ul>

        {/* How It Works */}
        <h3>How Password Cracking Works</h3>
        {data.how_password_cracking_works.map(step => (
          <p key={step.step}>
            <strong>{step.step}. {step.title}</strong><br />
            {step.description}
          </p>
        ))}

        {/* Hash Types */}
        <h3>Hash Types</h3>
        {data.hash_types.map(h => (
          <p key={h.name}>
            <strong>{h.name}</strong> – {h.strength}<br />
            <em>{h.reason}</em>
          </p>
        ))}

        {/* Attack Types */}
        <h3>Attack Types</h3>
        {data.attack_types.map(a => (
          <div key={a.name} style={{ marginBottom: 10 }}>
            <strong>{a.name}</strong><br />
            {a.description}<br />
            <em>Used when: {a.used_when}</em>
          </div>
        ))}

        {/* Tools */}
        <h3>Tools</h3>
        {data.tools.map(t => (
          <div key={t.name} style={{ marginBottom: 20 }}>
            <strong>{t.name}</strong> – {t.type}
            <p>{t.description}</p>
            <p><b>How it works:</b> {t.how_it_works}</p>

            <b>Features:</b>
            <ul>
              {t.features?.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>

            {t.common_commands && (
              <>
                <b>Common Commands:</b>
                <ul>
                  {t.common_commands.map((cmd, i) => (
                    <li key={i}>{cmd}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ))}

        {/* Difficulty Modes Info Only */}
        <h3>Difficulty Modes</h3>
        {Object.values(data.difficulty_modes).map((mode, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <strong>{mode.mode}</strong><br />
            {mode.description}<br />
            <em>Recommended for: {mode.recommended_for}</em>
          </div>
        ))}

        {/* Scoring */}
        <h3>Scoring Factors</h3>
        <ul>
          {data.scoring_factors.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>

        {/* Common Mistakes */}
        <h3>Common Mistakes</h3>
        <ul>
          {data.common_mistakes.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>

        {/* Safety */}
        <h3>Safety</h3>
        <p>{data.safety.environment}</p>

        <b>Blocked Actions:</b>
        <ul>
          {data.safety.blocked_actions.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>

        <b>Allowed Actions:</b>
        <ul>
          {data.safety.allowed_actions.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>

        {/* Legal */}
        <h3>Legal Notice</h3>
        <p>{data.legal_notice}</p>

        {/* Continue Button */}
        <button
          style={styles.button}
          onClick={() => navigate("/labinfo")}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#0a0f1c",
    display: "flex",
    justifyContent: "center",
    padding: 30,
  },
  card: {
    background: "#111827",
    color: "white",
    padding: 30,
    maxWidth: 900,
    borderRadius: 10,
    boxShadow: "0 0 20px #1e3a8a",
  },
  button: {
    marginTop: 30,
    width: "100%",
    padding: 12,
    background: "#2563eb",
    border: "none",
    color: "white",
    borderRadius: 6,
    fontWeight: "bold",
    cursor: "pointer",
  },
};