import React, { useEffect, useState } from "react";
import { API } from "../api";
import "./live.css";

export default function LiveQuizPlay({ setPage }) {
  const [roomId, setRoomId] = useState(null);
  const [state, setState] = useState(null);
  const [selected, setSelected] = useState(null);
  const [cooldown, setCooldown] = useState(false);

  // Load room ID from localStorage
  useEffect(() => {
    const rid = localStorage.getItem("live_room_id");
    if (!rid) {
      alert("Room not found!");
      setPage("live-join");
      return;
    }
    setRoomId(rid);
  }, []);

  // Long polling loop
  useEffect(() => {
    if (!roomId) return;

    let running = true;

    const poll = async () => {
      while (running) {
        try {
          const res = await fetch(
            `${API}/live_quiz/live_get_state.php?room=${roomId}`
          );
          const data = await res.json();
          setState(data);

          if (data.status === "finished") {
            setPage("live-leaderboard");
            return;
          }
        } catch (e) {
          console.log("Poll error", e);
        }

        await new Promise((r) => setTimeout(r, 1500));
      }
    };

    poll();
    return () => {
      running = false;
    };
  }, [roomId, setPage]);

  // Send selected answer
  const sendAnswer = async (optIndex) => {
    if (cooldown) return; // prevents double click
    setCooldown(true);
    setSelected(optIndex);

    try {
      await fetch(`${API}/live_quiz/live_submit_answer.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room: roomId,
          option: optIndex,
        }),
      });
    } catch (e) {
      console.log("Send answer error", e);
    }

    setTimeout(() => setCooldown(false), 1000);
  };

  if (!state)
    return <div className="live-box">Loading live quiz…</div>;

  if (state.status === "waiting")
    return (
      <div className="live-box">
        <h2>⏳ Waiting for host…</h2>
        <p>Room: <b>{roomId}</b></p>
      </div>
    );

  return (
    <div className="live-play-container">
      <h2>🔥 Live Quiz</h2>
      <h3>Q{state.qIndex + 1}. {state.question}</h3>

      <div className="live-options">
        {state.options.map((opt, i) => (
          <div
            key={i}
            className={`live-option ${selected === i ? "selected" : ""}`}
            onClick={() => sendAnswer(i)}
          >
            {opt}
          </div>
        ))}
      </div>

      <div className="live-footer">
        <p>⏳ Time Left: <b>{state.timeLeft}s</b></p>
      </div>
    </div>
  );
}
