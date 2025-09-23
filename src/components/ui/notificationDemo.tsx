'use client';

import { Button } from './button';
import { useNotificationUtils } from '@/src/core/utils/notificationUtils';
import { useCartNotification } from '@/src/hooks/useCartNotification';

const NotificationDemo = () => {
  const { 
    showSuccess, 
    showError, 
    showInfo, 
    showWarning,
    showCartAdded,
    showPaymentSuccess,
    showOrderCreated,
    showLoginSuccess
  } = useNotificationUtils();

  const { showCartNotification } = useCartNotification();

  const handleShowCartNotification = () => {
    showCartNotification({
      title: 'Gaming Headset Pro',
      image: '/placeholder.png',
      price: 99.99,
      tokenPrice: 150.50,
      quantity: 1
    });
  };

  return (
    <div className="p-6 bg-gray-900 rounded-lg space-y-4">
      <h2 className="text-xl font-bold text-white mb-4">Notification System Demo</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Button 
          onClick={() => showSuccess('Custom Success', 'This is a custom success message!')}
          className="bg-green-600 hover:bg-green-700"
        >
          Success
        </Button>
        
        <Button 
          onClick={() => showError('Custom Error', 'This is a custom error message!')}
          className="bg-red-600 hover:bg-red-700"
        >
          Error
        </Button>
        
        <Button 
          onClick={() => showInfo('Custom Info', 'This is a custom info message!')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Info
        </Button>
        
        <Button 
          onClick={() => showWarning('Custom Warning', 'This is a custom warning message!')}
          className="bg-yellow-600 hover:bg-yellow-700"
        >
          Warning
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Button 
          onClick={showCartAdded}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Cart Added
        </Button>
        
        <Button 
          onClick={showPaymentSuccess}
          className="bg-green-600 hover:bg-green-700"
        >
          Payment Success
        </Button>
        
        <Button 
          onClick={showOrderCreated}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Order Created
        </Button>
        
        <Button 
          onClick={showLoginSuccess}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Login Success
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <Button 
          onClick={handleShowCartNotification}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        >
          Show Cart Notification (with Product Details)
        </Button>
      </div>
    </div>
  );
};

export default NotificationDemo; 