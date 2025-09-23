"use client"
import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { KYCModal } from "@/src/components/modals/kyc-modal";

export default function KycExample() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-4 sm:p-6 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">
          KYC Verification Demo
        </h1>
        <p className="text-gray-400">
          Click the button below to open KYC verification modal
        </p>
      </div>
      
      <div className="max-w-md mx-auto">
        {/* Complete KYC Button */}
        <Button 
          onClick={handleOpenModal} 
          className="w-full h-12 text-lg"
          size="lg"
        >
          Complete KYC
        </Button>
      </div>

      {/* KYC Modal */}
      <KYCModal 
        open={isModalOpen} 
        onClose={handleCloseModal} 
      />
    </div>
  );
}
