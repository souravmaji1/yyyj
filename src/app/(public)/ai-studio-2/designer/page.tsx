"use client";

import React from "react";
import dynamic from "next/dynamic";
import { FF_DYNAMIC_CHARTS } from "@/src/lib/flags";

// Dynamic import for AI Studio Designer to reduce initial bundle size
const AIStudioDesigner = dynamic(
  () => import("@/src/components/ai-studio/AIStudioDesigner").then(mod => ({ default: mod.AIStudioDesigner })),
  {
    loading: () => (
      <div className="flex h-screen w-full bg-[var(--color-surface)] text-white overflow-hidden">
        <div className="flex items-center justify-center w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-300 text-lg">Loading AI Studio...</p>
            <p className="text-gray-500 text-sm mt-2">Preparing your design environment</p>
          </div>
        </div>
      </div>
    ),
    ssr: false
  }
);

export default function AIStudioDesignerPage() {
  return <AIStudioDesigner />;
}