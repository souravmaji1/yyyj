"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { openQrModal, closeQrModal } from "@/src/store/slices/qrModalSlice";
import Hero from "../components/home/hero";
import ProductRecommendations from "../components/home/productRecomendation";
import Community from "../components/home/community";
import About from "../components/home/about";
import { TopBar } from "../components/layout/navigation/topBar";
import HeroCarousel from "../components/arena/HeroCarousel";
import ShopifyStore from "../components/home/shopifystore";
import ProductNftBanner from "../components/home/productNftBanner";
import HomepageTokensSlider from "../components/tokens/HomepageTokensSlider";
import { MainLayout } from "../components/layout/MainLayout";
import { Dialog, DialogContent } from "@/src/components/ui/dialog";
import SignupQrCodeSection from "@/src/components/auth/signup-qr-code-section";
import {
  getKioskMacFromUrl,
  isKioskInterface,
  storeKioskMacToLocalStorage,
} from "@/src/core/utils/index";
import axios from "axios";
import NetflixHeroBanner from "../components/arena/NetflixHeroBanner";
import NetflixCarousel from "../components/arena/NetflixCarousel";
import { ARENA_EVENTS } from "@/src/data/arena";
import { useRouter } from "next/navigation";

export default function Home() {
  const open = useSelector((state: any) => state.qrModal.open);
  const dispatch = useDispatch();
  const router = useRouter();
  const [machineId, setMachineId] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [checkingMachine, setCheckingMachine] = useState(false);
  const [featuredEvent, setFeaturedEvent] = useState(ARENA_EVENTS[0]!);

  const handleOpenModal = (id: string) => {
    router.push('/arena');
  };

  // Auto-rotate featured events every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setFeaturedEvent((prev) => {
        if (!prev) return ARENA_EVENTS[0]!;
        const currentIndex = ARENA_EVENTS.findIndex(
          (event) => event.id === prev.id
        );
        const nextIndex = (currentIndex + 1) % ARENA_EVENTS.length;
        return ARENA_EVENTS[nextIndex]!;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const mac = getKioskMacFromUrl();
    console.log("657789");
    setMachineId(mac);
    console.log("65778934", mac);
    if (mac) {
      storeKioskMacToLocalStorage(mac);
      localStorage.setItem("machine_id", mac);
      setCheckingMachine(true);
      console.log("65778566934", mac);
      axios
        .get(
          `${process.env.NEXT_PUBLIC_API_USER_BASE_URL}/auth/check-machine/${mac}`
        )
        .then((res) => {
          if (res.data && res.data.registered === false) {
            setShowQrModal(true);
            dispatch(openQrModal());
          } else {
            setShowQrModal(false);
            dispatch(closeQrModal());
          }
        })
        .catch(() => {
          setShowQrModal(false);
          dispatch(closeQrModal());
        })
        .finally(() => setCheckingMachine(false));
    }
    // Remove custom event listeners, not needed with Redux
  }, [dispatch]);

  // Sync showQrModal with Redux state
  useEffect(() => {
    setShowQrModal(open);
  }, [open]);

  return (
    <MainLayout>
      <div className="min-h-screen bg-[var(--color-bg)] text-white relative">
        {showQrModal && isKioskInterface() && (
          <Dialog
            open={open}
            onOpenChange={(val) =>
              val ? dispatch(openQrModal()) : dispatch(closeQrModal())
            }
          >
            <DialogContent
              className="bg-[var(--color-surface)] modal-container"
              style={{
                zIndex: 9999,
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              {machineId && (
                <div className="mb-4 text-center">
                  <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full inline-block">
                    Machine ID: {machineId}
                  </span>
                </div>
              )}
              <SignupQrCodeSection />
              <div className="flex justify-center mt-6">
                <button
                  className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-xl font-semibold shadow transition-all duration-150 btn-responsive"
                  onClick={() => dispatch(closeQrModal())}
                >
                  Skip for now
                </button>
              </div>
            </DialogContent>
          </Dialog>
        )}
        <div className="relative z-10 bg-[var(--color-bg)] home-section">
          <div className="hero-mobile-fix">
            <Hero />
          </div>
          <div className="about-mobile-fix">
            <About />
          </div>
          <div className="games-mobile-fix pt-8">
            {/* <HeroCarousel className="mx-auto mb-14" /> */}
            <div className="cursor-pointer" onClick={() => handleOpenModal('')}>
              <NetflixHeroBanner
                event={featuredEvent}
                onOpen={handleOpenModal}
                isGameTab={false}
                isPredictionTab={false}
                isTournamentTab={false}
              />
            </div>
          </div>
          <div className="gamesgrid-mobile-fix">
            <ProductRecommendations />
          </div>
          <div className="shopify-mobile-fix">
            <ShopifyStore />
          </div>
          <div className="community-mobile-fix">
            <Community />
          </div>
          <div className="games-mobile-fix">
            <HomepageTokensSlider />
          </div>
          <div className="productnft-mobile-fix">
            <ProductNftBanner />
          </div>

          {/* Trust, Safety & Legal Section */}
          <div className="py-16 px-4">
            <div className="container mx-auto max-w-6xl">
              <h2 className="text-3xl font-bold text-center mb-12">
                Trust, Safety & Legal
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* AI & Ethics */}
                <a
                  href="/ai/training-data"
                  className="block p-6 bg-[#0c1120] border border-[#0f1529] rounded-lg hover:border-brand-600/50 transition-colors"
                >
                  <h3 className="text-lg font-semibold mb-2 text-brand-600">
                    AI Training Data
                  </h3>
                  <p className="text-white/70 text-sm">
                    How we collect and govern AI training data
                  </p>
                </a>
                <a
                  href="/ai/safety"
                  className="block p-6 bg-[#0c1120] border border-[#0f1529] rounded-lg hover:border-brand-600/50 transition-colors"
                >
                  <h3 className="text-lg font-semibold mb-2 text-brand-600">
                    AI Safety
                  </h3>
                  <p className="text-white/70 text-sm">
                    Our approach to model safety and testing
                  </p>
                </a>

                {/* Privacy & Data */}
                <a
                  href="/privacy/dashboard"
                  className="block p-6 bg-[#0c1120] border border-[#0f1529] rounded-lg hover:border-brand-600/50 transition-colors"
                >
                  <h3 className="text-lg font-semibold mb-2 text-brand-600">
                    Privacy Dashboard
                  </h3>
                  <p className="text-white/70 text-sm">
                    Manage your data and privacy choices
                  </p>
                </a>
                <a
                  href="/data/export"
                  className="block p-6 bg-[#0c1120] border border-[#0f1529] rounded-lg hover:border-brand-600/50 transition-colors"
                >
                  <h3 className="text-lg font-semibold mb-2 text-brand-600">
                    Data Export
                  </h3>
                  <p className="text-white/70 text-sm">
                    Request a copy of your data
                  </p>
                </a>
                <a
                  href="/data/delete"
                  className="block p-6 bg-[#0c1120] border border-[#0f1529] rounded-lg hover:border-brand-600/50 transition-colors"
                >
                  <h3 className="text-lg font-semibold mb-2 text-brand-600">
                    Data Deletion
                  </h3>
                  <p className="text-white/70 text-sm">
                    Request deletion of personal data
                  </p>
                </a>
                <a
                  href="/cookies/preferences"
                  className="block p-6 bg-[#0c1120] border border-[#0f1529] rounded-lg hover:border-brand-600/50 transition-colors"
                >
                  <h3 className="text-lg font-semibold mb-2 text-brand-600">
                    Cookie Preferences
                  </h3>
                  <p className="text-white/70 text-sm">
                    Choose how cookies are used
                  </p>
                </a>
                <a
                  href="/privacy/choices"
                  className="block p-6 bg-[#0c1120] border border-[#0f1529] rounded-lg hover:border-brand-600/50 transition-colors"
                >
                  <h3 className="text-lg font-semibold mb-2 text-brand-600">
                    Privacy Choices
                  </h3>
                  <p className="text-white/70 text-sm">
                    Exercise your privacy rights
                  </p>
                </a>

                {/* Fairness & Gaming */}
                <a
                  href="/fairness/game-logs"
                  className="block p-6 bg-[#0c1120] border border-[#0f1529] rounded-lg hover:border-brand-600/50 transition-colors"
                >
                  <h3 className="text-lg font-semibold mb-2 text-brand-600">
                    Game Logs & Fairness
                  </h3>
                  <p className="text-white/70 text-sm">
                    Transparent audit trails for competitive play
                  </p>
                </a>
                <a
                  href="/fairness/verification"
                  className="block p-6 bg-[#0c1120] border border-[#0f1529] rounded-lg hover:border-brand-600/50 transition-colors"
                >
                  <h3 className="text-lg font-semibold mb-2 text-brand-600">
                    Player Verification
                  </h3>
                  <p className="text-white/70 text-sm">
                    When and why we ask for verification
                  </p>
                </a>
                <a
                  href="/fairness/responsible-gaming"
                  className="block p-6 bg-[#0c1120] border border-[#0f1529] rounded-lg hover:border-brand-600/50 transition-colors"
                >
                  <h3 className="text-lg font-semibold mb-2 text-brand-600">
                    Responsible Gaming
                  </h3>
                  <p className="text-white/70 text-sm">
                    Tools and policies for healthy play
                  </p>
                </a>

                {/* Legal & Support */}
                <a
                  href="/terms"
                  className="block p-6 bg-[#0c1120] border border-[#0f1529] rounded-lg hover:border-brand-600/50 transition-colors"
                >
                  <h3 className="text-lg font-semibold mb-2 text-brand-600">
                    Terms of Service
                  </h3>
                  <p className="text-white/70 text-sm">
                    Rules that govern your use of IntelliVerseX
                  </p>
                </a>
                <a
                  href="/security"
                  className="block p-6 bg-[#0c1120] border border-[#0f1529] rounded-lg hover:border-brand-600/50 transition-colors"
                >
                  <h3 className="text-lg font-semibold mb-2 text-brand-600">
                    Security
                  </h3>
                  <p className="text-white/70 text-sm">
                    How we protect data and keep the platform resilient
                  </p>
                </a>
                <a
                  href="/accessibility"
                  className="block p-6 bg-[#0c1120] border border-[#0f1529] rounded-lg hover:border-brand-600/50 transition-colors"
                >
                  <h3 className="text-lg font-semibold mb-2 text-brand-600">
                    Accessibility
                  </h3>
                  <p className="text-white/70 text-sm">
                    Our commitment to an accessible experience
                  </p>
                </a>
                <a
                  href="/sitemap"
                  className="block p-6 bg-[#0c1120] border border-[#0f1529] rounded-lg hover:border-brand-600/50 transition-colors"
                >
                  <h3 className="text-lg font-semibold mb-2 text-brand-600">
                    Sitemap
                  </h3>
                  <p className="text-white/70 text-sm">
                    Browse all public pages and resources
                  </p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
