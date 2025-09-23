"use client";

import React, { useState } from "react";
import { cx } from "@/lib/ivx-utils";

interface IVXTabsProps {
  children: React.ReactNode;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

interface IVXTabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface IVXTabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface IVXTabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

// Context for tabs state
const TabsContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
} | null>(null);

function useTabsContext() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within IVXTabs");
  }
  return context;
}

export function IVXTabs({
  children,
  defaultValue = "",
  onValueChange,
  className,
}: IVXTabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  
  const value = internalValue;
  
  const handleValueChange = (newValue: string) => {
    setInternalValue(newValue);
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={cx("w-full", className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function IVXTabsList({ children, className }: IVXTabsListProps) {
  return (
    <div
      className={cx(
        "inline-flex h-10 items-center justify-center rounded-lg bg-[#0f1529] p-1",
        "border border-[#0f1529]",
        className
      )}
      role="tablist"
    >
      {children}
    </div>
  );
}

export function IVXTabsTrigger({
  value,
  children,
  className,
}: IVXTabsTriggerProps) {
  const { value: selectedValue, onValueChange } = useTabsContext();
  const isSelected = selectedValue === value;

  return (
    <button
      className={cx(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5",
        "text-sm font-medium transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#02a7fd] focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        isSelected
          ? "bg-[#02a7fd] text-white shadow-sm"
          : "text-[#9AA3B2] hover:text-[#E6E9F2] hover:bg-[#0c1120]",
        className
      )}
      role="tab"
      aria-selected={isSelected}
      onClick={() => onValueChange(value)}
    >
      {children}
    </button>
  );
}

export function IVXTabsContent({
  value,
  children,
  className,
}: IVXTabsContentProps) {
  const { value: selectedValue } = useTabsContext();
  
  if (selectedValue !== value) {
    return null;
  }

  return (
    <div
      className={cx("mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)}
      role="tabpanel"
    >
      {children}
    </div>
  );
}