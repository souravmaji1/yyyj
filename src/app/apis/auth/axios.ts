import {
  getClientCookie,
  getLocalData,
  removeClientCookie,
  setClientCookie,
} from "@/src/core/config/localStorage";
import axios from "axios";
import axiosRetry from "axios-retry";

const BASE_URL = process.env.NEXT_PUBLIC_API_USER_BASE_URL;
const CREATE_STRIPE_URL = process.env.NEXT_PUBLIC_API_PAYMENT_BASE_URL;
const ARENA_URL = process.env.NEXT_PUBLIC_API_ARENA_BASE_URL;
const AI_BASE_URL = process.env.NEXT_PUBLIC_API_AI_BASE_URL;

// Debug environment variables
console.log("🔧 Environment Variables Debug:", {
  BASE_URL,
  CREATE_STRIPE_URL,
  AI_BASE_URL,
});

// Initialize the axios client
const authAxiosClient = axios.create({
  baseURL: BASE_URL,
});

const paymentAxiosClient = axios.create({
  baseURL: CREATE_STRIPE_URL,
});

const aiAxiosClient = axios.create({
  baseURL: AI_BASE_URL,
});

console.log("🔧 AI Client created with base URL:", AI_BASE_URL);
console.log("🔧 AI Client created successfully");

const arenaAxiosClient = axios.create({
  baseURL: ARENA_URL,
});

// Refresh token function
const refreshToken = async (): Promise<string | null> => {
  try {
    const refreshTokenValue = getClientCookie("refreshToken");
    const userAuthDetails = JSON.parse(
      localStorage.getItem("userAuthDetails") || "{}"
    );

    if (!refreshTokenValue || !userAuthDetails.idpUsername) {
      throw new Error("No refresh token or user ID available");
    }

    const response = await axios.post(
      `${BASE_URL}/auth/refresh-token?idp-username=${userAuthDetails.idpUsername}`,
      {
        refreshToken: refreshTokenValue,
      }
    );

    console.log("dddrefersh->", response.data.data);

    if (response.data?.data?.accessToken) {
      setClientCookie("accessToken", response.data?.data.accessToken, {
        path: "/",
        maxAge: response.data?.data.expirySeconds,
      });

      setClientCookie("accessToken", String(response.data?.data.accessToken), {
        path: "/",
        maxAge: response.data?.data.expirySeconds,
      });
      setClientCookie(
        "refreshToken",
        String(response.data?.data.refreshToken),
        {
          path: "/",
          maxAge: response.data?.data.expirySeconds,
        }
      );
      setClientCookie("idToken", String(response.data?.data.idToken), {
        path: "/",
        maxAge: response.data?.data.expirySeconds,
      });

      return response.data?.data.accessToken;
    }
    throw new Error("Invalid refresh response");
  } catch (error) {
    console.error("Error refreshing token:", error);
    removeClientCookie("accessToken");
    removeClientCookie("refreshToken");
    window.location.replace("/auth");
    return null;
  }
};

// Request interceptor
authAxiosClient.interceptors.request.use((config) => {
  const accessToken = getClientCookie("accessToken") || "";
  config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// Request interceptor for AI client
aiAxiosClient.interceptors.request.use((config) => {
  const accessToken = getClientCookie("accessToken") || "";
  config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// Response interceptor with refresh token logic
authAxiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is due to expired token
    const msg = error.response?.data?.message || "";
    const isTokenExpired =
      error.response?.status === 401 &&
      !originalRequest._retry &&
      (msg.includes("expired Cognito token") ||
        msg.includes("expired token") ||
        msg.includes("User not authenticated") ||
        msg.includes("No token provided") ||
        msg.includes("Invalid token"));

    if (isTokenExpired) {
      console.log("🔄 Token expired detected, attempting refresh...");
      originalRequest._retry = true;
      const newToken = await refreshToken();

      if (newToken) {
        console.log("✅ Token refreshed successfully, retrying request...");
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        console.log(
          "🔑 New Authorization header:",
          originalRequest.headers.Authorization
        );
        return authAxiosClient(originalRequest);
      } else {
        console.log("❌ Token refresh failed");
      }
    }

    return Promise.reject(
      error.response?.data?.message || error.message || "Something went wrong"
    );
  }
);

// Response interceptor with refresh token logic for AI client
aiAxiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is due to expired token
    const msg = error.response?.data?.message || "";
    const isTokenExpired =
      error.response?.status === 401 &&
      !originalRequest._retry &&
      (msg.includes("expired Cognito token") ||
        msg.includes("expired token") ||
        msg.includes("User not authenticated") ||
        msg.includes("No token provided") ||
        msg.includes("Invalid token"));

    if (isTokenExpired) {
      originalRequest._retry = true;
      const newToken = await refreshToken();

      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return aiAxiosClient(originalRequest);
      }
    }

    return Promise.reject(
      error.response?.data?.message || error.message || "Something went wrong"
    );
  }
);

// Retry interceptor - temporarily disabled to avoid conflict with token refresh
// axiosRetry(authAxiosClient, {
//   retries: 3,
// });

// Retry interceptor for AI client
axiosRetry(aiAxiosClient, {
  retries: 3,
});

// Request interceptor for payment client
paymentAxiosClient.interceptors.request.use((config) => {
  const accessToken = getClientCookie("accessToken") || "";
  config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// Response interceptor with refresh token logic for payment client
paymentAxiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is due to expired token
    const msg = error.response?.data?.message || "";
    const isTokenExpired =
      error.response?.status === 401 &&
      !originalRequest._retry &&
      (msg.includes("expired Cognito token") ||
        msg.includes("expired token") ||
        msg.includes("No token provided") ||
        msg.includes("Invalid token"));

    if (isTokenExpired) {
      originalRequest._retry = true;
      const newToken = await refreshToken();

      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return paymentAxiosClient(originalRequest);
      }
    }

    return Promise.reject(
      error.response?.data?.message || error.message || "Something went wrong"
    );
  }
);

// Retry interceptor for payment client
axiosRetry(paymentAxiosClient, {
  retries: 3,
});

// Request interceptor for ai client - REMOVED DUPLICATE

console.log("🔧 AI Client interceptor attached successfully");

// Response interceptor with refresh token logic for ai client
aiAxiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is due to expired token
    const msg = error.response?.data?.message || "";
    const isTokenExpired =
      error.response?.status === 401 &&
      !originalRequest._retry &&
      (msg.includes("expired Cognito token") ||
        msg.includes("expired token") ||
        msg.includes("Invalid or expired Cognito token") ||
        msg.includes("Unauthorized"));

    if (isTokenExpired) {
      console.log("🔄 Token expired, attempting refresh for AI client...");
      originalRequest._retry = true;
      const newToken = await refreshToken();

      if (newToken) {
        console.log("✅ Token refreshed successfully for AI client");
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return aiAxiosClient(originalRequest);
      } else {
        console.log("❌ Token refresh failed for AI client");
      }
    }

    return Promise.reject(
      error.response?.data?.message || error.message || "Something went wrong"
    );
  }
);

// Retry interceptor for ai client
axiosRetry(aiAxiosClient, {
  retries: 3,
});

// Request interceptor for arena client
arenaAxiosClient.interceptors.request.use((config) => {
  const accessToken = getClientCookie("accessToken") || "";
  config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// Response interceptor with refresh token logic for arena client
arenaAxiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is due to expired token
    const msg = error.response?.data?.message || "";
    const isTokenExpired =
      error.response?.status === 401 &&
      !originalRequest._retry &&
      (msg.includes("expired Cognito token") ||
        msg.includes("expired token") ||
        msg.includes("Missing Authentication Token"));

    if (isTokenExpired) {
      originalRequest._retry = true;
      const newToken = await refreshToken();

      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return arenaAxiosClient(originalRequest);
      }
    }

    return Promise.reject(
      error.response?.data?.message || error.message || "Something went wrong"
    );
  }
);

// Retry interceptor for arena client
axiosRetry(arenaAxiosClient, {
  retries: 3,
});

export { paymentAxiosClient, arenaAxiosClient, aiAxiosClient };
export default authAxiosClient;
