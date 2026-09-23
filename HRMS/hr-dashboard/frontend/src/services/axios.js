import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  // don't send a token on login/register
  if (token && !config.url.includes("/auth/")) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// A 401 here means the token is missing/expired/invalid — the backend rejected it
// on every route (see backend/middleware/authMiddleware.js). Force a re-login instead
// of leaving the user stuck with silently-failing requests.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes("/auth/")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;