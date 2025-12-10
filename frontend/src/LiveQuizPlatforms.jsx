import React from "react";
import { API } from "./api";
import "./live.css";

const PLATFORMS = [
  { name: "Mentimeter",  link: "https://www.mentimeter.com/s", icon: "🧠" },
  { name: "Kahoot",      link: "https://kahoot.it",             icon: "⚡" },
  { name: "Quizizz",     link: "https://quizizz.com/join",      icon: "📱" },
  { name: "Google Forms",link: "https://forms.google.com",      icon: "📝" },
  { name: "Quizlet Live",link: "https://quizlet.com/live",      icon: "📚" },
  { name: "AhaSlides",   link: "https://ahaslides.com",         icon: "🎤" }
];

export default function LiveQuizPlatforms({ user, setPage }) {
  
  const submitAttendance = async (platform, score) => {
    await fetch(API + "/live_mark_attendance.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: user.name,
        email: user.email,
        platform,
        score
      })
    });

    alert("Attendance Recorded 🎉");
    setPage("leaderboard");
  };

  return (
    <div className="live-platforms">
      <button className="back-btn" onClick={() => setPage("quiz-setup")}>
        ⬅ Back
      </button>

      <h2>🌍 Live Quiz Platforms</h2>

      {/* ⭐ NEW CLEAN GRID CONTAINER */}
      <div className="live-platforms-container">

        {PLATFORMS.map((p, i) => (
          <div key={i} className="live-card">

            <div className="live-header">
              <span className="live-icon">{p.icon}</span>
              <span className="live-name">{p.name}</span>
            </div>

            <div className="live-buttons">
              <a href={p.link} target="_blank" rel="noreferrer">
                <button className="live-open-btn">Open Platform</button>
              </a>

              <button
                className="live-attend-btn"
                onClick={() => {
                  const s = prompt("Enter score (or leave blank):");
                  submitAttendance(p.name, s || 0);
                }}
              >
                Mark Attendance
              </button>
            </div>

          </div>
        ))}

      </div>
    </div>
  );
}
