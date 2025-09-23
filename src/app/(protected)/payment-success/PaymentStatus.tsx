'use client';

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { usePaymentSocket } from '@/src/contexts/PaymentSocketProvider';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/src/store';
import { AppDispatch } from '@/src/store';
import { clearPayment } from '@/src/store/slices/paymentSlice';
import { useNotificationUtils } from '@/src/core/utils/notificationUtils';
import { clearCart } from "@/src/store/slices/cartSlice";
import { fetchWalletBalance } from '@/src/store/slices/userSlice';

const PaymentStatus = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [countdown, setCountdown] = useState(5);
    const [currentStatus, setCurrentStatus] = useState<string | null>(null);
    const { socket } = usePaymentSocket();
    const userId = useSelector((state: RootState) => state.user.profile?.id);
    const dispatch = useDispatch<AppDispatch>();
    const { showSuccess, showError, showInfo } = useNotificationUtils();

    const paymentId = searchParams?.get("paymentId");
    const initialStatus = searchParams?.get("status")?.toLowerCase();
    const orderType = searchParams?.get("orderType");
    useEffect(() => {

        userId && dispatch(fetchWalletBalance(userId));

        if (!paymentId || !initialStatus) {
            if (orderType === "buyProduct") {
                router.push("/shop")
            } else {
                router.push("/");
                return;
            }
        }

        if (orderType === "buyProduct") {
            dispatch(clearCart());
        }

        // Set initial status
        initialStatus && setCurrentStatus(initialStatus);

        // Listen for payment status updates
        if (socket && userId) {
            socket.on('paymentStatusUpdate', (data: {
                session_id: string;
                status: string;
                userId: string;
                paymentId: string;
                forpayment: string;
            }) => {

                console.log("fataat", data)
                // Clear payment data when any socket event is received
                dispatch(clearPayment());

                if (data.userId === userId && data.paymentId === paymentId) {
                    let newStatus = 'pending';
                    if (data.status === 'paid' || data.status === 'succeeded') {
                        newStatus = 'completed';
                        showSuccess('Payment Successful', 'Payment successful done!');
                    } else if (data.status === 'cancelled' || data.status === 'failes') {
                        newStatus = 'failed';
                        showError('Payment Failed', 'Payment failed. Please try again.');
                    } else {
                        showInfo('Payment Processing', 'Payment is being processed...');
                    }
                    setCurrentStatus(newStatus);
                }
            });
        }

        // Start countdown only for completed or failed status
        if (initialStatus === 'completed' || initialStatus === 'failed' || initialStatus === 'paid') {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        // Redirect based on order type and status
                        if (initialStatus === currentStatus) {
                            switch (orderType) {
                                case "buyProduct":
                                    router.push("/shop");
                                    break;
                                case "app_token":
                                    router.push("/tokens");
                                    break;
                                default:
                                    router.push("/");
                            }
                        } else {
                            if (orderType === "buyProduct") {
                                router.push("/shop");
                            } else {
                                router.push("/");
                            }
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => {
                clearInterval(timer);
                if (socket) {
                    socket.off('paymentStatusUpdate');
                }
            };
        }

        return () => {
            if (socket) {
                socket.off('paymentStatusUpdate');
            }
        };
    }, [paymentId, initialStatus, orderType, router, socket, userId, dispatch]);

    const getStatusConfig = () => {
        const status = currentStatus || initialStatus;
        switch (status) {
            case "completed":
                return {
                    icon: <CheckCircle2 className="w-16 h-16 text-green-500" />,
                    title: "Payment Successful!",
                    message: "Your payment has been processed successfully.",
                    bgColor: "bg-green-500/10",
                    borderColor: "border-green-500/20",
                };
            case "paid":
                return {
                    icon: <CheckCircle2 className="w-16 h-16 text-green-500" />,
                    title: "Payment Successful!",
                    message: "Your payment has been processed successfully.",
                    bgColor: "bg-green-500/10",
                    borderColor: "border-green-500/20",
                };
            case "failed":
                return {
                    icon: <XCircle className="w-16 h-16 text-red-500" />,
                    title: "Payment Failed",
                    message: "We couldn't process your payment. Payment failed.",
                    bgColor: "bg-red-500/10",
                    borderColor: "border-red-500/20",
                };
            case "pending":
                return {
                    icon: <Clock className="w-16 h-16 text-yellow-500" />,
                    title: "Payment Pending",
                    message: "Your payment is being processed. We will update you once it is completed.",
                    bgColor: "bg-yellow-500/10",
                    borderColor: "border-yellow-500/20",
                };
            default:
                return {
                    icon: <XCircle className="w-16 h-16 text-gray-500" />,
                    title: "Invalid Status",
                    message: "Something went wrong. Please contact support.",
                    bgColor: "bg-gray-500/10",
                    borderColor: "border-gray-500/20",
                };
        }
    };

    const statusConfig = getStatusConfig();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`max-w-md w-full p-8 rounded-2xl ${statusConfig.bgColor} border ${statusConfig.borderColor} shadow-xl`}
            >
                <div className="flex flex-col items-center text-center space-y-6">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                    >
                        {statusConfig.icon}
                    </motion.div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-white">{statusConfig.title}</h1>
                        <p className="text-gray-300">{statusConfig.message}</p>
                    </div>

                    <div className="w-full space-y-4">
                        <div className="text-sm text-gray-400">
                            Payment ID: {paymentId}
                        </div>

                        {
                            (currentStatus === 'completed' || currentStatus === 'failed' || currentStatus === "paid") && (
                                <div className="text-sm text-gray-400">
                                    Redirecting in {countdown} seconds...
                                </div>
                            )
                        }

                        <div className="text-xs text-gray-500 mt-4">
                            Please don't close or refresh this window
                        </div>
                    </div >
                </div >
            </motion.div >
        </div >
    );
};

export default PaymentStatus; 