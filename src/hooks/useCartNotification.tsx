'use client';

import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/store';
import CartNotification from '@/src/components/ui/cartNotification';

interface CartNotificationData {
  product: {
    title: string;
    image?: string;
    price: number;
    tokenPrice?: number;
    quantity: number;
  };
  isVisible: boolean;
}

export const useCartNotification = () => {
  const [cartNotification, setCartNotification] = useState<CartNotificationData | null>(null);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const cartCount = cartItems.length;

  const showCartNotification = useCallback((product: {
    title: string;
    image?: string;
    price: number;
    tokenPrice?: number;
    quantity: number;
  }) => {
    setCartNotification({
      product,
      isVisible: true
    });
  }, []);

  const hideCartNotification = useCallback(() => {
    setCartNotification(prev => prev ? { ...prev, isVisible: false } : null);
  }, []);

  const CartNotificationComponent = () => {
    if (!cartNotification) return null;

    return (
      <CartNotification
        product={cartNotification.product}
        cartCount={cartCount}
        isVisible={cartNotification.isVisible}
        onClose={hideCartNotification}
        duration={3000}
      />
    );
  };

  return {
    showCartNotification,
    hideCartNotification,
    CartNotificationComponent
  };
}; 