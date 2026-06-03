// mobile/services/api.ts
import axios from "axios";

// Update this to match your Spring Boot API server endpoint
const BASE_URL = "https://campus-rewards-backend--jahnaviverma.replit.app/api";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // CRITICAL FOR PWA/WEB CORS: Allows cross-origin authentication requests to pass
  withCredentials: true,
});

// Interceptor to automatically append the JWT token to every request header
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("user_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);
