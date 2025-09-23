"use client";

import { useState } from 'react';
import { MainLayout } from '../../../components/layout/MainLayout';
import CameraTest from '../../../components/hardware-test/CameraTest';
import SpeakerTest from '../../../components/hardware-test/SpeakerTest';
import MicrophoneTest from '../../../components/hardware-test/MicrophoneTest';

export default function HardwareTestPage() {
  const [activeTest, setActiveTest] = useState<'dashboard' | 'microphone' | 'camera' | 'speaker'>('dashboard');

  const renderTestComponent = () => {
    switch (activeTest) {
      case 'microphone':
        return <MicrophoneTest onBack={() => setActiveTest('dashboard')} />;
      case 'camera':
        return <CameraTest onBack={() => setActiveTest('dashboard')} />;
      case 'speaker':
        return <SpeakerTest onBack={() => setActiveTest('dashboard')} />;
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white flex flex-col justify-between">
            <div className="mx-auto px-4 py-4 flex-1 flex flex-col mt-4">
              <div className="max-w-3xl mx-auto">
                {/* Branding/Header */}
                <div className="flex flex-col items-center mb-10">
                  <h1 className="text-4xl md:text-5xl font-extrabold mb-2 text-center text-shadow-lg tracking-tight">
                    <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">Kiosk Hardware Diagnostics</span>
                  </h1>
                  <p className="text-lg md:text-xl opacity-90 text-center max-w-xl">
                    Quickly test your device&apos;s <span className="text-blue-300 font-semibold">microphone</span>, <span className="text-purple-300 font-semibold">camera</span>, and <span className="text-indigo-300 font-semibold">speaker</span> to ensure everything is working perfectly.
                  </p>
                </div>

                {/* Test Cards */}
                <h2 className="sr-only">Hardware Test Options</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                  <TestCard
                    title="🎤 Microphone Test"
                    description="Test microphone functionality with live speech recognition and audio recording."
                    onClick={() => setActiveTest('microphone')}
                    iconBg="from-blue-500 to-blue-700"
                    icon="🎤"
                  />
                  <TestCard
                    title="📷 Camera Test"
                    description="Test camera with live preview and snapshot capture."
                    onClick={() => setActiveTest('camera')}
                    iconBg="from-purple-500 to-purple-700"
                    icon="📷"
                  />
                  <TestCard
                    title="🔊 Speaker Test"
                    description="Test speaker with audio playback and volume confirmation."
                    onClick={() => setActiveTest('speaker')}
                    iconBg="from-indigo-500 to-indigo-700"
                    icon="🔊"
                  />
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
      renderTestComponent()
  );
}

interface TestCardProps {
  title: string;
  description: string;
  onClick: () => void;
  icon: string;
  iconBg: string;
}

function TestCard({ title, description, onClick, icon, iconBg }: TestCardProps) {
  return (
    <button
      className={
        `group w-full bg-[var(--color-primary-50)]/20 backdrop-blur-lg rounded-2xl p-8 flex flex-col items-center border border-[var(--color-primary)]/30 shadow-lg hover:bg-[var(--color-primary-50)]/30 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400/40 hover:scale-105`
      }
      onClick={onClick}
    >
      <div className={`mb-5 rounded-full bg-gradient-to-br ${iconBg} shadow-lg w-20 h-20 flex items-center justify-center text-4xl md:text-5xl`}>{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-center group-hover:text-blue-200 transition-colors">{title}</h3>
      <p className="text-base text-gray-200 opacity-90 text-center leading-relaxed">{description}</p>
    </button>
  );
} 