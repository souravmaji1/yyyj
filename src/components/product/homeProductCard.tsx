import { DUMMY_IMAGES, ERROR_IMAGE } from "@/src/constants";
import { Product } from "@/src/store/slices/productSlice";
import { Eye, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Spinner } from "../ui/spinner";
import { Icons } from "@/src/core/icons";
import QuickView from "./quickView";
import { addToCart, updateQuantity } from "@/src/store/slices/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/store";
import { useCartNotification } from "@/src/hooks/useCartNotification";
import { useNotificationUtils } from "@/src/core/utils/notificationUtils";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"; // or your modal component
import { isKioskInterface } from "@/src/core/utils";
import { useRouter } from "next/navigation";



interface ProductCardProps {
    product: Product;
}

const HomeProductCard = ({ product }: ProductCardProps) => {
    const [quantity, setQuantity] = useState(1);
    const [quickViewOpen, setQuickViewOpen] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);
    const [showKycPrompt, setShowKycPrompt] = useState(false);

    const user = useSelector((state: RootState) => state.user.profile);
    const router = useRouter();



    const productImage = product.imageUrl || (product.media && product.media.length > 0 ? product.media[0]?.src : null) || DUMMY_IMAGES;

    // Get the default variant
    const defaultVariant = product?.variants?.[0];

    // Check if imageUrl is a video
    const isImageUrlVideo = product.imageUrl?.match(/\.(mp4|webm|ogg|mov|avi)$/i);

    const dispatch = useDispatch();
    const cartError = useSelector((state: RootState) => state.cart.error);
    const { showCartNotification, CartNotificationComponent } = useCartNotification();
    const { showOutOfStock, showError } = useNotificationUtils();

    const kycStatus = user?.kycStatus;

    const handleAddToCart = async (e?: React.MouseEvent): Promise<boolean> => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        if (!defaultVariant) {
            showError('Product Error', 'Product variant not available');
            return false;
        }
        
        if (defaultVariant.inventory_quantity !== null && defaultVariant.inventory_quantity <= 0) {
            showOutOfStock();
            return false;
        }
        if (
            product.ageRestriction && kycStatus !== "verified" ||
            product.ageRestriction && kycStatus === 'pending' ||
            product.ageRestriction && kycStatus === 'rejected'
        ) {
            setShowKycPrompt(true);
            return false;
        }
        
        if (!defaultVariant) {
            showError("Product variant not available");
            return false;
        }
        
        try {
            // Create cart item from default variant
            let dimensionValue = null;
            if (defaultVariant?.dimensions &&
                defaultVariant.dimensions.width &&
                defaultVariant.dimensions.length &&
                defaultVariant.dimensions.height &&
                parseFloat(defaultVariant.dimensions.width) > 0 &&
                parseFloat(defaultVariant.dimensions.length) > 0 &&
                parseFloat(defaultVariant.dimensions.height) > 0) {
                dimensionValue = JSON.stringify({
                    h: defaultVariant.dimensions.height,
                    w: defaultVariant.dimensions.width,
                    l: defaultVariant.dimensions.length
                });
            }

            let weightValue = null;
            if (defaultVariant?.weight &&
                parseFloat(defaultVariant.weight) > 0) {
                if (defaultVariant?.weight_unit) {
                    weightValue = `${defaultVariant.weight}${defaultVariant.weight_unit}`;
                } else {
                    weightValue = String(defaultVariant.weight);
                }
            }

            const cartItem = {
                productId: product.id,
                variantId: defaultVariant.id,
                shopifyId: defaultVariant.shopifyId,
                title: product.title,
                price: defaultVariant.price,
                compareAtPrice: defaultVariant.compare_at_price,
                color: defaultVariant.color || null,
                size: defaultVariant.sizes || null,
                length: defaultVariant.measurementType || null,
                dimension: dimensionValue,
                weight: weightValue,
                quantity: quantity,
                image: product?.media?.[0]?.src || null,
                inventoryQuantity: defaultVariant.inventory_quantity,
                tokenPrice: defaultVariant.tokenPrice,
                productHandle: product.handle || '',
                variantTitle: defaultVariant.title,
                soldBy: product.vendor,
                isDigital: product.productFormat?.toLowerCase() === 'digital'
            };

            dispatch(addToCart(cartItem));

            if (cartError) {
                showError('Cart Error', cartError);
                return false;
            }

            // Show attractive cart notification
            showCartNotification({
                title: product.title,
                image: product?.media?.[0]?.src,
                price: Number(defaultVariant.price),
                tokenPrice: defaultVariant.tokenPrice ? Number(defaultVariant.tokenPrice) : undefined,
                quantity: quantity
            });

            setQuickViewOpen(false);
            return true;
        } catch (error) {
            showError('Add to Cart Failed', 'Failed to add item to cart. Please try again.');
            return false;
        } finally {
            setQuickViewOpen(false);
        }
    };

    const handleBuyNow = async (e: React.MouseEvent) => {
        e.preventDefault();
        
        // For kiosk interface, add to cart and redirect to cart
        if (isKioskInterface()) {
            const added = await handleAddToCart();
            if (added) {
                setTimeout(() => {
                    router.push('/cart');
                }, 300);
            }
        } else {
            // For regular interface, redirect to product detail page
            router.push(`/product/${product.id}`);
        }
    };

    return (
        <>
            <Link
                href={`/product/${product?.id}`}
                aria-label={`View ${product?.title}`}
                className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)]"
            >
                <article className="bg-[#00000059] p-5 rounded-xl overflow-hidden border-[1px] border-[#1D1F34] group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-[var(--color-primary)]/10 transition-transform duration-300">
                    <div className="relative">
                        <div className="relative h-48 w-full">
                            {imageLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                                    <Spinner />
                                </div>
                            )}
                            {isImageUrlVideo ? (
                                <video
                                    src={product.imageUrl || ''}
                                    className="w-full h-full object-cover"
                                    controls
                                    muted
                                    loop
                                    playsInline
                                >
                                    Your browser does not support the video tag.
                                </video>
                            ) : (
                                <Image
                                    src={productImage || DUMMY_IMAGES}
                                    alt={product?.title || 'Product Image'}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className={`object-cover object-top transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                                    priority={false}
                                    onLoad={() => {
                                        setImageLoading(false);
                                        setImageError(false);
                                    }}
                                    onError={() => {
                                        setImageLoading(false);
                                        setImageError(true);
                                        // Force use of dummy image on error
                                        const imgElement = document.querySelector(`img[alt="${product?.title || 'Product Image'}"]`);
                                        if (imgElement) {
                                            (imgElement as HTMLImageElement).src = DUMMY_IMAGES;
                                        }
                                    }}
                                />
                            )}
                            {imageError && (
                                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                                    <Icons.image className="w-12 h-12 text-gray-600" />
                                </div>
                            )}
                        </div>

                        {product.isBestseller && (
                            <div className="absolute top-2 left-2 bg-[var(--color-primary)] text-white text-xs px-2 py-1 rounded">
                                Bestseller
                            </div>
                        )}

                        {product?.discount && (
                            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                                {product.discount}% OFF
                            </div>
                        )}

                        {product?.ageRestriction && (
                            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded flex items-center">
                                <Icons.alertCircle className="w-3 h-3 mr-1" />
                                18+
                            </div>
                        )}

                        {product?.isTrial && (
                            <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded flex items-center">
                                <Icons.sparkles className="w-3 h-3 mr-1" />
                                Try It Out
                            </div>
                        )}

                        {product?.nftDiscount && (
                            <div className="absolute bottom-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded flex items-center">
                                <Icons.token className="w-3 h-3 mr-1" />
                                NFT: {product?.nftDiscount?.discountPercentage}% OFF
                            </div>
                        )}

                        <div className="absolute top-1 right-1 flex flex-col gap-2">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setQuickViewOpen(true);
                                }}
                                className="p-2 bg-[#667085] rounded-full shadow-lg hover:bg-[var(--color-surface)] transition-colors opacity-0 group-hover:opacity-100"
                                aria-label="Quick view product"
                            >
                                <Eye className="w-4 h-4 text-white" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleAddToCart(e);
                                }}
                                className="p-2 bg-[#667085] rounded-full shadow-lg hover:bg-[var(--color-surface)] transition-colors opacity-0 group-hover:opacity-100"
                                aria-label="Add to cart"
                            >
                                <ShoppingCart className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    </div>

                    <div className="py-4 px-0 pb-1">
                        <h3 className="text-white text-center font-semibold mb-4 text-[16px] leading-tight group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                            {product?.title}
                        </h3>
                    </div>
                </article>
            </Link>
            <QuickView
                open={quickViewOpen}
                onOpenChange={setQuickViewOpen}
                product={product}
            />
            <CartNotificationComponent />
            <Dialog open={showKycPrompt} onOpenChange={setShowKycPrompt}>
                <DialogContent className="bg-[var(--color-bg)] rounded-xl p-8">
                    <DialogHeader>
                        <DialogTitle className="text-center text-white text-2xl font-bold mb-2">Age-Restricted Product</DialogTitle>
                    </DialogHeader>
                    <div className="text-center py-4">
                        <p className="mb-4 text-lg font-semibold text-white">
                            This product is for users aged <span className="text-red-500">18 and above</span>.
                        </p>
                        <p className="mb-6 text-gray-300">
                            To access or purchase this item, you need to complete KYC (Know Your Customer) verification.<br/>
                            If your KYC is pending, rejected, or failed, please re-upload your documents to proceed.<br/>
                            Once verified, you’ll be able to add age-restricted products to your cart.<br/>
                            Please complete your verification to continue.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
                            <button
                                className="bg-[var(--color-primary-700)] text-white px-6 py-2 rounded font-bold hover:bg-[#005f8a] transition w-full sm:w-auto"
                                onClick={() => window.location.href = '/kyc'}
                            >
                                Start Verification
                            </button>
                            <button
                                className="px-6 py-2 rounded border border-gray-300 text-gray-200 hover:bg-gray-100/10 transition w-full sm:w-auto"
                                onClick={() => setShowKycPrompt(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default HomeProductCard;