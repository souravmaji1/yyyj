// public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase configuration - using the same config as the main application
const firebaseConfig = {
    apiKey: "AIzaSyCHmfNFGNCTye3OlJyJRm14MpAFfP9HcEU",
    authDomain: "test-c82a4.firebaseapp.com",
    projectId: "test-c82a4",
    storageBucket: "test-c82a4.firebasestorage.app",
    messagingSenderId: "163629611948",
    appId: "1:163629611948:web:9bff236d93e9e1f42b5809",
    measurementId: "G-W74M6BFK0E"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);

  const notificationTitle = payload.notification.title;
  const logoUrl = payload.data?.logoUrl || payload.notification.icon || 'https://intelli-verse-x-brand.s3.us-east-1.amazonaws.com/media/images/intelliverseX/intelli_verse_x_no_slogan.jpg';
  
  // Create actions array based on available data
  const actions = [];
  if (payload.data?.actionText) {
    actions.push({
      action: 'view',
      title: payload.data.actionText,
      icon: logoUrl
    });
  }
  actions.push({
    action: 'dismiss',
    title: 'Dismiss',
    icon: logoUrl
  });

  const notificationOptions = {
    body: payload.notification.body,
    icon: logoUrl,
    image: payload.notification.image || payload.data?.imageUrl,
    badge: logoUrl,
    tag: payload.data?.type || 'general',
    requireInteraction: payload.data?.priority === 'high',
    data: payload.data,
    actions: actions,
    // Rich notification features
    silent: false,
    vibrate: payload.data?.priority === 'high' ? [200, 100, 200] : [100, 100],
    timestamp: Date.now(),
    // Custom styling
    dir: 'ltr',
    lang: 'en-US',
    renotify: true,
    sticky: payload.data?.priority === 'high'
  };

  // Show notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {


  event.notification.close();

  if (event.action === 'view') {
    // Handle view action
    const actionUrl = event.notification.data?.actionUrl;
    
    if (actionUrl) {
      console.log('Opening action URL:', actionUrl);
      event.waitUntil(
        clients.openWindow(actionUrl)
      );
    } else {
      // Default to app home page
      console.log('No action URL, opening home page');
      event.waitUntil(
        clients.openWindow('/')
      );
    }
  } else if (event.action === 'dismiss') {
    // Handle dismiss action - notification already closed
    console.log('Notification dismissed');
  } else {
    // Default click behavior
    const actionUrl = event.notification.data?.actionUrl;
    console.log('Default click - Action URL:', actionUrl);
    
    if (actionUrl) {
      console.log('Opening action URL on default click:', actionUrl);
      event.waitUntil(
        clients.openWindow(actionUrl)
      );
    } else {
      console.log('No action URL, opening home page on default click');
      event.waitUntil(
        clients.openWindow('/')
      );
    }
  }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  
  // You can send analytics or perform cleanup here
  const notificationData = event.notification.data;
  if (notificationData?.type) {
    // Send analytics event
    console.log(`Notification of type ${notificationData.type} was closed`);
  }
});

// Handle push subscription change
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('Push subscription changed:', event);
  
  // Re-subscribe to push notifications
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'BG_WF8sVa-oc51LqgvBCqsNzWMB5ZsgPfsii3yht3pNidOyEDVALmUAjOcGBDjPD6jck4B84l8LOXhC5Zp7DFek'
    }).then((subscription) => {
      console.log('New subscription:', subscription);
      
      // Send new subscription to server
      return fetch('/api/notifications/update-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      });
    }).catch((error) => {
      console.error('Failed to re-subscribe:', error);
    })
  );
});

// Handle install event
self.addEventListener('install', (event) => {
  console.log('Service worker installed');
  self.skipWaiting();
});

// Handle activate event
self.addEventListener('activate', (event) => {
  console.log('Service worker activated');
  event.waitUntil(self.clients.claim());
});

// Handle message events from main thread
self.addEventListener('message', (event) => {
  console.log('Message received in service worker:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Custom notification styling
const createRichNotification = (payload) => {
  const { notification, data } = payload;
  
  // Create custom notification with rich content
  const notificationOptions = {
    body: notification.body,
    icon: data?.logoUrl || notification.icon || 'https://via.placeholder.com/192x192/FF6B35/FFFFFF?text=IX',
    image: data?.imageUrl || notification.image,
    badge: 'https://via.placeholder.com/192x192/FF6B35/FFFFFF?text=IX',
    tag: data?.type || 'general',
    requireInteraction: data?.priority === 'high',
    data: data,
    actions: data?.actionText ? [
      {
        action: 'view',
        title: data.actionText,
        icon: 'https://via.placeholder.com/192x192/FF6B35/FFFFFF?text=IX'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: 'https://via.placeholder.com/192x192/FF6B35/FFFFFF?text=IX'
      }
    ] : undefined,
    // Enhanced styling
    silent: false,
    vibrate: data?.priority === 'high' ? [200, 100, 200] : [100, 100],
    timestamp: Date.now(),
    dir: 'ltr',
    lang: 'en-US',
    renotify: true,
    sticky: data?.priority === 'high'
  };

  return notificationOptions;
};

// Export for use in main thread
self.createRichNotification = createRichNotification; 