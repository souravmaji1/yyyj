"use client";

import React, { useState } from 'react';
import CapsulePromptSelector from './CapsulePromptSelector';

export default function CapsulePromptDemo() {
  const [prompt, setPrompt] = useState('');

  const handlePromptChange = (newPrompt: string) => {
    setPrompt(newPrompt);
  };

  return (
    <div className="glass min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Capsule Prompt Selector Demo
          </h1>
          <p className="text-slate-300 text-lg">
            Experience the new capsule-style prompt selector with infinite scroll and auto-fill functionality
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Demo Section */}
          <div className="space-y-6">
            <div className="bg-[rgba(255,255,255,0.05)] border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Try Different Modes</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-slate-200 mb-2">Text to Image</h3>
                  <CapsulePromptSelector
                    mode="image"
                    subMode="txt2img"
                    prompt={prompt}
                    onPromptChange={handlePromptChange}
                  />
                </div>
              </div>
            </div>

            <div className="bg-[rgba(255,255,255,0.05)] border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Features</h2>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Grid layout with visible capsule options
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  No dropdown - all presets always visible
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Auto-fill input field when capsule is selected
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Real-time search to filter presets
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Smooth animations and hover effects
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Responsive grid layout for all screen sizes
                </li>
              </ul>
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            <div className="bg-[rgba(255,255,255,0.05)] border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Current Selection</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Current Prompt:
                  </label>
                  <div className="bg-[rgba(255,255,255,0.1)] border border-white/20 rounded-xl p-3">
                    <span className="text-white">
                      {prompt || 'No prompt entered'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Prompt Text:
                  </label>
                  <div className="bg-[rgba(255,255,255,0.1)] border border-white/20 rounded-xl p-3 min-h-[100px]">
                    <span className="text-white whitespace-pre-wrap">
                      {prompt || 'No prompt entered yet...'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[rgba(255,255,255,0.05)] border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">How to Use</h2>
              <div className="space-y-3 text-slate-300 text-sm">
                <div className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
                  <p>Type in the input field to search through presets</p>
                </div>
                <div className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
                  <p>Browse the visible capsule grid below the input</p>
                </div>
                <div className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
                  <p>Click any capsule to auto-fill the input field</p>
                </div>
                <div className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">4</span>
                  <p>All presets are always visible - no dropdown needed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
