"use client";

import { useEffect, useState } from 'react';
import { useStripe, useElements, PaymentRequestButtonElement } from '@stripe/react-stripe-js';
import { CreditCard } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/store';

interface OrderData {
  totalAmount: number;
  discountAmount: number;
  nftId: number | null;
  nftName: string | null;
  numberOfSupply: number;
  buyNftId: number;
  nftDiscountAmount: number;
  nftDiscountPercentage: number;
  couponCode: string;
  message: string;
  addressId: string;
  currency: string;
  orderId?: string;
  orderItems: Array<{
    productId: number;
    variantId: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  paymentMethod: string;
}

interface GooglePayProps {
  amount: number; // Amount in cents
  currency: string;
  orderData: OrderData;
  onPaymentSuccess: (paymentMethod: string, paymentIntent: any) => void;
  onPaymentError: (error: any) => void;
  disabled?: boolean;
}

export default function GooglePay({
  amount,
  currency,
  orderData,
  onPaymentSuccess,
  onPaymentError,
  disabled = false
}: GooglePayProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { profile: user } = useSelector((state: RootState) => state.user);
  const [paymentRequest, setPaymentRequest] = useState<any>(null);
  const [canMakePayment, setCanMakePayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!stripe || !elements) {
      return;
    }

    // Create payment request specifically for Google Pay
    const pr = stripe.paymentRequest({
      country: 'US',
      currency: currency.toLowerCase(),
      total: {
        label: 'Intelliverse-X Order',
        amount: amount, // Amount is already in cents
      },
      requestPayerName: true,
      requestPayerEmail: true,
      requestPayerPhone: true,
      requestShipping: true,
    });

    // Check if Google Pay is supported
    pr.canMakePayment().then((result: any) => {
      if (result && result.googlePay) {
        setCanMakePayment(true);
        setPaymentRequest(pr);
      }
    }).catch((error: any) => {
      console.error('Google Pay canMakePayment error:', error);
    });

    // Handle payment request completion
    pr.on('paymentmethod', async (event: any) => {
      setIsProcessing(true);
      
      try {
        // ✅ FIXED: Create payment intent FIRST, then attach payment method
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amount,
            currency: currency.toLowerCase(),
            paymentId: orderData.orderId || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            orderId: orderData.orderId,
            userId: user?.id || '',
            payment_type: 'buyProduct',
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create payment intent');
        }

        const { clientSecret, paymentIntentId } = await response.json();

        // ✅ FIXED: Confirm the payment with the payment method
        const { error, paymentIntent: confirmedPaymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: event.paymentMethod.id,
          }
        );

        if (error) {
          onPaymentError(error);
        } else {
          onPaymentSuccess('Google Pay', confirmedPaymentIntent);
        }
      } catch (error) {
        onPaymentError(error);
      } finally {
        setIsProcessing(false);
      }
    });

    // Handle payment request cancellation
    pr.on('cancel', () => {
      setIsProcessing(false);
    });

    return () => {
      if (pr) {
        // pr.destroy();
      } 
    };
  }, [stripe, elements, amount, currency, orderData, onPaymentSuccess, onPaymentError]);

  if (!canMakePayment) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <CreditCard className="h-4 w-4" />
        <span>Google Pay</span>
      </div>
      
      <div className="relative">
        <PaymentRequestButtonElement
          options={{
            paymentRequest,
            style: {
              paymentRequestButton: {
                type: 'default',
                theme: 'dark',
                height: '48px',
              },
            },
          }}
        />
        
        {isProcessing && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}
      </div>
    </div>
  );
} 