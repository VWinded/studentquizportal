import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";
import "./theme-override.css";
import "./mobile-override.css"; // 👈 new

function updateMobileClass() {
  if (window.innerWidth <= 768) {
    document.body.classList.add("mobile-view");
  } else {
    document.body.classList.remove("mobile-view");
  }
}

updateMobileClass();
window.addEventListener("resize", updateMobileClass);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
