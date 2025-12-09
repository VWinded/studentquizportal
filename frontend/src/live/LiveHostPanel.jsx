import React, { useEffect, useState } from "react";
import { API } from "../api";
import "../live/live.css";

export default function LiveHostPanel({ setPage, user }) {
  const [roomId, setRoomId] = useState(null);
  const [questionList, setQuestionList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState("waiting");

  // 🔥 Load your local DB questions (NOT online API)
  useEffect(() => {
    fetch(API + "/questions.php")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setQuestionList(data);
        else setQuestionList(data.questions || []);
      });
  }, []);

  // 🔥 Create room when entering page
  const createRoom = async () => {
    const res = await fetch(API + "/live/live_create_room.php");
    const data = await res.json();
    setRoomId(data.roomId);
  };

  useEffect(() => {
    createRoom();
  }, []);

  // 🔥 Send question to all participants
  const sendQuestion = async () => {
    if (!questionList[currentIndex]) return;

    await fetch(API + "/live/live_send_question.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        index: currentIndex,
        question: questionList[currentIndex],
      }),
    });

    setStatus("running");
  };

  // 🔥 End Quiz
  const finishQuiz = async () => {
    await fetch(API + "/live/live_finish.php");
    setStatus("finished");
    setPage("live-leaderboard");
  };

  return (
    <div className="live-host-box">

      <button className="back-btn" onClick={() => setPage("home")}>
        ⬅ Back to Home
      </button>

      <h2>🎯 Live Quiz Host (Admin)</h2>

      <div className="live-room-info">
        <p><b>Room ID:</b> {roomId || "Creating..."}</p>
        <p>Status: {status}</p>
      </div>

      <hr />

      <h3>Questions Loaded: {questionList.length}</h3>

      {questionList.length === 0 && <p>No questions found.</p>}

      {questionList.length > 0 && (
        <div className="question-preview">
          <p><b>Q{currentIndex + 1}:</b> {questionList[currentIndex].question}</p>

          <ul>
            {questionList[currentIndex].options.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="live-buttons">
        <button
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(i => i - 1)}
        >
          ⬅ Prev
        </button>

        <button
          disabled={currentIndex === questionList.length - 1}
          onClick={() => setCurrentIndex(i => i + 1)}
        >
          Next ➡
        </button>
      </div>

      <button className="send-btn" onClick={sendQuestion}>
        🚀 Send This Question
      </button>

      <button className="finish-btn" onClick={finishQuiz}>
        🏁 Finish Quiz
      </button>
    </div>
  );
}
