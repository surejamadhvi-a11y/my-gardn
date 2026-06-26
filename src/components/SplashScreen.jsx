import { useState, useEffect } from "react";

export default function SplashScreen({ onComplete }) {
  const [logoReady,   setLogoReady]   = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const [fadingOut,   setFadingOut]   = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLogoReady(true),   50);
    const t2 = setTimeout(() => setTextVisible(true), 1000);
    const t3 = setTimeout(() => setFadingOut(true),   2800);
    const t4 = setTimeout(() => onComplete(),         3600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#F7F5F2",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: fadingOut ? 0 : 1,
        transition: fadingOut ? "opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
        pointerEvents: "none",
      }}
    >
      <img
        src="/logo.png"
        alt=""
        style={{
          width: 96,
          height: 96,
          objectFit: "contain",
          opacity: logoReady ? 1 : 0,
          transform: logoReady ? "scale(1) translateY(0)" : "scale(0.82) translateY(8px)",
          transition: "opacity 1.1s cubic-bezier(0.16, 1, 0.3, 1), transform 1.1s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />
      <p
        style={{
          margin: "14px 0 0",
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: "18px",
          fontWeight: 300,
          letterSpacing: "4px",
          color: "#5A8A5A",
          opacity: textVisible ? 1 : 0,
          transform: textVisible ? "translateY(0)" : "translateY(6px)",
          transition: "opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        My Gardn
      </p>
    </div>
  );
}
