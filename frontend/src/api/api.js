import axios from "axios";

// ✅ Read from env — set VITE_API_URL in your .env file
// Development:  VITE_API_URL=http://localhost:8000
// Production:   VITE_API_URL=https://your-api-domain.com
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// ─────────────────────────────────────────────────────────────
// REQUEST interceptor — attach JWT token
// ─────────────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // localStorage can throw in Safari private mode — fail silently
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─────────────────────────────────────────────────────────────
// RESPONSE interceptor — handle 401 token expiry globally
// ─────────────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // ✅ Token expired or invalid — clear storage and redirect to login
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } catch {
        // ignore localStorage errors
      }

      // Only redirect if not already on login/register page
      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && currentPath !== "/register" && currentPath !== "/") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;