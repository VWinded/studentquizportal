import React from "react";

export default function StudentDashboard({ user, setPage }) {
  return (
    <div className="dashboard-wrapper">
      <button className="back-btn" onClick={() => setPage("home")}>
        ⬅ Back to Home
      </button>

      <h2 className="dashboard-title">Dashboard</h2>

      <div className="dashboard-card">
        <h3>Hello, {user?.name}</h3>
        <p>Role: student</p>

        <p>🎯 Your quiz attempts will appear here.</p>
        <p>📈 View your performance insights.</p>

        {/* ⭐ NEW — Students can Host Live Quiz */}
        <button className="dash-btn" onClick={() => setPage("live-host")}>
          Host Live Quiz
        </button>

        <button className="dash-btn" onClick={() => setPage("live-join")}>
          Join Live Quiz
        </button>

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
