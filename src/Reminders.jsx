import { useState } from "react";
import { useGarden } from "./GardenContext";

const ACTIONS = [
  { label: "Water",   emoji: "💧" },
  { label: "Feed",    emoji: "🧪" },
  { label: "Prune",   emoji: "✂️" },
  { label: "Repot",   emoji: "🪴" },
  { label: "Check",   emoji: "🔍" },
  { label: "Harvest", emoji: "🌾" },
  { label: "Other",   emoji: "📝" },
];

function todayStr()     { return new Date().toISOString().split("T")[0]; }
function tomorrowStr()  { return new Date(Date.now() + 86400000).toISOString().split("T")[0]; }
function isOverdue(d)   { return d < todayStr(); }

function formatDate(dateStr) {
  if (dateStr === todayStr())    return "Today";
  if (dateStr === tomorrowStr()) return "Tomorrow";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function formatTime(t) {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function Checkbox({ checked, onChange }) {
  return (
    <div onClick={onChange} style={{ width: 22, height: 22, borderRadius: 7, border: checked ? "none" : "2px solid #D0CCC6", background: checked ? "#5A8A5A" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "all 0.15s" }}>
      {checked && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    </div>
  );
}

function TaskRow({ task, showCheck, onToggle, onDelete }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", opacity: task.completed ? 0.5 : 1, transition: "opacity 0.2s" }}>
      {showCheck && <Checkbox checked={task.completed} onChange={() => onToggle(task.id)} />}
      <div style={{ width: 36, height: 36, borderRadius: 10, background: task.completed ? "#F0EDE8" : "#EAF2EA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>
        {task.emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#1C1C1A", textDecoration: task.completed ? "line-through" : "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {task.action} the {task.plantName}
        </div>
        {task.detail && (
          <div style={{ fontSize: 12, color: "#7A7A72", marginTop: 1, textDecoration: task.completed ? "line-through" : "none" }}>{task.detail}</div>
        )}
      </div>
      {task.time && (
        <div style={{ fontSize: 12, color: "#7A7A72", fontWeight: 500, flexShrink: 0, textDecoration: task.completed ? "line-through" : "none" }}>
          {formatTime(task.time)}
        </div>
      )}
      <button onClick={() => onDelete(task.id)}
        style={{ background: "none", border: "none", cursor: "pointer", color: "#D0CCC6", fontSize: 18, padding: "2px 4px", flexShrink: 0, lineHeight: 1 }}
        onMouseEnter={e => e.currentTarget.style.color = "#B91C1C"}
        onMouseLeave={e => e.currentTarget.style.color = "#D0CCC6"}>×</button>
    </div>
  );
}

function AddReminderModal({ gardenPlants, onClose, onSave }) {
  const [selectedPlantId, setSelectedPlantId] = useState(gardenPlants[0]?.id || null);
  const [customPlant,     setCustomPlant]     = useState("");
  const [action,          setAction]          = useState(ACTIONS[0]);
  const [date,            setDate]            = useState(todayStr());
  const [time,            setTime]            = useState("");
  const [detail,          setDetail]          = useState("");

  const plantName = gardenPlants.length > 0
    ? (gardenPlants.find(p => p.id === selectedPlantId)?.nickname || gardenPlants.find(p => p.id === selectedPlantId)?.name || "")
    : customPlant;

  function handleSave() {
    if (!plantName.trim() || !date) return;
    onSave({
      id: String(Date.now()),
      emoji: action.emoji,
      action: action.label,
      plantName: plantName.trim(),
      detail: detail.trim(),
      date,
      time: time || null,
      completed: false,
      completedDate: null,
    });
  }

  const canSave = plantName.trim() && date;

  const inputStyle = { width: "100%", padding: "10px 13px", border: "1.5px solid #E8E4DF", borderRadius: 10, fontFamily: "Inter, sans-serif", fontSize: 14, color: "#1C1C1A", outline: "none", boxSizing: "border-box", background: "#fff" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(28,28,26,0.45)", backdropFilter: "blur(2px)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#F7F5F2", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 480, padding: "0 0 32px", maxHeight: "92vh", overflowY: "auto" }}>

        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "#D0CCC6" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 20px 16px" }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: "#1C1C1A" }}>New Reminder</span>
          <button onClick={onClose} style={{ background: "#E8E4DF", border: "none", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, color: "#7A7A72" }}>×</button>
        </div>

        <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Plant */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#7A7A72", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 10 }}>Plant</label>
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
              <input type="text" value={customPlant} onChange={e => setCustomPlant(e.target.value)} placeholder="e.g. My Basil"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#5A8A5A"}
                onBlur={e => e.target.style.borderColor = "#E8E4DF"}
              />
            )}
          </div>

          {/* Action */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#7A7A72", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 10 }}>What to do</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ACTIONS.map(a => (
                <button key={a.label} onClick={() => setAction(a)}
                  style={{ padding: "7px 13px", borderRadius: 20, border: action.label === a.label ? "2px solid #5A8A5A" : "2px solid #E8E4DF", background: action.label === a.label ? "#EAF2EA" : "#fff", color: action.label === a.label ? "#3A6E3A" : "#3A3A36", fontSize: 13, fontWeight: action.label === a.label ? 600 : 400, cursor: "pointer" }}>
                  {a.emoji} {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#7A7A72", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 8 }}>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = "#5A8A5A"}
              onBlur={e => e.target.style.borderColor = "#E8E4DF"}
            />
          </div>

          {/* Time */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#7A7A72", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 8 }}>Time (optional)</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = "#5A8A5A"}
              onBlur={e => e.target.style.borderColor = "#E8E4DF"}
            />
          </div>

          {/* Note */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#7A7A72", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 8 }}>Note (optional)</label>
            <input type="text" value={detail} onChange={e => setDetail(e.target.value)} placeholder="e.g. Use organic fertilizer"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = "#5A8A5A"}
              onBlur={e => e.target.style.borderColor = "#E8E4DF"}
            />
          </div>

          <button onClick={handleSave} disabled={!canSave}
            style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: canSave ? "#5A8A5A" : "#D0CCC6", color: "#fff", fontSize: 15, fontWeight: 600, cursor: canSave ? "pointer" : "not-allowed", fontFamily: "Inter, sans-serif" }}>
            Add Reminder
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Reminders() {
  const { reminders, gardenPlants, toggleReminder, deleteReminder, addReminder } = useGarden();
  const [showModal, setShowModal] = useState(false);

  const today      = todayStr();
  const todayTasks = reminders.filter(r => r.date === today);
  const overdue    = reminders.filter(r => isOverdue(r.date) && !r.completed);

  const upcoming = reminders.filter(r => r.date > today);
  const upcomingByDate = upcoming.reduce((acc, t) => {
    if (!acc[t.date]) acc[t.date] = [];
    acc[t.date].push(t);
    return acc;
  }, {});
  const upcomingDates = Object.keys(upcomingByDate).sort();

  const doneCount   = todayTasks.filter(r => r.completed).length;
  const allDone     = todayTasks.length > 0 && doneCount === todayTasks.length;
  const progressPct = todayTasks.length > 0 ? Math.round((doneCount / todayTasks.length) * 100) : 0;

  const todayLabel = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const sectionLabel = { fontSize: 12, fontWeight: 600, color: "#B0ADA8", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 };
  const card = { background: "#fff", borderRadius: 16, border: "1px solid #E8E4DF", overflow: "hidden" };

  return (
    <div style={{ fontFamily: "Inter, -apple-system, sans-serif", background: "#F7F5F2", minHeight: "100%", paddingBottom: 100 }}>

      {/* Header */}
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #E8E4DF", background: "#F7F5F2", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#1C1C1A", letterSpacing: "-0.02em" }}>Care Schedule</h1>
            <p style={{ margin: "3px 0 0", fontSize: 13, color: "#7A7A72" }}>{todayLabel}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ padding: "6px 12px", borderRadius: 20, background: allDone ? "#EAF2EA" : "#F0EDE8", fontSize: 12, fontWeight: 600, color: allDone ? "#3A6E3A" : "#7A7A72" }}>
              {todayTasks.length === 0 ? "No tasks today" : allDone ? "✅ All done!" : `${doneCount}/${todayTasks.length} done`}
            </div>
            <button onClick={() => setShowModal(true)}
              style={{ width: 36, height: 36, borderRadius: "50%", background: "#5A8A5A", border: "none", color: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(90,138,90,0.3)" }}>
              +
            </button>
          </div>
        </div>
        {todayTasks.length > 0 && (
          <div style={{ height: 5, borderRadius: 10, background: "#E8E4DF", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progressPct}%`, borderRadius: 10, background: "#5A8A5A", transition: "width 0.3s ease" }} />
          </div>
        )}
      </div>

      <div style={{ padding: "20px 16px 0", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Overdue */}
        {overdue.length > 0 && (
          <section>
            <div style={{ ...sectionLabel, color: "#B91C1C" }}>⚠️ Overdue</div>
            <div style={{ ...card, border: "1px solid #FECACA", background: "#FEF2F2" }}>
              {overdue.map((task, i) => (
                <div key={task.id} style={{ borderBottom: i < overdue.length - 1 ? "1px solid #FECACA" : "none" }}>
                  <TaskRow task={task} showCheck={true} onToggle={toggleReminder} onDelete={deleteReminder} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Today */}
        <section>
          <div style={sectionLabel}>Today</div>
          {todayTasks.length === 0 ? (
            <div style={{ ...card, padding: "28px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🌿</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#1C1C1A", marginBottom: 4 }}>Nothing scheduled today</div>
              <div style={{ fontSize: 13, color: "#7A7A72" }}>Tap + to add a reminder.</div>
            </div>
          ) : allDone ? (
            <div style={{ background: "#EAF2EA", borderRadius: 16, border: "1px solid #C8DEC8", padding: "28px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#3A6E3A", marginBottom: 4 }}>All done!</div>
              <div style={{ fontSize: 13, color: "#5A8A5A" }}>Your plants are well cared for today.</div>
            </div>
          ) : (
            <div style={card}>
              {todayTasks.map((task, i) => (
                <div key={task.id} style={{ borderBottom: i < todayTasks.length - 1 ? "1px solid #F0EDE8" : "none" }}>
                  <TaskRow task={task} showCheck={true} onToggle={toggleReminder} onDelete={deleteReminder} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Upcoming */}
        {upcomingDates.length > 0 && (
          <section>
            <div style={sectionLabel}>Coming Up</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {upcomingDates.map(date => (
                <div key={date}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#7A7A72", marginBottom: 6 }}>{formatDate(date)}</div>
                  <div style={card}>
                    {upcomingByDate[date].map((task, i) => (
                      <div key={task.id} style={{ borderBottom: i < upcomingByDate[date].length - 1 ? "1px solid #F0EDE8" : "none" }}>
                        <TaskRow task={task} showCheck={false} onToggle={toggleReminder} onDelete={deleteReminder} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {reminders.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#7A7A72" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔔</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#1C1C1A", marginBottom: 6 }}>No reminders yet</div>
            <div style={{ fontSize: 14, lineHeight: 1.5 }}>Tap + to schedule your first plant care task.</div>
          </div>
        )}
      </div>

      {showModal && (
        <AddReminderModal
          gardenPlants={gardenPlants}
          onClose={() => setShowModal(false)}
          onSave={r => { addReminder(r); setShowModal(false); }}
        />
      )}
    </div>
  );
}
