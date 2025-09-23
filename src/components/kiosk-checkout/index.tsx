import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from "@/src/store";
import { useRouter, useSearchParams } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import CheckoutProgress from "../ui/checkoutProgress";
import OrderSummaryKiosk from "./orderSummaryKiosk";
import { useCheckoutProgress } from "@/src/hooks/useCheckoutProgress";
import { fetchUserAddresses } from "@/src/store/slices/userSlice";

const KioskCheckout = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<'physical' | 'digital'>('physical');
  const productType = searchParams?.get('productType');
  
  const kioskCartItems = useSelector((state: RootState) => state.kioskCart.items);
  
  // Use the dynamic checkout progress hook (automatically handles kiosk flow)
  const {
    steps: checkoutSteps,
    currentStepIndex,
    progressPercentage,
    canProceedToNextStep,
    getNextStep,
    hasPhysicalItems,
    hasDigitalItems
  } = useCheckoutProgress();

  useEffect(() => {
    // Fetch user addresses (even though not needed for kiosk, keeps consistency)
    dispatch(fetchUserAddresses());
    setActiveTab(productType === 'physical' ? 'physical' : 'digital');
  }, [dispatch, productType]);

  // Redirect to kiosk cart if no items
  if (kioskCartItems.length === 0) {
    router.push('/kiosk-cart');
    return null;
  }

  return (
    <div className="mx-auto py-8 md:py-16 px-4 min-h-screen bg-[var(--color-surface)]">
      {/* Dynamic Checkout Progress */}
      <CheckoutProgress
        steps={checkoutSteps}
        progressPercentage={progressPercentage}
        className="mb-8"
      />

      <h1 className="text-3xl font-bold mb-8 text-white flex items-center">
        <ShoppingBag className="h-8 w-8 text-[var(--color-primary)] mr-3" />
        Kiosk Checkout
      </h1>

      {/* Product Type Tab */}
      <div className="mb-6">
        <button className="px-6 py-3 rounded-lg font-medium transition-colors bg-[var(--color-primary)] text-white">
          Kiosk Products
        </button>
      </div>

      {/* Use the dedicated OrderSummaryKiosk component */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:col-span-2">
          <OrderSummaryKiosk activeTab={activeTab} />
        </div>
      </div>
    </div>
  );
};

export default KioskCheckout; 