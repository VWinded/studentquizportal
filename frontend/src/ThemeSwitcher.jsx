// ThemeSwitcher.jsx  (replace your existing ThemeSwitcher.jsx)
import React, { useState, useEffect } from "react";
import "./theme-switcher.css";

const themes = [
  // your original dark themes (kept exactly)
  { name: "OceanDefault", label: "Ocean Default", color: "#4c6ef5" },
  { name: "NeoBlueDark", label: "Neo Blue Dark", color: "#0b1d3a" },
  { name: "CyberPurpleDark", label: "Cyber Purple", color: "#3d0066" },

  // NEW light themes added below (professional names)
  { name: "theme-classic-light", label: "Classic Light (Corporate)", color: "#0077cc" },
  { name: "theme-pearl", label: "Pearl (Warm Premium)", color: "#ff6b35" },
  { name: "theme-snow", label: "Snow (Ultra Light)", color: "#0066ff" },
];

export default function ThemeSwitcher({ open }) {
  const [activeTheme, setActiveTheme] = useState("NeoBlueDark");

  // Load saved theme on mount
  // ThemeSwitcher.jsx - only the relevant bits to replace
useEffect(() => {
  const saved = localStorage.getItem("theme") || "NeoBlueDark";
  setActiveTheme(saved);

  // remove any theme class from both html and body, then add the saved one
  const allThemeClasses = themes.map((t) => t.name);
  document.body.classList.remove(...allThemeClasses);
  document.documentElement.classList.remove(...allThemeClasses);

  document.body.classList.add(saved);
  document.documentElement.classList.add(saved);
}, []);


const applyTheme = (theme) => {
  const all = themes.map((t) => t.name);
  // remove old from both html and body
  document.documentElement.classList.remove(...all);
  document.body.classList.remove(...all);

  // add to both html and body
  document.documentElement.classList.add(theme);
  document.body.classList.add(theme);

  setActiveTheme(theme);
  localStorage.setItem("theme", theme);

  // keep existing dispatch to close panel
  window.dispatchEvent(new CustomEvent("close_theme_panel"));
};

  if (!open) return null;

  return (
    <div className="top-theme-panel" role="dialog" aria-label="Select Theme">
      <h3>Select Theme</h3>

      {themes.map((t) => (
        <div
          key={t.name}
          className={`top-theme-option ${activeTheme === t.name ? "selected" : ""}`}
          onClick={() => applyTheme(t.name)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") applyTheme(t.name);
          }}
        >
          <div
            className="top-color-dot"
            style={{ background: t.color }}
            aria-hidden="true"
          />
          <span>{t.label}</span>
        </div>
      ))}
    </div>
  );
}
