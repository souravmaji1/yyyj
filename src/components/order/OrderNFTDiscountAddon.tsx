"use client";
import { Tag, Percent } from "lucide-react";

interface NFTDiscountAddonProps {
    nftDiscount?: {
        nftName: string;
        nftImage: string;
        discountPercent: number;
        collectionName: string;
    };
    discountAmount?: number;
}

export function OrderNFTDiscountAddon({ nftDiscount, discountAmount }: NFTDiscountAddonProps) {
    if (!nftDiscount) return null;
    return (
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-lg p-3 mb-3 mt-2">
            <div className="flex items-center gap-3">
                <img
                    src={nftDiscount.nftImage || "/placeholder.svg"}
                    alt={nftDiscount.nftName}
                    className="w-10 h-10 object-cover rounded-lg"
                />
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <Tag size={14} className="text-blue-400" />
                        <span className="text-white text-sm font-medium">{nftDiscount.nftName}</span>
                        <span className="text-green-400 text-sm font-semibold flex items-center gap-1">
                            <Percent size={12} />
                            {nftDiscount.discountPercent}% OFF
                        </span>
                    </div>
                    <p className="text-gray-400 text-xs">{nftDiscount.collectionName}</p>
                </div>
                <div className="text-right">
                    <p className="text-green-400 font-semibold text-sm">-${discountAmount?.toFixed(2)}</p>
                    <p className="text-gray-400 text-xs">saved</p>
                </div>
            </div>
        </div>
    );
} 