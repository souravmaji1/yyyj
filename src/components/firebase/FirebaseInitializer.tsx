'use client';

import { useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
    apiKey: "AIzaSyCHmfNFGNCTye3OlJyJRm14MpAFfP9HcEU",
    authDomain: "test-c82a4.firebaseapp.com",
    projectId: "test-c82a4",
    storageBucket: "test-c82a4.firebasestorage.app",
    messagingSenderId: "163629611948",
    appId: "1:163629611948:web:9bff236d93e9e1f42b5809",
    measurementId: "G-W74M6BFK0E"
};

const VAPID_KEY = "BG_WF8sVa-oc51LqgvBCqsNzWMB5ZsgPfsii3yht3pNidOyEDVALmUAjOcGBDjPD6jck4B84l8LOXhC5Zp7DFek";

export const FirebaseInitializer = () => {
    useEffect(() => {
        const initializeFirebase = async () => {
            try {
                console.log('Initializing Firebase...');
                
                // Initialize Firebase
                const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
                const messaging = getMessaging(app);
                
                // Register service worker
                if ('serviceWorker' in navigator) {
                    try {
                        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
                        console.log('Service worker registered:', registration);
                    } catch (error) {
                        console.error('Service worker registration failed:', error);
                    }
                }
                
                // Request notification permission
                const permission = await Notification.requestPermission();
                console.log('Notification permission:', permission);
                
                if (permission === 'granted') {
                    // Get FCM token
                    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
                    console.log('FCM Token obtained:', token ? token.substring(0, 20) + '...' : 'null');
                    
                    // Store token in localStorage
                    if (token) {
                        localStorage.setItem('fcmToken', token);
                        console.log('FCM token stored in localStorage');
                    }
                } else {
                    console.warn('Notification permission denied');
                }
                
                // Handle foreground messages
                onMessage(messaging, (payload) => {
                    console.log('Foreground message received:', payload);
                    
                    // Show notification manually for foreground messages
                    if (Notification.permission === 'granted') {
                        const notification = new Notification(payload.notification?.title || 'New Message', {
                            body: payload.notification?.body,
                            icon: payload.notification?.icon || 'https://intelli-verse-x-brand.s3.us-east-1.amazonaws.com/media/images/intelliverseX/intelli_verse_x_no_slogan.jpg',
                            badge: 'https://intelli-verse-x-brand.s3.us-east-1.amazonaws.com/media/images/intelliverseX/intelli_verse_x_no_slogan.jpg',
                            tag: payload.data?.type || 'general',
                            requireInteraction: payload.data?.priority === 'high',
                            data: payload.data
                        });

                        notification.onclick = () => {
                            window.focus();
                            notification.close();
                            if (payload.data?.actionUrl) {
                                window.open(payload.data.actionUrl, '_blank');
                            }
                        };
                    }
                });
                
                console.log('Firebase initialized successfully');
            } catch (error) {
                console.error('Failed to initialize Firebase:', error);
            }
        };

        initializeFirebase();
    }, []);

    return null; // This component doesn't render anything
}; 