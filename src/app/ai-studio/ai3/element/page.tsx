"use client";

import Glass from "@/src/components/ui/Glass";
import GlassSettings from "@/src/components/GlassSettings";
import { useState } from "react";
import { Settings, Upload, Layers, Palette, Sliders } from "lucide-react";

export default function ElementPage() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [showGlassSettings, setShowGlassSettings] = useState(false);

  return (
    <main className="min-h-screen overflow-hidden">
      {/* Animated caustics overlay */}
      <div className="caustics" aria-hidden="true" />

      {/* Layout using mobile-first grid system */}
      <div className="relative z-10 ai-studio-grid-3">
        {/* Glass Settings Button */}
        <div className="absolute top-4 right-4 z-20 md:fixed">
          <button
            onClick={() => setShowGlassSettings(true)}
            className="glass p-3 hover:bg-white/15 transition-colors"
            title="Glass Settings"
          >
            <Settings className="w-5 h-5 text-white/80" />
          </button>
        </div>

        {/* Sidebar - Tools Panel */}
        <Glass as="aside" className="p-3 md:p-4">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white/90 mb-4">Tools</h2>
            
            <div className="space-y-2">
              {[
                { icon: Upload, label: "Upload", id: "upload" },
                { icon: Layers, label: "Layers", id: "layers" },
                { icon: Palette, label: "Colors", id: "colors" },
                { icon: Sliders, label: "Adjustments", id: "adjustments" },
              ].map(({ icon: Icon, label, id }) => (
                <button
                  key={id}
                  onClick={() => setSelectedTool(selectedTool === id ? null : id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors min-h-[40px] ${
                    selectedTool === id
                      ? "bg-white/20 text-white"
                      : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white/90"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            <div className="mt-8 space-y-3">
              <h3 className="text-sm font-medium text-white/70">Recent Files</h3>
              <div className="space-y-2">
                {["Project_01.ai3", "Design_Draft.ai3", "Logo_Concept.ai3"].map((file) => (
                  <div
                    key={file}
                    className="p-2 bg-white/5 rounded-lg text-sm text-white/60 hover:bg-white/10 hover:text-white/80 transition-colors cursor-pointer min-h-[40px] flex items-center"
                  >
                    {file}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Glass>

        {/* Canvas - Preview Area */}
        <Glass as="section" className="p-3 md:p-6 min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-24 h-24 mx-auto bg-white/10 rounded-2xl flex items-center justify-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl opacity-50" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white/90 mb-2">
                Canvas Preview
              </h3>
              <p className="text-white/60 text-sm max-w-md mx-auto">
                Your AI3 element design will appear here. Start by uploading assets or selecting tools from the sidebar.
              </p>
            </div>
            <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors min-h-[40px]">
              Start Creating
            </button>
          </div>
        </Glass>

        {/* Inspector - Properties Panel */}
        <Glass as="aside" className="p-3 md:p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white/90">Inspector</h2>
              <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center">
                <Settings className="w-4 h-4 text-white/70" />
              </button>
            </div>

            {selectedTool ? (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-white/70 capitalize">
                  {selectedTool} Properties
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-white/60 block mb-1">Opacity</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="100"
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-white/60 block mb-1">Blend Mode</label>
                    <select className="w-full p-2 bg-white/10 rounded-lg text-white/80 text-sm border border-white/20 min-h-[40px]">
                      <option>Normal</option>
                      <option>Multiply</option>
                      <option>Screen</option>
                      <option>Overlay</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-white/60 block mb-1">Transform</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="X"
                        className="p-2 bg-white/10 rounded text-white/80 text-sm border border-white/20 min-h-[40px]"
                      />
                      <input
                        type="number"
                        placeholder="Y"
                        className="p-2 bg-white/10 rounded text-white/80 text-sm border border-white/20 min-h-[40px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-white/50 mt-8">
                <p className="text-sm">Select a tool to view properties</p>
              </div>
            )}

            <div className="mt-8 space-y-3">
              <h3 className="text-sm font-medium text-white/70">Layer Stack</h3>
              <div className="space-y-2">
                {["Background", "Element 1", "Element 2", "Overlay"].map((layer, index) => (
                  <div
                    key={layer}
                    className={`p-2 bg-white/5 rounded-lg text-sm transition-colors cursor-pointer min-h-[40px] flex items-center ${
                      index === 1 ? "bg-white/15 text-white/90" : "text-white/60 hover:bg-white/10 hover:text-white/80"
                    }`}
                  >
                    {layer}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Glass>
      </div>

      {/* Glass Settings Panel */}
      <GlassSettings 
        isOpen={showGlassSettings} 
        onClose={() => setShowGlassSettings(false)} 
      />
    </main>
  );
}