import React, { useEffect, useState } from "react";
import { API } from "./api";
import "./styles.css";

export default function Home({ user, setPage }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuestions: 0,
    totalAttempts: 0,
  });

  const [topUsers, setTopUsers] = useState([]);

  // Fetch global stats + leaderboard preview
  useEffect(() => {
    fetch(API + "/get_stats.php")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {});

    fetch(API + "/leaderboard.php")
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort((a, b) => b.score - a.score);
        setTopUsers(sorted.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  return (
    <div className="home-wrapper">
      {/* Floating background shapes */}
      <div className="circle circle1"></div>
      <div className="circle circle2"></div>

      {/* HERO SECTION WITH BORDER BOX */}
      <div className="hero-container">
        <div className="hero-box">

          <h1 className="title-text">Student Quiz Portal</h1>

          <p className="subtitle">
            Practice quizzes, track your progress, compete with others, and improve everyday!
          </p>

          {!user ? (
            <div className="button-row">
              <button className="main-btn" onClick={() => setPage("login")}>
                Login
              </button>
              <button className="main-btn" onClick={() => setPage("register")}>
                Register
              </button>
            </div>
          ) : (
            <div className="button-row">
              <button className="main-btn" onClick={() => setPage("quiz-setup")}>
  Start Quiz
</button>

              <button className="main-btn" onClick={() => setPage("dashboard")}>
                Dashboard
              </button>
            </div>
          )}

        </div>
      </div>

      {/* SHOW EVERYTHING BELOW ONLY IF LOGGED IN */}
      {user && (
        <>
          {/* PLATFORM STATS */}
          <div className="stats-section">
            <h2>Platform Statistics</h2>

            <div className="stats-grid">
              <div className="stat-box">
                <h3>{stats.totalUsers}</h3>
                <p>Registered Users</p>
              </div>

              <div className="stat-box">
                <h3>{stats.totalQuestions}</h3>
                <p>Total Questions</p>
              </div>

              <div className="stat-box">
                <h3>{stats.totalAttempts}</h3>
                <p>Quizzes Attempted</p>
              </div>
            </div>
          </div>

          {/* FEATURE CARDS */}
          <div className="feature-section">
            <div className="feature-card">
              <h3>💡 Practice Quizzes</h3>
              <p>Interactive MCQs to test your knowledge.</p>
            </div>

            <div className="feature-card">
              <h3>📊 Track Progress</h3>
              <p>View your score history and performance.</p>
            </div>

            <div className="feature-card">
              <h3>🏆 Leaderboard</h3>
              <p>Compete with top scoring students.</p>
            </div>

            <div className="feature-card">
              <h3>🛠 Admin Tools</h3>
              <p>Manage questions and quiz content.</p>
            </div>
          </div>

          {/* TOP USERS SECTION */}
          <div className="leader-preview">
            <h2>Top Performers</h2>

            {topUsers.length === 0 ? (
              <p>No leaderboard data yet.</p>
            ) : (
              <div className="leader-cards">
                {topUsers.map((u, i) => (
                  <div className="leader-card" key={i}>
                    <span className="rank">{i + 1}</span>
                    <h3>{u.name}</h3>
                    <p>{u.score} pts</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CALL TO ACTION */}
          <div className="cta-banner">
            <h2>Ready to test your knowledge?</h2>
            <button className="main-btn" onClick={() => setPage("quiz-setup")}>
  Start Quiz
</button>

          </div>
        </>
      )}
    </div>
  );
}
