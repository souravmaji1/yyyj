"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Icons } from "@/src/core/icons";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../../dropdown";
import { Button } from "../../ui/button";
import { LucideIcon } from "lucide-react";
import { getLocalData } from "@/src/core/config/localStorage";
import { paymentAxiosClient } from "@/src/app/apis/auth/axios";

// Types
type WalletView = "tokens" | "nfts";
type IconName = keyof typeof Icons;

// Constants
const WALLET_VIEWS: { id: WalletView; icon: IconName; label: string }[] = [
  { id: "tokens", icon: "token", label: "Tokens" },
  { id: "nfts", icon: "image", label: "NFTs" },
];

const NFT_LINKS = [
  {
    href: "create-Collection",
    icon: "grid" as IconName,
    title: "My Collection",
    description: "View your NFT collection",
  },
  {
    href: "/nfts/marketplace",
    icon: "store" as IconName,
    title: "NFT Marketplace",
    description: "Buy and sell NFTs",
  },
  {
    href: "/nfts/create",
    icon: "plus" as IconName,
    title: "Create NFT",
    description: "Mint your own NFTs",
  },
];

const Wallet = () => {
  const [walletView, setWalletView] = useState<WalletView>("tokens");
  const [open, setOpen] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch wallet balance
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const userAuthDetails = getLocalData("userAuthDetails") || {};
        const userId = userAuthDetails.id || userAuthDetails.userId;

        if (!userId) {
          setIsLoading(false);
          return;
        }

        const response = await paymentAxiosClient.get(`/getUserWalletBalance/${userId}`);
        
        if (response?.data?.success) {
          const currentBalance = response.data.data.balance || 0;
          setBalance(currentBalance);
        }
      } catch (error) {
        console.error('Failed to fetch wallet balance:', error);
        // Keep balance at 0 if fetch fails
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();

    // Listen for balance updates
    const handleBalanceUpdate = (event: CustomEvent) => {
      const newBalance = event.detail.balance;
      setBalance(newBalance);
    };

    window.addEventListener('walletBalanceUpdated', handleBalanceUpdate as EventListener);
    
    return () => {
      window.removeEventListener('walletBalanceUpdated', handleBalanceUpdate as EventListener);
    };
  }, []);

  useEffect(() => {
    setOpen(false); // Auto-close on mount
  }, []);

  const handleViewChange = useCallback((view: WalletView) => {
    setWalletView(view);
  }, []);

  const renderIcon = (iconName: IconName, className: string) => {
    const IconComponent = Icons[iconName] as LucideIcon;
    return IconComponent ? <IconComponent className={className} /> : null;
  };

  const displayBalance = isLoading ? "—" : balance.toLocaleString();

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button className="bg-[var(--color-primary-700)] h-7 px-3 hover:bg-[#0060af] transition-all text-xs font-bold">
          {renderIcon("token", "h-4 w-4 mr-1 md:h-5 md:w-5 md:mr-2 animate-pulse")}
          {displayBalance}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 p-0 bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-panel)] border border-white/10 shadow-xl shadow-[var(--color-primary)]/10 rounded-xl overflow-hidden"
      >
        {/* Wallet Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 blur-xl" />
          <div className="relative p-4 md:p-5 border-b border-white/10">
            <div className="text-xs md:text-sm text-gray-300 mb-1 flex items-center">
              {renderIcon("star", "h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 text-[var(--color-primary)]")}
              Available Balance
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">
                {displayBalance}
              </span>
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 flex items-center justify-center">
                {renderIcon("token", "h-5 w-5 md:h-6 md:w-6 text-[var(--color-primary)]")}
              </div>
            </div>
            <Link href="/tokens">
              <Button className="w-full mt-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 transition-all text-xs md:text-sm">
                {renderIcon("plus", "mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4")}
                Buy More
              </Button>
            </Link>
          </div>
        </div>

        {/* View Toggle */}
        <div className="p-3 md:p-4">
          <div className="flex items-center bg-[var(--color-panel)] rounded-lg p-1 mb-3 md:mb-4 relative">
            <div
              className="absolute h-[calc(100%-8px)] top-1 transition-all duration-300 rounded-md bg-gradient-to-r from-[var(--color-primary)]/80 to-[var(--color-secondary)]/80 shadow-lg"
              style={{
                width: "calc(50% - 4px)",
                left: walletView === "tokens" ? "4px" : "calc(50% + 4px)",
              }}
            />
            {WALLET_VIEWS.map((view) => (
              <Button
                key={view.id}
                variant="ghost"
                className="flex-1 z-10 rounded-md text-white transition-colors duration-300"
                data-state={walletView === view.id ? "active" : "inactive"}
                onClick={() => handleViewChange(view.id)}
              >
                {renderIcon(view.icon, "mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4")}
                {view.label}
              </Button>
            ))}
          </div>

          {/* Content Area */}
          <div className="space-y-2">
            {walletView === "tokens" ? (
              <Link href="/tokens/history">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-300 hover:bg-[var(--color-primary)]/10 hover:text-white transition-all group h-12 px-2"
                >
                  <div className="h-8 w-8 mr-3 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center group-hover:bg-[var(--color-primary)]/20 transition-all">
                    {renderIcon("history", "h-4 w-4 text-[var(--color-primary)]")}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Transaction History</div>
                    <div className="text-xs text-gray-400 group-hover:text-gray-300">
                      View your past transactions
                    </div>
                  </div>
                </Button>
              </Link>
            ) : (
              NFT_LINKS.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-300 hover:bg-[var(--color-primary)]/10 hover:text-white transition-all group h-12 px-2"
                  >
                    <div className="h-8 w-8 mr-3 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center group-hover:bg-[var(--color-primary)]/20 transition-all">
                      {renderIcon(link.icon, "h-4 w-4 text-[var(--color-primary)]")}
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{link.title}</div>
                      <div className="text-xs text-gray-400 group-hover:text-gray-300">
                        {link.description}
                      </div>
                    </div>
                  </Button>
                </Link>
              ))
            )}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Wallet;