/**
 * Utility functions for payment methods detection and handling
 */

export interface PaymentMethodAvailability {
  applePay: boolean;
  googlePay: boolean;
  canMakePayment: boolean;
}

/**
 * Detect if Apple Pay and Google Pay are available on the current device/browser
 */
export const detectPaymentMethods = (): PaymentMethodAvailability => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return {
      applePay: false,
      googlePay: false,
      canMakePayment: false,
    };
  }

  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  const isHttps = window.location.protocol === 'https:';

  // ✅ IMPROVED Apple Pay detection
  const applePaySessionSupported = 'ApplePaySession' in window;
  let applePaySupported = false;
  
  if (applePaySessionSupported) {
    try {
      // Check if Apple Pay can make payments
      applePaySupported = (window as any).ApplePaySession.canMakePayments();
      
      // Additional check for iOS devices
      if (!applePaySupported && /iPad|iPhone|iPod/.test(userAgent)) {
        applePaySupported = true; // iOS devices typically support Apple Pay
      }
    } catch (error) {
      console.log('Apple Pay detection error:', error);
      applePaySupported = false;
    }
  }

  // ✅ IMPROVED Google Pay detection
  const paymentRequestSupported = 'PaymentRequest' in window;
  let googlePaySupported = false;
  
  if (paymentRequestSupported) {
    try {
      // Check for Google Pay support
      googlePaySupported = (
        // Chrome/Chromium browsers
        userAgent.includes('Chrome') || 
        userAgent.includes('Chromium') ||
        // Android devices
        /Android/.test(userAgent) ||
        // Edge browser
        userAgent.includes('Edg') ||
        // Samsung Internet
        userAgent.includes('SamsungBrowser')
      );
      
      // Additional check for Android devices
      if (!googlePaySupported && /Android/.test(userAgent)) {
        googlePaySupported = true; // Android devices typically support Google Pay
      }
    } catch (error) {
      console.log('Google Pay detection error:', error);
      googlePaySupported = false;
    }
  }

  return {
    applePay: applePaySupported,
    googlePay: googlePaySupported,
    canMakePayment: applePaySupported || googlePaySupported,
  };
};

/**
 * Get the appropriate payment method display name
 */
export const getPaymentMethodDisplayName = (paymentMethodType: string): string => {
  switch (paymentMethodType) {
    case 'apple_pay':
      return 'Apple Pay';
    case 'google_pay':
      return 'Google Pay';
    case 'card':
      return 'Credit Card';
    default:
      return 'Digital Wallet';
  }
};

/**
 * Check if the current environment supports digital wallets
 */
export const isDigitalWalletSupported = (): boolean => {
  const { canMakePayment } = detectPaymentMethods();
  return canMakePayment;
};

/**
 * Get the recommended payment method based on device/browser
 */
export const getRecommendedPaymentMethod = (): string => {
  const { applePay, googlePay } = detectPaymentMethods();
  
  if (applePay) return 'apple_pay';
  if (googlePay) return 'google_pay';
  return 'card';
};



 