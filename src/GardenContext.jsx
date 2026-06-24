import { createContext, useContext, useState, useEffect } from "react";

const STORAGE_KEY = "mygardn_v1";

const DEFAULTS = {
  profile: {
    name: "",
    experience: "Beginner",
    environment: "Not specified",
    pets: "No pets",
    location: "",
  },
  onboarded:        false,
  isPremium:        false,
  aiMessageCount:   0,
  aiDiagnosisCount: 0,
  gardenPlants:     [],
  journalEntries:   [],
  reminders:        [],
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function save(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
  catch (e) { console.warn("Storage full:", e.message); }
}

const GardenContext = createContext(null);

export function GardenProvider({ children }) {
  const [state, setState] = useState(() => {
    const saved = load();
    if (!saved) return DEFAULTS;
    const merged = { ...DEFAULTS, ...saved };
    // Existing users who already have a name are considered onboarded
    if (saved.profile?.name && !merged.onboarded) merged.onboarded = true;
    return merged;
  });

  useEffect(() => { save(state); }, [state]);

  // ── Profile ──────────────────────────────────────────────────────────────
  function updateProfile(updates) {
    setState(s => ({ ...s, profile: { ...s.profile, ...updates } }));
  }

  // ── Onboarding / premium ─────────────────────────────────────────────────
  function setOnboarded() {
    setState(s => ({ ...s, onboarded: true }));
  }

  function unlockPremium() {
    setState(s => ({ ...s, isPremium: true }));
  }

  // ── AI usage counters ────────────────────────────────────────────────────
  function incrementAiMessage() {
    setState(s => ({ ...s, aiMessageCount: s.aiMessageCount + 1 }));
  }

  function incrementDiagnosis() {
    setState(s => ({ ...s, aiDiagnosisCount: s.aiDiagnosisCount + 1 }));
  }

  // ── Garden plants ────────────────────────────────────────────────────────
  function addPlant(plant) {
    setState(s => {
      if (s.gardenPlants.find(p => p.name === plant.name)) return s;
      return { ...s, gardenPlants: [...s.gardenPlants, plant] };
    });
  }

  function removePlant(id) {
    setState(s => ({ ...s, gardenPlants: s.gardenPlants.filter(p => p.id !== id) }));
  }

  // ── Journal ──────────────────────────────────────────────────────────────
  function addJournalEntry(entry) {
    setState(s => ({ ...s, journalEntries: [entry, ...s.journalEntries] }));
  }

  function deleteJournalEntry(id) {
    setState(s => ({ ...s, journalEntries: s.journalEntries.filter(e => e.id !== id) }));
  }

  // ── Reminders ────────────────────────────────────────────────────────────
  function addReminder(reminder) {
    setState(s => ({ ...s, reminders: [...s.reminders, reminder] }));
  }

  function toggleReminder(id) {
    setState(s => ({
      ...s,
      reminders: s.reminders.map(r =>
        r.id === id
          ? { ...r, completed: !r.completed, completedDate: !r.completed ? new Date().toISOString() : null }
          : r
      ),
    }));
  }

  function deleteReminder(id) {
    setState(s => ({ ...s, reminders: s.reminders.filter(r => r.id !== id) }));
  }

  // ── Computed ─────────────────────────────────────────────────────────────
  const todayStr = new Date().toISOString().split("T")[0];
  const todayReminders = state.reminders.filter(r => r.date === todayStr);

  const streak = (() => {
    const active = new Set();
    state.journalEntries.forEach(e => active.add(e.date));
    state.reminders.filter(r => r.completed && r.completedDate)
      .forEach(r => active.add(r.completedDate.split("T")[0]));
    let count = 0;
    const d = new Date();
    while (active.has(d.toISOString().split("T")[0])) {
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  })();

  const totalWaterings = state.reminders.filter(r => r.completed && r.action === "Water").length;
  const totalTasksDone = state.reminders.filter(r => r.completed).length;

  return (
    <GardenContext.Provider value={{
      profile:          state.profile,
      onboarded:        state.onboarded,
      isPremium:        state.isPremium,
      aiMessageCount:   state.aiMessageCount,
      aiDiagnosisCount: state.aiDiagnosisCount,
      gardenPlants:     state.gardenPlants,
      journalEntries:   state.journalEntries,
      reminders:        state.reminders,
      updateProfile,
      setOnboarded,
      unlockPremium,
      incrementAiMessage,
      incrementDiagnosis,
      addPlant,
      removePlant,
      addJournalEntry,
      deleteJournalEntry,
      addReminder,
      toggleReminder,
      deleteReminder,
      todayStr,
      todayReminders,
      streak,
      totalWaterings,
      totalTasksDone,
    }}>
      {children}
    </GardenContext.Provider>
  );
}

export function useGarden() {
  const ctx = useContext(GardenContext);
  if (!ctx) throw new Error("useGarden must be used inside GardenProvider");
  return ctx;
}
