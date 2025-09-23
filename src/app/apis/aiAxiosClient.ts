import axios from 'axios';

// Debug environment variable
console.log(' AI Axios Client - NEXT_PUBLIC_API_AI_BASE_URL:', process.env.NEXT_PUBLIC_API_AI_BASE_URL);

// Create axios instance for AI Studio API calls
export const aiAxiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_AI_BASE_URL || 'http://localhost:3003/api/ai',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log('AI Axios Client created with baseURL:', aiAxiosClient.defaults.baseURL);

// Add request interceptor to include auth token
aiAxiosClient.interceptors.request.use(
  (config) => {
    console.log(' AI API Request:', config.method?.toUpperCase(), config.url);
    console.log(' Request data:', config.data);
    
    // Get token from localStorage or wherever you store it
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(' Auth token added to request');
    } else {
      console.log('No auth token found');
    }
    return config;
  },
  (error) => {
    console.error(' AI API Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
aiAxiosClient.interceptors.response.use(
  (response) => {
    console.log('AI API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error(' AI API Response error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);