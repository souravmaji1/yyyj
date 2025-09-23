"use client";

import Link from "next/link";
import './responsive.mobile.css';

export default function About() {
    return (
        <section className="relative mt-14 mb-14 about-mobile-fix">
            <div className="container mx-auto px-2 sm:px-4 relative z-10">
                <Link href="/about" aria-label="Learn more about IntelliVerse-X">
                    <div className="w-full grid grid-cols-2 gap-0 rounded-[20px] p-4 md:pt-20 pb-8 pt-8 md:pb-12 bg-[url(/images/about.png)] bg-no-repeat bg-center bg-cover cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[var(--color-primary)]/20 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-50">
                        {/* Left Side - Text Content */}
                        <div></div>
                        <div className="pl-6 sm:pl-12 lg:pl-20 pr-7">
                            <div className="mb-5">
                                <h1 className="text-4xl sm:text-5xl 2xl:text-6xl">
                                    <span className="text-white font-normal">About</span>
                                    <span className="block text-white font-semibold">
                                        IntelliVerse-X
                                    </span>
                                </h1>
                                <p className="text-sm 2xl:text-base text-white font-medium lg:max-w-[320px] 2xl:max-w-[480px] mt-3">
                                    where you play games, earn crypto rewards, and collect NFTs.
                                    Join our smart kiosks and online marketplace to turn your wins
                                    into digital assets.
                                </p>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        </section>
    );
}
