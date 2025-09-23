"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/src/components/ui/button";
import { IoNotificationsSharp } from "react-icons/io5";
import { FaBasketShopping } from "react-icons/fa6";
import { IoMdSunny } from "react-icons/io";
import Wallet from "./wallet";
import { AppDispatch, RootState } from "@/src/store";
import { fetchNotifications, selectNotificationCounts } from "@/src/store/slices/notificationSlice";
import { getKioskMacFromUrl, isKioskInterface } from "@/src/core/utils/index";
import axios from "axios";


export function TopBar() {
  const [walletView, setWalletView] = useState<"tokens" | "nfts">("tokens");
  const dispatch = useDispatch<AppDispatch>();
  const notificationCounts = useSelector(selectNotificationCounts);
  const isUser = useSelector((state: RootState) => state.user.profile);
  const [showQrButton, setShowQrButton] = useState(false);
  const [checkingMachine, setCheckingMachine] = useState(false);

  // Fetch notification counts on component mount
  useEffect(() => {
    if (isUser) {
      dispatch(fetchNotifications({ page: 1, limit: 10 }));
    }
  }, [dispatch, isUser]);

  useEffect(() => {
    const mac = getKioskMacFromUrl();
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

  const handleOpenQrModal = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('open-qr-modal'));
    }
  };

  // Get unread count from Redux state
  const unreadCount = notificationCounts?.unread || 0;
  //   const cartItems = useCartStore((state: { items: CartItem[] }) => state.items);
  //   const cartItemCount = cartItems.reduce(
  //     (sum: number, item: CartItem) => sum + item.quantity,
  //     0
  //   );
  //   const { user, setUser } = useUser();
  const router = useRouter();

  //   // Debug user state
  //   useEffect(() => {
  //     console.log("Navigation: Current user state", user);

  //     // Check localStorage directly
  //     const userStr = localStorage.getItem("userAuthDetails");
  //     if (userStr) {
  //       try {
  //         const userData = JSON.parse(userStr);
  //         console.log("Navigation: User data in localStorage", userData);
  //         // Update user context if it's not set or if the data is different
  //         if (!user || JSON.stringify(user) !== JSON.stringify(userData)) {
  //           setUser(userData);
  //         }
  //       } catch (error) {
  //         console.error("Error parsing user data from localStorage", error);
  //       }
  //     } else {
  //       console.log("Navigation: No user data in localStorage");
  //     }
  //   }, [user, setUser]);

  const handleVendorClick = () => {
    router.push("/vendor/register");
  };

  return (
    <div className="nav-gradient bg-[#021A62] z-50">
      {/* Navigation content */}
      <nav className="glass border-b border-[#667085]/10 text-white">
        <div className="container mx-auto px-4">
          {/* Upper Nav */}
          <div className="py-2 flex items-center gap-8 justify-between">
            <div className="flex items-center gap-2">
              <span className="text-white text-xs font-bold ">
                {" "}
                $Chain <span className="ms-3 me-3"> | </span> $ 0.0342
                <span className="ms-0 me-3">USD </span> |{" "}
                <span className="text-[#EA030F] ms-3 me-3"> -3.42%</span>
              </span>
              <Button className="bg-[var(--color-primary-700)] h-6 px-2 hover:bg-[#0060af] transition-all text-xs font-bold">
                <span className="inline">Buy now</span>
              </Button>
            </div>
            {/* Right Actions */}
            <div className="flex items-center gap-4">
              {/* Join - Hidden on mobile */}
              <Button
                className="bg-[var(--color-primary-700)] h-6 px-2 hover:bg-[#0060af] transition-all text-xs font-bold"
                onClick={handleVendorClick}
              >
                <span className="hidden md:inline">Join</span>
                <span className="inline md:hidden">Vendor</span>
              </Button>

              {/* Tokens Button */}
              <Wallet />

              {/* QR Modal Button (only if machine is not registered) */}
              {showQrButton && !checkingMachine && isKioskInterface() && (
                <Button
                  className="bg-[var(--color-primary)] h-6 px-2 hover:bg-[var(--color-primary-700)] transition-all text-xs font-bold"
                  onClick={handleOpenQrModal}
                >
                  Open QR Modal
                </Button>
              )}

              <span className="relative hover:text-[var(--color-primary)] cursor-pointer">
                <IoMdSunny className="text-white text-xl" />

                {/* {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-[var(--color-primary)] text-[var(--color-surface)] text-[10px] md:text-xs w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )} */}
              </span>

              <Link href="/cart" className="relative hover:text-[var(--color-primary)]">
                <FaBasketShopping className="text-white text-xl" />

                {/* {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-[var(--color-primary)] text-[var(--color-surface)] text-[10px] md:text-xs w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )} */}
              </Link>

              <Link
                href="/notifications"
                className="relative hover:text-[var(--color-primary)]"
              >
                <IoNotificationsSharp className="text-white text-xl" />

                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[var(--color-primary)] text-[var(--color-surface)] text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}