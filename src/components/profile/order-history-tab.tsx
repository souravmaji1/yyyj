"use client";

import { useState, useEffect } from "react";

import Link from "next/link";

import { Button } from "@/src/components/ui/button";
import { Icons } from "@/src/core/icons";
import { useNotificationUtils } from "@/src/core/utils/notificationUtils";

// Mock order history
const MOCK_ORDERS = [
  {
    id: "ORD-12345",
    date: "2023-10-15",
    status: "Delivered",
    total: 129.99,
    items: 3
  },
  {
    id: "ORD-12346",
    date: "2023-09-28",
    status: "Processing",
    total: 249.50,
    items: 2
  },
  {
    id: "ORD-12347",
    date: "2023-08-17",
    status: "Cancelled",
    total: 59.99,
    items: 1
  }
];

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  items: number;
}

export function OrderHistoryTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showError } = useNotificationUtils();

  // Fetch orders on component mount
  useEffect(() => {
    const loadOrderHistory = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setOrders(MOCK_ORDERS);
      } catch (error) {
        console.error("Failed to load order history:", error);
        showError('Load Error', 'Failed to load order history');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrderHistory();
  }, [showError]);

  // Get status badge styling
  const getStatusBadgeStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-900/30 text-green-400 border border-green-700';
      case 'processing':
        return 'bg-blue-900/30 text-blue-400 border border-blue-700';
      case 'shipped':
        return 'bg-purple-900/30 text-purple-400 border border-purple-700';
      case 'cancelled':
        return 'bg-red-900/30 text-red-400 border border-red-700';
      default:
        return 'bg-yellow-900/30 text-yellow-400 border border-yellow-700';
    }
  };

  return (
    <div className="bg-[#171432]/50 backdrop-blur-sm rounded-2xl border border-[#667085]/30 p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Order History</h2>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Icons.spinner className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-8 bg-[var(--color-surface)]/30 rounded-lg">
          <Icons.shoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-400 mb-4">You haven't placed any orders yet</p>
          <Link href="/shop">
            <Button className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 transition-all">
              <Icons.shoppingCart className="h-4 w-4 mr-2" />
              Browse Products
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div 
              key={order.id}
              className="bg-[var(--color-surface)]/50 rounded-lg border border-[#667085]/30 p-4 hover:border-[var(--color-primary)]/50 transition-all"
            >
              <div className="flex flex-col sm:flex-row justify-between mb-3">
                <div>
                  <h3 className="font-medium text-white">{order.id}</h3>
                  <p className="text-sm text-gray-400">{order.date}</p>
                </div>
                <div className="mt-2 sm:mt-0">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyles(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="mb-3 sm:mb-0">
                  <p className="text-sm text-gray-400">
                    <span className="text-white font-medium">${order.total.toFixed(2)}</span>
                    <span className="mx-2">•</span>
                    <span>{order.items} {order.items === 1 ? 'item' : 'items'}</span>
                  </p>
                </div>
                
                <Link href={`/orders?id=${order.id}`}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-[#667085]/30 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]"
                  >
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {orders.length > 0 && (
        <div className="mt-6 text-center">
          <Link href="/orders">
            <Button 
              variant="outline" 
              className="border-[#667085]/30 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]"
            >
              View All Orders
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
