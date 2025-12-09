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
import LiveHostPanel from "./live/LiveHostPanel";
import LiveJoinRoom from "./live/LiveJoinRoom";
import LiveLeaderboardLive from "./live/LiveLeaderboardLive";
import LiveQuizPlay from "./live/LiveQuizPlay";
export default function App() {

  const [page, setPage] = useState("home");
  const [editId, setEditId] = useState(null);   // ✅ NEW
  const [user, setUser] = useState(null);

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

    if (data.user.role === "admin") {
      setPage("dashboard");
    } else {
      setPage("student-dashboard");
    }
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


  return (
    <div>
      <nav className="navbar">
        <h1 className="logo">🎓 Student Quiz Portal</h1>

        <div className="nav-links">
          <button onClick={() => setPage("home")}>Home</button>

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
                <button onClick={() => setPage("dashboard")}>Admin</button>
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

      {/* ⭐ Added setPage to Leaderboard */}
      {page === "leaderboard" && <Leaderboard setPage={setPage} />}

      {/* ⭐ Added setPage to Analytics */}
      {page === "analytics" && <Analytics setPage={setPage} />}

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

      {/* ⭐ EDIT QUESTION ROUTE (correct) */}
      {page === "edit-question" && (
        <ProtectedRoute user={user && user.role === "admin"}>
          <AddQuestion setPage={setPage} editId={editId} />
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
{page === "live-host" && (
  <ProtectedRoute user={user && user.role === "admin"}>
    <LiveHostPanel setPage={setPage} user={user} />
  </ProtectedRoute>
)}

{page === "live-join" && (
  <ProtectedRoute user={user}>
    <LiveJoinRoom setPage={setPage} user={user} />
  </ProtectedRoute>
)}

{page === "live-play" && (
  <ProtectedRoute user={user}>
    <LiveQuizPlay setPage={setPage} user={user} />
  </ProtectedRoute>
)}

{page === "live-leaderboard" && (
  <ProtectedRoute user={user}>
    <LiveLeaderboardLive setPage={setPage} user={user} />
  </ProtectedRoute>
)}


      {page === "manage-questions" && (
        <ProtectedRoute user={user && user.role === "admin"}>
          <ManageQuestions setPage={setPage} setEditId={setEditId} />
        </ProtectedRoute>
      )}

      {page === "quiz-setup" && (
        <ProtectedRoute user={user}>
          <QuizSetup setPage={setPage} />
        </ProtectedRoute>
      )}

      {page === "quiz" && (
        <ProtectedRoute user={user}>
          <Quiz user={user} setPage={setPage} />
        </ProtectedRoute>
      )}
    </div>
  );
}
