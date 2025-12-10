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

        setMyAttempts(mine.reverse());
      });
  }, [user]);

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
                  <td>{a.category}</td>
                  <td>
                    {a.correct}/{a.total}
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
