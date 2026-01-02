import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Retry configuration for faster recovery
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 300;

// In-memory cache for instant perceived loading
// TTL synced with backend cache (30 seconds) to prevent stale data
const apiCache = new Map();
const CACHE_TTL = 30 * 1000; // 30 seconds - matches backend cache

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000, // 15 seconds - allows AI endpoints (Gemini) time to respond
});

// Request interceptor to add auth token and implement caching
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Check cache for GET requests (stale-while-revalidate pattern)
        if (config.method === 'get') {
            const cacheKey = `${config.baseURL}${config.url}`;
            const cached = apiCache.get(cacheKey);

            if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
                // Return cached response immediately
                config.adapter = () => Promise.resolve({
                    data: cached.data,
                    status: 200,
                    statusText: 'OK (cached)',
                    headers: { 'x-cache': 'HIT' },
                    config
                });
            }
            // Note: We no longer deduplicate requests - this was causing issues
            // Each request goes through normally, cache handles efficiency
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
    async (error) => {
        const config = error.config;

        // Initialize retry count
        if (config && !config._retryCount) {
            config._retryCount = 0;
        }

        // Don't retry on 4xx errors (client error, won't change)
        const is4xxError = error.response && error.response.status >= 400 && error.response.status < 500;

        // Retry on network errors, 5xx errors, or timeouts
        if (config && !is4xxError && config._retryCount < MAX_RETRIES) {
            config._retryCount += 1;
            const delay = RETRY_DELAY_MS * Math.pow(2, config._retryCount - 1);
            console.log(`🔄 Retrying request (attempt ${config._retryCount}/${MAX_RETRIES}) after ${delay}ms...`);

            await new Promise(resolve => setTimeout(resolve, delay));

            // Retry with the same config (which already has auth token from interceptor)
            return api.request(config);
        }

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
