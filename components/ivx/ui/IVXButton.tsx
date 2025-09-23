import React from "react";
import { cx } from "@/lib/ivx-utils";

interface IVXButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "default" | "lg";
  children: React.ReactNode;
}

export function IVXButton({
  variant = "primary",
  size = "default",
  className,
  children,
  disabled,
  ...props
}: IVXButtonProps) {
  const baseStyles = [
    "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#02a7fd]",
    "disabled:pointer-events-none disabled:opacity-50",
    "rounded-md whitespace-nowrap",
  ];

  const variantStyles = {
    primary: [
      "bg-[#02a7fd] text-white",
      "hover:bg-[#0284c7] active:bg-[#0369a1]",
    ],
    secondary: [
      "bg-[#0f1529] text-[#E6E9F2] border border-[#02a7fd]/30",
      "hover:bg-[#0f1529]/80 hover:border-[#02a7fd]/50",
      "active:bg-[#0f1529]/60",
    ],
    ghost: [
      "bg-transparent text-[#9AA3B2]",
      "hover:bg-[#0f1529]/50 hover:text-[#E6E9F2]",
      "active:bg-[#0f1529]/70",
    ],
    danger: [
      "bg-[#ef4444] text-white",
      "hover:bg-[#dc2626] active:bg-[#b91c1c]",
    ],
  };

  const sizeStyles = {
    sm: "h-8 px-3 text-sm",
    default: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  };

  const classes = cx(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  return (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
}