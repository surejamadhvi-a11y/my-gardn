import { useState, useRef, useEffect } from "react";

const SUGGESTED = [
  "Why are my basil leaves turning yellow?",
  "How often should I water tomatoes on a balcony?",
  "What plants grow well in low-light apartments?",
  "How do I get rid of fungus gnats organically?",
];

function buildSystemPrompt(profile) {
  return `You are a warm, knowledgeable plant advisor inside the "My Gardn" app. Give specific, practical gardening advice.

User's garden profile:
- Name: ${profile?.name || "Gardener"}
- Experience: ${profile?.experience || "Beginner"}
- Growing environment: ${profile?.environment || "Not specified"}
- Location: ${profile?.location || "Not specified"}
- Pets at home: ${profile?.pets || "None"}

Guidelines:
- Tailor every answer to this user's exact setup and experience level
- Keep responses concise: 2-4 sentences for simple questions, a short paragraph for complex ones
- Prefer organic and chemical-free methods
- If the user has pets, proactively flag any plant toxicity concerns
- Use a warm, encouraging tone
- Use plain text only — no markdown, no asterisks, no bullet dashes`;
}

function EmptyState({ profile, onSuggest }) {
  return (
    <div style={{ padding: "20px 4px 0" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>🌿</div>
        <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#1A1A1A", lineHeight: 1.3 }}>
          Hey {profile?.name || "Gardener"}!
        </p>
        <p style={{ margin: "5px 0 0", fontSize: 13, color: "#7A7A72", lineHeight: 1.6 }}>
          Ask me anything about your plants — watering, pests, soil, or what to grow next in your {profile?.environment || "space"}.
        </p>
      </div>
      <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 600, color: "#B0ADA8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        Try asking
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {SUGGESTED.map(q => (
          <button
            key={q}
            onClick={() => onSuggest(q)}
            style={{ textAlign: "left", background: "#fff", border: "1px solid #E8E4DF", borderRadius: 12, padding: "11px 14px", fontSize: 13, color: "#3A3A36", cursor: "pointer", fontFamily: "Inter, sans-serif", lineHeight: 1.4, transition: "border-color 0.12s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#5A8A5A"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#E8E4DF"}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

function UserBubble({ text }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
      <div style={{ maxWidth: "78%", background: "#5A8A5A", color: "#fff", borderRadius: "18px 18px 4px 18px", padding: "10px 14px", fontSize: 14, lineHeight: 1.6, fontFamily: "Inter, sans-serif" }}>
        {text}
      </div>
    </div>
  );
}

function AssistantBubble({ text }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12, gap: 8, alignItems: "flex-start" }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#EAF2EA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, marginTop: 2 }}>
        🌿
      </div>
      <div style={{ maxWidth: "78%", background: "#fff", border: "1px solid #E8E4DF", borderRadius: "4px 18px 18px 18px", padding: "10px 14px", fontSize: 14, color: "#1A1A1A", lineHeight: 1.6, fontFamily: "Inter, sans-serif" }}>
        {text}
      </div>
    </div>
  );
}

function LoadingBubble() {
  return (
    <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12, gap: 8, alignItems: "flex-start" }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#EAF2EA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>
        🌿
      </div>
      <div style={{ background: "#fff", border: "1px solid #E8E4DF", borderRadius: "4px 18px 18px 18px", padding: "12px 16px", display: "flex", gap: 5, alignItems: "center" }}>
        <style>{`@keyframes mgBounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}`}</style>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#B0ADA8", animation: "mgBounce 1.2s infinite", animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}

export default function Advisor({ userProfile, isPremium, aiMessageCount, maxFreeActions, onMessageAttempt }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const remaining = maxFreeActions - aiMessageCount;

  async function handleSend(text = input) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const allowed = onMessageAttempt();
    if (!allowed) return;

    const next = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next,
          systemPrompt: buildSystemPrompt(userProfile),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "API error");
      const reply = data.content?.[0]?.text || "Sorry, I couldn't get a response right now.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error('Advisor fetch error:', err);
      setMessages(prev => [...prev, { role: "assistant", content: "Something went wrong. Check your connection and try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#F7F5F2", fontFamily: "Inter, sans-serif" }}>

      {/* Message list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 0" }}>
        {messages.length === 0
          ? <EmptyState profile={userProfile} onSuggest={q => handleSend(q)} />
          : messages.map((msg, i) =>
              msg.role === "user"
                ? <UserBubble key={i} text={msg.content} />
                : <AssistantBubble key={i} text={msg.content} />
            )
        }
        {loading && <LoadingBubble />}
        <div ref={bottomRef} style={{ height: 8 }} />
      </div>

      {/* Free message counter */}
      {!isPremium && remaining > 0 && (
        <div style={{ padding: "5px 16px", textAlign: "center" }}>
          <span style={{ fontSize: 11, color: remaining === 1 ? "#D97706" : "#B0ADA8", fontWeight: 500 }}>
            {remaining} free {remaining === 1 ? "message" : "messages"} remaining
          </span>
        </div>
      )}

      {/* Input bar */}
      <div style={{ padding: "10px 14px 14px", borderTop: "1px solid #ECEAE6", background: "#fff", display: "flex", gap: 8, alignItems: "flex-end" }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Ask about your plants…"
          rows={1}
          style={{ flex: 1, padding: "10px 14px", borderRadius: 20, border: "1.5px solid #E8E4DF", background: "#F7F5F2", fontSize: 14, fontFamily: "Inter, sans-serif", resize: "none", outline: "none", lineHeight: 1.5 }}
          onFocus={e => e.target.style.borderColor = "#5A8A5A"}
          onBlur={e => e.target.style.borderColor = "#E8E4DF"}
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          style={{ width: 40, height: 40, borderRadius: "50%", background: input.trim() && !loading ? "#5A8A5A" : "#D0CCC6", border: "none", cursor: input.trim() && !loading ? "pointer" : "default", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
