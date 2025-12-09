import React, { useEffect, useState } from "react";
import { API } from "./api";

export default function Quiz({ user }) {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const [questionTimer, setQuestionTimer] = useState(null);
  const [quizTimer, setQuizTimer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);

  const [mode, setMode] = useState("practice");

  // ⭐ NEW – Track time taken for competition ranking
  const [timeTaken, setTimeTaken] = useState(0);

  // ⭐ NEW – Anti-cheat strike count
  const [strikes, setStrikes] = useState(0);

  const formatHMS = (t) => {
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = t % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(
      2,
      "0"
    )}:${String(s).padStart(2, "0")}`;
  };

  // ---------- LOAD ONCE ----------
  useEffect(() => {
    const settingsStr = localStorage.getItem("quiz_settings");
    if (!settingsStr) return;

    const settings = JSON.parse(settingsStr);
    setMode(settings.mode || "practice");

    if (settings.mode === "online") {
      loadAPIQuestions(settings);
      return;
    }

    loadQuestions(settings);
  }, []);

  // ---------- TIMERS ----------
  useEffect(() => {
    if (quizTimer === null || showResult) return;

    // ⭐ NEW – Track time taken
    setTimeTaken((t) => t + 1);

    if (quizTimer <= 0) {
      submitQuiz();
      return;
    }

    const id = setInterval(() => setQuizTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [quizTimer, showResult]);

  useEffect(() => {
    if (questionTimer === null || showResult) return;

    if (questionTimer <= 0) {
      goNextQuestionAuto();
      return;
    }

    const id = setInterval(() => setQuestionTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [questionTimer, index, showResult]);

  // ⭐ NEW – ANTI-CHEAT LOGIC (for competition ONLY)
  useEffect(() => {
    if (mode !== "competition") return;

    const handleCheat = () => {
      setStrikes((prev) => {
        const newStrike = prev + 1;

        if (newStrike === 1) {
          alert("⚠ Warning: Do not switch tabs during competition!");
        } else if (newStrike >= 2) {
          alert("❌ Cheating Detected! Quiz auto-submitted.");
          submitQuiz();
        }

        return newStrike;
      });
    };

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) handleCheat();
    });

    window.addEventListener("blur", handleCheat);

    return () => {
      document.removeEventListener("visibilitychange", handleCheat);
      window.removeEventListener("blur", handleCheat);
    };
  }, [mode]);

  // ---------- LOAD API QUESTIONS ----------
  const loadAPIQuestions = async (settings) => {
    try {
      const url = `${API}/fetch_api_questions.php?category=${settings.categoryId}&difficulty=${settings.difficulty}&count=${settings.count}`;
      const res = await fetch(url);
      const data = await res.json();

      setQuestions(data);
      setQuizTimer(null);
      setQuestionTimer(null);
    } catch (err) {
      console.error("API error:", err);
      setQuestions([]);
    }
  };

  // ---------- LOAD LOCAL QUESTIONS ----------
  const loadQuestions = async (settings) => {
    try {
      const url = API + "/questions.php";
      const res = await fetch(url);
      const raw = await res.json();

      let filtered = Array.isArray(raw) ? raw : [];

      if (settings.category) {
        const targetCat = settings.category.trim().toLowerCase();
        filtered = filtered.filter(
          (q) =>
            typeof q.category === "string" &&
            q.category.trim().toLowerCase() === targetCat
        );
      }

      if (settings.difficulty) {
        const targetDiff = settings.difficulty.trim().toLowerCase();
        filtered = filtered.filter(
          (q) =>
            !q.difficulty ||
            (typeof q.difficulty === "string" &&
              q.difficulty.trim().toLowerCase() === targetDiff)
        );
      }

      if (settings.mode === "competition" && settings.seed) {
        filtered = shuffleWithSeed(filtered, settings.seed);
      }

      setQuestions(filtered);

      if (settings.enableQuizTimer && settings.quizDuration) {
        setQuizTimer(Number(settings.quizDuration) * 60);
      } else {
        setQuizTimer(null);
      }

      if (settings.enableQuestionTimer && settings.questionTime) {
        setQuestionTimer(Number(settings.questionTime));
      } else {
        setQuestionTimer(null);
      }
    } catch (err) {
      console.error("Error loading questions:", err);
      setQuestions([]);
    }
  };

  function shuffleWithSeed(arr, seed) {
    let a = [...arr];
    let m = a.length,
      i,
      t;
    while (m) {
      seed = (seed * 9301 + 49297) % 233280;
      i = Math.floor((seed / 233280) * m--);
      t = a[m];
      a[m] = a[i];
      a[i] = t;
    }
    return a;
  }

  // ---------- NAVIGATION ----------
  const goNextQuestionAuto = () => {
    const settings = JSON.parse(localStorage.getItem("quiz_settings") || "{}");

    if (index < questions.length - 1) {
      setIndex((prev) => prev + 1);
      if (settings.enableQuestionTimer && settings.questionTime) {
        setQuestionTimer(Number(settings.questionTime));
      }
    } else {
      submitQuiz();
    }
  };

  const nextQuestion = () => {
    const settings = JSON.parse(localStorage.getItem("quiz_settings") || "{}");

    if (index < questions.length - 1) {
      setIndex(index + 1);
      if (settings.enableQuestionTimer && settings.questionTime) {
        setQuestionTimer(Number(settings.questionTime));
      }
    }
  };

  const prevQuestion = () => {
    if (mode === "competition") return;
    if (index > 0) setIndex(index - 1);
  };

  // ⭐ NEW — Lock answers in competition mode
  const selectOption = (qIndex, optIndex) => {
    if (mode === "competition") {
      if (answers[qIndex] !== undefined) return; // ALREADY SELECTED
    }
    setAnswers({ ...answers, [qIndex]: optIndex });
  };

  // ---------- SUBMIT ----------
  const submitQuiz = async () => {
    if (!questions.length) return;

    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.answerIndex) correct++;
    });

    const percent = Math.round((correct / questions.length) * 100);
    setResult({ correct, total: questions.length, percent, timeTaken });

    if (mode === "online") {
      setShowResult("reveal");
      setTimeout(() => setShowResult(true), 800);
    } else if (mode === "competition") {
      setShowResult(true);
    } else {
      setShowResult("reveal");
      setTimeout(() => setShowResult(true), 1000);
    }

    window.dispatchEvent(new Event("quiz_completed"));

    try {
      const settings = JSON.parse(localStorage.getItem("quiz_settings") || "{}");

      const endpoint =
        settings.mode === "online"
          ? "/leaderboard_online.php"
          : settings.mode === "competition"
          ? "/leaderboard_competition.php"
          : "/submit.php";

      await fetch(API + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.name,
          score: correct,
          total: questions.length,
          correct: correct,
          timeTaken,
          category:
            settings.mode === "online"
              ? settings.categoryName
              : questions[0]?.category || "General",
          difficulty:
            settings.mode === "online" ? settings.difficulty : undefined,
        }),
      });
    } catch (e) {
      console.error("Error sending result:", e);
    }
  };

  // ---------- RENDER ----------
  if (questions.length === 0)
    return <div className="center-text">No questions found.</div>;

  if (showResult === true)
    return (
      <div className="quiz-card">
        <h2>📊 Quiz Result</h2>

        <p><b>Score:</b> {result.correct} / {result.total}</p>
        <p><b>Percentage:</b> {result.percent}%</p>

        {/* ⭐ Competition extra */}
        {mode === "competition" && (
          <>
            <p><b>Time Taken:</b> {result.timeTaken}s</p>
            <p><b>Ranking:</b> Calculated on leaderboard</p>
          </>
        )}

        <button
          className="button"
          onClick={() => {
            setShowResult(false);
            setAnswers({});
            setIndex(0);
            localStorage.removeItem("quiz_settings");
            window.dispatchEvent(
              new CustomEvent("navigate", { detail: "quiz-setup" })
            );
          }}
        >
          Restart Quiz
        </button>

        <button
          className="button home-btn"
          onClick={() => {
            window.dispatchEvent(new CustomEvent("navigate", { detail: "home" }));
          }}
        >
          ⬅ Back to Home
        </button>
      </div>
    );

  const q = questions[index];

  return (
    <div className="quiz-card">
      <h2>🔥 Quiz Time</h2>

      {quizTimer !== null && (
        <div className="timer">⏱ Quiz Time Left: {formatHMS(quizTimer)}</div>
      )}

      {questionTimer !== null && (
        <div className="timer small">
          ⏳ Question Time Left: {questionTimer}s
        </div>
      )}

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${((index + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      <p className="question-text">
        <b>Q{index + 1}.</b> {q.question}
      </p>

      <div className="options-block">
        {q.options.map((opt, optIndex) => {
          const isSelected = answers[index] === optIndex;
          const isCorrect = optIndex === q.answerIndex;

          let className = "option-box";

          if (mode !== "competition") {
            if (showResult) {
              if (isCorrect) className += " correct";
              else if (isSelected && !isCorrect) className += " wrong";
            } else {
              if (isSelected) className += " selected";
            }
          } else {
            if (isSelected) className += " selected";
          }

          return (
            <div
              key={optIndex}
              className={className}
              onClick={!showResult ? () => selectOption(index, optIndex) : null}
            >
              <div className="square">
                {mode === "competition"
                  ? isSelected
                    ? "✔"
                    : ""
                  : showResult
                  ? isCorrect
                    ? "✔"
                    : isSelected
                    ? "✖"
                    : ""
                  : isSelected
                  ? "✔"
                  : ""}
              </div>

              <span className="option-text">{opt}</span>
            </div>
          );
        })}
      </div>

      <div className="nav-buttons">
        <button
          disabled={index === 0 || mode === "competition"}
          onClick={prevQuestion}
        >
          ⬅ Previous
        </button>

        {index < questions.length - 1 ? (
          <button onClick={nextQuestion}>Next ➡</button>
        ) : (
          <button className="submit-btn" onClick={submitQuiz}>
            Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
}
