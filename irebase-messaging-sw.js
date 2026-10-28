// Import Firebase v10.14.1 Compat Scripts for Service Worker Background Messaging
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

// Initialize Firebase with your project configuration
// (Copy these values directly from your firebase-config.js file)
firebase.initializeApp({
 apiKey: "AIzaSyBv5L7DbtXMiPnAZ34OU9fW2wLQQi6W500",
  authDomain: "paws-animal-rescue.firebaseapp.com",
  projectId: "paws-animal-rescue",
  storageBucket: "paws-animal-rescue.firebasestorage.app",
  messagingSenderId: "381388300668",
  appId: "1:381388300668:web:01a545c406a2fd24ed44f9"
});

// Retrieve an instance of Firebase Messaging to handle background notifications
const messaging = firebase.messaging();

// Background message handler (triggers when a push notification arrives while the app is closed or in the background)
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Background message received:", payload);
  
  const notificationTitle = payload.notification?.title || "🚨 Emergency SOS Alert";
  const notificationOptions = {
    body: payload.notification?.body || "New animal emergency report received!",
    icon: "/icon.png" // Optional: add an icon if available in your root folder
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
