'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context?: Record<string, any>;
  onSuccess?: () => void;
}

export function FeedbackDialog({
  open,
  onOpenChange,
  context,
  onSuccess
}: FeedbackDialogProps) {
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [includeContext, setIncludeContext] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const buildMailtoLink = () => {
    const subject = `AI Assistant Feedback${email ? ` from ${email}` : ''}`;
    const bodyParts = [`Feedback:\n${feedback.trim()}`];
    if (email) bodyParts.push(`\nFrom: ${email}`);
    if (includeContext && context)
      bodyParts.push(`\n\nContext:\n${JSON.stringify(context, null, 2)}`);

    return `mailto:support@intelli-verse-x.ai?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(bodyParts.join(''))}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback.trim().length >= 3) {
      setSubmitting(true);
      window.location.href = buildMailtoLink();

      // Reset form and close dialog
      setFeedback('');
      setEmail('');
      setIncludeContext(true);
      onOpenChange(false);

      // Fire success toast event
      window.dispatchEvent(
        new CustomEvent('studio-toast', {
          detail: {
            type: 'success',
            title: 'Email client opened',
            description:
              'Please send the email to submit your feedback.',
            duration: 5000,
          }
        })
      );

      setSubmitting(false);
      onSuccess?.();
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onOpenChange(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !submitting) {
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onKeyDown={handleKeyDown}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-md bg-slate-900/95 backdrop-blur-xl border border-slate-800/50 rounded-2xl shadow-2xl shadow-indigo-500/10"
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800/50">
              <h2 id="feedback-title" className="text-lg font-semibold text-white">
                Send feedback
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                disabled={submitting}
                className="h-8 w-8 p-0 hover:bg-slate-800/50 text-slate-400 hover:text-white"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Feedback field */}
              <div className="space-y-2">
                <label htmlFor="feedback-text" className="block text-sm font-medium text-slate-300">
                  Your feedback <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="feedback-text"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us what's great or what needs improvement…"
                  className="w-full h-28 px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent resize-none"
                  required
                  minLength={3}
                  disabled={submitting}
                  autoFocus
                />
                <div className="text-xs text-slate-400">
                  {feedback.length}/500 characters (minimum 3)
                </div>
              </div>

              {/* Email field */}
              <div className="space-y-2">
                <label htmlFor="feedback-email" className="block text-sm font-medium text-slate-300">
                  Your email (optional)
                </label>
                <input
                  id="feedback-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent"
                  disabled={submitting}
                />
              </div>

              {/* Context toggle */}
              <div className="flex items-center space-x-2">
                <input
                  id="include-context"
                  type="checkbox"
                  checked={includeContext}
                  onChange={(e) => setIncludeContext(e.target.checked)}
                  disabled={submitting}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500/50 focus:ring-offset-0"
                />
                <label htmlFor="include-context" className="text-sm text-slate-300">
                  Include page context (URL, selection, device info)
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClose}
                  disabled={submitting}
                  className="hover:bg-slate-800/50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!feedback.trim() || feedback.trim().length < 3 || submitting}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-6"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}