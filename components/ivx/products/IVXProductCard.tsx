import React from "react";
import { IVXProduct } from "@/lib/ivx-types";
import { formatPrice } from "@/lib/ivx-utils";
import { IVXCard, IVXCardContent, IVXCardFooter } from "../ui/IVXCard";
import { IVXTag } from "../ui/IVXTag";
import { IVXButton } from "../ui/IVXButton";
import { ShoppingCart, Download } from "lucide-react";

interface IVXProductCardProps {
  product: IVXProduct;
  onAddToCart?: (product: IVXProduct) => void;
  className?: string;
}

export function IVXProductCard({
  product,
  onAddToCart,
  className,
}: IVXProductCardProps) {
  const isPhysical = product.type === "physical";

  return (
    <IVXCard className={className} glowOnHover>
      <IVXCardContent className="p-0">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-t-[1.25rem]">
          {product.image ? (
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-[#0f1529] flex items-center justify-center">
              <div className="text-center text-[#9AA3B2]">
                {isPhysical ? (
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2" />
                ) : (
                  <Download className="w-12 h-12 mx-auto mb-2" />
                )}
                <p className="text-sm">No Image</p>
              </div>
            </div>
          )}
          
          {/* Type Badge */}
          <div className="absolute top-2 left-2">
            <IVXTag
              variant={isPhysical ? "primary" : "success"}
              size="sm"
            >
              {isPhysical ? "Physical" : "Digital"}
            </IVXTag>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold text-[#E6E9F2] text-base mb-2 line-clamp-2">
            {product.title}
          </h3>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-[#02a7fd]">
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {product.tags.slice(0, 3).map((tag) => (
                <IVXTag key={tag} size="sm">
                  {tag}
                </IVXTag>
              ))}
              {product.tags.length > 3 && (
                <IVXTag size="sm">
                  +{product.tags.length - 3}
                </IVXTag>
              )}
            </div>
          )}
        </div>
      </IVXCardContent>

      <IVXCardFooter className="pt-2">
        <IVXButton
          variant="primary"
          size="sm"
          className="w-full"
          onClick={() => onAddToCart?.(product)}
        >
          {isPhysical ? (
            <>
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Purchase
            </>
          )}
        </IVXButton>
      </IVXCardFooter>
    </IVXCard>
  );
}