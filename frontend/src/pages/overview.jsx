// pages/overview.jsx
// 11 info cards per spec, card-grid UI style
// On completion → marks overview as done, navigates to /labinfo

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import SidePanel from "../components/sidepanel";
import { getOverview } from "../api/overview";

const styles = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .ov-card {
    background: #0d1526;
    border: 1px solid #1e293b;
    border-radius: 14px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    transition: border-color 0.2s, transform 0.2s;
    animation: fadeUp 0.4s ease both;
  }
  .ov-card:hover {
    border-color: #00bfff44;
    transform: translateY(-3px);
  }
  .ov-card-icon {
    width: 44px; height: 44px;
    border-radius: 10px;
    background: rgba(0,191,255,0.08);
    border: 1px solid rgba(0,191,255,0.15);
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
    flex-shrink: 0;
  }
  .ov-tag {
    display: inline-block;
    padding: 2px 10px;
    background: rgba(0,255,200,0.08);
    border: 1px solid rgba(0,255,200,0.2);
    border-radius: 100px;
    color: #00ffcc;
    font-size: 11px;
    margin-right: 6px;
    margin-bottom: 4px;
  }
  .ov-code {
    display: block;
    background: #020617;
    color: #00ffcc;
    font-family: monospace;
    font-size: 12px;
    padding: 6px 12px;
    border-radius: 6px;
    margin-bottom: 4px;
  }
  .continue-btn {
    padding: 14px 0;
    width: 100%;
    background: linear-gradient(135deg, #00bfff, #00e5ff);
    color: #000;
    border: none;
    border-radius: 10px;
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
    transition: filter 0.15s, transform 0.15s;
  }
  .continue-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
`;

// Static card definitions — same data your backend returns but defined here
// so page renders instantly even before API responds
const STATIC_CARDS = [
  {
    id: "purpose",
    icon: "🎯",
    title: "Purpose",
    color: "#00bfff",
    content: "This lab teaches you how attackers crack weak passwords using real tools like John the Ripper and Hashcat. The goal is to understand vulnerabilities so you can build stronger defenses — not to exploit real systems.",
  },
  {
    id: "outcomes",
    icon: "📚",
    title: "Learning Outcomes",
    color: "#00ffcc",
    items: [
      "Understand how MD5, SHA-256, and bcrypt hashing works",
      "Run dictionary and brute-force attacks using john and hashcat",
      "Analyze why weak or common passwords fail instantly",
      "Understand how salt protects passwords in modern systems",
      "Build habits for creating uncrackable passwords",
    ],
  },
  {
    id: "how_it_works",
    icon: "⚙️",
    title: "How Password Cracking Works",
    color: "#a78bfa",
    content: "An attacker gets a stolen hash and tries to reverse it by hashing thousands of guesses and comparing. They never \"decrypt\" — they just find a password that produces the same hash. This is why hashing algorithms and salt matter so much.",
  },
  {
    id: "hash_types",
    icon: "🔑",
    title: "Hash Types",
    color: "#00bfff",
    items: [
      "MD5 — Fast, broken. A GPU can test billions per second. Never use for passwords.",
      "SHA-256 — Stronger but still fast. Better for data integrity than passwords.",
      "bcrypt — Slow by design. Uses work factor + salt. The right choice for passwords.",
    ],
  },
  {
    id: "attack_types",
    icon: "⚔️",
    title: "Attack Types",
    color: "#f87171",
    items: [
      "Dictionary Attack — Try every word in a wordlist (rockyou.txt). Fast, effective against common passwords.",
      "Brute-Force — Try every possible combination. Very slow but exhaustive.",
      "Hybrid Attack — Dictionary word + numbers/symbols (e.g. password123!).",
      "Rule-Based — Apply transformations to wordlist (capitalize, add digits, etc).",
    ],
  },
  {
    id: "tools",
    icon: "🛠️",
    title: "Tools",
    color: "#00ffcc",
    items: [
      "John the Ripper — Classic Unix cracker. Great for beginners. Auto-detects hash type.",
      "Hashcat — GPU-accelerated. World's fastest password recovery tool. Used in Intermediate & Advanced.",
    ],
    commands: [
      "john --wordlist=rockyou.txt hash.txt",
      "hashcat -m 0 hash.txt rockyou.txt",
    ],
  },
  {
    id: "difficulty",
    icon: "📊",
    title: "Difficulty Modes",
    color: "#fbbf24",
    items: [
      "🟢 Beginner — MD5 hash. Fully guided steps. Commands shown. Best for learning.",
      "🟡 Intermediate — SHA-256. Hint-based. You choose commands. Up to 5 hints (penalty after 3).",
      "🔴 Advanced — bcrypt. Free mode. No hints, no steps. Pure skill.",
    ],
  },
  {
    id: "scoring",
    icon: "🏆",
    title: "Scoring",
    color: "#fbbf24",
    items: [
      "Beginner: base 50 pts — time penalty — attempt penalty",
      "Intermediate: base 100 pts — penalties — hint penalty (-5 per hint after 3rd)",
      "Advanced: base 200 pts — time penalty — attempt penalty",
    ],
  },
  {
    id: "mistakes",
    icon: "⚠️",
    title: "Common Mistakes",
    color: "#f87171",
    items: [
      "Forgetting to specify the wordlist path — john needs --wordlist",
      "Using -m 0 in hashcat for a SHA-256 hash (should be -m 1400)",
      "Running commands outside the lab terminal — won't work, blocked by policy",
      "Submitting the hash instead of the cracked plaintext password",
    ],
  },
  {
    id: "safety",
    icon: "🛡️",
    title: "Safety & Sandbox",
    color: "#00ffcc",
    content: "All cracking runs inside a Docker container with no network access. Dangerous commands (rm, wget, curl, sudo) are blocked. Every command is logged. Your session is isolated — you cannot affect other users or real systems.",
  },
  {
    id: "legal",
    icon: "⚖️",
    title: "Legal Notice",
    color: "#f87171",
    content: "Use of these techniques outside this lab without explicit written permission is illegal under the Computer Fraud and Abuse Act (CFAA) and equivalent laws worldwide. This lab is strictly for authorized educational use. Violation may result in criminal charges.",
  },
];

// ── Helpers ──────────────────────────────────────────────────

function TextBlock({ text }) {
  if (!text || typeof text !== "string") return null;
  return <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.75, margin: 0 }}>{text}</p>;
}

function BulletList({ items, color = "#00bfff" }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: "flex", gap: 10, color: "#94a3b8", fontSize: 13, lineHeight: 1.6 }}>
          <span style={{ color, flexShrink: 0 }}>›</span>
          <span>{typeof item === "string" ? item : JSON.stringify(item)}</span>
        </li>
      ))}
    </ul>
  );
}

function StepList({ steps }) {
  if (!Array.isArray(steps)) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span style={{
            minWidth: 24, height: 24, borderRadius: "50%",
            background: "rgba(0,191,255,0.12)", border: "1px solid #00bfff44",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, color: "#00bfff", fontWeight: 700, flexShrink: 0,
          }}>{s.step || i + 1}</span>
          <div>
            {s.title && <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{s.title}</div>}
            {s.description && <div style={{ color: "#64748b", fontSize: 12, lineHeight: 1.6 }}>{s.description}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function ItemCards({ items, labelKey = "name" }) {
  if (!Array.isArray(items)) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((item, i) => (
        <div key={i} style={{
          background: "#080d1a", border: "1px solid #1a2744",
          borderRadius: 8, padding: "12px 14px",
        }}>
          {item[labelKey] && (
            <div style={{ color: "#00ffcc", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
              {item[labelKey]}
              {item.type && <span style={{ color: "#334155", fontWeight: 400, fontSize: 11, marginLeft: 8 }}>({item.type})</span>}
              {item.used_in && <span style={{ color: "#334155", fontWeight: 400, fontSize: 11, marginLeft: 8 }}>— {item.used_in}</span>}
              {item.strength && <span style={{ color: "#334155", fontWeight: 400, fontSize: 11, marginLeft: 8 }}>· {item.strength}</span>}
            </div>
          )}
          {item.label && !item[labelKey] && (
            <div style={{ color: "#00ffcc", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{item.label}</div>
          )}
          {item.description && <div style={{ color: "#64748b", fontSize: 12, lineHeight: 1.6 }}>{item.description}</div>}
          {item.reason && <div style={{ color: "#475569", fontSize: 11, marginTop: 4 }}>{item.reason}</div>}
          {item.why && <div style={{ color: "#475569", fontSize: 11, marginTop: 4 }}>Why: {item.why}</div>}
          {item.how_it_works && <div style={{ color: "#475569", fontSize: 11, marginTop: 4 }}>How: {item.how_it_works}</div>}
          {item.best_against && <div style={{ color: "#475569", fontSize: 11, marginTop: 4 }}>Best against: {item.best_against}</div>}
          {item.common_commands && (
            <div style={{ marginTop: 8 }}>
              {item.common_commands.map((cmd, ci) => (
                <code key={ci} className="ov-code">{cmd}</code>
              ))}
            </div>
          )}
          {item.used_in_levels && (
            <div style={{ marginTop: 4, fontSize: 11, color: "#334155" }}>
              Used in: {item.used_in_levels.join(", ")}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function MistakeList({ mistakes }) {
  if (!Array.isArray(mistakes)) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {mistakes.map((m, i) => (
        <div key={i} style={{ background: "#080d1a", border: "1px solid #2d1f1f", borderRadius: 8, padding: "10px 14px" }}>
          <div style={{ color: "#f87171", fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
            ✗ {m.mistake}
          </div>
          {m.why && <div style={{ color: "#64748b", fontSize: 12 }}>{m.why}</div>}
        </div>
      ))}
    </div>
  );
}

function ScoringBlock({ content }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {content.base_points && (
        <div>
          <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 6 }}>Base Points</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {Object.entries(content.base_points).map(([k, v]) => (
              <div key={k} style={{
                padding: "6px 14px", borderRadius: 8,
                background: "rgba(0,191,255,0.07)", border: "1px solid #00bfff22",
                fontSize: 13,
              }}>
                <span style={{ color: "#475569", textTransform: "capitalize" }}>{k}: </span>
                <span style={{ color: "#00bfff", fontWeight: 700 }}>{v} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {content.penalties && (
        <div>
          <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 6 }}>Penalties</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {content.penalties.map((p, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "#64748b" }}>{p.condition}</span>
                <span style={{ color: "#f87171", fontWeight: 600 }}>{p.penalty}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {content.note && <TextBlock text={content.note} />}
    </div>
  );
}

function SafetyBlock({ content }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
      {content.environment && (
        <div><span style={{ color: "#475569" }}>Environment: </span><span style={{ color: "#94a3b8" }}>{content.environment}</span></div>
      )}
      {content.network && (
        <div><span style={{ color: "#475569" }}>Network: </span><span style={{ color: "#94a3b8" }}>{content.network}</span></div>
      )}
      {content.blocked_commands && (
        <div>
          <div style={{ color: "#475569", marginBottom: 4 }}>Blocked commands:</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {content.blocked_commands.map((cmd, i) => (
              <code key={i} style={{ background: "#2d1f1f", color: "#f87171", padding: "2px 8px", borderRadius: 4, fontSize: 11 }}>{cmd}</code>
            ))}
          </div>
        </div>
      )}
      {content.allowed_commands && (
        <div>
          <div style={{ color: "#475569", marginBottom: 4 }}>Allowed commands:</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {content.allowed_commands.map((cmd, i) => (
              <code key={i} style={{ background: "#001a0f", color: "#00ffcc", padding: "2px 8px", borderRadius: 4, fontSize: 11 }}>{cmd}</code>
            ))}
          </div>
        </div>
      )}
      {content.auto_cleanup && (
        <div><span style={{ color: "#475569" }}>Cleanup: </span><span style={{ color: "#94a3b8" }}>{content.auto_cleanup}</span></div>
      )}
    </div>
  );
}

function LegalBlock({ content }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {content.disclaimer && <TextBlock text={content.disclaimer} />}
      {content.prohibited && (
        <div>
          <div style={{ color: "#f87171", fontSize: 12, marginBottom: 6 }}>Prohibited:</div>
          <BulletList items={content.prohibited} color="#f87171" />
        </div>
      )}
      {content.user_responsibility && <TextBlock text={content.user_responsibility} />}
      {content.legal_notice && (
        <div style={{ background: "#1a0a0a", border: "1px solid #f8717122", borderRadius: 8, padding: "10px 14px" }}>
          <TextBlock text={content.legal_notice} />
        </div>
      )}
    </div>
  );
}

// ── Main CardContent dispatcher ──────────────────────────────
function CardContent({ card }) {
  const c = card.content;
  if (!c) return null;

  // Route to the right renderer based on content shape
  if (c.text)        return <TextBlock text={c.text} />;
  if (c.outcomes)    return <BulletList items={c.outcomes} />;
  if (c.steps)       return <StepList steps={c.steps} />;
  if (c.hashes)      return <ItemCards items={c.hashes} />;
  if (c.attacks)     return <ItemCards items={c.attacks} />;
  if (c.tools)       return <ItemCards items={c.tools} />;
  if (c.modes)       return <ItemCards items={c.modes} labelKey="label" />;
  if (c.base_points) return <ScoringBlock content={c} />;
  if (c.mistakes)    return <MistakeList mistakes={c.mistakes} />;
  if (c.environment) return <SafetyBlock content={c} />;
  if (c.disclaimer)  return <LegalBlock content={c} />;

  // Fallback: plain string
  if (typeof c === "string") return <TextBlock text={c} />;

  // Last resort: render nothing rather than crash
  return null;
}

export default function Overview() {
  const navigate = useNavigate();
  const [cards, setCards]     = useState(STATIC_CARDS);
  const [loading, setLoading] = useState(false);

  const getCompleted = () => {
    try { return JSON.parse(localStorage.getItem("lab_progress") || "{}"); }
    catch { return {}; }
  };
  const [completed, setCompleted] = useState(getCompleted);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    setLoading(true);
    getOverview()
      .then((data) => { if (data?.cards?.length) setCards(data.cards); })
      .catch(() => { /* keep static */ })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleContinue = () => {
    const prev = getCompleted();
    const next = { ...prev, overview: true };
    localStorage.setItem("lab_progress", JSON.stringify(next));
    setCompleted(next);
    navigate("/labinfo");
  };

  return (
    <>
      <style>{styles}</style>
      <div style={{ minHeight: "100vh", background: "#080d1a", color: "#e2e8f0", display: "flex", flexDirection: "column" }}>

        <Navbar />

        {/* ── Side-by-side layout ── */}
        <div style={{ display: "flex", flex: 1 }}>

          {/* Permanent sidebar */}
          <SidePanel completed={completed} />

          {/* Main content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "36px 28px 60px" }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ color: "#00ffcc", fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8, fontFamily: "monospace" }}>
              Step 1 of 3
            </div>
            <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800, margin: "0 0 8px" }}>
              Lab Overview
            </h1>
            <p style={{ color: "#475569", fontSize: 14, margin: 0 }}>
              Read through all sections before continuing to the consent form.
            </p>
          </div>

          {/* Card grid — 2 columns on wide, 1 on narrow */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))",
            gap: 16,
            marginBottom: 32,
          }}>
            {cards.map((card, i) => (
              <div
                key={card.card_id || card.id || i}
                className="ov-card"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div className="ov-card-icon">{card.icon || "📋"}</div>
                  <div>
                    <h3 style={{ color: card.color || "#00bfff", fontSize: 15, fontWeight: 700, margin: 0 }}>
                      {card.title}
                    </h3>
                    {card.subtitle && (
                      <p style={{ color: "#334155", fontSize: 12, margin: "3px 0 0" }}>{card.subtitle}</p>
                    )}
                  </div>
                </div>
                <CardContent card={card} />
              </div>
            ))}
          </div>

          {/* Continue CTA */}
          <button className="continue-btn" onClick={handleContinue}>
            I've Read the Overview — Continue to Consent & Difficulty →
          </button>
          </div>{/* end main content */}
        </div>{/* end flex row */}
      </div>
    </>
  );
}