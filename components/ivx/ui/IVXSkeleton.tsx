import React from "react";
import { cx } from "@/lib/ivx-utils";

interface IVXSkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export function IVXSkeleton({
  className,
  width = "100%",
  height = "1rem",
}: IVXSkeletonProps) {
  return (
    <div
      className={cx(
        "bg-[#0f1529] rounded animate-pulse",
        className
      )}
      style={{ width, height }}
    />
  );
}

interface IVXSkeletonGridProps {
  count?: number;
  className?: string;
}

export function IVXSkeletonGrid({ count = 4, className }: IVXSkeletonGridProps) {
  return (
    <div className={cx("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-4">
          <IVXSkeleton height="12rem" />
          <div className="space-y-2">
            <IVXSkeleton height="1.25rem" width="80%" />
            <IVXSkeleton height="1rem" width="60%" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface IVXSkeletonCardProps {
  className?: string;
}

export function IVXSkeletonCard({ className }: IVXSkeletonCardProps) {
  return (
    <div className={cx("bg-[#0c1120] rounded-[1.25rem] border border-[#0f1529] p-4 space-y-4", className)}>
      <IVXSkeleton height="8rem" />
      <div className="space-y-2">
        <IVXSkeleton height="1.25rem" width="75%" />
        <IVXSkeleton height="1rem" width="50%" />
      </div>
      <div className="flex gap-2">
        <IVXSkeleton height="2rem" width="4rem" />
        <IVXSkeleton height="2rem" width="4rem" />
      </div>
    </div>
  );
}