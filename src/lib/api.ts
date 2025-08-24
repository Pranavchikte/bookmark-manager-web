import axios from "axios";
import { useAuthStore } from "@/stores/authStore";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Request Interceptor: Adds the access token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handles expired access tokens
api.interceptors.response.use(
  (response) => response, // On success, just return the response
  async (error) => {
    const originalRequest = error.config;
    const { refreshToken, setTokens, logout } = useAuthStore.getState();

    // Check if the error is a 401 and we haven't already tried to refresh
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark that we've tried to refresh

      if (refreshToken) {
        try {
          // Request a new access token using the refresh token
          const response = await axios.post('http://localhost:5000/api/auth/refresh', {}, {
            headers: { Authorization: `Bearer ${refreshToken}` }
          });

          const { access_token } = response.data;
          setTokens(access_token, refreshToken); // Update the store with the new access token

          // Update the header of the original request and retry it
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);

        } catch (refreshError) {
          // If the refresh token itself is invalid, log the user out
          logout();
          return Promise.reject(refreshError);
        }
      } else {
        // If there's no refresh token, log out
        logout();
      }
    }
    return Promise.reject(error);
  }
);

export default api;