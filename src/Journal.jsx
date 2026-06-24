import { useState, useRef } from "react";
import { useGarden } from "./GardenContext";

const STATUS_TAGS = [
  { label: "🌱 Sprouting",  bg: "#EAF2EA", color: "#3A6E3A" },
  { label: "💦 Watered",    bg: "#E8F0F8", color: "#2C5282" },
  { label: "☀️ Needs Sun",  bg: "#FDF4E7", color: "#744210" },
  { label: "✂️ Pruned",     bg: "#F3E8FF", color: "#553C9A" },
  { label: "🪴 Repotted",   bg: "#FFF3CD", color: "#856404" },
];

function formatDate(isoDate) {
  const today     = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  if (isoDate === today)     return "Today";
  if (isoDate === yesterday) return "Yesterday";
  return new Date(isoDate + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

async function compressImage(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const MAX = 800;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width  = img.width  * scale;
        canvas.height = img.height * scale;
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function StatusBadge({ status }) {
  return (
    <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: 20, background: status.bg, color: status.color, fontSize: 12, fontWeight: 600, lineHeight: 1.6 }}>
      {status.label}
    </span>
  );
}

function PlantChip({ plant, isActive, onClick }) {
  return (
    <button onClick={onClick} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", padding: "4px 2px", minWidth: 60, flexShrink: 0 }}>
      <div style={{ width: 48, height: 48, borderRadius: "50%", background: plant.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, border: isActive ? "2.5px solid #5A8A5A" : "2.5px solid transparent", boxSizing: "border-box" }}>
        {plant.emoji}
      </div>
      <span style={{ fontSize: 10, color: isActive ? "#5A8A5A" : "#7A7A72", fontWeight: isActive ? 600 : 400, textAlign: "center", maxWidth: 58, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {plant.nickname || plant.name}
      </span>
    </button>
  );
}

function JournalCard({ entry, onDelete }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8E4DF", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#EAF2EA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🌿</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1C1C1A", lineHeight: 1.3 }}>{entry.plantName}</div>
            <div style={{ fontSize: 12, color: "#7A7A72", lineHeight: 1.3 }}>{formatDate(entry.date)}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <StatusBadge status={entry.status} />
          <button onClick={() => onDelete(entry.id)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#D0CCC6", fontSize: 18, lineHeight: 1, padding: "2px 4px" }}
            onMouseEnter={e => e.currentTarget.style.color = "#B91C1C"}
            onMouseLeave={e => e.currentTarget.style.color = "#D0CCC6"}>×</button>
        </div>
      </div>
      <div style={{ padding: "0 16px 14px", fontSize: 14, color: "#3A3A36", lineHeight: 1.6 }}>{entry.note}</div>
      {entry.photo && (
        <div style={{ margin: "0 16px 16px", borderRadius: 10, overflow: "hidden" }}>
          <img src={entry.photo} alt="" style={{ width: "100%", display: "block", maxHeight: 200, objectFit: "cover" }} />
        </div>
      )}
    </div>
  );
}

function AddEntryModal({ gardenPlants, onClose, onSave }) {
  const [note,             setNote]             = useState("");
  const [selectedPlantId,  setSelectedPlantId]  = useState(gardenPlants[0]?.id || null);
  const [customPlantName,  setCustomPlantName]  = useState("");
  const [selectedStatus,   setSelectedStatus]   = useState(STATUS_TAGS[0]);
  const [photo,            setPhoto]            = useState(null);
  const [photoLoading,     setPhotoLoading]     = useState(false);
  const fileRef = useRef(null);

  const plantName = gardenPlants.length > 0
    ? (gardenPlants.find(p => p.id === selectedPlantId)?.nickname || gardenPlants.find(p => p.id === selectedPlantId)?.name || "")
    : customPlantName;

  async function handlePhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoLoading(true);
    setPhoto(await compressImage(file));
    setPhotoLoading(false);
  }

  function handleSave() {
    if (!note.trim() || !plantName.trim()) return;
    onSave({
      id: String(Date.now()),
      date: new Date().toISOString().split("T")[0],
      plantId: selectedPlantId,
      plantName: plantName.trim(),
      status: selectedStatus,
      note: note.trim(),
      photo,
    });
  }

  const canSave = note.trim() && plantName.trim();

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(28,28,26,0.45)", backdropFilter: "blur(2px)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#F7F5F2", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 480, padding: "0 0 32px", maxHeight: "92vh", overflowY: "auto" }}>

        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "#D0CCC6" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 20px 16px" }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: "#1C1C1A" }}>New Entry</span>
          <button onClick={onClose} style={{ background: "#E8E4DF", border: "none", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, color: "#7A7A72" }}>×</button>
        </div>

        <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Plant */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#7A7A72", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 10 }}>Which plant?</label>
            {gardenPlants.length > 0 ? (
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
                {gardenPlants.map(p => (
                  <button key={p.id} onClick={() => setSelectedPlantId(p.id)}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 20, border: selectedPlantId === p.id ? "2px solid #5A8A5A" : "2px solid #E8E4DF", background: selectedPlantId === p.id ? "#EAF2EA" : "#fff", cursor: "pointer", flexShrink: 0, fontSize: 13, fontWeight: selectedPlantId === p.id ? 600 : 400, color: selectedPlantId === p.id ? "#3A6E3A" : "#3A3A36" }}>
                    {p.emoji} {p.nickname || p.name}
                  </button>
                ))}
              </div>
            ) : (
              <input type="text" value={customPlantName} onChange={e => setCustomPlantName(e.target.value)} placeholder="e.g. My Basil, Balcony Tomatoes…"
                style={{ width: "100%", padding: "10px 13px", border: "1.5px solid #E8E4DF", borderRadius: 10, fontFamily: "Inter, sans-serif", fontSize: 14, color: "#1C1C1A", outline: "none", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = "#5A8A5A"}
                onBlur={e => e.target.style.borderColor = "#E8E4DF"}
              />
            )}
          </div>

          {/* Status */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#7A7A72", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 10 }}>What happened?</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {STATUS_TAGS.map(tag => (
                <button key={tag.label} onClick={() => setSelectedStatus(tag)}
                  style={{ padding: "6px 12px", borderRadius: 20, border: selectedStatus.label === tag.label ? `2px solid ${tag.color}` : "2px solid #E8E4DF", background: selectedStatus.label === tag.label ? tag.bg : "#fff", color: selectedStatus.label === tag.label ? tag.color : "#7A7A72", fontSize: 13, fontWeight: selectedStatus.label === tag.label ? 600 : 400, cursor: "pointer" }}>
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#7A7A72", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 8 }}>Your note</label>
            <textarea placeholder="What did you notice today? Any changes, milestones, or things to remember…" value={note} onChange={e => setNote(e.target.value)} rows={3}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #E8E4DF", background: "#fff", fontFamily: "Inter, sans-serif", fontSize: 14, color: "#1C1C1A", lineHeight: 1.6, resize: "none", outline: "none", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = "#5A8A5A"}
              onBlur={e => e.target.style.borderColor = "#E8E4DF"}
            />
          </div>

          {/* Photo */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#7A7A72", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 8 }}>Photo (optional)</label>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display: "none" }} />
            {photo ? (
              <div style={{ position: "relative" }}>
                <img src={photo} alt="" style={{ width: "100%", borderRadius: 10, maxHeight: 160, objectFit: "cover", display: "block" }} />
                <button onClick={() => setPhoto(null)} style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%", width: 26, height: 26, color: "#fff", cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()}
                style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1.5px dashed #D0CCC6", background: "#fff", color: "#7A7A72", fontSize: 13, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                {photoLoading ? "Processing…" : "📷 Add a photo"}
              </button>
            )}
          </div>

          <button onClick={handleSave} disabled={!canSave}
            style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: canSave ? "#5A8A5A" : "#D0CCC6", color: "#fff", fontSize: 15, fontWeight: 600, cursor: canSave ? "pointer" : "not-allowed", fontFamily: "Inter, sans-serif" }}>
            Save Entry
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Journal() {
  const { gardenPlants, journalEntries, addJournalEntry, deleteJournalEntry } = useGarden();
  const [activePlantId, setActivePlantId] = useState(null);
  const [showModal,     setShowModal]     = useState(false);

  const filtered = activePlantId
    ? journalEntries.filter(e => e.plantId === activePlantId)
    : journalEntries;

  return (
    <div style={{ fontFamily: "Inter, -apple-system, sans-serif", background: "#F7F5F2", minHeight: "100%" }}>
      <div style={{ padding: "20px 16px 100px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Title row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1C1C1A", letterSpacing: "-0.02em", lineHeight: 1.2 }}>My Plant Journal</h1>
            <p style={{ margin: "3px 0 0", fontSize: 13, color: "#7A7A72" }}>
              {journalEntries.length} {journalEntries.length === 1 ? "entry" : "entries"} logged
            </p>
          </div>
          <button onClick={() => setShowModal(true)}
            style={{ width: 40, height: 40, borderRadius: "50%", background: "#5A8A5A", border: "none", color: "#fff", fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(90,138,90,0.35)", flexShrink: 0 }}>
            +
          </button>
        </div>

        {/* Plant filter */}
        {gardenPlants.length > 0 && (
          <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
            <button onClick={() => setActivePlantId(null)}
              style={{ padding: "6px 14px", borderRadius: 20, border: activePlantId === null ? "2px solid #5A8A5A" : "2px solid #E8E4DF", background: activePlantId === null ? "#EAF2EA" : "transparent", color: activePlantId === null ? "#3A6E3A" : "#7A7A72", fontSize: 13, fontWeight: activePlantId === null ? 600 : 400, cursor: "pointer", flexShrink: 0, alignSelf: "center", whiteSpace: "nowrap" }}>
              All
            </button>
            {gardenPlants.map(plant => (
              <PlantChip key={plant.id} plant={plant} isActive={activePlantId === plant.id}
                onClick={() => setActivePlantId(activePlantId === plant.id ? null : plant.id)} />
            ))}
          </div>
        )}

        {/* Entries */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#7A7A72" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🌱</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#1C1C1A", marginBottom: 6 }}>
              {journalEntries.length === 0 ? "No entries yet" : "No entries for this plant"}
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.5 }}>
              {gardenPlants.length === 0
                ? "Add plants from the Encyclopedia, then start logging your garden."
                : <>Tap <strong>+</strong> to log your first observation.</>}
            </div>
          </div>
        ) : (
          filtered.map(entry => <JournalCard key={entry.id} entry={entry} onDelete={deleteJournalEntry} />)
        )}
      </div>

      {showModal && (
        <AddEntryModal
          gardenPlants={gardenPlants}
          onClose={() => setShowModal(false)}
          onSave={entry => { addJournalEntry(entry); setShowModal(false); }}
        />
      )}
    </div>
  );
}
