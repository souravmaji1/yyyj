import { useNotification } from '@/src/contexts/NotificationContext';

// Predefined notification messages for common actions
export const NOTIFICATION_MESSAGES = {
  CART: {
    ADDED: {
      title: 'Added to Cart!',
      message: 'Item has been successfully added to your shopping cart.'
    },
    REMOVED: {
      title: 'Removed from Cart',
      message: 'Item has been removed from your shopping cart.'
    },
    UPDATED: {
      title: 'Cart Updated',
      message: 'Your cart has been updated successfully.'
    },
    OUT_OF_STOCK: {
      title: 'Out of Stock',
      message: 'This item is currently out of stock.'
    }
  },
  PAYMENT: {
    SUCCESS: {
      title: 'Payment Successful!',
      message: 'Your payment has been processed successfully.'
    },
    FAILED: {
      title: 'Payment Failed',
      message: 'Payment could not be processed. Please try again.'
    },
    PROCESSING: {
      title: 'Processing Payment',
      message: 'Your payment is being processed. Please wait...'
    }
  },
  ORDER: {
    CREATED: {
      title: 'Order Created!',
      message: 'Your order has been created successfully.'
    },
    UPDATED: {
      title: 'Order Updated',
      message: 'Your order has been updated.'
    },
    CANCELLED: {
      title: 'Order Cancelled',
      message: 'Your order has been cancelled.'
    }
  },
  AUTH: {
    LOGIN_SUCCESS: {
      title: 'Welcome Back!',
      message: 'You have been successfully logged in.'
    },
    LOGOUT_SUCCESS: {
      title: 'Logged Out',
      message: 'You have been successfully logged out.'
    },
    REGISTER_SUCCESS: {
      title: 'Account Created!',
      message: 'Your account has been created successfully.'
    }
  },
  GENERAL: {
    SUCCESS: {
      title: 'Success!',
      message: 'Operation completed successfully.'
    },
    ERROR: {
      title: 'Error',
      message: 'Something went wrong. Please try again.'
    },
    INFO: {
      title: 'Information',
      message: 'Here is some important information.'
    },
    WARNING: {
      title: 'Warning',
      message: 'Please be careful with this action.'
    }
  }
};

// Hook for easy notification usage
export const useNotificationUtils = () => {
  const { showNotification } = useNotification();

  const showSuccess = (title: string, message?: string, duration?: number) => {
    showNotification({
      type: 'success',
      title,
      message,
      duration
    });
  };

  const showError = (title: string, message?: string, duration?: number) => {
    showNotification({
      type: 'error',
      title,
      message,
      duration
    });
  };

  const showInfo = (title: string, message?: string, duration?: number) => {
    showNotification({
      type: 'info',
      title,
      message,
      duration
    });
  };

  const showWarning = (title: string, message?: string, duration?: number) => {
    showNotification({
      type: 'warning',
      title,
      message,
      duration
    });
  };

  // Predefined notification methods
  const showCartAdded = () => {
    showSuccess(
      NOTIFICATION_MESSAGES.CART.ADDED.title,
      NOTIFICATION_MESSAGES.CART.ADDED.message
    );
  };

  const showCartRemoved = () => {
    showInfo(
      NOTIFICATION_MESSAGES.CART.REMOVED.title,
      NOTIFICATION_MESSAGES.CART.REMOVED.message
    );
  };

  const showOutOfStock = () => {
    showWarning(
      NOTIFICATION_MESSAGES.CART.OUT_OF_STOCK.title,
      NOTIFICATION_MESSAGES.CART.OUT_OF_STOCK.message
    );
  };

  const showPaymentSuccess = () => {
    showSuccess(
      NOTIFICATION_MESSAGES.PAYMENT.SUCCESS.title,
      NOTIFICATION_MESSAGES.PAYMENT.SUCCESS.message
    );
  };

  const showPaymentFailed = () => {
    showError(
      NOTIFICATION_MESSAGES.PAYMENT.FAILED.title,
      NOTIFICATION_MESSAGES.PAYMENT.FAILED.message
    );
  };

  const showOrderCreated = () => {
    showSuccess(
      NOTIFICATION_MESSAGES.ORDER.CREATED.title,
      NOTIFICATION_MESSAGES.ORDER.CREATED.message
    );
  };

  const showLoginSuccess = () => {
    showSuccess(
      NOTIFICATION_MESSAGES.AUTH.LOGIN_SUCCESS.title,
      NOTIFICATION_MESSAGES.AUTH.LOGIN_SUCCESS.message
    );
  };

  const showLogoutSuccess = () => {
    showInfo(
      NOTIFICATION_MESSAGES.AUTH.LOGOUT_SUCCESS.title,
      NOTIFICATION_MESSAGES.AUTH.LOGOUT_SUCCESS.message
    );
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showCartAdded,
    showCartRemoved,
    showOutOfStock,
    showPaymentSuccess,
    showPaymentFailed,
    showOrderCreated,
    showLoginSuccess,
    showLogoutSuccess,
    NOTIFICATION_MESSAGES
  };
}; 