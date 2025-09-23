"use client";
import React, { useState, useEffect } from "react";
import { QrCode } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import QRCodeDisplay from "@/src/components/kiosk/QRCodeDisplay";
import { getKioskMacFromLocalStorage, isKioskInterface } from "@/src/core/utils";

export default function ExploreAdSystemPage() {
    const [machineId, setMachineId] = useState<string | null>(null);

    useEffect(() => {
        // Get machine ID from localStorage or sessionStorage
        const machineId = getKioskMacFromLocalStorage();
        setMachineId(machineId);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg)] via-[var(--color-surface)] to-[var(--color-bg)]">
            {/* Main Content */}
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    <Card className="bg-[var(--color-surface)] border-[var(--color-secondary)]/30 shadow-2xl py-5">
                        <CardHeader className="text-center pb-8">
                            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full flex items-center justify-center mb-6">
                                <QrCode className="h-10 w-10 text-white" aria-hidden="true" />
                            </div>
                            <CardTitle className="text-4xl font-bold text-white mb-4">
                                Please Scan This QR Code
                            </CardTitle>
                            <CardDescription className="text-xl text-neutral-300 max-w-2xl mx-auto">
                                To explore our ad generation system and unlock powerful features
                            </CardDescription>
                        </CardHeader>

                        {isKioskInterface() && machineId && (
                            <QRCodeDisplay machineId={machineId} />
                        )}

                        {/* <CardContent className="text-center"> */}
                        {/* QR Code Display */}
                        {/* <div className="flex justify-center mb-8">
                                <div className="bg-white p-10 rounded-2xl shadow-lg">
                                    <div className="w-56 h-56 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                                        <div className="text-center">
                                            {isKioskInterface() && machineId && (
                                                <QRCodeDisplay machineId={machineId} />
                                            )}
                                            <p className="text-lg text-gray-500 font-medium">Please scan this QR code</p>
                                            <p className="text-sm text-gray-400 mt-1">to explore our ad generation system</p>
                                        </div>
                                    </div>
                                </div>
                            </div> */}

                        {/* <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
                                This QR code contains information about our advanced advertising platform.
                                Scan it with your device to discover AI-powered ad generation tools,
                                smart targeting capabilities, and comprehensive analytics for your campaigns.
                            </p>
                        </CardContent> */}
                    </Card>
                </div>
            </div>
        </div>
    );
}        