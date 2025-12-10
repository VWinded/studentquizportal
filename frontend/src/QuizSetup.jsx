import React, { useEffect, useState } from "react";
import { API } from "./api";

export default function QuizSetup({ user, setPage }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [difficulty, setDifficulty] = useState("Easy");

  // Timers
  const [questionTime, setQuestionTime] = useState(20);
  const [quizDuration, setQuizDuration] = useState(10);
  const [enableQuestionTimer, setEnableQuestionTimer] = useState(false);
  const [enableQuizTimer, setEnableQuizTimer] = useState(false);

  // Mode
  const [mode, setMode] = useState(null);

  // Load categories
  useEffect(() => {
    fetch(API + "/quiz.php")
      .then((res) => res.json())
      .then((data) => {
        const raw = data.questions;
        const uniqueCategories = [];

        raw.forEach((q) => {
          if (!uniqueCategories.find((c) => c.name === q.category)) {
            uniqueCategories.push({ name: q.category, image: q.image });
          }
        });

        setCategories(uniqueCategories);
      });
  }, []);

  const startQuiz = () => {
    if (!mode) return alert("Please select a mode!");
    if (!selectedCategory) return alert("Please select a category!");

    const settings = {
      mode,
      category: selectedCategory.name,
      difficulty,
    };

    if (mode === "practice") {
      settings.enableQuestionTimer = enableQuestionTimer;
      settings.questionTime = enableQuestionTimer ? Number(questionTime) : null;

      settings.enableQuizTimer = enableQuizTimer;
      settings.quizDuration = enableQuizTimer ? Number(quizDuration) : null;
    }

    if (mode === "competition") {
      if (user.role === "admin") {
        settings.enableQuestionTimer = enableQuestionTimer;
        settings.questionTime = enableQuestionTimer ? Number(questionTime) : null;

        settings.enableQuizTimer = true;
        settings.quizDuration = Number(quizDuration) || 10;
      } else {
        settings.enableQuestionTimer = false;
        settings.questionTime = null;

        settings.enableQuizTimer = true;
        settings.quizDuration = quizDuration;
      }

      settings.seed = Date.now();
    }

    localStorage.setItem("quiz_settings", JSON.stringify(settings));
    setPage("quiz");
  };

  return (
    <div className="quiz-setup-container">
      <h2>⚙️ Quiz Settings</h2>

      {/* ⭐ MODE SELECTION */}
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


          {/* ⭐ LIVE QUIZ BUTTON REMOVED */}
        </div>
      )}

      {/* ⭐ FULL SETTINGS AFTER MODE SELECT */}
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
                <img src={c.image} alt={c.name} className="category-img" />
                <p>{c.name}</p>
              </div>
            ))}
          </div>

          <h3>Difficulty</h3>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="dropdown"
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>

          {/* ⭐ PRACTICE TIMERS */}
          {mode === "practice" && (
            <>
              <h3>Per-Question Timer</h3>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={enableQuestionTimer}
                  onChange={() =>
                    setEnableQuestionTimer(!enableQuestionTimer)
                  }
                />
                Enable per-question timer
              </label>

              {enableQuestionTimer && (
                <input
                  type="number"
                  value={questionTime}
                  className="timer-input"
                  onChange={(e) => setQuestionTime(e.target.value)}
                  placeholder="Seconds per question"
                />
              )}

              <h3>Full Quiz Timer</h3>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={enableQuizTimer}
                  onChange={() => setEnableQuizTimer(!enableQuizTimer)}
                />
                Enable full quiz timer
              </label>

              {enableQuizTimer && (
                <input
                  type="number"
                  value={quizDuration}
                  className="timer-input"
                  onChange={(e) => setQuizDuration(e.target.value)}
                  placeholder="Minutes for full quiz"
                />
              )}
            </>
          )}

          {/* ⭐ COMPETITION TIMERS (ADMIN ONLY) */}
          {mode === "competition" && user.role === "admin" && (
            <>
              <h3>Competition – Admin Timer Control 👑</h3>

              <h3>Per-Question Timer</h3>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={enableQuestionTimer}
                  onChange={() =>
                    setEnableQuestionTimer(!enableQuestionTimer)
                  }
                />
                Enable per-question timer
              </label>

              {enableQuestionTimer && (
                <input
                  type="number"
                  value={questionTime}
                  className="timer-input"
                  onChange={(e) => setQuestionTime(e.target.value)}
                  placeholder="Seconds per question"
                />
              )}

              <h3>Full Quiz Timer (Minutes)</h3>
              <input
                type="number"
                value={quizDuration}
                className="timer-input"
                onChange={(e) => setQuizDuration(e.target.value)}
                placeholder="Minutes for full quiz"
              />
            </>
          )}

          {/* ⭐ STUDENTS CANNOT SEE COMPETITION TIMER */}
          {mode === "competition" && user.role !== "admin" && (
            <p className="info-text">
              ⏱ Admin has already set the quiz timer for competition.
            </p>
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
