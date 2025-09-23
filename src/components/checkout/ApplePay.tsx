"use client";

import { useEffect, useState } from 'react';
import { useStripe, useElements, PaymentRequestButtonElement } from '@stripe/react-stripe-js';
import { Apple } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/store';
import { paymentAxiosClient } from '@/src/app/apis/auth/axios';

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

interface ApplePayProps {
  amount: number; // Amount in cents
  currency: string;
  orderData: OrderData;
  onPaymentSuccess: (paymentMethod: string, paymentIntent: any) => void;
  onPaymentError: (error: any) => void;
  disabled?: boolean;
}

export default function ApplePay({
  amount,
  currency,
  orderData,
  onPaymentSuccess,
  onPaymentError,
  disabled = false
}: ApplePayProps) {
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

        // FIXED: Check for HTTPS requirement for Apple Pay
    // if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
    //   console.error('Apple Pay requires HTTPS (except on localhost)');
    //   return;
    // }
  
  
    const pr = stripe.paymentRequest({
      country: 'US',
      currency: currency.toLowerCase(),
      total: {
        label: 'Intelliverse-X Order',
        amount: amount, // Amount is already in cents
      },
      displayItems: [
        {
          label: 'Order Total',
          amount: amount, // Amount in cents
        }
      ],
      requestPayerName: true,
      requestPayerEmail: true,
      requestPayerPhone: true,
      requestShipping: true,
    });

    // Check if Apple Pay is supported
    pr.canMakePayment().then((result: any) => {
      console.log('Apple Pay canMakePayment result:', result);
      console.log(' Result details:', {
        hasResult: !!result,
        applePay: result?.applePay,
        googlePay: result?.googlePay,
        link: result?.link
      });
      
      // Enhanced debugging for Apple Pay availability
      if (result && result.applePay) {
        console.log(' Apple Pay is available!');
        setCanMakePayment(true);
        setPaymentRequest(pr);
      } else {
        console.log(' Apple Pay not available:', result);
        console.log(' Apple Pay availability check:', {
          userAgent: navigator.userAgent,
          isSafari: /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent),
          isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
          isMac: /Mac/.test(navigator.userAgent),
          protocol: window.location.protocol,
          hostname: window.location.hostname,
          domain: window.location.hostname
        });
        setCanMakePayment(false);
      }
    }).catch((error: any) => {
      console.error(' Apple Pay canMakePayment error:', error);
      setCanMakePayment(false);
    });

    // Handle payment request completion
    pr.on('paymentmethod', async (event: any) => {
      setIsProcessing(true);
      
      // FIXED: Add timeout to prevent infinite processing
      const paymentTimeout = setTimeout(() => {
        console.error(' Apple Pay payment timeout after 30 seconds');
        event.complete('fail');
        setIsProcessing(false);
        onPaymentError(new Error('Payment timeout - please try again'));
      }, 30000);
      
      try {
        console.log(' Apple Pay paymentmethod event triggered:', event);
        
        //  FIXED: Validate order ID exists before proceeding
        if (!orderData.orderId) {
          console.error(' No order ID provided for Apple Pay payment');
          console.error(' orderData:', orderData);
          event.complete('fail');
          throw new Error('Order ID is required for payment. Please try again.');
        }
        
        console.log(' Using order ID:', orderData.orderId);
        console.log(' Full order data:', orderData);
        console.log(' Amount being charged:', amount, 'cents');
        
        //  FIXED: Create payment intent FIRST, then attach payment method
        const paymentIntentPayload = {
          amount: amount, //  FIXED: Amount is already in cents from parent
          currency: currency.toLowerCase(),
          paymentId: orderData.orderId || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          orderId: orderData.orderId, //  FIXED: This now has valid database order ID
          userId: user?.id || '',
          payment_type: 'buyProduct',
        };
        
        console.log('🍎 Creating payment intent with payload:', paymentIntentPayload);
        
        const response = await paymentAxiosClient.post('/create-payment-intent', paymentIntentPayload);

        console.log('🍎 Payment intent response:', response);
        
        if (response.data.error) {
          console.error(' Payment intent creation failed:', response.data);
          event.complete('fail'); //  FIXED: Tell Apple Pay payment failed
          throw new Error(response.data.error || 'Failed to create payment intent');
        }

        const result = response.data;
        console.log('🍎 Payment intent created:', result);
        
        //  FIXED: Handle both response formats
        const clientSecret = result.clientSecret || result.client_secret;
        
        if (!clientSecret) {
          console.error(' No client secret received:', result);
          event.complete('fail'); //  FIXED: Tell Apple Pay payment failed
          throw new Error('No client secret received from payment service');
        }

        //  FIXED: Use proper Apple Pay payment confirmation with confirmCardPayment
        const { error } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: event.paymentMethod.id,
        });

        if (error) {
          console.error('❌ Apple Pay payment confirmation failed:', error);
          event.complete('fail'); //  FIXED: Tell Apple Pay payment failed
          onPaymentError(error);
        } else {
          console.log('✅ Apple Pay payment confirmed successfully!');
          event.complete('success'); //  FIXED: Tell Apple Pay payment succeeded
          onPaymentSuccess('Apple Pay', { id: result.paymentIntentId });
        }
      } catch (error: any) {
        console.error(' Apple Pay payment error:', error);
        event.complete('fail'); //  FIXED: Tell Apple Pay payment failed
        onPaymentError(error);
      } finally {
        clearTimeout(paymentTimeout); //  FIXED: Clear timeout
        setIsProcessing(false);
      }
    });

      //  FIXED: Add error handling for payment request
    pr.on('error' as any, (error: any) => {
      console.error('Apple Pay payment request error:', error);
      setIsProcessing(false);
      onPaymentError(error);
    });

    // Handle payment request cancellation
    pr.on('cancel', () => {
      console.log('Apple Pay payment cancelled by user');
      setIsProcessing(false);
    });

    return () => {
      if (pr) {
        // pr.destroy();
      } 
    };
  }, [stripe, elements, amount, currency, orderData, onPaymentSuccess, onPaymentError]);

  // Debug logging
  console.log('🍎 ApplePay Component Debug:', {
    canMakePayment,
    stripe: !!stripe,
    elements: !!elements,
    paymentRequest: !!paymentRequest,
    amount,
    currency,
    isLiveSite: typeof window !== 'undefined' && window.location.hostname === 'intelli-verse-x.ai',
    protocol: typeof window !== 'undefined' ? window.location.protocol : 'unknown'
  });

  if (!canMakePayment) {
    console.log('Apple Pay not available, showing fallback message');
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Apple className="h-4 w-4" />
          <span>Apple Pay</span>
        </div>
        
        <div className="bg-yellow-900/20 border border-yellow-900/30 rounded-lg p-4">
          <p className="text-yellow-400 text-sm text-center">
            Apple Pay is not available on this device or browser
          </p>
          <p className="text-yellow-300 text-xs text-center mt-1">
            Please use Safari on iPhone/Mac with a saved card, or try another payment method
          </p>
          <p className="text-yellow-200 text-xs text-center mt-1">
            Domain registration may be required for Apple Pay on this website
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Apple className="h-4 w-4" />
        <span>Apple Pay</span>
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