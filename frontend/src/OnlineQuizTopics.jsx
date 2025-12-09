import React, { useEffect, useState } from "react";
import "./online-quiz.css";
import { API } from "./api";

export default function OnlineQuizTopics({ setPage }) {
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [difficulty, setDifficulty] = useState("easy");
  const [count, setCount] = useState(10);

  // Load categories from API backend
  useEffect(() => {
    fetch(API + "/fetch_api_questions.php?get=categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.trivia_categories || []))
      .catch(() => {});
  }, []);

  const startOnlineQuiz = () => {
    if (!selectedCat) return alert("Select a category!");

    const settings = {
      mode: "online",
      categoryId: selectedCat.id,
      categoryName: selectedCat.name,
      difficulty,
      count,
    };

    localStorage.setItem("quiz_settings", JSON.stringify(settings));

    setPage("quiz");
  };

  return (
    <div className="online-container">
      <button className="back-btn" onClick={() => setPage("quiz-setup")}>
        ⬅ Back
      </button>

      <h2 className="online-title">🌍 Online Quiz Settings</h2>

      <h3>Select Category</h3>
      <div className="online-category-list">
        {categories.map((c) => (
          <div
            key={c.id}
            className={`online-cat ${selectedCat?.id === c.id ? "selected" : ""}`}
            onClick={() => setSelectedCat(c)}
          >
            {c.name}
          </div>
        ))}
      </div>

      <h3>Select Difficulty</h3>
      <select
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
        className="online-select"
      >
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>

      <h3>Number of Questions</h3>
      <input
        type="number"
        min="5"
        max="50"
        value={count}
        onChange={(e) => setCount(e.target.value)}
        className="online-input"
      />

      <button className="online-start-btn" onClick={startOnlineQuiz}>
        Start Online Quiz 🚀
      </button>
    </div>
  );
}
