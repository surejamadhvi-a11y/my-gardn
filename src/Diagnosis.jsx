import { useState, useRef } from "react";

const T = {
  cream: "#F7F5F2", green: "#5A8A5A", greenLight: "#EAF1EA", greenDark: "#3D6B3D",
  text: "#1A1A1A", textMuted: "#7A7A7A", border: "#DDD8D0", white: "#FFFFFF",
  amber: "#92400E", amberLight: "#FEF3C7", amberBorder: "#F59E0B",
  red: "#B91C1C", redLight: "#FEF2F2", redBorder: "#FCA5A5",
};

const DIAGNOSIS_SYSTEM_PROMPT = `You are an expert plant pathologist and botanist inside the "My Gardn" app. Your job is to diagnose plant problems from photos with high accuracy.

When given a plant photo, you MUST respond with ONLY a valid JSON object in exactly this format — no preamble, no markdown, no explanation outside the JSON:

{
  "plantIdentified": "Name of the plant (or 'Unknown plant' if unclear)",
  "overallHealth": "Healthy | Mild concern | Moderate concern | Severe concern",
  "diagnoses": [
    {
      "condition": "Name of condition or issue",
      "probability": 78,
      "description": "One sentence: what this condition is and what causes it.",
      "treatment": "One to two sentences: exactly what the user should do right now.",
      "urgency": "Low | Medium | High"
    }
  ],
  "generalAdvice": "One to two sentences of overall care advice based on what you see.",
  "disclaimer": true
}

Rules:
- diagnoses array must have 2-4 entries, ordered highest probability first
- probability values must add up to 100 across all diagnoses
- Be specific and accurate — this is a real diagnostic tool, not a chatbot
- If the photo is not a plant, set plantIdentified to "No plant detected" and diagnoses to a single entry with condition "Invalid photo" and probability 100
- If the image is unclear or too dark, set plantIdentified to "Photo unclear" and advise retaking
- Never wrap the JSON in backticks or add any text outside the JSON object`;

function ProbabilityBar({ probability, urgency }) {
  const color = urgency === "High" ? "#B91C1C" : urgency === "Medium" ? "#D97706" : T.green;
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: T.textMuted, fontFamily: "Inter, sans-serif" }}>Match probability</span>
        <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "Inter, sans-serif" }}>{probability}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 6, background: "#E8E4DF", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${probability}%`, background: color, borderRadius: 6, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

function UrgencyBadge({ urgency }) {
  const styles = {
    Low:    { bg: T.greenLight,  color: T.greenDark,  label: "Low urgency" },
    Medium: { bg: "#FEF3C7",     color: "#92400E",    label: "Act soon" },
    High:   { bg: T.redLight,    color: T.red,        label: "Act now" },
  };
  const s = styles[urgency] || styles.Low;
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: s.bg, color: s.color, fontFamily: "Inter, sans-serif", letterSpacing: "0.04em", textTransform: "uppercase" }}>
      {s.label}
    </span>
  );
}

function HealthBadge({ health }) {
  const map = {
    "Healthy":          { bg: T.greenLight, color: T.greenDark, icon: "✅" },
    "Mild concern":     { bg: "#EFF6FF",    color: "#1D4ED8",   icon: "🔵" },
    "Moderate concern": { bg: "#FEF3C7",    color: "#92400E",   icon: "⚠️" },
    "Severe concern":   { bg: T.redLight,   color: T.red,       icon: "🚨" },
  };
  const s = map[health] || map["Mild concern"];
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20, background: s.bg, marginBottom: 16 }}>
      <span style={{ fontSize: 13 }}>{s.icon}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: s.color, fontFamily: "Inter, sans-serif" }}>{health}</span>
    </div>
  );
}

export default function Diagnosis({ userProfile, onBack, onDiagnosisAttempt }) {
  const [phase, setPhase] = useState("upload"); // upload | analyzing | results | error
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [imageMime, setImageMime] = useState("image/jpeg");
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageMime(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setImagePreview(dataUrl);
      // Strip the data URL prefix to get raw base64
      setImageBase64(dataUrl.split(",")[1]);
    };
    reader.readAsDataURL(file);
  }

  async function handleAnalyze() {
    if (!imageBase64) return;
    if (onDiagnosisAttempt && !onDiagnosisAttempt()) return;
    setPhase("analyzing");
    setErrorMsg("");

    const messages = [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: imageMime,
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: `Please diagnose this plant. ${userProfile?.pets && userProfile.pets !== "No Pets" ? `Note: the user ${userProfile.pets.toLowerCase()}, so flag any toxicity concerns.` : ""}`,
          },
        ],
      },
    ];

    try {
      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          systemPrompt: DIAGNOSIS_SYSTEM_PROMPT,
          model: "claude-sonnet-4-6", // Use Sonnet for vision accuracy
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error.message || "API error");

      const textBlock = data.content?.find(c => c.type === "text");
      if (!textBlock) throw new Error("No response from AI");

      // Clean and parse JSON
      const cleaned = textBlock.text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      setResult(parsed);
      setPhase("results");
    } catch (err) {
      setErrorMsg("Couldn't analyze the photo. Check your connection and try again.");
      setPhase("error");
    }
  }

  function handleReset() {
    setPhase("upload");
    setImagePreview(null);
    setImageBase64(null);
    setResult(null);
    setErrorMsg("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ── Upload phase ──────────────────────────────────────────────────────────
  if (phase === "upload" || phase === "error") return (
    <div style={{ fontFamily: "Inter, sans-serif", background: T.cream, minHeight: "100%", padding: "24px 20px 100px", display: "flex", flexDirection: "column" }}>
      {onBack && (
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: T.green, fontSize: 14, fontWeight: 500, padding: "0 0 20px", display: "flex", alignItems: "center", gap: 4, fontFamily: "Inter, sans-serif" }}>← Back</button>
      )}

      <div style={{ marginBottom: 28 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: T.greenLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 14 }}>🔬</div>
        <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, color: T.text, letterSpacing: "-0.4px" }}>Plant Diagnosis</h1>
        <p style={{ margin: 0, fontSize: 14, color: T.textMuted, lineHeight: 1.5 }}>Upload a clear photo of your plant's leaves, stem, or affected area. The AI will identify what's wrong and tell you exactly what to do.</p>
      </div>

      {/* Photo tips */}
      <div style={{ background: T.greenLight, border: `1px solid ${T.border}`, borderRadius: 14, padding: "14px 16px", marginBottom: 24 }}>
        <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 600, color: T.greenDark, fontFamily: "Inter, sans-serif" }}>📸 For best accuracy:</p>
        {["Take the photo in natural light", "Get close to the affected area", "Make sure the image is in focus", "Include both healthy and affected parts if possible"].map(tip => (
          <p key={tip} style={{ margin: "3px 0", fontSize: 12, color: T.greenDark, fontFamily: "Inter, sans-serif" }}>· {tip}</p>
        ))}
      </div>

      {/* Error */}
      {phase === "error" && (
        <div style={{ background: T.amberLight, border: `1px solid ${T.amberBorder}`, borderRadius: 12, padding: "11px 14px", marginBottom: 16, fontSize: 13, color: T.amber, fontFamily: "Inter, sans-serif" }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Upload area */}
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} style={{ display: "none" }} />

      {imagePreview ? (
        <div style={{ marginBottom: 20 }}>
          <img src={imagePreview} alt="Plant to diagnose" style={{ width: "100%", borderRadius: 16, maxHeight: 280, objectFit: "cover", border: `1px solid ${T.border}` }} />
          <button onClick={() => { setImagePreview(null); setImageBase64(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
            style={{ marginTop: 10, background: "none", border: "none", color: T.textMuted, fontSize: 13, cursor: "pointer", fontFamily: "Inter, sans-serif", textDecoration: "underline" }}>
            Remove photo
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{ width: "100%", border: `2px dashed ${T.border}`, borderRadius: 16, padding: "40px 20px", background: T.white, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 20 }}
        >
          <span style={{ fontSize: 36 }}>📷</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: T.text, fontFamily: "Inter, sans-serif" }}>Upload a photo</span>
          <span style={{ fontSize: 13, color: T.textMuted, fontFamily: "Inter, sans-serif" }}>Tap to choose from camera or library</span>
        </button>
      )}

      <button
        onClick={handleAnalyze}
        disabled={!imageBase64}
        style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", background: imageBase64 ? T.green : T.border, color: imageBase64 ? T.white : T.textMuted, fontFamily: "Inter, sans-serif", fontSize: 15, fontWeight: 600, cursor: imageBase64 ? "pointer" : "default", marginTop: "auto" }}
      >
        Analyze My Plant →
      </button>
    </div>
  );

  // ── Analyzing phase ───────────────────────────────────────────────────────
  if (phase === "analyzing") return (
    <div style={{ fontFamily: "Inter, sans-serif", background: T.cream, minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, gap: 20 }}>
      <div style={{ fontSize: 48 }}>🔬</div>
      <div style={{ textAlign: "center" }}>
        <p style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 700, color: T.text }}>Analyzing your plant...</p>
        <p style={{ margin: 0, fontSize: 13, color: T.textMuted, lineHeight: 1.5 }}>Our AI is examining the photo for diseases, pests, and nutrient issues. This takes about 10 seconds.</p>
      </div>
      {imagePreview && <img src={imagePreview} alt="" style={{ width: "100%", maxWidth: 280, borderRadius: 16, opacity: 0.7, objectFit: "cover", maxHeight: 200 }} />}
      <style>{`@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}`}</style>
      <div style={{ display: "flex", gap: 8 }}>
        {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: T.green, animation: "pulse 1.4s infinite", animationDelay: `${i * 0.2}s` }} />)}
      </div>
    </div>
  );

  // ── Results phase ─────────────────────────────────────────────────────────
  if (phase === "results" && result) return (
    <div style={{ fontFamily: "Inter, sans-serif", background: T.cream, minHeight: "100%", padding: "24px 20px 100px", overflowY: "auto" }}>
      <button onClick={handleReset} style={{ background: "none", border: "none", cursor: "pointer", color: T.green, fontSize: 14, fontWeight: 500, padding: "0 0 20px", display: "flex", alignItems: "center", gap: 4, fontFamily: "Inter, sans-serif" }}>← New Diagnosis</button>

      {/* Plant ID + health */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 600, color: T.textMuted, letterSpacing: "0.06em", textTransform: "uppercase" }}>Plant identified</p>
        <h2 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 700, color: T.text, letterSpacing: "-0.3px" }}>{result.plantIdentified}</h2>
        <HealthBadge health={result.overallHealth} />
      </div>

      {/* Photo thumbnail */}
      {imagePreview && <img src={imagePreview} alt="Diagnosed plant" style={{ width: "100%", borderRadius: 16, maxHeight: 200, objectFit: "cover", marginBottom: 20, border: `1px solid ${T.border}` }} />}

      {/* Diagnoses */}
      <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 600, color: T.textMuted, letterSpacing: "0.06em", textTransform: "uppercase" }}>Probability Match</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
        {result.diagnoses?.map((d, i) => (
          <div key={i} style={{ background: T.white, border: `1px solid ${i === 0 ? T.green : T.border}`, borderRadius: 16, padding: 16, boxShadow: i === 0 ? "0 2px 12px rgba(90,138,90,0.12)" : "none" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: T.text, fontFamily: "Inter, sans-serif", lineHeight: 1.3 }}>
                {i === 0 && "🎯 "}{d.condition}
              </p>
              <UrgencyBadge urgency={d.urgency} />
            </div>
            <ProbabilityBar probability={d.probability} urgency={d.urgency} />
            <p style={{ margin: "10px 0 6px", fontSize: 13, color: T.textMuted, lineHeight: 1.5, fontFamily: "Inter, sans-serif" }}>{d.description}</p>
            <div style={{ background: T.greenLight, borderRadius: 10, padding: "10px 12px" }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: T.greenDark, fontFamily: "Inter, sans-serif", marginBottom: 3 }}>What to do:</p>
              <p style={{ margin: 0, fontSize: 13, color: T.greenDark, lineHeight: 1.5, fontFamily: "Inter, sans-serif" }}>{d.treatment}</p>
            </div>
          </div>
        ))}
      </div>

      {/* General advice */}
      {result.generalAdvice && (
        <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16, marginBottom: 20 }}>
          <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 600, color: T.textMuted, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "Inter, sans-serif" }}>General Advice</p>
          <p style={{ margin: 0, fontSize: 14, color: T.text, lineHeight: 1.6, fontFamily: "Inter, sans-serif" }}>{result.generalAdvice}</p>
        </div>
      )}

      {/* Disclaimer */}
      <div style={{ background: T.amberLight, border: `1px solid ${T.amberBorder}`, borderRadius: 12, padding: "12px 14px", marginBottom: 20 }}>
        <p style={{ margin: 0, fontSize: 12, color: T.amber, lineHeight: 1.5, fontFamily: "Inter, sans-serif" }}>
          <strong>⚠️ Disclaimer:</strong> This is an AI probability estimate, not a guaranteed diagnosis. Results may vary based on photo quality and plant condition. If symptoms persist or worsen, consult a local nursery or plant specialist.
        </p>
      </div>

      {/* Analyze again */}
      <button
        onClick={handleReset}
        style={{ width: "100%", padding: 14, borderRadius: 14, border: `1.5px solid ${T.border}`, background: T.white, color: T.green, fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
      >
        Diagnose Another Plant
      </button>
    </div>
  );

  return null;
}
