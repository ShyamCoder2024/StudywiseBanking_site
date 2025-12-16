import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        if (error.response) {
            // Handle specific error codes
            if (error.response.status === 401) {
                // Unauthorized - clear token and redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }

            // Preserve original error for better debugging
            const enhancedError = new Error(
                error.response.data?.message ||
                error.response.data?.error?.message ||
                'An unexpected error occurred'
            );
            enhancedError.response = error.response;
            enhancedError.status = error.response.status;
            return Promise.reject(enhancedError);
        }

        // Network error
        const networkError = new Error('Unable to connect to server. Please check your internet connection.');
        networkError.isNetworkError = true;
        return Promise.reject(networkError);
    }
);

export default api;
