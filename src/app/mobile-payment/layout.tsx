"use client";

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { PaymentSocketProvider } from '@/src/contexts/PaymentSocketProvider';

// Initialize Stripe if key is provided
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

interface MobilePaymentLayoutProps {
  children: React.ReactNode;
}

export default function MobilePaymentLayout({ children }: MobilePaymentLayoutProps) {
  return (
    <PaymentSocketProvider>
      {stripePromise ? (
        <Elements stripe={stripePromise}>
          {children}
        </Elements>
      ) : (
        children
      )}
    </PaymentSocketProvider>
  );
}