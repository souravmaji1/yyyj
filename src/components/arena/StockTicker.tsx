import React from 'react';
import { StockItem } from './StockItem';
import { Button } from '../ui/button';

const stockData = [
  { symbol: 'BTC-USD', price: '576.30', change: '+1.5%', isPositive: true },
  { symbol: 'ETH-USD', price: '402.23', change: '+0.47%', isPositive: true },
  { symbol: 'BNB-USD', price: '610.80', change: '+0.23%', isPositive: true },
  { symbol: 'SOL-USD', price: '164.20', change: '+0.79%', isPositive: true },
  { symbol: 'ADA-USD', price: '0.61', change: '+2.18%', isPositive: true },
  { symbol: 'DOGE-USD', price: '0.10', change: '+0.12%', isPositive: true },
  { symbol: 'ORCA-USD', price: '3.30', change: '+1.89%', isPositive: true },
  { symbol: 'ORCA-USD', price: '3.30', change: '+1.89%', isPositive: true },
  { symbol: 'ORCA-USD', price: '3.30', change: '+1.89%', isPositive: true },
  { symbol: 'ORCA-USD', price: '3.30', change: '+1.89%', isPositive: true },
  { symbol: 'ORCA-USD', price: '3.30', change: '+1.89%', isPositive: true },
];

export const StockTicker = () => {
  const handleCheckPrices = () => {
    console.log('Checking latest prices...');
  };

  return (
    <div className="bg-[var(--color-primary-700)] text-white py-2 sm:py-3 overflow-hidden relative">
      <div className="container mx-auto flex items-center">
        <div className="flex-1 overflow-hidden">
          <div className="flex animate-scroll">
            <div className="flex space-x-4 sm:space-x-8 whitespace-nowrap">
              {stockData.map((stock, index) => (
                <StockItem key={index} {...stock} />
              ))}
            </div>
            <div className="flex space-x-4 sm:space-x-8 whitespace-nowrap ml-4 sm:ml-8">
              {stockData.map((stock, index) => (
                <StockItem key={`duplicate-${index}`} {...stock} />
              ))}
            </div>
          </div>
        </div>
        
        <div className="ml-4 flex-shrink-0">
          <Button 
            onClick={handleCheckPrices}
            // variant="outline"
            size="sm"
            className="bg-[#011A62] h-11 rounded-md px-6 text-base font-semibold flex items-center justify-center gap-2"
          >
            Check Prices
          </Button>
        </div>
      </div>
    </div>
  );
};