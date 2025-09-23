"use client";

import { useState, useEffect } from "react";
import { Icons } from "@/src/core/icons";
import { Dialog, DialogTitle, DialogContent } from "@/src/components/ui/dialog";
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from "@/src/store";
import { createTokenPayment } from '@/src/store/slices/paymentSlice';
import { fetchAdminSettings } from '@/src/store/slices/adminSettingSlice';
import { AdminSetting } from '@/src/store/slices/adminSettingSlice';
import { Button } from "@/src/components/ui/button";
import { usePaymentSocket } from '@/src/contexts/PaymentSocketProvider';
import { tokenPackages, TokenPackage } from "@/src/lib/tokens-config";
import { xutForUsd, XUT_LABEL } from "@/src/utils/xut";
import { useNotificationUtils } from "@/src/core/utils/notificationUtils";
import { X } from "lucide-react";

export default function TokenPurchasePage() {
    const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<string>("card");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [usdAmount, setUsdAmount] = useState<string>('');
    const [tokenAmount, setTokenAmount] = useState<string>('');
    const [isWaitingForPayment, setIsWaitingForPayment] = useState(false);
    const [paymentOptions, setPaymentOptions] = useState<{
        url: string;
        qrCode: string;
        paymentId: string;
    } | null>(null);

    const availableTokens = useSelector((state: RootState) => state.user.profile?.tokenBalance || 0);
    const userId = useSelector((state: RootState) => state.user.profile?.id);
    const adminSettings = useSelector((state: RootState) => state.adminSettings?.settings || []);
    const dispatch = useDispatch<AppDispatch>();
    const { joinPaymentRoom } = usePaymentSocket();
    const { showError, showWarning } = useNotificationUtils();

    // Get utility token value from admin settings
    const utilityTokenSetting = adminSettings.find((setting: AdminSetting) => setting.keyName === 'utilitytoken');
    const EXCHANGE_RATE = utilityTokenSetting?.keyValue || 1;

    // Fetch admin settings when modal opens
    useEffect(() => {
        if (isModalOpen) {
            dispatch(fetchAdminSettings());
        }
    }, [isModalOpen, dispatch]);

    const handleUsdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setUsdAmount(value);
        if (value) {
            const { total } = xutForUsd(parseFloat(value), 0);
            setTokenAmount(total.toString());
        } else {
            setTokenAmount('');
        }
    };

    const handlePackageSelect = (pkg: TokenPackage) => {
        if (!userId) {
            showError('Authentication Required', 'Please log in to purchase tokens');
            return;
        }
        
        handleTokenPurchase(pkg.usd, pkg.bonus);
    };

    const handleTokenPurchase = async (usdAmount: number, bonus: number) => {
        if (!userId) return;

        setIsProcessing(true);
        try {
            const { total } = xutForUsd(usdAmount, bonus as any);
            const payload = {
                userId,
                amount: usdAmount,
                currency: "usd",
                paymentType: "buyToken",
                tokenAmount: total
            };

            const result = await dispatch(createTokenPayment(payload)).unwrap();
            if (result.url && result.qrCode && result.paymentId) {
                setIsWaitingForPayment(true);
                setPaymentOptions({
                    url: result.url,
                    qrCode: result.qrCode,
                    paymentId: result.paymentId
                });
                setIsModalOpen(true);

                // Join payment room after QR code is generated
                if (userId) {
                    joinPaymentRoom(userId, result.paymentId);
                }
            }
        } catch (error) {
            showError('Payment Error', 'Failed to initiate payment. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePurchase = async () => {
        showWarning('Feature Unavailable', 'This feature is not available yet');
    };

    const handleBuyTokensInModal = async () => {
        if (!userId || !usdAmount || !tokenAmount) return;

        setIsProcessing(true);
        try {
            const payload = {
                userId,
                amount: parseFloat(usdAmount),
                currency: "usd",
                paymentType: "buyToken",
                tokenAmount: parseFloat(tokenAmount)
            };

            const result = await dispatch(createTokenPayment(payload)).unwrap();
            if (result.url && result.qrCode && result.paymentId) {
                setIsWaitingForPayment(true);
                setPaymentOptions({
                    url: result.url,
                    qrCode: result.qrCode,
                    paymentId: result.paymentId
                });

                // Join payment room after QR code is generated
                if (userId) {
                    joinPaymentRoom(userId, result.paymentId);
                }
            }
        } catch (error) {
            showError('Payment Error', 'Failed to initiate payment. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    // Use new token packages with calculated XUT amounts
    const updatedTokenPackages = tokenPackages.map(pkg => {
        const { total } = xutForUsd(pkg.usd, pkg.bonus);
        return {
            id: pkg.id,
            name: pkg.name,
            usd: pkg.usd,
            bonus: pkg.bonus,
            tokens: total,
            popular: pkg.popular || false,
            image: pkg.image
        };
    });

    return (
        <div className="min-h-screen bg-[var(--color-surface)]">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-primary)] py-20 motion-fade-down">
                <div className="absolute inset-0 bg-[url('/gaming-pattern.svg')] opacity-10" />
                <div className="container mx-auto px-6 relative z-10 text-center mt-6">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 motion-fade-up">
                        Purchase <span aria-label="X Universe Token">XUT</span>
                    </h1>
                    <p className="text-xl text-white/80 max-w-2xl mx-auto motion-fade-up motion-delay-100">
                        Get {XUT_LABEL} to unlock exclusive features, purchase items, and enhance your gaming experience
                    </p>
                </div>
            </div>

            {/* Add Tokens Button */}
            <div className="container mx-auto px-4 py-4 flex justify-end">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 hover:scale-105 hover:shadow-lg hover:shadow-[var(--color-primary)]/25 transition-all duration-300 text-white px-8 py-3 rounded-lg font-medium"
                >
                    + Add {XUT_LABEL}
                </button>
            </div>

            <div className="container mx-auto px-4 py-12 pt-0">
                {/* Token Packages Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {updatedTokenPackages.map((pkg) => (
                        <button
                            key={pkg.id}
                            onClick={() => handlePackageSelect(pkg)}
                            disabled={isProcessing}
                            className="group block relative bg-[var(--color-surface)]/50 backdrop-blur-sm rounded-xl border border-[#667085]/20 transition-all duration-200 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)] hover:border-[var(--color-primary)]/30 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed w-full text-left"
                            aria-label={`Purchase ${pkg.tokens.toLocaleString()} ${XUT_LABEL} for $${pkg.usd}`}
                        >
                            <article>
                                {pkg.popular && (
                                    <div className="absolute top-4 right-4 bg-[var(--color-primary)] text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                                        POPULAR
                                    </div>
                                )}

                                <div className="aspect-video relative">
                                    <img
                                        src={pkg.image}
                                        alt={`${pkg.tokens.toLocaleString()} ${XUT_LABEL} Package`}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface)] to-transparent" />
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-white mb-4">{pkg.name}</h3>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Icons.token className="h-6 w-6 text-[var(--color-primary)]" />
                                        <span className="text-2xl font-bold text-white">{pkg.tokens.toLocaleString()}</span>
                                        <span className="text-white/80" aria-label={XUT_LABEL}>XUT</span>
                                    </div>

                                    <div className="flex items-baseline gap-2 mb-6">
                                        <span className="text-3xl font-bold text-white">${pkg.usd}</span>
                                        <span className="text-gray-400">USD</span>
                                    </div>
                                    
                                    {pkg.bonus > 0 && (
                                        <p className="text-xs text-green-400 mb-4">
                                            Includes {(pkg.bonus*100)|0}% bonus
                                            <span className="sr-only"> ({Math.round((pkg.tokens * pkg.bonus) / (1 + pkg.bonus))} extra {XUT_LABEL})</span>
                                        </p>
                                    )}
                                </div>
                            </article>
                        </button>
                    ))}
                </div>

                {/* Token Purchase Modal */}
                {isModalOpen && (
                    <Dialog
                        open={isModalOpen}
                        onOpenChange={(open) => {
                            setIsModalOpen(open);
                            if (!open) {
                                setPaymentOptions(null);
                                setIsWaitingForPayment(false);
                                setIsProcessing(false);
                            }
                        }}
                    >
                        <DialogContent
                            className="sm:max-w-[500px] bg-[var(--color-surface)]/90 border border-[var(--color-primary)]/40 shadow-2xl backdrop-blur-lg max-h-[90vh] overflow-y-auto rounded-2xl p-8 animate-fade-in [&>button]:hidden"
                            onPointerDownOutside={(e) => {
                                e.preventDefault();
                            }}
                            onEscapeKeyDown={(e) => {
                                e.preventDefault();
                            }}
                        >
                            <div className="text-white relative">
                                <div className="flex items-center justify-between mb-4 bg-transparent py-2 z-10">
                                    <DialogTitle className="text-2xl font-bold text-white">Add {XUT_LABEL}</DialogTitle>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setPaymentOptions(null);
                                            setIsWaitingForPayment(false);
                                        }}
                                        className="text-white font-bold hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>
                                <div className="border-b border-[#667085]/30 mb-6" />
                                <div className="max-h-[calc(90vh-120px)]">
                                    {isWaitingForPayment ? (
                                        <div className="text-center">
                                            <h3 className="text-xl font-bold text-white mb-6">Choose Payment Method</h3>
                                            {paymentOptions && (
                                                <div className="grid grid-cols-1 gap-6 mb-8">
                                                    {/* QR Code */}
                                                    <div className="bg-[var(--color-panel)] rounded-xl p-6 text-center border border-[#667085]/20">
                                                        <h4 className="text-white font-medium mb-4">Scan QR Code</h4>
                                                        <div className="bg-white p-3 rounded-lg inline-block">
                                                            <img
                                                                src={paymentOptions.qrCode}
                                                                alt="Payment QR Code"
                                                                className="w-48 h-48 object-contain"
                                                            />
                                                        </div>
                                                        <p className="text-gray-400 mt-4">Scan with your mobile payment app</p>
                                                    </div>
                                                    {/* Payment URL */}
                                                    <div className="bg-[var(--color-panel)] rounded-xl p-6 text-center border border-[#667085]/20">
                                                        <h4 className="text-white font-medium mb-4">Pay Online</h4>
                                                        <p className="text-gray-400 mb-6">Click the button below to complete your payment</p>
                                                        <Button
                                                            onClick={() => {
                                                                window.open(paymentOptions.url, '_self');
                                                                setIsModalOpen(false);
                                                            }}
                                                            className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 text-white py-3"
                                                        >
                                                            Pay Now
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                            {/* <div className="w-16 h-16 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Icons.spinner className="h-8 w-8 text-[var(--color-primary)] animate-spin" />
                                            </div> */}
                                            <p className="text-gray-400">Waiting for payment confirmation...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="text-gray-300 mb-6">Available Balance: {availableTokens} <span aria-label={XUT_LABEL}>XUT</span></div>

                                            <div className="mb-6">
                                                <label className="block text-gray-400 text-sm font-medium mb-2">Amount in USD</label>
                                                <input
                                                    type="number"
                                                    value={usdAmount}
                                                    onChange={handleUsdChange}
                                                    placeholder="Enter USD amount"
                                                    className="w-full px-4 py-3 bg-[var(--color-panel)] text-white border border-[#667085]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                />
                                            </div>

                                            <div className="mb-8">
                                                <label className="block text-gray-400 text-sm font-medium mb-2">Amount in {XUT_LABEL}</label>
                                                <input
                                                    type="number"
                                                    value={tokenAmount}
                                                    placeholder={`Equivalent ${XUT_LABEL}`}
                                                    className="w-full px-4 py-3 bg-[var(--color-panel)] text-white border border-[#667085]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    readOnly
                                                />
                                            </div>

                                            <button
                                                onClick={handleBuyTokensInModal}
                                                className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 transition-all text-white px-4 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                disabled={!usdAmount || !tokenAmount || isProcessing}
                                            >
                                                {isProcessing ? (
                                                    <>
                                                        <Icons.spinner className="h-5 w-5 animate-spin" />
                                                        <span>Processing...</span>
                                                    </>
                                                ) : (
                                                    `Buy ${XUT_LABEL}`
                                                )}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
    );
} 