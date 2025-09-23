"use client";

import React from "react";
import { Trophy, Clock, Users, Coins, Target } from "lucide-react";
import { IVXCard, IVXCardContent } from "../ui/IVXCard";
import { IVXButton } from "../ui/IVXButton";
import { IVXTag } from "../ui/IVXTag";
import { formatTokens } from "@/lib/ivx-utils";

interface IVXArenaHeroProps {
  eventId: string;
  title?: string;
  mode?: "Game" | "Tournament" | "Prediction";
  status?: "live" | "upcoming" | "closed";
  entryCost?: number;
  rewards?: number;
  timeRemaining?: string;
  participants?: number;
  onJoinEvent?: () => void;
  onEventStore?: () => void;
  className?: string;
}

export function IVXArenaHero({
  eventId,
  title = "Selected Event",
  mode = "Game",
  status = "upcoming",
  entryCost = 25,
  rewards = 500,
  timeRemaining = "2h 45m",
  participants = 1248,
  onJoinEvent,
  onEventStore,
  className,
}: IVXArenaHeroProps) {
  const getStatusColor = () => {
    switch (status) {
      case "live":
        return "success";
      case "upcoming":
        return "warning";
      case "closed":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "live":
        return "🔴";
      case "upcoming":
        return "🕐";
      case "closed":
        return "🏁";
      default:
        return "📅";
    }
  };

  const getModeIcon = () => {
    switch (mode) {
      case "Game":
        return <Target className="w-5 h-5" />;
      case "Tournament":
        return <Trophy className="w-5 h-5" />;
      case "Prediction":
        return <Users className="w-5 h-5" />;
      default:
        return <Target className="w-5 h-5" />;
    }
  };

  return (
    <IVXCard className={className}>
      <IVXCardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left side - Event info */}
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-[#7c3aed]/10 rounded-lg">
                {getModeIcon()}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-[#E6E9F2]">
                    {title}
                  </h3>
                  <IVXTag variant={getStatusColor() as any} size="sm">
                    {getStatusIcon()} {status.charAt(0).toUpperCase() + status.slice(1)}
                  </IVXTag>
                </div>
                <IVXTag size="sm">
                  {mode}
                </IVXTag>
              </div>
            </div>

            {/* Event Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-[#0f1529]/50 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Coins className="w-4 h-4 text-[#f59e0b]" />
                  <span className="text-xs text-[#9AA3B2]">Entry</span>
                </div>
                <div className="font-semibold text-[#E6E9F2]">
                  {formatTokens(entryCost)} XUT
                </div>
              </div>

              <div className="text-center p-3 bg-[#0f1529]/50 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Trophy className="w-4 h-4 text-[#22c55e]" />
                  <span className="text-xs text-[#9AA3B2]">Rewards</span>
                </div>
                <div className="font-semibold text-[#E6E9F2]">
                  {formatTokens(rewards)} XUT
                </div>
              </div>

              <div className="text-center p-3 bg-[#0f1529]/50 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock className="w-4 h-4 text-[#02a7fd]" />
                  <span className="text-xs text-[#9AA3B2]">{status === "live" ? "Ends" : "Starts"}</span>
                </div>
                <div className="font-semibold text-[#E6E9F2]">
                  {timeRemaining}
                </div>
              </div>

              <div className="text-center p-3 bg-[#0f1529]/50 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users className="w-4 h-4 text-[#7c3aed]" />
                  <span className="text-xs text-[#9AA3B2]">Players</span>
                </div>
                <div className="font-semibold text-[#E6E9F2]">
                  {formatTokens(participants)}
                </div>
              </div>
            </div>
          </div>

          {/* Right side - CTAs */}
          <div className="flex flex-col gap-3 lg:w-48">
            <IVXButton
              variant="primary"
              onClick={onJoinEvent}
              className="w-full"
              disabled={status === "closed"}
            >
              {getModeIcon()}
              {status === "live" ? "Join Now" : status === "upcoming" ? "Register" : "Closed"}
            </IVXButton>
            
            <IVXButton
              variant="secondary"
              onClick={onEventStore}
              className="w-full"
            >
              <Trophy className="w-4 h-4" />
              Event Store
            </IVXButton>

            {/* Entry Cost Info */}
            <div className="text-center p-3 bg-[#f59e0b]/5 rounded-lg border border-[#f59e0b]/20">
              <div className="text-xs text-[#9AA3B2] mb-1">
                Entry Fee
              </div>
              <div className="flex items-center justify-center gap-1">
                <Coins className="w-3 h-3 text-[#f59e0b]" />
                <span className="text-sm font-medium text-[#f59e0b]">
                  {formatTokens(entryCost)} XUT
                </span>
              </div>
            </div>
          </div>
        </div>
      </IVXCardContent>
    </IVXCard>
  );
}