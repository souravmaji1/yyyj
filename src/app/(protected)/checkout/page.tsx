"use client"

import Checkout from "@/src/components/checkout"
import { PaymentSocketProvider } from '@/src/contexts/PaymentSocketProvider';
import StripeProvider from '@/src/components/checkout/StripeProvider';

export default function CheckoutPage() {
    return (
        <StripeProvider>
            <PaymentSocketProvider>
                <Checkout />
            </PaymentSocketProvider>
        </StripeProvider>
    )
}