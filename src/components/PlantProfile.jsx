import { useState } from "react";

const HEALTH_STATUSES = ["Healthy", "Needs Attention", "Critical"];
const GROWTH_STAGES   = ["Seedling", "Vegetative", "Mature", "Flowering", "Harvest"];

const HEALTH_BADGES = {
  "Healthy":          { bg: "#EAF2EA", color: "#5A8A5A" },
  "Needs Attention":  { bg: "#FFF3E0", color: "#E9A84C" },
  "Critical":         { bg: "#FFEBEE", color: "#D96B6B" },
};

const FONT = "'Inter', system-ui, sans-serif";

function plantImageUrl(name) {
  return `https://source.unsplash.com/300x300/?${encodeURIComponent(name)},plant`;
}

function formatTimestamp(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    " at " +
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  );
}

function BackArrow() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  );
}

function SectionLabel({ children }) {
  return (
    <p
      style={{
        margin: "0 0 8px",
        fontFamily: FONT,
        fontSize: "11px",
        fontWeight: 600,
        color: "#888",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </p>
  );
}

// ── Plant Profile ─────────────────────────────────────────────────────────────

export default function PlantProfile({ plant, onBack, onUpdate }) {
  const [newNote, setNewNote] = useState("");
  const [imgErr, setImgErr]   = useState(false);

  function update(field, value) {
    onUpdate({ ...plant, [field]: value });
  }

  function addNote() {
    const text = newNote.trim();
    if (!text) return;
    const note = {
      id: Date.now(),
      text,
      timestamp: new Date().toISOString(),
    };
    onUpdate({ ...plant, notes: [...(plant.notes || []), note] });
    setNewNote("");
  }

  function deleteNote(noteId) {
    onUpdate({ ...plant, notes: plant.notes.filter(n => n.id !== noteId) });
  }

  const badge = HEALTH_BADGES[plant.healthStatus] || HEALTH_BADGES["Healthy"];
  const notes = plant.notes || [];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#F7F5F2",
        overflowY: "auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "20px 20px 12px",
          background: "#F7F5F2",
          borderBottom: "1px solid #ECEAE6",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onBack}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            border: "1px solid #ECEAE6",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
            color: "#1A1A1A",
          }}
        >
          <BackArrow />
        </button>
        <span
          style={{
            fontFamily: FONT,
            fontSize: "17px",
            fontWeight: 600,
            color: "#1A1A1A",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {plant.name}
        </span>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: "40px" }}>
        {/* Hero photo */}
        <div
          style={{
            width: "100%",
            height: "220px",
            background: "#EAF2EA",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {imgErr ? (
            <span style={{ fontSize: 80 }}>🌿</span>
          ) : (
            <img
              src={plantImageUrl(plant.name)}
              alt={plant.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={() => setImgErr(true)}
            />
          )}
        </div>

        <div style={{ padding: "20px" }}>
          {/* Health Status */}
          <div style={{ marginBottom: "20px" }}>
            <SectionLabel>Health Status</SectionLabel>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {HEALTH_STATUSES.map(status => {
                const b = HEALTH_BADGES[status];
                const active = plant.healthStatus === status;
                return (
                  <button
                    key={status}
                    onClick={() => update("healthStatus", status)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "20px",
                      border: `2px solid ${active ? b.color : "transparent"}`,
                      background: active ? b.bg : "#EEECEA",
                      color: active ? b.color : "#888",
                      fontFamily: FONT,
                      fontSize: "12px",
                      fontWeight: active ? 700 : 400,
                      cursor: "pointer",
                      outline: "none",
                      transition: "all 0.12s",
                    }}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Growth Stage */}
          <div style={{ marginBottom: "20px" }}>
            <SectionLabel>Growth Stage</SectionLabel>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {GROWTH_STAGES.map(stage => {
                const active = plant.growthStage === stage;
                return (
                  <button
                    key={stage}
                    onClick={() => update("growthStage", stage)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "20px",
                      border: `2px solid ${active ? "#5A8A5A" : "transparent"}`,
                      background: active ? "#EAF2EA" : "#EEECEA",
                      color: active ? "#5A8A5A" : "#888",
                      fontFamily: FONT,
                      fontSize: "12px",
                      fontWeight: active ? 700 : 400,
                      cursor: "pointer",
                      outline: "none",
                      transition: "all 0.12s",
                    }}
                  >
                    {stage}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Watering */}
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              border: "1px solid #E8E4DF",
              padding: "16px",
              marginBottom: "20px",
            }}
          >
            <SectionLabel>Watering</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {[
                { label: "Last Watered",  field: "lastWatered" },
                { label: "Next Watering", field: "nextWatering" },
              ].map(({ label, field }) => (
                <div key={field}>
                  <p
                    style={{
                      margin: "0 0 4px",
                      fontFamily: FONT,
                      fontSize: "11px",
                      color: "#888",
                    }}
                  >
                    {label}
                  </p>
                  <input
                    type="date"
                    value={plant[field] || ""}
                    onChange={e => update(field, e.target.value || null)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "10px",
                      border: "1px solid #E8E4DF",
                      fontFamily: FONT,
                      fontSize: "13px",
                      color: "#1A1A1A",
                      background: "#F7F5F2",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    onFocus={e => (e.target.style.borderColor = "#5A8A5A")}
                    onBlur={e => (e.target.style.borderColor = "#E8E4DF")}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Notes / Journal */}
          <div>
            <SectionLabel>Notes</SectionLabel>

            {/* Add note row */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <input
                placeholder="Add a note…"
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addNote(); }}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: "12px",
                  border: "1px solid #E8E4DF",
                  fontFamily: FONT,
                  fontSize: "14px",
                  color: "#1A1A1A",
                  background: "#fff",
                  outline: "none",
                }}
                onFocus={e => (e.target.style.borderColor = "#5A8A5A")}
                onBlur={e => (e.target.style.borderColor = "#E8E4DF")}
              />
              <button
                onClick={addNote}
                disabled={!newNote.trim()}
                style={{
                  padding: "10px 18px",
                  borderRadius: "12px",
                  border: "none",
                  background: newNote.trim() ? "#5A8A5A" : "#D0CCC6",
                  color: "#fff",
                  fontFamily: FONT,
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: newNote.trim() ? "pointer" : "not-allowed",
                  flexShrink: 0,
                  transition: "background 0.12s",
                }}
              >
                Add
              </button>
            </div>

            {notes.length === 0 ? (
              <p
                style={{
                  textAlign: "center",
                  padding: "24px 0",
                  color: "#bbb",
                  fontFamily: FONT,
                  fontSize: "13px",
                  margin: 0,
                }}
              >
                No notes yet
              </p>
            ) : (
              [...notes].reverse().map(note => (
                <div
                  key={note.id}
                  style={{
                    background: "#fff",
                    borderRadius: "12px",
                    border: "1px solid #E8E4DF",
                    padding: "12px 14px",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "8px",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontFamily: FONT,
                        fontSize: "14px",
                        color: "#1A1A1A",
                        lineHeight: 1.5,
                        flex: 1,
                      }}
                    >
                      {note.text}
                    </p>
                    <button
                      onClick={() => deleteNote(note.id)}
                      style={{
                        border: "none",
                        background: "none",
                        color: "#ccc",
                        cursor: "pointer",
                        fontSize: "16px",
                        flexShrink: 0,
                        padding: "0 2px",
                        lineHeight: 1,
                      }}
                      aria-label="Delete note"
                    >
                      ✕
                    </button>
                  </div>
                  <p
                    style={{
                      margin: "6px 0 0",
                      fontFamily: FONT,
                      fontSize: "11px",
                      color: "#aaa",
                    }}
                  >
                    {formatTimestamp(note.timestamp)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
