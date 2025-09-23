"use client";

import { useState } from "react";
import { Settings, X } from "lucide-react";

interface GlassSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlassSettings({ isOpen, onClose }: GlassSettingsProps) {
  const [glassVars, setGlassVars] = useState({
    blur: 26,
    saturation: 1.35,
    brightness: 1.08,
    background: 0.08,
    border: 0.22,
    inner: 0.06,
    radius: 24,
  });

  const updateGlassVar = (property: string, value: number) => {
    setGlassVars(prev => ({ ...prev, [property]: value }));
    
    // Update CSS custom properties on root
    const root = document.documentElement;
    switch (property) {
      case 'blur':
        root.style.setProperty('--glass-blur', `${value}px`);
        break;
      case 'saturation':
        root.style.setProperty('--glass-sat', value.toString());
        break;
      case 'brightness':
        root.style.setProperty('--glass-bright', value.toString());
        break;
      case 'background':
        root.style.setProperty('--glass-bg', `hsla(0 0% 100% / ${value})`);
        break;
      case 'border':
        root.style.setProperty('--glass-border', `hsla(0 0% 100% / ${value})`);
        break;
      case 'inner':
        root.style.setProperty('--glass-inner', `hsla(0 0% 100% / ${value})`);
        break;
      case 'radius':
        root.style.setProperty('--glass-radius', `${value}px`);
        break;
    }
  };

  const resetDefaults = () => {
    const defaults = {
      blur: 26,
      saturation: 1.35,
      brightness: 1.08,
      background: 0.08,
      border: 0.22,
      inner: 0.06,
      radius: 24,
    };
    
    setGlassVars(defaults);
    const root = document.documentElement;
    root.style.setProperty('--glass-blur', '26px');
    root.style.setProperty('--glass-sat', '1.35');
    root.style.setProperty('--glass-bright', '1.08');
    root.style.setProperty('--glass-bg', 'hsla(0 0% 100% / 0.08)');
    root.style.setProperty('--glass-border', 'hsla(0 0% 100% / 0.22)');
    root.style.setProperty('--glass-inner', 'hsla(0 0% 100% / 0.06)');
    root.style.setProperty('--glass-radius', '24px');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="glass p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white/90">Glass Settings</h2>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-white/70" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-white/70 block mb-2">
              Blur ({glassVars.blur}px)
            </label>
            <input
              type="range"
              min="0"
              max="50"
              value={glassVars.blur}
              onChange={(e) => updateGlassVar('blur', Number(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="text-sm text-white/70 block mb-2">
              Saturation ({glassVars.saturation.toFixed(2)})
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.01"
              value={glassVars.saturation}
              onChange={(e) => updateGlassVar('saturation', Number(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="text-sm text-white/70 block mb-2">
              Brightness ({glassVars.brightness.toFixed(2)})
            </label>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.01"
              value={glassVars.brightness}
              onChange={(e) => updateGlassVar('brightness', Number(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="text-sm text-white/70 block mb-2">
              Background Opacity ({glassVars.background.toFixed(2)})
            </label>
            <input
              type="range"
              min="0"
              max="0.3"
              step="0.01"
              value={glassVars.background}
              onChange={(e) => updateGlassVar('background', Number(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="text-sm text-white/70 block mb-2">
              Border Opacity ({glassVars.border.toFixed(2)})
            </label>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.01"
              value={glassVars.border}
              onChange={(e) => updateGlassVar('border', Number(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="text-sm text-white/70 block mb-2">
              Inner Fog ({glassVars.inner.toFixed(2)})
            </label>
            <input
              type="range"
              min="0"
              max="0.2"
              step="0.01"
              value={glassVars.inner}
              onChange={(e) => updateGlassVar('inner', Number(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="text-sm text-white/70 block mb-2">
              Border Radius ({glassVars.radius}px)
            </label>
            <input
              type="range"
              min="0"
              max="50"
              value={glassVars.radius}
              onChange={(e) => updateGlassVar('radius', Number(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={resetDefaults}
            className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors"
          >
            Reset Defaults
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-300 hover:text-blue-200 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}