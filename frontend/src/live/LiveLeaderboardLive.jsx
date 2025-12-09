import React, { useEffect, useState } from "react";
import { API } from "../api";
import "./live.css";

export default function LiveLeaderboardLive({ setPage }) {
  const [rows, setRows] = useState([]);
  const roomId = localStorage.getItem("live_room");

  const loadScores = async () => {
    try {
      const res = await fetch(
        `${API}/live_quiz/live_leaderboard.php?room=${roomId}`
      );
      const data = await res.json();
      setRows(data);
    } catch (err) {
      console.error("Error loading scores", err);
    }
  };

  useEffect(() => {
    loadScores();
    const interval = setInterval(loadScores, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="leaderboard-card">
      <button className="back-btn" onClick={() => setPage("home")}>
        ⬅ Back to Home
      </button>

      <h2>🏆 Live Leaderboard</h2>

      {rows.length === 0 && <p>No scores yet...</p>}

      {rows.length > 0 && (
        <table className="lb-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Player</th>
              <th>Score</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{r.name}</td>
                <td>{r.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button
        className="main-btn"
        onClick={() => {
          localStorage.removeItem("live_room");
          setPage("home");
        }}
      >
        Exit Room
      </button>
    </div>
  );
}
