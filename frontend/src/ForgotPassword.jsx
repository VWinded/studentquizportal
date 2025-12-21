import React from "react";

export default function ForgotPassword({ setPage }) {
  return (
    <div className="form-card forgot-card">
      <h2>Password Assistance 🔐</h2>

      <p style={{ marginTop: "10px", lineHeight: "1.6" }}>
        Online password reset is currently unavailable.
      </p>

      <p style={{ marginTop: "12px", fontSize: "14px", opacity: 0.9 }}>
        To request account recovery or permanent access,
        please submit a request using the form below.
      </p>

      {/* 🔹 GOOGLE FORM BUTTON */}
      <button
        className="button request-btn"
        style={{ marginTop: "16px" }}
        onClick={() =>
          window.open(
            "https://forms.gle/mAUfC8vNhUA1VwNK6",
            "_blank"
          )
        }
      >
        📝 Request Account Help
      </button>

      <p style={{ marginTop: "14px", fontSize: "13px", opacity: 0.7 }}>
        ℹ️ Requests are reviewed manually by the administrator.
      </p>

      {/* 🔹 NAVIGATION BUTTONS */}
      <div style={{ marginTop: "18px", display: "flex", gap: "10px", justifyContent: "center" }}>
        <button className="button secondary-btn" onClick={() => setPage("login")}>
          🔙 Back to Login
        </button>

        <button className="button secondary-btn" onClick={() => setPage("home")}>
          🏠 Home
        </button>
      </div>
    </div>
  );
}
