"use client";
import React, { useState } from "react";
import Prediction from "./PredictionsMarket";

interface PredictionsMarketPopupProps {
  triggerText?: string;
  triggerClassName?: string;
}

export default function PredictionsMarketPopup({ 
  triggerText = "Open Predictions", 
  triggerClassName = "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
}: PredictionsMarketPopupProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={handleOpen}
        className={triggerClassName}
      >
        {triggerText}
      </button>

      {/* Popup Modal */}
      {isOpen && (
        <Prediction 
          showAsPopup={true}
          onClose={handleClose}
        />
      )}
    </>
  );
}
