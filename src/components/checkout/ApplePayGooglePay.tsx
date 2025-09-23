"use client";

import { useEffect, useState } from 'react';
import { useStripe, useElements, PaymentRequestButtonElement } from '@stripe/react-stripe-js';
import { Button } from '@/src/components/ui/button';
import { Apple, CreditCard } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { createOrder } from '@/src/store/slices/orderSlice';
import { RootState, AppDispatch } from '@/src/store';

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
  orderId?: string; // Add orderId for Apple Pay flow
  orderItems: Array<{
    productId: number;
    variantId: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  paymentMethod: string;
}

interface ApplePayGooglePayProps {
  amount: number; // Amount in cents
  currency: string;
  orderData: OrderData;
  onPaymentSuccess: (paymentMethod: string, paymentIntent: any) => void;
  onPaymentError: (error: any) => void;
  disabled?: boolean;
}

export default function ApplePayGooglePay({
  amount,
  currency,
  orderData,
  onPaymentSuccess,
  onPaymentError,
  disabled = false
}: ApplePayGooglePayProps) {

  
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch<AppDispatch>();
  const { profile: user } = useSelector((state: RootState) => state.user);
  const [paymentRequest, setPaymentRequest] = useState<any>(null);
  const [canMakePayment, setCanMakePayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!stripe || !elements) {
      return;
    }

    // Create payment request
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

    // Check if payment request is supported
    pr.canMakePayment().then((result: any) => {
      if (result) {
        setCanMakePayment(true);
        setPaymentRequest(pr);
      }
    }).catch((error: any) => {
      console.error('Apple Pay canMakePayment error:', error);
    });

        // Handle payment request completion
    pr.on('paymentmethod', async (event: any) => {
      setIsProcessing(true);
      
      try {
        // Create payment intent on your backend
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amount, // Amount in cents
            currency: currency.toLowerCase(),
            payment_method_id: event.paymentMethod.id,
            payment_method_type: event.paymentMethod.type,
            orderId: orderData.orderId, // Use the orderId from props
            userId: user?.id || '',
          }),
        });

        const { clientSecret, paymentIntent } = await response.json();

        if (!response.ok) {
          throw new Error('Failed to create payment intent');
        }

        // Confirm the payment
        const { error, paymentIntent: confirmedPaymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: event.paymentMethod.id,
          }
        );

        if (error) {
          onPaymentError(error);
        } else {
          // Determine payment method for display
          const paymentMethodType = event.paymentMethod.type === 'card' 
            ? (event.paymentMethod.card?.wallet?.type === 'apple_pay' ? 'Apple Pay' : 'Google Pay')
            : 'Digital Wallet';
          
          onPaymentSuccess(paymentMethodType, confirmedPaymentIntent);
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
  }, [stripe, elements, amount, currency, orderData, dispatch, onPaymentSuccess, onPaymentError]);

  if (!canMakePayment) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Apple className="h-4 w-4" />
        <span>Apple Pay / Google Pay</span>
      </div>
      
      <div className="relative">
        <PaymentRequestButtonElement
          options={{
            paymentRequest,
            style: {
              paymentRequestButton: {
                type: 'default', // or 'donate', 'book'
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
      
      <div className="text-center">
        <div className="inline-flex items-center gap-2 text-xs text-gray-500">
          <CreditCard className="h-3 w-3" />
          <span>Secure payment powered by Stripe</span>
        </div>
      </div>
    </div>
  );
} 