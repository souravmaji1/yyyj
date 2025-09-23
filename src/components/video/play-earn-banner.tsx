"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import cryptoBanner from "@/public/images/crypto-banner.png"
interface PlayEarnBannerProps {
  headingClassName?: string
}

export function PlayEarnBanner({ headingClassName }: PlayEarnBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-[20px] ring-1 ring-white/10">
      <div className="relative h-48 w-full md:h-56">
        <Image
          src={cryptoBanner}
          alt="Neon crypto themed background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        <div className="absolute left-6 top-6 max-w-lg">
          <h3 className={cn(headingClassName, "text-balance text-2xl font-bold md:text-3xl")}>
            Play & Earn Crypto
          </h3>
          <p className="mt-1 text-sm text-white/85">
            Earn rewards by watching and playing.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <a
              href="/arena"
              className="inline-flex items-center justify-center rounded-[8px] bg-[#0072AF] h-7 px-3  px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 hover:text-white"
            >
              Play to Earn
            </a>
            <a
              href="/shop"
              className="inline-flex items-center justify-center rounded-[8px] border border-white/30 px-5 py-2.5 text-sm font-medium text-white/90 transition-colors bg-white/10 hover:bg-white/20 hover:text-white"
            >
              Explore Products
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
