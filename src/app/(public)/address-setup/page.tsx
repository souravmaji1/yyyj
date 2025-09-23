"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AddressForm } from "@/src/components/profile/address-form";
import { useNotificationUtils } from "@/src/core/utils/notificationUtils";
import { useDispatch } from "react-redux";
import { saveUserAddress } from "@/src/store/slices/userSlice";
import { AppDispatch } from "@/src/store";
import { getClientCookie } from "@/src/core/config/localStorage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert";
import { Separator } from "@/src/components/ui/separator";
import { MapPin, AlertCircle } from "lucide-react";

export default function AddressSetupPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { showSuccess, showError } = useNotificationUtils();
  
  const redirectTo = searchParams?.get('redirect') || 'kyc';

  // Check if user is authenticated
  useEffect(() => {
    const token = getClientCookie("accessToken");
    if (!token) {
      router.push('/auth?mode=login');
      return;
    }
  }, [router]);

  const handleSaveAddress = async (addressData: any) => {
    try {
      await dispatch(saveUserAddress(addressData)).unwrap();
      showSuccess('Address Saved', 'Address saved successfully!');
      
      // Redirect based on the redirect parameter
      if (redirectTo === 'kyc') {
        router.push('/kyc');
      } else {
        router.push('/');
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to save address';
      showError('Save Failed', errorMessage);
    }
  };

  const handleSkip = () => {
    // Redirect to KYC without saving address
    if (redirectTo === 'kyc') {
      router.push('/kyc');
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-4 sm:p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Add Your Address</h1>
          <p className="text-slate-400">Complete your profile by adding your shipping address</p>
        </div>

        <Card className="bg-[var(--color-bg)] border-slate-700 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white">
            <div className="flex items-center gap-3">
              <MapPin className="h-6 w-6 text-white" />
              <div>
                <CardTitle>Shipping Address</CardTitle>
                <CardDescription className="text-blue-100">
                  Please provide your shipping address for deliveries
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <Alert className="bg-[var(--color-bg)] border-amber-500/50 text-amber-300 mx-6 mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Optional Step</AlertTitle>
            <AlertDescription>
              You can skip this step and add your address later. However, having a verified address ensures faster checkout and delivery.
            </AlertDescription>
          </Alert>

          <CardContent className="space-y-6 pt-6">
            <h2 className="sr-only">Address Form</h2>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white flex items-center gap-2">Address Information</h3>
              <Separator className="bg-[var(--color-bg)]" />
              
              <AddressForm
                onSave={handleSaveAddress}
                onCancel={handleSkip}
                isSubmitting={false}
                currentAddressesCount={0}
                existingAddressTypes={[]}
              />
              
              <div className="mt-6 text-center">
                <button
                  onClick={handleSkip}
                  className="text-slate-400 hover:text-slate-300 text-sm underline transition-colors"
                >
                  Skip for now - I'll add my address later
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 