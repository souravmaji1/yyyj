"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Button } from "@/src/components/ui/button";
import { CarouselItem } from "@/src/components/ui/carousel";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icons } from "@/src/core/icons";
import { AppDispatch, RootState } from "@/src/store";
import { useCustomSession } from "@/src/app/SessionProvider";
import { setClientCookie, setLocalData } from "@/src/core/config/localStorage";
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchUserAddresses,
  fetchUserProfile,
  fetchWalletBalance,
} from "@/src/store/slices/userSlice";
import { useNotificationUtils } from "@/src/core/utils/notificationUtils";
import './hero.mobile.css'; // Import the mobile-specific CSS

// Constants
const HERO_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80",
    alt: "Gaming setup with high-end equipment",
  },
  {
    src: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80",
    alt: "Professional gaming environment",
  },
  {
    src: "https://images.unsplash.com/photo-1533236897111-3e94666b2edf?auto=format&fit=crop&q=80",
    alt: "Modern gaming station",
  },
] as const;

// Memoized Components
const StatItem = ({ value, label }: { value: string; label: string }) => (
  <div>
    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--color-primary)]">
      {value}
    </div>
    <div className="text-xs sm:text-sm md:text-base text-gray-300">{label}</div>
  </div>
);

const CarouselImage = ({
  image,
  index,
}: {
  image: (typeof HERO_IMAGES)[number];
  index: number;
}) => (
  <CarouselItem>
    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-surface)]/90 to-[var(--color-primary)]/50" />
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
        priority={index === 0}
        className="object-cover opacity-60"
      />
      <div className="absolute inset-0">
        <div className="absolute top-4 sm:top-6 md:top-8 left-4 sm:left-6 md:left-8 opacity-30 hidden sm:block">
          <Icons.monitor className="w-8 h-8 md:w-12 md:h-12" />
        </div>
        <div className="absolute top-4 sm:top-6 md:top-8 right-4 sm:right-6 md:right-8 opacity-30 hidden sm:block">
          <Icons.camera className="w-6 h-6 md:w-9 md:h-9" />
        </div>
      </div>
      <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-0 right-0 flex justify-center gap-2 md:gap-4">
        <Button className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] transition-all duration-200 shadow-lg hover:shadow-[var(--color-primary)]/20 hover:shadow-xl border-none px-3 md:px-6 h-9 md:h-10 text-xs md:text-sm">
          <Icons.gamepad className="mr-1 md:mr-2 h-3 w-3 md:h-5 md:w-5" />
          Play Now
        </Button>
        <Button
          variant="outline"
          className="border-[var(--color-primary)] text-[var(--color-primary)] transition-all duration-200 px-6 hover:text-[var(--color-secondary)]"
        >
          <Icons.token className="mr-2 h-5 w-5" />
          Earn Tokens
        </Button>
      </div>
    </div>
  </CarouselItem>
);

export default function Hero() {
  const router = useRouter();
  const userId = useSelector((state: RootState) => state.user.profile?.id);
  const { showError } = useNotificationUtils();

  const dispatch = useDispatch<AppDispatch>();


  // Add effect to fetch wallet balance when component mounts
  useEffect(() => {
    if (userId) {
      dispatch(fetchWalletBalance(userId));
    }
  }, [dispatch, userId]);

  const { session, status, isAuthenticated, isLoading } = useCustomSession();

  const handleAuthSuccess = async (response: any) => {
    console.log("Auth Success Response34:", response);

    if (!response?.accessToken) {
      console.error("No access token in response");
      return false;
    }

    try {
      const expirySeconds = 30 * 24 * 60 * 60;

      // Save auth tokens
      setClientCookie("accessToken", response.accessToken, {
        path: "/",
        maxAge: expirySeconds,
      });

      if (response.refreshToken) {
        setClientCookie("refreshToken", response.refreshToken, {
          path: "/",
          maxAge: expirySeconds,
        });
      }

      if (response.idToken) {
        setClientCookie("idToken", response.idToken, {
          path: "/",
          maxAge: expirySeconds,
        });
      }

      // Fetch user data
      await dispatch(fetchUserProfile());
      await dispatch(fetchUserAddresses());

      // Persist basic user details only
      setLocalData("userAuthDetails", {
        ...response.user,
      });

      router.push("/");
      return true;
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage =
        typeof error === "string" ? error : error.message || "Login failed";
      showError('Login Failed', errorMessage);
      return false;
    }
  };

  // Watch for session changes
  useEffect(() => {
    console.log("sessio1n", session);
    console.log("isLoading2", isLoading);
    console.log("isAuthenticated3", isAuthenticated);
    if (!isLoading && isAuthenticated && session?.accessToken) {
      handleAuthSuccess(session);
    }
  }, [session, status, isAuthenticated, isLoading]);

  return (
    <section className="relative min-h-[300px]  sm:min-h-[400px] 2xl:min-h-[600px] flex items-center pt-6 sm:pt-16 md:pt-20 pb-4 sm:pb-8 md:pb-12 bg-[url(/images/banner.png)] bg-no-repeat bg-center bg-cover w-full hero-mobile-fix">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 gap-0 items-start">
          {/* Left Side - Text Content */}
          <div>
            <div className="mb-5">
              <h1 className="text-3xl sm:text-4xl md:text-5xl 2xl:text-6xl text-white font-normal">
                Play Games
                <span className="block font-semibold">Earn Crypto Rewards</span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base 2xl:text-lg text-white font-medium max-w-xs sm:max-w-md md:max-w-xl 2xl:max-w-2xl mt-3">
                Welcome to Intelliverse-X! Play your favorite games, earn crypto rewards, and collect unique NFTs through our smart kiosk network and online marketplace.
              </p>
              
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 pb-5 mt-6">
                <Link href="/arena" prefetch={true}>
                  <Button className="bg-[var(--color-primary-700)] btn-action-consistent text-white">
                    Play to Earn
                  </Button>
                </Link>
                <Link href="/tokens" prefetch={true}>
                  <Button className="bg-[var(--color-secondary)] btn-action-consistent text-white">
                    Buy XUT
                  </Button>
                </Link>
                <Link href="/video-hub" prefetch={true}>
                  <Button className="bg-[var(--color-primary-700)] btn-action-consistent text-white">
                    Watch to Earn
                  </Button>
                </Link>
                <Link href="/shop" prefetch={true}>
                  <Button className="bg-[var(--color-secondary)] btn-action-consistent text-white">
                    Explore Products
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
