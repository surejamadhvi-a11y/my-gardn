import { useState } from "react";
import { useGarden } from "./GardenContext";

const ENVIRONMENTS = ["Indoor apartment", "Low-light apartment", "Balcony / terrace", "Backyard garden", "Rooftop", "Greenhouse"];
const EXPERIENCES  = ["Beginner", "Intermediate", "Expert"];
const PET_OPTIONS  = ["No pets", "Has a dog 🐶", "Has a cat 🐱", "Has both 🐶🐱", "Other pets"];

const G = {
  green:      "#5A8A5A",
  greenLight: "#EAF2EA",
  greenDark:  "#3D6B3D",
  cream:      "#F7F5F2",
  border:     "#E8E4DF",
  text:       "#1A1A1A",
  muted:      "#7A7A72",
};

function ProgressBar({ step, total }) {
  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 28 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 3, borderRadius: 4,
          background: i <= step ? G.green : G.border,
          transition: "background 0.3s",
        }} />
      ))}
    </div>
  );
}

function OptionButton({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", textAlign: "left",
        padding: "13px 16px", borderRadius: 14,
        border: `2px solid ${selected ? G.green : G.border}`,
        background: selected ? G.greenLight : "#fff",
        color: G.text, fontSize: 14, fontWeight: selected ? 600 : 400,
        fontFamily: "Inter, sans-serif", cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );
}

export default function Onboarding() {
  const { updateProfile, setOnboarded } = useGarden();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "", location: "",
    environment: "", experience: "", pets: "",
  });

  const TOTAL_STEPS = 4; // steps 1–4 (0 is welcome)

  function next() { setStep(s => s + 1); }
  function back() { setStep(s => s - 1); }

  function finish() {
    updateProfile({
      name:        form.name.trim() || "Gardener",
      location:    form.location.trim(),
      experience:  form.experience  || "Beginner",
      environment: form.environment || "Not specified",
      pets:        form.pets        || "No pets",
    });
    setOnboarded();
  }

  const btn = (label, onClick, disabled = false) => (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%", padding: "15px", borderRadius: 14, border: "none",
        background: disabled ? G.border : G.green,
        color: disabled ? G.muted : "#fff",
        fontSize: 15, fontWeight: 600, fontFamily: "Inter, sans-serif",
        cursor: disabled ? "default" : "pointer",
        boxShadow: disabled ? "none" : "0 4px 16px rgba(90,138,90,0.28)",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );

  // ── Step 0: Welcome ───────────────────────────────────────────────────────
  if (step === 0) return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: G.cream, padding: "48px 28px 36px", fontFamily: "Inter, sans-serif" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>🌱</div>
        <h1 style={{ margin: "0 0 12px", fontSize: 28, fontWeight: 700, color: G.text, letterSpacing: "-0.5px", lineHeight: 1.2 }}>
          Welcome to<br /><span style={{ color: G.green }}>My Gardn</span>
        </h1>
        <p style={{ margin: 0, fontSize: 15, color: G.muted, lineHeight: 1.6, maxWidth: 280 }}>
          Your personal plant advisor. Let's set up your profile so we can give you advice that's tailored exactly to your space.
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {btn("Get started →", next)}
      </div>
    </div>
  );

  // ── Step 1: Name + Location ───────────────────────────────────────────────
  if (step === 1) return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: G.cream, padding: "32px 28px 36px", fontFamily: "Inter, sans-serif" }}>
      <ProgressBar step={0} total={TOTAL_STEPS} />
      <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, color: G.text }}>What's your name?</h2>
      <p style={{ margin: "0 0 28px", fontSize: 14, color: G.muted }}>We'll use this to personalise your experience.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: G.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Your name</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Madhvi"
            autoFocus
            style={{ width: "100%", padding: "13px 16px", borderRadius: 12, border: `1.5px solid ${G.border}`, background: "#fff", fontSize: 15, fontFamily: "Inter, sans-serif", outline: "none", boxSizing: "border-box" }}
            onFocus={e => e.target.style.borderColor = G.green}
            onBlur={e => e.target.style.borderColor = G.border}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: G.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Location <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
          <input
            type="text"
            value={form.location}
            onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            placeholder="e.g. Austin, TX"
            style={{ width: "100%", padding: "13px 16px", borderRadius: 12, border: `1.5px solid ${G.border}`, background: "#fff", fontSize: 15, fontFamily: "Inter, sans-serif", outline: "none", boxSizing: "border-box" }}
            onFocus={e => e.target.style.borderColor = G.green}
            onBlur={e => e.target.style.borderColor = G.border}
          />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
        {btn("Continue →", next, !form.name.trim())}
        <button onClick={back} style={{ background: "none", border: "none", color: G.muted, fontSize: 14, cursor: "pointer", fontFamily: "Inter, sans-serif", padding: "8px" }}>← Back</button>
      </div>
    </div>
  );

  // ── Step 2: Environment ───────────────────────────────────────────────────
  if (step === 2) return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: G.cream, padding: "32px 28px 36px", fontFamily: "Inter, sans-serif" }}>
      <ProgressBar step={1} total={TOTAL_STEPS} />
      <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, color: G.text }}>Where do you grow?</h2>
      <p style={{ margin: "0 0 20px", fontSize: 14, color: G.muted }}>This helps us give the right light and space advice.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, overflowY: "auto" }}>
        {ENVIRONMENTS.map(env => (
          <OptionButton key={env} label={env} selected={form.environment === env} onClick={() => setForm(f => ({ ...f, environment: env }))} />
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
        {btn("Continue →", next, !form.environment)}
        <button onClick={back} style={{ background: "none", border: "none", color: G.muted, fontSize: 14, cursor: "pointer", fontFamily: "Inter, sans-serif", padding: "8px" }}>← Back</button>
      </div>
    </div>
  );

  // ── Step 3: Experience ────────────────────────────────────────────────────
  if (step === 3) return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: G.cream, padding: "32px 28px 36px", fontFamily: "Inter, sans-serif" }}>
      <ProgressBar step={2} total={TOTAL_STEPS} />
      <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, color: G.text }}>How experienced are you?</h2>
      <p style={{ margin: "0 0 20px", fontSize: 14, color: G.muted }}>We'll calibrate our advice to your skill level.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        {EXPERIENCES.map(exp => (
          <OptionButton key={exp} label={exp} selected={form.experience === exp} onClick={() => setForm(f => ({ ...f, experience: exp }))} />
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
        {btn("Continue →", next, !form.experience)}
        <button onClick={back} style={{ background: "none", border: "none", color: G.muted, fontSize: 14, cursor: "pointer", fontFamily: "Inter, sans-serif", padding: "8px" }}>← Back</button>
      </div>
    </div>
  );

  // ── Step 4: Pets ──────────────────────────────────────────────────────────
  if (step === 4) return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: G.cream, padding: "32px 28px 36px", fontFamily: "Inter, sans-serif" }}>
      <ProgressBar step={3} total={TOTAL_STEPS} />
      <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, color: G.text }}>Any pets at home?</h2>
      <p style={{ margin: "0 0 20px", fontSize: 14, color: G.muted }}>We'll flag plants that could be harmful to them.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        {PET_OPTIONS.map(opt => (
          <OptionButton key={opt} label={opt} selected={form.pets === opt} onClick={() => setForm(f => ({ ...f, pets: opt }))} />
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
        {btn("Let's grow! 🌿", finish, !form.pets)}
        <button onClick={back} style={{ background: "none", border: "none", color: G.muted, fontSize: 14, cursor: "pointer", fontFamily: "Inter, sans-serif", padding: "8px" }}>← Back</button>
      </div>
    </div>
  );

  return null;
}
