// KiloCheck Service Worker for PWA functionality and performance optimization

const CACHE_NAME = 'kilocheck-v1'
const STATIC_CACHE = 'kilocheck-static-v1'
const DYNAMIC_CACHE = 'kilocheck-dynamic-v1'

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/_next/static/css/',
  '/_next/static/js/',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error)
      })
  )
  
  // Force activation of new service worker
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        // Take control of all pages
        return self.clients.claim()
      })
  )
})

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Skip API calls (they should always be fresh)
  if (url.pathname.startsWith('/api/')) {
    return
  }
  
  // Skip external requests
  if (url.origin !== location.origin) {
    return
  }
  
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('Service Worker: Serving from cache', request.url)
          return cachedResponse
        }
        
        // Otherwise fetch from network
        return fetch(request)
          .then((networkResponse) => {
            // Don't cache if not successful
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse
            }
            
            // Clone the response (can only be consumed once)
            const responseToCache = networkResponse.clone()
            
            // Determine which cache to use
            const cacheName = isStaticAsset(request.url) ? STATIC_CACHE : DYNAMIC_CACHE
            
            // Cache the response
            caches.open(cacheName)
              .then((cache) => {
                console.log('Service Worker: Caching new resource', request.url)
                cache.put(request, responseToCache)
              })
              .catch((error) => {
                console.error('Service Worker: Failed to cache resource', error)
              })
            
            return networkResponse
          })
          .catch((error) => {
            console.error('Service Worker: Network request failed', error)
            
            // Return offline fallback for navigation requests
            if (request.destination === 'document') {
              return caches.match('/')
            }
            
            throw error
          })
      })
  )
})

// Helper function to determine if asset is static
function isStaticAsset(url) {
  return url.includes('/_next/static/') || 
         url.includes('/static/') ||
         url.endsWith('.css') ||
         url.endsWith('.js') ||
         url.endsWith('.woff2') ||
         url.endsWith('.woff') ||
         url.endsWith('.ttf')
}

// Background sync for offline functionality (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered')
    // Handle offline queue processing here
  }
})

// Push notifications (future enhancement)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    console.log('Service Worker: Push notification received', data)
    
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      }
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked')
  event.notification.close()
  
  event.waitUntil(
    clients.openWindow('/')
  )
})

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
})

console.log('Service Worker: Loaded successfully')