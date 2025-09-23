"use client";

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ReactNode } from 'react';

// Initialize Stripe with your publishable key if available
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

interface StripeProviderProps {
  children: ReactNode;
  clientSecret?: string;
}

export default function StripeProvider({ children, clientSecret }: StripeProviderProps) {
  const options = clientSecret ? {
    clientSecret,
    appearance: {
      theme: 'night' as const,
      variables: {
        colorPrimary: 'var(--color-primary)',
        colorBackground: 'var(--color-surface)',
        colorText: '#ffffff',
        colorDanger: '#ef4444',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
      rules: {
        '.Input': {
          backgroundColor: '#1D2939',
          border: '1px solid #374151',
          color: '#ffffff',
        },
        '.Input:focus': {
          borderColor: '#02A7FD',
          boxShadow: '0 0 0 1px #02A7FD',
        },
      },
    },
  } : {
    appearance: {
      theme: 'night' as const,
      variables: {
        colorPrimary: 'var(--color-primary)',
        colorBackground: 'var(--color-surface)',
        colorText: '#ffffff',
        colorDanger: '#ef4444',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
      rules: {
        '.Input': {
          backgroundColor: '#1D2939',
          border: '1px solid #374151',
          color: '#ffffff',
        },
        '.Input:focus': {
          borderColor: '#02A7FD',
          boxShadow: '0 0 0 1px #02A7FD',
        },
      },
    },
  };

  if (!stripePromise) {
    console.error('Stripe publishable key is not configured');
    return <>{children}</>;
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}