"use client";

import React, { useState, useRef, useEffect } from 'react';
import { QrCode, Download, Upload, Palette, Move, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Slider } from '@/src/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Card } from '@/src/components/ui/card';
import { useStudioWalletStore } from '@/src/lib/store/studio/wallet';
import { COSTS } from '@/src/lib/studio/costs';
import QRCode from 'qrcode';
import { motion } from 'framer-motion';

interface QRConfig {
  data: string;
  size: number;
  margin: number;
  color: {
    dark: string;
    light: string;
  };
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  logo?: string;
}

interface QRStamp {
  id: string;
  qrCode: string;
  config: QRConfig;
  position: { x: number; y: number };
  rotation: number;
  scale: number;
}

const QR_TEMPLATES = [
  {
    id: 'website',
    name: 'Website Link',
    placeholder: 'https://yourwebsite.com',
    prefix: '',
  },
  {
    id: 'email',
    name: 'Email Address',
    placeholder: 'contact@example.com',
    prefix: 'mailto:',
  },
  {
    id: 'phone',
    name: 'Phone Number',
    placeholder: '+1234567890',
    prefix: 'tel:',
  },
  {
    id: 'wifi',
    name: 'WiFi Network',
    placeholder: 'WIFI:T:WPA;S:NetworkName;P:Password;;',
    prefix: '',
  },
  {
    id: 'vcard',
    name: 'Contact Card',
    placeholder: 'BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nORG:Company\nTEL:+1234567890\nEMAIL:john@example.com\nEND:VCARD',
    prefix: '',
  },
  {
    id: 'sms',
    name: 'SMS Message',
    placeholder: 'Hello from QR Code!',
    prefix: 'sms:+1234567890:',
  },
];

const ERROR_LEVELS = [
  { value: 'L', label: 'Low (7%)', description: 'Basic error correction' },
  { value: 'M', label: 'Medium (15%)', description: 'Balanced quality and error correction' },
  { value: 'Q', label: 'Quartile (25%)', description: 'Good error correction' },
  { value: 'H', label: 'High (30%)', description: 'Best error correction for logos' },
] as const;

export function QRStamp() {
  const { charge } = useStudioWalletStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrConfig, setQrConfig] = useState<QRConfig>({
    data: 'https://example.com',
    size: 200,
    margin: 4,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'M',
  });
  const [qrDataURL, setQrDataURL] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState('website');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQRCode = async () => {
    if (!qrConfig.data.trim()) return;

    setIsGenerating(true);
    
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      await QRCode.toCanvas(canvas, qrConfig.data, {
        width: qrConfig.size,
        margin: qrConfig.margin,
        color: qrConfig.color,
        errorCorrectionLevel: qrConfig.errorCorrectionLevel,
      });

      const dataURL = canvas.toDataURL('image/png');
      setQrDataURL(dataURL);

      // Charge for QR generation
      charge(COSTS.audio.qr, 'Generate QR Code');
      
      window.dispatchEvent(new CustomEvent('studio-toast', {
        detail: {
          type: 'success',
          title: 'QR Code Generated',
          description: 'QR code is ready to use'
        }
      }));
    } catch (error) {
      console.error('QR generation error:', error);
      window.dispatchEvent(new CustomEvent('studio-toast', {
        detail: {
          type: 'error',
          title: 'Generation Failed',
          description: 'Could not generate QR code'
        }
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = QR_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setQrConfig(prev => ({
        ...prev,
        data: template.placeholder,
      }));
    }
  };

  const handleDataChange = (value: string) => {
    const template = QR_TEMPLATES.find(t => t.id === selectedTemplate);
    const finalData = template?.prefix ? template.prefix + value : value;
    setQrConfig(prev => ({ ...prev, data: finalData }));
  };

  const downloadQRCode = () => {
    if (!qrDataURL) return;

    const link = document.createElement('a');
    link.download = 'qr-code.png';
    link.href = qrDataURL;
    link.click();

    window.dispatchEvent(new CustomEvent('studio-toast', {
      detail: {
        type: 'success',
        title: 'QR Code Downloaded',
        description: 'Saved to your downloads folder'
      }
    }));
  };

  const addToCanvas = () => {
    if (!qrDataURL) return;

    // Simulate adding QR code to main canvas
    window.dispatchEvent(new CustomEvent('studio-toast', {
      detail: {
        type: 'success',
        title: 'QR Code Added',
        description: 'QR code added to canvas'
      }
    }));
  };

  useEffect(() => {
    let debounceTimer: NodeJS.Timeout | undefined;
    
    if (qrConfig.data.trim()) {
      debounceTimer = setTimeout(generateQRCode, 500);
    }
    
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [qrConfig]);

  return (
    <div className="h-full flex flex-col bg-[#0F1629]">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <QrCode className="h-5 w-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-[#E6EEFF]">QR Stamp</h2>
        </div>
        <p className="text-sm text-gray-400 mt-1">Generate QR codes for your designs</p>
      </div>

      <div className="flex-1 p-4 space-y-6">
        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[var(--color-surface)]">
            <TabsTrigger value="generate" className="data-[state=active]:bg-indigo-600">
              Generate
            </TabsTrigger>
            <TabsTrigger value="customize" className="data-[state=active]:bg-indigo-600">
              Customize
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="mt-4 space-y-4">
            {/* Template Selection */}
            <div>
              <Label htmlFor="template" className="text-sm text-gray-300">QR Type</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                <SelectTrigger className="bg-[var(--color-surface)] border-white/20 text-[#E6EEFF]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QR_TEMPLATES.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data Input */}
            <div>
              <Label htmlFor="qr-data" className="text-sm text-gray-300">Content</Label>
              <Input
                id="qr-data"
                value={qrConfig.data.replace(QR_TEMPLATES.find(t => t.id === selectedTemplate)?.prefix || '', '')}
                onChange={(e) => handleDataChange(e.target.value)}
                placeholder={QR_TEMPLATES.find(t => t.id === selectedTemplate)?.placeholder}
                className="bg-[var(--color-surface)] border-white/20 text-[#E6EEFF] placeholder-gray-400"
              />
              <p className="text-xs text-gray-500 mt-1">
                {selectedTemplate === 'wifi' && 'Format: WIFI:T:WPA;S:NetworkName;P:Password;;'}
                {selectedTemplate === 'vcard' && 'Use vCard format for contact information'}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex space-x-2">
              <Button
                onClick={generateQRCode}
                disabled={isGenerating || !qrConfig.data.trim()}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
              >
                {isGenerating ? 'Generating...' : 'Generate QR'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="customize" className="mt-4 space-y-4">
            {/* Size */}
            <div>
              <Label className="text-sm text-gray-300">Size: {qrConfig.size}px</Label>
              <Slider
                value={[qrConfig.size]}
                onValueChange={(value) => setQrConfig(prev => ({ ...prev, size: value[0] || 200 }))}
                min={100}
                max={500}
                step={10}
                className="mt-2"
              />
            </div>

            {/* Margin */}
            <div>
              <Label className="text-sm text-gray-300">Margin: {qrConfig.margin}</Label>
              <Slider
                value={[qrConfig.margin]}
                onValueChange={(value) => setQrConfig(prev => ({ ...prev, margin: value[0] || 4 }))}
                min={0}
                max={10}
                step={1}
                className="mt-2"
              />
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dark-color" className="text-sm text-gray-300">Foreground</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    id="dark-color"
                    type="color"
                    value={qrConfig.color.dark}
                    onChange={(e) => setQrConfig(prev => ({
                      ...prev,
                      color: { ...prev.color, dark: e.target.value }
                    }))}
                    className="w-8 h-8 rounded border border-white/20 bg-transparent cursor-pointer"
                  />
                  <Input
                    value={qrConfig.color.dark}
                    onChange={(e) => setQrConfig(prev => ({
                      ...prev,
                      color: { ...prev.color, dark: e.target.value }
                    }))}
                    className="flex-1 h-8 bg-[var(--color-surface)] border-white/20 text-[#E6EEFF]"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="light-color" className="text-sm text-gray-300">Background</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    id="light-color"
                    type="color"
                    value={qrConfig.color.light}
                    onChange={(e) => setQrConfig(prev => ({
                      ...prev,
                      color: { ...prev.color, light: e.target.value }
                    }))}
                    className="w-8 h-8 rounded border border-white/20 bg-transparent cursor-pointer"
                  />
                  <Input
                    value={qrConfig.color.light}
                    onChange={(e) => setQrConfig(prev => ({
                      ...prev,
                      color: { ...prev.color, light: e.target.value }
                    }))}
                    className="flex-1 h-8 bg-[var(--color-surface)] border-white/20 text-[#E6EEFF]"
                  />
                </div>
              </div>
            </div>

            {/* Error Correction */}
            <div>
              <Label htmlFor="error-level" className="text-sm text-gray-300">Error Correction</Label>
              <Select 
                value={qrConfig.errorCorrectionLevel} 
                onValueChange={(value: 'L' | 'M' | 'Q' | 'H') => 
                  setQrConfig(prev => ({ ...prev, errorCorrectionLevel: value }))
                }
              >
                <SelectTrigger className="bg-[var(--color-surface)] border-white/20 text-[#E6EEFF]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ERROR_LEVELS.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      <div>
                        <div>{level.label}</div>
                        <div className="text-xs text-gray-400">{level.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>

        {/* QR Code Preview */}
        <Card className="p-4 bg-[var(--color-surface)] border-white/10">
          <div className="text-center">
            <h3 className="text-sm font-medium text-[#E6EEFF] mb-3">Preview</h3>
            
            <div className="inline-block p-4 bg-white rounded-lg">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto"
                style={{ 
                  width: Math.min(qrConfig.size, 200), 
                  height: Math.min(qrConfig.size, 200) 
                }}
              />
            </div>

            {qrDataURL && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 space-y-2"
              >
                <div className="flex space-x-2">
                  <Button
                    onClick={downloadQRCode}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-white/20 hover:bg-white/10"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button
                    onClick={addToCanvas}
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
                  >
                    Add to Canvas
                  </Button>
                </div>
                
                <div className="text-xs text-gray-400">
                  Cost: {COSTS.audio.qr} XUT per generation
                </div>
              </motion.div>
            )}
          </div>
        </Card>

        {/* Usage Tips */}
        <Card className="p-4 bg-[var(--color-surface)] border-white/10">
          <h4 className="text-sm font-medium text-[#E6EEFF] mb-2">💡 Tips</h4>
          <ul className="text-xs text-gray-300 space-y-1">
            <li>• Use high error correction (H) when adding logos</li>
            <li>• Ensure sufficient contrast between colors</li>
            <li>• Test QR codes before printing</li>
            <li>• Keep content concise for better scanning</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}