import React from "react";

export default function AdminDashboard({ user, stats, setPage }) {
  return (
    <div className="admin-dashboard">
      <button className="back-btn" onClick={() => setPage("home")}>
        ⬅ Back to Home
      </button>

      <h2 className="page-title">Admin Dashboard</h2>

      {/* Welcome Box */}
      <div className="admin-box welcome-box">
        <h3>Hello, {user?.name}</h3>
        <p>Role: admin</p>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card stat-blue">
          <h3>{stats?.totalUsers || 0}</h3>
          <p>Registered Users</p>
        </div>

        <div className="stat-card stat-green">
          <h3>{stats?.totalQuestions || 0}</h3>
          <p>Total Questions</p>
        </div>

        <div className="stat-card stat-orange">
          <h3>{stats?.totalAttempts || 0}</h3>
          <p>Attempts</p>
        </div>
      </div>

      {/* ACTION ROW 1 */}
      <div className="admin-actions-row">
        
        {/* Host Live Quiz */}
        <div
          className="admin-action-card action-red"
          onClick={() => setPage("live-host")}
        >
          <h3>🎯 Host Live Quiz</h3>
          <p>Start a real-time room.</p>
        </div>

        {/* Add Question */}
        <div
          className="admin-action-card action-purple"
          onClick={() => setPage("add-question")}
        >
          <h3>➕ Add Question</h3>
          <p>Create new quiz questions.</p>
        </div>

        {/* Manage Questions */}
        <div
          className="admin-action-card action-blue"
          onClick={() => setPage("manage-questions")}
        >
          <h3>🛠 Manage Questions</h3>
          <p>Edit or delete existing questions.</p>
        </div>
      </div>

      {/* ACTION ROW 2 */}
      <div className="admin-actions-row">
        <div
          className="admin-action-card action-green"
          onClick={() => setPage("analytics")}
        >
          <h3>📊 View Analytics</h3>
        </div>

        <div
          className="admin-action-card action-gold"
          onClick={() => setPage("leaderboard")}
        >
          <h3>🏆 View Leaderboard</h3>
        </div>
      </div>
    </div>
  );
}
