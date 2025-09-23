"use client";

import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";

const HeroSection = () => {
  return (
    <section className="relative mt-10 mb-0">
      <div className="container mx-auto px-4 relative z-10 pb-12">
        <div className="grid grid-cols-2 gap-0 rounded-[30px]  pt-16 md:pt-20 pb-8 md:pb-12 bg-[url(/images/nft.png)] bg-no-repeat bg-center bg-cover">
          {/* Left Side - Text Content */}

          <div className="pl-12 pr-7">
            <div className="mb-5">
              <h1 className="text-5xl 2xl:text-6xl ">
                <span className="text-white font-semibold">Discover Our</span>
                <span className="block text-white font-semibold">
                  Products Today!
                </span>
              </h1>
              <p className="text-sm 2xl:text-base text-white font-medium  max-w-md mt-3">
                Unlock a world of innovation and excitement. From smart tools to
                fun experiences, our products are designed to elevate your
                lifestyle.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pb-5">
              <Link href="/arena" prefetch={true}>
                <Button
                  className="bg-[var(--color-primary-700)] btn-action-consistent text-white"
                >
                  Play To Earn
                </Button>
              </Link>
              <Link href="/shop" prefetch={true}>
                <Button className="bg-[#011A62] btn-action-consistent text-white">
                  Explore Products
                </Button>
              </Link>
            </div>
          </div>
          <div></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
