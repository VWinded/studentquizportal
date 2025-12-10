import React, { useEffect, useState } from "react";
import { API } from "./api";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

export default function Analytics({ user, setPage }) {

  const [attempts, setAttempts] = useState([]);
  useEffect(() => {
  if (!user) return;

  fetch(API + "/analytics.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user: user.email,
      role: user.role
    })
  })
    .then((res) => res.json())
    .then((data) => setAttempts(data))
    .catch(() => setAttempts([]));
}, [user]);

  

  if (attempts.length === 0)
    return (
      <div className="analytics-empty">
        <button className="back-btn" onClick={() => setPage("home")}>
          ⬅ Back to Home
        </button>

        <h2>📊 Quiz Analytics</h2>
        <p>No quiz attempts yet.</p>
      </div>
    );

  // Latest attempt
  const latest = attempts[attempts.length - 1];

  const summaryData = [
    { name: "Correct", value: latest.correct },
    { name: "Wrong", value: latest.total - latest.correct },
  ];

  // Group attempts by category
  const categoryPerformance = [];
  const grouped = {};

  attempts.forEach((att) => {
    if (!grouped[att.category])
      grouped[att.category] = { total: 0, correct: 0 };

    grouped[att.category].total += att.total;
    grouped[att.category].correct += att.correct;
  });

  Object.keys(grouped).forEach((cat) => {
    const c = grouped[cat];
    categoryPerformance.push({
      category: cat,
      percent: Math.round((c.correct / c.total) * 100),
    });
  });

  return (
    <div className="analytics-wrapper fade-in">
      
      {/* Back button */}
      <button className="back-btn" onClick={() => setPage("home")}>
        ⬅ Back to Home
      </button>

      <h2 className="analytics-title">📊 Quiz Analytics</h2>

      {/* Latest summary */}
      <div className="analytics-card glass-card">
        <h3>Latest Result</h3>
        <p><b>Score:</b> {latest.correct} / {latest.total}</p>
        <p><b>Percentage:</b> {latest.percent}%</p>
        <p><b>Category:</b> {latest.category}</p>
        <p><b>Date:</b> {latest.date}</p>
      </div>

      {/* CHARTS */}
      <div className="analytics-grid">

        <div className="analytics-chart glass-card">
          <h3>Correct vs Wrong</h3>
          <PieChart width={280} height={260}>
            <Pie data={summaryData} dataKey="value" outerRadius={110}>
              <Cell fill="#4CAF50" />
              <Cell fill="#F44336" />
            </Pie>
          </PieChart>
        </div>

        <div className="analytics-chart glass-card">
          <h3>Attempt History</h3>
          <LineChart width={320} height={220} data={attempts}>
            <CartesianGrid stroke="#777" strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="percent" stroke="#FFB300" strokeWidth={3} dot />
          </LineChart>
        </div>

        <div className="analytics-chart glass-card">
          <h3>Category Performance</h3>
          <BarChart width={320} height={220} data={categoryPerformance}>
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="percent" fill="#42A5F5" radius={[6,6,0,0]} />
          </BarChart>
        </div>

      </div>
    </div>
  );
}
