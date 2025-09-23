'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";
import { motion } from "framer-motion";

const PaymentFailed = () => {
    const router = useRouter();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    router.push("/");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full p-8 rounded-2xl bg-red-500/10 border border-red-500/20 shadow-xl"
            >
                <div className="flex flex-col items-center text-center space-y-6">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                    >
                        <XCircle className="w-16 h-16 text-red-500" />
                    </motion.div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-white">Payment Failed</h1>
                        <p className="text-gray-300">We couldn't process your payment. Please try again.</p>
                    </div>

                    <div className="w-full space-y-4">
                        <div className="text-sm text-gray-400">
                            Redirecting to home page in {countdown} seconds...
                        </div>

                        <div className="text-xs text-gray-500 mt-4">
                            Please don't close or refresh this window
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PaymentFailed;
