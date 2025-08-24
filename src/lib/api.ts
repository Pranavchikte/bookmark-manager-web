import axios from "axios";
import { useAuthStore } from "@/stores/authStore"

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// This is an Axios interceptor. It's a function that runs
// BEFORE every single request is sent.
api.interceptors.request.use(
  (config) => {
    // Get the state from our Zustand store
    const { accessToken } = useAuthStore.getState();

    // If an access token exists, add it to the request headers
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;