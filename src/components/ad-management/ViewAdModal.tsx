"use client";

import React from "react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/src/components/ui/card";
import { Separator } from "@/src/components/ui/separator";
import { Badge } from "@/src/components/ui/badge";
import { X, Video, Calendar, MapPin, Clock, User, FileText, Eye, Coins } from "lucide-react";
import { Advertisement } from "@/src/store/slices/adManagementSlice";
import { Label } from "@/src/components/ui/label";
import { useModalScrollLock } from "@/src/hooks/useModalScrollLock";

interface ViewAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  advertisement: Advertisement;
}

export function ViewAdModal({ isOpen, onClose, advertisement }: ViewAdModalProps) {
  // Prevent body scrolling when modal is open
  useModalScrollLock(isOpen);

  if (!isOpen) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'INITIATED':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'APPROVED':
        return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'REJECTED':
        return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'ACTIVE':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'COMPLETED':
        return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'INITIATED':
        return 'Your advertisement is under review by our team';
      case 'APPROVED':
        return 'Your advertisement has been approved and is ready to go live';
      case 'REJECTED':
        return 'Your advertisement was not approved. You can edit and resubmit it';
      case 'ACTIVE':
        return 'Your advertisement is currently running and being displayed';
      case 'COMPLETED':
        return 'Your advertisement campaign has finished';
      default:
        return 'Status information not available';
    }
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'Date not available';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Date not available';
    }
  };

  const formatAmount = (amount: any) => {
    if (amount == null || amount === undefined) return '0.00';
    if (typeof amount === 'string') {
      const parsed = parseFloat(amount);
      return isNaN(parsed) ? amount : parsed.toFixed(2);
    }
    if (typeof amount === 'number') {
      return amount.toFixed(2);
    }
    return '0.00';
  };

  const getDaysRemaining = (endDateString: string | undefined | null) => {
    if (!endDateString) return 'End date not available';
    try {
      const end = new Date(endDateString);
      if (isNaN(end.getTime())) return 'Invalid end date';
      const now = new Date();
      const diffTime = end.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? `${diffDays} day${diffDays !== 1 ? 's' : ''} remaining` : 'Campaign ended';
    } catch (error) {
      return 'Unable to calculate remaining days';
    }
  };

  const formatTimestamp = (dateString: string | undefined | null) => {
    if (!dateString) return 'Information not available';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Information not available';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4 overflow-hidden">
      <div className="w-full max-w-4xl max-h-[95vh] overflow-y-auto bg-[var(--color-bg)] rounded-lg mx-2 sm:mx-0">
        <Card className="bg-[var(--color-bg)] border-slate-700 shadow-2xl">
          {/* Header */}
          <CardHeader className="border-b border-slate-700 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="p-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-lg flex-shrink-0">
                  <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate">
                    Advertisement Details
                  </CardTitle>
                  <p className="text-gray-400 text-sm sm:text-base mt-1 truncate">
                    View complete information about your advertisement
                  </p>
                </div>
              </div>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="h-8 w-8 sm:h-10 sm:w-10 p-0 hover:bg-slate-700/50 text-white hover:text-white border border-slate-600 hover:border-slate-500 transition-all duration-200 flex-shrink-0"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </CardHeader>

          {/* Content */}
          <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Status Information */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-white border-b border-slate-600 pb-2">
                Status Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300 text-sm sm:text-base">Status</Label>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getStatusColor(advertisement.status)} px-3 py-1 text-sm border`}>
                      {advertisement.status || 'Information not available'}
                    </Badge>
                  </div>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1">
                    {getStatusDescription(advertisement.status)}
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-white border-b border-slate-600 pb-2">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300 text-sm sm:text-base">Advertisement Title</Label>
                  <p className="text-white text-sm sm:text-base break-words leading-relaxed bg-slate-700/30 p-3 rounded-lg">
                    {advertisement.title || 'No title provided'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300 text-sm sm:text-base">Machine ID</Label>
                  <p className="text-white text-sm sm:text-base break-words leading-relaxed bg-slate-700/30 p-3 rounded-lg font-mono">
                    {advertisement?.machine?.machine_id || advertisement?.machineId || 'No machine ID provided'}
                  </p>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-slate-300 text-sm sm:text-base">Description</Label>
                  <p className="text-white text-sm sm:text-base break-words leading-relaxed bg-slate-700/30 p-3 rounded-lg">
                    {advertisement.description || 'No description provided'}
                  </p>
                </div>
              </div>
            </div>

            {/* Campaign Details */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-white border-b border-slate-600 pb-2">
                Campaign Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300 text-sm sm:text-base">Start Date</Label>
                  <div className="flex items-center gap-2 text-white text-sm sm:text-base bg-slate-700/30 p-3 rounded-lg">
                    <Calendar className="h-4 w-4 text-[var(--color-primary)] flex-shrink-0" />
                    <span>{formatDate(advertisement.startDate)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300 text-sm sm:text-base">End Date</Label>
                  <div className="flex items-center gap-2 text-white text-sm sm:text-base bg-slate-700/30 p-3 rounded-lg">
                    <Calendar className="h-4 w-4 text-[var(--color-primary)] flex-shrink-0" />
                    <span>{formatDate(advertisement.endDate)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Budget Information */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-white border-b border-slate-600 pb-2">
                Budget Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300 text-sm sm:text-base">Budget Amount</Label>
                  <div className="flex items-center gap-2 text-white text-lg sm:text-xl font-bold bg-slate-700/30 p-3 rounded-lg">
                    <Coins className="h-5 w-5 text-[var(--color-primary)] flex-shrink-0" />
                    <span>{formatAmount(advertisement.amount)} XUT</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300 text-sm sm:text-base">Days Remaining</Label>
                  <div className="flex items-center gap-2 text-white text-sm sm:text-base bg-slate-700/30 p-3 rounded-lg">
                    <Clock className="h-4 w-4 text-[var(--color-primary)] flex-shrink-0" />
                    <span>{getDaysRemaining(advertisement.endDate)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Media Information */}
            {advertisement.media && advertisement.media.length > 0 && (
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-white border-b border-slate-600 pb-2">
                  Media Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300 text-sm sm:text-base">Media Type</Label>
                    <div className="flex items-center gap-2 text-white text-sm sm:text-base bg-slate-700/30 p-3 rounded-lg">
                      <Video className="h-4 w-4 text-[var(--color-primary)] flex-shrink-0" />
                      <span className="capitalize">{advertisement.media?.[0]?.mediaType || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300 text-sm sm:text-base">File Size</Label>
                    <div className="flex items-center gap-2 text-white text-sm sm:text-base bg-slate-700/30 p-3 rounded-lg">
                      <FileText className="h-4 w-4 text-[var(--color-primary)] flex-shrink-0" />
                      <span>{Math.round((advertisement.media?.[0]?.metadata?.size || 0) / 1024 / 1024 * 100) / 100} MB</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Timestamps Section */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-white border-b border-slate-600 pb-2">
                Timestamps
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300 text-sm sm:text-base">Created At</Label>
                  <div className="flex items-center gap-2 text-white text-sm sm:text-base bg-slate-700/30 p-3 rounded-lg">
                    <Clock className="h-4 w-4 text-[var(--color-primary)] flex-shrink-0" />
                    <span>{formatTimestamp(advertisement.createdAt)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300 text-sm sm:text-base">Last Updated</Label>
                  <div className="flex items-center gap-2 text-white text-sm sm:text-base bg-slate-700/30 p-3 rounded-lg">
                    <Clock className="h-4 w-4 text-[var(--color-primary)] flex-shrink-0" />
                    <span>{formatTimestamp(advertisement.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>

          {/* Footer */}
          <CardFooter className="flex justify-end p-4 sm:p-6 border-t border-slate-700">
            <Button
              onClick={onClose}
              // variant="outline"

              className="border-slate-600 text-white hover:bg-slate-700/50 hover:border-slate-500 transition-all duration-200 bg-[var(--color-bg)]"
            >
              Close
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 