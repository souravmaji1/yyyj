"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Icons } from "@/src/core/icons";
import { AddressSuggestion } from "@/src/app/apis/address/addressApi";

interface AddressSuggestionsProps {
  suggestions: AddressSuggestion[];
  onSelectSuggestion: (suggestion: AddressSuggestion) => void;
  onDismiss: () => void;
  isLoading?: boolean;
}

export function AddressSuggestions({ 
  suggestions, 
  onSelectSuggestion, 
  onDismiss, 
  isLoading = false 
}: AddressSuggestionsProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (isLoading) {
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--color-surface)] border border-[#667085]/50 rounded-lg shadow-lg z-50 p-4">
        <div className="flex items-center justify-center gap-2 text-gray-300">
          <Icons.spinner className="h-4 w-4 animate-spin" />
          <span>Validating address...</span>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--color-surface)] border border-[#667085]/50 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-300 font-medium">
            Address Suggestions ({suggestions.length})
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-[#667085]/20"
          >
            <Icons.x className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-1">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onSelectSuggestion(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full text-left p-3 rounded-md transition-all ${
                selectedIndex === index
                  ? 'bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30'
                  : 'hover:bg-[#667085]/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <Icons.mapPin className="h-4 w-4 text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">
                    {suggestion.street}
                  </div>
                  <div className="text-gray-400 text-xs mt-1">
                    {suggestion.city}, {suggestion.state} {suggestion.zipcode}
                  </div>
                  {suggestion.components && (
                    <div className="text-gray-500 text-xs mt-1">
                      <span className="mr-2">
                        <span className="text-gray-400">House:</span> {suggestion.components.primary_number || 'N/A'}
                      </span>
                      <span>
                        <span className="text-gray-400">Street:</span> {suggestion.components.street_name || 'N/A'}
                      </span>
                    </div>
                  )}
                </div>
                <Icons.check className="h-4 w-4 text-[var(--color-primary)] flex-shrink-0" />
              </div>
            </button>
          ))}
        </div>
        
        <div className="mt-3 pt-2 border-t border-[#667085]/30">
          <p className="text-xs text-gray-400">
            Select an address above to auto-fill the form with validated information.
          </p>
        </div>
      </div>
    </div>
  );
} 