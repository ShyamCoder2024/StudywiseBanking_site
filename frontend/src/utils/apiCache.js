// API Response Cache for faster data loading
// Caches API responses in memory with configurable TTL

class APICache {
    constructor() {
        this.cache = new Map();
        this.listeners = new Map();
    }

    // Generate cache key from endpoint and params
    generateKey(endpoint, params = {}) {
        return `${endpoint}:${JSON.stringify(params)}`;
    }

    // Get cached data
    get(endpoint, params = {}) {
        const key = this.generateKey(endpoint, params);
        const cached = this.cache.get(key);

        if (!cached) return null;

        // Check if cache is expired
        if (Date.now() > cached.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    // Set cached data with TTL (in milliseconds)
    set(endpoint, data, ttl = 60000, params = {}) {
        const key = this.generateKey(endpoint, params);
        this.cache.set(key, {
            data,
            expiresAt: Date.now() + ttl,
            createdAt: Date.now()
        });

        // Notify listeners
        this.notifyListeners(key, data);
    }

    // Invalidate specific cache
    invalidate(endpoint, params = {}) {
        const key = this.generateKey(endpoint, params);
        this.cache.delete(key);
    }

    // Invalidate all caches matching a pattern
    invalidatePattern(pattern) {
        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
            }
        }
    }

    // Clear all cache
    clear() {
        this.cache.clear();
    }

    // Subscribe to cache updates
    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);

        return () => {
            this.listeners.get(key)?.delete(callback);
        };
    }

    // Notify listeners of updates
    notifyListeners(key, data) {
        this.listeners.get(key)?.forEach(callback => callback(data));
    }

    // Get cache stats
    getStats() {
        let total = 0;
        let expired = 0;
        const now = Date.now();

        this.cache.forEach((value) => {
            total++;
            if (now > value.expiresAt) expired++;
        });

        return { total, expired, active: total - expired };
    }
}

// Singleton instance
const apiCache = new APICache();

// Helper: Cache-first API request
export async function cachedFetch(api, endpoint, options = {}) {
    const {
        ttl = 60000,        // 1 minute default
        params = {},
        forceRefresh = false,
        onCacheHit = null
    } = options;

    // Check cache first (unless forced refresh)
    if (!forceRefresh) {
        const cached = apiCache.get(endpoint, params);
        if (cached) {
            onCacheHit?.(cached);
            return { data: cached, fromCache: true };
        }
    }

    // Fetch from API
    const response = await api.get(endpoint, { params });

    // Cache the response
    if (response.data) {
        apiCache.set(endpoint, response.data, ttl, params);
    }

    return { data: response.data, fromCache: false };
}

// Helper: Stale-while-revalidate pattern
export async function staleWhileRevalidate(api, endpoint, options = {}) {
    const {
        ttl = 60000,
        staleTTL = 300000,  // 5 minutes stale time
        params = {},
        onData = null
    } = options;

    const key = apiCache.generateKey(endpoint, params);
    const cached = apiCache.cache.get(key);

    // If we have cached data (even stale), use it immediately
    if (cached) {
        onData?.(cached.data, true);

        // If not expired, just return cached
        if (Date.now() <= cached.expiresAt) {
            return { data: cached.data, fromCache: true };
        }

        // If stale but still within stale TTL, revalidate in background
        if (Date.now() <= cached.createdAt + staleTTL) {
            // Background revalidation
            api.get(endpoint, { params }).then(response => {
                apiCache.set(endpoint, response.data, ttl, params);
                onData?.(response.data, false);
            }).catch(() => {
                // Silently fail - we still have stale data
            });

            return { data: cached.data, fromCache: true, stale: true };
        }
    }

    // No cache or too stale - fetch fresh
    const response = await api.get(endpoint, { params });
    apiCache.set(endpoint, response.data, ttl, params);
    onData?.(response.data, false);

    return { data: response.data, fromCache: false };
}

// Common cache TTLs
export const CACHE_TTL = {
    SHORT: 30000,      // 30 seconds - for rapidly changing data
    MEDIUM: 120000,    // 2 minutes - for semi-static data
    LONG: 300000,      // 5 minutes - for rarely changing data
    VERY_LONG: 600000  // 10 minutes - for static data
};

// Export cache instance for direct access
export { apiCache };
export default apiCache;
