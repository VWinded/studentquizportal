import React, { useState } from "react";
import { API } from "./api";
import "./live.css";

export default function SubmitLiveAttendance({ user, setPage, platform }) {

  const [score, setScore] = useState("");
  const [proof, setProof] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!score.trim()) {
      alert("Score is required!");
      return;
    }
    if (!proof) {
      alert("ID Proof is required!");
      return;
    }

    setLoading(true);

    const form = new FormData();
    form.append("user", user.name);
    form.append("email", user.email);
    form.append("platform", platform);
    form.append("score", score);
    form.append("proof", proof);

    const res = await fetch(API + "/live_mark_attendance.php", {
      method: "POST",
      body: form
    });

    const out = await res.json();
    setLoading(false);

    if (out.error) {
      alert("Error: " + out.error);
      return;
    }

    alert("Attendance submitted 🎉");
    setPage("leaderboard");
  };
  return (
  <div className="submit-page">

    {/* Centered Small Back Button */}
    <div className="back-container">
      <button className="submit-back-btn" onClick={() => setPage("live-quizzes")}>
        ⬅ Back
      </button>
    </div>

    <div className="submit-box">
      <h2>📤 Submit Attendance</h2>

      <p><b>Platform:</b> {platform}</p>
      <p><b>User:</b> {user.name}</p>

      <input
        className="input-field"
        type="number"
        placeholder="Enter score"
        value={score}
        onChange={(e) => setScore(e.target.value)}
      />

      <input
        className="file-field"
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={(e) => setProof(e.target.files[0])}
      />

      <div className="submit-actions">
        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>

        <button className="cancel-btn" onClick={() => setPage("live-quizzes")}>
          Cancel
        </button>
      </div>
    </div>

  </div>
);  
}
