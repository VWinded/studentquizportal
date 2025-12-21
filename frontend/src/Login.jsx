import React, { useState } from "react";
import { API } from "./api";

export default function Login({ onLogin, setPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);

    const res = await fetch(API + "/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const text = await res.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch (err) {
      alert("Server did not return valid JSON:\n" + text);
      setLoading(false);
      return;
    }

    if (data.success) {
      localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      if (data.role) localStorage.setItem("role", data.role);
      onLogin(data);
    } else {
      alert(data.error || "Invalid login");
    }

    setLoading(false);
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <h2>Login</h2>

        <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button disabled={loading} onClick={login} className="button">
          {loading ? "Logging in…" : "Login"}
        </button>

        {/* ✅ CORRECT FOR YOUR APP */}
        <p
          style={{ marginTop: "10px", cursor: "pointer", color: "#ffcc00" }}
          onClick={() => setPage("forgot-password")}
        >
          Forgot password?
        </p>
      </div>
    </div>
  );
}
