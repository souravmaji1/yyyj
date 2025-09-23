"use client";

import React from "react";
import { Play, Award, Coins } from "lucide-react";
import { IVXCard, IVXCardContent } from "../ui/IVXCard";
import { IVXButton } from "../ui/IVXButton";
import { IVXTag } from "../ui/IVXTag";
import { formatTokens } from "@/lib/ivx-utils";

interface IVXVideoHeroProps {
  videoId: string;
  title?: string;
  description?: string;
  watchProgress?: number; // 0-1
  tokensEarned?: number;
  estimatedTokens?: number;
  onWatchAndEarn?: () => void;
  onShopVideo?: () => void;
  className?: string;
}

export function IVXVideoHero({
  videoId,
  title = "Selected Video",
  description,
  watchProgress = 0,
  tokensEarned = 0,
  estimatedTokens = 5,
  onWatchAndEarn,
  onShopVideo,
  className,
}: IVXVideoHeroProps) {
  const progressPercentage = Math.round(watchProgress * 100);
  const canEarnTokens = watchProgress >= 0.9; // 90% completion threshold

  return (
    <IVXCard className={className}>
      <IVXCardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left side - Video info and progress */}
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-[#02a7fd]/10 rounded-lg">
                <Play className="w-6 h-6 text-[#02a7fd]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#E6E9F2] mb-1">
                  {title}
                </h3>
                {description && (
                  <p className="text-sm text-[#9AA3B2] line-clamp-2">
                    {description}
                  </p>
                )}
              </div>
            </div>

            {/* Watch & Earn Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#f59e0b]" />
                  <span className="text-sm font-medium text-[#E6E9F2]">
                    Watch & Earn Progress
                  </span>
                </div>
                <span className="text-sm text-[#9AA3B2]">
                  {progressPercentage}%
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-[#0f1529] rounded-full h-2 mb-3">
                <div
                  className="bg-gradient-to-r from-[#02a7fd] to-[#22d3ee] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              {/* Token Info */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Coins className="w-4 h-4 text-[#22d3ee]" />
                  <span className="text-[#9AA3B2]">Earned:</span>
                  <span className="font-medium text-[#22d3ee]">
                    {formatTokens(tokensEarned)} XUT
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[#9AA3B2]">Potential:</span>
                  <span className="font-medium text-[#f59e0b]">
                    {formatTokens(estimatedTokens)} XUT
                  </span>
                </div>
              </div>

              {/* Completion Status */}
              {canEarnTokens && (
                <div className="mt-2">
                  <IVXTag variant="success" size="sm">
                    ✓ Eligible for rewards
                  </IVXTag>
                </div>
              )}
            </div>
          </div>

          {/* Right side - CTAs */}
          <div className="flex flex-col gap-3 lg:w-48">
            <IVXButton
              variant="primary"
              onClick={onWatchAndEarn}
              className="w-full"
            >
              <Play className="w-4 h-4" />
              Watch & Earn
            </IVXButton>
            
            <IVXButton
              variant="secondary"
              onClick={onShopVideo}
              className="w-full"
            >
              <Award className="w-4 h-4" />
              Shop This Video
            </IVXButton>

            {/* Token hint */}
            <div className="text-center p-3 bg-[#22d3ee]/5 rounded-lg border border-[#22d3ee]/20">
              <div className="text-xs text-[#9AA3B2] mb-1">
                Complete watching to earn
              </div>
              <div className="flex items-center justify-center gap-1">
                <Coins className="w-3 h-3 text-[#22d3ee]" />
                <span className="text-sm font-medium text-[#22d3ee]">
                  {formatTokens(estimatedTokens)} XUT
                </span>
              </div>
            </div>
          </div>
        </div>
      </IVXCardContent>
    </IVXCard>
  );
}