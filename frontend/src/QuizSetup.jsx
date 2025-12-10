// 🔥 FULL FILE — COPY–PASTE

import React, { useEffect, useState } from "react";
import { API } from "./api";

export default function QuizSetup({ user, setPage }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [difficulty, setDifficulty] = useState("Easy");

  // timers
  const [questionTime, setQuestionTime] = useState(20);
  const [quizDuration, setQuizDuration] = useState(10);
  const [enableQuestionTimer, setEnableQuestionTimer] = useState(false);
  const [enableQuizTimer, setEnableQuizTimer] = useState(false);

  const [mode, setMode] = useState(null);

  // load categories
  useEffect(() => {
    fetch(API + "/quiz.php")
      .then((res) => res.json())
      .then((data) => {
        const raw = data.questions;
        const unique = [];

        raw.forEach((q) => {
          if (!unique.find((x) => x.name === q.category)) {
            unique.push({ name: q.category, image: q.image });
          }
        });

        setCategories(unique);
      });
  }, []);

  const startQuiz = () => {
    if (!mode) return alert("Select mode!");
    if (!selectedCategory) return alert("Select category!");

    const settings = {
      mode: mode,                     // ⭐ important fix
      category: selectedCategory.name,
      difficulty,
    };

    // PRACTICE MODE
    if (mode === "practice") {
      settings.enableQuestionTimer = enableQuestionTimer;
      settings.questionTime = enableQuestionTimer ? Number(questionTime) : null;
      settings.enableQuizTimer = enableQuizTimer;
      settings.quizDuration = enableQuizTimer ? Number(quizDuration) : null;
    }

    // COMPETITION MODE
    if (mode === "competition") {
      settings.enableQuestionTimer = false;
      settings.questionTime = null;
      settings.enableQuizTimer = true;
      settings.quizDuration = Number(quizDuration);
      settings.seed = Date.now();    // random shuffle seed
    }

    // ONLINE already handled in online page

    localStorage.setItem("quiz_settings", JSON.stringify(settings));
    setPage("quiz");
  };

  return (
    <div className="quiz-setup-container">
      <h2>⚙️ Quiz Settings</h2>

      {!mode && (
        <div className="mode-buttons-column">
          <button className="back-btn" onClick={() => setPage("home")}>
            ⬅ Back to Home
          </button>

          <button className="mode-big-btn" onClick={() => setMode("practice")}>
            Practice Mode 📝
          </button>

          <button className="mode-big-btn" onClick={() => setMode("competition")}>
            Competition Mode ⚡
          </button>

          <button className="mode-big-btn" onClick={() => setPage("online-quiz-topics")}>
            Online Quiz 🌍
          </button>

          <button className="mode-big-btn" onClick={() => setPage("live-quizzes")}>
            Live Quizzes 🎯
          </button>
        </div>
      )}

      {mode && (
        <>
          <button className="back-btn" onClick={() => setMode(null)}>
            ⬅ Back to Modes
          </button>

          <h3>Select Category</h3>
          <div className="category-grid">
            {categories.map((c, i) => (
              <div
                key={i}
                className={`category-card ${
                  selectedCategory?.name === c.name ? "selected-category" : ""
                }`}
                onClick={() => setSelectedCategory(c)}
              >
                <img src={c.image} className="category-img" />
                <p>{c.name}</p>
              </div>
            ))}
          </div>

          <h3>Difficulty</h3>
          <select
            className="dropdown"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>

          {/* PRACTICE TIMERS */}
          {mode === "practice" && (
            <>
              <h3>Per Question Timer</h3>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={enableQuestionTimer}
                  onChange={() => setEnableQuestionTimer(!enableQuestionTimer)}
                />
                Enable per-question timer
              </label>

              {enableQuestionTimer && (
                <input
                  type="number"
                  className="timer-input"
                  value={questionTime}
                  onChange={(e) => setQuestionTime(e.target.value)}
                />
              )}

              <h3>Full Quiz Timer</h3>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={enableQuizTimer}
                  onChange={() => setEnableQuizTimer(!enableQuizTimer)}
                />
                Enable quiz timer
              </label>

              {enableQuizTimer && (
                <input
                  type="number"
                  className="timer-input"
                  value={quizDuration}
                  onChange={(e) => setQuizDuration(e.target.value)}
                />
              )}
            </>
          )}

          {/* COMPETITION FOR ADMIN */}
          {mode === "competition" && user.role === "admin" && (
            <>
              <h3>Competition Timer (Minutes)</h3>
              <input
                type="number"
                className="timer-input"
                value={quizDuration}
                onChange={(e) => setQuizDuration(e.target.value)}
              />
            </>
          )}

          <button className="main-btn start-btn" onClick={startQuiz}>
            {mode === "practice"
              ? "Start Practice Quiz 🚀"
              : "Start Competition Quiz ⚡"}
          </button>
        </>
      )}
    </div>
  );
}
