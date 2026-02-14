const CACHE_NAME = 'cpr-cache-v1'
const OFFLINE_URL = '/'

const PRECACHE_URLS = [
    '/',
    '/cases',
    '/defendants',
    '/manifest.json',
]

// Install event — precache core pages
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_URLS)
        })
    )
    self.skipWaiting()
})

// Activate event — clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            )
        })
    )
    self.clients.claim()
})

// Fetch event — network-first with cache fallback
self.addEventListener('fetch', (event) => {
    // Only cache GET requests
    if (event.request.method !== 'GET') return

    // Skip Supabase API calls
    if (event.request.url.includes('supabase.co')) return

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Clone the response for caching
                if (response.ok) {
                    const responseClone = response.clone()
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone)
                    })
                }
                return response
            })
            .catch(() => {
                // Return cached version if network fails
                return caches.match(event.request).then((cachedResponse) => {
                    return cachedResponse || caches.match(OFFLINE_URL)
                })
            })
    )
})

// Push notification handler
self.addEventListener('push', (event) => {
    const data = event.data?.json() || {}
    const options = {
        body: data.body || 'New notification',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: data.tag || 'cpr-notification',
        data: {
            url: data.url || '/',
        },
    }

    event.waitUntil(
        self.registration.showNotification(
            data.title || 'Court of Public Record',
            options
        )
    )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    const url = event.notification.data?.url || '/'

    event.waitUntil(
        self.clients.matchAll({ type: 'window' }).then((clientList) => {
            // Focus existing window if found
            for (const client of clientList) {
                if (client.url === url && 'focus' in client) {
                    return client.focus()
                }
            }
            // Open new window
            if (self.clients.openWindow) {
                return self.clients.openWindow(url)
            }
        })
    )
})
