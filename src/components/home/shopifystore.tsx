"use client";
import Link from "next/link";
import './responsive.mobile.css';

export default function ShopifyStore() {

  return (
    <section className="relative mt-14 mb-14 shopify-mobile-fix w-full">
      <div className="container mx-auto px-4 relative z-10 w-full ">
        <Link href="/vendor/register" className="block">
          <div className="grid grid-cols-2 gap-0 rounded-[30px] pt-8 md:pt-20 pb-10 md:pb-12 bg-[url(/images/shopify.png)] bg-no-repeat bg-right sm:bg-center bg-cover cursor-pointer hover:opacity-90 transition-opacity">
            {/* Left Side - Text Content */}
            <div></div>
            <div className="pl-6 pr-7">
              <div className="mb-5">
                <h1 className="text-4xl sm:text-5xl 2xl:text-6xl ">
                  <span className="text-white font-normal">Shopify</span>
                  <span className="block text-white font-semibold">
                    Store Setup
                  </span>
                </h1>
                <p className="text-sm 2xl:text-base text-white font-medium max-w-sm 2xl:max-w-md mt-3">
                  At IntelliVerse-X, we create custom, user-friendly Shopify
                  stores built to fit your business. From product pages to smooth
                  checkouts we've got you covered.
                </p>
              </div>

                <div className="flex flex-wrap gap-4 ">
                <button
                  className="bg-[#011A62] h-9 sm:h-11 rounded-md px-6 text-xs sm:text-base font-semibold flex items-center justify-center gap-2 pointer-events-none"
                >
                  Shopify Store Setup
                </button>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
