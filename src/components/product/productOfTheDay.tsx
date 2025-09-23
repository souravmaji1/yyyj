import Image from "next/image";
import { Button } from "../ui/button";
import { Icons } from "@/src/core/icons";
import Link from "next/link";
import { DUMMY_IMAGES, productOfTheDay } from "@/src/constants";
import { useState } from "react";
import { Spinner } from "../ui/spinner";
import { Product } from "@/src/store/slices/productSlice";
import { TokenSymbol } from "@/src/core/icons/tokenIcon";

const ProductOfTheDay = ({ featuredProduct, featuredLoading, featuredError }: { featuredProduct: Product, featuredLoading: boolean, featuredError?: string }) => {
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20 border-t border-gray-700 pt-10">
            <div className="bg-[var(--color-surface)] rounded-2xl overflow-hidden relative">
                <Image
                    src={productOfTheDay.images[0] || DUMMY_IMAGES}
                    alt="Discount Banner"
                    width={400}
                    height={400}
                    className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-surface)] via-[var(--color-surface)]/50 to-transparent" />
                <div className="absolute top-1/2 left-8 -translate-y-1/2">
                    <h3 className="text-4xl font-bold mb-4 font-previous">
                        NFT HOLDER DISCOUNT
                    </h3>
                    <p className="text-white mb-4">
                        Own an Intelliverse-X NFT? Get exclusive discounts!
                    </p>
                    <Button className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:from-[var(--color-primary)]/90 hover:to-[var(--color-secondary)]/90 text-white transition-all duration-200 shadow-lg hover:shadow-[var(--color-primary)]/20 hover:shadow-xl border-none">
                        <Icons.token className="mr-2 h-5 w-5" />
                        Shop With NFT
                    </Button>
                </div>
            </div>

            {/* Middle Column - Featured Product */}
            <div className="bg-[var(--color-surface)] rounded-2xl p-6 relative">
                <div className="border-2 border-white/10 rounded-2xl p-4">
                    <h3 className="text-white font-semibold mb-2 font-previous">
                        Featured Gear
                    </h3>
                    <p className="text-[#667085] text-sm mb-4 font-previous">
                        Carefully chosen by our team. Explore our handpicked favorite.
                    </p>

                    {featuredLoading ? (
                        <div className="flex justify-center items-center h-[300px]">
                            <Spinner />
                        </div>
                    ) : featuredError ? (
                        <div className="text-red-500 text-center p-4">
                            {featuredError}
                        </div>
                    ) : featuredProduct ? (
                        <div className="relative mt-4 group">
                            <Link href={`/product/${featuredProduct.id}`}>
                                <div className="relative h-[300px] w-full">
                                    {imageLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                                            <Spinner />
                                        </div>
                                    )}
                                    <Image
                                        src={featuredProduct?.imageUrl || DUMMY_IMAGES}
                                        alt={featuredProduct.title}
                                        width={300}
                                        height={300}
                                        className={`w-full h-[300px] object-contain rounded-lg transition-transform duration-300 group-hover:scale-105 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                                        onLoad={() => setImageLoading(false)}
                                        onError={() => {
                                            setImageLoading(false);
                                            setImageError(true);
                                        }}
                                    />
                                    {imageError && (
                                        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                                            <Icons.image className="w-12 h-12 text-gray-600" />
                                        </div>
                                    )}
                                </div>
                            </Link>

                            {/* NFT Discount Badge */}
                            {/* {featuredProduct?.nftDiscount?.available && (
                                <div className="absolute bottom-2 left-2 bg-purple-600 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2 z-10">
                                    <Icons.token className="w-4 h-4" />
                                    NFT: {featuredProduct.nftDiscount.discountPercentage}% OFF
                                </div>
                            )} */}

                            {/* Quick Actions */}
                            <div className="absolute bottom-2 right-2 flex gap-2 z-10">
                                <Link href={`/product/${featuredProduct.id}`}>
                                    <Button size="sm" className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white">
                                        <Icons.eye className="w-4 h-4 mr-1" />
                                        View Details
                                    </Button>
                                </Link>
                            </div>

                            {/* Product Info Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-start p-4 -top-3">
                                <Link href={`/product/${featuredProduct.id}`} className="cursor-pointer">
                                    <h4 className="text-white font-medium text-lg mb-1 hover:text-[var(--color-primary)] transition-colors">
                                        {featuredProduct.title}
                                    </h4>
                                </Link>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-[var(--color-primary)] font-bold">
                                        ${featuredProduct.variants?.[0]?.price}
                                    </span>
                                    {featuredProduct.variants?.[0]?.compare_at_price && (
                                        <span className="text-gray-400 line-through">
                                            ${featuredProduct.variants?.[0]?.compare_at_price}
                                        </span>
                                    )}
                                </div>
                                <div className="text-gray-300 text-sm mt-1">
                                    {featuredProduct.variants?.[0]?.inventory_quantity && featuredProduct.variants[0].inventory_quantity < 1 && 'Out of stock'}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-500 text-center p-4">
                            No featured product available
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column - Product Details */}
            <div className="bg-[var(--color-surface)] rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10" />
                <div className="relative z-10">
                    <div className="bg-[var(--color-primary)] text-white px-4 py-1 rounded-full  mb-4 font-previous flex gap-1 w-fit items-center">
                        <TokenSymbol /> {productOfTheDay.price} {""} TOKENS
                    </div>
                    <h2 className="text-3xl font-bold mb-6 font-previous text-white">
                        {productOfTheDay.name}
                    </h2>
                    <p className="text-gray-300 mb-8 font-previous">
                        {productOfTheDay.description}
                    </p>

                    {productOfTheDay.nftDiscount?.available && (
                        <div className="mb-6 bg-purple-900/30 p-4 rounded-lg border border-purple-500/30">
                            <h4 className="text-purple-400 font-semibold flex items-center mb-2">
                                <Icons.token className="mr-2 h-4 w-4" />
                                NFT Holder Discount
                            </h4>
                            <p className="text-white text-sm">
                                Own the {productOfTheDay.nftDiscount.nftName}? Get{" "}
                                {productOfTheDay.nftDiscount.discountPercentage}% off this
                                product!
                            </p>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <Button className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:from-[var(--color-primary)]/90 hover:to-[var(--color-secondary)]/90 text-white transition-all duration-200 shadow-lg hover:shadow-[var(--color-primary)]/20 hover:shadow-xl border-none">
                            <Icons.shoppingCart className="mr-2 h-5 w-5" />
                            Buy with Tokens
                        </Button>
                        <Link href={`/product/${productOfTheDay.id}`}>
                            <Button
                                variant="outline"
                                className="border-[var(--color-primary)] text-[var(--color-primary)] hover:text-[var(--color-secondary)]"
                            >
                                <Icons.eye className="mr-2 h-5 w-5" />
                                View Details
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[var(--color-primary)]/10 rounded-full" />
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[var(--color-secondary)]/10 rounded-full" />
            </div>
        </div>
    )
}

export default ProductOfTheDay;