import { Icons } from "@/src/core/icons";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useSelector } from 'react-redux';
import { RootState } from "@/src/store";
import { useAuth } from "@/src/app/apis/auth/UserAuth";
import { useAssistant } from '@/src/hooks/useAssistant';

const Profile = () => {
    const isUser = useSelector((state: RootState) => state.user.profile);
    const [profileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
    const { logout } = useAuth();
    const { clearChat } = useAssistant();
    const profileRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getUserInitials = (user: any) => {
        if (!user) return "?";

        // Try to use firstName and lastName first
        if (user.firstName && user.lastName) {
            return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
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

    return (
        <>
            {isUser ? (
                <div className="relative hover:text-[var(--color-primary)]" ref={profileRef}>
                    <button
                        className="relative hover:text-[var(--color-primary)]"
                        onClick={() => setIsProfileMenuOpen((open) => !open)}
                    >
                        {isUser?.profilePicture ? (
                            <Image
                                src={isUser?.profilePicture}
                                alt={isUser?.firstName || "User"}
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
                            <div className="px-4 py-2 text-sm text-white border-b border-white/20">
                                {isUser?.firstName} {isUser?.lastName}
                            </div>
                            <Link
                                href="/profile"
                                className="flex items-center px-4 py-2 text-sm text-white hover:!bg-[var(--color-primary-50)]/20 focus:!bg-[var(--color-primary-50)]/20"
                            >
                                <Icons.user className="mr-2 h-4 w-4" />
                                Profile
                            </Link>
                            <Link
                                href="/orders"
                                className="flex items-center px-4 py-2 text-sm text-white hover:!bg-[var(--color-primary-50)]/20 focus:!bg-[var(--color-primary-50)]/20"
                            >
                                <Icons.package className="mr-2 h-4 w-4" />
                                Orders
                            </Link>
                            <button
                                onClick={() => {
                                    clearChat();
                                    logout();
                                }}
                                className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:!bg-[var(--color-primary-50)]/20 focus:!bg-[var(--color-primary-50)]/20"
                            >
                                <Icons.logout className="mr-2 h-4 w-4" />
                                Log out
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <>

                    <div className="flex gap-4">
                        <Link
                            href="/auth"
                            className="text-white hover:text-white p-0"
                        > <button
                            className="bg-[var(--color-primary-700)] h-11 rounded-md px-6 text-base font-semibold flex items-center justify-center gap-2">
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

                        <Link
                            href="/auth?mode=signup"
                            className="text-white hover:text-white p-0"
                        >
                            <button
                                className="bg-[#011A62] h-11 rounded-md px-6 text-base font-semibold flex items-center justify-center gap-2">

                                Sign Up
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
                </>
            )}
        </>
    )
};

export default Profile;