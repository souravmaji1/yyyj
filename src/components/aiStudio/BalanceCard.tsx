"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { motion } from "framer-motion";
import { aiStudioCostsService, AIStudioCosts } from "@/src/app/apis/aiStudioCostsService";

export default function BalanceCard() {
    const { profile } = useSelector((state: RootState) => state.user);
    const [costs, setCosts] = useState<AIStudioCosts>({
        imageCost: 15,
        videoCost: 25,
        enhancementCost: 10,
        downloadCost: 5,
        faceSwapCost: 18,
        audioCost: 20,
        audiobookCost: 30,
        threeDCost: 30
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCosts = async () => {
            try {
                setLoading(true);
                const fetchedCosts = await aiStudioCostsService.getAIStudioCosts();
                setCosts(fetchedCosts);
            } catch (error) {
                console.error('Failed to fetch AI Studio costs:', error);
                // Keep default costs on error
            } finally {
                setLoading(false);
            }
        };

        fetchCosts();
    }, []);

    const handlePurchaseTokens = () => {
        // TODO: Implement token purchase flow
        console.log("Navigate to token purchase");
    };

    const getBalanceStatus = () => {
        const balance = profile?.tokenBalance || 0;
        if (balance >= 100) return { color: 'text-green-400', status: 'Excellent' };
        if (balance >= 50) return { color: 'text-yellow-400', status: 'Good' };
        if (balance >= 20) return { color: 'text-orange-400', status: 'Low' };
        return { color: 'text-red-400', status: 'Critical' };
    };

    const balanceStatus = getBalanceStatus();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[rgba(255,255,255,0.05)] backdrop-blur-xl rounded-2xl p-6 border border-[rgba(255,255,255,0.1)] shadow-2xl"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">XUT Balance</h3>
                <div className={`text-xs font-medium px-2 py-1 rounded-full bg-[rgba(255,255,255,0.05)] ${balanceStatus.color}`}>
                    {balanceStatus.status}
                </div>
            </div>

            {/* Balance Display */}
            <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold text-white">{profile?.tokenBalance || 0}</span>
                    <span className="text-lg text-gray-400">XUT</span>
                </div>
                <p className="text-sm text-gray-400">
                    Available for AI generation and downloads
                </p>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePurchaseTokens}
                    className="w-full py-3 px-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:from-[#0291D8] hover:to-[#2524A3] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    Purchase XUT
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-4 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-gray-300 hover:text-white hover:border-[rgba(255,255,255,0.2)] rounded-xl font-medium transition-all duration-300"
                >
                    View Transaction History
                </motion.button>
            </div>

            {/* Balance Info */}
            <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.1)]">
                <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                        <p className="text-gray-400 mb-1">Image Generation</p>
                        <p className="text-white font-medium">
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></div>
                            ) : (
                                `${costs.imageCost} XUT`
                            )}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-400 mb-1">Video Generation</p>
                        <p className="text-white font-medium">
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></div>
                            ) : (
                                `${costs.videoCost} XUT`
                            )}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-400 mb-1">Image Enhancement</p>
                        <p className="text-white font-medium">
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></div>
                            ) : (
                                `${costs.enhancementCost} XUT`
                            )}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-400 mb-1">Face Swap</p>
                        <p className="text-white font-medium">
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></div>
                            ) : (
                                `${costs.faceSwapCost} XUT`
                            )}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-400 mb-1">Audio Generation</p>
                        <p className="text-white font-medium">
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></div>
                            ) : (
                                `${costs.audioCost} XUT`
                            )}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-400 mb-1">Audiobook</p>
                        <p className="text-white font-medium">
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></div>
                            ) : (
                                `${costs.audiobookCost} XUT`
                            )}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-400 mb-1">3D Generation</p>
                        <p className="text-white font-medium">
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></div>
                            ) : (
                                `${costs.threeDCost} XUT`
                            )}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-400 mb-1">Download</p>
                        <p className="text-white font-medium">
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></div>
                            ) : (
                                `${costs.downloadCost} XUT`
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
