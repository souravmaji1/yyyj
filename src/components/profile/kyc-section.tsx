"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";
import { Button } from "@/src/components/ui/button";
import { KYCStatusBadge } from "@/src/components/auth/kyc-status-badge";
import { KYCModal } from "@/src/components/modals/kyc-modal";

export function KYCSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const user = useSelector((state: RootState) => state.user.profile);

  if (!user) return null;

  const isCompleted = user.isKycCompleted || user.kycStatus === "verified";

  // Don't show anything if KYC is completed
  if (isCompleted) {
    return null;
  }

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border border-amber-400 bg-amber-50 p-4 text-amber-800 kyc-section">
        <div className="kyc-content flex-1">
          <p className="text-sm font-medium text-amber-900 kyc-text">Complete your KYC verification to unlock all features.</p>
        </div>
        <div className="mt-3 sm:mt-0 flex justify-end w-full sm:w-auto">
          <Button 
            size="sm" 
            onClick={handleOpenModal}
            className="bg-[var(--color-secondary)] text-white hover:bg-[var(--color-primary)] hover:scale-105 transition-all duration-200 hover:shadow-md kyc-button"
          >
            Complete KYC
          </Button>
        </div>
      </div>

      {/* KYC Modal */}
      <KYCModal 
        open={isModalOpen} 
        onClose={handleCloseModal} 
      />
    </>
  );
}
