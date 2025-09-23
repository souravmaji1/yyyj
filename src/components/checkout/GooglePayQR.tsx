"use client";

import { useEffect, useState } from 'react';
import { CreditCard, Smartphone, CheckCircle, AlertCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/store';
import { usePaymentSocket } from '@/src/contexts/PaymentSocketProvider';
import { useNotificationUtils } from '@/src/core/utils/notificationUtils';
import { useRouter } from 'next/navigation';

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

interface GooglePayQRProps {
  amount: number; // Amount in cents
  currency: string;
  orderData: OrderData;
  onPaymentSuccess: (paymentMethod: string, paymentIntent: any) => void;
  onPaymentError: (error: any) => void;
  disabled?: boolean;
}

export default function GooglePayQR({
  amount,
  currency,
  orderData,
  onPaymentSuccess,
  onPaymentError,
  disabled = false
}: GooglePayQRProps) {
  const { profile: user } = useSelector((state: RootState) => state.user);
  const { joinPaymentRoom } = usePaymentSocket();
  const { showSuccess, showError, showInfo } = useNotificationUtils();
  const router = useRouter();
  
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [paymentUrl, setPaymentUrl] = useState<string>('');
  const [paymentId, setPaymentId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes

  // Generate QR code for Google Pay payment
  const generateGooglePayQR = async () => {
    // If no order ID, we need to create the order first
    if (!orderData.orderId) {
      showError('Order Error', 'Please click "Place Order" first to create your order');
      return;
    }

    setIsGenerating(true);
    try {
      // Use the same pattern as scan payment - call the payment service
      const paymentPayload = {
        amount: Number(orderData.totalAmount),
        userId: user?.id || '',
        currency: "USD",
        paymentType: "buyProduct",
        orderId: orderData.orderId,
        paymentMethod: "stripe",
      };

      const response = await fetch('/api/create-googlepay-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to generate QR code');
      }

      setQrCodeUrl(result.qrCode);
      setPaymentUrl(result.url);
      setPaymentId(result.paymentId);

      // Join payment room for real-time updates
      if (user?.id && result.paymentId) {
        joinPaymentRoom(user.id, result.paymentId);
      }

      showSuccess('QR Code Generated', 'Scan this QR code with your mobile device to complete payment with Google Pay');
    } catch (error: any) {
      showError('QR Generation Failed', error.message || 'Failed to generate QR code');
      onPaymentError(error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Listen for payment status updates
  useEffect(() => {
    if (!paymentId) return;

    const handlePaymentUpdate = (data: any) => {
      if (data.paymentId === paymentId) {
        setPaymentStatus(data.status);
        
        if (data.status === 'success') {
          showSuccess('Payment Successful', 'Google Pay payment completed successfully');
          onPaymentSuccess('Google Pay', data.paymentIntent);
        } else if (data.status === 'failed') {
          showError('Payment Failed', data.message || 'Payment failed');
          onPaymentError(new Error(data.message || 'Payment failed'));
        }
      }
    };

    // Listen for payment updates via WebSocket
    const socket = (window as any).paymentSocket;
    if (socket) {
      socket.on('payment:update', handlePaymentUpdate);
      socket.on('payment:success', handlePaymentUpdate);
      socket.on('payment:failed', handlePaymentUpdate);
    }

    return () => {
      if (socket) {
        socket.off('payment:update', handlePaymentUpdate);
        socket.off('payment:success', handlePaymentUpdate);
        socket.off('payment:failed', handlePaymentUpdate);
      }
    };
  }, [paymentId, onPaymentSuccess, onPaymentError]);

  // Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    
    if (paymentStatus === 'pending' && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setPaymentStatus('failed');
            showError('Payment Timeout', 'Payment session expired. Please try again.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [paymentStatus, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRefreshQR = () => {
    setQrCodeUrl('');
    setPaymentUrl('');
    setPaymentId('');
    setPaymentStatus('pending');
    setTimeRemaining(300);
    generateGooglePayQR();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <CreditCard className="h-4 w-4" />
        <span>Google Pay QR Payment</span>
      </div>

             {/* Status Indicator */}
       <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-800">
         {!orderData.orderId && (
           <>
             <AlertCircle className="h-5 w-5 text-orange-500" />
             <span className="text-orange-500">Order not created yet</span>
           </>
         )}
         {orderData.orderId && paymentStatus === 'pending' && (
           <>
             <AlertCircle className="h-5 w-5 text-yellow-500" />
             <span className="text-yellow-500">Waiting for payment</span>
           </>
         )}
         {paymentStatus === 'processing' && (
           <>
             <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
             <span className="text-blue-500">Processing payment...</span>
           </>
         )}
         {paymentStatus === 'success' && (
           <>
             <CheckCircle className="h-5 w-5 text-green-500" />
             <span className="text-green-500">Payment successful!</span>
           </>
         )}
         {paymentStatus === 'failed' && (
           <>
             <AlertCircle className="h-5 w-5 text-red-500" />
             <span className="text-red-500">Payment failed</span>
           </>
         )}
       </div>

      {/* QR Code Display */}
      {qrCodeUrl ? (
        <div className="bg-[var(--color-panel)] p-6 rounded-lg flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="h-5 w-5 text-[var(--color-primary)]" />
            <span className="text-white font-medium">Scan with your mobile device</span>
          </div>

          {/* QR Code */}
          <div className="relative mb-4">
            <img
              src={qrCodeUrl}
              alt="Google Pay QR Code"
              className="w-48 h-48 border-2 border-[var(--color-primary)] rounded-lg"
            />
            {paymentStatus === 'processing' && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>

          {/* Timer */}
          {paymentStatus === 'pending' && (
            <div className="text-center mb-4">
              <p className="text-gray-300 text-sm">Time remaining:</p>
              <p className="text-[var(--color-primary)] font-bold text-lg">{formatTime(timeRemaining)}</p>
            </div>
          )}

          {/* Payment URL */}
          <div className="w-full text-center">
            <p className="text-gray-300 mb-2 text-sm">
              Or click the link below to pay:
            </p>
            <a
              href={paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Open Google Pay
            </a>
          </div>

          {/* Instructions */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">
              1. Open Google Pay on your mobile device<br />
              2. Scan this QR code or click the link above<br />
              3. Complete the payment on your mobile
            </p>
          </div>

          {/* Refresh Button */}
          {paymentStatus === 'failed' && (
            <button
              onClick={handleRefreshQR}
              className="mt-4 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Generate New QR Code
            </button>
          )}
        </div>
      ) : (
        /* Generate QR Button */
        <div className="bg-[var(--color-panel)] p-6 rounded-lg text-center">
                     <button
             onClick={generateGooglePayQR}
             disabled={isGenerating || disabled || !orderData.orderId}
             className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
           >
             {isGenerating ? (
               <>
                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                 Generating QR Code...
               </>
             ) : !orderData.orderId ? (
               <>
                 <CreditCard className="h-4 w-4" />
                 Click "Place Order" First
               </>
             ) : (
               <>
                 <CreditCard className="h-4 w-4" />
                 Generate Google Pay QR Code
               </>
             )}
           </button>
           <p className="text-xs text-gray-400 mt-2">
             {!orderData.orderId 
               ? "Click 'Place Order' above to create your order first"
               : "Click to generate a QR code for mobile Google Pay payment"
             }
           </p>
        </div>
      )}
    </div>
  );
} 