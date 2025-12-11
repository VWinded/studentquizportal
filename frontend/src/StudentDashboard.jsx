import React, { useEffect, useState } from "react";
import { API } from "./api";
import "./studentdashboard.css";

export default function StudentDashboard({ user, setPage }) {
  const [myAttempts, setMyAttempts] = useState([]);

  useEffect(() => {
    fetch(API + "/get_attempts.php")
      .then((res) => res.json())
      .then((data) => {
        const mine = data.filter(
          (a) =>
            (a.name &&
              a.name.trim().toLowerCase() ===
                user.name.trim().toLowerCase()) ||
            (a.email &&
              a.email.trim().toLowerCase() ===
                user.email.trim().toLowerCase())
        );

        // --- NEW: normalize/ensure category for live attempts ---
        // Do not remove or change your existing logic; just map each row
        // and if category is missing but the row looks like a live attempt,
        // set category = "Live". This keeps your other fields intact.
        const processed = mine.map((r) => {
          // Detect live-like rows by common signals used in your app/backend:
          const looksLikeLive =
            r.type === "live" ||
            (r.platform && String(r.platform).toLowerCase().includes("menti")) || // Mentimeter shorthand
            (r.platform && String(r.platform).toLowerCase().includes("live")) ||
            (r.source && String(r.source).toLowerCase() === "live") ||
            (r.isLive === true) ||
            (r.quizType && String(r.quizType).toLowerCase() === "live");

          // If category is missing and row looks like live, set it.
          const category = r.category ?? (looksLikeLive ? "Live" : r.category);

          // Keep everything else the same but ensure category field exists
          return {
            ...r,
            category,
          };
        });

        setMyAttempts(processed.reverse());
      });
  }, [user]);

  // helper to display correct/total robustly
  const renderScorePair = (a) => {
    // prefer 'correct', or 'score'
    const correct = (typeof a.correct !== "undefined" && a.correct !== null && a.correct !== "")
      ? a.correct
      : (typeof a.score !== "undefined" && a.score !== null ? a.score : "");
    // prefer several total field names
    const total =
      a.total ??
      a.totalQuestions ??
      a.totalQ ??
      a.max ??
      a.totalScore ??
      a.total_possible ??
      "";
    return `${correct}/${total}`;
  };

  return (
    <div className="sd-container">

      <button className="sd-back-btn" onClick={() => setPage("home")}>
        ⬅ Back to Home
      </button>

      <h2 className="sd-title">Student Dashboard</h2>

      {/* ⭐ TOP WELCOME CARD */}
      <div className="sd-glass-card wide">
        <h3 className="sd-hello">Hello, {user?.name}</h3>
        <p className="sd-role">Role: student</p>
      </div>

      {/* ⭐ 3 STATS CARDS */}
      <div className="sd-stats-row">
        <div className="sd-glass-card stat">
          <h3>{myAttempts.length}</h3>
          <p>Quiz Attempts</p>
        </div>

        <div className="sd-glass-card stat">
          <h3>
            {myAttempts.length > 0
              ? Math.max(...myAttempts.map((a) => a.percent)) + "%"
              : "0%"}
          </h3>
          <p>Best Score</p>
        </div>

        <div className="sd-glass-card stat">
          <h3>
            {myAttempts.length > 0
              ? Math.round(
                  myAttempts.reduce((a, b) => a + b.percent, 0) / myAttempts.length
                ) + "%"
              : "0%"}
          </h3>
          <p>Average %</p>
        </div>
      </div>

      {/* ⭐ QUIZ ATTEMPTS TABLE CARD */}
      <div className="sd-glass-card table-card">
        <h3 className="sd-subtitle">Your Quiz Attempts</h3>

        {myAttempts.length === 0 ? (
          <p className="sd-empty">No attempts yet.</p>
        ) : (
          <table className="sd-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Date / Time</th>
                <th>Category</th>
                <th>Score</th>
                <th>Percentage</th>
              </tr>
            </thead>

            <tbody>
              {myAttempts.map((a, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{a.date}</td>
                  <td>{a.category ?? (a.type === "live" ? "Live" : "-")}</td>
                  <td>
                    { /* REPLACED display with robust fallback (fix) */ }
                    {renderScorePair(a)}
                  </td>
                  <td>{a.percent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ⭐ SEPARATE GLASS BUTTON CARDS */}
      <div className="sd-actions">
        <div className="sd-glass-card action analytics">
  <button className="sd-btn-big" onClick={() => setPage("analytics")}>
    📊 View Analytics
  </button>
</div>

<div className="sd-glass-card action quiz">
  <button className="sd-btn-big" onClick={() => setPage("quiz-setup")}>
    📝 Take a Quiz
  </button>
</div>

      </div>
    </div>
  );
}
