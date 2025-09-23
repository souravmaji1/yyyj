import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../dropdown";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Icons } from "@/src/core/icons";
import { FaBasketShopping } from "react-icons/fa6";
import { isKioskInterface } from "@/src/core/utils";


const SubNavigation = () => {

    const pathname = usePathname();
    const router = useRouter();
    const [searchFocused, setSearchFocused] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");

    const isActive = (path: string) => {
        if (path === "/") {
            return pathname === "/";
        }
        return pathname?.startsWith(path) || false;
    };


    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <>
            <div className="flex items-center justify-start mr-6">
                {/* Main Menu */}
                <div className="flex items-center gap-4 md:gap-8">
                    <Link
                        href="/shop"
                        className={`text-sm font-medium transition-colors ${isActive("/shop")
                                ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]"
                                : "text-white hover:text-[var(--color-primary)]"
                            }`}
                    >
                        Shop
                    </Link>
                    <Link
                        href="/arena"
                        className={`text-sm font-medium transition-colors ${isActive("/arena")
                                ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]"
                                : "text-white hover:text-[var(--color-primary)]"
                            }`}
                    >
                        Arena
                    </Link>
                    {!isKioskInterface() && (
                        <>
                    <Link
                        href="/ai-studio"
                        className={`text-sm font-medium transition-colors ${isActive("/ai-studio")
                                ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]"
                                : "text-white hover:text-[var(--color-primary)]"
                            }`}
                    >
                        AI Studio
                    </Link>
                    <Link
                        href="/chat"
                        className={`text-sm font-medium transition-colors ${isActive("/chat")
                                ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]"
                                : "text-white hover:text-[var(--color-primary)]"
                            }`}
                    >
                        Chat
                            </Link>
                        </>
                    )}
                    <Link
                        href="/video-hub"
                        className={`text-sm font-medium transition-colors ${isActive("/video-hub")
                                ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]"
                                : "text-white hover:text-[var(--color-primary)]"
                            }`}
                    >
                        Video Hub
                    </Link>
                </div>
            </div>

            {/* Updated Search Bar */}
            {pathname === "/" && (
            <div className="flex-1 flex items-center">
                <form
                    onSubmit={handleSearch}
                    className={`relative transition-all duration-300 ${searchFocused ? "w-[250px]" : "w-[55px]"
                        }`}
                >
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        placeholder="Search for products..."
                        className="z-50 relative w-full font-light px-4 py-2.5 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 text-white placeholder-gray-400 bg-transparent border border-gray-600 hover:border-[var(--color-primary)]/30 transition-all duration-300"
                    />
                    <div className="absolute inset-y-0 right-5 flex items-center z-[1px] cursor-pointer">
                        <Icons.search className="h-5 w-5" />
                    </div>
                </form>
            </div>
            )}

        </>
    )
};

export default SubNavigation;