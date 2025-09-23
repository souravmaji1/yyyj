"use client";

import { Badge } from "@/src/components/ui/badge";
import { Icons } from "@/src/core/icons";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";

export function KYCStatusBadge() {

  const user = useSelector((state: RootState) => state.user.profile);

  if (!user) return null;

  const statusConfig = {
    not_started: {
      label: "KYC Required",
      variant: "outline" as const,
      icon: Icons.alertCircle
    },
    pending: {
      label: "KYC Pending",
      variant: "secondary" as const,
      icon: Icons.clock
    },
    verified: {
      label: "KYC Verified",
      variant: "default" as const,
      icon: Icons.checkCircle
    },
    failed: {
      label: "KYC Failed",
      variant: "destructive" as const,
      icon: Icons.xCircle
    },
    skipped: {
      label: "KYC Skipped",
      variant: "secondary" as const,
      icon: Icons.alertCircle
    }
  };

  const kycStatus = (user as any)?.kycStatus;
  const config = statusConfig[kycStatus as keyof typeof statusConfig];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1.5 px-2.5 py-1">
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
}