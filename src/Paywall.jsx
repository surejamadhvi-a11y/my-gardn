import { useState } from "react";

const G = {
  green:      "#5A8A5A",
  greenLight: "#EAF2EA",
  greenDark:  "#3D6B3D",
  cream:      "#F7F5F2",
  border:     "#E8E4DF",
  text:       "#1A1A1A",
  muted:      "#888",
};

// ── Payment form step ────────────────────────────────────────────────────────

function formatCardNumber(val) {
  return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(val) {
  const digits = val.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

function PaymentForm({ plan, onSuccess, onBack }) {
  const [card, setCard]       = useState("");
  const [expiry, setExpiry]   = useState("");
  const [cvc, setCvc]         = useState("");
  const [name, setName]       = useState("");
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors]   = useState({});

  const price   = plan?.id === "annual" ? "$71.99/yr" : "$7.99/mo";
  const trial   = "7-day free trial";

  function validate() {
    const e = {};
    if (card.replace(/\s/g, "").length < 16) e.card = "Enter a valid 16-digit card number";
    if (expiry.length < 5) e.expiry = "Enter expiry as MM/YY";
    if (cvc.length < 3)    e.cvc    = "Enter 3-digit CVC";
    if (!name.trim())      e.name   = "Enter name as it appears on card";
    return e;
  }

  function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setProcessing(true);
    // Simulate payment processing — replace with real Stripe integration
    setTimeout(() => onSuccess(), 1800);
  }

  const field = (label, value, onChange, placeholder, extra = {}) => (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: G.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>{label}</label>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={processing}
        style={{
          width: "100%", padding: "12px 14px", borderRadius: 10, boxSizing: "border-box",
          border: `1.5px solid ${errors[extra.key] ? "#EF4444" : G.border}`,
          background: "#fff", fontSize: 15, fontFamily: "Inter, sans-serif", outline: "none",
          opacity: processing ? 0.6 : 1,
        }}
        onFocus={e => { e.target.style.borderColor = G.green; setErrors(er => ({ ...er, [extra.key]: undefined })); }}
        onBlur={e => e.target.style.borderColor = errors[extra.key] ? "#EF4444" : G.border}
        {...extra}
      />
      {errors[extra.key] && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#EF4444", fontFamily: "Inter, sans-serif" }}>{errors[extra.key]}</p>}
    </div>
  );

  if (processing) return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "40px 28px" }}>
      <div style={{ fontSize: 44 }}>🔒</div>
      <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: G.text, fontFamily: "Inter, sans-serif" }}>Processing securely…</p>
      <p style={{ margin: 0, fontSize: 13, color: G.muted, fontFamily: "Inter, sans-serif" }}>Please don't close this screen.</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 32, height: 32, borderRadius: "50%", border: `3px solid ${G.border}`, borderTopColor: G.green, animation: "spin 0.8s linear infinite" }} />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "24px 24px 32px", fontFamily: "Inter, sans-serif", overflowY: "auto" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: G.green, fontSize: 14, fontWeight: 500, padding: "0 0 20px", alignSelf: "flex-start", fontFamily: "Inter, sans-serif" }}>← Back</button>

      <div style={{ background: G.greenLight, border: `1px solid ${G.border}`, borderRadius: 12, padding: "12px 16px", marginBottom: 24 }}>
        <p style={{ margin: 0, fontSize: 13, color: G.greenDark, fontFamily: "Inter, sans-serif" }}>
          🎉 <strong>{trial}</strong> — then {price}. Cancel anytime.
        </p>
      </div>

      <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 700, color: G.text }}>Payment details</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {field("Card number", card,
          e => setCard(formatCardNumber(e.target.value)),
          "1234 5678 9012 3456",
          { key: "card", inputMode: "numeric" }
        )}
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            {field("Expiry", expiry,
              e => setExpiry(formatExpiry(e.target.value)),
              "MM/YY",
              { key: "expiry", inputMode: "numeric" }
            )}
          </div>
          <div style={{ flex: 1 }}>
            {field("CVC", cvc,
              e => setCvc(e.target.value.replace(/\D/g, "").slice(0, 3)),
              "123",
              { key: "cvc", inputMode: "numeric", type: "password" }
            )}
          </div>
        </div>
        {field("Name on card", name,
          e => setName(e.target.value),
          "Full name",
          { key: "name", autoComplete: "cc-name" }
        )}
      </div>

      <p style={{ margin: "16px 0 20px", fontSize: 11, color: G.muted, textAlign: "center", lineHeight: 1.5 }}>
        🔒 Payments are encrypted and secure. You won't be charged until your trial ends.
      </p>

      <button
        onClick={handleSubmit}
        style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", background: G.green, color: "#fff", fontSize: 15, fontWeight: 600, fontFamily: "Inter, sans-serif", cursor: "pointer", boxShadow: "0 4px 16px rgba(90,138,90,0.3)" }}
      >
        Start Free Trial →
      </button>
    </div>
  );
}

// ── Success step ─────────────────────────────────────────────────────────────

function SuccessScreen({ onDone }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 28px", textAlign: "center", gap: 16, fontFamily: "Inter, sans-serif" }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: G.greenLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>🌿</div>
      <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: G.text }}>You're all set!</h2>
      <p style={{ margin: 0, fontSize: 14, color: G.muted, lineHeight: 1.6, maxWidth: 260 }}>
        Welcome to My Gardn Premium. Enjoy unlimited AI chat, photo diagnosis, and care reminders.
      </p>
      <button
        onClick={onDone}
        style={{ marginTop: 8, width: "100%", padding: "15px", borderRadius: 14, border: "none", background: G.green, color: "#fff", fontSize: 15, fontWeight: 600, fontFamily: "Inter, sans-serif", cursor: "pointer", boxShadow: "0 4px 16px rgba(90,138,90,0.3)" }}
      >
        Start growing →
      </button>
    </div>
  );
}

// ── Main Paywall component ────────────────────────────────────────────────────

export default function Paywall({ onUnlock, onBack, mode = "limit" }) {
  const [selectedPlan, setSelectedPlan] = useState("annual");
  const [step, setStep] = useState("plans"); // plans | payment | success

  const features = [
    { icon: "💬", title: "Unlimited AI Advisor Chat",   desc: "Ask your personal plant expert anything, anytime. Watering, pests, soil, pruning — no message limit." },
    { icon: "🔬", title: "AI Photo Diagnosis",          desc: "Upload a photo of any plant and get an instant diagnosis with treatment steps." },
    { icon: "🔔", title: "Unlimited Care Reminders",   desc: "Schedule and track as many plant care tasks as you need across all your plants." },
  ];

  const plans = [
    {
      id: "annual",
      label: "Annual Master Plan",
      price: "$71.99",
      period: "/year",
      perMonth: "$6.00/mo",
      badge: "Best Value — Save 25%",
      sub: "Billed once a year. Biggest savings upfront.",
    },
    {
      id: "monthly",
      label: "Monthly Hobbyist",
      price: "$7.99",
      period: "/mo",
      perMonth: null,
      badge: null,
      sub: "Perfect for seasonal or casual summer growers.",
    },
  ];

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

  if (step === "payment") return (
    <PaymentForm
      plan={selectedPlanData}
      onSuccess={() => setStep("success")}
      onBack={() => setStep("plans")}
    />
  );

  if (step === "success") return (
    <SuccessScreen onDone={onUnlock} />
  );

  // ── Plans step ────────────────────────────────────────────────────────────
  return (
    <div style={{ flex: 1, overflowY: "auto", background: G.cream, display: "flex", flexDirection: "column", padding: "28px 24px 40px", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {mode === "manual" && onBack && (
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: G.green, fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 500, padding: "0 0 20px", display: "flex", alignItems: "center", gap: 4, alignSelf: "flex-start" }}>
          ← Back
        </button>
      )}

      {mode === "limit" && (
        <div style={{ background: "#FEF3C7", border: "1px solid #F59E0B", borderRadius: 12, padding: "11px 14px", marginBottom: 20, fontSize: 13, color: "#92400E", fontWeight: 500, lineHeight: 1.5 }}>
          ⚠️ You've reached your free limit. Upgrade to keep going.
        </div>
      )}

      <p style={{ margin: "0 0 24px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: G.green, textAlign: "center" }}>My Gardn</p>

      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <div style={{ fontSize: "44px", marginBottom: "14px" }}>🌿</div>
        <h1 style={{ margin: "0 0 8px", fontSize: "26px", fontWeight: 700, color: G.text, lineHeight: 1.2, letterSpacing: "-0.02em" }}>
          Unlock My Gardn<br /><span style={{ color: G.green }}>Premium</span>
        </h1>
        <p style={{ margin: 0, fontSize: "14px", color: G.muted, lineHeight: 1.5 }}>Everything your plants need. Nothing they don't.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {plans.map(plan => {
          const active = selectedPlan === plan.id;
          return (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              style={{
                width: "100%", textAlign: "left", background: active ? G.greenLight : "#fff",
                border: `2px solid ${active ? G.green : G.border}`,
                borderRadius: 16, padding: "14px 16px", cursor: "pointer",
                position: "relative", transition: "all 0.15s",
                boxShadow: active ? "0 2px 12px rgba(90,138,90,0.15)" : "none",
              }}
            >
              {plan.badge && (
                <div style={{ position: "absolute", top: -10, right: 14, background: G.green, color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, letterSpacing: "0.04em", fontFamily: "'Inter', sans-serif" }}>
                  {plan.badge}
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 600, color: G.text, fontFamily: "'Inter', sans-serif" }}>{plan.label}</p>
                  <p style={{ margin: 0, fontSize: 11, color: G.muted, fontFamily: "'Inter', sans-serif" }}>{plan.sub}</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: active ? G.greenDark : G.text, fontFamily: "'Inter', sans-serif" }}>{plan.price}</span>
                  <span style={{ fontSize: 12, color: G.muted, fontFamily: "'Inter', sans-serif" }}>{plan.period}</span>
                  {plan.perMonth && (
                    <p style={{ margin: "1px 0 0", fontSize: 11, color: G.green, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>{plan.perMonth} billed annually</p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
        {features.map(({ icon, title, desc }) => (
          <div key={title} style={{ background: "#fff", border: "1px solid #ECEAE6", borderRadius: "16px", padding: "16px", display: "flex", alignItems: "flex-start", gap: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#EAF3DE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>{icon}</div>
            <div>
              <p style={{ margin: "0 0 3px", fontSize: "14px", fontWeight: 600, color: G.text, lineHeight: 1.3 }}>{title}</p>
              <p style={{ margin: 0, fontSize: "12px", color: G.muted, lineHeight: 1.5 }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "auto" }}>
        <button
          onClick={() => setStep("payment")}
          style={{ width: "100%", padding: "16px", borderRadius: "14px", border: "none", background: G.green, color: "#fff", fontSize: "15px", fontWeight: 600, fontFamily: "'Inter', system-ui, sans-serif", cursor: "pointer", letterSpacing: "0.01em", boxShadow: "0 4px 16px rgba(90,138,90,0.3)" }}
          onMouseDown={e => e.currentTarget.style.opacity = "0.88"}
          onMouseUp={e => e.currentTarget.style.opacity = "1"}
          onTouchStart={e => e.currentTarget.style.opacity = "0.88"}
          onTouchEnd={e => e.currentTarget.style.opacity = "1"}
        >
          Start 7-Day Free Trial →
        </button>
        <p style={{ margin: "10px 0 0", textAlign: "center", fontSize: "12px", color: "#AAA" }}>
          Cancel anytime · Free trial ends after 7 days
        </p>
      </div>
    </div>
  );
}
