"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Glass from "@/src/components/ui/Glass";

export default function AiStudioPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen overflow-hidden">
      {/* Animated caustics overlay */}
      <div className="caustics" aria-hidden="true" />

      {/* Layout using mobile-first grid system */}
      <div className="relative z-10 ai-studio-grid-3">
        
        {/* Welcome Section */}
        <Glass as="section" className="p-6 md:p-8 min-h-[60vh] flex items-center justify-center col-span-full">
          <div className="text-center space-y-6 max-w-2xl mx-auto">
            <div className="w-32 h-32 mx-auto bg-white/10 rounded-3xl flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl opacity-70" />
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-white/90 mb-4">
                AI Studio
              </h1>
              <p className="text-white/70 text-lg md:text-xl mb-8 leading-relaxed">
                Create stunning AI-powered content with our advanced studio tools. 
                Design elements, generate images, and bring your creative vision to life.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => router.push('/ai-studio/ai3/element')}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-2xl text-white font-semibold text-lg transition-all duration-300 min-h-[56px] shadow-lg hover:shadow-xl"
              >
                Start Creating
              </button>
              <button 
                onClick={() => router.push('/ai-studio-pro')}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-white/90 hover:text-white font-semibold text-lg transition-all duration-300 min-h-[56px]"
              >
                AI Studio Pro
              </button>
            </div>
            
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 bg-blue-400 rounded-lg" />
                </div>
                <h3 className="text-white/90 font-semibold">Element Design</h3>
                <p className="text-white/60 text-sm">Create custom UI elements and components</p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 bg-purple-400 rounded-lg" />
                </div>
                <h3 className="text-white/90 font-semibold">AI Generation</h3>
                <p className="text-white/60 text-sm">Generate images, videos, and 3D models</p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-cyan-500/20 rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 bg-cyan-400 rounded-lg" />
                </div>
                <h3 className="text-white/90 font-semibold">Advanced Tools</h3>
                <p className="text-white/60 text-sm">Professional-grade editing capabilities</p>
              </div>
            </div>
          </div>
        </Glass>
      </div>
    </main>
  );
}