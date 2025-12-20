// Leaderboard.jsx
import React, { useEffect, useState } from "react";
import { API } from "./api";

export default function Leaderboard({ setPage }) {
  const [practiceRows, setPracticeRows] = useState([]);
  const [competitionRows, setCompetitionRows] = useState([]);
  const [onlineRows, setOnlineRows] = useState([]);
  const [liveRows, setLiveRows] = useState([]);

  const [activeTab, setActiveTab] = useState("practice");

  // ⭐ Medal Logic (NO ❌ ever shown)
  const getMedal = (score, total) => {
    if (!total || total === 0) total = score; // competition fix
    const percent = Math.round((score / total) * 100);

    if (percent >= 90) return "🥇";
    if (percent >= 75) return "🥈";
    if (percent >= 50) return "🥉";

    return ""; // no symbol instead of ❌
  };

  useEffect(() => {
    fetch(API + "/leaderboard.php")
      .then((res) => res.json())
      .then((data) => {
        const p = data.filter((r) => (r.mode || "practice") === "practice");
        const c = data.filter((r) => (r.mode || "practice") === "competition");

        setPracticeRows(p);
        setCompetitionRows(c);
      })
      .catch(() => {});

    fetch(API + "/leaderboard_online.php")
      .then((res) => res.json())
      .then((data) => {
        // backend returns array of { name, score, total, category, difficulty, time, datetime }
        const normalized = Array.isArray(data)
          ? data.map((r) => ({
              user: r.name,
              score: Number(r.score ?? 0),
              total: Number(r.total ?? r.total ?? 0),
              category: r.category,
              difficulty: r.difficulty,
              time: r.time,
              date: r.datetime ?? r.time,
            }))
          : [];
        setOnlineRows(normalized);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(API + "/live_get_attempts.php")
      .then((res) => res.json())
      .then((data) => {
        // only approved live attempts should show
        const approved = (Array.isArray(data) ? data : []).filter(
          (x) => (x.status || "") === "approved"
        );
        // normalize structure to match other lists
        const normalized = approved.map((r) => ({
          user: r.user,
          score: Number(r.score ?? 0),
          total: Number(r.total ?? r.total ?? 0),
          subject: r.subject,
          platform: r.platform,
          date: r.date,
        }));
        setLiveRows(normalized.reverse());
      })
      .catch(() => {});
  }, []);

  const renderTable = (rows, type) => {
    if (!rows || rows.length === 0) {
      return <p>No {type} scores yet.</p>;
    }

    return (
  <div className="leaderboard-table-wrapper">
    <table className="lb-table">
      <thead>
        <tr>
          <th>#</th>

          {(type === "competition" || type === "online") && <th>Medal</th>}

          <th>Name</th>

          {type === "practice" && <th>Score</th>}

          {type === "competition" && (
            <>
              <th>Score</th>
              <th>Time Taken (s)</th>
            </>
          )}

          {type === "online" && (
            <>
              <th>Score</th>
              <th>Category</th>
              <th>Difficulty</th>
              <th>Time</th>
            </>
          )}

          {type === "live" && (
            <>
              <th>Score</th>
              <th>Total</th>
              <th>Subject</th>
              <th>Platform</th>
            </>
          )}

          <th>Date / Time</th>
        </tr>
      </thead>

      <tbody>
        {rows.map((r, i) => {
          const totalQuestions =
            r.total ??
            r.totalQuestions ??
            r.totalQ ??
            r.max ??
            r.totalScore ??
            r.total_possible ??
            r.maxScore ??
            (typeof r.score !== "undefined" ? r.score : 0);

          const medal =
            type === "competition" || type === "online"
              ? getMedal(Number(r.score ?? 0), Number(totalQuestions))
              : "";

          const scoreDisplay = `${r.score ?? 0} / ${totalQuestions ?? "-"}`;

          return (
            <tr key={i}>
              <td>{i + 1}</td>

              {(type === "competition" || type === "online") && (
                <td style={{ fontSize: "22px" }}>{medal}</td>
              )}

              <td>{r.user || r.name}</td>

              {type === "practice" && <td>{scoreDisplay}</td>}

              {type === "competition" && (
                <>
                  <td>{scoreDisplay}</td>
                  <td>{r.timeTaken ?? "-"}</td>
                </>
              )}

              {type === "online" && (
                <>
                  <td>{r.score}{r.total !== undefined && <> / {r.total}</>}</td>
                  <td>{r.category}</td>
                  <td>{r.difficulty}</td>
                  <td>{r.time}</td>
                </>
              )}

              {type === "live" && (
                <>
                  <td>{r.score}</td>
                  <td>{r.total}</td>
                  <td>{r.subject || "-"}</td>
                  <td>{r.platform}</td>
                </>
              )}

              <td>{r.date || r.time || "-"}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

  };

  return (
    <div className="leaderboard-card">
      <button className="back-btn" onClick={() => setPage("home")}>
        ⬅ Back to Home
      </button>

      <h2>🏆 Leaderboard</h2>

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

        <button
          className={`lb-tab ${activeTab === "online" ? "active" : ""}`}
          onClick={() => setActiveTab("online")}
        >
          Online Quiz 🌍
        </button>

        <button
          className={`lb-tab ${activeTab === "live" ? "active" : ""}`}
          onClick={() => setActiveTab("live")}
        >
          Live Quiz 🎯
        </button>
      </div>

      {activeTab === "practice" && renderTable(practiceRows, "practice")}
      {activeTab === "competition" && renderTable(competitionRows, "competition")}
      {activeTab === "online" && renderTable(onlineRows, "online")}
      {activeTab === "live" && renderTable(liveRows, "live")}
    </div>
  );
}
