import React, { useState } from "react";
import { API } from "./api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    setLoading(true);
    const res = await fetch(API + "/forgot_password.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    alert(data.success ? "Reset link sent to email" : data.error);
    setLoading(false);
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <h2>Forgot Password</h2>
        <p className="form-help-text">
  Enter the email address you used during registration.
  A password reset link will be sent to your inbox.
</p>

        <input
          placeholder="Registered Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="button" onClick={send} disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
        <button
  className="button secondary-btn"
  onClick={() =>
    window.dispatchEvent(
      new CustomEvent("navigate", { detail: "login" })
    )
  }
>
  ← Back to Login
</button>

      </div>
    </div>
  );
}
