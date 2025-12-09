import React, { useState } from "react";
import { API } from "./api";

export default function Register({ onSwitchToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const register = async () => {
    if (!name || !email || !password) {
      alert("All fields are required!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(API + "/register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch (err) {
        alert("Server returned invalid JSON:\n" + text);
        setLoading(false);
        return;
      }

      if (data.success) {
        alert("Registered successfully! Now login.");

        // Redirect to login page
        if (onSwitchToLogin) {
          onSwitchToLogin();
        } else {
          window.location.href = "/login";
        }
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (err) {
      alert("Network error: " + err.message);
    }

    setLoading(false);
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <h2>Register</h2>

        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button disabled={loading} onClick={register} className="button">
          {loading ? "Registering…" : "Register"}
        </button>

        <p style={{ marginTop: "10px", cursor: "pointer", color: "#ffcc00" }}
           onClick={() => onSwitchToLogin && onSwitchToLogin()}>
          Already have an account? Login
        </p>
      </div>
    </div>
  );
}
