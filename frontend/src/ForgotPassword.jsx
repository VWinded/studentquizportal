import React, { useState } from "react";
import { API } from "./api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const sendOtp = async () => {
    const res = await fetch(API + "/forgot_password.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    alert(data.success ? "OTP sent to email" : data.error);

    if (data.success) {
      localStorage.setItem("resetEmail", email);
      window.dispatchEvent(new CustomEvent("navigate", { detail: "reset" }));
    }
  };

  return (
    <div className="form-card">
      <h2>Forgot Password</h2>
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <button onClick={sendOtp}>Send OTP</button>
    </div>
  );
}
