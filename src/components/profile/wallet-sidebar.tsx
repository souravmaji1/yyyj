"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/src/components/ui/button";
import { Icons } from "@/src/core/icons";


interface WalletSidebarProps {
  user: any;
  nfts: Array<{
    id: string;
    name: string;
    image: string;
    rarity: string;
    acquired: string;
  }>;
}

export function WalletSidebar({ user, nfts }: WalletSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Wallet Status */}
      <div className="bg-[#171432]/50 backdrop-blur-sm rounded-2xl border border-[#667085]/30 overflow-hidden wallet-card">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 blur-xl"></div>
          <div className="relative p-5 border-b border-[#667085]/30">
            <div className="text-sm text-gray-300 mb-1 flex items-center wallet-balance-label">
              <Icons.star className="h-4 w-4 mr-2 text-[var(--color-primary)]" />
              Available Balance
            </div>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] wallet-balance">
                {user?.tokenBalance || 0}
              </span>
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 flex items-center justify-center">
                <Icons.token className="h-6 w-6 text-[var(--color-primary)]" />
              </div>
            </div>
            <Link href="/tokens">
              <Button className="w-full mt-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 transition-all wallet-button">
                <Icons.plus className="mr-2 h-4 w-4" />
                Add More Tokens
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* NFT Collection */}
      <div className="bg-[#171432]/50 backdrop-blur-sm rounded-2xl border border-[#667085]/30 p-6 wallet-card">
        <h3 className="text-lg font-semibold text-white mb-4">NFT Collection</h3>
        
        {nfts.length === 0 ? (
          <div className="text-center py-6 bg-[var(--color-surface)]/30 rounded-lg">
            <Icons.image className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-400 mb-4">You don't have any NFTs yet</p>
            <Link href="/shop">
              <Button className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 transition-all wallet-button">
                <Icons.shoppingCart className="h-4 w-4 mr-2" />
                Browse NFTs
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="nft-grid">
              {nfts.map((nft) => (
                <div key={nft.id} className="bg-[var(--color-surface)]/30 rounded-lg p-3 flex items-center gap-3 hover:bg-[var(--color-surface)]/50 transition-colors nft-item">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#667085]/30">
                    <Image
                      src={nft.image}
                      alt={nft.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium truncate mb-1">{nft.name}</h4>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        nft.rarity === 'Legendary' ? 'bg-yellow-500/20 text-yellow-300' :
                        nft.rarity === 'Rare' ? 'bg-purple-500/20 text-purple-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {nft.rarity}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(nft.acquired).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Link href="create-Collection">
              <Button variant="outline" className="w-full text-white bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 transition-all border-0 mt-4 wallet-button">
                View All NFTs
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
