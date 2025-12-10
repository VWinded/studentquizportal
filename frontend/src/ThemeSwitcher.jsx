import React, { useState, useEffect } from "react";
import "./theme-switcher.css";

const themes = [
  { name: "OceanDefault", label: "Ocean Default", color: "#4c6ef5" },
  { name: "NeoBlueDark", label: "Neo Blue Dark", color: "#0b1d3a" },
  { name: "CyberPurpleDark", label: "Cyber Purple", color: "#3d0066" },
];

export default function ThemeSwitcher({ open }) {
  const [activeTheme, setActiveTheme] = useState("OceanDefault");

  // Load saved theme
  useEffect(() => {
    const saved = localStorage.getItem("theme") || "OceanDefault";
    setActiveTheme(saved);
    document.body.classList.add(saved);
  }, []);

  const applyTheme = (theme) => {
  document.body.classList.remove(activeTheme);
  document.body.classList.add(theme);
  setActiveTheme(theme);
  localStorage.setItem("theme", theme);

  // ⭐ CLOSE PANEL AFTER SELECT
  const event = new Event("close_theme_panel");
  window.dispatchEvent(event);
};


  if (!open) return null;

  return (
    <div className="top-theme-panel">
      <h3>Select Theme</h3>

      {themes.map((t) => (
        <div
          key={t.name}
          className={`top-theme-option ${
            activeTheme === t.name ? "selected" : ""
          }`}
          onClick={() => applyTheme(t.name)}
        >
          <div
            className="top-color-dot"
            style={{ background: t.color }}
          ></div>
          <span>{t.label}</span>
        </div>
      ))}
    </div>
  );
}
