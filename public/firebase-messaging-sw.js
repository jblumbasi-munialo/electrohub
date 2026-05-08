// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBPdBYIVg6k_9SOGuZYz-FV091nLdMgNbM",
  authDomain: "electrohub-kenya.firebaseapp.com",
  projectId: "electrohub-kenya",
  storageBucket: "electrohub-kenya.firebasestorage.app",
  messagingSenderId: "256960919112",
  appId: "1:256960919112:web:7adc2189cb1be0f468ca7d"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);
  const { title, body } = payload.notification;
  self.registration.showNotification(title, { body });
});
