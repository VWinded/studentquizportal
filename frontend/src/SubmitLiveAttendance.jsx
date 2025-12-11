import React, { useState } from "react";
import { API } from "./api";
import "./live.css";

export default function SubmitLiveAttendance({ user, setPage, platform }) {
  const [score, setScore] = useState("");
  const [total, setTotal] = useState("");
  const [subject, setSubject] = useState("");
  const [proof, setProof] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!score.trim()) {
      alert("Score is required!");
      return;
    }
    if (!total.trim()) {
      alert("Total score is required!");
      return;
    }
    if (!subject.trim()) {
      alert("Subject is required!");
      return;
    }
    if (isNaN(score) || isNaN(total) || Number(total) <= 0) {
      alert("Score and Total must be valid numbers and Total must be > 0.");
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
    form.append("total", total);
    form.append("subject", subject);
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

      <div className="back-container">
        <button className="submit-back-btn" onClick={() => setPage("live-quizzes")}>
          ⬅ Back
        </button>
      </div>

      <div className="submit-box">
        <h2>📤 Submit Attendance</h2>

        <p><b>Platform:</b> {platform}</p>
        <p><b>User:</b> {user.name}</p>

        {/* ----------- HEADING ADDED ----------- */}
        <label className="field-label">Score Obtained</label>
        <input
          className="input-field"
          type="number"
          placeholder="Enter score"
          value={score}
          onChange={(e) => setScore(e.target.value)}
        />

        {/* ----------- HEADING ADDED ----------- */}
        <label className="field-label">Maximum Possible Score</label>
        <input
          className="input-field"
          type="number"
          placeholder="Enter total possible score (e.g. 15)"
          value={total}
          onChange={(e) => setTotal(e.target.value)}
        />

        {/* ----------- HEADING ADDED ----------- */}
        <label className="field-label">Subject / Topic Name</label>
        <input
          className="input-field"
          type="text"
          placeholder="Enter subject name (e.g. Physics)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        {/* ----------- HEADING ADDED ----------- */}
        <label className="field-label">Upload Proof Document</label>
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
