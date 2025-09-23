"use client";

import KioskCheckout from "@/src/components/kiosk-checkout";
import { PaymentSocketProvider } from '@/src/contexts/PaymentSocketProvider';

export default function KioskCheckoutPage() {
    return (
        <PaymentSocketProvider>
            <KioskCheckout />
        </PaymentSocketProvider>
    )
} 