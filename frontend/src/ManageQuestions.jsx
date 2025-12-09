import React, { useEffect, useState } from "react";
import { API } from "./api";

export default function ManageQuestions({ setPage, setEditId }) {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetch(API + "/questions.php")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setQuestions(data);
        else if (Array.isArray(data.questions)) setQuestions(data.questions);
        else setQuestions([]);
      });
  }, []);

  const deleteQuestion = async (id) => {
    if (!window.confirm("Delete question?")) return;

    await fetch(API + "/questions_delete.php?id=" + id, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    });

    setQuestions(questions.filter((q) => q.id !== id));
  };

  return (
    <div className="admin-container">

      <button className="back-btn" onClick={() => setPage("dashboard")}>
        ⬅ Back to Admin Dashboard
      </button>

      <h2 style={{ marginTop: "20px" }}>Manage Questions</h2>

      {questions.map((q) => (
  <div key={q.id} className="question-row">

    <div className="question-text">
      <b>Q{q.id}:</b> {q.question}
    </div>

    <div className="action-buttons">
      <button
        className="edit-btn"
        onClick={() => {
          setEditId(q.id);
          setPage("edit-question");
        }}
      >
        Edit
      </button>

      <button
        className="delete-btn"
        onClick={() => deleteQuestion(q.id)}
      >
        Delete
      </button>
    </div>

  </div>
))}

    </div>
  );
}
