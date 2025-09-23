"use client";

import React, { useState } from 'react';
import { Send, Sparkles, Wand2, Palette, Music, Video, Box, Shirt, Coins } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { ScrollArea } from '@/src/components/ui/scroll-area';
import { Badge } from '@/src/components/ui/badge';
import { useStudioStore } from '@/src/lib/store/studio/studio';
import { useStudioWalletStore } from '@/src/lib/store/studio/wallet';
import { COSTS } from '@/src/lib/studio/costs';
import { Macro, StudioMode } from '@/src/types/studio';
import { motion } from 'framer-motion';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const MACROS: Record<StudioMode, Macro[]> = {
  image: [
    {
      id: 'img_generate',
      title: 'Generate Image',
      steps: [
        { id: '1', label: 'Process prompt', status: 'idle' },
        { id: '2', label: 'Generate image', status: 'idle' },
        { id: '3', label: 'Apply enhancements', status: 'idle' },
      ],
      estCost: COSTS.image.generate,
    },
    {
      id: 'img_enhance',
      title: 'Enhance & Upscale',
      steps: [
        { id: '1', label: 'Analyze image', status: 'idle' },
        { id: '2', label: 'Remove background', status: 'idle' },
        { id: '3', label: 'Upscale resolution', status: 'idle' },
      ],
      estCost: COSTS.image.bgRemove + COSTS.image.upscale,
    },
  ],
  video: [
    {
      id: 'vid_storyboard',
      title: 'Create Storyboard',
      steps: [
        { id: '1', label: 'Analyze script', status: 'idle' },
        { id: '2', label: 'Generate scenes', status: 'idle' },
        { id: '3', label: 'Create timeline', status: 'idle' },
      ],
      estCost: COSTS.video.storyboard,
    },
    {
      id: 'vid_render',
      title: 'Render Video',
      steps: [
        { id: '1', label: 'Compile scenes', status: 'idle' },
        { id: '2', label: 'Render video', status: 'idle' },
        { id: '3', label: 'Add captions', status: 'idle' },
      ],
      estCost: COSTS.video.render + COSTS.video.captions,
    },
  ],
  threeD: [
    {
      id: '3d_generate',
      title: 'Generate 3D Model',
      steps: [
        { id: '1', label: 'Process prompt', status: 'idle' },
        { id: '2', label: 'Generate mesh', status: 'idle' },
        { id: '3', label: 'Apply materials', status: 'idle' },
      ],
      estCost: COSTS.threeD.generate + COSTS.threeD.materials,
    },
    {
      id: '3d_turntable',
      title: 'Create Turntable',
      steps: [
        { id: '1', label: 'Setup camera', status: 'idle' },
        { id: '2', label: 'Animate rotation', status: 'idle' },
        { id: '3', label: 'Render video', status: 'idle' },
      ],
      estCost: COSTS.threeD.turntable,
    },
  ],
  music: [
    {
      id: 'music_generate',
      title: 'Generate Music',
      steps: [
        { id: '1', label: 'Analyze prompt', status: 'idle' },
        { id: '2', label: 'Generate composition', status: 'idle' },
        { id: '3', label: 'Master track', status: 'idle' },
      ],
      estCost: COSTS.music.generate + COSTS.music.master,
    },
    {
      id: 'music_stems',
      title: 'Split into Stems',
      steps: [
        { id: '1', label: 'Analyze audio', status: 'idle' },
        { id: '2', label: 'Separate instruments', status: 'idle' },
        { id: '3', label: 'Export stems', status: 'idle' },
      ],
      estCost: COSTS.music.stems,
    },
  ],
  audio: [
    {
      id: 'audio_tts',
      title: 'Text to Speech',
      steps: [
        { id: '1', label: 'Process text', status: 'idle' },
        { id: '2', label: 'Generate speech', status: 'idle' },
        { id: '3', label: 'Cleanup audio', status: 'idle' },
      ],
      estCost: COSTS.audio.tts + COSTS.audio.cleanup,
    },
    {
      id: 'audio_qr',
      title: 'Generate Audio QR',
      steps: [
        { id: '1', label: 'Upload to cloud', status: 'idle' },
        { id: '2', label: 'Generate QR code', status: 'idle' },
        { id: '3', label: 'Create asset', status: 'idle' },
      ],
      estCost: COSTS.audio.qr,
    },
  ],
  product: [
    {
      id: 'product_design',
      title: 'Design → Tee',
      steps: [
        { id: '1', label: 'Apply to product', status: 'idle' },
        { id: '2', label: 'Generate mockups', status: 'idle' },
        { id: '3', label: 'Export print file', status: 'idle' },
      ],
      estCost: COSTS.product.mockups + COSTS.product.printExport,
    },
    {
      id: 'product_publish',
      title: 'Publish to Store',
      steps: [
        { id: '1', label: 'Prepare listing', status: 'idle' },
        { id: '2', label: 'Upload images', status: 'idle' },
        { id: '3', label: 'Publish product', status: 'idle' },
      ],
      estCost: COSTS.product.publish,
    },
  ],
  nft: [
    {
      id: 'nft_mint',
      title: 'Mint as NFT',
      steps: [
        { id: '1', label: 'Upload metadata', status: 'idle' },
        { id: '2', label: 'Mint on blockchain', status: 'idle' },
        { id: '3', label: 'List on marketplace', status: 'idle' },
      ],
      estCost: COSTS.nft.mint + COSTS.nft.list,
    },
    {
      id: 'nft_qr',
      title: 'QR → NFT Badge',
      steps: [
        { id: '1', label: 'Generate QR code', status: 'idle' },
        { id: '2', label: 'Create badge design', status: 'idle' },
        { id: '3', label: 'Apply to product', status: 'idle' },
      ],
      estCost: COSTS.nft.qr + COSTS.product.mockups,
    },
  ],
};

const MODE_ICONS = {
  image: <Palette className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
  threeD: <Box className="h-4 w-4" />,
  music: <Music className="h-4 w-4" />,
  audio: <Wand2 className="h-4 w-4" />,
  product: <Shirt className="h-4 w-4" />,
  nft: <Coins className="h-4 w-4" />,
};

export function AssistantPanel() {
  const { mode } = useStudioStore();
  const { charge, balance } = useStudioWalletStore();
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: `Welcome to ${mode.toUpperCase()} mode! I'm here to help you create amazing content. What would you like to make today?`,
      timestamp: new Date(),
    },
  ]);
  const [runningMacro, setRunningMacro] = useState<string | null>(null);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: chatInput,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setChatInput('');

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `I understand you want to "${chatInput}". Let me suggest some task cards that can help you achieve this!`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  };

  const handleRunMacro = async (macro: Macro) => {
    const canAfford = charge(macro.estCost, macro.title);
    if (!canAfford) return;

    setRunningMacro(macro.id);
    
    // Simulate macro execution
    for (let i = 0; i < macro.steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      // In a real implementation, we'd update step status here
    }

    setRunningMacro(null);
    
    window.dispatchEvent(new CustomEvent('studio-toast', {
      detail: {
        type: 'success',
        title: `${macro.title} Complete`,
        description: 'Task completed successfully!'
      }
    }));
  };

  const currentMacros = MACROS[mode] || [];

  return (
    <div className="h-full flex flex-col bg-[#0F1629]">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center space-x-2 mb-2">
          <Sparkles className="h-5 w-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-[#E6EEFF]">AI Assistant</h2>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          {MODE_ICONS[mode]}
          <span className="capitalize">{mode} Mode</span>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white'
                    : 'bg-[var(--color-surface)] text-[#E6EEFF] border border-white/10'
                }`}
              >
                <div className="text-sm">{message.content}</div>
                <div className="text-xs opacity-60 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollArea>

      {/* Task Cards */}
      <div className="p-4 border-t border-white/10">
        <h3 className="text-sm font-medium text-[#E6EEFF] mb-3">Quick Actions</h3>
        <div className="space-y-2">
          {currentMacros.map((macro) => {
            const isRunning = runningMacro === macro.id;
            const canAfford = balance >= macro.estCost;
            
            return (
              <motion.div
                key={macro.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                  canAfford
                    ? 'bg-[var(--color-surface)] border-white/10 hover:border-indigo-400/50 hover:bg-indigo-500/5'
                    : 'bg-red-500/5 border-red-500/20'
                }`}
                onClick={() => !isRunning && canAfford && handleRunMacro(macro)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-[#E6EEFF]">
                    {macro.title}
                  </div>
                  <Badge 
                    variant={canAfford ? "secondary" : "destructive"}
                    className="text-xs"
                  >
                    {macro.estCost} XUT
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  {macro.steps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`flex items-center text-xs ${
                        isRunning && index === 0 ? 'text-indigo-400' : 'text-gray-400'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                        isRunning && index === 0 ? 'bg-indigo-400' : 'bg-gray-500'
                      }`} />
                      {step.label}
                    </div>
                  ))}
                </div>
                
                {!canAfford && (
                  <div className="text-xs text-red-400 mt-2">
                    Insufficient funds (need {macro.estCost - balance} more XUT)
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex space-x-2">
          <Input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask the AI assistant..."
            className="flex-1 bg-[var(--color-surface)] border-white/20 text-[#E6EEFF] placeholder-gray-400"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button
            onClick={handleSendMessage}
            size="sm"
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}