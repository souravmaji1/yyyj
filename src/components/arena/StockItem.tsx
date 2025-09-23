import React from 'react';

interface StockItemProps {
  symbol: string;
  price: string;
  change: string;
  isPositive: boolean;
}

export const StockItem: React.FC<StockItemProps> = ({ symbol, price, change, isPositive }) => {
  return (
    <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-medium">
      <span className="text-white font-semibold">{symbol}</span>
      <span className="text-white">${price}</span>
      <span className={`${isPositive ? 'text-green-400' : 'text-red-400'} font-semibold`}>
        {change}
      </span>
    </div>
  );
};