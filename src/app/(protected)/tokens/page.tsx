"use client"

import TokenPurchasePage from "@/src/components/token-purchase"
import { PaymentSocketProvider } from '@/src/contexts/PaymentSocketProvider';

export default function TokenPurchaseAppPage() {
    return (
        <PaymentSocketProvider>
            <TokenPurchasePage />
        </PaymentSocketProvider>
    )
}