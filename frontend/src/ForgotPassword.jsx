import React from "react";

export default function ForgotPassword() {
  return (
    <div className="form-card">
      <h2>Password Assistance 🔐</h2>

      <p style={{ marginTop: "10px", lineHeight: "1.6" }}>
        Password reset via email is currently unavailable for this application.
      </p>

      <p style={{ marginTop: "12px", fontSize: "14px", opacity: 0.85 }}>
        Please contact the system administrator for assistance
        <br />
        or create a new account if you no longer have access.
      </p>

      <p style={{ marginTop: "16px", fontSize: "13px", opacity: 0.7 }}>
        ℹ️ For security reasons, automated password recovery has been disabled.
      </p>
    </div>
  );
}
