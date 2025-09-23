"use client";

import { FC, Dispatch, SetStateAction } from "react";
import { Check, Bell } from 'lucide-react';
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/src/components/ui/select";

interface HeaderProps {
  filter: "all" | "unread" | "read";
  setFilter: Dispatch<SetStateAction<"all" | "unread" | "read">>;
  selectedType: string;
  setSelectedType: Dispatch<SetStateAction<string>>;
  unreadCount: number;
  readCount: number;
  markAllAsRead: () => void;
  totalCount: number;
}

const NotificationHeader: FC<HeaderProps> = ({
  filter,
  setFilter,
  selectedType,
  setSelectedType,
  unreadCount,
  readCount,
  markAllAsRead,
  totalCount,
}) => {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Header Content */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Bell className="w-6 h-6 text-white" />
              </div>
              {unreadCount > 0 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{unreadCount}</span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                Notifications
              </h1>
              <p className="text-slate-400 text-sm">
                {totalCount === 0 
                  ? null
                  : `${totalCount} total notification${totalCount !== 1 ? 's' : ''}`
                }
                {unreadCount > 0 && (
                  <span className="text-blue-400 ml-2">
                    • {unreadCount} unread
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Filter Tabs */}
            <div className="flex bg-slate-800/50 rounded-xl p-1 border border-slate-700/50 backdrop-blur-sm">
              <Button
                variant="ghost"
                onClick={() => setFilter("all")}
                className={`px-6 py-2 rounded-lg transition-all duration-200 ${
                  filter === "all" 
                    ? " bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] to-blue-600 text-white shadow-lg" 
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                All
                <span className="ml-2 text-xs opacity-75">
                  {totalCount>0 ? totalCount : null}
                </span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setFilter("unread")}
                className={`px-6 py-2 rounded-lg transition-all duration-200 ${
                  filter === "unread" 
                    ? " bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white shadow-lg" 
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                Unread
                {unreadCount > 0 ? (
                  <span className="ml-2 bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full text-xs font-medium">
                    {unreadCount}
                  </span>
                ) : null}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setFilter("read")}
                className={`px-6 py-2 rounded-lg transition-all duration-200 ${
                  filter === "read" 
                    ? " bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white shadow-lg" 
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                Read
                <span className="ml-2 text-xs opacity-75">
                  {readCount > 0 ? readCount : null}
                </span>
              </Button>
            </div>

            {/* Type Filter Dropdown */}
            <div className="relative">
              <Select
                value={selectedType}
                onValueChange={(value) => setSelectedType(value)}
              >
                <SelectTrigger
                  className="
                    bg-[var(--color-surface)]/80 border-[#667085]/50 text-white
                    focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/30
                    transition-all
                    min-w-[140px]
                    h-[44px] px-6 py-2
                    rounded-lg
                    font-medium
                    flex items-center
                    shadow-none
                  "
                >
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--color-surface)] border-[#667085]/50 text-white shadow-lg shadow-black/20">
                  <SelectItem value="all" className="hover:bg-white/10 focus:bg-white/10 cursor-pointer hover:text-white">
                    All Types
                  </SelectItem>
                  <SelectItem value="order" className="hover:bg-white/10 focus:bg-white/10 cursor-pointer hover:text-white">
                    Orders
                  </SelectItem>
                  <SelectItem value="payment" className="hover:bg-white/10 focus:bg-white/10 cursor-pointer hover:text-white">
                    Payments
                  </SelectItem>
                  <SelectItem value="security" className="hover:bg-white/10 focus:bg-white/10 cursor-pointer hover:text-white">
                    Security
                  </SelectItem>
                  <SelectItem value="account" className="hover:bg-white/10 focus:bg-white/10 cursor-pointer hover:text-white">
                    Account
                  </SelectItem>
                  <SelectItem value="general" className="hover:bg-white/10 focus:bg-white/10 cursor-pointer hover:text-white">
                    General
                  </SelectItem>
                  <SelectItem value="ai-query" className="hover:bg-white/10 focus:bg-white/10 cursor-pointer hover:text-white">
                    Support
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mark All Read Button */}
            {unreadCount > 0 && ( 
              <Button
                onClick={markAllAsRead}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-2"
              >
                <Check className="w-4 h-4 mr-2" />
                Mark all as read
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationHeader;