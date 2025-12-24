// Simple in-memory cache middleware for API responses
const cache = new Map();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

/**
 * Cache middleware for GET requests
 * Automatically invalidates cache on POST/PUT/PATCH/DELETE
 */
export const cacheMiddleware = (duration = CACHE_DURATION) => {
    return (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            // Clear cache on mutations to keep data fresh
            if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
                cache.clear();
            }
            return next();
        }

        const key = req.originalUrl || req.url;
        const cachedResponse = cache.get(key);

        if (cachedResponse && Date.now() - cachedResponse.timestamp < duration) {
            // Return cached response
            return res.json(cachedResponse.data);
        }

        // Store original res.json
        const originalJson = res.json.bind(res);

        // Override res.json to cache the response
        res.json = (data) => {
            cache.set(key, {
                data,
                timestamp: Date.now()
            });
            return originalJson(data);
        };

        next();
    };
};

// Clear cache utility (can be called manually if needed)
export const clearCache = () => {
    cache.clear();
};

export default cacheMiddleware;
