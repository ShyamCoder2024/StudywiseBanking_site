import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Retry configuration for failed requests
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // Start with 1 second

// Simple in-memory cache for GET requests
const apiCache = new Map();
const pendingRequests = new Map(); // Prevent duplicate requests
const CACHE_TTL = 60 * 1000; // 1 minute cache (reduced for fresher data)

// Exponential backoff retry function
const retryRequest = async (config, retryCount = 0) => {
    try {
        return await axios.request(config);
    } catch (error) {
        // Don't retry on 4xx errors (client error, won't change)
        if (error.response && error.response.status >= 400 && error.response.status < 500) {
            throw error;
        }

        // Retry on network errors, 5xx errors, or timeouts
        if (retryCount < MAX_RETRIES) {
            const delay = RETRY_DELAY_MS * Math.pow(2, retryCount); // Exponential backoff
            console.log(`🔄 Retrying request (attempt ${retryCount + 1}/${MAX_RETRIES}) after ${delay}ms...`);

            await new Promise(resolve => setTimeout(resolve, delay));
            return retryRequest(config, retryCount + 1);
        }

        throw error;
    }
};

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 8000, // 8 seconds - fail fast, retry will handle it
});

// Request interceptor to add auth token and implement caching/deduplication
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Check cache for GET requests
        if (config.method === 'get') {
            const cacheKey = `${config.baseURL}${config.url}`;
            const cached = apiCache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
                // Return cached response
                config.adapter = () => Promise.resolve({
                    data: cached.data,
                    status: 200,
                    statusText: 'OK (cached)',
                    headers: { 'x-cache': 'HIT' },
                    config
                });
                return config;
            }

            // Deduplicate in-flight requests
            if (pendingRequests.has(cacheKey)) {
                config.adapter = () => pendingRequests.get(cacheKey);
                return config;
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle caching and errors
api.interceptors.response.use(
    (response) => {
        // Cache successful GET responses
        if (response.config.method === 'get' && response.status === 200) {
            const cacheKey = `${response.config.baseURL}${response.config.url}`;
            apiCache.set(cacheKey, {
                data: response.data,
                timestamp: Date.now()
            });
        }

        // Invalidate cache on mutations
        if (['post', 'put', 'patch', 'delete'].includes(response.config.method)) {
            apiCache.clear(); // Simple approach: clear all cache on any mutation
        }

        return response;
    },
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

// Integrate retry logic into axios instance - PROPER IMPLEMENTATION
const originalRequest = api.request.bind(api);
api.request = async function (config) {
    return retryRequest(config);
};

export default api;
