import React, { useEffect, useState } from "react";
import { API } from "./api";
import "./online-quiz.css";

export default function OnlineLeaderboard({ setPage }) {
  const [rows, setRows] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  useEffect(() => {
    fetch(API + "/leaderboard_online.php")
      .then((res) => res.json())
      .then((data) => setRows(data || []))
      .catch(() => {});
  }, []);

  const filtered = rows.filter((r) => {
    const catMatch =
      categoryFilter === "all" || r.category === categoryFilter;

    const diffMatch =
      difficultyFilter === "all" || r.difficulty === difficultyFilter;

    return catMatch && diffMatch;
  });

  // Extract category list dynamically
  const categories = [...new Set(rows.map((r) => r.category))];

  return (
    <div className="online-container">
      <button className="back-btn" onClick={() => setPage("home")}>
        ⬅ Back to Home
      </button>

      <h2 className="online-title">🌍 Online Quiz Leaderboard</h2>

      {/* Filters */}
      <h3>Filter by Category</h3>
      <select
        className="online-select"
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
      >
        <option value="all">All</option>
        {categories.map((c, i) => (
          <option key={i} value={c}>{c}</option>
        ))}
      </select>

      <h3>Filter by Difficulty</h3>
      <select
        className="online-select"
        value={difficultyFilter}
        onChange={(e) => setDifficultyFilter(e.target.value)}
      >
        <option value="all">All</option>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>

      {/* Leaderboard Table */}
      {filtered.length === 0 ? (
        <p>No scores found.</p>
      ) : (
        <table className="lb-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Score</th>
              <th>Category</th>
              <th>Difficulty</th>
              <th>Time</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((r, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{r.name}</td>
                <td>{r.score}</td>
                <td>{r.category}</td>
                <td>{r.difficulty}</td>
                <td>{r.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
