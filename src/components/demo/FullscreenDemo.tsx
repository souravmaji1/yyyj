"use client";

import React, { useState } from 'react';
import { VideoHubFullscreen } from '@/src/components/video/fullscreen';
import { Button } from '@/src/components/ui/button';
import Modal from '@/src/components/ui/Modal';

/**
 * Demo component to test the Netflix-like fullscreen experience
 */
export default function FullscreenDemo() {
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState(true);

  const mockVideo = {
    id: 'demo-video-1',
    title: 'Sample Video for Fullscreen Testing',
    url: '/api/placeholder/video.mp4'
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Netflix-like Fullscreen Experience Demo</h1>
        
        <div className="grid gap-6">
          {/* Fullscreen Video Demo */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Fullscreen Video Player</h2>
            <p className="text-gray-300 mb-4">
              Test the fullscreen video experience with glassmorphism overlays, AI assistant, 
              next-up countdown, and reward animations.
            </p>
            <div className="flex gap-4">
              <Button
                onClick={() => setIsFullscreenOpen(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                Open Fullscreen Video
              </Button>
              <Button
                onClick={() => setIsModalOpen(true)}
                variant="outline"
              >
                Test Modal in Fullscreen
              </Button>
            </div>
          </div>

          {/* Features Overview */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Features Implemented</h2>
            <ul className="space-y-2 text-gray-300">
              <li>✅ Netflix-like fullscreen container with proper video element targeting</li>
              <li>✅ Glassmorphism overlays with accessibility support</li>
              <li>✅ Cross-browser fullscreen API with fallbacks</li>
              <li>✅ Modal portaling to fullscreen context</li>
              <li>✅ AI Assistant dock (right drawer/bottom chat modes)</li>
              <li>✅ Next-up countdown overlay with glass styling</li>
              <li>✅ Rewarded XUT animation fixed for fullscreen</li>
              <li>✅ Enhanced keyboard shortcuts (Space, F, Esc, etc.)</li>
              <li>✅ Safe area support for mobile devices</li>
              <li>✅ Focus management and accessibility</li>
            </ul>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Keyboard Shortcuts</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <kbd className="px-2 py-1 bg-gray-700 rounded">Space / K</kbd> - Play/Pause
              </div>
              <div>
                <kbd className="px-2 py-1 bg-gray-700 rounded">F</kbd> - Toggle Fullscreen
              </div>
              <div>
                <kbd className="px-2 py-1 bg-gray-700 rounded">Esc</kbd> - Exit/Close
              </div>
              <div>
                <kbd className="px-2 py-1 bg-gray-700 rounded">Ctrl/Cmd + A</kbd> - AI Assistant
              </div>
              <div>
                <kbd className="px-2 py-1 bg-gray-700 rounded">←/→</kbd> - Seek ±10s
              </div>
              <div>
                <kbd className="px-2 py-1 bg-gray-700 rounded">↑/↓</kbd> - Volume
              </div>
              <div>
                <kbd className="px-2 py-1 bg-gray-700 rounded">M</kbd> - Mute
              </div>
              <div>
                <kbd className="px-2 py-1 bg-gray-700 rounded">C</kbd> - Captions
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Video Component */}
      <VideoHubFullscreen
        isOpen={isFullscreenOpen}
        videoId={mockVideo.id}
        onClose={() => setIsFullscreenOpen(false)}
        isAutoPlayEnabled={isAutoPlayEnabled}
        onToggleAutoPlay={() => setIsAutoPlayEnabled(!isAutoPlayEnabled)}
        hasNextVideo={true}
        isVideoAlreadyWatched={false}
        onRewardEarned={(amount) => {
          console.log(`Reward earned: ${amount} XUT`);
          // Trigger reward animation
          window.dispatchEvent(new CustomEvent('rewardEarned', {
            detail: { rewardAmount: amount }
          }));
        }}
      >
        {/* Mock Video Player */}
        <div className="w-full h-full bg-black flex items-center justify-center relative">
          <div className="text-center">
            <div className="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-2">{mockVideo.title}</h3>
            <p className="text-gray-400">Mock video player for fullscreen testing</p>
            <div className="mt-6 space-x-4">
              <Button
                onClick={() => {
                  // Simulate reward
                  window.dispatchEvent(new CustomEvent('rewardEarned', {
                    detail: { rewardAmount: 50 }
                  }));
                }}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Test Reward Animation
              </Button>
            </div>
          </div>
        </div>
      </VideoHubFullscreen>

      {/* Test Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Test Modal in Fullscreen"
      >
        <div className="space-y-4">
          <p>This modal should appear with glassmorphism styling when in fullscreen mode.</p>
          <p>Features tested:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Portal rendering to fullscreen container</li>
            <li>Glass styling with backdrop-filter</li>
            <li>Focus trap within modal</li>
            <li>Proper z-index hierarchy</li>
            <li>Escape key handling</li>
          </ul>
          <Button onClick={() => setIsModalOpen(false)}>
            Close Modal
          </Button>
        </div>
      </Modal>
    </div>
  );
}