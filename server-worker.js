const CACHE_NAME = 'luxearn-pwa-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/lexearn.png',
  '/recharge.html',
  '/notifications.html'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        return response || fetch(event.request);
      })
  );
});

// Handle Notification Clicks and Action Buttons
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const action = event.action;
  const notificationData = event.notification.data || {};
  let targetUrl = '/';

  // Handle different actions
  if (action === 'dismiss' || action === 'mark-read') {
    // Just close the notification, don't navigate
    return;
  } else if (action === 'visit') {
    // Welcome notification - Visit button
    targetUrl = notificationData.url || '/notifications.html';
  } else if (action === 'get-bonus') {
    // Bonus notification - Get Bonus button
    targetUrl = notificationData.url || '/recharge.html';
  } else {
    // Clicked on notification body (not a button)
    targetUrl = notificationData.url || '/';
  }

  event.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true}).then(function(clientList) {
      // If a window is already open, focus it and navigate
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if ('focus' in client) {
          return client.focus().then(function() {
            if ('navigate' in client) {
              return client.navigate(targetUrl);
            }
          });
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Handle notification close (for mark as read functionality)
self.addEventListener('notificationclose', function(event) {
  // Notification was dismissed/closed
  console.log('Notification closed:', event.notification.tag);
});
