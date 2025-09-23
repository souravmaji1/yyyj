"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Paperclip, Send, Upload } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Separator } from '../../ui/separator';
import { useStudioStore } from '../store/useStudioStore';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: string[];
}

export function RightChatPanel() {
  const { rightPanelVisible, toggleRightPanel } = useStudioStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hi! I\'m here to help you design your merch. You can upload documents, images, or ask me questions about your design.',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleSendMessage = () => {
    if (!inputValue.trim() && attachments.length === 0) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
      attachments: attachments.map(f => f.name)
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setAttachments([]);

    // Simulate assistant response
    setTimeout(() => {
      const response: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I see your message! This is a demo response. In a real implementation, this would be connected to an AI assistant.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, response]);
    }, 1000);
  };

  const handleFileUpload = (files: FileList) => {
    const validFiles = Array.from(files).filter(file => 
      file.size <= 10 * 1024 * 1024 // 10MB limit
    );
    setAttachments(prev => [...prev, ...validFiles]);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ 
        width: rightPanelVisible ? 400 : 0,
        opacity: rightPanelVisible ? 1 : 0
      }}
      transition={{ 
        duration: 0.3, 
        ease: "easeInOut" 
      }}
      className="border-l border-[var(--color-secondary)]/30 bg-[#232f3e] flex flex-col overflow-hidden"
      aria-label="Chat Panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-secondary)]/30">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-[var(--color-primary)]" />
          <h2 className="text-lg font-semibold text-white">AI Assistant</h2>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleRightPanel}
          className="text-gray-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 z-10000">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card className={`max-w-[85%] ${
                message.type === 'user' 
                  ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' 
                  : 'bg-[var(--color-surface)] border-gray-600'
              }`}>
                <CardContent className="p-3">
                  <div className={`text-sm ${
                    message.type === 'user' ? 'text-white' : 'text-gray-200'
                  }`}>
                    {message.content}
                  </div>
                  
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.attachments.map((filename, index) => (
                        <div key={index} className="text-xs text-gray-300 bg-black/20 rounded px-2 py-1">
                          📎 {filename}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Separator className="bg-[var(--color-secondary)]/30" />

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="p-4 border-b border-[var(--color-secondary)]/30">
          <div className="text-xs text-gray-400 mb-2">Attachments:</div>
          <div className="space-y-2">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-[var(--color-surface)] rounded px-3 py-2">
                <div className="flex items-center space-x-2">
                  <Paperclip className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-300 truncate">{file.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                  className="text-gray-400 hover:text-white p-1 h-auto"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about your design, upload files, or get suggestions..."
              className="w-full px-3 py-2 bg-[var(--color-surface)] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-[var(--color-primary)] focus:outline-none resize-none"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white p-2"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.multiple = true;
                input.accept = '.pdf,.doc,.docx,.txt,.png,.jpg,.jpeg';
                input.onchange = (e) => {
                  const files = (e.target as HTMLInputElement).files;
                  if (files) handleFileUpload(files);
                };
                input.click();
              }}
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() && attachments.length === 0}
              className="bg-[var(--color-primary)] hover:bg-[#0289d4] p-2"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mt-2">
          Supports PDF, DOC, images (max 10MB each)
        </div>
      </div>
    </motion.aside>
  );
}