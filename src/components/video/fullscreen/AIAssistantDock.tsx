"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Minimize2, Maximize2, X, Send } from "lucide-react";
import { createPortal } from "react-dom";
import { useFullscreen } from "./FullscreenRoot";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface AIAssistantDockProps {
  /** Whether the assistant is open */
  isOpen: boolean;
  
  /** Called when assistant open state changes */
  onToggle: (isOpen: boolean) => void;
  
  /** Mode: 'drawer-right' for fullscreen, 'panel' for normal */
  mode?: 'drawer-right' | 'bottom-chat' | 'panel';
  
  /** Auto-minimize when video starts playing */
  minimizeOnPlay?: boolean;
  
  /** Whether video is currently playing */
  isVideoPlaying?: boolean;
  
  /** Whether to avoid subtitle region */
  avoidSubtitleRegion?: boolean;
  
  /** Override portal container */
  portalContainer?: HTMLElement | null;
}

export function AIAssistantDock({
  isOpen,
  onToggle,
  mode: propMode,
  minimizeOnPlay = true,
  isVideoPlaying = false,
  avoidSubtitleRegion = true,
  portalContainer
}: AIAssistantDockProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hi! I\'m your AI assistant. How can I help you with this video?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const fullscreen = useFullscreen();
  
  // Auto-determine mode based on fullscreen state
  const mode = propMode || (fullscreen.isActive ? 'drawer-right' : 'panel');
  
  // Determine container: custom > fullscreen > body
  const container = portalContainer || 
    (fullscreen.isActive ? fullscreen.container : null) || 
    (typeof window !== "undefined" ? document.body : null);

  // Auto-minimize when video starts playing
  useEffect(() => {
    if (minimizeOnPlay && isVideoPlaying && !isMinimized) {
      setIsMinimized(true);
    }
  }, [isVideoPlaying, minimizeOnPlay, isMinimized]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // Simulate AI response (replace with actual AI integration)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I understand you're asking about "${userMessage.content}". This is a simulated response. In a real implementation, this would connect to your AI service.`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen || !container) {
    return null;
  }

  // Floating Action Button for minimized state
  if (isMinimized) {
    const fab = (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        onClick={() => setIsMinimized(false)}
        className={`
          fixed ${mode === 'drawer-right' ? 'bottom-4 right-4' : 'bottom-4 left-4'}
          ${fullscreen.isActive ? 'fs-glass fs-z-assistant' : 'bg-blue-600 z-50'}
          w-14 h-14 rounded-full shadow-lg hover:shadow-xl
          flex items-center justify-center text-white
          transition-all duration-200 hover:scale-105
          ${avoidSubtitleRegion ? 'mb-16' : 'mb-4'}
          mb-[env(safe-area-inset-bottom)] mr-[env(safe-area-inset-right)]
        `}
        aria-label="Open AI Assistant"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>
    );
    
    return createPortal(fab, container);
  }

  // Main assistant interface
  const getContainerStyles = () => {
    const baseStyles = "fixed text-white shadow-2xl";
    
    switch (mode) {
      case 'drawer-right':
        return `${baseStyles} top-0 right-0 h-full w-80 ${
          fullscreen.isActive ? 'fs-glass fs-z-assistant' : 'bg-gray-900 z-50'
        }`;
      case 'bottom-chat':
        return `${baseStyles} bottom-0 left-0 right-0 h-64 ${
          fullscreen.isActive ? 'fs-glass fs-z-assistant' : 'bg-gray-900 z-50'
        } ${avoidSubtitleRegion ? 'mb-16' : 'mb-0'}`;
      default: // panel
        return `${baseStyles} bottom-4 right-4 w-80 h-96 rounded-lg ${
          fullscreen.isActive ? 'fs-glass fs-z-assistant' : 'bg-gray-900 z-50'
        }`;
    }
  };

  const content = (
    <AnimatePresence>
      <motion.div
        initial={{ 
          opacity: 0, 
          x: mode === 'drawer-right' ? 300 : 0,
          y: mode === 'bottom-chat' ? 200 : (mode === 'panel' ? 20 : 0)
        }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ 
          opacity: 0, 
          x: mode === 'drawer-right' ? 300 : 0,
          y: mode === 'bottom-chat' ? 200 : (mode === 'panel' ? 20 : 0)
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={getContainerStyles()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="font-medium flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            AI Assistant
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
              aria-label="Minimize"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggle(false)}
              className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                  message.isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-white'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about this video..."
              className="flex-1 bg-white/10 border border-white/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="px-3 py-2 bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(content, container);
}

/**
 * Hook to manage AI Assistant state
 */
export function useAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggle = (open?: boolean) => {
    setIsOpen(prev => open !== undefined ? open : !prev);
  };
  
  return {
    isOpen,
    toggle
  };
}