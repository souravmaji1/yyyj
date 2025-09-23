'use client';

import { PaymentSocketProvider } from '@/src/contexts/PaymentSocketProvider';
import PaymentStatus from './PaymentStatus';

export default function PaymentSuccessPage() {
    return (
        <PaymentSocketProvider>
            <PaymentStatus />
        </PaymentSocketProvider>
    );
}
