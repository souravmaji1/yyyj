'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { paymentAxiosClient } from '@/src/app/apis/auth/axios';
import { usePaymentSocket } from '@/src/contexts/PaymentSocketProvider';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/store';

// Load Stripe only if the key is provided
const STRIPE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = STRIPE_KEY ? loadStripe(STRIPE_KEY) : null;

interface GooglePayPaymentProps {
  paymentId: string;
  amount: number;
  currency: string;
  orderId: string;
}

const GooglePayPayment = ({ paymentId, amount, currency, orderId }: GooglePayPaymentProps) => {
  const [stripe, setStripe] = useState<any>(null);
  const [paymentRequest, setPaymentRequest] = useState<any>(null);
  const [canMakePayment, setCanMakePayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { socket } = usePaymentSocket();
  const { profile: user } = useSelector((state: RootState) => state.user);

  // Check authentication status
  useEffect(() => {
    console.log('🔐 User authentication check:');
    console.log('🔐 User profile:', user);
    console.log('🔐 User ID:', user?.id);
    console.log('🔐 Has access token:', document.cookie.includes('accessToken'));
    
    if (!user?.id) {
      console.log('⚠️ User not logged in - redirecting to login');
      
      // Store current payment details in localStorage for after login
      const paymentDetails = {
        paymentId,
        amount,
        currency,
        orderId,
        returnUrl: window.location.href,
        timestamp: Date.now()
      };
      localStorage.setItem('pendingPayment', JSON.stringify(paymentDetails));
      
      // Redirect to login with return URL
      const loginUrl = `/auth?returnUrl=${encodeURIComponent(window.location.href)}`;
      window.location.href = loginUrl;
    }
  }, [user, paymentId, amount, currency, orderId]);

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        console.log('🔑 Initializing Stripe...');

        if (!stripePromise) {
          throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable is not set');
        }

        const stripeInstance = await stripePromise;

        if (!stripeInstance) {
          throw new Error('Stripe failed to initialize');
        }

        console.log('✅ Stripe initialized successfully');
        setStripe(stripeInstance);
      } catch (error: any) {
        console.error('❌ Stripe initialization error:', error);
        setError(`Payment service error: ${error.message}`);
      }
    };
    initializeStripe();
  }, []);

  // Check for pending payments after login
  useEffect(() => {
    if (user?.id) {
      const pendingPayment = localStorage.getItem('pendingPayment');
      if (pendingPayment) {
        try {
          const paymentData = JSON.parse(pendingPayment);
          const timeDiff = Date.now() - paymentData.timestamp;
          
          // Check if payment is still valid (within 30 minutes)
          if (timeDiff < 30 * 60 * 1000) {
            console.log('🔄 Found pending payment, auto-completing...');
            
            // Clear pending payment
            localStorage.removeItem('pendingPayment');
            
            // Auto-trigger payment if we're on the same payment page
            if (paymentData.paymentId === paymentId) {
              console.log('✅ Auto-completing pending payment');
              setError(null); // Clear any previous errors
              // Show success message
              setTimeout(() => {
                alert('🎉 Welcome back! Your payment is ready to complete.');
              }, 1000);
            }
          } else {
            console.log('⏰ Pending payment expired, clearing...');
            localStorage.removeItem('pendingPayment');
          }
        } catch (error) {
          console.error('❌ Error processing pending payment:', error);
          localStorage.removeItem('pendingPayment');
        }
      }
    }
  }, [user, paymentId]);

  // Listen for payment status updates via WebSocket
  useEffect(() => {
    if (!socket || !paymentId) return;

    console.log('🔌 Setting up WebSocket listener for payment:', paymentId);

    const handlePaymentUpdate = (data: any) => {
      console.log('📡 WebSocket payment update received:', data);
      
      if (data.paymentId === paymentId) {
        if (data.status === 'paid' || data.status === 'succeeded' || data.status === 'completed') {
          console.log('✅ Payment successful via WebSocket');
          setError(null);
          setIsProcessing(false);
          // Redirect to success page
          window.location.href = `/payment-success?paymentId=${paymentId}&status=paid&orderType=buyProduct`;
        } else if (data.status === 'failed' || data.status === 'cancelled') {
          console.log('❌ Payment failed via WebSocket');
          setError('Payment failed. Please try again.');
          setIsProcessing(false);
        } else {
          console.log('⏳ Payment processing via WebSocket:', data.status);
        }
      }
    };

    // Join payment room
    socket.emit('joinPaymentRoom', {
      userId: user?.id || '',
      roomName: `payment_${user?.id || ''}_${paymentId}`,
      paymentId: paymentId
    });

    // Listen for payment status updates
    socket.on('paymentStatusUpdate', handlePaymentUpdate);

    return () => {
      socket.off('paymentStatusUpdate', handlePaymentUpdate);
    };
  }, [socket, paymentId, user?.id]);

  useEffect(() => {
    if (!stripe) return;

    console.log('🔍 Setting up Google Pay payment request...');

    const pr = stripe.paymentRequest({
      country: 'US',
      currency: currency.toLowerCase(),
      total: {
        label: 'Intelliverse-X Payment',
        amount: Math.round(amount * 100),
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    pr.canMakePayment().then((result: any) => {
      console.log('🔍 Google Pay canMakePayment result:', result);
      console.log('🌐 Current URL:', window.location.href);
      console.log('🔒 Is HTTPS:', window.location.protocol === 'https:');
      console.log('📱 User Agent:', navigator.userAgent);
      console.log('📱 Platform:', navigator.platform);
      console.log('🔑 Stripe instance:', !!stripe);
      console.log('🔑 Payment Request:', !!pr);
      
      if (result && result.googlePay) {
        console.log('✅ Google Pay is available!');
        setCanMakePayment(true);
        setPaymentRequest(pr);
        setError(null); // Clear any previous errors
      } else {
        console.log('❌ Google Pay not available. Result:', result);
        console.log('🔍 Detailed result analysis:', {
          hasResult: !!result,
          googlePay: result?.googlePay,
          applePay: result?.applePay,
          link: result?.link,
          resultType: typeof result
        });
        setCanMakePayment(false);
        setError('Google Pay is not available on this device');
      }
    }).catch((error: any) => {
      console.error('❌ Google Pay canMakePayment error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      setCanMakePayment(false);
      setError('Error checking Google Pay availability');
    });

    pr.on('paymentmethod', async (event: any) => {
      setIsProcessing(true);
      setError(null);

      try {
        console.log('🔍 Google Pay paymentmethod event:', event);

        // Create payment intent for Google Pay
        console.log('🧪 Creating payment intent for Google Pay');
        
        try {
          // Check if user is authenticated
          if (!user?.id) {
            throw new Error('User not authenticated. Please log in.');
          }

          // Check if access token exists
          const hasToken = document.cookie.includes('accessToken');
          if (!hasToken) {
            throw new Error('No access token found. Please log in again.');
          }

          console.log('🔍 Calling payment API with data:', {
            amount: Math.round(amount * 100),
            currency: currency.toLowerCase(),
            paymentId: paymentId,
            orderId: orderId,
            userId: user.id,
            payment_type: 'buyProduct',
            hasToken: hasToken
          });
          
          const response = await paymentAxiosClient.post('/create-payment-intent', {
            amount: Math.round(amount * 100),
            currency: currency.toLowerCase(),
            paymentId: paymentId,
            orderId: orderId,
            userId: user.id,
            payment_type: 'buyProduct',
          });

          console.log('🔍 API response received:', response);
          const result = response.data;
          console.log('🔍 API result data:', result);
          
          // 🔍 DEBUG: Check what we're actually getting
          console.log('🔍 DEBUG - result object keys:', Object.keys(result));
          console.log('🔍 DEBUG - result.client_secret:', result.client_secret);
          console.log('🔍 DEBUG - result.clientSecret:', result.clientSecret);
          console.log('🔍 DEBUG - typeof result.client_secret:', typeof result.client_secret);
          
          if (result.error) {
            throw new Error(result.error);
          }
          
          // Validate client_secret before using it
          if (!result.client_secret) {
            console.error('❌ CRITICAL: client_secret is missing from API response');
            console.error('❌ Full API response:', result);
            throw new Error('Payment service returned invalid response - missing client secret');
          }
          
          //  Confirm the payment with the payment method
          const { error: confirmError } = await stripe.confirmCardPayment(
            result.client_secret, //  FIXED: Changed from result.clientSecret to result.client_secret
            {
              payment_method: event.paymentMethod.id,
            }
          );

          if (confirmError) {
            throw new Error(confirmError.message);
          }
        } catch (apiError: any) {
          console.log('🔄 API error details:', {
            message: apiError.message,
            response: apiError.response?.data,
            status: apiError.response?.status,
            statusText: apiError.response?.statusText,
            config: apiError.config
          });
          
          // Show specific error message on mobile screen
          let errorMessage = 'Payment failed';
          let detailedError = '';
          
          if (apiError.response?.status === 401) {
            errorMessage = 'Authentication failed - please log in again';
            detailedError = 'Status: 401 - Token missing or expired';
          } else if (apiError.response?.status === 404) {
            errorMessage = 'Payment service not found';
            detailedError = 'Status: 404 - API endpoint not found';
          } else if (apiError.response?.status === 500) {
            errorMessage = 'Payment service error';
            detailedError = `Status: 500 - Server error\n\nDetails: ${apiError.response?.data?.details || apiError.response?.data?.error || 'Unknown server error'}\n\nError Code: ${apiError.response?.data?.code || 'N/A'}`;
          } else if (apiError.message) {
            errorMessage = `Payment failed: ${apiError.message}`;
            detailedError = `Error: ${apiError.message}`;
          }
          
          // Show detailed error on mobile screen
          setError(`${errorMessage}\n\n${detailedError}`);
          setIsProcessing(false);
          return; // Don't throw error, just show it
        }

        // Payment successful
        console.log('✅ Google Pay payment successful');
        
        // Emit payment success to WebSocket for real-time updates
        if (socket) {
          socket.emit('payment:success', {
            paymentId: paymentId,
            status: 'paid',
            userId: user?.id || '',
            forpayment: 'buyProduct',
            paymentMethod: 'Google Pay'
          });
          console.log('📡 Payment success event emitted to WebSocket');
        }
        
        // Redirect to success page
        window.location.href = `/payment-success?paymentId=${paymentId}&status=paid&orderType=buyProduct`;

      } catch (err: any) {
        console.error('❌ Google Pay payment error:', err);
        
        // Better error handling to prevent undefined messages
        let errorMessage = 'Payment failed';
        if (err.message && err.message !== 'undefined') {
          errorMessage = err.message;
        } else if (err.error) {
          errorMessage = err.error;
        } else if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        }
        
        setError(errorMessage);
        setIsProcessing(false);
      }
    });

    pr.on('cancel', () => {
      console.log('🔍 Google Pay payment cancelled');
      setError('Payment was cancelled');
    });

    // Create and mount the Google Pay button
    if (canMakePayment && paymentRequest) {
      console.log('🔍 Mounting Google Pay button...');
      
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        const elements = stripe.elements();
        const paymentRequestButton = elements.create('paymentRequestButton', {
          paymentRequest: pr,
          style: {
            paymentRequestButton: {
              type: 'default',
              theme: 'dark',
              height: '48px'
            }
          }
        });
        
        // Mount the button to the container
        const buttonContainer = document.getElementById('google-pay-button');
        if (buttonContainer) {
          console.log('✅ Mounting Google Pay button to container');
          paymentRequestButton.mount('#google-pay-button');
        } else {
          console.log('❌ Google Pay button container not found');
        }
      }, 100);
    }

  }, [stripe, amount, currency, paymentId, orderId]);

  const handleGooglePayClick = () => {
    if (paymentRequest) {
      paymentRequest.show();
    } else {
      setError('Google Pay is not available');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 text-center max-w-md">
          <h2 className="text-red-400 text-xl font-semibold mb-2">Payment Error</h2>
          <p className="text-red-300 mb-4 whitespace-pre-line">
            {error && error !== 'undefined' ? error : 'An unexpected error occurred'}
          </p>
          
          {/* Debug Info */}
          <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-3 mb-4 text-left">
            <p className="text-gray-300 text-sm font-semibold mb-2">Debug Info:</p>
            <p className="text-gray-400 text-xs">Payment ID: {paymentId}</p>
            <p className="text-gray-400 text-xs">Order ID: {orderId}</p>
            <p className="text-gray-400 text-xs">Amount: ${amount.toFixed(2)} {currency}</p>
            <p className="text-gray-400 text-xs">User ID: {user?.id || 'Not logged in'}</p>
            <p className="text-gray-400 text-xs">URL: {window.location.href}</p>
          </div>
          
          <div className="flex flex-col gap-2">
            <button
              onClick={() => window.location.href = '/auth'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Log In to Continue
            </button>
            <button
              onClick={() => window.history.back()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-white text-2xl font-bold mb-2">Google Pay</h1>
          <p className="text-gray-300">Complete your payment securely</p>
        </div>

        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">Amount:</span>
            <span className="text-white font-semibold">${amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Currency:</span>
            <span className="text-white font-semibold">{currency}</span>
          </div>
        </div>

        {canMakePayment ? (
          <div>
            {/* Google Pay Button Container */}
            <div id="google-pay-button" className="mb-4"></div>
            
            {/* Fallback Button */}
            <button
              onClick={handleGooglePayClick}
              disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                'Pay with Google Pay'
              )}
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-400 mb-4">Google Pay is not available on this device</p>
            <button
              onClick={() => window.history.back()}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
            >
              Go Back
            </button>
          </div>
        )}

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Payment ID: {paymentId}
          </p>
        </div>
      </div>
    </div>
  );
};

const GooglePayPage = () => {
  const searchParams = useSearchParams();
  const paymentId = searchParams?.get('paymentId');
  const amount = parseFloat(searchParams?.get('amount') || '0');
  const currency = searchParams?.get('currency') || 'USD';
  const orderId = searchParams?.get('orderId') || '';

  if (!paymentId || amount <= 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 text-center">
          <h2 className="text-red-400 text-xl font-semibold mb-2">Invalid Payment</h2>
          <p className="text-red-300">Missing payment information</p>
        </div>
      </div>
    );
  }

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 text-center">
          <h2 className="text-red-400 text-xl font-semibold mb-2">Configuration Error</h2>
          <p className="text-red-300">Stripe is not configured. Please check your environment variables.</p>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <GooglePayPayment
        paymentId={paymentId}
        amount={amount}
        currency={currency}
        orderId={orderId}
      />
    </Elements>
  );
};

export default GooglePayPage; 