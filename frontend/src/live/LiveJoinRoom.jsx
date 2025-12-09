import React, { useEffect, useState } from "react";
import { API } from "../api";
import "../live/live.css";

export default function LiveJoinRoom({ user, setPage }) {
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(false);

  const [selectedOption, setSelectedOption] = useState(null);
  const [answerSent, setAnswerSent] = useState(false);

  // 🔥 Long-poll listener
  const pollServer = async () => {
    if (!joined) return;

    try {
      const res = await fetch(`${API}/live/live_poll.php?room=${roomId}`);
      const data = await res.json();

      // 📌 "question" means host sent a new one
      if (data.type === "question") {
        setCurrentQuestion(data.payload);
        setSelectedOption(null);
        setAnswerSent(false);
      }

      // 📌 "finish" means quiz ended
      if (data.type === "finish") {
        setPage("live-leaderboard");
      }

      pollServer(); // keep polling
    } catch (err) {
      setTimeout(pollServer, 1000); // retry
    }
  };

  // 🔥 Student joins room (frontend-only)
  const handleJoin = () => {
    if (!roomId.trim()) return alert("Enter Room ID!");

    setJoined(true);
    pollServer();
  };

  // 🔥 Send student's answer to server
  const submitAnswer = async () => {
    if (selectedOption === null) return alert("Select an option!");

    setAnswerSent(true);

    await fetch(`${API}/live/live_submit_answer.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        room: roomId,
        user: user.name,
        answer: selectedOption,
        qIndex: currentQuestion.index,
      }),
    });
  };

  // ============================================================
  // UI
  // ============================================================
  if (!joined) {
    return (
      <div className="live-host-box">

        <button className="back-btn" onClick={() => setPage("home")}>
          ⬅ Back to Home
        </button>

        <h2>🎧 Join Live Quiz</h2>

        <input
          className="online-input"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />

        <button className="online-start-btn" onClick={handleJoin}>
          Join Room 🚀
        </button>
      </div>
    );
  }

  // Student waiting for question
  if (!currentQuestion) {
    return (
      <div className="live-host-box">
        <h2>🔄 Waiting for host to start quiz…</h2>
      </div>
    );
  }

  // Show active question
  return (
    <div className="live-host-box">

      <h2>🔥 Live Question</h2>
      <p><b>Q{currentQuestion.index + 1}:</b> {currentQuestion.question.question}</p>

      <div className="options-block">
        {currentQuestion.question.options.map((opt, i) => (
          <div
            key={i}
            className={`option-box ${selectedOption === i ? "selected" : ""}`}
            onClick={() => !answerSent && setSelectedOption(i)}
          >
            <div className="square">{selectedOption === i ? "✔" : ""}</div>
            <span className="option-text">{opt}</span>
          </div>
        ))}
      </div>

      <button
        className="send-btn"
        disabled={answerSent}
        onClick={submitAnswer}
      >
        {answerSent ? "Answer Submitted ✔" : "Submit Answer"}
      </button>
    </div>
  );
}
