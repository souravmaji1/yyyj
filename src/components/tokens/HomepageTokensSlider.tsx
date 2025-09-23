"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/src/components/ui/carousel";
import { TokenPackageCard } from "./TokenPackageCard";
import { SubscriptionPlanCard } from "./SubscriptionPlanCard";
import { tokenPackages, subscriptionPlans, TokenPackage } from "@/src/lib/tokens-config";
import { Icons } from "@/src/core/icons";
import { Button } from "@/src/components/ui/button";

type SlideType = 'packages' | 'subscriptions';

export default function HomepageTokensSlider() {
  const [activeSlide, setActiveSlide] = useState<SlideType>('subscriptions');
  const router = useRouter();

  // Analytics event handlers (prepared for future implementation)
  const handleTokensSliderImpression = useCallback(() => {
    // TODO: Analytics event: tokens_slider_impression
    console.log('Analytics: tokens_slider_impression');
  }, []);

  const handleSlideChange = useCallback((slide: SlideType) => {
    setActiveSlide(slide);
    // TODO: Analytics event: tokens_slider_tab_switch
    console.log('Analytics: tokens_slider_tab_switch', { tab: slide });
  }, []);

  const handlePackageSelect = useCallback((pkg: TokenPackage) => {
    // Navigate to tokens page for package selection
    router.push('/tokens');
  }, [router]);

  return (
    <section className="relative py-16 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Fuel Your Journey with <span aria-label="X Universe Token">XUT</span>
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Buy once or subscribe monthly — seamless checkout, same IntelliVerseX style.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-[var(--color-surface)]/50 backdrop-blur-sm rounded-lg p-1 border border-[#667085]/20">
            <div className="flex gap-1">
              <Button
                variant="ghost"
                onClick={() => handleSlideChange('packages')}
                className={`relative px-6 py-3 rounded-md font-medium transition-all duration-300 ${
                  activeSlide === 'packages'
                    ? 'bg-[var(--color-primary)] text-white shadow-lg'
                    : 'bg-[#011A62] text-white'
                }`}
              >
                <Icons.token className="h-4 w-4 mr-2" />
                Token Packages
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleSlideChange('subscriptions')}
                className={`relative px-6 py-3 rounded-md font-medium transition-all duration-300 ${
                  activeSlide === 'subscriptions'
                    ? 'bg-[var(--color-primary)] text-white shadow-lg'
                    : 'bg-[#011A62] text-white'
                }`}
              >
                <Icons.refresh className="h-4 w-4 mr-2" />
                Subscriptions
              </Button>
            </div>
          </div>
        </div>

        {/* Slide Content */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {activeSlide === 'packages' && (
              <motion.div
                key="packages"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {tokenPackages.map((pkg) => (
                  <TokenPackageCard
                    key={pkg.id}
                    package={pkg}
                    onSelect={handlePackageSelect}
                  />
                ))}
              </motion.div>
            )}

            {activeSlide === 'subscriptions' && (
              <motion.div
                key="subscriptions"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch"
              >
                {subscriptionPlans.map((plan) => (
                  <SubscriptionPlanCard
                    key={plan.id}
                    plan={plan}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => handleSlideChange('packages')}
            aria-current={activeSlide === 'packages'}
            className={`w-2 h-2 mx-1 rounded-full transition-all duration-300 ${
              activeSlide === 'packages'
                ? 'bg-[var(--color-primary)] scale-125'
                : 'bg-white/30 hover:bg-white/50'
            }`}
            aria-label="View token packages"
          />
          <button
            onClick={() => handleSlideChange('subscriptions')}
            aria-current={activeSlide === 'subscriptions'}
            className={`w-2 h-2 mx-1 rounded-full transition-all duration-300 ${
              activeSlide === 'subscriptions'
                ? 'bg-[var(--color-primary)] scale-125'
                : 'bg-white/30 hover:bg-white/50'
            }`}
            aria-label="View subscription plans"
          />
        </div>
      </div>
    </section>
  );
}