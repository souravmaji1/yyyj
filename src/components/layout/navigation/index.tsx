"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Icons } from "@/src/core/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../../dropdown";
import { FaBasketShopping } from "react-icons/fa6";
import { IoNotificationsSharp } from "react-icons/io5";
import { useAuth } from "@/src/app/apis/auth/UserAuth";
import { RootState } from "@/src/store";
import { useSelector, useDispatch } from "react-redux";
import { signOut } from "next-auth/react";
import { AppDispatch } from "@/src/store";
import { fetchNotifications, selectNotificationCounts } from "@/src/store/slices/notificationSlice";
import { isKioskAdminOrUser, isKioskInterface, getKioskMacFromUrl, getKioskMacFromLocalStorage } from "@/src/core/utils";
import axios from "axios";
import { getHardwareSystemInfo, getHardwareHealth } from "@/src/app/apis/hardwareService";
import { openQrModal } from "@/src/store/slices/qrModalSlice";
import { AssistantButton } from "@/src/components/assistant";
import { updateTokenBalance } from "@/src/store/slices/userSlice";
import { useNotificationUtils } from '@/src/core/utils/notificationUtils';
import { useAssistant } from '@/src/hooks/useAssistant';
import { checkAdManagementAccess } from "@/src/store/slices/adManagementSlice";
import './navigation.mobile.css';

// Prefetch common routes
const COMMON_ROUTES = [
  "/shop",
  "/arena",
  "/about",
  "/setting",
  "/ads",
  "/chat",
  "/blogs",
  "/video-hub",
  "/ai-studio",
];


export function Navigation() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const isUser = useSelector((state: RootState) => state.user.profile);
  const [hasAdManagementAccess, setHasAdManagementAccess] = useState<boolean | null>(false);

  useEffect(() => {
    if (isUser && isUser.isAdManagementEnabled) {
      setHasAdManagementAccess(true);
    } else {
      setHasAdManagementAccess(false);
    }
  }, [isUser])

  // Determine if ad management should be shown
  const shouldShowAdManagement = isKioskInterface() || hasAdManagementAccess;

  const router = useRouter();
  const pathname = usePathname();
  const { showSuccess, showError } = useNotificationUtils();
  const { clearChat } = useAssistant();

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const notificationCounts = useSelector(selectNotificationCounts);

  const [walletView, setWalletView] = useState<"tokens" | "nfts">("tokens");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [healthStatus, setHealthStatus] = useState<"checking" | "healthy" | "unhealthy" | null>(null);
  const [hasMachineId, setHasMachineId] = useState<boolean>(false);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showQrButton, setShowQrButton] = useState(false);
  const [checkingMachine, setCheckingMachine] = useState(false);

  const availableTokens = useSelector((state: RootState) => state.user.profile?.tokenBalance || 0);

  const [userToken, setUserToken] = useState(0)

  // Debug logging for balance updates
  useEffect(() => {
    console.log('💰 Navigation: userToken state updated to:', userToken);
  }, [userToken]);

  useEffect(() => {
    console.log('💰 Navigation: availableTokens from Redux:', availableTokens);
  }, [availableTokens]);

  // Get unread count from Redux state
  const unreadCount = notificationCounts?.unread || 0;

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUserToken(availableTokens)
  }, [availableTokens])

  // Check if machine ID exists in localStorage
  const checkMachineId = () => {
    const machineId = localStorage.getItem('machine_id');
    setHasMachineId(!!machineId);
    return !!machineId;
  };

  // Health check function
  const checkHealthStatus = async () => {
    if (!isKioskInterface()) return;

    setHealthStatus("checking");
    try {
      const result = await getHardwareHealth();
      if (result.success && result.data?.status === "OK") {
        // Check if we already have machine ID
        const machineIdExists = checkMachineId();

        if (!machineIdExists) {
          // Fetch system info to get machine ID
          await getHardwareSystemInfo();
          checkMachineId(); // Check again after fetching
        }

        setHealthStatus("healthy");
      } else {
        setHealthStatus("unhealthy");
      }
    } catch (error) {
      console.error('Health check failed:', error);
      setHealthStatus("unhealthy");
    }
  };

  // Check health status on component mount for kiosk interface
  useEffect(() => {
    if (isKioskInterface()) {
      checkMachineId(); // Check machine ID first
      checkHealthStatus();
    }
  }, []);

  // Listen for wallet balance updates from video rewards
  useEffect(() => {
    const handleWalletBalanceUpdate = (event: CustomEvent) => {
      const newBalance = event.detail.balance;
      console.log('💰 Navigation received wallet balance update:', newBalance);
      setUserToken(newBalance);

      // Update Redux state to persist the balance across the app
      dispatch(updateTokenBalance(newBalance));
    };

    const handleRewardEarned = (event: CustomEvent) => {
      const rewardAmount = event.detail.rewardAmount;
      console.log('🎉 Navigation received reward earned:', rewardAmount, 'XUT');

      // Add the reward to current balance
      const newBalance = userToken + rewardAmount;
      setUserToken(newBalance);

      // Update Redux state
      dispatch(updateTokenBalance(newBalance));

      console.log('💰 Balance updated from', userToken, 'to', newBalance, 'XUT');
    };

    window.addEventListener('walletBalanceUpdated', handleWalletBalanceUpdate as EventListener);
    window.addEventListener('rewardEarned', handleRewardEarned as EventListener);

    return () => {
      window.removeEventListener('walletBalanceUpdated', handleWalletBalanceUpdate as EventListener);
      window.removeEventListener('rewardEarned', handleRewardEarned as EventListener);
    };
  }, [dispatch, userToken]);

  useEffect(() => {
    const mac = getKioskMacFromLocalStorage();
    if (mac) {
      setCheckingMachine(true);
      axios.get(`${process.env.NEXT_PUBLIC_API_USER_BASE_URL}/auth/check-machine/${mac}`)
        .then(res => {
          if (res.data && res.data.registered === false) {
            setShowQrButton(true);
          } else {
            setShowQrButton(false);
          }
        })
        .catch(() => setShowQrButton(false))
        .finally(() => setCheckingMachine(false));
    } else {
      setShowQrButton(false);
    }
  }, []);

  // Fetch notification counts on component mount
  useEffect(() => {
    isUser && dispatch(fetchNotifications({ page: 1, limit: 10 }));
  }, [dispatch, isUser]);

  // Check ad management access when user is logged in
  useEffect(() => {
    if (isUser && hasAdManagementAccess === null) {
      dispatch(checkAdManagementAccess());
    }
  }, [isUser, hasAdManagementAccess]);

  // Prefetch common routes on mount
  useEffect(() => {
    COMMON_ROUTES.forEach((route) => {
      router.prefetch(route);
    });
  }, [router]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!profileMenuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileMenuOpen]);

  // Close profile dropdown when wallet dropdown opens, and vice versa
  useEffect(() => {
    if (walletMenuOpen) {
      setProfileMenuOpen(false);
    }
  }, [walletMenuOpen]);

  useEffect(() => {
    if (profileMenuOpen) {
      setWalletMenuOpen(false);
    }
  }, [profileMenuOpen]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (!mobileMenuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on escape key
  useEffect(() => {
    if (!mobileMenuOpen) return;
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    // Clear chat data before logout
    clearChat();
    await signOut({ redirect: false });
    logout();
  };
  // Optimize search with useCallback and RSC handling
  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        const searchPath = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
        router.prefetch(searchPath);
        router.replace(searchPath, { scroll: false });
      }
    },
    [searchQuery, router]
  );

  // Optimize search input change with useCallback
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  const handleOpenQrModal = () => {
    router.push('/')
    dispatch(openQrModal());
  };

  // Function to check if a path is active
  const isActive = useCallback(
    (path: string) => {
      if (path === "/") {
        return pathname === "/";
      }
      return pathname?.startsWith(path) || false;
    },
    [pathname]
  );

  const getUserInitials = (user: any) => {
    if (!user) return "?";

    // Try to use firstName and lastName first
    if (user.firstName) {
      return `${user.firstName[0]}`.toUpperCase();
    }

    // Try to use name if available
    if (user.name) {
      const names = user.name.trim().split(" ").filter(Boolean);
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return names[0][0].toUpperCase();
    }

    // Try to use email as last resort
    if (user.email) {
      return user.email[0].toUpperCase();
    }

    // If no usable data available, return a default
    return "?";
  };

  const handleTokenPurchase = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = '/tokens';
  };

  return (
    <div className="nav-gradient bg-[var(--color-bg)] z-50 nav-mobile-fix">
      {/* Navigation content */}
      <nav className="glass border-b border-[#667085]/10 text-white">
        <div className="container mx-auto nav-container">
          {/* Upper Nav */}
          <div className="flex items-center min-h-[64px] md:min-h-[56px] sm:min-h-[52px] px-4 md:px-4 lg:px-6 justify-between nav-header">
            {/* Logo and search bar sections remain unchanged */}
            <Link href="/" className="flex-shrink-0 nav-logo" prefetch={true}>
              <Image
                src="/logo/intelliverse-X.svg"
                alt="IntelliVerse Logo"
                width={200}
                height={60}
                className="h-14 w-auto nav-logo"
                priority
                loading="eager"
              />
            </Link>
            <button
              className="text-white lg:hidden nav-mobile-button"
              onClick={() => setMobileMenuOpen((o) => !o)}
            >
              {mobileMenuOpen ? (
                <Icons.x className="h-6 w-6" />
              ) : (
                <Icons.menu className="h-6 w-6" />
              )}
            </button>
            {/* Right Actions */}
            <div className="hidden lg:flex items-center gap-2 sm:gap-4">
              <div className="flex items-center justify-start ml-6 md:ml-8">
                {/* Main Menu */}
                <div className="flex items-center gap-5 lg:gap-7">
                  <Link
                    href="/shop"
                    className={`inline-flex items-center h-10 text-sm font-medium transition-colors ${isActive("/shop")
                      ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]"
                      : "text-white hover:text-[var(--color-primary)]"
                      }`}
                  >
                    Shop
                  </Link>

                  <Link
                    href="/arena"
                    className={`inline-flex items-center h-10 text-sm font-medium transition-colors ${isActive("/arena")
                      ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]"
                      : "text-white hover:text-[var(--color-primary)]"
                      }`}
                  >
                    Arena
                  </Link>
                   <Link
                    href="/setting"
                    className={`inline-flex items-center h-10 text-sm font-medium transition-colors ${isActive("/setting")
                      ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]"
                      : "text-white hover:text-[var(--color-primary)]"
                      }`}
                  >
                   Setting
                  </Link>
                   <Link
                    href="/ads"
                    className={`inline-flex items-center h-10 text-sm font-medium transition-colors ${isActive("/ads")
                      ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]"
                      : "text-white hover:text-[var(--color-primary)]"
                      }`}
                  >
                   Ads
                  </Link>
                  {/* Kiosk conditional links */}
                  {(!isKioskInterface() && (
                    <>
                      <Link
                        href="/ai-studio"
                        className={`inline-flex items-center h-10 text-sm font-medium transition-colors ${isActive("/ai-studio")
                          ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]"
                          : "text-white hover:text-[var(--color-primary)]"
                          }`}
                      >
                        AI Studio
                      </Link>
                    </>
                  ))}

                  {/* Show AI Studio in kiosk mode only when user is logged in */}
                  {isKioskInterface() && isUser && (
                    <Link
                      href="/ai-studio"
                      className={`inline-flex items-center h-10 text-sm font-medium transition-colors ${isActive("/ai-studio")
                        ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]"
                        : "text-white hover:text-[var(--color-primary)]"
                        }`}
                    >
                      AI Studio
                    </Link>
                  )}
                  <Link
                    href="/video-hub"
                    className={`inline-flex items-center h-10 text-sm font-medium transition-colors ${isActive("/video-hub")
                      ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]"
                      : "text-white hover:text-[var(--color-primary)]"
                      }`}
                  >
                    Video Hub
                  </Link>
                  {
                    isKioskInterface() && (
                      <Link
                        href="/explore-ad-system"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`inline-flex items-center h-10 text-sm ${isActive("/video-hub") ? "text-[var(--color-primary)]" : "text-white"}`}
                      >
                        Discover Ad System
                      </Link>
                    )
                  }
                  {isKioskInterface() && (
                    <>
                      {/* Show green icon when health is OK and machine ID is fetched */}
                      {healthStatus === "healthy" && hasMachineId && (
                        <div className="flex items-center justify-center h-8 w-8 bg-green-600 rounded-full">
                          <Icons.check className="h-4 w-4 text-white" />
                        </div>
                      )}

                      {/* Show button when health is not OK or when health is OK but no machine ID */}
                      {(healthStatus === "unhealthy" || (healthStatus === "healthy" && !hasMachineId)) && (
                        <Button
                          onClick={async () => {
                            try {
                              const result = await getHardwareSystemInfo();
                              if (result.success) {
                                console.log('System Info:', result.data?.systemInfo);
                                checkMachineId(); // Update machine ID status
                                showSuccess('System Info Retrieved', 'System information fetched successfully! Check console for details.');
                              } else {
                                console.error('System Info Error:', result.error);
                                showError('System Info Failed', result.error || 'Failed to fetch system information.');
                              }
                            } catch (error) {
                              console.error('Error fetching system info:', error);
                              showError('System Info Failed', 'Failed to fetch system information. Check console for details.');
                            }
                          }}
                          className={`h-8 px-3 transition-all text-xs font-bold ${healthStatus === "unhealthy"
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-[var(--color-primary-700)] hover:bg-[#0060af] text-white"
                            }`}
                        >
                          Get System Info
                        </Button>
                      )}
                    </>
                  )}
                  {
                    isKioskInterface() && isUser && isKioskAdminOrUser() && (
                      <Link
                        href="/hardware-test"
                        className={`inline-flex items-center h-10 text-sm font-medium transition-colors ${isActive("/hardware-test")
                          ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]"
                          : "text-white hover:text-[var(--color-primary)]"
                          }`}
                      >
                        Kiosk Hardware Test
                      </Link>
                    )
                  }

                </div>
              </div>

              {/* QR Modal Button (only if machine is not registered) */}
              {showQrButton && !checkingMachine && (
                <Button
                  className="bg-[var(--color-primary)] h-8 px-4 hover:bg-[var(--color-primary-700)] transition-all text-xs font-bold"
                  onClick={handleOpenQrModal}
                >
                  Open QR Modal
                </Button>
              )}

              {/* Updated Search Bar */}
              {isUser && pathname === "/" && (
                <div className="flex-1 flex items-center">
                  <form
                    onSubmit={handleSearch}
                    className={`relative transition-all duration-300 ${searchFocused ? "w-[230px]" : "w-[50px]"
                      }`}
                  >
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                      placeholder="Search for products..."
                      className="z-50 relative w-full font-light px-4 py-2 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 text-white placeholder-gray-400 bg-transparent border border-gray-600 hover:border-[var(--color-primary)]/30 transition-all duration-300"
                    />
                    <div className="absolute inset-y-0 right-4 flex items-center z-[1px] cursor-pointer">
                      <Icons.search className="h-5 w-5" />
                    </div>
                  </form>
                </div>
              )}

              <div className="flex items-center gap-4 ml-auto">
                {/* Cart */}
                <Link href="/cart" className="inline-flex items-center justify-center h-10 w-10 leading-none relative hover:text-[var(--color-primary)]" aria-label="Cart">
                  <FaBasketShopping className="w-6 h-6 text-white hover:text-[var(--color-primary)]" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-[var(--color-primary)] text-[var(--color-surface)] text-[10px] md:text-xs w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center">
                      {cartItems.length}
                    </span>
                  )}
                </Link>

                {/* Assistant Button - Available for all users */}
                <div className="inline-flex items-center justify-center h-10 w-10 leading-none">
                  <AssistantButton size="sm" />
                </div>

                {isUser && (
                  <>
                    <Link
                      href="/notifications"
                      className="inline-flex items-center justify-center h-10 w-10 leading-none relative hover:text-[var(--color-primary)]"
                      aria-label="Notifications"
                    >
                      <IoNotificationsSharp className="w-6 h-6 text-white hover:text-[var(--color-primary)]" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-[var(--color-primary)] text-[var(--color-surface)] text-[10px] md:text-xs w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </Link>

                    <DropdownMenu open={walletMenuOpen} onOpenChange={setWalletMenuOpen}>
                      <DropdownMenuTrigger asChild>
                        <Button className="bg-[var(--color-primary-700)] h-7 px-3 hover:bg-[#0060af] transition-all text-xs font-bold">
                          <Icons.token className="mr-1 h-3 w-3 animate-pulse" />
                          {userToken}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-80 p-0 bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-panel)] border border-white/10 shadow-xl shadow-[var(--color-primary)]/10 rounded-xl overflow-hidden"
                      >
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 blur-xl"></div>
                          <div className="relative p-4 md:p-5 border-b border-white/10">
                            <div className="text-xs md:text-sm text-gray-300 mb-1 flex items-center">
                              <Icons.star className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 text-[var(--color-primary)]" />
                              Available Balance : {userToken} tokens
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">
                                {userToken}
                              </span>
                              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 flex items-center justify-center">
                                <Icons.token className="h-5 w-5 md:h-6 md:w-6 text-[var(--color-primary)]" />
                              </div>
                            </div>
                            <Button
                              className="w-full mt-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 transition-all text-xs md:text-sm"
                              onClick={() => {
                                window.location.href = '/tokens';
                              }}
                            >
                              <Icons.plus className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                              Buy More
                            </Button>
                          </div>
                        </div>
                        <div className="p-3 md:p-4">
                          <div className="flex items-center bg-[var(--color-panel)] rounded-lg p-1 mb-3 md:mb-4 relative gap-2">
                            <div
                              className="absolute h-[calc(100%-8px)] top-1 transition-all duration-300 rounded-md bg-gradient-to-r from-[var(--color-primary)]/80 to-[var(--color-secondary)]/80 shadow-lg"
                              style={{ width: "calc(50% - 4px)", left: walletView === "tokens" ? "4px" : "calc(50% + 4px)" }}
                            />
                            <Button
                              variant="ghost"
                              className="flex-1 z-10 rounded-md text-white transition-colors duration-300 "
                              data-state={walletView === "tokens" ? "active" : "inactive"}
                              onClick={() => setWalletView("tokens")}
                              style={{ width: "calc(50% - 4px)" }}
                            >
                              <Icons.token className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                              Tokens
                            </Button>
                            <Button
                              variant="ghost"
                              className="flex-1 z-10 rounded-md text-white transition-colors duration-300"
                              data-state={walletView === "nfts" ? "active" : "inactive"}
                              onClick={() => setWalletView("nfts")}
                            >
                              <Icons.image className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                              NFTs
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {walletView === "tokens" ? (
                              <>
                                <Link href="/tokens/history">
                                  <Button
                                    variant="ghost"
                                    className="w-full justify-start text-gray-300 hover:bg-[var(--color-primary)]/10 hover:text-white transition-all group h-12 px-2"
                                  >
                                    <div className="h-8 w-8 mr-3 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center group-hover:bg-[var(--color-primary)]/20 transition-all">
                                      <Icons.history className="h-4 w-4 text-[var(--color-primary)]" />
                                    </div>
                                    <div className="text-left">
                                      <div className="font-medium">Transaction History</div>
                                      <div className="text-xs text-gray-400 group-hover:text-gray-300">View your past transactions</div>
                                    </div>
                                  </Button>
                                </Link>
                              </>
                            ) : (
                              <>
                                <Link href="/nft-Collections">
                                  <Button
                                    variant="ghost"
                                    className="w-full justify-start text-gray-300 hover:bg-[var(--color-primary)]/10 hover:text-white transition-all h-12 px-2 group"
                                  >
                                    <div className="h-8 w-8 mr-3 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center group-hover:bg-[var(--color-primary)]/20 transition-all">
                                      <Icons.grid className="h-4 w-4 text-[var(--color-primary)]" />
                                    </div>
                                    <div className="text-left">
                                      <div className="font-medium">My Collection</div>
                                      <div className="text-xs text-gray-400 group-hover:text-gray-300">View your NFT collection</div>
                                    </div>
                                  </Button>
                                </Link>
                                {/* <Link href="/nfts/marketplace">
                                  <Button
                                    variant="ghost"
                                    className="w-full justify-start text-gray-300 hover:bg-[var(--color-primary)]/10 hover:text-white transition-all group h-12 px-2"
                                  >
                                    <div className="h-8 w-8 mr-3 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center group-hover:bg-[var(--color-primary)]/20 transition-all">
                                      <Icons.store className="h-4 w-4 text-[var(--color-primary)]" />
                                    </div>
                                    <div className="text-left">
                                      <div className="font-medium">NFT Marketplace</div>
                                      <div className="text-xs text-gray-400 group-hover:text-gray-300">Buy and sell NFTs</div>
                                    </div>
                                  </Button>
                                </Link> */}
                                <Link href="/nft-Management">
                                  <Button
                                    variant="ghost"
                                    className="w-full justify-start text-gray-300 hover:bg-[var(--color-primary)]/10 hover:text-white transition-all group h-12 px-2"
                                  >
                                    <div className="h-8 w-8 mr-3 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center group-hover:bg-[var(--color-primary)]/20 transition-all">
                                      <Icons.plus className="h-4 w-4 text-[var(--color-primary)]" />
                                    </div>
                                    <div className="text-left">
                                      <div className="font-medium">Create NFT</div>
                                      <div className="text-xs text-gray-400 group-hover:text-gray-300">Mint your own NFTs</div>
                                    </div>
                                  </Button>
                                </Link>
                              </>
                            )}
                          </div>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}

                {/* User Profile / Sign In */}
                {isUser ? (
                  <div className="relative hover:text-[var(--color-primary)]" ref={profileMenuRef}>
                    <button
                      className="relative hover:text-[var(--color-primary)]"
                      onClick={() => setProfileMenuOpen((open) => !open)}
                    >
                      {isUser.profilePicture ? (
                        <Image
                          src={isUser.profilePicture}
                          alt={isUser.firstName || "User"}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white font-medium">
                          {getUserInitials(isUser)}
                        </div>
                      )}
                    </button>
                    {profileMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-[var(--color-surface)] border border-white/20 rounded-md shadow-lg py-1 z-50">
                        {(isUser?.firstName || isUser?.lastName) && (
                          <div className="px-4 py-2 text-sm text-white border-b border-white/20">
                            {isUser?.firstName} {isUser?.lastName}
                          </div>
                        )}
                        <Link
                          href="/profile"
                          className="flex items-center px-4 py-2 text-sm text-white hover:!bg-white/10 focus:!bg-white/10"
                        >
                          <Icons.user className="mr-2 h-4 w-4" />
                          Profile
                        </Link>

                        <Link
                          href="/orders"
                          className="flex items-center px-4 py-2 text-sm text-white hover:!bg-white/10 focus:!bg-white/10"
                        >
                          <Icons.store className="mr-2 h-4 w-4" />
                          Orders
                        </Link>

                        <Link
                          href="/tryon-history"
                          className="flex items-center px-4 py-2 text-sm text-white hover:!bg-white/10 focus:!bg-white/10"
                        >
                          <Icons.camera className="mr-2 h-4 w-4" />
                          Try-On History
                        </Link>

                        {shouldShowAdManagement && (
                          <Link
                            href="/ad-management"
                            className="flex items-center px-4 py-2 text-sm text-white hover:!bg-white/10 focus:!bg-white/10"
                          >
                            <Icons.image className="mr-2 h-4 w-4" />
                            Ad Management
                          </Link>
                        )}


                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:!bg-white/10 focus:!bg-white/10"
                        >
                          <Icons.logout className="mr-2 h-4 w-4" />
                          Log out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <Link
                      href="/auth"
                      className="text-white hover:text-white p-0"
                    >
                      <button className="bg-[var(--color-primary-700)] h-11 rounded-md px-6 text-base font-semibold flex items-center justify-center gap-2 self-center">
                        Sign In
                        <Image
                          src="/icons/signin.svg"
                          alt="IntelliVerse Logo"
                          width={16}
                          height={16}
                          className="h-4 w-auto"
                        />
                      </button>
                    </Link>
                  </div>
                )}
              </div>{" "}
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <div ref={mobileMenuRef} className="lg:hidden border-t border-white/10 bg-[var(--color-bg)] nav-mobile-menu open">
            <div className="nav-mobile-menu-header">
              <h2 className="nav-mobile-menu-title">Menu</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="nav-mobile-menu-close"
              >
                <Icons.x className="h-6 w-6" />
              </button>
            </div>
            <div className="nav-mobile-menu-content">
              {/* Mobile Search */}
              <div className="nav-mobile-search">
                <input
                  type="text"
                  placeholder="Search..."
                  className="nav-mobile-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Mobile Navigation Links */}
              <ul className="nav-mobile-links">
                <li className="nav-mobile-link-item">
                  <Link
                    href="/shop"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`nav-mobile-link ${isActive("/shop") ? "active" : ""}`}
                  >
                    <Icons.store className="nav-mobile-link-icon" />
                    Shop
                  </Link>
                </li>
                <li className="nav-mobile-link-item">
                  <Link
                    href="/cart"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`nav-mobile-link ${isActive("/cart") ? "active" : ""} relative`}
                  >
                    <FaBasketShopping className="nav-mobile-link-icon" />
                    Cart
                    {cartItems.length > 0 && (
                      <span className="absolute top-2 right-4 bg-[var(--color-primary)] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {cartItems.length}
                      </span>
                    )}
                  </Link>
                </li>
                <li className="nav-mobile-link-item">
                  <Link
                    href="/arena"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`nav-mobile-link ${isActive("/arena") ? "active" : ""}`}
                  >
                    <Icons.gamepad className="nav-mobile-link-icon" />
                    Arena
                  </Link>
                </li>
                {/* Kiosk conditional links for mobile */}
                {(!isKioskInterface() && (
                  <li className="nav-mobile-link-item">
                    <Link
                      href="/ai-studio"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`nav-mobile-link ${isActive("/ai-studio") ? "active" : ""}`}
                    >
                      <Icons.sparkles className="nav-mobile-link-icon" />
                      AI Studio
                    </Link>
                  </li>
                ))}

                {/* Show AI Studio in kiosk mode only when user is logged in (mobile) */}
                {isKioskInterface() && isUser && (
                  <li className="nav-mobile-link-item">
                    <Link
                      href="/ai-studio"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`nav-mobile-link ${isActive("/ai-studio") ? "active" : ""}`}
                    >
                      <Icons.sparkles className="nav-mobile-link-icon" />
                      AI Studio
                    </Link>
                  </li>
                )}
                <li className="nav-mobile-link-item">
                  <Link
                    href="/video-hub"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`nav-mobile-link ${isActive("/video-hub") ? "active" : ""}`}
                  >
                    <Icons.play className="nav-mobile-link-icon" />
                    Video Hub
                  </Link>
                </li>
                {
                  isKioskInterface() && (
                    <li className="nav-mobile-link-item">
                      <Link
                        href="/explore-ad-system"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`nav-mobile-link ${isActive("/explore-ad-system") ? "active" : ""}`}
                      >
                        <Icons.search className="nav-mobile-link-icon" />
                        Discover Ad System
                      </Link>
                    </li>
                  )
                }
                {
                  isKioskInterface() && isUser && isKioskAdminOrUser() && (
                    <li className="nav-mobile-link-item">
                      <Link
                        href="/hardware-test"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`nav-mobile-link ${isActive("/hardware-test") ? "active" : ""}`}
                      >
                        <Icons.settings className="nav-mobile-link-icon" />
                        Kiosk Hardware Test
                      </Link>
                    </li>
                  )
                }
              </ul>

              {/* Mobile User Section */}
              <div className="nav-mobile-user-section">
                {isUser ? (
                  <div>
                    <div className="nav-mobile-user-info">
                      {isUser.profilePicture ? (
                        <img
                          src={isUser.profilePicture}
                          alt={isUser.firstName || "User"}
                          className="nav-mobile-user-avatar"
                        />
                      ) : (
                        <div className="nav-mobile-user-avatar bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white font-medium">
                          {getUserInitials(isUser)}
                        </div>
                      )}
                      <div className="nav-mobile-user-details">
                        <div className="nav-mobile-user-name">
                          {isUser?.firstName} {isUser?.lastName}
                        </div>
                        <div className="nav-mobile-user-email">
                          {isUser?.email}
                        </div>
                      </div>
                    </div>
                    <ul className="nav-mobile-links">
                      <li className="nav-mobile-link-item">
                        <Link
                          href="/profile"
                          onClick={() => setMobileMenuOpen(false)}
                          className={`nav-mobile-link ${isActive("/profile") ? "active" : ""}`}
                        >
                          <Icons.user className="nav-mobile-link-icon" />
                          Profile
                        </Link>
                      </li>
                      <li className="nav-mobile-link-item">
                        <Link
                          href="/orders"
                          onClick={() => setMobileMenuOpen(false)}
                          className={`nav-mobile-link ${isActive("/orders") ? "active" : ""}`}
                        >
                          <Icons.store className="nav-mobile-link-icon" />
                          Orders
                        </Link>
                      </li>
                      <li className="nav-mobile-link-item">
                        <Link
                          href="/tryon-history"
                          onClick={() => setMobileMenuOpen(false)}
                          className={`nav-mobile-link ${isActive("/tryon-history") ? "active" : ""}`}
                        >
                          <Icons.camera className="nav-mobile-link-icon" />
                          Try-On History
                        </Link>
                      </li>
                      {shouldShowAdManagement && (
                        <li className="nav-mobile-link-item">
                          <Link
                            href="/ad-management"
                            onClick={() => setMobileMenuOpen(false)}
                            className={`nav-mobile-link ${isActive("/ad-management") ? "active" : ""}`}
                          >
                            <Icons.settings className="nav-mobile-link-icon" />
                            Ad Management
                          </Link>
                        </li>
                      )}
                    </ul>

                    <div className="nav-mobile-auth-buttons">
                      <button
                        onClick={logout}
                        className="nav-mobile-auth-button nav-mobile-logout-button"
                      >
                        <Icons.logout className="w-4 h-4" />
                        Log out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="nav-mobile-auth-buttons">
                    <Link
                      href="/auth"
                      onClick={() => setMobileMenuOpen(false)}
                      className="nav-mobile-auth-button nav-mobile-login-button"
                    >
                      Sign In
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}