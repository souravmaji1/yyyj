import axios from 'axios';
import { getClientCookie, setClientCookie, removeClientCookie } from '@/src/core/config/localStorage';

// Debug environment variable
console.log(' AI Chat Client - NEXT_PUBLIC_API_AI_CHAT_BASE_URL:', process.env.NEXT_PUBLIC_API_AI_CHAT_BASE_URL);

// Create dedicated axios instance for AI Chat microservice
export const aiChatAxiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_AI_CHAT_BASE_URL || 'https://api.intelli-verse-x.ai',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

console.log(' AI Chat Client created with baseURL:', aiChatAxiosClient.defaults.baseURL);

// Refresh token function (same as other clients)
const refreshToken = async (): Promise<string | null> => {
  try {
    const refreshTokenValue = getClientCookie("refreshToken");
    const userAuthDetails = JSON.parse(
      localStorage.getItem("userAuthDetails") || "{}"
    );

    if (!refreshTokenValue || !userAuthDetails.idpUsername) {
      throw new Error("No refresh token or user ID available");
    }

    const BASE_URL = process.env.NEXT_PUBLIC_API_USER_BASE_URL;
    const response = await axios.post(
      `${BASE_URL}/auth/refresh-token?idp-username=${userAuthDetails.idpUsername}`,
      {
        refreshToken: refreshTokenValue,
      }
    );

    if (response.data?.data?.accessToken) {
      setClientCookie("accessToken", response.data?.data.accessToken, {
        path: "/",
        maxAge: response.data?.data.expirySeconds,
      });

      setClientCookie("refreshToken", String(response.data?.data.refreshToken), {
        path: "/",
        maxAge: response.data?.data.expirySeconds,
      });
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

// Add request interceptor to include auth token
aiChatAxiosClient.interceptors.request.use(
  (config) => {
    console.log(' AI Chat API Request:', config.method?.toUpperCase(), config.url);
    console.log(' Request data:', config.data);
    
    // Get token using the same method as other clients
    const token = getClientCookie('accessToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(' Auth token added to AI Chat request');
    } else {
      console.log(' No auth token found for AI Chat request');
    }
    
    return config;
  },
  (error) => {
    console.error(' AI Chat API Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging and error handling with token refresh
aiChatAxiosClient.interceptors.response.use(
  (response) => {
    console.log(' AI Chat API Response:', response.status, response.data);
    return response;
  },
  async (error) => {
    console.error(' AI Chat API Response error:', error.response?.status, error.response?.data);
    
    const originalRequest = error.config;
    
    // Check if error is due to expired token
    const msg = error.response?.data?.detail || error.response?.data?.message || "";
    const isTokenExpired =
      error.response?.status === 401 &&
      !originalRequest._retry &&
      (msg.includes("Not authenticated") || 
       msg.includes("expired Cognito token") || 
       msg.includes("expired token") || 
       msg.includes("User not authenticated") ||
       msg.includes("No token provided") ||
       msg.includes("Invalid token"));

    if (isTokenExpired) {
      console.log(' Token expired detected for AI Chat, attempting refresh...');
      originalRequest._retry = true;
      const newToken = await refreshToken();

      if (newToken) {
        console.log(' Token refreshed successfully for AI Chat, retrying request...');
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return aiChatAxiosClient(originalRequest);
      } else {
        console.log(' Token refresh failed for AI Chat');
      }
    }
    
    // Handle other specific error cases
    if (error.response?.status === 404) {
      console.log(' AI Chat endpoint not found');
    } else if (error.response?.status >= 500) {
      console.log(' AI Chat server error');
    }
    
    return Promise.reject(error);
  }
);

// Add retry logic for failed requests
aiChatAxiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Retry logic for network errors or 5xx errors
    if (!originalRequest._retry && 
        (error.code === 'NETWORK_ERROR' || 
         (error.response?.status >= 500 && error.response?.status < 600))) {
      
      originalRequest._retry = true;
      console.log(' Retrying AI Chat API request...');
      
      // Wait 1 second before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return aiChatAxiosClient(originalRequest);
    }
    
    return Promise.reject(error);
  }
);

export default aiChatAxiosClient;
