// Analytics.jsx
import React, { useEffect, useState } from "react";
import { API } from "./api";
// NOTE: remove or comment out analytics.css import if you're using styles.css only
// import "./analytics.css";
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
  ResponsiveContainer,
} from "recharts";

const COLORS = {
  practice: ["#4CAF50", "#F44336"],
  competition: ["#2196F3", "#F44336"],
  online: ["#42A5F5", "#F44336"],
  live: ["#FF6B9A", "#F44336"],
};
// 🔧 Fully theme-aware tooltip (works in BOTH light & dark themes)
const ThemeSafeTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  // Detect light vs dark page background
  const isLightTheme = (() => {
    try {
      const bg = getComputedStyle(document.body).backgroundColor;
      const rgb = bg.match(/\d+/g)?.map(Number) || [0, 0, 0];
      const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
      return brightness > 160; // light background
    } catch {
      return false;
    }
  })();

  const bgColor = isLightTheme
    ? "rgba(255,255,255,0.95)"
    : "rgba(20,20,20,0.95)";

  const textColor = isLightTheme ? "#111" : "#fff";
  const borderColor = isLightTheme ? "#ddd" : "#333";

  return (
    <div
      style={{
        background: bgColor,
        color: textColor,
        padding: "8px 10px",
        borderRadius: "6px",
        fontSize: "13px",
        border: `1px solid ${borderColor}`,
        boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
        lineHeight: "1.4",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>
        {label}
      </div>
      {payload.map((p, i) => (
        <div key={i}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};


/** normalizeRaw(raw)
 * Normalize many possible backend row shapes into:
 * { type, score, total, percent, category, subject, date, status, raw }
 */
function normalizeRaw(raw) {
  // score
  const score =
    typeof raw.score !== "undefined" && raw.score !== null && raw.score !== ""
      ? Number(raw.score)
      : typeof raw.correct !== "undefined" && raw.correct !== null
      ? Number(raw.correct)
      : 0;

  // total - many possible names
  const total =
    Number(
      raw.total ??
        raw.totalQuestions ??
        raw.totalQ ??
        raw.max ??
        raw.totalScore ??
        raw.total_possible ??
        raw.maxScore ??
        score
    ) || 0;

  // percent - prefer provided, else compute
  let percent = 0;
  if (typeof raw.percent !== "undefined" && raw.percent !== null && raw.percent !== "") {
    percent = Number(raw.percent) || 0;
  } else if (total > 0) {
    percent = Math.round((Number(score || 0) / Number(total || 0)) * 100);
  } else {
    percent = total === 0 && score > 0 ? 100 : 0;
  }

  // --- IMPROVED TYPE DETECTION (important fix for live rows) ---
  let type = "practice";
  // explicit signals from backend
  if (raw.mode === "competition" || raw.mode === "practice") type = raw.mode;
  // many backends mark quiz platform for live (e.g. Mentimeter, Kahoot)
  else if (
    raw.platform ||
    raw.platformName ||
    raw.source === "live" ||
    raw.quizType === "live" ||
    raw.isLive === true
  )
    type = "live";
  // fallback to online if it has category/datetime/time fields
  else if (raw.category || raw.datetime || raw.difficulty || raw.time || raw.total) type = "online";

  // category/subject: ensure live fallback uses "Live"
  const categoryCandidate =
    raw.category ?? raw.categoryName ?? raw.category_name ?? raw.subcategory ?? null;
  const category = type === "live" && !categoryCandidate ? "Live" : categoryCandidate;

  const subject = raw.subject ?? raw.sub ?? raw.platform ?? null;

  const date =
    raw.date ??
    raw.datetime ??
    raw.time ??
    raw.timeTaken ??
    raw.timestamp ??
    raw.time_string ??
    "";

  const status = raw.status ?? raw.approval ?? null;

  return {
    type,
    score: Number(score),
    total: Number(total),
    percent: Number(percent),
    category,
    subject,
    date: String(date || ""),
    status,
    raw,
  };
}

export default function Analytics({ user, setPage }) {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    fetch(API + "/analytics.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: user.email, role: user.role }),
    })
      .then((res) => res.json())
      .then((data) => {
        // DEBUG: helpful console logs (comment out if you don't want logs)
        // console.group("ANALYTICS raw response");
        // console.log(data);
        // console.groupEnd();

        const normalized = (data || []).map((r) => normalizeRaw(r));

        // ---------- tolerant approval check ----------
        const isApproved = (s) => {
          if (s === undefined || s === null) return false;
          const ss = String(s).toLowerCase().trim();
          return ss === "approved" || ss === "1" || ss === "true" || ss === "yes";
        };

        // keep only approved live attempts; and try to ensure rows belong to logged-in user
        const filtered = normalized.filter((n) => (n.type === "live" ? isApproved(n.status) : true));

        // more flexible user matching to ensure rows belong to user (fix)
        const final = filtered.filter((f) => {
          const raw = f.raw || {};
          // match email if present
          if (raw.email && user.email) {
            try {
              if (String(raw.email).toLowerCase().trim() === String(user.email).toLowerCase().trim())
                return true;
            } catch (e) {}
          }
          // match common name fields
          if (raw.user && user.name) {
            try {
              if (String(raw.user).toLowerCase().trim() === String(user.name).toLowerCase().trim()) return true;
            } catch (e) {}
          }
          if (raw.name && user.name) {
            try {
              if (String(raw.name).toLowerCase().trim() === String(user.name).toLowerCase().trim()) return true;
            } catch (e) {}
          }
          if (raw.username && user.name) {
            try {
              if (String(raw.username).toLowerCase().trim() === String(user.name).toLowerCase().trim()) return true;
            } catch (e) {}
          }
          // fallback - assume server already scoped to user (don't over-filter)
          return true;
        });

        // DEBUG: check normalized + final arrays (optional)
        // console.group("ANALYTICS normalized");
        // console.log(normalized);
        // console.groupEnd();
        // console.group("ANALYTICS final (after approval + user filter)");
        // console.log(final);
        // console.groupEnd();

        setAttempts(final);
      })
      .catch(() => setAttempts([]))
      .finally(() => setLoading(false));
  }, [user]);

  // split by type
  const practiceRows = attempts.filter((a) => a.type === "practice");
  const competitionRows = attempts.filter((a) => a.type === "competition");
  const onlineRows = attempts.filter((a) => a.type === "online");
  const liveRows = attempts.filter((a) => a.type === "live");

  // robust date parsing so "YYYY-MM-DD HH:mm" works
  const parseDate = (d) => {
    if (!d) return NaN;
    if (typeof d === "number") return d;
    try {
      let t = Date.parse(d);
      if (!isNaN(t)) return t;
      // try replacing space with T to make it ISO-like
      t = Date.parse(String(d).replace(" ", "T"));
      if (!isNaN(t)) return t;
      // final fallback - try new Date()
      t = new Date(d).getTime();
      return isNaN(t) ? NaN : t;
    } catch (e) {
      return NaN;
    }
  };

  // helpers
  const pickLatest = (arr) => {
    if (!arr || arr.length === 0) return null;
    const withDates = arr.filter((r) => r.date && String(r.date).length > 2);
    if (withDates.length > 0) {
      withDates.sort((a, b) => (parseDate(a.date) || 0) - (parseDate(b.date) || 0));
      return withDates[withDates.length - 1];
    }
    return arr[arr.length - 1];
  };

  const latestPractice = pickLatest(practiceRows);
  const latestCompetition = pickLatest(competitionRows);
  const latestOnline = pickLatest(onlineRows);
  const latestLive = pickLatest(liveRows);

  // make pie for a single latest item
  const makePie = (item) => {
    if (!item) return null;
    // corrected wrong calculation and ensure numeric
    const s = Number(item.score || 0);
    const t = Number(item.total || 0);
    // if total is zero, prefer showing 0 wrong (or treat total as s)
    const wrong = Math.max(0, (t > 0 ? t : s) - s);
    return [
      { name: "Correct", value: Number(s) },
      { name: "Wrong", value: Number(wrong) },
    ];
  };

  // history for rows (per-type)
  const makeHistory = (rows) => {
    if (!rows || rows.length === 0) return [];
    const mapped = rows
      .map((r) => ({ date: r.date || "", percent: Number(r.percent || 0) }))
      .filter((x) => typeof x.percent === "number" && !isNaN(x.percent));
    const hasParsable = mapped.some((m) => !Number.isNaN(parseDate(m.date)));
    if (hasParsable) mapped.sort((a, b) => (parseDate(a.date) || 0) - (parseDate(b.date) || 0));
    return mapped;
  };

  // subject/category aggregate for rows (per-type)
  const makeSubjectData = (rows) => {
    const groups = {};
    (rows || []).forEach((r) => {
      const key = r.subject ?? r.category ?? "General";
      if (!groups[key]) groups[key] = { totalPercent: 0, count: 0 };
      groups[key].totalPercent += Number(r.percent || 0);
      groups[key].count += 1;
    });
    return Object.keys(groups).map((k) => ({
      subject: k,
      percent: Math.round(groups[k].totalPercent / groups[k].count) || 0,
    }));
  };

  // prepare for each block
  const practiceHistory = makeHistory(practiceRows);
  const practiceSubjects = makeSubjectData(practiceRows);

  const competitionHistory = makeHistory(competitionRows);
  const competitionSubjects = makeSubjectData(competitionRows);

  const onlineHistory = makeHistory(onlineRows);
  const onlineSubjects = makeSubjectData(onlineRows);

  const liveHistory = makeHistory(liveRows);
  const liveSubjects = makeSubjectData(liveRows);

  if (loading)
    return (
      <div className="analytics-wrapper">
        <button className="back-btn" onClick={() => setPage("home")}>
          ⬅ Back to Home
        </button>
        <h2 className="analytics-title">📊 Quiz Analytics</h2>
        <p className="analytics-loading">Loading analytics...</p>
      </div>
    );

  // small helper to render the 3-chart row for a block
  const renderBlockRow = (title, latest, history, subjects, colorKey) => {
    return (
      <div style={{ marginTop: 18 }}>
        <h3 style={{ textAlign: "center", marginBottom: 12 }}>{title}</h3>

        <div
          className="analytics-grid"
          style={{
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
            alignItems: "start",
          }}
        >
          <div className="analytics-chart glass-card" style={{ minHeight: 320 }}>
            <h4 style={{ textAlign: "center" }}>{title} — Correct vs Wrong (Latest)</h4>
            {latest ? (
              <ResponsiveContainer width="100%" height={220} minWidth={260}>
                <PieChart>
                  <Pie data={makePie(latest)} dataKey="value" outerRadius={80} innerRadius={28}>
                    {(makePie(latest) || []).map((entry, i) => (
                      <Cell key={i} fill={COLORS[colorKey][i] || "#8884d8"} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty">No {title.toLowerCase()} data</div>
            )}
          </div>

          <div className="analytics-chart glass-card" style={{ minHeight: 320 }}>
            <h4 style={{ textAlign: "center" }}>{title} — History (Percent)</h4>
            {history && history.length > 0 ? (
              <ResponsiveContainer width="100%" height={260} minWidth={260}>

                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip content={<ThemeSafeTooltip />} />
                  <Line type="monotone" dataKey="percent" stroke="#FFB300" strokeWidth={3} dot />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty">No {title.toLowerCase()} history</div>
            )}
          </div>

          <div className="analytics-chart glass-card" style={{ minHeight: 320 }}>
            <h4 style={{ textAlign: "center" }}>{title} — Subject / Category Performance</h4>
            {subjects && subjects.length > 0 ? (
              <ResponsiveContainer width="100%" height={260} minWidth={260}>
                <BarChart data={subjects}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip content={<ThemeSafeTooltip />} />
                  <Bar dataKey="percent" fill={COLORS[colorKey][0] || "#90CAF9"} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty">No {title.toLowerCase()} subject/category data</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="analytics-wrapper">
      <button className="back-btn" onClick={() => setPage("home")}>
        ⬅ Back to Home
      </button>

      <h2 className="analytics-title">📊 Quiz Analytics</h2>

      {/* TOP LATEST CARDS (keeps your original single-line cards) */}
      <div className="analytics-top-cards" style={{ marginBottom: 22 }}>
        <div className="analytics-card small-card-body">
          <h3>Latest Practice</h3>
          {latestPractice ? (
            <>
              <p>
                <b>Score: </b> {latestPractice.score} / {latestPractice.total || "-"}
              </p>
              <p>
                <b>Percentage:</b> {latestPractice.percent}%
              </p>
              <p>
                <b>Category:</b> {latestPractice.category ?? "General"}
              </p>
              <p>
                <b>Date:</b> {latestPractice.date ?? "-"}
              </p>
            </>
          ) : (
            <p>No practice attempts</p>
          )}
        </div>

        <div className="analytics-card small-card-body">
          <h3>Latest Competition</h3>
          {latestCompetition ? (
            <>
              <p>
                <b>Score: </b> {latestCompetition.score} / {latestCompetition.total || "-"}
              </p>
              <p>
                <b>Percentage:</b> {latestCompetition.percent}%
              </p>
              <p>
                <b>Category:</b> {latestCompetition.category ?? "General"}
              </p>
              <p>
                <b>Date:</b> {latestCompetition.date ?? "-"}
              </p>
            </>
          ) : (
            <p>No competition attempts</p>
          )}
        </div>

        <div className="analytics-card small-card-body">
          <h3>Latest Online</h3>
          {latestOnline ? (
            <>
              <p>
                <b>Score: </b> {latestOnline.score} / {latestOnline.total || "-"}
              </p>
              <p>
                <b>Percentage:</b> {latestOnline.percent}%
              </p>
              <p>
                <b>Category:</b> {latestOnline.category ?? "General"}
              </p>
              <p>
                <b>Date:</b> {latestOnline.date ?? "-"}
              </p>
            </>
          ) : (
            <p>No online attempts</p>
          )}
        </div>

        <div className="analytics-card small-card-body">
          <h3>Latest Live</h3>
          {latestLive ? (
            <>
              <p>
                <b>Score: </b> {latestLive.score} / {latestLive.total || "-"}
              </p>
              <p>
                <b>Percentage:</b> {latestLive.percent}%
              </p>
              <p>
                <b>Subject:</b> {latestLive.subject ?? "General"}
              </p>
              <p>
                <b>Date:</b> {latestLive.date ?? "-"}
              </p>
            </>
          ) : (
            <p>No live attempts (approved)</p>
          )}
        </div>
      </div>

      {/* Rows: Practice, Competition, Online, Live */}
      {renderBlockRow("Practice", latestPractice, practiceHistory, practiceSubjects, "practice")}
      {renderBlockRow("Competition", latestCompetition, competitionHistory, competitionSubjects, "competition")}
      {renderBlockRow("Online", latestOnline, onlineHistory, onlineSubjects, "online")}
      {renderBlockRow("Live", latestLive, liveHistory, liveSubjects, "live")}
    </div>
  );
}
