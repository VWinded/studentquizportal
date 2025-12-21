import React, { useState } from "react";
import { API } from "./api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const sendOtp = async () => {
    try {
      const res = await fetch(API + "/forgot_password.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      // ✅ REQUIRED SAFETY CHECK
      if (!res.ok || data.error) {
        alert(data.error || "Failed to send OTP");
        return;
      }

      alert("OTP sent to email");
      localStorage.setItem("resetEmail", email);
      window.dispatchEvent(new CustomEvent("navigate", { detail: "reset" }));

    } catch (err) {
      alert("Network error. Try again.");
    }
  };

  return (
    <div className="form-card">
      <h2>Forgot Password</h2>
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={sendOtp}>Send OTP</button>
    </div>
  );
}
