"use client";

import React, { useState } from 'react';
import { Settings, Eye, EyeOff, Lock, Unlock, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Slider } from '@/src/components/ui/slider';
import { Switch } from '@/src/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { ScrollArea } from '@/src/components/ui/scroll-area';
import { Separator } from '@/src/components/ui/separator';
import { useStudioStore } from '@/src/lib/store/studio/studio';
import { ARIA_LABELS } from '@/src/lib/studio/accessibility';

interface LayerProperty {
  id: string;
  name: string;
  type: 'text' | 'image' | 'shape';
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  // Text specific
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  // Filter effects
  blur?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  hue?: number;
}

const mockLayers: LayerProperty[] = [
  {
    id: 'layer_1',
    name: 'Background Image',
    type: 'image',
    visible: true,
    locked: false,
    opacity: 100,
    blendMode: 'normal',
    x: 0,
    y: 0,
    width: 800,
    height: 600,
    rotation: 0,
    blur: 0,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hue: 0,
  },
  {
    id: 'layer_2',
    name: 'Title Text',
    type: 'text',
    visible: true,
    locked: false,
    opacity: 90,
    blendMode: 'normal',
    x: 100,
    y: 50,
    width: 400,
    height: 80,
    rotation: 0,
    text: 'Amazing Design',
    fontSize: 48,
    fontFamily: 'Arial',
    color: '#ffffff',
  },
];

const BLEND_MODES = [
  'normal', 'multiply', 'screen', 'overlay', 'soft-light', 
  'hard-light', 'color-dodge', 'color-burn', 'darken', 'lighten'
];

const FONT_FAMILIES = [
  'Arial', 'Helvetica', 'Georgia', 'Times New Roman', 'Courier New',
  'Verdana', 'Impact', 'Comic Sans MS', 'Trebuchet MS', 'Palatino'
];

export function PropertiesPanel() {
  const { selection } = useStudioStore();
  const [layers, setLayers] = useState(mockLayers);
  
  const selectedLayer = layers.find(layer => selection.includes(layer.id));

  const updateLayer = (id: string, updates: Partial<LayerProperty>) => {
    setLayers(prev => prev.map(layer => 
      layer.id === id ? { ...layer, ...updates } : layer
    ));
  };

  const toggleLayerVisibility = (id: string) => {
    const layer = layers.find(l => l.id === id);
    if (layer) {
      updateLayer(id, { visible: !layer.visible });
    }
  };

  const toggleLayerLock = (id: string) => {
    const layer = layers.find(l => l.id === id);
    if (layer) {
      updateLayer(id, { locked: !layer.locked });
    }
  };

  const duplicateLayer = (id: string) => {
    const layer = layers.find(l => l.id === id);
    if (layer) {
      const newLayer = {
        ...layer,
        id: `layer_${Date.now()}`,
        name: `${layer.name} Copy`,
        x: layer.x + 20,
        y: layer.y + 20,
      };
      setLayers(prev => [...prev, newLayer]);
    }
  };

  const deleteLayer = (id: string) => {
    setLayers(prev => prev.filter(layer => layer.id !== id));
  };

  return (
    <div className="h-full flex flex-col bg-[#0F1629]">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-[#E6EEFF]">Properties</h2>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {/* Layers List */}
        <div className="p-4 border-b border-white/10">
          <h3 className="text-sm font-medium text-[#E6EEFF] mb-3">Layers</h3>
          <div className="space-y-2">
            {layers.map((layer) => (
              <div
                key={layer.id}
                className={`flex items-center space-x-2 p-2 rounded-lg transition-all duration-200 ${
                  selection.includes(layer.id)
                    ? 'bg-indigo-500/20 border border-indigo-400/50'
                    : 'bg-[var(--color-surface)] hover:bg-white/5'
                }`}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleLayerVisibility(layer.id)}
                  className="h-6 w-6 p-0 hover:bg-white/10"
                  aria-label={layer.visible ? "Hide layer" : "Show layer"}
                >
                  {layer.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleLayerLock(layer.id)}
                  className="h-6 w-6 p-0 hover:bg-white/10"
                  aria-label={layer.locked ? "Unlock layer" : "Lock layer"}
                >
                  {layer.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                </Button>

                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[#E6EEFF] truncate">{layer.name}</div>
                  <div className="text-xs text-gray-400 capitalize">{layer.type}</div>
                </div>

                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => duplicateLayer(layer.id)}
                    className="h-6 w-6 p-0 hover:bg-white/10"
                    aria-label={ARIA_LABELS.duplicateItem}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteLayer(layer.id)}
                    className="h-6 w-6 p-0 hover:bg-red-500/20 hover:text-red-400"
                    aria-label={ARIA_LABELS.deleteItem}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Layer Properties */}
        {selectedLayer && (
          <div className="p-4 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-[#E6EEFF] mb-3">
                {selectedLayer.name} Properties
              </h3>
            </div>

            {/* Transform Properties */}
            <div className="space-y-4">
              <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Transform</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="x-pos" className="text-xs text-gray-300">X Position</Label>
                  <Input
                    id="x-pos"
                    type="number"
                    value={selectedLayer.x}
                    onChange={(e) => updateLayer(selectedLayer.id, { x: Number(e.target.value) })}
                    className="h-8 bg-[var(--color-surface)] border-white/20 text-[#E6EEFF]"
                  />
                </div>
                <div>
                  <Label htmlFor="y-pos" className="text-xs text-gray-300">Y Position</Label>
                  <Input
                    id="y-pos"
                    type="number"
                    value={selectedLayer.y}
                    onChange={(e) => updateLayer(selectedLayer.id, { y: Number(e.target.value) })}
                    className="h-8 bg-[var(--color-surface)] border-white/20 text-[#E6EEFF]"
                  />
                </div>
                <div>
                  <Label htmlFor="width" className="text-xs text-gray-300">Width</Label>
                  <Input
                    id="width"
                    type="number"
                    value={selectedLayer.width}
                    onChange={(e) => updateLayer(selectedLayer.id, { width: Number(e.target.value) })}
                    className="h-8 bg-[var(--color-surface)] border-white/20 text-[#E6EEFF]"
                  />
                </div>
                <div>
                  <Label htmlFor="height" className="text-xs text-gray-300">Height</Label>
                  <Input
                    id="height"
                    type="number"
                    value={selectedLayer.height}
                    onChange={(e) => updateLayer(selectedLayer.id, { height: Number(e.target.value) })}
                    className="h-8 bg-[var(--color-surface)] border-white/20 text-[#E6EEFF]"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs text-gray-300">Rotation: {selectedLayer.rotation}°</Label>
                <Slider
                  value={[selectedLayer.rotation]}
                  onValueChange={(value) => updateLayer(selectedLayer.id, { rotation: value[0] })}
                  min={-180}
                  max={180}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>

            <Separator className="bg-white/10" />

            {/* Appearance Properties */}
            <div className="space-y-4">
              <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Appearance</h4>
              
              <div>
                <Label className="text-xs text-gray-300">Opacity: {selectedLayer.opacity}%</Label>
                <Slider
                  value={[selectedLayer.opacity]}
                  onValueChange={(value) => updateLayer(selectedLayer.id, { opacity: value[0] })}
                  min={0}
                  max={100}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="blend-mode" className="text-xs text-gray-300">Blend Mode</Label>
                <Select 
                  value={selectedLayer.blendMode} 
                  onValueChange={(value) => updateLayer(selectedLayer.id, { blendMode: value })}
                >
                  <SelectTrigger className="h-8 bg-[var(--color-surface)] border-white/20 text-[#E6EEFF]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BLEND_MODES.map(mode => (
                      <SelectItem key={mode} value={mode} className="capitalize">
                        {mode.replace('-', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="visible" className="text-xs text-gray-300">Visible</Label>
                <Switch
                  id="visible"
                  checked={selectedLayer.visible}
                  onCheckedChange={(checked) => updateLayer(selectedLayer.id, { visible: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="locked" className="text-xs text-gray-300">Locked</Label>
                <Switch
                  id="locked"
                  checked={selectedLayer.locked}
                  onCheckedChange={(checked) => updateLayer(selectedLayer.id, { locked: checked })}
                />
              </div>
            </div>

            {/* Text Properties */}
            {selectedLayer.type === 'text' && (
              <>
                <Separator className="bg-white/10" />
                <div className="space-y-4">
                  <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Text</h4>
                  
                  <div>
                    <Label htmlFor="text-content" className="text-xs text-gray-300">Content</Label>
                    <Input
                      id="text-content"
                      value={selectedLayer.text || ''}
                      onChange={(e) => updateLayer(selectedLayer.id, { text: e.target.value })}
                      className="bg-[var(--color-surface)] border-white/20 text-[#E6EEFF]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="font-family" className="text-xs text-gray-300">Font Family</Label>
                    <Select 
                      value={selectedLayer.fontFamily} 
                      onValueChange={(value) => updateLayer(selectedLayer.id, { fontFamily: value })}
                    >
                      <SelectTrigger className="h-8 bg-[var(--color-surface)] border-white/20 text-[#E6EEFF]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_FAMILIES.map(font => (
                          <SelectItem key={font} value={font}>
                            {font}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-300">Font Size: {selectedLayer.fontSize}px</Label>
                    <Slider
                      value={[selectedLayer.fontSize || 16]}
                      onValueChange={(value) => updateLayer(selectedLayer.id, { fontSize: value[0] })}
                      min={8}
                      max={128}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="text-color" className="text-xs text-gray-300">Color</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <input
                        id="text-color"
                        type="color"
                        value={selectedLayer.color || '#ffffff'}
                        onChange={(e) => updateLayer(selectedLayer.id, { color: e.target.value })}
                        className="w-8 h-8 rounded border border-white/20 bg-transparent cursor-pointer"
                      />
                      <Input
                        value={selectedLayer.color || '#ffffff'}
                        onChange={(e) => updateLayer(selectedLayer.id, { color: e.target.value })}
                        className="flex-1 h-8 bg-[var(--color-surface)] border-white/20 text-[#E6EEFF]"
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Filter Effects */}
            <Separator className="bg-white/10" />
            <div className="space-y-4">
              <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Effects</h4>
              
              <div>
                <Label className="text-xs text-gray-300">Blur: {selectedLayer.blur}px</Label>
                <Slider
                  value={[selectedLayer.blur || 0]}
                  onValueChange={(value) => updateLayer(selectedLayer.id, { blur: value[0] })}
                  min={0}
                  max={20}
                  step={0.1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-xs text-gray-300">Brightness: {selectedLayer.brightness}%</Label>
                <Slider
                  value={[selectedLayer.brightness || 100]}
                  onValueChange={(value) => updateLayer(selectedLayer.id, { brightness: value[0] })}
                  min={0}
                  max={200}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-xs text-gray-300">Contrast: {selectedLayer.contrast}%</Label>
                <Slider
                  value={[selectedLayer.contrast || 100]}
                  onValueChange={(value) => updateLayer(selectedLayer.id, { contrast: value[0] })}
                  min={0}
                  max={200}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-xs text-gray-300">Saturation: {selectedLayer.saturation}%</Label>
                <Slider
                  value={[selectedLayer.saturation || 100]}
                  onValueChange={(value) => updateLayer(selectedLayer.id, { saturation: value[0] })}
                  min={0}
                  max={200}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-xs text-gray-300">Hue: {selectedLayer.hue}°</Label>
                <Slider
                  value={[selectedLayer.hue || 0]}
                  onValueChange={(value) => updateLayer(selectedLayer.id, { hue: value[0] })}
                  min={-180}
                  max={180}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        )}

        {/* No Selection Message */}
        {!selectedLayer && (
          <div className="p-4 text-center text-gray-400">
            <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <div className="text-sm">Select a layer to edit properties</div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}