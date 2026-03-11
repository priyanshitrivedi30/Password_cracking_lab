// welcome.jsx — Full-screen immersive landing page
// Aesthetic: Dark cyber-terminal with matrix rain, scanlines, glitch effects

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function MatrixRain() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const chars = "アイウエオカキクケコ0123456789ABCDEF♠♣";
    const fontSize = 13;
    let cols = Math.floor(canvas.width / fontSize);
    let drops = Array(cols).fill(1);
    const draw = () => {
      ctx.fillStyle = "rgba(7,12,25,0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      cols = Math.floor(canvas.width / fontSize);
      if (drops.length !== cols) drops = Array(cols).fill(1);
      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const opacity = Math.random() > 0.95 ? 1 : 0.12 + Math.random() * 0.25;
        ctx.fillStyle = `rgba(0,255,180,${opacity})`;
        ctx.font = `${fontSize}px monospace`;
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };
    const interval = setInterval(draw, 45);
    return () => { clearInterval(interval); window.removeEventListener("resize", resize); };
  }, []);
  return (
    <canvas ref={canvasRef} style={{
      position: "fixed", inset: 0, width: "100%", height: "100%",
      opacity: 0.3, zIndex: 0, pointerEvents: "none",
    }} />
  );
}

function StatCounter({ value, label, delay = 0 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      let start = 0;
      const target = parseInt(value.replace(/\D/g, "")) || 0;
      if (!target) { setCount(value); return; }
      const step = Math.ceil(target / 40);
      const interval = setInterval(() => {
        start += step;
        if (start >= target) { setCount(target); clearInterval(interval); }
        else setCount(start);
      }, 30);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);
  const suffix = value.replace(/[\d]/g, "");
  return (
    <div style={{ textAlign: "center", minWidth: 100 }}>
      <div style={{
        fontSize: "clamp(26px, 3.5vw, 44px)", fontWeight: 800,
        fontFamily: "'Courier New', monospace",
        background: "linear-gradient(135deg, #00ffcc, #00bfff)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1,
      }}>{typeof count === "number" ? count : value}{suffix}</div>
      <div style={{ fontSize: 10, color: "#334155", letterSpacing: "2px", textTransform: "uppercase", marginTop: 6, fontFamily: "monospace" }}>{label}</div>
    </div>
  );
}

function GlitchText({ text }) {
  const [g, setG] = useState(false);
  useEffect(() => {
    const i = setInterval(() => { setG(true); setTimeout(() => setG(false), 180); }, 3500 + Math.random() * 3000);
    return () => clearInterval(i);
  }, []);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      {text}
      {g && <>
        <span style={{ position: "absolute", inset: 0, color: "#ff0055", clipPath: "polygon(0 25%,100% 25%,100% 45%,0 45%)", transform: "translateX(-4px)", opacity: 0.8 }}>{text}</span>
        <span style={{ position: "absolute", inset: 0, color: "#00ffcc", clipPath: "polygon(0 60%,100% 60%,100% 78%,0 78%)", transform: "translateX(4px)", opacity: 0.8 }}>{text}</span>
      </>}
    </span>
  );
}

function FeatureCard({ icon, title, desc, delay, accent = "#00bfff" }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div
      style={{
        background: "rgba(0,191,255,0.03)", border: `1px solid rgba(0,191,255,0.1)`,
        borderRadius: 12, padding: "24px 20px",
        opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(24px)",
        transition: "all 0.6s ease, background 0.2s, border-color 0.2s, transform 0.2s",
        cursor: "default", position: "relative", overflow: "hidden",
      }}
      onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,191,255,0.08)"; e.currentTarget.style.borderColor = "rgba(0,191,255,0.35)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,191,255,0.03)"; e.currentTarget.style.borderColor = "rgba(0,191,255,0.1)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ position: "absolute", top: 0, right: 0, width: 36, height: 36, borderTop: "2px solid rgba(0,255,204,0.25)", borderRight: "2px solid rgba(0,255,204,0.25)", borderTopRightRadius: 12 }} />
      <div style={{ fontSize: 26, marginBottom: 12 }}>{icon}</div>
      <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 14, marginBottom: 8, fontFamily: "'Courier New', monospace" }}>{title}</div>
      <div style={{ color: "#475569", fontSize: 13, lineHeight: 1.65 }}>{desc}</div>
    </div>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; }
  @keyframes pulse-glow {
    0%,100% { box-shadow: 0 0 20px rgba(0,191,255,0.35), 0 0 50px rgba(0,191,255,0.12); }
    50%      { box-shadow: 0 0 35px rgba(0,191,255,0.55), 0 0 80px rgba(0,191,255,0.22); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes cursor-blink { 0%,100% { opacity:1; } 50% { opacity:0; } }
  @keyframes fadeInUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }

  .enter-btn {
    display: inline-flex; align-items: center; gap: 12px;
    padding: 18px 52px; font-size: 14px; font-weight: 700;
    font-family: 'Courier New', monospace; letter-spacing: 3px; text-transform: uppercase;
    color: #000;
    background: linear-gradient(90deg, #00ffcc, #00bfff, #a78bfa, #00bfff, #00ffcc);
    background-size: 300% auto;
    border: none; border-radius: 4px; cursor: pointer;
    animation: shimmer 3s linear infinite, pulse-glow 2s ease-in-out infinite;
    transition: transform 0.2s, letter-spacing 0.2s;
    position: relative; overflow: hidden;
  }
  .enter-btn:hover { transform: scale(1.05); letter-spacing: 4px; }
  .enter-btn::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
    transform: translateX(-100%); transition: transform 0.5s;
  }
  .enter-btn:hover::after { transform: translateX(100%); }

  .blink { animation: cursor-blink 1s step-end infinite; }
  .scanlines {
    position: fixed; inset: 0; pointer-events: none; z-index: 1;
    background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px);
  }
  .hex-grid {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image: linear-gradient(rgba(0,191,255,0.025) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(0,191,255,0.025) 1px, transparent 1px);
    background-size: 60px 60px;
  }
`;

export default function Welcome() {
  const navigate = useNavigate();
  const [typed, setTyped] = useState("");
  const [ready, setReady] = useState(false);
  const full = "INITIALIZING SECURE ENVIRONMENT...";

  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      if (i <= full.length) { setTyped(full.slice(0, i)); i++; }
      else { clearInterval(iv); setTimeout(() => setReady(true), 300); }
    }, 38);
    return () => clearInterval(iv);
  }, []);

  const corner = (pos) => {
    const styles = {
      "tl": { top: 20, left: 20, borderTop: "2px solid #00bfff", borderLeft: "2px solid #00bfff" },
      "tr": { top: 20, right: 20, borderTop: "2px solid #00bfff", borderRight: "2px solid #00bfff" },
      "bl": { bottom: 20, left: 20, borderBottom: "2px solid #00bfff", borderLeft: "2px solid #00bfff" },
      "br": { bottom: 20, right: 20, borderBottom: "2px solid #00bfff", borderRight: "2px solid #00bfff" },
    }[pos];
    return <div style={{ position: "fixed", width: 28, height: 28, opacity: 0.45, zIndex: 5, ...styles }} />;
  };

  return (
    <>
      <style>{css}</style>
      <div style={{ background: "#070c19", minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>

        {/* Background layers */}
        <div className="hex-grid" />
        <MatrixRain />
        <div className="scanlines" />

        {/* Radial center glow */}
        <div style={{
          position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: "80vw", height: "80vh", pointerEvents: "none", zIndex: 0,
          background: "radial-gradient(ellipse, rgba(0,191,255,0.07) 0%, transparent 65%)",
        }} />

        {/* Corner brackets */}
        {corner("tl")}{corner("tr")}{corner("bl")}{corner("br")}

        {/* ── TOP NAV ── */}
        <nav style={{
          position: "relative", zIndex: 4,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 32px",
          borderBottom: "1px solid rgba(0,191,255,0.07)",
          background: "rgba(7,12,25,0.85)", backdropFilter: "blur(12px)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>🔐</span>
            <div>
              <div style={{ color: "#00bfff", fontWeight: 700, fontSize: 13, fontFamily: "'Courier New', monospace" }}>CYBERCARE</div>
              <div style={{ color: "#1e3a5f", fontSize: 9, letterSpacing: "2.5px", fontFamily: "monospace", textTransform: "uppercase" }}>Security Lab</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[["🛡", "Isolated Env"], ["🔑", "No Real Creds"], ["📚", "Edu Only"]].map(([ico, t]) => (
              <span key={t} style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "4px 10px", borderRadius: 20,
                fontSize: 10, fontFamily: "monospace", letterSpacing: "1.5px",
                color: "#00ffcc", border: "1px solid rgba(0,255,204,0.18)",
                background: "rgba(0,255,204,0.04)", textTransform: "uppercase",
              }}>
                <span>{ico}</span>{t}
              </span>
            ))}
          </div>
        </nav>

        {/* ── HERO ── */}
        <div style={{
          flex: 1, position: "relative", zIndex: 3,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "48px 24px 32px", textAlign: "center",
        }}>

          {/* Terminal typing */}
          <div style={{ fontFamily: "monospace", fontSize: 11, color: "#00ffcc", letterSpacing: "2.5px", marginBottom: 36, opacity: 0.65 }}>
            {typed}<span className="blink" style={{ color: "#00ffcc" }}>█</span>
          </div>

          {/* Heading */}
          <div style={{
            opacity: ready ? 1 : 0, transform: ready ? "translateY(0)" : "translateY(24px)",
            transition: "all 0.9s ease",
          }}>
            <h1 style={{
              fontSize: "clamp(52px, 9vw, 108px)",
              fontWeight: 900, lineHeight: 0.95, margin: 0,
              fontFamily: "'Share Tech Mono', 'Courier New', monospace",
              color: "#ffffff", textShadow: "0 0 60px rgba(0,191,255,0.2)",
            }}>
              <GlitchText text="PASSWORD" />
            </h1>
            <h1 style={{
              fontSize: "clamp(52px, 9vw, 108px)",
              fontWeight: 900, lineHeight: 0.95, margin: "4px 0",
              fontFamily: "'Share Tech Mono', 'Courier New', monospace",
              background: "linear-gradient(135deg, #00ffcc 0%, #00bfff 40%, #a78bfa 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              CRACKING
            </h1>
            <h1 style={{
              fontSize: "clamp(52px, 9vw, 108px)",
              fontWeight: 900, lineHeight: 0.95, marginBottom: 32,
              fontFamily: "'Share Tech Mono', 'Courier New', monospace",
              color: "rgba(255,255,255,0.85)",
            }}>
              LAB
            </h1>
          </div>

          {/* Subtitle */}
          <p style={{
            maxWidth: 520, fontSize: "clamp(14px, 1.8vw, 17px)",
            color: "#4a5568", lineHeight: 1.85, marginBottom: 44,
            opacity: ready ? 1 : 0, transform: ready ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.9s ease 0.18s",
          }}>
            A hands-on environment to learn how password attacks work —
            so you can build <span style={{ color: "#00ffcc", fontWeight: 600 }}>stronger defenses</span>.
          </p>

          {/* CTA */}
          <div style={{ opacity: ready ? 1 : 0, transition: "opacity 0.9s ease 0.35s", marginBottom: 52 }}>
            <button className="enter-btn" onClick={() => navigate("/login")}>
              <span>⚡</span><span>ENTER LAB</span><span>→</span>
            </button>
            <div style={{ marginTop: 14, fontSize: 11, fontFamily: "monospace", letterSpacing: "1.5px", color: "#1e3a5f" }}>
              NEW HERE?&nbsp;
              <span onClick={() => navigate("/register")} style={{ color: "#00bfff", cursor: "pointer", textDecoration: "underline" }}>
                REGISTER FREE
              </span>
            </div>
          </div>

          {/* Stats */}
          <div style={{
            display: "flex", gap: "clamp(20px, 5vw, 64px)", justifyContent: "center",
            flexWrap: "wrap", padding: "24px clamp(20px, 5vw, 56px)",
            background: "rgba(0,191,255,0.03)", border: "1px solid rgba(0,191,255,0.08)",
            borderRadius: 14, maxWidth: 680, width: "100%",
            opacity: ready ? 1 : 0, transform: ready ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.9s ease 0.5s",
          }}>
            <StatCounter value="3" label="Difficulty Modes" delay={900} />
            <div style={{ width: 1, background: "rgba(0,191,255,0.1)", alignSelf: "stretch" }} />
            <StatCounter value="11" label="Learning Cards" delay={1100} />
            <div style={{ width: 1, background: "rgba(0,191,255,0.1)", alignSelf: "stretch" }} />
            <StatCounter value="10" label="Min Per Session" delay={1300} />
            <div style={{ width: 1, background: "rgba(0,191,255,0.1)", alignSelf: "stretch" }} />
            <StatCounter value="100%" label="Isolated & Safe" delay={1500} />
          </div>
        </div>

        {/* ── FEATURE CARDS ── */}
        <div style={{
          position: "relative", zIndex: 3,
          padding: "0 clamp(16px, 5vw, 72px) 48px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: 14, maxWidth: 1200, margin: "0 auto", width: "100%",
        }}>
          <FeatureCard delay={950}  icon="🔒" title="Isolated Container"  desc="Each session runs in a locked-down Docker container. No internet access, no escape." />
          <FeatureCard delay={1150} icon="🎯" title="3 Attack Types"      desc="Dictionary, hybrid, and brute-force attacks on MD5, SHA-256, and bcrypt hashes." />
          <FeatureCard delay={1350} icon="📊" title="Live Scoring"        desc="Real-time score tracking. Hints and wrong attempts affect your final result." />
          <FeatureCard delay={1550} icon="🏆" title="Leaderboard"         desc="See how your cracking speed compares across beginner, intermediate, and advanced." />
        </div>

        {/* ── FOOTER BAR ── */}
        <div style={{
          position: "relative", zIndex: 4, flexShrink: 0,
          borderTop: "1px solid rgba(0,191,255,0.07)",
          padding: "12px 32px",
          background: "rgba(7,12,25,0.85)", backdropFilter: "blur(12px)",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8,
        }}>
          <div style={{ color: "#1a2744", fontSize: 10, fontFamily: "monospace", letterSpacing: "1.5px" }}>
            ⚠ FOR EDUCATIONAL PURPOSES ONLY — DO NOT USE ON UNAUTHORIZED SYSTEMS
          </div>
          <div style={{ color: "#1a2744", fontSize: 10, fontFamily: "monospace" }}>
            CYBERCARE LAB v1.0 · 2026
          </div>
        </div>
      </div>
    </>
  );
}