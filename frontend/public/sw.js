// Service Worker for StudyWise Banking PWA
// Enhanced for native app-like experience with aggressive caching
// VERSION: v10 - Major bug fixes: To-Do personalization, Streak tracking, AI Coach

const CACHE_VERSION = 'v10';
const STATIC_CACHE = `studywise-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `studywise-dynamic-${CACHE_VERSION}`;
const API_CACHE = `studywise-api-${CACHE_VERSION}`;

// Static assets to precache (critical for instant loading)
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/logo_new.jpg',
    '/manifest.json'
];

// URL patterns for cache-first strategy (static assets)
const CACHE_FIRST_PATTERNS = [
    /\.js$/,
    /\.css$/,
    /\.woff2?$/,
    /\.ttf$/,
    /\.eot$/,
    /\.svg$/,
    /\.png$/,
    /\.jpg$/,
    /\.jpeg$/,
    /\.gif$/,
    /\.webp$/,
    /fonts\.googleapis\.com/,
    /fonts\.gstatic\.com/
];

// API endpoints to cache with stale-while-revalidate (short TTL)
const API_CACHE_PATTERNS = [
    /\/api\/student\/subjects/,
    /\/api\/student\/video-courses/,
    /\/api\/student\/enrollment/,
    /\/api\/student\/settings/
];

// Install event - precache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing new service worker...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] Precaching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[SW] Skip waiting to activate immediately');
                return self.skipWaiting();
            })
    );
});

// Activate event - clean old caches and claim clients
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating new service worker...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => {
                        // Delete old version caches
                        return name.startsWith('studywise-') &&
                            !name.endsWith(CACHE_VERSION);
                    })
                    .map((name) => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => {
            console.log('[SW] Claiming all clients');
            return self.clients.claim();
        }).then(() => {
            // Notify all clients about the update
            return self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'SW_UPDATED',
                        version: CACHE_VERSION
                    });
                });
            });
        })
    );
});

// Fetch event - smart caching strategy
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip chrome-extension and other non-http(s) requests
    if (!request.url.startsWith('http')) return;

    // Strategy for API requests - Network first with short cache fallback
    if (url.pathname.startsWith('/api/') || request.url.includes('/api/')) {
        // Check if this API should be cached
        const shouldCache = API_CACHE_PATTERNS.some(pattern => pattern.test(request.url));

        if (shouldCache) {
            event.respondWith(
                fetch(request)
                    .then((response) => {
                        if (response.status === 200) {
                            const clone = response.clone();
                            caches.open(API_CACHE).then((cache) => {
                                cache.put(request, clone);
                            });
                        }
                        return response;
                    })
                    .catch(() => caches.match(request))
            );
        }
        return;
    }

    // Strategy for static assets - Cache First, Network Fallback
    const isCacheFirst = CACHE_FIRST_PATTERNS.some(pattern => pattern.test(request.url));

    if (isCacheFirst) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                if (cachedResponse) {
                    // Return cached immediately, update cache in background
                    fetch(request).then((networkResponse) => {
                        if (networkResponse.status === 200) {
                            caches.open(DYNAMIC_CACHE).then((cache) => {
                                cache.put(request, networkResponse);
                            });
                        }
                    }).catch(() => { });
                    return cachedResponse;
                }

                // Not in cache, fetch from network and cache
                return fetch(request).then((networkResponse) => {
                    if (networkResponse.status === 200) {
                        const clone = networkResponse.clone();
                        caches.open(DYNAMIC_CACHE).then((cache) => {
                            cache.put(request, clone);
                        });
                    }
                    return networkResponse;
                });
            })
        );
        return;
    }

    // Navigation requests - Network first with offline fallback
    if (request.mode === 'navigate') {
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
                .catch(() => {
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

// Message handler for skip waiting
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('[SW] Skip waiting requested');
        self.skipWaiting();
    }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(Promise.resolve());
    }
});

// Push notifications
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
            for (const client of windowClients) {
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            return clients.openWindow(url);
        })
    );
});
