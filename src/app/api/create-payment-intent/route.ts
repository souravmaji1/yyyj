import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { withError } from '@/src/lib/withError';
import { createAppError } from '@/src/lib/safeFetch';

async function handler(request: NextRequest) {
  console.log(' create-payment-intent API called');
  
  // Check if STRIPE_SECRET_KEY is available
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  
  if (!STRIPE_SECRET_KEY) {
    console.error(' STRIPE_SECRET_KEY not found');
    throw createAppError(
      'Unknown',
      'Payment service configuration error',
      { statusCode: 500 }
    );
  }

  // Initialize Stripe
  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2025-08-27.basil',
  });

  const body = await request.json();
  const { amount, currency, paymentMethodId, paymentId, orderId, userId, payment_type } = body;
  
  console.log('🔍 Payment intent request:', { amount, currency, orderId, userId, payment_type });

  if (!amount || !currency) {
    throw createAppError(
      'Validation',
      'Missing required fields: amount, currency',
      { statusCode: 400 }
    );
  }

  // Create a payment intent for Apple Pay and Google Pay
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount, // FIXED: Amount is already in cents from frontend
    currency: currency.toLowerCase(),
    //  FIXED: Correct Stripe configuration for Apple Pay
    automatic_payment_methods: {
      enabled: true, // This enables Apple Pay and Google Pay detection
    },
    metadata: {
      paymentId: paymentId || '',
      orderId: orderId || '',
      userId: userId || '',
      payment_type: payment_type || 'buyProduct',
      payment_method_type: 'apple_pay', //  FIXED: Specify Apple Pay
    },
  });

  console.log(' Payment intent created successfully:', {
    id: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: paymentIntent.status
  });

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    client_secret: paymentIntent.client_secret, //  FIXED: Add both formats for compatibility
    paymentIntentId: paymentIntent.id,    
    payment_id: paymentId || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  });
}

export const POST = withError(handler); 