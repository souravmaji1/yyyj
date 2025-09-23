'use client';

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/store';
import { usePathname, useSearchParams } from 'next/navigation';
import { isKioskInterface } from '@/src/core/utils';

export interface CheckoutStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isAccessible: boolean;
  path: string;
}

export const useCheckoutProgress = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const { addresses, selectedAddressId } = useSelector((state: RootState) => state.user);
  const { paymentData, loading: paymentLoading } = useSelector((state: RootState) => state.payment);
  const { orderId } = useSelector((state: RootState) => state.order);
  const isUser = useSelector((state: RootState) => state.user.profile);

  const productType = searchParams?.get('productType') || 'physical';
  const hasPhysicalItems = cartItems.some(item => !item.isDigital);
  const hasDigitalItems = cartItems.some(item => item.isDigital);
  // Option A: If ANY item needs delivery, require address for entire order
  const hasRegularPhysicalItems = cartItems.some(item => !item.isDigital && item.soldBy !== 'Kiosk');

  const checkoutSteps: CheckoutStep[] = useMemo(() => {
    const steps: CheckoutStep[] = [
      {
        id: 'cart',
        title: 'Cart',
        description: 'Review your items',
        isCompleted: cartItems.length > 0,
        isCurrent: pathname === '/cart' || pathname === '/kiosk-cart',
        isAccessible: true,
        path: '/cart'
      },
    ];

    // Only add address step if there are regular physical items (not kiosk products) AND we're not on kiosk checkout page
    const isKioskCheckoutPage = pathname === '/kiosk-checkout';
    if ((hasRegularPhysicalItems || !hasPhysicalItems) && !isKioskCheckoutPage) {
      steps.push({
        id: 'address',
        title: 'Address',
        description: hasPhysicalItems ? 'Delivery address' : 'Billing address',
        isCompleted: hasPhysicalItems ? !!selectedAddressId : true,
        isCurrent: pathname === '/checkout' && hasPhysicalItems && !selectedAddressId,
        isAccessible: cartItems.length > 0,
        path: '/checkout?productType=' + productType
      });
    }

    steps.push(
      {
        id: 'payment',
        title: 'Payment',
        description: 'Choose payment method',
        isCompleted: !!paymentData?.url || !!orderId,
        isCurrent: (pathname === '/checkout' || pathname === '/kiosk-checkout') && (isKioskCheckoutPage || !hasPhysicalItems || (hasPhysicalItems && (!hasRegularPhysicalItems || !!selectedAddressId))),
        isAccessible: cartItems.length > 0 && (isKioskCheckoutPage || hasPhysicalItems ? (!hasRegularPhysicalItems || !!selectedAddressId) : true),
        path: '/checkout?productType=' + productType
      },
      {
        id: 'complete',
        title: 'Complete',
        description: 'Order confirmation',
        isCompleted: !!orderId && !paymentLoading,
        isCurrent: false,
        isAccessible: !!paymentData?.url || !!orderId,
        path: '/payment-success'
      }
    );

    // Determine current step and update accessibility
    let foundCurrent = false;
    return steps.map((step, index) => {
      // Mark as current if it's the first incomplete step and we haven't found a current step yet
      if (!foundCurrent && !step.isCompleted && step.isAccessible) {
        step.isCurrent = true;
        foundCurrent = true;
      } else if (step.isCurrent) {
        foundCurrent = true;
      } else {
        step.isCurrent = false;
      }

      // Update accessibility based on previous steps
      if (index > 0) {
        const previousStep = steps[index - 1];
        if (previousStep) {
          step.isAccessible = previousStep.isCompleted && step.isAccessible;
        }
      }

      return step;
    });
  }, [
    pathname,
    cartItems,
    selectedAddressId,
    paymentData,
    orderId,
    paymentLoading,
    productType,
    hasPhysicalItems,
    hasDigitalItems,
    hasRegularPhysicalItems
  ]);

  const currentStepIndex = useMemo(() => {
    return checkoutSteps.findIndex(step => step.isCurrent);
  }, [checkoutSteps]);

  const progressPercentage = useMemo(() => {
    const completedSteps = checkoutSteps.filter(step => step.isCompleted).length;
    
    if (checkoutSteps.length === 0) {
      return 0;
    }
    
    // The progress bar should represent the space between nodes.
    // e.g., for 4 steps, there are 3 segments.
    const segments = checkoutSteps.length - 1;
    if (segments <= 0) {
        return completedSteps > 0 ? 100 : 0;
    }

    // Calculate progress based on completed segments.
    // If 2 steps are complete, 1 segment is complete.
    const completedSegments = Math.max(0, completedSteps -1 );

    // If a step is in progress (current), show half of the next segment.
    const currentStep = checkoutSteps.find(step => step.isCurrent);
    const partialProgress = currentStep && !currentStep.isCompleted ? 0.5 : 0;
    
    const progress = (completedSegments + partialProgress) / segments;
    
    return Math.round(progress * 100);
  }, [checkoutSteps]);

  const canProceedToNextStep = useMemo(() => {
    const currentStep = checkoutSteps.find(step => step.isCurrent);
    if (!currentStep) return false;

    switch (currentStep.id) {
      case 'cart':
        return cartItems.length > 0;
      case 'address':
        return hasPhysicalItems ? !!selectedAddressId : true;
      case 'payment':
        return true; // Payment step is always accessible once we reach it
      default:
        return false;
    }
  }, [checkoutSteps, cartItems, selectedAddressId, hasPhysicalItems]);

  const getNextStep = () => {
    const currentIndex = currentStepIndex;
    if (currentIndex < checkoutSteps.length - 1) {
      return checkoutSteps[currentIndex + 1];
    }
    return null;
  };

  const getPreviousStep = () => {
    const currentIndex = currentStepIndex;
    if (currentIndex > 0) {
      return checkoutSteps[currentIndex - 1];
    }
    return null;
  };

  return {
    steps: checkoutSteps,
    currentStepIndex,
    progressPercentage,
    canProceedToNextStep,
    getNextStep,
    getPreviousStep,
    isUser,
    hasPhysicalItems,
    hasDigitalItems,
    productType
  };
}; 