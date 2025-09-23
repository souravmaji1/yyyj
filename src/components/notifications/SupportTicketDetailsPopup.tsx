"use client";

import { type FC, useState, useEffect, useRef } from "react";
import {
  X,
  Eye,
  Clock,
  User,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Calendar,
  Hash,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Separator } from "@/src/components/ui/separator";
import type { SupportTicketDetails } from "./types";
import { supportTicketsAPI } from "../../api/supportTickets";

interface SupportTicketDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: number;
  notificationTitle: string;
  notificationMessage: string;
}

const StatusIcons = {
  open: AlertCircle,
  in_progress: Clock,
  resolved: CheckCircle,
  closed: XCircle,
};

const StatusColors = {
  open: "bg-orange-500/20 text-orange-300 border-orange-500/40 shadow-orange-500/20",
  in_progress: "bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-blue-500/20",
  resolved: "bg-green-500/20 text-green-300 border-green-500/40 shadow-green-500/20",
  closed: "bg-gray-500/20 text-gray-300 border-gray-500/40 shadow-gray-500/20",
};

const StatusLabels = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

const SupportTicketDetailsPopup: FC<SupportTicketDetailsPopupProps> = ({
  isOpen,
  onClose,
  ticketId,
  notificationTitle,
  notificationMessage,
}) => {
  const [ticketDetails, setTicketDetails] = useState<SupportTicketDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);

  // Format ticket ID for display
  const formatTicketId = (id: number) => `TKT-${id.toString().padStart(6, '0')}`;

  // Fetch ticket details when popup opens
  useEffect(() => {
    if (isOpen && ticketId && !fetchingRef.current) {
      fetchTicketDetails();
    }
    
    // Reset fetching ref when popup closes
    if (!isOpen) {
      fetchingRef.current = false;
    }
  }, [isOpen, ticketId]);

  // Handle escape key to close popup and prevent background scrolling
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      // Prevent background scrolling
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      // Restore scrolling
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
      
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const fetchTicketDetails = async () => {
    if (fetchingRef.current) return; // Prevent duplicate calls
    
    fetchingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Fetching ticket details for ID:', ticketId);
      const response = await supportTicketsAPI.getSupportTicket(ticketId);
      console.log('✅ Ticket details response:', response);
      
      // Validate response data
      if (!response) {
        throw new Error('No response data received');
      }
      
      // Ensure dates are valid
      if (response.createdAt && response.updatedAt) {
        const createdDate = new Date(response.createdAt);
        const updatedDate = new Date(response.updatedAt);
        
        if (isNaN(createdDate.getTime()) || isNaN(updatedDate.getTime())) {
          console.warn('⚠️ Invalid date format detected:', {
            createdAt: response.createdAt,
            updatedAt: response.updatedAt
          });
        }
      }
      
      setTicketDetails(response);
    } catch (err) {
      console.error(' Error fetching ticket details:', err);
      setError('Failed to load ticket details');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10001] p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl border-border/50">
        {/* Header */}
        <CardHeader className="pb-6 border-b border-border/50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl flex items-center justify-center shadow-lg">
                <Eye className="w-7 h-7 text-blue-400" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-bold bg-white bg-clip-text text-transparent">
                    Support Ticket
                  </h2>
                  {ticketDetails && (
                    <Badge variant="outline" className={`${StatusColors[ticketDetails.status]} px-3 py-1 text-sm font-medium`}>
                      {(() => {
                        const IconComponent = StatusIcons[ticketDetails.status]
                        return IconComponent ? <IconComponent className="w-4 h-4 mr-2" /> : null
                      })()}
                      {StatusLabels[ticketDetails.status]}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Hash className="w-4 h-4 text-blue-400" />
                  <span className="font-mono text-sm font-medium text-blue-300">{formatTicketId(ticketId)}</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground hover:bg-red-500/20 hover:text-red-400 rounded-full transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="overflow-y-auto max-h-[calc(90vh-200px)] space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-6">
                <div className="relative">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto" />
                  <div className="absolute inset-0 w-12 h-12 border-2 border-blue-400/20 rounded-full mx-auto"></div>
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-foreground">Loading ticket details...</p>
                  <p className="text-sm text-muted-foreground">Please wait while we fetch the information</p>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-20 space-y-6">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-10 h-10 text-red-400" />
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-lg font-semibold text-foreground">Unable to load ticket details</p>
                  <p className="text-muted-foreground mt-1">{error}</p>
                </div>
                <Button 
                  onClick={fetchTicketDetails} 
                  variant="outline" 
                  className="bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/40"
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : ticketDetails ? (
            <div className="space-y-6">
              {/* Notification Alert */}
              <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                      <MessageSquare className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-blue-400">Notification Update</h3>
                        <div className="w-2 h-2 bg-white-400 rounded-full animate-pulse"></div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xl font-semibold text-white">{notificationTitle}</p>
                        <p className="text-white leading-relaxed">{notificationMessage}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ticket Information */}
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-white " />
                    </div>
                    Ticket Details
                  </h3>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white uppercase tracking-wide">Title</label>
                    <p className="text-lg text-white font-medium bg-muted/30 p-3 rounded-lg border border-border/50">
                      {ticketDetails.title}
                    </p>
                  </div>
                  <Separator className="bg-border/30" />
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white uppercase tracking-wide">Description</label>
                    <p className="text-white leading-relaxed bg-muted/30 p-4 rounded-lg border border-border/50 min-h-[80px]">
                      {ticketDetails.description}
                    </p>
                  </div>
                  <Separator className="bg-border/30" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-4 p-4 bg-muted/20 rounded-lg border border-border/30">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Created</label>
                        <p className="text-white font-medium">
                          {ticketDetails.createdAt ? 
                            (() => {
                              const date = new Date(ticketDetails.createdAt);
                              return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
                            })() : 
                            'N/A'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-muted/20 rounded-lg border border-border/30">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Last Updated</label>
                        <p className="text-white font-medium">
                          {ticketDetails.updatedAt ? 
                            (() => {
                              const date = new Date(ticketDetails.updatedAt);
                              return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
                            })() : 
                            'N/A'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status History */}
              {ticketDetails.previousStatus && (
                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-purple-400" />
                      </div>
                      Status History
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6 p-6 bg-muted/20 rounded-lg border border-border/30">
                      <div className="flex flex-col items-center gap-2">
                        <Badge variant="outline" className={`${StatusColors[ticketDetails.previousStatus]} px-4 py-2 text-sm font-medium`}>
                          {(() => {
                            const IconComponent = StatusIcons[ticketDetails.previousStatus]
                            return IconComponent ? <IconComponent className="w-4 h-4 mr-2" /> : null
                          })()}
                          {StatusLabels[ticketDetails.previousStatus]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">Previous</span>
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-px bg-border"></div>
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <div className="w-8 h-px bg-border"></div>
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <Badge variant="outline" className={`${StatusColors[ticketDetails.status]} px-4 py-2 text-sm font-medium`}>
                          {(() => {
                            const IconComponent = StatusIcons[ticketDetails.status]
                            return IconComponent ? <IconComponent className="w-4 h-4 mr-2" /> : null
                          })()}
                          {StatusLabels[ticketDetails.status]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">Current</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* User Information */}
              {ticketDetails.user && (
                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      User Information
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6 p-6 bg-muted/20 rounded-lg border border-border/30">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center shadow-md">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <div className="space-y-2 flex-1">
                        <div>
                          <label className="text-sm font-semibold text-white uppercase tracking-wide">Name</label>
                          <p className="text-lg font-semibold text-white">{ticketDetails.user.name || "N/A"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-white uppercase tracking-wide">Email</label>
                          <p className="text-white font-medium">{ticketDetails.user.email || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Admin Notes */}
              {ticketDetails.additional_info && (
                <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20 shadow-lg">
                  <CardHeader className="pb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-amber-400" />
                      </div>
                      Admin Notes
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="p-6 bg-amber-500/5 rounded-lg border border-amber-500/20">
                      <p className="text-foreground leading-relaxed text-lg font-medium">
                        {ticketDetails.additional_info}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : null}
        </CardContent>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border/50 bg-muted/20">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Ticket #{ticketId} • Last updated {ticketDetails ? new Date(ticketDetails.updatedAt).toLocaleDateString() : 'N/A'}</span>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="px-6 py-2 border-border/50 hover:bg-muted/50 transition-all duration-200"
            >
              Close
            </Button>
            {ticketDetails && ticketDetails.status !== "closed" && (
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-200">
                Respond to Ticket
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SupportTicketDetailsPopup;
