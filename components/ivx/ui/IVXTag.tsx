import React from "react";
import { cx } from "@/lib/ivx-utils";

interface IVXTagProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  size?: "sm" | "default";
  className?: string;
}

export function IVXTag({
  children,
  variant = "default",
  size = "default",
  className,
}: IVXTagProps) {
  const baseStyles = [
    "inline-flex items-center gap-1 font-medium rounded-full",
    "transition-colors duration-150",
  ];

  const variantStyles = {
    default: "bg-[#0f1529] text-[#9AA3B2] border border-[#0f1529]",
    primary: "bg-[#02a7fd]/10 text-[#02a7fd] border border-[#02a7fd]/20",
    success: "bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20",
    warning: "bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20",
    danger: "bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    default: "px-3 py-1 text-sm",
  };

  const classes = cx(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  return <span className={classes}>{children}</span>;
}