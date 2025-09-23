"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Mic, MicOff, Phone } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { useAssistant } from '@/src/hooks/useAssistant';



export default function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isOnCall, setIsOnCall] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Use the assistant store for API integration
  const {
    messages,
    loading,
    error,
    sendMessage,
    setError,
    setLoading,
    initializeSession,
    pushMessage
  } = useAssistant();

  // Initialize session when widget opens
  useEffect(() => {
    if (isOpen) {
      console.log('🔧 FloatingChatWidget opened, initializing session...');
      initializeSession();
    }
  }, [isOpen, initializeSession]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = `${newHeight}px`;
      
      // Hide scrollbar when content fits in one line
      if (newHeight <= 40) {
        textareaRef.current.style.overflowY = 'hidden';
      } else {
        textareaRef.current.style.overflowY = 'auto';
      }
    }
  }, [inputValue]);

  // Debug logging
  useEffect(() => {
    console.log('🔧 FloatingChatWidget state:', {
      isOpen,
      inputValue,
      loading,
      error,
      messagesCount: messages.length
    });
  }, [isOpen, inputValue, loading, error, messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const messageText = inputValue.trim();
    
    try {
      setError(null);
      setInputValue('');
      
      // Initialize session if needed
      initializeSession();

      // Add user message immediately to UI
      const userMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: 'user' as const,
        content: messageText,
        timestamp: new Date(),
      };
      
      // Add user message to store immediately
      pushMessage(userMessage);
      
      // Set loading state after user message is added
      setLoading(true);

      // Small delay to show the user message first
      await new Promise(resolve => setTimeout(resolve, 100));

      // Use the real API call from the store (but don't add user message again)
      await sendMessage(messageText);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
    // Shift+Enter allows new lines, so we don't prevent default
  };

  const toggleVoiceChat = () => {
    setIsListening(!isListening);
    // Here you would implement actual voice recognition
    if (!isListening) {
      console.log('Starting voice input...');
    } else {
      console.log('Stopping voice input...');
    }
  };

  const toggleAudioCall = () => {
    setIsOnCall(!isOnCall);
    // Here you would implement actual audio call functionality
    if (!isOnCall) {
      console.log('Starting audio call...');
    } else {
      console.log('Ending audio call...');
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.div
        className="fixed bottom-6 left-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-2xl shadow-blue-500/25 border-0 p-4 rounded-full"
          size="lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </motion.div>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center sm:justify-end p-4">
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Chat Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 w-full sm:w-96 h-[500px] sm:h-[600px]"
            >
              <Card className="bg-[#0F1629] border-gray-800 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <MessageCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">AI Assistant</h3>
                      <p className="text-xs text-gray-400">Always here to help</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleAudioCall}
                      className={`text-gray-400  ${isOnCall ? 'bg-green-500/20 text-green-400' : ''}`}
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="text-gray-400"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center text-gray-400 mt-8">
                      <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Start a conversation!</p>
                      <p className="text-xs mt-1">Ask about games, tournaments, predictions, or anything else.</p>
                    </div>
                  )}
                  
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] rounded-lg p-3 overflow-hidden ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                          : 'bg-gray-800 text-gray-100'
                      }`}>
                        <p className="text-sm break-words overflow-wrap-anywhere whitespace-pre-wrap word-break-break-all hyphens-auto">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Loading indicator */}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-800 text-gray-100 rounded-lg p-3 max-w-[80%]">
                        <div className="flex items-center gap-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-sm text-gray-300">Assistant is thinking....</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Error message */}
                  {error && (
                    <div className="flex justify-center">
                      <div className="bg-red-900/50 border border-red-700/50 px-3 py-2 rounded-xl">
                        <div className="flex items-center gap-2">
                          <X className="h-4 w-4 text-red-400" />
                          <span className="text-sm text-red-300">{error}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                                 {/* Input Area */}
                 <div className="p-4 border-t border-gray-800">
                   <div className="flex flex-col gap-2">
                     <div className="flex items-start gap-2">
                       <div className="flex-1">
                         <textarea
                           ref={textareaRef}
                           placeholder="Type your message..."
                           value={inputValue}
                           onChange={(e) => {
                             console.log('🔧 Input value changed:', e.target.value);
                             setInputValue(e.target.value);
                           }}
                           onKeyDown={handleKeyPress}
                           className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[40px] max-h-[120px] text-sm leading-relaxed overflow-hidden"
                           style={{ zIndex: 1000 }}
                           rows={1}
                           maxLength={600}
                         />
                       </div>
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={toggleVoiceChat}
                         className={`text-gray-400 hover:text-white ${isListening ? 'bg-red-500/20 text-red-400' : ''}`}
                       >
                         {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                       </Button>
                       <Button
                         onClick={handleSendMessage}
                         disabled={!inputValue.trim() || loading}
                         className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                         size="sm"
                       >
                         <Send className="h-4 w-4" />
                       </Button>
                     </div>
                     {/* Character count - moved outside textarea */}
                     <div className="flex justify-end mt-1" style={{ position: 'relative', zIndex: 1 }}>
                       <div className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded border border-gray-700" style={{ position: 'static' }}>
                         {inputValue.length}/600
                       </div>
                     </div>
                   </div>
                  
                  {isOnCall && (
                    <div className="mt-2 p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-400">Audio call active</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={toggleAudioCall}
                          className="text-red-400 hover:text-red-300"
                        >
                          End Call
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {isListening && (
                    <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-red-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-red-400">Listening... (Click mic to stop)</span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}