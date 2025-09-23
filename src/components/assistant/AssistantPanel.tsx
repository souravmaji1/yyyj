'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Mic,
    MicOff,
    Send,
    MoreHorizontal,
    MessageSquare,
    Volume2,
    VolumeX,
    Loader2
} from 'lucide-react';
import { useAssistant } from '@/src/hooks/useAssistant';
import { Button } from '@/src/components/ui/button';
import { ScrollArea } from '@/src/components/ui/scroll-area';
import { FeedbackDialog } from './FeedbackDialog';
import { FocusManager, announce, KEYBOARD_SHORTCUTS } from '@/src/lib/studio/accessibility';
import type { AssistantMessage } from '@/src/store/slices/assistantSlice';

export function AssistantPanel() {
    const {
        open,
        recording,
        ttsEnabled,
        loading,
        error,
        messages,
        context,
        closePanel,
        startRecording,
        stopRecording,
        pushMessage,
        setLoading,
        setError,
        sendMessage
    } = useAssistant();

    const [inputValue, setInputValue] = useState('');
    const [showFeedback, setShowFeedback] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const inputRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            const newHeight = Math.min(inputRef.current.scrollHeight, 120);
            inputRef.current.style.height = `${newHeight}px`;
            
            // Hide scrollbar when content fits in one line
            if (newHeight <= 40) {
                inputRef.current.style.overflowY = 'hidden';
            } else {
                inputRef.current.style.overflowY = 'auto';
            }
        }
    }, [inputValue]);

    // Enhanced focus management when panel opens
    useEffect(() => {
        if (open) {
            // Store the previously focused element
            previousActiveElement.current = document.activeElement as HTMLElement;

            // Trap focus in the panel
            if (panelRef.current) {
                FocusManager.trapFocus(panelRef.current);
                announce('AI Assistant opened', 'polite');
            }

            // Focus the input field
            setTimeout(() => inputRef.current?.focus(), 150);
        } else {
            // Release focus trap and restore previous focus
            FocusManager.releaseFocus();
            if (previousActiveElement.current) {
                previousActiveElement.current.focus();
            }
            announce('AI Assistant closed', 'polite');
        }
    }, [open]);

    // Enhanced keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!open) return;

            // Handle Escape key
            if (e.key === 'Escape') {
                closePanel();
                return;
            }

            // Tab navigation within panel
            if (e.key === 'Tab') {
                const focusableElements = panelRef.current?.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );

                if (focusableElements && focusableElements.length > 0) {
                    const firstElement = focusableElements[0] as HTMLElement;
                    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

                    if (e.shiftKey && document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    } else if (!e.shiftKey && document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, closePanel]);

    // Click outside to close
    useEffect(() => {
        if (!open) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                closePanel();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open, closePanel]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || loading) return;

        try {
            setError(null);
            const userMessage: AssistantMessage = {
                id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                role: 'user',
                content: inputValue.trim(),
                timestamp: new Date(),
            };

            pushMessage(userMessage);
            setInputValue('');
            setLoading(true);

            // Use the real API call from the store
            await sendMessage(inputValue.trim());
            
            announce('Assistant response received', 'polite');
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

    const toggleRecording = () => {
        if (recording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const toggleTTS = () => {
        // TODO: Implement TTS toggle
        console.log('TTS toggle not implemented yet');
    };

    const formatTime = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(date);
    };

    return (
        <>
            <AnimatePresence>
                {open && (
                 <div
                 className="fixed inset-0 flex items-end justify-end assistant-panel-overlay"
                 style={{ zIndex: 999999 }}
             >
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                        />

                        {/* Panel */}
                        <motion.div
                            ref={panelRef}
                            initial={{ opacity: 0, x: 400, y: 0 }}
                            animate={{ opacity: 1, x: 0, y: 0 }}
                            exit={{ opacity: 0, x: 400, y: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="relative w-full max-w-sm h-[600px] m-4 bg-slate-900/95 backdrop-blur-xl border border-slate-800/50 rounded-2xl shadow-2xl shadow-indigo-500/10 flex flex-col"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="assistant-title"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-slate-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-center">
                                        <MessageSquare className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <h2 id="assistant-title" className="text-sm font-semibold text-white">
                                            AI Assistant
                                        </h2>
                                        <div className="text-xs text-slate-400">Always here to help</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    {/* Menu */}
                                    <div className="relative">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowMenu(!showMenu)}
                                            className="h-8 w-8 p-0 hover:bg-slate-800/50 text-slate-400 hover:text-white"
                                            aria-label="More options"
                                        >
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>

                                        {showMenu && (
                                            <div className="absolute top-full right-0 mt-1 w-40 bg-slate-800 border border-slate-700 rounded-lg shadow-lg py-1 z-10">
                                                <button
                                                    onClick={() => {
                                                        setShowFeedback(true);
                                                        setShowMenu(false);
                                                    }}
                                                    className="w-full px-3 py-2 text-left text-sm text-white hover:bg-slate-700 transition-colors"
                                                >
                                                    Send feedback
                                                </button>
                                                <button
                                                    onClick={toggleTTS}
                                                    className="w-full px-3 py-2 text-left text-sm text-white hover:bg-slate-700 transition-colors flex items-center gap-2"
                                                >
                                                    {ttsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                                                    {ttsEnabled ? 'Disable' : 'Enable'} TTS
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Close */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={closePanel}
                                        className="h-8 w-8 p-0 hover:bg-slate-800/50 text-slate-400 hover:text-white"
                                        aria-label="Close assistant"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Messages */}
                            <ScrollArea className="flex-1 p-4">
                                <div className="space-y-4">
                                    {messages.length === 0 ? (
                                        <div className="text-center py-8">
                                            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-center mx-auto mb-3">
                                                <MessageSquare className="h-6 w-6 text-white" />
                                            </div>
                                            <div className="text-sm font-medium text-white mb-1">
                                                Welcome to AI Assistant
                                            </div>
                                            <div className="text-xs text-slate-400 mb-4">
                                                Ask me anything about our platform or send feedback
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowFeedback(true)}
                                                className="border-slate-700 text-slate-300"
                                            >
                                                Send feedback
                                            </Button>
                                        </div>
                                    ) : (
                                        messages.map((message) => (
                                            <motion.div
                                                key={message.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[85%] px-3 py-2 rounded-2xl overflow-hidden ${message.role === 'user'
                                                            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white'
                                                            : 'bg-slate-800/50 text-slate-100 border border-slate-700/50'
                                                        }`}
                                                >
                                                    <div className="text-sm leading-relaxed break-words overflow-wrap-anywhere whitespace-pre-wrap word-break-break-all hyphens-auto">{message.content}</div>
                                                    <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-indigo-100' : 'text-slate-400'
                                                        }`}>
                                                        {formatTime(message.timestamp)}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}

                                    {loading && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex justify-start"
                                        >
                                            <div className="bg-slate-800/50 border border-slate-700/50 px-3 py-2 rounded-2xl">
                                                <div className="flex items-center gap-1">
                                                    <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                                                    <span className="text-xs text-slate-400">Assistant is thinking...</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Error Message */}
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex justify-center"
                                        >
                                            <div className="bg-red-900/50 border border-red-700/50 px-3 py-2 rounded-xl">
                                                <div className="flex items-center gap-2">
                                                    <X className="h-4 w-4 text-red-400" />
                                                    <span className="text-sm text-red-300">{error}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setError(null)}
                                                        className="h-6 w-6 p-0 hover:bg-red-800/50 text-red-400 hover:text-red-300"
                                                        aria-label="Dismiss error"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    <div ref={messagesEndRef} />
                                </div>
                            </ScrollArea>

                            {/* Input */}
                            <div className="p-4 border-t border-slate-800/50">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-start gap-2">
                                        <div className="flex-1">
                                            <textarea
                                                ref={inputRef}
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                onKeyDown={handleKeyPress}
                                                placeholder="Type your message..."
                                                className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent text-sm resize-none min-h-[40px] max-h-[120px] leading-relaxed overflow-hidden"
                                                disabled={loading}
                                                rows={1}
                                                maxLength={600}
                                            />
                                        </div>

                                    {/* Voice button */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={toggleRecording}
                                        className={`h-8 w-8 p-0 rounded-lg ${recording
                                                ? 'bg-red-600 hover:bg-red-500 text-white'
                                                : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'
                                            }`}
                                        aria-label={recording ? 'Stop recording' : 'Start recording'}
                                    >
                                        {recording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                    </Button>

                                    {/* Send button */}
                                    <Button
                                        onClick={handleSendMessage}
                                        disabled={!inputValue.trim() || loading}
                                        size="sm"
                                        className="h-8 w-8 p-0 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg"
                                        aria-label="Send message"
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                    </div>
                                    {/* Character count - moved outside textarea */}
                                    <div className="flex justify-end mt-1" style={{ position: 'relative', zIndex: 1 }}>
                                        <div className="text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded border border-slate-700" style={{ position: 'static' }}>
                                            {inputValue.length}/600
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Feedback Dialog */}
            <FeedbackDialog
                open={showFeedback}
                onOpenChange={setShowFeedback}
                context={context}
            />
        </>
    );
}