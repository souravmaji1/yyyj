"use client";

import { useState } from 'react';
import { Button } from '@/src/components/ui/button';

interface CareerFormData {
  name: string;
  email: string;
  roleInterested: string;
  resumeUrl?: string;
  message: string;
}

interface CareerInterestFormProps {
  className?: string;
}

export function CareerInterestForm({ className = '' }: CareerInterestFormProps) {
  const [formData, setFormData] = useState<CareerFormData>({
    name: '',
    email: '',
    roleInterested: '',
    resumeUrl: '',
    message: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const roleOptions = [
    'Software Engineer',
    'Senior Software Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'DevOps Engineer',
    'AI/ML Engineer',
    'Data Scientist',
    'Game Developer',
    'UI/UX Designer',
    'Product Manager',
    'Product Designer',
    'QA Engineer',
    'Security Engineer',
    'Business Development',
    'Marketing Manager',
    'Community Manager',
    'Customer Success',
    'Operations',
    'Finance',
    'Legal',
    'Other'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          page: 'careers',
          company: '', // Honeypot field
        }),
      });

      const result = await response.json();

      if (response.ok && result.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', roleInterested: '', resumeUrl: '', message: '' });
      } else {
        setSubmitStatus('error');
        setErrorMessage(result.error || 'Failed to send application');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-green-900 mb-2">Application Submitted!</h3>
          <p className="text-green-700 mb-4">
            Thank you for your interest in joining IntelliVerseX. We&apos;ll review your application and get back to you soon.
          </p>
          <p className="text-sm text-green-600 mb-4">
            You&apos;ll receive a confirmation email at the address you provided.
          </p>
          <Button 
            onClick={() => setSubmitStatus('idle')}
            variant="outline"
            className="border-green-300 text-green-700 hover:bg-green-50"
          >
            Submit Another Application
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Honeypot field - hidden from users */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        style={{ position: 'absolute', left: '-9999px' }}
        aria-hidden="true"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            placeholder="Your full name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            placeholder="your@email.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="roleInterested" className="block text-sm font-medium text-white mb-2">
          Role Interested In *
        </label>
        <select
          id="roleInterested"
          name="roleInterested"
          required
          value={formData.roleInterested}
          onChange={handleInputChange}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
        >
          <option value="">Select a role...</option>
          {roleOptions.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="resumeUrl" className="block text-sm font-medium text-white mb-2">
          Resume/Portfolio URL
          <span className="text-white/70 text-xs ml-2">(Optional - Link to LinkedIn, GitHub, portfolio, etc.)</span>
        </label>
        <input
          type="url"
          id="resumeUrl"
          name="resumeUrl"
          value={formData.resumeUrl}
          onChange={handleInputChange}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
          placeholder="https://linkedin.com/in/yourprofile or https://github.com/yourusername"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
          Tell Us About Yourself *
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          value={formData.message}
          onChange={handleInputChange}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 resize-vertical"
          placeholder="Tell us about your experience, what excites you about IntelliVerseX, and why you'd be a great fit for this role..."
        />
      </div>

      {submitStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700">{errorMessage}</p>
          </div>
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting || !formData.name || !formData.email || !formData.roleInterested || !formData.message}
        className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-700)] text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting Application...
          </div>
        ) : (
          'Submit Application'
        )}
      </Button>

      <div className="text-sm text-white/70 space-y-2">
        <p>
          By submitting this form, you agree to our processing of your personal information in accordance with our{' '}
          <a href="/privacy" className="text-[var(--color-primary)] hover:underline">Privacy Policy</a>.
        </p>
        <p>
          We&apos;re an equal opportunity employer committed to diversity and inclusion.
        </p>
      </div>
    </form>
  );
}