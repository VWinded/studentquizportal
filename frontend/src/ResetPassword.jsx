import React, { useState } from "react";
import { API } from "./api";

export default function ResetPassword() {
  const token = new URLSearchParams(window.location.search).get("token");
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");

  const reset = async () => {
    if (p1 !== p2) {
      alert("Passwords do not match");
      return;
    }

    const res = await fetch(API + "/reset_password.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: p1 }),
    });

    const data = await res.json();
    alert(data.success ? "Password updated. Login again." : data.error);
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <h2>Reset Password</h2>
        <p className="form-help-text">
  Enter your new password and confirm it below.
  Make sure both passwords match.
</p>

        <input type="password" placeholder="New Password" onChange={(e) => setP1(e.target.value)} />
        <input type="password" placeholder="Confirm Password" onChange={(e) => setP2(e.target.value)} />
        <button className="button" onClick={reset}>Update Password</button>
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
