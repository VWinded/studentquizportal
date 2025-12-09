import React, { useEffect, useState } from "react";
import { API } from "./api";

export default function AddQuestion({ setPage, editId }) {

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [answerIndex, setAnswerIndex] = useState(0);
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [image, setImage] = useState("");

  const isEditing = Boolean(editId);

  useEffect(() => {
    if (!isEditing) return;

    fetch(API + "/questions.php")
      .then((res) => res.json())
      .then((all) => {
        const q = all.find((item) => item.id === editId);
        if (!q) return;

        setQuestion(q.question);
        setOptions(q.options);
        setAnswerIndex(q.answerIndex);
        setCategory(q.category);
        setDifficulty(q.difficulty || "Easy");
        setImage(q.image || "");
      });
  }, [editId]);

  const addQuestion = async () => {
    const res = await fetch(API + "/questions.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({
        question,
        options,
        answerIndex,
        category,
        difficulty,
        image,
      }),
    });

    const data = await res.json();
    if (data.success) {
      alert("Question added!");
      setPage("manage-questions");
    } else {
      alert("Failed!");
    }
  };

  const updateQuestion = async () => {
    const res = await fetch(API + "/questions_update.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({
        id: editId,
        question,
        options,
        answerIndex,
        category,
        difficulty,
        image,
      }),
    });

    const data = await res.json();
    if (data.success) {
      alert("Question updated!");
      setPage("manage-questions");
    } else {
      alert("Failed to update!");
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>

      <button className="back-btn" onClick={() => setPage("dashboard")}>
        ⬅ Back to Admin Dashboard
      </button>

      <div className="form-card" style={{ marginTop: "20px" }}>
        <h2>{isEditing ? "Edit Question" : "Add New Question"}</h2>

        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Question"
        />

        {options.map((opt, i) => (
          <input
            key={i}
            value={opt}
            placeholder={`Option ${i + 1}`}
            onChange={(e) => {
              const copy = [...options];
              copy[i] = e.target.value;
              setOptions(copy);
            }}
          />
        ))}

        <label>Correct Answer</label>
        <select value={answerIndex} onChange={(e) => setAnswerIndex(+e.target.value)}>
          {options.map((_, i) => (
            <option key={i} value={i}>Option {i + 1}</option>
          ))}
        </select>

        <input
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>

        <input
          placeholder="Image URL"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />

        {isEditing ? (
          <button className="button" onClick={updateQuestion}>
            Update Question
          </button>
        ) : (
          <button className="button" onClick={addQuestion}>
            Add Question
          </button>
        )}
      </div>
    </div>
  );
}
