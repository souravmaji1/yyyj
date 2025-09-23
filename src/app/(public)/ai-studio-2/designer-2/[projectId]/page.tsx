"use client";

import React from "react";
import { StudioDesigner } from "@/src/components/studio/StudioDesigner";

interface StudioProjectPageProps {
  params?: {
    projectId?: string;
  };
}

export default function StudioProjectPage({ params }: StudioProjectPageProps) {
  const projectId = params?.projectId;
  
  if (!projectId) {
    return <div>Project not found</div>;
  }
  
  return <StudioDesigner projectId={projectId} />;
}