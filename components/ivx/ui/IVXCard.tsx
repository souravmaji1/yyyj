import React from "react";
import { cx } from "@/lib/ivx-utils";

interface IVXCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  clickable?: boolean;
  glowOnHover?: boolean;
}

export function IVXCard({
  children,
  className,
  onClick,
  clickable = false,
  glowOnHover = false,
}: IVXCardProps) {
  const baseStyles = [
    "bg-[#0c1120] rounded-[1.25rem] border border-[#0f1529]",
    "transition-all duration-150",
  ];

  const interactiveStyles = clickable
    ? [
        "cursor-pointer",
        "hover:border-[#02a7fd]/50 hover:bg-[#0c1120]/90",
        "active:scale-[0.99]",
      ]
    : [];

  const glowStyles = glowOnHover
    ? [
        "hover:shadow-[0_0_20px_rgba(2,167,253,0.1)]",
        "hover:border-[#02a7fd]/60",
      ]
    : [];

  const classes = cx(baseStyles, interactiveStyles, glowStyles, className);

  const CardComponent = clickable ? "button" : "div";

  return (
    <CardComponent className={classes} onClick={onClick}>
      {children}
    </CardComponent>
  );
}

interface IVXCardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function IVXCardHeader({ children, className }: IVXCardHeaderProps) {
  return (
    <div className={cx("p-4 pb-2", className)}>
      {children}
    </div>
  );
}

interface IVXCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function IVXCardContent({ children, className }: IVXCardContentProps) {
  return (
    <div className={cx("p-4 pt-0", className)}>
      {children}
    </div>
  );
}

interface IVXCardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function IVXCardFooter({ children, className }: IVXCardFooterProps) {
  return (
    <div className={cx("p-4 pt-2 border-t border-[#0f1529]/50", className)}>
      {children}
    </div>
  );
}