import React, { useEffect, useState } from "react";
import { API } from "./api";

export default function Leaderboard({ setPage }) {
  const [rows, setRows] = useState([]);
  const [activeTab, setActiveTab] = useState("practice"); // ⭐ NEW

  useEffect(() => {
    fetch(API + "/leaderboard.php")
      .then((res) => res.json())
      .then((data) => setRows(data || []));
  }, []);

  // ⭐ FILTER rows by mode (practice / competition)
  const filteredRows = rows.filter((r) =>
    (r.mode || "practice") === activeTab
  );

  return (
    <div className="leaderboard-card">

      {/* Back button */}
      <button className="back-btn" onClick={() => setPage("home")}>
        ⬅ Back to Home
      </button>

      <h2>🏆 Leaderboard</h2>

      {/* ⭐ TABS */}
      <div className="lb-tabs">
        <button
          className={`lb-tab ${activeTab === "practice" ? "active" : ""}`}
          onClick={() => setActiveTab("practice")}
        >
          Practice
        </button>

        <button
          className={`lb-tab ${activeTab === "competition" ? "active" : ""}`}
          onClick={() => setActiveTab("competition")}
        >
          Competition ⚡
        </button>
      </div>

      {/* Empty State */}
      {filteredRows.length === 0 && (
        <p>No {activeTab} scores yet.</p>
      )}

      {/* Table (your original code, untouched) */}
      {filteredRows.length > 0 && (
        <table className="lb-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Score</th>
              {activeTab === "competition" && <th>Time Taken (s)</th>}
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {filteredRows.map((r, i) => (
              <tr key={i} className={i === 0 ? "top-rank" : ""}>
                <td>{i + 1}</td>
                <td>{r.name}</td>
                <td>{r.score}</td>

                {/* Competition-only column */}
                {activeTab === "competition" && (
                  <td>{r.timeTaken ?? "-"}</td>
                )}

                <td>{r.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
