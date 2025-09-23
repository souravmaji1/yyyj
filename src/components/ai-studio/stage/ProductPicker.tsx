"use client";

import React, { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { DUMMY_PRODUCTS } from '../data';
import { useStudioStore } from '../store/useStudioStore';

export function ProductPicker() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { productId, setProduct } = useStudioStore();
  
  const currentProduct = DUMMY_PRODUCTS.find(p => p.id === productId);
  const filteredProducts = DUMMY_PRODUCTS.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductSelect = (product: typeof DUMMY_PRODUCTS[0]) => {
    setProduct(product.id, product.colors[0]?.id);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="border-gray-600 text-white hover:bg-gray-700 min-w-[200px] justify-between"
      >
        <span className="truncate">
          {currentProduct?.name || 'Search for a product'}
        </span>
        <ChevronDown className="w-4 h-4 ml-2 shrink-0" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <Card className="absolute top-full left-0 mt-2 w-80 bg-[#232f3e] border-gray-600 z-20 max-h-96 overflow-hidden">
            <CardContent className="p-0">
              {/* Search Input */}
              <div className="p-3 border-b border-gray-600">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-[var(--color-surface)] border border-gray-600 rounded text-white placeholder-gray-400 focus:border-[var(--color-primary)] focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>
              
              {/* Product List */}
              <div className="max-h-64 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className="w-full text-left p-3 hover:bg-[var(--color-surface)] transition-colors border-b border-gray-700 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      {/* Product Thumbnail */}
                      <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center">
                        {/* Placeholder for product image */}
                        <div className="w-8 h-8 bg-gray-600 rounded"></div>
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">
                          {product.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {product.colors.length} colors • ${product.msrpUSD || 'N/A'}
                        </div>
                      </div>
                      
                      {/* Color Swatches */}
                      <div className="flex space-x-1">
                        {product.colors.slice(0, 3).map((color) => (
                          <div
                            key={color.id}
                            className="w-4 h-4 rounded-full border border-gray-500"
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                          />
                        ))}
                        {product.colors.length > 3 && (
                          <div className="w-4 h-4 rounded-full bg-gray-600 flex items-center justify-center">
                            <span className="text-xs text-white">+{product.colors.length - 3}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
                
                {filteredProducts.length === 0 && (
                  <div className="p-6 text-center text-gray-400">
                    No products found matching "{searchTerm}"
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}