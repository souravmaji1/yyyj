import Link from "next/link";


const ShopHeader = () => {
    return (
        <div className="relative bg-[var(--color-surface)] py-4 mb-0 overflow-hidden">
            <div className="absolute inset-0 bg-[url('/gaming-pattern.svg')] opacity-10" />
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col gap-2 mt-16">
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        Shop
                    </h1>
                    <div className="flex items-center gap-3 text-sm text-white/95">
                        <Link
                            href="/"
                            className="hover:text-white transition-colors duration-200"
                        >
                            Home
                        </Link>
                        <span className="text-white/60">/</span>
                        <span className="text-white font-medium">Shop</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ShopHeader;  
