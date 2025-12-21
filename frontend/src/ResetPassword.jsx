import React, { useState } from "react";
import { API } from "./api";

export default function ResetPassword() {
  const email = localStorage.getItem("resetEmail");
  const [otp, setOtp] = useState("");
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");

  const reset = async () => {
    if (!otp || !p1 || !p2) {
      alert("All fields required");
      return;
    }

    if (p1 !== p2) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await fetch(API + "/verify_otp.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp,
          password: p1,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        alert(data.error || "Reset failed");
        return;
      }

      alert("Password updated successfully");
      localStorage.removeItem("resetEmail");
      window.dispatchEvent(new CustomEvent("navigate", { detail: "login" }));

    } catch (err) {
      alert("Network error");
    }
  };

  return (
    <div className="form-card">
      <h2>Reset Password</h2>

      <input
        placeholder="OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />

      <input
        type="password"
        placeholder="New Password"
        value={p1}
        onChange={(e) => setP1(e.target.value)}
      />

      <input
        type="password"
        placeholder="Confirm Password"
        value={p2}
        onChange={(e) => setP2(e.target.value)}
      />

      <button onClick={reset}>Update Password</button>
    </div>
  );
}
