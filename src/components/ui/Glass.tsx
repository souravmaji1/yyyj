// components/ui/Glass.tsx
import React from "react";
import { cn } from "@/src/lib/utils";

interface GlassProps {
  as?: keyof JSX.IntrinsicElements;
  children: React.ReactNode;
  className?: string;
  'data-blur'?: number;
  'data-sat'?: number;
  'data-bright'?: number;
  'data-radius'?: number;
  'data-border'?: number;
  'data-inner'?: number;
  [key: string]: any; // Allow for other HTML attributes
}

export default function Glass({ 
  as: Component = "div", 
  children, 
  className,
  ...props 
}: GlassProps) {
  return React.createElement(
    Component,
    { 
      className: cn("glass", className),
      ...props
    },
    children
  );
}