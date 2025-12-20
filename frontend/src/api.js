export const API = import.meta.env.VITE_API_BASE;

// ONLY return Authorization — do NOT return Content-Type here!
export const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: "Bearer " + token } : {};
};
