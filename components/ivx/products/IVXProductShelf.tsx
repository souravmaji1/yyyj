"use client";

import React, { useState } from "react";
import { IVXProduct, IVXProductCache } from "@/lib/ivx-types";
import { filterProductsByType } from "@/lib/ivx-fetchers";
import { IVXTabs, IVXTabsList, IVXTabsTrigger, IVXTabsContent } from "../ui/IVXTabs";
import { IVXSkeletonGrid, IVXSkeletonCard } from "../ui/IVXSkeleton";
import { IVXEmptyState, IVXErrorState } from "../ui/IVXEmptyState";
import { IVXProductCard } from "./IVXProductCard";
import { IVXButton } from "../ui/IVXButton";
import { Package, Download, ShoppingBag } from "lucide-react";

interface IVXProductShelfProps {
  title: string;
  productCache: IVXProductCache;
  onRetry?: () => void;
  onAddToCart?: (product: IVXProduct) => void;
  className?: string;
}

export function IVXProductShelf({
  title,
  productCache,
  onRetry,
  onAddToCart,
  className,
}: IVXProductShelfProps) {
  const [activeTab, setActiveTab] = useState("physical");

  const { status, items, error } = productCache;

  // Filter products by type
  const physicalProducts = filterProductsByType(items, "physical");
  const digitalProducts = filterProductsByType(items, "digital");

  // Count for tabs
  const physicalCount = physicalProducts.length;
  const digitalCount = digitalProducts.length;

  const handleAddToCart = (product: IVXProduct) => {
    onAddToCart?.(product);
    // Simulate success feedback
    // In a real app, this would trigger cart animations or notifications
  };

  if (status === "loading") {
    return (
      <div className={className}>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#E6E9F2] mb-4">{title}</h2>
          <IVXTabs defaultValue="physical">
            <IVXTabsList>
              <IVXTabsTrigger value="physical">
                <Package className="w-4 h-4 mr-2" />
                Online Products
              </IVXTabsTrigger>
              <IVXTabsTrigger value="digital">
                <Download className="w-4 h-4 mr-2" />
                Digital Products
              </IVXTabsTrigger>
            </IVXTabsList>
          </IVXTabs>
        </div>
        <IVXSkeletonGrid count={4} />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={className}>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#E6E9F2] mb-4">{title}</h2>
        </div>
        <IVXErrorState
          title="Failed to load products"
          description={error || "Something went wrong while loading products."}
          onRetry={onRetry}
        />
      </div>
    );
  }

  if (status === "success" && items.length === 0) {
    return (
      <div className={className}>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#E6E9F2] mb-4">{title}</h2>
        </div>
        <IVXEmptyState
          title="No products available"
          description="Check back later for new products related to this content."
          icon={<ShoppingBag className="w-12 h-12" />}
          action={
            <IVXButton variant="secondary" onClick={() => window.open('/shop', '_blank')}>
              Explore All Merch
            </IVXButton>
          }
        />
      </div>
    );
  }

  if (status !== "success") {
    return null;
  }

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#E6E9F2] mb-4">{title}</h2>
        
        <IVXTabs defaultValue="physical" onValueChange={setActiveTab}>
          <IVXTabsList>
            <IVXTabsTrigger value="physical">
              <Package className="w-4 h-4 mr-2" />
              Online Products
              {physicalCount > 0 && (
                <span className="ml-1 text-xs bg-[#02a7fd]/20 text-[#02a7fd] px-1.5 py-0.5 rounded-full">
                  {physicalCount}
                </span>
              )}
            </IVXTabsTrigger>
            <IVXTabsTrigger value="digital">
              <Download className="w-4 h-4 mr-2" />
              Digital Products
              {digitalCount > 0 && (
                <span className="ml-1 text-xs bg-[#22c55e]/20 text-[#22c55e] px-1.5 py-0.5 rounded-full">
                  {digitalCount}
                </span>
              )}
            </IVXTabsTrigger>
          </IVXTabsList>

          <IVXTabsContent value="physical">
            {physicalProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {physicalProducts.map((product) => (
                  <IVXProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            ) : (
              <IVXEmptyState
                title="No physical products"
                description="No physical products are available for this content."
                icon={<Package className="w-10 h-10" />}
              />
            )}
          </IVXTabsContent>

          <IVXTabsContent value="digital">
            {digitalProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {digitalProducts.map((product) => (
                  <IVXProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            ) : (
              <IVXEmptyState
                title="No digital products"
                description="No digital products are available for this content."
                icon={<Download className="w-10 h-10" />}
              />
            )}
          </IVXTabsContent>
        </IVXTabs>
      </div>
    </div>
  );
}