export const API = "http://localhost:8000";

// ONLY return Authorization — do NOT return Content-Type here!
export const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { "Authorization": "Bearer " + token } : {};
};
