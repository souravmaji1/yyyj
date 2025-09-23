"use client";

import React from 'react';
import { X, Package, Truck, CheckCircle, Clock, MapPin, Phone, Mail, Copy, Check, Car } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { format } from 'date-fns';
import { useNotificationUtils } from '@/src/core/utils/notificationUtils';

interface TrackingEvent {
  id: number;
  status: string;
  description: string;
  timestamp: string;
  location: string;
  completed: boolean;
  current?: boolean;
}

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    trackingNumber?: string;
    logs?: any[];
  };
}

export function TrackingModal({ isOpen, onClose, order }: TrackingModalProps) {
  const { showSuccess } = useNotificationUtils();
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopyTrackingNumber = async () => {
    if (order.trackingNumber) {
      try {
        await navigator.clipboard.writeText(order.trackingNumber);
        setCopied(true);
        showSuccess('Copied!', 'Tracking number copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy tracking number:', error);
      }
    }
  };

  // Generate tracking history based on order activities
  const generateTrackingHistory = (orderActivities?: any[]): TrackingEvent[] => {
    const history: TrackingEvent[] = [];
    console.log(orderActivities)
    
    // If we have order activities, use them to generate tracking history
    if (orderActivities && orderActivities.length > 0) {
      // Sort activities by createdAt timestamp
      const sortedActivities = [...orderActivities].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      // Find timestamps for each step
      let orderPlacedTimestamp: Date | null = null;
      let paymentInitiatedTimestamp: Date | null = null;
      let orderConfirmedTimestamp: Date | null = null;
      let orderProcessingTimestamp: Date | null = null;
      let orderShippedTimestamp: Date | null = null;
      let orderDeliveredTimestamp: Date | null = null;

      // Extract timestamps from activities
      sortedActivities.forEach((activity) => {
        const timestamp = new Date(activity.createdAt);

        // Order Placed - when inventory is reserved
        if (activity.action === "status_change" && activity.status === "reserved") {
          orderPlacedTimestamp = timestamp;
        }

        // Payment Initiated
        if (activity.action === "payment_initiated") {
          paymentInitiatedTimestamp = timestamp;
        }

        // Order Confirmed - when payment is received
        if (activity.action === "payment_received" && activity.status === "paid") {
          orderConfirmedTimestamp = timestamp;
        }

        // Order Processing
        if (activity.action === "order_processing" && activity.status === "processing") {
          orderProcessingTimestamp = timestamp;
        }

        // Order Shipped
        if (activity.action === "order_shipped" && activity.status === "shipped") {
          orderShippedTimestamp = timestamp;
        }

        // Order Delivered
        if (activity.action === "order_delivered" && activity.status === "delivered") {
          orderDeliveredTimestamp = timestamp;
        }
      });

      // Apply hierarchy logic - if a step is missing, use the next available timestamp
      if (!orderProcessingTimestamp && orderShippedTimestamp) {
        orderProcessingTimestamp = orderShippedTimestamp;
      }
      if (!orderProcessingTimestamp && orderDeliveredTimestamp) {
        orderProcessingTimestamp = orderDeliveredTimestamp;
      }

      if (!orderShippedTimestamp && orderDeliveredTimestamp) {
        orderShippedTimestamp = orderDeliveredTimestamp;
      }

      // Build history with available timestamps
      if (orderPlacedTimestamp !== null) {
        history.push({
          id: 1,
          status: "Order Placed",
          description: "Your order has been placed successfully",
          timestamp: (orderPlacedTimestamp as Date).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          location: "Online",
          completed: true,
        });
      }

      if (paymentInitiatedTimestamp !== null) {
        history.push({
          id: 2,
          status: "Payment Initiated",
          description: "Payment process has been initiated",
          timestamp: (paymentInitiatedTimestamp as Date).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          location: "Payment Gateway",
          completed: true,
        });
      }

      if (orderConfirmedTimestamp !== null) {
        history.push({
          id: 3,
          status: "Order Confirmed",
          description: "Payment received and order has been confirmed",
          timestamp: (orderConfirmedTimestamp as Date).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          location: "Fulfillment Center",
          completed: true,
        });
      }

      if (orderProcessingTimestamp !== null) {
        history.push({
          id: 4,
          status: "Order Processing",
          description: "Your order is being processed and prepared for shipping",
          timestamp: (orderProcessingTimestamp as Date).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          location: "Fulfillment Center",
          completed: true,
        });
      }

      if (orderShippedTimestamp !== null) {
        history.push({
          id: 5,
          status: "Order Shipped",
          description: "Your order has been shipped and is on the way",
          timestamp: (orderShippedTimestamp as Date).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          location: "Distribution Center",
          completed: true,
          current: order.status.toLowerCase() === "shipped",
        });
      }

      if (orderDeliveredTimestamp !== null) {
        history.push({
          id: 6,
          status: "Order Delivered",
          description: "Your order has been delivered successfully",
          timestamp: (orderDeliveredTimestamp as Date).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          location: "Your Address",
          completed: true,
          current: true,
        });
      }

      // If no activities found, fall back to the original logic
      if (history.length === 0) {
        return generateFallbackTrackingHistory(order);
      }

      return history;
    }

    // Fallback to original logic if no activities
    return generateFallbackTrackingHistory(order);
  };

  const generateFallbackTrackingHistory = (order: any): TrackingEvent[] => {
    const history: TrackingEvent[] = [
      {
        id: 1,
        status: "Order Placed",
        description: "Your order has been placed successfully",
        timestamp: new Date(order.createdAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        location: "Online",
        completed: true,
      },
    ];

    if (order.status.toLowerCase() !== "pending") {
      history.push({
        id: 2,
        status: "Order Confirmed",
        description: "Your order has been confirmed and is being packed",
        timestamp: new Date(order.updatedAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        location: "Fulfillment Center",
        completed: true,
      });
    }

    if (order.status.toLowerCase() === "shipped" || order.status.toLowerCase() === "delivered") {
      history.push({
        id: 3,
        status: "Shipped",
        description: "Your order is on the way",
        timestamp: new Date(order.updatedAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        location: "Distribution Center",
        completed: true,
        current: order.status.toLowerCase() === "shipped",
      });
    }

    if (order.status.toLowerCase() === "delivered") {
      history.push({
        id: 4,
        status: "Delivered",
        description: "Your order has been delivered",
        timestamp: new Date(order.updatedAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        location: "Your Address",
        completed: true,
        current: true,
      });
    }

    return history;
  };

  const getStatusDetails = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { 
          color: 'bg-amber-100 text-amber-800 border-amber-200', 
          text: 'Pending',
          icon: <Clock className="h-4 w-4" />,
          description: 'Order not placed payment failed'
        };
      case 'processing':
        return { 
          color: 'bg-blue-100 text-blue-800 border-blue-200', 
          text: 'Processing',
          icon: <Package className="h-4 w-4" />,
          description: 'Your order is being prepared for shipment'
        };
      case 'shipped':
        return { 
          color: 'bg-indigo-100 text-indigo-800 border-indigo-200', 
          text: 'On the Way',
          icon: <Truck className="h-4 w-4" />,
          description: 'Your order is on its way to you'
        };
      case 'delivered':
        return { 
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200', 
          text: 'Delivered',
          icon: <CheckCircle className="h-4 w-4" />,
          description: 'Your order has been delivered'
        };
      case 'cancelled':
        return { 
          color: 'bg-rose-100 text-rose-800 border-rose-200', 
          text: 'Cancelled',
          icon: <X className="h-4 w-4" />,
          description: 'This order has been cancelled'
        };
        case 'paid':
        return { 
          color: 'bg-green-100 text-green-800 border-green-200', 
          text: 'Paid',
          icon: <CheckCircle className="h-4 w-4" />,
          description: 'This order has been paid and is being processed'
        };
      default:
        return { 
          color: 'bg-gray-100 text-gray-800 border-gray-200', 
          text: status,
          icon: <Clock className="h-4 w-4" />,
          description: 'Order status unknown'
        };
    }
  };

  const trackingHistory = generateTrackingHistory(order.logs);
  console.log("Modal - Order object:", order);
  console.log("Modal - Order logs:", order.logs);
  console.log("Modal - Generated tracking history:", trackingHistory);
  const statusDetails = getStatusDetails(order.status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-surface)] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Order Tracking</h2>
              <p className="text-gray-400">Order #{order.id}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white font-bold hover:bg-[var(--color-primary)] hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Current Status */}
          <div className="mt-4 p-4 bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <Badge className={`${statusDetails.color} border px-3 py-1 rounded-full font-semibold text-sm flex items-center gap-2`}>
                {statusDetails.icon}
                {statusDetails.text}
              </Badge>
              <span className="text-white text-sm">{statusDetails.description}</span>
            </div>
            {order.trackingNumber && (
              <div className="mt-3 p-3 bg-gray-700 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-[var(--color-primary)]" />
                    <span className="text-white text-sm font-medium">Tracking Number:</span>
                    <span className="text-[var(--color-primary)] font-mono text-sm">{order.trackingNumber}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyTrackingNumber}
                    className={`${
                      copied 
                        ? 'text-green-500 border-green-500 hover:bg-green-500 hover:text-white' 
                        : 'text-[var(--color-primary)] border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Tracking Timeline</h3>
          <div className="space-y-6">
            {trackingHistory.map((event: TrackingEvent, index) => (
              <div key={event.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center border-2
                      ${event.completed
                        ? event.current
                          ? event.status === "Delivered" || event.status === "Order Confirmed"
                            ? "bg-green-500 border-green-500 ring-4 ring-green-500/20"
                            : "bg-[var(--color-primary)] border-[var(--color-primary)] ring-4 ring-[var(--color-primary)]/20"
                          : "bg-green-500 border-green-500"
                        : "bg-gray-700 border-gray-600"
                      }
                    `}
                  >
                    {event.completed ? (
                      event.current ? (
                        event.status === "Delivered" ? (
                          <Car className="h-5 w-5 text-white" />
                        ) : (
                          <Truck className="h-5 w-5 text-white" />
                        )
                      ) : (
                        <CheckCircle className="h-4 w-4 text-white" />
                      )
                    ) : (
                      <Clock className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  {index < trackingHistory.length - 1 && (
                    <div className={`w-px h-16 mt-2 ${event.completed ? "bg-green-500" : "bg-gray-600"}`} />
                  )}
                </div>
                
                <div className="flex-1 pb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">{event.status}</h4>
                    <span className="text-sm text-gray-400">{event.timestamp}</span>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{event.description}</p>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <MapPin className="h-3 w-3" />
                    {event.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Support Section */}
        <div className="p-6 border-t border-gray-700 bg-gray-800">
          <h3 className="text-lg font-semibold text-white mb-3">Need Help?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
              <Phone className="h-5 w-5 text-[var(--color-primary)]" />
              <div>
                <p className="text-white text-sm font-medium">Call Support</p>
                <p className="text-gray-400 text-xs">1-800-123-4567</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
              <Mail className="h-5 w-5 text-[var(--color-primary)]" />
              <div>
                <p className="text-white text-sm font-medium">Email Support</p>
                <p className="text-gray-400 text-xs">support@example.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700">
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-[var(--color-primary)] text-black font-bold hover:bg-[var(--color-primary)] hover:text-white transition-colors"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 