import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 60000, // 60 seconds - Render free tier can take 50+ seconds on cold start
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
            // Handle 401 Unauthorized
            if (error.response.status === 401) {
                const currentPath = window.location.pathname;

                // Don't redirect if already on a login page (prevent loops)
                if (currentPath === '/login' || currentPath === '/admin-login') {
                    // Just reject the error, don't redirect
                    const authError = new Error('Authentication failed. Please check your credentials.');
                    authError.response = error.response;
                    authError.status = 401;
                    return Promise.reject(authError);
                }

                // Clear auth data
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                // Create auth error to reject immediately (allows catch blocks to handle)
                const authError = new Error('Session expired. Redirecting to login...');
                authError.response = error.response;
                authError.status = 401;
                authError.isAuthError = true;

                // Redirect after a brief delay
                setTimeout(() => {
                    if (currentPath.startsWith('/admin')) {
                        window.location.href = '/admin-login';
                    } else {
                        window.location.href = '/login';
                    }
                }, 100);

                // Reject immediately so catch blocks can handle loading states
                return Promise.reject(authError);
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
