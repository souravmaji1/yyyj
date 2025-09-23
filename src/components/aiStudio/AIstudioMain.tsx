"use client";
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/components/ui/tabs"; 
import { isKioskInterface, getKioskMacFromLocalStorage } from "@/src/core/utils";
import AIStudioQRCode from "@/src/components/kiosk/AIStudioQRCode";
import AdImageGenerator from "@/src/components/aiStudio/AdImageGenerator";   
import { motion } from "framer-motion";

export default function AIStudioPage() {
  const machineId = getKioskMacFromLocalStorage();
  const [activeMainTab, setActiveMainTab] = useState("ads");

  // Detect if we're in kiosk mode
  const isKiosk = isKioskInterface();

  // If in kiosk mode, show QR code instead of AI Studio interface
  if (isKiosk) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-white">
        {/* Hero Section for Kiosk Mode */}
        <div className="relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-secondary)] to-[#0F172A] opacity-20"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>

          {/* Added responsive padding for safe viewport margins */}
          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto"
            >
              {/* Responsive heading scaling */}
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent mb-6">
                AI Studio Kiosk Access
              </h1>
              {/* Responsive paragraph scaling */}
              <p className="text-base sm:text-lg md:text-2xl text-gray-300 mb-8 leading-relaxed">
                Scan the QR code below to access AI Studio features and create stunning kiosk advertisements from your mobile device.
              </p>
              <div className="inline-flex items-center gap-2 text-lg text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-4 py-2 rounded-full">
                <span className="w-3 h-3 bg-[var(--color-primary)] rounded-full animate-pulse"></span>
                Kiosk Mode Active
              </div>
            </motion.div>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <AIStudioQRCode machineId={machineId || undefined} />
        </div>
      </div>
    );
  }

  // Regular website mode - show normal AI Studio interface
  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-secondary)] to-[#0F172A] opacity-20"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            {/* Responsive heading scaling */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent mb-6">
              Unleash AI Creativity
            </h1>
            {/* Responsive paragraph scaling */}
            <p className="text-base sm:text-lg md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Generate stunning ad creatives and marketing visuals in seconds.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-semibold text-lg rounded-full shadow-2xl hover:shadow-[#3B82F6]/25 transition-all duration-300 hover:from-[#2563EB] hover:to-[#7C3AED]"
              aria-label="Generate creatives"
            >
              Generate Your Creatives Now
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="w-full max-w-7xl mx-auto">
          <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
            {/* Tabs stack vertically on mobile */}
            <TabsList className="flex flex-col sm:flex-row w-full mb-8 bg-[rgba(255,255,255,0.05)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] rounded-full p-1" aria-label="AI Studio sections">
              <TabsTrigger
                value="ads"
                className="flex-1 w-full rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--color-primary)] data-[state=active]:to-[var(--color-secondary)] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                Ad and Image Generator
              </TabsTrigger>
              <TabsTrigger
                value="merch"
                className="flex-1 w-full rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--color-primary)] data-[state=active]:to-[var(--color-secondary)] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 mt-1 sm:mt-0"
              >
                Design Your Merch
              </TabsTrigger>

            </TabsList>
            <TabsContent value="ads" className="w-full">
              <AdImageGenerator />
            </TabsContent>

            <TabsContent value="merch" className="flex justify-center">
              <div className="w-full max-w-2xl bg-[rgba(255,255,255,0.05)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] rounded-2xl p-8 text-center shadow-2xl">
                <div className="text-4xl sm:text-5xl md:text-6xl mb-4">🎨</div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white">Design Your Merch</h2>
                <p className="text-base sm:text-lg text-gray-300 mb-6">Use AI to design T-shirts, hoodies & more—get them printed and shipped.</p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-semibold rounded-lg hover:from-[#0291D8] hover:to-[#2524A3] transition-all duration-300"
                  aria-label="Start designing merch"
                >
                  Start Designing
                </motion.button>
              </div>
            </TabsContent>


          </Tabs>
        </div>
      </div>

    </div>
  );
}