'use client';

import NotificationDemo from '@/src/components/ui/notificationDemo';

export default function NotificationDemoPage() {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          🎉 Attractive Notification System Demo
        </h1>
        <p className="text-gray-300 text-center mb-8">
          Experience the new engaging notification system that replaces basic toast messages
        </p>
        <NotificationDemo />
      </div>
    </div>
  );
} 