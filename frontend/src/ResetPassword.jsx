import React, { useState } from "react";
import { API } from "./api";

export default function ResetPassword() {
  const email = localStorage.getItem("resetEmail");
  const [otp, setOtp] = useState("");
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");

  const reset = async () => {
    if (p1 !== p2) {
      alert("Passwords do not match");
      return;
    }

    const res = await fetch(API + "/verify_otp.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, password: p1 }),
    });

    const data = await res.json();
    alert(data.success ? "Password updated" : data.error);
  };

  return (
    <div className="form-card">
      <h2>Reset Password</h2>
      <input placeholder="OTP" onChange={(e) => setOtp(e.target.value)} />
      <input type="password" placeholder="New Password" onChange={(e) => setP1(e.target.value)} />
      <input type="password" placeholder="Confirm Password" onChange={(e) => setP2(e.target.value)} />
      <button onClick={reset}>Update Password</button>
    </div>
  );
}
