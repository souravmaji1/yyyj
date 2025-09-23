"use client";

import { FC, useState } from "react";
import { Check, Trash, ShoppingBag, Package, AlertTriangle, CreditCard, ChevronRight, ExternalLink, Shield, User, Bell, Eye, MessageSquare } from 'lucide-react';
import { Button } from "@/src/components/ui/button";
import { Notification } from "./types";
import { ConfirmationDialog } from '@/src/components/ui/confirmation-dialog';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/src/store';
import { deleteNotification } from '@/src/store/slices/notificationSlice';
import SupportTicketDetailsPopup from './SupportTicketDetailsPopup';

interface Props {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  isPopupOpen?: boolean;
}

const IconMap = {
  order: ShoppingBag,
  delivery: Package,
  alert: AlertTriangle,
  payment: CreditCard,
  security: Shield,
  account: User,
  general: Bell,
  'ai-query': MessageSquare,
};

const TypeColors = {
  order: "from-green-500/20 to-emerald-500/20 border-green-500/30",
  delivery: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  alert: "from-orange-500/20 to-yellow-500/20 border-orange-500/30",
  payment: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
  security: "from-red-500/20 to-pink-500/20 border-red-500/30",
  account: "from-blue-500/20 to-indigo-500/20 border-blue-500/30",
  general: "from-gray-500/20 to-slate-500/20 border-gray-500/30",
  'ai-query': "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
};

const IconColors = {
  order: "text-green-400",
  delivery: "text-blue-400",
  alert: "text-orange-400",
  payment: "text-purple-400",
  security: "text-red-400",
  account: "text-blue-400",
  general: "text-gray-400",
  'ai-query': "text-blue-400",
};

const NotificationCard: FC<Props> = ({ notification, onMarkAsRead, isPopupOpen = false }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const Icon = IconMap[notification.type];

  const handleDelete = async () => {
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    setIsDeleting(true);
    setShowConfirm(false);
    setTimeout(() => {
      dispatch(deleteNotification(notification.id));
    }, 150);
  };

  const handleMarkAsRead = () => {
    onMarkAsRead(notification.id);
  };

  const handleSupportDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    // This will be handled by parent component
    const ticketId = extractTicketId(notification.message);
    if (ticketId) {
      // Dispatch action or call parent handler
      window.dispatchEvent(new CustomEvent('openSupportPopup', { 
        detail: { ticketId, notification } 
      }));
    }
  };

  // Extract ticket ID from notification message (assuming format like "Support ticket #123 has been resolved")
  const extractTicketId = (message: string | undefined): number | null => {
    if (!message) return null;
    const match = message.match(/#(\d+)/);
    return match?.[1] ? parseInt(match[1], 10) : null;  
  };

  const ticketId = extractTicketId(notification.message);

  return (
    <div
      className={`group relative overflow-hidden transition-all duration-300 ${
        isDeleting ? "opacity-0 scale-95" : ""
      } ${
        !notification.read 
          ? "bg-gradient-to-r from-blue-500/5 to-blue-600/5 border-l-4 border-l-blue-500" 
          : isPopupOpen ? "" : "hover:bg-slate-800/30"
      }`}
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`mt-1 relative`}>
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${TypeColors[notification.type]} border flex items-center justify-center backdrop-blur-sm`}>
              <Icon className={`w-6 h-6 ${IconColors[notification.type]}`} />
            </div>
            {!notification.read && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
            )}
          </div>

          {/* Content */}
          <div className="flex-grow min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h3 className={`font-semibold text-lg leading-tight ${
                notification.read ? "text-white" : "text-blue-400"
              }`}>
                {notification.title}
              </h3>
              <span className="text-sm text-slate-400 whitespace-nowrap">
                {notification.timestamp}
              </span>
            </div>
            
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              {notification.message}
            </p>
            
            {notification.actionUrl && (
              <a
                href={notification.actionUrl}
                className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200 group/link"
              >
                View Details
                <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-200 group-hover/link:translate-x-1" />
                <ExternalLink className="w-3 h-3 ml-1 opacity-50" />
              </a>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`absolute right-4 bottom-6 flex gap-2 transition-all duration-200 ${
          isPopupOpen 
            ? 'opacity-0 translate-x-2' 
            : 'opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0'
        }`}>
          {/* Support Details Button - only show for ai-query notifications */}
          {notification.type === 'ai-query' && ticketId && (
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSupportDetails}
              onMouseEnter={(e) => e.stopPropagation()}
              onMouseLeave={(e) => e.stopPropagation()}
              className="text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-all duration-200 backdrop-blur-sm w-10 h-10 flex items-center justify-center z-10"
              title="View support ticket details"
            >
              <Eye className="w-5 h-5" />
            </Button>
          )}
          
          <Button
            size="icon"
            variant="ghost"
            onClick={handleDelete}
            onMouseEnter={(e) => e.stopPropagation()}
            onMouseLeave={(e) => e.stopPropagation()}
            className="text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 backdrop-blur-sm w-10 h-10 flex items-center justify-center z-10"
            title="Delete notification"
          >
            <Trash className="w-6 h-6" />
          </Button>
        </div>
      </div>
      {/* Confirmation Modal */}
      {showConfirm && (
        <ConfirmationDialog
          open={showConfirm}
          onOpenChange={setShowConfirm}
          title="Delete Notification"
          description="Are you sure you want to delete this notification? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={confirmDelete}
          onCancel={() => setShowConfirm(false)}
          variant="danger"
        />
      )}

    </div>
  );
};

export default NotificationCard;