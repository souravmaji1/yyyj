"use client";

import { Button } from "@/src/components/ui/button";
import { Icons } from "@/src/core/icons";

interface Address {
  id: string;
  type: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

interface AddressCardProps {
  address: Address;
  onDelete: () => void;
  onSetDefault: () => void;
}

export function AddressCard({ address, onDelete, onSetDefault }: AddressCardProps) {
  return (
    <div className="bg-[var(--color-surface)]/30 rounded-lg p-4 border border-[#667085]/20">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-white font-medium capitalize">{address.type}</span>
            {address.isDefault && (
              <span className="bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-xs px-2 py-0.5 rounded-full">
                Default
              </span>
            )}
          </div>
          <div className="text-gray-300 text-sm space-y-1">
            <p>{address.street}</p>
            <p>{address.city}, {address.state} {address.zipCode}</p>
            <p>{address.country}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!address.isDefault && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSetDefault}
              className="border-[#667085]/30 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]"
            >
              Set Default
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="border-[#667085]/30 text-red-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-400"
          >
            <Icons.trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
