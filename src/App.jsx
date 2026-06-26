import { useState, useEffect } from "react";
import Encyclopedia from "./Encyclopedia";
import Advisor from "./Advisor";
import Journal from "./Journal";
import Profile from "./Profile";
import Reminders from "./Reminders";
import Paywall from "./Paywall";
import Diagnosis from "./Diagnosis";
import Onboarding from "./Onboarding";
import { useGarden } from "./GardenContext";
import MyPlants from "./components/MyPlants";
import SplashScreen from "./components/SplashScreen";

const MAX_FREE_AI_MESSAGES = 3;
const MAX_FREE_DIAGNOSES   = 1;

// ── Icons ────────────────────────────────────────────────────────────────────

const HomeIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
    <path d="M9 21V12h6v9" />
  </svg>
);
const BookIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
  </svg>
);
const JournalIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M9 21V9" />
  </svg>
);
const ProfileIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);
const AdvisorIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4M8 15h.01M16 15h.01" />
  </svg>
);
const LeafIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 2-8 2" />
  </svg>
);
const BotIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4M8 15h.01M16 15h.01" />
  </svg>
);
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);
const MicroscopeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5l2 2-4 4-2-2a1 1 0 010-1.4l2.6-2.6A1 1 0 019 5z" />
    <path d="M11 7l4 4" /><path d="M7 21h10M12 17v4M6 13a6 6 0 1012 0" />
  </svg>
);
const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
);

// ── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return "Good morning";
  if (h >= 12 && h < 17) return "Good afternoon";
  if (h >= 17 && h < 21) return "Good evening";
  return "Good night";
}

function useClockTime() {
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  );
  useEffect(() => {
    const t = setInterval(() =>
      setTime(new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }))
    , 60_000);
    return () => clearInterval(t);
  }, []);
  return time;
}

function useIsMobile() {
  return true;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function QuickCard({ icon, title, subtitle, accent, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ background: "#fff", border: "1px solid #ECEAE6", borderRadius: "16px", padding: "16px", display: "flex", alignItems: "flex-start", gap: "12px", width: "100%", textAlign: "left", cursor: "pointer" }}
      onMouseDown={e => e.currentTarget.style.transform = "scale(0.97)"}
      onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
      onTouchStart={e => e.currentTarget.style.transform = "scale(0.97)"}
      onTouchEnd={e => e.currentTarget.style.transform = "scale(1)"}
    >
      <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#5A8A5A" }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontFamily: "'Inter', system-ui, sans-serif", fontSize: "14px", fontWeight: 600, color: "#1A1A1A", lineHeight: 1.3 }}>{title}</p>
        <p style={{ margin: "3px 0 0", fontFamily: "'Inter', system-ui, sans-serif", fontSize: "12px", color: "#888", lineHeight: 1.4 }}>{subtitle}</p>
      </div>
    </button>
  );
}

function SubViewHeader({ title, onBack }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "20px 20px 12px", borderBottom: "1px solid #ECEAE6", background: "#F7F5F2", flexShrink: 0 }}>
      <button onClick={onBack} style={{ width: "36px", height: "36px", borderRadius: "10px", border: "1px solid #ECEAE6", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, color: "#1A1A1A" }}>
        <ArrowLeftIcon />
      </button>
      <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: "17px", fontWeight: 600, color: "#1A1A1A" }}>{title}</span>
    </div>
  );
}

function HomeScreen({ onNavigate }) {
  const { todayReminders, streak, profile } = useGarden();
  const greeting = getGreeting();
  const todayLabel = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const todayISO   = new Date().toISOString().split("T")[0];

  const myPlants = (() => {
    try { return JSON.parse(localStorage.getItem("myPlants") || "[]"); }
    catch { return []; }
  })();

  const wateringTasks = myPlants.filter(p => p.nextWatering && p.nextWatering <= todayISO);
  const totalTasks    = wateringTasks.length + todayReminders.length;

  const stats = [
    { label: "PLANTS",      value: myPlants.length || 0 },
    { label: "TASKS TODAY", value: totalTasks },
    { label: "STREAK",      value: streak ? `${streak}d` : "—" },
  ];

  const FONT = "'Inter', system-ui, sans-serif";

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px 100px" }}>

      {/* Greeting */}
      <div style={{ marginBottom: "24px" }}>
        <p style={{ margin: "0 0 2px", fontFamily: FONT, fontSize: "12px", color: "#888", fontWeight: 500, letterSpacing: "0.03em", textTransform: "uppercase" }}>{todayLabel}</p>
        <h1 style={{ margin: 0, fontFamily: FONT, fontSize: "22px", fontWeight: 700, color: "#1A1A1A", lineHeight: 1.2 }}>{greeting} 🌿</h1>
        <p style={{ margin: "4px 0 0", fontFamily: FONT, fontSize: "14px", color: "#888" }}>
          {profile?.name ? `What does ${profile.name}'s garden need today?` : "What does your garden need today?"}
        </p>
      </div>

      {/* Stats bar */}
      <div style={{ background: "#5A8A5A", borderRadius: "16px", padding: "16px 18px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {stats.map(({ label, value }, i) => (
          <div key={label} style={{ textAlign: i === 0 ? "left" : i === 2 ? "right" : "center" }}>
            <p style={{ margin: 0, fontFamily: FONT, fontSize: "11px", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{label}</p>
            <p style={{ margin: "2px 0 0", fontFamily: FONT, fontSize: "26px", fontWeight: 700, color: "#fff" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Today's Tasks */}
      <p style={{ margin: "0 0 12px", fontFamily: FONT, fontSize: "13px", fontWeight: 600, color: "#555", letterSpacing: "0.04em", textTransform: "uppercase" }}>Today's Tasks</p>

      {totalTasks === 0 ? (
        <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #ECEAE6", padding: "20px 16px", marginBottom: "24px", textAlign: "center" }}>
          <p style={{ margin: 0, fontFamily: FONT, fontSize: "14px", color: "#888" }}>All caught up for today 🌱</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
          {wateringTasks.map(plant => {
            const overdue = plant.nextWatering < todayISO;
            return (
              <div key={plant.id} style={{ background: "#fff", borderRadius: "14px", border: `1px solid ${overdue ? "#FFCDD2" : "#ECEAE6"}`, padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: overdue ? "#FFEBEE" : "#EAF2EA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>💧</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontFamily: FONT, fontSize: "14px", fontWeight: 600, color: "#1A1A1A" }}>Water {plant.name}</p>
                  <p style={{ margin: "2px 0 0", fontFamily: FONT, fontSize: "12px", color: overdue ? "#D96B6B" : "#5A8A5A" }}>{overdue ? "Overdue" : "Due today"}</p>
                </div>
              </div>
            );
          })}
          {todayReminders.map(r => (
            <div key={r.id} style={{ background: "#fff", borderRadius: "14px", border: "1px solid #ECEAE6", padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EAF2EA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{r.emoji || "🌿"}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontFamily: FONT, fontSize: "14px", fontWeight: 600, color: "#1A1A1A" }}>{r.action} {r.plantName}</p>
                {r.detail ? <p style={{ margin: "2px 0 0", fontFamily: FONT, fontSize: "12px", color: "#888" }}>{r.detail}</p> : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick actions — compact side-by-side */}
      <p style={{ margin: "0 0 12px", fontFamily: FONT, fontSize: "13px", fontWeight: 600, color: "#555", letterSpacing: "0.04em", textTransform: "uppercase" }}>Quick Actions</p>
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={() => onNavigate("advisor")}
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "13px 10px", background: "#fff", border: "1px solid #ECEAE6", borderRadius: "14px", cursor: "pointer", fontFamily: FONT, fontSize: "13px", fontWeight: 600, color: "#1A1A1A" }}
          onMouseDown={e => (e.currentTarget.style.background = "#EAF2EA")}
          onMouseUp={e => (e.currentTarget.style.background = "#fff")}
          onTouchStart={e => (e.currentTarget.style.background = "#EAF2EA")}
          onTouchEnd={e => (e.currentTarget.style.background = "#fff")}
        >
          <BotIcon /> AI Advisor
        </button>
        <button
          onClick={() => onNavigate("diagnosis")}
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "13px 10px", background: "#fff", border: "1px solid #ECEAE6", borderRadius: "14px", cursor: "pointer", fontFamily: FONT, fontSize: "13px", fontWeight: 600, color: "#1A1A1A" }}
          onMouseDown={e => (e.currentTarget.style.background = "#EAF2EA")}
          onMouseUp={e => (e.currentTarget.style.background = "#fff")}
          onTouchStart={e => (e.currentTarget.style.background = "#EAF2EA")}
          onTouchEnd={e => (e.currentTarget.style.background = "#fff")}
        >
          <MicroscopeIcon /> Diagnose
        </button>
      </div>

    </div>
  );
}

function BottomNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: "home",      label: "Home",      Icon: HomeIcon },
    { id: "myplants",  label: "My Plants", Icon: LeafIcon },
    { id: "advisor",   label: "Advisor",   Icon: AdvisorIcon },
    { id: "diagnosis", label: "Diagnose",  Icon: MicroscopeIcon },
    { id: "profile",   label: "Profile",   Icon: ProfileIcon },
  ];
  return (
    <div style={{ background: "#fff", borderTop: "1px solid #ECEAE6", display: "flex", alignItems: "stretch", zIndex: 100, paddingBottom: "env(safe-area-inset-bottom)", flexShrink: 0, minHeight: "60px" }}>
      {tabs.map(({ id, label, Icon }) => {
        const active = activeTab === id;
        return (
          <button key={id} onClick={() => onTabChange(id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3px", border: "none", background: "transparent", cursor: "pointer", color: active ? "#5A8A5A" : "#AAAA9F", padding: "0 2px" }} aria-label={label} aria-current={active ? "page" : undefined}>
            <Icon active={active} />
            <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: "10px", fontWeight: active ? 600 : 400 }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function PaywallOverlay({ onUnlock, onClose }) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "flex-end" }}>
      <div style={{ width: "100%", maxHeight: "92%", overflowY: "auto", borderRadius: "24px 24px 0 0", background: "#F7F5F2", display: "flex", flexDirection: "column" }}>
        <Paywall onUnlock={onUnlock} mode="limit" onBack={onClose} />
      </div>
    </div>
  );
}

// ── Root app ─────────────────────────────────────────────────────────────────

export default function App() {
  const {
    profile, onboarded,
    isPremium, unlockPremium,
    aiMessageCount, incrementAiMessage,
    aiDiagnosisCount, incrementDiagnosis,
  } = useGarden();

  const [showSplash,  setShowSplash]  = useState(true);
  const [activeTab,   setActiveTab]   = useState("home");
  const [subView,     setSubView]     = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);

  const time     = useClockTime();
  const isMobile = useIsMobile();

  const handleUnlock = () => { unlockPremium(); setShowPaywall(false); };

  const handleTabChange = (tab) => { setSubView(null); setActiveTab(tab); };
  const handleSubNav    = (view) => { setSubView(view); setActiveTab("home"); };
  const handleBack      = () => setSubView(null);

  const handleAiMessage = () => {
    if (!isPremium && aiMessageCount >= MAX_FREE_AI_MESSAGES) {
      setShowPaywall(true);
      return false;
    }
    incrementAiMessage();
    return true;
  };

  const handleDiagnosisAttempt = () => {
    if (!isPremium && aiDiagnosisCount >= MAX_FREE_DIAGNOSES) {
      setShowPaywall(true);
      return false;
    }
    incrementDiagnosis();
    return true;
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // Show onboarding for new users
  if (!onboarded) {
    return (
      <div style={isMobile ? { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "#F7F5F2", display: "flex", flexDirection: "column" } : { minHeight: "100vh", background: "#E8E5DF", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={isMobile ? { flex: 1, display: "flex", flexDirection: "column", paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" } : { width: "100%", maxWidth: "390px", height: "calc(100vh - 64px)", minHeight: "600px", background: "#F7F5F2", borderRadius: "44px", boxShadow: "0 32px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <Onboarding />
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (subView === "advisor")
      return (
        <>
          <SubViewHeader title="AI Advisor" onBack={handleBack} />
          <div style={{ flex: 1, overflowY: "auto" }}>
            <Advisor
              userProfile={profile}
              isPremium={isPremium}
              aiMessageCount={aiMessageCount}
              maxFreeActions={MAX_FREE_AI_MESSAGES}
              onMessageAttempt={handleAiMessage}
            />
          </div>
        </>
      );
    if (subView === "reminders")
      return (
        <>
          <SubViewHeader title="Care Reminders" onBack={handleBack} />
          <div style={{ flex: 1, overflowY: "auto" }}><Reminders /></div>
        </>
      );
    if (subView === "diagnosis")
      return (
        <>
          <SubViewHeader title="Plant Diagnosis" onBack={handleBack} />
          <div style={{ flex: 1, overflowY: "auto" }}>
            <Diagnosis
              userProfile={profile}
              onBack={handleBack}
              onDiagnosisAttempt={handleDiagnosisAttempt}
            />
          </div>
        </>
      );

    switch (activeTab) {
      case "home":         return <HomeScreen onNavigate={handleSubNav} />;
      case "myplants":     return <div style={{ flex: 1, overflowY: "auto" }}><MyPlants /></div>;
      case "diagnosis":
        return (
          <div style={{ flex: 1, overflowY: "auto" }}>
            <Diagnosis
              userProfile={profile}
              onBack={() => handleTabChange("home")}
              onDiagnosisAttempt={handleDiagnosisAttempt}
            />
          </div>
        );
      case "journal":      return <div style={{ flex: 1, overflowY: "auto", height: "100%" }}><Journal /></div>;
      case "encyclopedia": return <div style={{ flex: 1, overflowY: "auto" }}><Encyclopedia /></div>;
      case "advisor":
        return (
          <div style={{ flex: 1, overflowY: "auto" }}>
            <Advisor
              userProfile={profile}
              isPremium={isPremium}
              aiMessageCount={aiMessageCount}
              maxFreeActions={MAX_FREE_AI_MESSAGES}
              onMessageAttempt={handleAiMessage}
            />
          </div>
        );
      case "profile":
        return (
          <div style={{ flex: 1, overflowY: "auto" }}>
            <Profile isPremium={isPremium} onOpenPaywall={() => setShowPaywall(true)} />
          </div>
        );
      default: return <HomeScreen onNavigate={handleSubNav} />;
    }
  };

  const outerStyle = isMobile
  ? { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "#F7F5F2", display: "flex", flexDirection: "column" }
  : { minHeight: "100vh", background: "#E8E5DF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif" };

const shellStyle = isMobile
  ? { flex: 1, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }
  : { width: "100%", maxWidth: "390px", height: "calc(100vh - 64px)", minHeight: "600px", background: "#F7F5F2", borderRadius: "44px", boxShadow: "0 32px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06)", overflow: "hidden", position: "relative", display: "flex", flexDirection: "column" };

  return (
    <div style={outerStyle}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
      <div style={shellStyle}>

        {/* Status bar — desktop mockup only */}
        {!isMobile && <div style={{ height: "44px", background: "#F7F5F2", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", flexShrink: 0 }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#1A1A1A" }}>{time}</span>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <svg width="16" height="12" viewBox="0 0 16 12" fill="#1A1A1A">
              <rect x="0" y="8" width="3" height="4" rx="0.5"/><rect x="4" y="5" width="3" height="7" rx="0.5"/><rect x="8" y="2" width="3" height="10" rx="0.5"/><rect x="12" y="0" width="3" height="12" rx="0.5"/>
            </svg>
            <svg width="22" height="12" viewBox="0 0 22 12" fill="none">
              <rect x="0.5" y="0.5" width="18" height="11" rx="2.5" stroke="#1A1A1A" strokeWidth="1"/>
              <rect x="2" y="2" width="14" height="8" rx="1.5" fill="#1A1A1A"/>
              <path d="M20 4v4a2 2 0 000-4z" fill="#1A1A1A" opacity="0.4"/>
            </svg>
          </div>
        </div>}

        {/* App header */}
        <div style={{ padding: "4px 20px 12px", background: "#F7F5F2", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, borderBottom: subView ? "none" : "1px solid #ECEAE6" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "28px", height: "28px", background: "#5A8A5A", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><LeafIcon /></div>
            <span style={{ fontSize: "17px", fontWeight: 700, color: "#1A1A1A", letterSpacing: "-0.3px" }}>My Gardn</span>
          </div>
          <button onClick={() => handleSubNav("reminders")} style={{ width: "36px", height: "36px", borderRadius: "10px", border: "1px solid #ECEAE6", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#555" }}>
            <BellIcon />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {renderContent()}
        </div>

        {!subView && <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />}

        {showPaywall && (
          <PaywallOverlay onUnlock={handleUnlock} onClose={() => setShowPaywall(false)} />
        )}
      </div>
    </div>
  );
}
