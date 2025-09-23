"use client";

import React, { useState } from 'react';
import { X, Download, Share2, Printer, Smartphone, Monitor, Instagram, Twitter, Facebook } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Slider } from '@/src/components/ui/slider';
import { Switch } from '@/src/components/ui/switch';
import { Label } from '@/src/components/ui/label';
import { useStudioStore } from '@/src/lib/store/studio/studio';
import { useStudioWalletStore } from '@/src/lib/store/studio/wallet';
import { COSTS } from '@/src/lib/studio/costs';
import { motion, AnimatePresence } from 'framer-motion';

interface ExportPreset {
  id: string;
  name: string;
  platform?: string;
  width: number;
  height: number;
  format: 'PNG' | 'JPG' | 'PDF' | 'SVG' | 'MP4' | 'GIF';
  quality: number;
  icon: React.ReactNode;
}

const SOCIAL_PRESETS: ExportPreset[] = [
  {
    id: 'ig_post',
    name: 'Instagram Post',
    platform: 'Instagram',
    width: 1080,
    height: 1080,
    format: 'JPG',
    quality: 90,
    icon: <Instagram className="h-4 w-4" />,
  },
  {
    id: 'ig_story',
    name: 'Instagram Story',
    platform: 'Instagram',
    width: 1080,
    height: 1920,
    format: 'JPG',
    quality: 90,
    icon: <Instagram className="h-4 w-4" />,
  },
  {
    id: 'twitter_post',
    name: 'Twitter Post',
    platform: 'Twitter',
    width: 1200,
    height: 675,
    format: 'JPG',
    quality: 85,
    icon: <Twitter className="h-4 w-4" />,
  },
  {
    id: 'facebook_post',
    name: 'Facebook Post',
    platform: 'Facebook',
    width: 1200,
    height: 630,
    format: 'JPG',
    quality: 85,
    icon: <Facebook className="h-4 w-4" />,
  },
];

const DEVICE_PRESETS: ExportPreset[] = [
  {
    id: 'mobile_screen',
    name: 'Mobile Screen',
    width: 375,
    height: 812,
    format: 'PNG',
    quality: 100,
    icon: <Smartphone className="h-4 w-4" />,
  },
  {
    id: 'desktop_screen',
    name: 'Desktop Screen',
    width: 1920,
    height: 1080,
    format: 'PNG',
    quality: 100,
    icon: <Monitor className="h-4 w-4" />,
  },
];

const PRINT_PRESETS: ExportPreset[] = [
  {
    id: 'print_letter',
    name: 'Letter (8.5×11")',
    width: 2550,
    height: 3300,
    format: 'PDF',
    quality: 100,
    icon: <Printer className="h-4 w-4" />,
  },
  {
    id: 'print_a4',
    name: 'A4 (210×297mm)',
    width: 2480,
    height: 3508,
    format: 'PDF',
    quality: 100,
    icon: <Printer className="h-4 w-4" />,
  },
  {
    id: 'print_poster',
    name: 'Poster (18×24")',
    width: 5400,
    height: 7200,
    format: 'PDF',
    quality: 100,
    icon: <Printer className="h-4 w-4" />,
  },
];

export function ExportDialog() {
  const { closeExportDialog, mode, openMintDialog } = useStudioStore();
  const { charge } = useStudioWalletStore();
  const [selectedPreset, setSelectedPreset] = useState<ExportPreset | null>(null);
  const [customWidth, setCustomWidth] = useState(1920);
  const [customHeight, setCustomHeight] = useState(1080);
  const [customFormat, setCustomFormat] = useState<'PNG' | 'JPG' | 'PDF' | 'SVG'>('PNG');
  const [quality, setQuality] = useState(90);
  const [includeBackground, setIncludeBackground] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (preset?: ExportPreset) => {
    const exportConfig = preset || {
      id: 'custom',
      name: 'Custom Export',
      width: customWidth,
      height: customHeight,
      format: customFormat,
      quality,
      icon: <Download className="h-4 w-4" />,
    };

    setIsExporting(true);

    // Determine cost based on export type
    let cost = 0;
    if (mode === 'product') {
      cost = exportConfig.format === 'PDF' ? COSTS.product.printExport : COSTS.product.mockups;
    } else {
      cost = 5; // Base export cost
    }

    const success = charge(cost, `Export ${exportConfig.name}`);
    if (!success) {
      setIsExporting(false);
      return;
    }

    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));

    window.dispatchEvent(new CustomEvent('studio-toast', {
      detail: {
        type: 'success',
        title: 'Export Complete!',
        description: `${exportConfig.name} saved to downloads`
      }
    }));

    setIsExporting(false);
    closeExportDialog();
  };

  const handleMintNFT = () => {
    closeExportDialog();
    openMintDialog();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={closeExportDialog}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#0F1629] border border-white/20 rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center">
                  <Download className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[#E6EEFF]">Export Your Creation</h2>
                  <p className="text-sm text-gray-400">
                    Choose format and platform for your {mode} project
                  </p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={closeExportDialog}
                className="hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="presets" className="h-full flex flex-col">
              <div className="px-6 pt-4">
                <TabsList className="grid w-full grid-cols-4 bg-[var(--color-surface)]">
                  <TabsTrigger value="presets" className="data-[state=active]:bg-indigo-600">
                    Quick Export
                  </TabsTrigger>
                  <TabsTrigger value="custom" className="data-[state=active]:bg-indigo-600">
                    Custom Size
                  </TabsTrigger>
                  <TabsTrigger value="mockups" className="data-[state=active]:bg-indigo-600">
                    Product Mockups
                  </TabsTrigger>
                  <TabsTrigger value="nft" className="data-[state=active]:bg-indigo-600">
                    Mint as NFT
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-auto">
                <TabsContent value="presets" className="p-6 space-y-6">
                  {/* Social Media */}
                  <div>
                    <h3 className="text-lg font-medium text-[#E6EEFF] mb-3">Social Media</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {SOCIAL_PRESETS.map((preset) => (
                        <motion.div
                          key={preset.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedPreset(preset)}
                          className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                            selectedPreset?.id === preset.id
                              ? 'border-indigo-400 bg-indigo-500/10'
                              : 'border-white/10 bg-[var(--color-surface)] hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            {preset.icon}
                            <span className="text-sm font-medium text-[#E6EEFF]">
                              {preset.name}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400">
                            {preset.width} × {preset.height}
                          </div>
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {preset.format}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Device Screens */}
                  <div>
                    <h3 className="text-lg font-medium text-[#E6EEFF] mb-3">Device Screens</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {DEVICE_PRESETS.map((preset) => (
                        <motion.div
                          key={preset.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedPreset(preset)}
                          className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                            selectedPreset?.id === preset.id
                              ? 'border-indigo-400 bg-indigo-500/10'
                              : 'border-white/10 bg-[var(--color-surface)] hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            {preset.icon}
                            <span className="text-sm font-medium text-[#E6EEFF]">
                              {preset.name}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400">
                            {preset.width} × {preset.height}
                          </div>
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {preset.format}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Print */}
                  <div>
                    <h3 className="text-lg font-medium text-[#E6EEFF] mb-3">Print Ready</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {PRINT_PRESETS.map((preset) => (
                        <motion.div
                          key={preset.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedPreset(preset)}
                          className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                            selectedPreset?.id === preset.id
                              ? 'border-indigo-400 bg-indigo-500/10'
                              : 'border-white/10 bg-[var(--color-surface)] hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            {preset.icon}
                            <span className="text-sm font-medium text-[#E6EEFF]">
                              {preset.name}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400">
                            {preset.width} × {preset.height}
                          </div>
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {preset.format} • 300 DPI
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {selectedPreset && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[var(--color-surface)] rounded-lg p-4 border border-white/10"
                    >
                      <h4 className="text-sm font-medium text-[#E6EEFF] mb-2">Export Settings</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm text-gray-300">Include Background</Label>
                          <Switch
                            checked={includeBackground}
                            onCheckedChange={setIncludeBackground}
                          />
                        </div>
                        {selectedPreset.format !== 'PDF' && (
                          <div>
                            <Label className="text-sm text-gray-300">Quality: {quality}%</Label>
                            <Slider
                              value={[quality]}
                              onValueChange={(value) => setQuality(value[0] || 90)}
                              min={10}
                              max={100}
                              step={5}
                              className="mt-2"
                            />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </TabsContent>

                <TabsContent value="custom" className="p-6 space-y-6">
                  <div className="bg-[var(--color-surface)] rounded-lg p-4 space-y-4">
                    <h3 className="text-lg font-medium text-[#E6EEFF]">Custom Dimensions</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-300">Width (px)</Label>
                        <input
                          type="number"
                          value={customWidth}
                          onChange={(e) => setCustomWidth(Number(e.target.value))}
                          className="w-full mt-1 px-3 py-2 bg-[#0F1629] border border-white/20 rounded-md text-[#E6EEFF]"
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-gray-300">Height (px)</Label>
                        <input
                          type="number"
                          value={customHeight}
                          onChange={(e) => setCustomHeight(Number(e.target.value))}
                          className="w-full mt-1 px-3 py-2 bg-[#0F1629] border border-white/20 rounded-md text-[#E6EEFF]"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm text-gray-300">Format</Label>
                      <Select value={customFormat} onValueChange={(value: any) => setCustomFormat(value)}>
                        <SelectTrigger className="bg-[#0F1629] border-white/20 text-[#E6EEFF]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PNG">PNG (Lossless)</SelectItem>
                          <SelectItem value="JPG">JPG (Smaller file)</SelectItem>
                          <SelectItem value="PDF">PDF (Print ready)</SelectItem>
                          <SelectItem value="SVG">SVG (Vector)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-gray-300">Include Background</Label>
                      <Switch
                        checked={includeBackground}
                        onCheckedChange={setIncludeBackground}
                      />
                    </div>

                    {customFormat !== 'PDF' && customFormat !== 'SVG' && (
                      <div>
                        <Label className="text-sm text-gray-300">Quality: {quality}%</Label>
                        <Slider
                          value={[quality]}
                          onValueChange={(value) => setQuality(value[0] || 90)}
                          min={10}
                          max={100}
                          step={5}
                          className="mt-2"
                        />
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="mockups" className="p-6">
                  <div className="text-center py-8">
                    <div className="text-lg font-medium text-[#E6EEFF] mb-2">Product Mockups</div>
                    <div className="text-sm text-gray-400 mb-4">
                      Generate mockups for t-shirts, phone cases, and more
                    </div>
                    <Button
                      onClick={() => handleExport()}
                      className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
                    >
                      Generate Mockups ({COSTS.product.mockups} XUT)
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="nft" className="p-6">
                  <div className="text-center py-8">
                    <div className="text-lg font-medium text-[#E6EEFF] mb-2">Mint as NFT</div>
                    <div className="text-sm text-gray-400 mb-4">
                      Turn your creation into a unique digital collectible
                    </div>
                    <Button
                      onClick={handleMintNFT}
                      className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
                    >
                      Continue to Mint ({COSTS.nft.mint} XUT)
                    </Button>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Export cost: 5-20 XUT depending on format
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={closeExportDialog}
                  className="border-white/20 hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleExport(selectedPreset || undefined)}
                  disabled={isExporting}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
                >
                  {isExporting ? 'Exporting...' : 'Export'}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}