import { useState } from "react";
import { useGarden } from "./GardenContext";

const EXPERIENCE_OPTIONS = ["Beginner", "Intermediate", "Advanced"];
const PET_OPTIONS = ["No Pets", "Has a cat 🐱", "Has a dog 🐶", "Has a cat & dog 🐱🐶", "Other pets"];
const ENVIRONMENT_OPTIONS = [
  "Low-light Apartment",
  "Bright Apartment",
  "House with Garden",
  "Condo / High-rise",
  "Townhouse",
];

const TOXIC_PLANTS = {
  cat: ["Pothos", "Philodendron", "Lily", "Aloe Vera", "Snake Plant", "Peace Lily", "Dracaena", "Sago Palm", "Tulip", "Azalea", "Oleander", "Jade Plant"],
  dog: ["Pothos", "Philodendron", "Sago Palm", "Tulip", "Azalea", "Oleander", "Grapes", "Onion", "Macadamia", "Xylitol"],
};

function getToxicAlert(petLabel, plantNames) {
  if (!petLabel || petLabel === "No Pets") return null;
  const hasCat = petLabel.toLowerCase().includes("cat");
  const hasDog = petLabel.toLowerCase().includes("dog");
  const flagged = [];
  plantNames.forEach(plant => {
    const toxicToCat = hasCat && TOXIC_PLANTS.cat.some(t => plant.toLowerCase().includes(t.toLowerCase()));
    const toxicToDog = hasDog && TOXIC_PLANTS.dog.some(t => plant.toLowerCase().includes(t.toLowerCase()));
    if (toxicToCat || toxicToDog) {
      const who = [toxicToCat && "cats", toxicToDog && "dogs"].filter(Boolean).join(" & ");
      flagged.push({ plant, who });
    }
  });
  return flagged.length > 0 ? flagged : null;
}

const SETTINGS = [
  {
    group: "Preferences",
    items: [
      { icon: "🔔", label: "Notification Settings", chevron: true },
      { icon: "🎨", label: "App Theme",              chevron: true, value: "Cream" },
    ],
  },
  {
    group: "Support",
    items: [
      { icon: "❓", label: "Help & Support", chevron: true },
      { icon: "⭐", label: "Rate My Gardn",  chevron: true },
      { icon: "📜", label: "Privacy Policy", chevron: true },
    ],
  },
];

function StatCard({ emoji, value, label }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8E4DF", padding: "16px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 22 }}>{emoji}</span>
      <span style={{ fontSize: 22, fontWeight: 700, color: "#1C1C1A", letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: 11, color: "#7A7A72", textAlign: "center", lineHeight: 1.3, fontWeight: 500 }}>{label}</span>
    </div>
  );
}

function BadgeChip({ emoji, label, earned }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0, opacity: earned ? 1 : 0.35 }}>
      <div style={{ width: 54, height: 54, borderRadius: 16, background: earned ? "#EAF2EA" : "#F0EDE8", border: earned ? "1.5px solid #C8DEC8" : "1.5px solid #E8E4DF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, position: "relative" }}>
        {emoji}
        {earned && (
          <div style={{ position: "absolute", bottom: -3, right: -3, width: 16, height: 16, borderRadius: "50%", background: "#5A8A5A", border: "2px solid #F7F5F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        )}
      </div>
      <span style={{ fontSize: 11, color: earned ? "#3A6E3A" : "#B0ADA8", fontWeight: earned ? 600 : 400, textAlign: "center", maxWidth: 60, lineHeight: 1.2 }}>{label}</span>
    </div>
  );
}

function SettingsRow({ icon, label, value, chevron, isLast }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderBottom: isLast ? "none" : "1px solid #F0EDE8", cursor: "pointer", background: "#fff" }}
      onMouseEnter={e => e.currentTarget.style.background = "#FAFAF8"}
      onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
      <div style={{ width: 32, height: 32, borderRadius: 9, background: "#F0EDE8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{icon}</div>
      <span style={{ flex: 1, fontSize: 14, color: "#1C1C1A" }}>{label}</span>
      {value && <span style={{ fontSize: 13, color: "#B0ADA8", marginRight: 4 }}>{value}</span>}
      {chevron && <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke="#C0BDB8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    </div>
  );
}

function SubscriptionCard({ isPremium, onOpenPaywall }) {
  if (isPremium) {
    return (
      <div style={{ background: "linear-gradient(135deg, #3D6B3D 0%, #5A8A5A 100%)", borderRadius: 16, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>✨</div>
        <div>
          <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: "#fff" }}>My Gardn Premium</p>
          <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.75)" }}>Subscription active · Billed monthly</p>
        </div>
        <div style={{ marginLeft: "auto", background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "4px 10px", fontSize: 11, fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>Active ✓</div>
      </div>
    );
  }
  return (
    <button onClick={onOpenPaywall}
      style={{ width: "100%", textAlign: "left", background: "#fff", border: "1.5px solid #C8DEC8", borderRadius: 16, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}
      onMouseDown={e => e.currentTarget.style.transform = "scale(0.98)"}
      onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}>
      <div style={{ width: 44, height: 44, borderRadius: 14, background: "#EAF2EA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>✨</div>
      <div>
        <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: "#1C1C1A" }}>Upgrade to Premium</p>
        <p style={{ margin: 0, fontSize: 12, color: "#7A7A72" }}>Unlimited AI advice + photo diagnosis</p>
      </div>
      <svg style={{ marginLeft: "auto", flexShrink: 0 }} width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke="#5A8A5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </button>
  );
}

function PillSelector({ options, selected, onSelect }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
      {options.map(opt => (
        <button key={opt} onClick={() => onSelect(opt)}
          style={{ padding: "7px 13px", borderRadius: 20, border: `1.5px solid ${selected === opt ? "#5A8A5A" : "#E8E4DF"}`, background: selected === opt ? "#EAF2EA" : "#fff", color: selected === opt ? "#3A6E3A" : "#555", fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: selected === opt ? 600 : 400, cursor: "pointer" }}>
          {opt}
        </button>
      ))}
    </div>
  );
}

function ToxicAlert({ alerts, petLabel, onDismiss }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 24, maxWidth: 340, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ fontSize: 36, textAlign: "center", marginBottom: 12 }}>⚠️</div>
        <h2 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 700, color: "#1C1C1A", textAlign: "center", fontFamily: "Inter, sans-serif" }}>Plant Safety Alert</h2>
        <p style={{ margin: "0 0 16px", fontSize: 13, color: "#555", textAlign: "center", lineHeight: 1.5, fontFamily: "Inter, sans-serif" }}>
          Now that you have <strong>{petLabel}</strong>, watch out — these plants in your garden may be toxic:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {alerts.map(({ plant, who }) => (
            <div key={plant} style={{ background: "#FEF3C7", border: "1px solid #F59E0B", borderRadius: 10, padding: "10px 14px", display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 18 }}>🌿</span>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#92400E", fontFamily: "Inter, sans-serif" }}>{plant}</p>
                <p style={{ margin: 0, fontSize: 12, color: "#92400E", fontFamily: "Inter, sans-serif" }}>Toxic to {who}</p>
              </div>
            </div>
          ))}
        </div>
        <button onClick={onDismiss}
          style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "#5A8A5A", color: "#fff", fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          Got it, I'll take care of it
        </button>
      </div>
    </div>
  );
}

function GardenProfileEditor({ profile, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(profile);

  // keep draft in sync if profile changes from outside
  if (!editing && JSON.stringify(draft) !== JSON.stringify(profile)) {
    setDraft(profile);
  }

  if (!editing) {
    return (
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8E4DF", overflow: "hidden" }}>
        {[
          { icon: "🌱", label: "Experience",   value: profile.experience },
          { icon: "🏠", label: "Environment",  value: profile.environment },
          { icon: "🐾", label: "Pets",         value: profile.pets },
          { icon: "📍", label: "Location",     value: profile.location },
        ].map(({ icon, label, value }, i, arr) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderBottom: i < arr.length - 1 ? "1px solid #F0EDE8" : "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "#F0EDE8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{icon}</div>
            <span style={{ flex: 1, fontSize: 14, color: "#1C1C1A", fontFamily: "Inter, sans-serif" }}>{label}</span>
            <span style={{ fontSize: 13, color: "#7A7A72", fontFamily: "Inter, sans-serif" }}>{value}</span>
          </div>
        ))}
        <button onClick={() => { setDraft(profile); setEditing(true); }}
          style={{ width: "100%", padding: "13px 16px", borderTop: "1px solid #F0EDE8", background: "transparent", border: "none", borderTop: "1px solid #F0EDE8", color: "#5A8A5A", fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "center" }}>
          ✏️ Edit My Garden Profile
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #5A8A5A", padding: 16, display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 600, color: "#B0ADA8", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "Inter, sans-serif" }}>Experience Level</p>
        <PillSelector options={EXPERIENCE_OPTIONS} selected={draft.experience} onSelect={v => setDraft(d => ({ ...d, experience: v }))} />
      </div>
      <div>
        <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 600, color: "#B0ADA8", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "Inter, sans-serif" }}>Growing Environment</p>
        <PillSelector options={ENVIRONMENT_OPTIONS} selected={draft.environment} onSelect={v => setDraft(d => ({ ...d, environment: v }))} />
      </div>
      <div>
        <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 600, color: "#B0ADA8", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "Inter, sans-serif" }}>Pets at Home</p>
        <PillSelector options={PET_OPTIONS} selected={draft.pets} onSelect={v => setDraft(d => ({ ...d, pets: v }))} />
      </div>
      <div>
        <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 600, color: "#B0ADA8", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "Inter, sans-serif" }}>Your Location</p>
        <input type="text" value={draft.location} onChange={e => setDraft(d => ({ ...d, location: e.target.value }))} placeholder="e.g. Holly Springs, NC"
          style={{ width: "100%", padding: "10px 13px", border: "1.5px solid #E8E4DF", borderRadius: 10, fontFamily: "Inter, sans-serif", fontSize: 14, color: "#1C1C1A", outline: "none", boxSizing: "border-box", marginTop: 8 }}
          onFocus={e => e.target.style.borderColor = "#5A8A5A"}
          onBlur={e => e.target.style.borderColor = "#E8E4DF"}
        />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => { setDraft(profile); setEditing(false); }}
          style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid #E8E4DF", background: "transparent", color: "#555", fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
          Cancel
        </button>
        <button onClick={() => { onSave(draft); setEditing(false); }}
          style={{ flex: 2, padding: "12px", borderRadius: 12, border: "none", background: "#5A8A5A", color: "#fff", fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          Save Profile
        </button>
      </div>
    </div>
  );
}

export default function Profile({ isPremium = false, onOpenPaywall }) {
  const { profile, updateProfile, gardenPlants, journalEntries, reminders, totalWaterings, totalTasksDone, streak } = useGarden();

  const [editingName,    setEditingName]    = useState(false);
  const [nameDraft,      setNameDraft]      = useState(profile.name);
  const [toxicAlerts,    setToxicAlerts]    = useState(null);
  const [pendingPetLabel, setPendingPetLabel] = useState("");

  function handleSaveName() {
    if (nameDraft.trim()) updateProfile({ name: nameDraft.trim() });
    setEditingName(false);
  }

  function handleProfileSave(newProfile) {
    const petsChanged = profile.pets !== newProfile.pets && newProfile.pets !== "No Pets";
    if (petsChanged) {
      const alerts = getToxicAlert(newProfile.pets, gardenPlants.map(p => p.name));
      if (alerts) { setPendingPetLabel(newProfile.pets); setToxicAlerts(alerts); }
    }
    updateProfile(newProfile);
  }

  // Computed stats from real data
  const stats = [
    { emoji: "🪴", value: gardenPlants.length,  label: "Plants Growing" },
    { emoji: "📓", value: journalEntries.length, label: "Journal Entries" },
    { emoji: "✅", value: totalTasksDone,        label: "Tasks Completed" },
    { emoji: "⏱️", value: streak ? `${streak}d` : "0d", label: "Current Streak" },
  ];

  // Badges computed from real data
  const badges = [
    { emoji: "🌱", label: "First Sprout",   earned: gardenPlants.length >= 1 },
    { emoji: "🪴", label: "Plant Collector", earned: gardenPlants.length >= 5 },
    { emoji: "📓", label: "Journaler",      earned: journalEntries.length >= 3 },
    { emoji: "💧", label: "Daily Waterer",  earned: totalWaterings >= 5 },
    { emoji: "🌸", label: "Flower Power",   earned: gardenPlants.some(p => p.category === "Flowers") },
    { emoji: "✅", label: "Task Master",    earned: totalTasksDone >= 10 },
  ];

  const memberSince = (() => {
    const dates = [
      ...gardenPlants.map(p => p.dateAdded),
      ...journalEntries.map(e => e.date),
    ].filter(Boolean).sort();
    const d = dates[0] ? new Date(dates[0] + "T00:00:00") : new Date();
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  })();

  return (
    <div style={{ fontFamily: "Inter, -apple-system, sans-serif", background: "#F7F5F2", minHeight: "100vh", maxWidth: 480, margin: "0 auto", paddingBottom: 100 }}>

      {toxicAlerts && (
        <ToxicAlert alerts={toxicAlerts} petLabel={pendingPetLabel} onDismiss={() => setToxicAlerts(null)} />
      )}

      {/* User header */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 24px 28px" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #C8DEC8 0%, #5A8A5A 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, marginBottom: 14, boxShadow: "0 4px 16px rgba(90,138,90,0.2)" }}>
          🌿
        </div>

        {editingName ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <input autoFocus value={nameDraft} onChange={e => setNameDraft(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSaveName()}
              style={{ fontSize: 20, fontWeight: 700, color: "#1C1C1A", border: "none", borderBottom: "2px solid #5A8A5A", background: "transparent", textAlign: "center", outline: "none", fontFamily: "Inter, sans-serif", letterSpacing: "-0.02em", width: 160 }} />
            <button onClick={handleSaveName}
              style={{ background: "#5A8A5A", border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 600, padding: "4px 10px", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
              Save
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, cursor: "pointer" }} onClick={() => { setNameDraft(profile.name); setEditingName(true); }}>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1C1C1A", letterSpacing: "-0.02em", fontFamily: "Inter, sans-serif" }}>{profile.name}</h1>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9 2l2 2-6 6H3V8l6-6z" stroke="#B0ADA8" strokeWidth="1.3" strokeLinejoin="round"/></svg>
          </div>
        )}

        <p style={{ margin: 0, fontSize: 13, color: "#7A7A72", fontFamily: "Inter, sans-serif" }}>Member since {memberSince}</p>
        <div style={{ marginTop: 12, padding: "5px 14px", background: "#EAF2EA", borderRadius: 20, fontSize: 12, fontWeight: 600, color: "#3A6E3A", fontFamily: "Inter, sans-serif" }}>🌿 Active Gardener</div>
      </div>

      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Subscription */}
        <section>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#B0ADA8", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10, fontFamily: "Inter, sans-serif" }}>Subscription</div>
          <SubscriptionCard isPremium={isPremium} onOpenPaywall={onOpenPaywall} />
        </section>

        {/* Garden Profile */}
        <section>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#B0ADA8", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10, fontFamily: "Inter, sans-serif" }}>My Garden Profile</div>
          <p style={{ margin: "0 0 12px", fontSize: 12, color: "#7A7A72", lineHeight: 1.5, fontFamily: "Inter, sans-serif" }}>
            The AI Advisor reads this to personalise your advice.
          </p>
          <GardenProfileEditor profile={profile} onSave={handleProfileSave} />
        </section>

        {/* Stats */}
        <section>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#B0ADA8", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10, fontFamily: "Inter, sans-serif" }}>Your Stats</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {stats.map(s => <StatCard key={s.label} {...s} />)}
          </div>
        </section>

        {/* Badges */}
        <section>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#B0ADA8", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "Inter, sans-serif" }}>Badges</div>
            <span style={{ fontSize: 12, color: "#5A8A5A", fontWeight: 600, fontFamily: "Inter, sans-serif" }}>{badges.filter(b => b.earned).length}/{badges.length} earned</span>
          </div>
          <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 6, scrollbarWidth: "none" }}>
            {badges.map(b => <BadgeChip key={b.label} {...b} />)}
          </div>
        </section>

        {/* Settings */}
        <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#B0ADA8", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "Inter, sans-serif" }}>Settings</div>
          {SETTINGS.map(group => (
            <div key={group.group}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#B0ADA8", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6, paddingLeft: 4, fontFamily: "Inter, sans-serif" }}>{group.group}</div>
              <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8E4DF", overflow: "hidden" }}>
                {group.items.map((item, i) => <SettingsRow key={item.label} {...item} isLast={i === group.items.length - 1} />)}
              </div>
            </div>
          ))}
        </section>

        <button style={{ width: "100%", padding: "14px", borderRadius: 12, border: "1.5px solid #E8E4DF", background: "transparent", color: "#C0392B", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif", marginTop: 4 }}>
          Sign Out
        </button>
        <p style={{ textAlign: "center", fontSize: 11, color: "#C0BDB8", margin: "0 0 8px", fontFamily: "Inter, sans-serif" }}>My Gardn v1.0 · Made with 🌿</p>
      </div>
    </div>
  );
}
