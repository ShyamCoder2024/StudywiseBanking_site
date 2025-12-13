import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
        if (error.response) {
            // Handle specific error codes
            if (error.response.status === 401) {
                // Unauthorized - clear token and redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }

            // Return formatted error
            return Promise.reject({
                success: false,
                error: error.response.data.error || {
                    code: 'UNKNOWN_ERROR',
                    message: 'An unexpected error occurred',
                },
            });
        }

        // Network error
        return Promise.reject({
            success: false,
            error: {
                code: 'NETWORK_ERROR',
                message: 'Unable to connect to server. Please check your internet connection.',
            },
        });
    }
);

export default api;
