"use client";

import { useState, memo } from "react";

import { Github, Twitter, Youtube, MessageSquare, X, Shield, Database, Gamepad2, Mail, MapPin, Heart, Users, Award } from "lucide-react";
import Link from "next/link";
import { AiOutlineDiscord } from "react-icons/ai";
import Image from "next/image";
import { NAV_LINKS, YOUTUBE_CHANNELS } from "@/src/constants";
import { isKioskInterface } from "@/src/core/utils";


// Separate components for better code organization and performance
const YoutubePopup = memo(({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-[var(--color-surface)] rounded-lg p-4 sm:p-6 max-w-md w-full mx-4 relative">
            <button
                onClick={onClose}
                className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-400 hover:text-white"
                aria-label="Close popup"
            >
                <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Our YouTube Channels</h3>
            <div className="space-y-2 sm:space-y-3">
                {YOUTUBE_CHANNELS.map(({ name, url }) => (
                    <Link
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-[#2E3B4E] hover:bg-[#3A4B62] transition-colors"
                    >
                        <Youtube className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                        <span className="text-sm sm:text-base text-white">{name}</span>
                    </Link>
                ))}
            </div>
        </div>
    </div>
));

YoutubePopup.displayName = 'YoutubePopup';

export const Footer = memo(function Footer() {
    const [showYoutubePopup, setShowYoutubePopup] = useState(false);

    return (
        <footer className="border-t border-white/10 bg-[#011A62]">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Original Three-Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {/* Logo Section */}
                    <div className="space-y-4">
                        <Link href="/" className="flex-shrink-0 flex justify-center md:justify-start">
                            <Image
                                src="/logo/intelliverse-X.svg"
                                alt="IntelliVerse Logo"
                                width={240}
                                height={90}
                                className="h-24 w-auto"
                                priority
                            />
                        </Link>
                        <p className="text-sm text-white/70 text-center md:text-left max-w-sm mx-auto md:mx-0">
                            The future of gaming, powered by AI and blockchain technology. 
                            Earn real rewards while playing your favorite games.
                        </p>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex items-center justify-center w-full">
                        <ul className="flex items-center justify-center gap-4 sm:gap-8">
                            {NAV_LINKS.filter(({ label }) => {
                                if (isKioskInterface() && (label === "Blogs" || label === "Join")) {
                                    return false;
                                }
                                return true;
                            }).map(({ href, label }) => {
                                return (
                                    <li key={href}>
                                        <Link
                                            href={href}
                                            className="text-xs sm:text-sm font-medium text-white hover:text-[var(--color-primary)] transition-colors duration-200"
                                        >
                                            {label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Social Connect Section */}
                    <div className="flex flex-col items-center md:items-end space-y-4">
                        <h3 className="text-lg font-semibold text-white">Connect</h3>
                        <div className="flex gap-3">
                                {[
                                    { onClick: () => setShowYoutubePopup(true), icon: Youtube, label: "YouTube" },
                                    { href: "https://discord.gg/YVPxPFftMQ", icon: AiOutlineDiscord, label: "Discord" },
                                    { href: "https://twitter.com", icon: Twitter, label: "Twitter" }
                                ].map(({ href, icon: Icon, onClick, label }, index) => (
                                    onClick ? (
                                        <button
                                            key={index}
                                            onClick={onClick}
                                            className="bg-white text-slate-900 hover:bg-slate-100 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all duration-200 w-8 h-8 rounded-full flex items-center justify-center hover:text-[var(--color-primary)]"
                                            aria-label={`Open ${label}`}
                                        >
                                            <Icon className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <Link
                                            key={index}
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-white text-slate-900 hover:bg-slate-100 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all duration-200 w-8 h-8 rounded-full flex items-center justify-center hover:text-[var(--color-primary)]"
                                            aria-label={`Visit our ${label}`}
                                        >
                                            <Icon className="w-4 h-4" />
                                        </Link>
                                    )
                                ))}
                        </div>
                    </div>
                </div>

                {/* Comprehensive Footer Links Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 py-8 border-t border-white/10">
                    {/* Company */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-white text-sm">Company</h4>
                        <ul className="space-y-2">
                            {[
                                { href: "/about", label: "About Us" },
                                { href: "/careers", label: "Careers" },
                                { href: "/press", label: "Press Kit" },
                                { href: "/investors", label: "Investors" },
                                { href: "/blogs", label: "Blog" }
                            ].map(({ href, label }) => (
                                <li key={href}>
                                    <Link href={href} className="text-xs text-white/70 hover:text-white transition-colors duration-200">
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Platform */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-white text-sm">Platform</h4>
                        <ul className="space-y-2">
                            {[
                                { href: "/arena", label: "Gaming Arena" },
                                { href: "/ai-studio", label: "AI Studio" },
                                { href: "/shop", label: "Marketplace" },
                                { href: "/tokens", label: "XUT Tokens" },
                                { href: "/shop?tab=digital", label: "NFT Collections" }
                            ].map(({ href, label }) => (
                                <li key={href}>
                                    <Link href={href} className="text-xs text-white/70 hover:text-white transition-colors duration-200">
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* AI Transparency */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                            <Shield className="w-4 h-4 text-[var(--color-primary)]" />
                            AI Transparency
                        </h4>
                        <ul className="space-y-2">
                            {[
                                { href: "/ai/ethics", label: "AI Ethics" },
                                { href: "/ai/models", label: "Model Info" },
                                { href: "/ai/bias-mitigation", label: "Bias Prevention" },
                                { href: "/ai/training-data", label: "Training Data" },
                                { href: "/ai/safety", label: "AI Safety" }
                            ].map(({ href, label }) => (
                                <li key={href}>
                                    <Link href={href} className="text-xs text-white/70 hover:text-white transition-colors duration-200">
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Data Control Center */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                            <Database className="w-4 h-4 text-[var(--color-primary)]" />
                            Data Control
                        </h4>
                        <ul className="space-y-2">
                            {[
                                { href: "/privacy/dashboard", label: "Privacy Dashboard" },
                                { href: "/data/export", label: "Export Data" },
                                { href: "/data/delete", label: "Delete Account" },
                                { href: "/cookies/preferences", label: "Cookie Settings" },
                                { href: "/privacy/choices", label: "Your Choices" }
                            ].map(({ href, label }) => (
                                <li key={href}>
                                    <Link href={href} className="text-xs text-white/70 hover:text-white transition-colors duration-200">
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Game Fairness & RNG */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                            <Gamepad2 className="w-4 h-4 text-[var(--color-primary)]" />
                            Game Fairness
                        </h4>
                        <ul className="space-y-2">
                            {[
                                { href: "/fairness/rng-audit", label: "RNG Audit" },
                                { href: "/fairness/game-logs", label: "Game Logs" },
                                { href: "/fairness/verification", label: "Verify Results" },
                                { href: "/fairness/responsible-gaming", label: "Responsible Gaming" },
                                { href: "/fairness/transparency", label: "Fair Play Policy" }
                            ].map(({ href, label }) => (
                                <li key={href}>
                                    <Link href={href} className="text-xs text-white/70 hover:text-white transition-colors duration-200">
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support & Legal */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-white text-sm">Support & Legal</h4>
                        <ul className="space-y-2">
                            {[
                                { href: "/support", label: "Help Center" },
                                { href: "/contact", label: "Contact Us" },
                                { href: "/privacy", label: "Privacy Policy" },
                                { href: "/terms", label: "Terms of Service" },
                                { href: "/security", label: "Security" }
                            ].map(({ href, label }) => (
                                <li key={href}>
                                    <Link href={href} className="text-xs text-white/70 hover:text-white transition-colors duration-200">
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-8 border-t border-white/10">
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                        <Mail className="w-4 h-4 text-[var(--color-primary)]" />
                        <span className="text-sm text-white/70">sales@intelli-verse-x.ai</span>
                    </div>
                    <div className="flex items-center gap-3 justify-center md:justify-end">
                        <MapPin className="w-4 h-4 text-[var(--color-primary)]" />
                        <span className="text-sm text-white/70">San Francisco, CA</span>
                    </div>
                </div>

                {/* Mission Statement */}
                <div className="text-center py-6 border-t border-white/10">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <Heart className="w-4 h-4 text-red-400" />
                        <Users className="w-4 h-4 text-[var(--color-primary)]" />
                        <Award className="w-4 h-4 text-yellow-400" />
                    </div>
                    <p className="text-sm text-white/70 max-w-2xl mx-auto">
                        Building the future of gaming with transparency, fairness, and innovation. 
                        Empowering players worldwide through AI-driven experiences and blockchain technology.
                    </p>
                </div>
            </div>

            {/* Copyright Section */}
            <div className="pt-5 border-t border-[#FFFFFF0D] text-center">
                <div className="max-w-7xl mx-auto px-4 pb-5 w-full">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-xs sm:text-sm text-white/70 text-center md:text-left">
                            © {new Date().getFullYear()} Intelliverse X. All rights reserved.
                        </p>
                        <div className="flex items-center gap-4">
                            <Link href="/accessibility" className="text-xs text-white/70 hover:text-white transition-colors">
                                Accessibility
                            </Link>
                            <Link href="/sitemap" className="text-xs text-white/70 hover:text-white transition-colors">
                                Sitemap
                            </Link>
                            <span className="text-xs text-white/70">
                                Made with ❤️ in Silicon Valley
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* YouTube Channels Popup */}
            {showYoutubePopup && <YoutubePopup onClose={() => setShowYoutubePopup(false)} />}
        </footer>
    );
});
