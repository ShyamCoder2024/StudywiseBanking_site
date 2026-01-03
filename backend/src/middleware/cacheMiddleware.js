// Enhanced in-memory cache middleware for API responses
// With per-user caching, TTL options, and pattern invalidation

const cache = new Map();
const DEFAULT_DURATION = 60 * 1000; // 1 minute default

// Cleanup expired entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of cache) {
        if (now > value.expiresAt) {
            cache.delete(key);
        }
    }
}, 60000); // Cleanup every minute

/**
 * Generate cache key from request
 * @param {Object} req - Express request object
 * @param {boolean} perUser - Include user ID in key
 */
const generateKey = (req, perUser = false) => {
    const base = req.originalUrl || req.url;
    if (perUser && req.user?._id) {
        return `${base}::user::${req.user._id}`;
    }
    return base;
};

/**
 * Cache middleware for GET requests
 * @param {Object} options - Cache options
 * @param {number} options.duration - Cache duration in milliseconds
 * @param {boolean} options.perUser - Cache per user (for personalized data)
 */
export const cacheMiddleware = (options = {}) => {
    const duration = options.duration || options || DEFAULT_DURATION;
    const perUser = options.perUser || false;

    return (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            // Clear relevant cache on mutations
            if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
                // Intelligent invalidation based on URL pattern
                const urlPath = req.originalUrl.split('?')[0];
                invalidatePattern(urlPath.split('/').slice(0, 4).join('/'));
            }
            return next();
        }

        // CRITICAL FIX: Skip caching for PERSONALIZED endpoints
        // These endpoints return PER-USER data and must NEVER be cached globally
        // Caching them causes User A's data to be served to User B (MAJOR BUG)
        const personalizedEndpoints = [
            '/global-tasks',    // To-do list with per-user completion status
            '/tasks',           // User-assigned tasks  
        ];

        const requestPath = req.originalUrl.split('?')[0];
        const shouldSkipCache = personalizedEndpoints.some(endpoint =>
            requestPath.includes(endpoint)
        );

        if (shouldSkipCache && !perUser) {
            // Skip global cache for personalized data
            // Let the route handler serve fresh data every time
            return next();
        }

        const key = generateKey(req, perUser);
        const cachedResponse = cache.get(key);

        if (cachedResponse && Date.now() < cachedResponse.expiresAt) {
            // Return cached response with header
            res.setHeader('X-Cache', 'HIT');
            res.setHeader('X-Cache-Age', Math.round((Date.now() - cachedResponse.timestamp) / 1000));
            return res.json(cachedResponse.data);
        }

        // Store original res.json
        const originalJson = res.json.bind(res);

        // Override res.json to cache the response
        res.json = (data) => {
            // Only cache successful responses
            if (res.statusCode === 200) {
                cache.set(key, {
                    data,
                    timestamp: Date.now(),
                    expiresAt: Date.now() + (typeof duration === 'number' ? duration : DEFAULT_DURATION)
                });
            }
            res.setHeader('X-Cache', 'MISS');
            return originalJson(data);
        };

        next();
    };
};

/**
 * Invalidate cache entries matching a pattern
 * @param {string} pattern - URL pattern to match
 */
export const invalidatePattern = (pattern) => {
    for (const key of cache.keys()) {
        if (key.includes(pattern)) {
            cache.delete(key);
        }
    }
};

/**
 * Clear all cache
 */
export const clearCache = () => {
    cache.clear();
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
    const now = Date.now();
    let active = 0;
    let expired = 0;

    for (const [, value] of cache) {
        if (now < value.expiresAt) active++;
        else expired++;
    }

    return {
        total: cache.size,
        active,
        expired,
        entries: Array.from(cache.keys()).slice(0, 20) // First 20 keys
    };
};

// Pre-configured cache durations
export const CACHE_DURATIONS = {
    SHORT: 30 * 1000,       // 30 seconds - frequently changing data
    MEDIUM: 60 * 1000,      // 1 minute - semi-static data
    LONG: 5 * 60 * 1000,    // 5 minutes - rarely changing data
    VERY_LONG: 10 * 60 * 1000, // 10 minutes - static data
    COURSE: 5 * 60 * 1000   // 5 minutes - course data (changes infrequently)
};

export default cacheMiddleware;
