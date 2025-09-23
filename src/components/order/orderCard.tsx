import { format } from 'date-fns';
import Image from 'next/image';

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Icons } from '@/src/core/icons';
import { TokenSymbol } from '@/src/core/icons/tokenIcon';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'paid';
  amountType: string;
  total: number;
  items: OrderItem[];
  trackingNumber: string | null;
}

interface OrderCardProps {
  order: Order;
  onViewDetails: () => void;
  onTrack?: () => void;
  onCancel?: () => void;
}

export function OrderCard({ order, onViewDetails, onTrack, onCancel }: OrderCardProps) {
  const orderDate = order.date ? new Date(order.date) : new Date();
  const formattedDate = format(orderDate, 'MMM d, yyyy');
  const timeAgo = format(orderDate, 'MMM d, yyyy');

  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: 'bg-amber-100 text-amber-800 border-amber-200', text: 'Pending' };
      case 'processing':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', text: 'Processing' };
      case 'shipped':
        return { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', text: 'Shipped' };
      case 'delivered':
        return { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', text: 'Delivered' };
      case 'cancelled':
        return { color: 'bg-rose-100 text-rose-800 border-rose-200', text: 'Cancelled' };
      case 'paid':
        return { color: 'bg-green-100 text-green-800 border-green-200', text: 'Paid' };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', text: status };
    }
  };

  const statusDetails = getStatusDetails(order.status);

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 bg-[var(--color-bg)]">
      <div className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-lg">Order #{order.id.slice(0, 8)}</h3>
              <Badge className={`${statusDetails.color} border px-2.5 py-0.5 rounded-full font-semibold text-sm`}>
                {statusDetails.text}
              </Badge>
            </div>
            <p className="text-sm text-gray-400">
              Placed on {formattedDate}
            </p>
          </div>

          <p className="font-bold text-xl mt-2 sm:mt-0 text-white">
            {order.amountType === "stripe" ? "$" : <TokenSymbol />}
            {Number(order.total || 0).toFixed(2)}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          {(order.items || []).slice(0, 2).map((item) => (
            <div key={item.id} className="flex items-center gap-2 rounded-lg p-2 hover:bg-gray-800/70 transition-colors duration-200">
              <div className="h-12 w-12 rounded-lg bg-gray-900 overflow-hidden shadow-sm ring-1 ring-gray-700">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-200 truncate text-sm max-w-[120px] sm:max-w-[180px] md:max-w-[220px] lg:max-w-[250px]">{item.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                  <span className="text-gray-600">•</span>
                  <p className="text-xs text-gray-400">${item.price.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
          {order.items && order.items.length > 2 && (
            <div className="flex items-center justify-center text-xs text-gray-400 bg-gray-800/50 rounded-lg px-3 py-2 hover:bg-gray-800/70 transition-colors duration-200">
              <Icons.plus className="h-3 w-3 mr-1.5" />
              {order.items.length - 2} more items
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewDetails}
            className="flex-1 sm:flex-none text-[var(--color-secondary,#2e2d7b)] border-[var(--color-secondary,#2e2d7b)] hover:bg-[var(--color-secondary,#2e2d7b)] hover:text-white transition-all duration-200 font-medium"
          >
            <Icons.eye className="h-3.5 w-3.5 mr-1.5" />
            View Details
          </Button>

          {onTrack && (
            <Button
              variant="outline"
              size="sm"
              onClick={onTrack}
              className="flex-1 sm:flex-none text-[var(--color-primary,#02a7fd)] border-[var(--color-primary,#02a7fd)] hover:bg-[var(--color-primary,#02a7fd)] hover:text-white transition-all duration-200 font-medium"
            >
              <Icons.truck className="h-3.5 w-3.5 mr-1.5" />
              Track Order
            </Button>
          )}

          {onCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="flex-1 sm:flex-none text-rose-500 border-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-200 font-medium"
            >
              <Icons.x className="h-3.5 w-3.5 mr-1.5" />
              Cancel Order
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 