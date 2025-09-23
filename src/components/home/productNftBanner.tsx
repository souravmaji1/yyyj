import Link from 'next/link';
import './responsive.mobile.css';

const ProductNftBanner = () => {
    return (
        <section 
            className="relative mt-10 mb-0 productnft-mobile-fix" 
            aria-labelledby="nft-collection-heading"
        >
            <div className="container mx-auto px-4 relative z-10 pb-12">
                <Link
                    href="/shop?tab=digital"
                    aria-label="Collect Intelliverse-X NFTs"
                    className="group block rounded-[30px] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)] hover:scale-[1.02] transition-all duration-300"
                >
                    <article className="grid grid-cols-2 gap-0 rounded-[30px] pt-16 md:pt-20 pb-8 md:pb-12 bg-[url(/images/nft.png)] bg-no-repeat bg-center bg-cover group-hover:shadow-lg group-hover:shadow-[var(--color-primary)]/25">
                        {/* Left Side - Text Content */}
                        <div className="pl-12 pr-7">
                            <div className="mb-5">
                                <h2 id="nft-collection-heading" className="text-5xl 2xl:text-6xl">
                                    <span className="text-white font-semibold">Collect</span>
                                    <span className="block text-white font-semibold">
                                        Intelliverse-X NFTs
                                    </span>
                                </h2>
                                <p className="text-sm 2xl:text-base text-white font-medium max-w-md mt-3">
                                    Own exclusive NFTs that unlock special discounts, early access to new
                                    products, and unique in-game items. Play games to earn tokens and NFTs!
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-4 pb-5">
                                <div className="bg-[var(--color-primary-700)] h-10 rounded-md px-6 sm:text-base font-semibold flex items-center justify-center gap-2 text-white group-hover:bg-[#0081CC] transition-colors">
                                    View Collection
                                </div>
                            </div>
                        </div>
                        <div></div>
                    </article>
                </Link>
            </div>
        </section>
    )
}

export default ProductNftBanner;