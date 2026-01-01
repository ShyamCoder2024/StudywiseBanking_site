// Service Worker for StudyWise Banking PWA
// Enhanced for native app-like experience
const CACHE_NAME = 'studywise-v3';
const STATIC_CACHE = 'studywise-static-v3';
const DYNAMIC_CACHE = 'studywise-dynamic-v3';

// Static assets to precache (critical for instant loading)
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/logo_new.jpg',
    '/manifest.json'
];

// Assets to cache on-the-fly
const CACHE_FIRST_URLS = [
    /\.(js|css|woff2?|ttf|eot|svg|png|jpg|jpeg|gif|webp)$/,
    /fonts\.googleapis\.com/,
    /fonts\.gstatic\.com/
];

// Install event - precache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
                    .map((name) => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - smart caching strategy
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip API requests - always fetch from network (real-time data)
    if (url.pathname.startsWith('/api/') || request.url.includes('/api/')) {
        return;
    }

    // Skip chrome-extension and other non-http(s) requests
    if (!request.url.startsWith('http')) return;

    // Strategy: Stale-While-Revalidate for static assets (faster perceived loading)
    const isCacheFirst = CACHE_FIRST_URLS.some(pattern =>
        pattern instanceof RegExp ? pattern.test(request.url) : request.url.includes(pattern)
    );

    if (isCacheFirst) {
        // Cache First, then update cache in background
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                const fetchPromise = fetch(request).then((networkResponse) => {
                    if (networkResponse.status === 200) {
                        const clone = networkResponse.clone();
                        caches.open(DYNAMIC_CACHE).then((cache) => {
                            cache.put(request, clone);
                        });
                    }
                    return networkResponse;
                }).catch(() => cachedResponse);

                return cachedResponse || fetchPromise;
            })
        );
        return;
    }

    // Navigation requests - Network first with fast offline fallback
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Cache successful navigation responses
                    if (response.status === 200) {
                        const clone = response.clone();
                        caches.open(DYNAMIC_CACHE).then((cache) => {
                            cache.put(request, clone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Fallback to cached version or shell
                    return caches.match(request)
                        .then((cachedResponse) => cachedResponse || caches.match('/'));
                })
        );
        return;
    }

    // Default: Network first, cache fallback
    event.respondWith(
        fetch(request)
            .then((response) => {
                if (response.status === 200) {
                    const clone = response.clone();
                    caches.open(DYNAMIC_CACHE).then((cache) => {
                        cache.put(request, clone);
                    });
                }
                return response;
            })
            .catch(() => caches.match(request))
    );
});

// Background sync for offline actions (future enhancement)
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(
            // Handle background sync when implemented
            Promise.resolve()
        );
    }
});

// Push notifications (future enhancement)
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        event.waitUntil(
            self.registration.showNotification(data.title || 'StudyWise', {
                body: data.body || 'New update available!',
                icon: '/logo_new.jpg',
                badge: '/logo_new.jpg',
                vibrate: [100, 50, 100],
                data: { url: data.url || '/' }
            })
        );
    }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url || '/';
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((windowClients) => {
            // Focus existing window or open new one
            for (const client of windowClients) {
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            return clients.openWindow(url);
        })
    );
});
