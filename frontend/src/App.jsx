// App.jsx  (replace your existing App.jsx with this)
import React, { useEffect, useState } from "react";
import Home from "./Home";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./AdminDashboard";
import StudentDashboard from "./StudentDashboard";
import Quiz from "./Quiz";
import QuizSetup from "./QuizSetup";
import AddQuestion from "./AddQuestion";
import ManageQuestions from "./ManageQuestions";
import Leaderboard from "./Leaderboard";
import Analytics from "./Analytics";
import ProtectedRoute from "./ProtectedRoute";
import { API } from "./api";
import OnlineQuizTopics from "./OnlineQuizTopics";
import OnlineLeaderboard from "./OnlineLeaderboard";
import LiveQuizPlatforms from "./LiveQuizPlatforms";
import AdminLiveApprovals from "./AdminLiveApprovals";
import SubmitLiveAttendance from "./SubmitLiveAttendance";
import ThemeSwitcher from "./ThemeSwitcher";
import "./theme-override.css";

export default function App() {
  const [page, setPage] = useState("home");
  const [editId, setEditId] = useState(null);
  const [user, setUser] = useState(null);

  const [themeOpen, setThemeOpen] = useState(false);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuestions: 0,
    totalAttempts: 0,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }

    const fetchStats = () => {
      fetch(API + "/get_stats.php")
        .then((res) => res.json())
        .then((data) => {
          setStats({
            totalUsers: data.totalUsers,
            totalQuestions: data.totalQuestions,
            totalAttempts: data.totalAttempts,
          });
        })
        .catch(() => {});
    };

    fetchStats();

    const handler = () => fetchStats();
    window.addEventListener("quiz_submitted", handler);

    return () => window.removeEventListener("quiz_submitted", handler);
  }, []);

  const handleLogin = (data) => {
    setUser(data.user);
    if (data.user.role === "admin") setPage("dashboard");
    else setPage("student-dashboard");
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setPage("home");
  };

  useEffect(() => {
    const handler = (e) => {
      setPage(e.detail);
    };
    window.addEventListener("navigate", handler);
    return () => window.removeEventListener("navigate", handler);
  }, []);

  // **NEW**: close theme panel when other components trigger `close_theme_panel`
  useEffect(() => {
    const closeHandler = () => setThemeOpen(false);
    window.addEventListener("close_theme_panel", closeHandler);
    return () => window.removeEventListener("close_theme_panel", closeHandler);
  }, []);

  return (
    <>
      <div>
        <nav className="navbar">
          <h1 className="logo">🎓 Student Quiz Portal</h1>

          <div className="nav-links">
            <button onClick={() => setPage("home")}>Home</button>
<button onClick={() => setThemeOpen(!themeOpen)}>
                  Themes
                </button>

            {!user && (
              <>
                <button onClick={() => setPage("login")}>Login</button>
                <button onClick={() => setPage("register")}>Register</button>
              </>
            )}

            {user && (
              <>
                <button onClick={() => setPage("leaderboard")}>Leaderboard</button>
                <button onClick={() => setPage("analytics")}>Analytics</button>

                {user.role === "admin" && (
                  <button onClick={() => setPage("dashboard")}>Dashboard</button>
                )}

                {user.role === "student" && (
                  <button onClick={() => setPage("student-dashboard")}>Dashboard</button>
                )}
                <button onClick={logout}>Logout</button>
              </>
            )}
          </div>
        </nav>

        {/* ROUTES */}
        {page === "home" && <Home user={user} setPage={setPage} />}
        {page === "login" && <Login onLogin={handleLogin} />}
        {page === "register" && <Register onSwitchToLogin={() => setPage("login")} />}

        {page === "leaderboard" && <Leaderboard setPage={setPage} />}
        {page === "analytics" && <Analytics user={user} setPage={setPage} />}

        {page === "dashboard" && (
          <ProtectedRoute user={user && user.role === "admin"}>
            <Dashboard setPage={setPage} user={user} stats={stats} />
          </ProtectedRoute>
        )}

        {page === "student-dashboard" && (
          <ProtectedRoute user={user && user.role === "student"}>
            <StudentDashboard user={user} setPage={setPage} />
          </ProtectedRoute>
        )}

        {page === "add-question" && (
          <ProtectedRoute user={user && user.role === "admin"}>
            <AddQuestion setPage={setPage} />
          </ProtectedRoute>
        )}

        {page === "edit-question" && (
          <ProtectedRoute user={user && user.role === "admin"}>
            <AddQuestion setPage={setPage} editId={editId} />
          </ProtectedRoute>
        )}

        {page === "submit-live-attendance" && (
          <ProtectedRoute user={user}>
            <SubmitLiveAttendance
              user={user}
              platform={window.selectedPlatform}
              setPage={setPage}
            />
          </ProtectedRoute>
        )}

        {page === "online-quiz-topics" && (
          <ProtectedRoute user={user}>
            <OnlineQuizTopics setPage={setPage} />
          </ProtectedRoute>
        )}

        {page === "online-leaderboard" && (
          <OnlineLeaderboard setPage={setPage} />
        )}

        {page === "live-quizzes" && (
          <ProtectedRoute user={user}>
            <LiveQuizPlatforms user={user} setPage={setPage} />
          </ProtectedRoute>
        )}

        {page === "manage-questions" && (
          <ProtectedRoute user={user && user.role === "admin"}>
            <ManageQuestions setPage={setPage} setEditId={setEditId} />
          </ProtectedRoute>
        )}

        {page === "live-approvals" && (
          <ProtectedRoute user={user && user.role === "admin"}>
            <AdminLiveApprovals setPage={setPage} />
          </ProtectedRoute>
        )}

        {page === "quiz-setup" && (
          <ProtectedRoute user={user}>
            <QuizSetup user={user} setPage={setPage} />
          </ProtectedRoute>
        )}

        {page === "quiz" && (
          <ProtectedRoute user={user}>
            <Quiz user={user} setPage={setPage} />
          </ProtectedRoute>
        )}
      </div>

      {/* Theme switcher controlled by state */}
      <ThemeSwitcher open={themeOpen} />
    </>
  );
}
