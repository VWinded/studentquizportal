import React, { useState } from "react";
import { API } from "./api";

export default function Login({ onLogin }) {
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
      // store token and user
      localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      if (data.role) localStorage.setItem("role", data.role);

      // pass the full response to App so it can set user and page
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
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />

        <button disabled={loading} onClick={login} className="button">
          {loading ? "Logging in…" : "Login"}
        </button>
      </div>
    </div>
  );
}
