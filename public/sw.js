self.addEventListener('push', function(event) {
  if (!event.data) return

  const payload = event.data.json()

  const options = {
    body: payload.body,
    tag: payload.tag || 'nutrition-default',
    data: {
      url: payload.url || '/',
      notificationId: payload.notificationId,
    },
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
    vibrate: [100, 50, 100],
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || 'Nutrition Tracker', options)
  )
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()

  const action = event.action || 'opened'

  if (action !== 'dismiss') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    )
  }
})

self.addEventListener('install', function(event) {
  self.skipWaiting()
})

self.addEventListener('activate', function(event) {
  event.waitUntil(clients.claim())
})
