import React, { useEffect, useState } from "react";
import { API } from "./api";

export default function StudentDashboard({ user, setPage }) {
  const [myAttempts, setMyAttempts] = useState([]);

  useEffect(() => {
    fetch(API + "/get_attempts.php")
      .then((res) => res.json())
      .then((data) => {
        const mine = data.filter(a => a.user === user.name);
        setMyAttempts(mine.reverse());
      });
  }, [user]);

  return (
    <div className="dashboard-wrapper">
      <button className="back-btn" onClick={() => setPage("home")}>
        ⬅ Back to Home
      </button>

      <h2 className="dashboard-title">Dashboard</h2>

      <div className="dashboard-card">
        <h3>Hello, {user?.name}</h3>
        <p>Role: student</p>

        <h3>Your Quiz Attempts</h3>

        {myAttempts.length === 0 ? (
          <p>No attempts yet.</p>
        ) : (
          <ul className="attempt-list">
            {myAttempts.map((a, i) => (
              <li key={i}>
                {a.date} — {a.category} — {a.correct}/{a.total} ({a.percent}%)
              </li>
            ))}
          </ul>
        )}


        <button className="dash-btn" onClick={() => setPage("analytics")}>
          View Analytics
        </button>

        <button className="dash-btn" onClick={() => setPage("quiz-setup")}>
          Take a Quiz
        </button>
      </div>
    </div>
  );
}
