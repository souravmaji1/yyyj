import { Icons } from "@/src/core/icons";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import Image from "next/image";
import { Button } from "../ui/button";
import Link from "next/link";
import { TokenSymbol } from "@/src/core/icons/tokenIcon";
import { useState } from "react";
import { truncateText } from "@/src/core/helper/text";
import { DUMMY_IMAGES } from "@/src/constants";
import { Spinner } from "../ui/spinner";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, updateQuantity } from "@/src/store/slices/cartSlice";
import { RootState } from "@/src/store";
import { useCartNotification } from "@/src/hooks/useCartNotification";
import { useNotificationUtils } from "@/src/core/utils/notificationUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

interface QuickViewProps {
    product: any;
    open: boolean;
    outOfStock?: boolean;
    onOpenChange: (open: boolean) => void;
}

interface Variant {
    id: string;
    color: string | null;
    sizes: string | null;
    measurementType: string | null;
    inventory_quantity: number | null;
    price: string;
    compare_at_price: string | null;
    tokenPrice: string;
    shopifyId: string;
    title: string;
    dimensions?: {
        width: number;
        length: number;
        height: number;
    };
    weight?: number;
}

interface Option {
    name: string;
    values: string[];
}

const QuickView = ({ open, onOpenChange, product }: QuickViewProps) => {

    const [showFullDescription, setShowFullDescription] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);
    const descriptionText = product?.bodyHtml?.replace(/<[^>]*>/g, '').trim() || "This is a valuable product";

    const wordCount = descriptionText.split(/\s+/).length;

    const wordLimit = 20;

    const truncatedDescription = wordCount > wordLimit ?
        truncateText(descriptionText, wordLimit) : descriptionText;
    const shouldShowButton = wordCount > wordLimit;

    const [quantity, setQuantity] = useState(1);
    const [showKycPrompt, setShowKycPrompt] = useState(false);


    // Get the default variant
    const defaultVariant = product?.variants?.[0];
    const maxInventory = defaultVariant?.inventory_quantity || 0;
    const outOfStock = !defaultVariant?.inventory_quantity || defaultVariant?.inventory_quantity <= 0;


    const productImage = product.media && product.media.length > 0
        ? product.media[0].src
        : product.imageUrl || DUMMY_IMAGES;

    const dispatch = useDispatch();
    const cartError = useSelector((state: RootState) => state.cart.error);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const { showCartNotification, CartNotificationComponent } = useCartNotification();
    const { showOutOfStock, showError, showWarning } = useNotificationUtils();
    const user = useSelector((state: RootState) => state.user.profile);
    const kycStatus = user?.kycStatus;

    // Quantity control handlers
    const handleDecreaseQuantity = () => {
        const newQuantity = Math.max(1, quantity - 1);
        setQuantity(newQuantity);

        // Update cart quantity if item exists
        if (defaultVariant) {
            dispatch(updateQuantity({
                productId: product.id,
                variantId: defaultVariant.id,
                quantity: newQuantity
            }));
        }
    };

    const handleIncreaseQuantity = () => {
        if (quantity < maxInventory) {
            const newQuantity = quantity + 1;
            setQuantity(newQuantity);

            // Update cart quantity if item exists
            if (defaultVariant) {
                dispatch(updateQuantity({
                    productId: product.id,
                    variantId: defaultVariant.id,
                    quantity: newQuantity
                }));
            }
        } else {
            showWarning('Stock Limit', `Only ${maxInventory} items available in stock`);
        }
    };

    const handleAddToCart = async () => {
        // KYC check for age-restricted products
        if (
            product.ageRestriction && kycStatus !== "verified" ||
            product.ageRestriction && kycStatus === 'pending' ||
            product.ageRestriction && kycStatus === 'rejected'
        ) {
            setShowKycPrompt(true);
            return;
        }
        if (defaultVariant?.inventory_quantity !== null && defaultVariant?.inventory_quantity <= 0) {
            showOutOfStock();
            return;
        }

        try {
            setIsAddingToCart(true);

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
                image: product.media?.[0]?.src || null,
                inventoryQuantity: defaultVariant.inventory_quantity,
                tokenPrice: defaultVariant.tokenPrice,
                productHandle: product.handle,
                variantTitle: defaultVariant.title,
                soldBy: product.vendor,
                isDigital: product.productFormat === "digital"
            };

            dispatch(addToCart(cartItem));

            if (cartError) {
                showError('Cart Error', cartError);
                return;
            }

            // Show attractive cart notification
            showCartNotification({
                title: product.title,
                image: product.media?.[0]?.src,
                price: Number(defaultVariant.price),
                tokenPrice: defaultVariant.tokenPrice ? Number(defaultVariant.tokenPrice) : undefined,
                quantity: quantity
            });

            onOpenChange(false);
            setQuantity(1);
        } catch (error) {
            showError('Add to Cart Failed', 'Failed to add item to cart. Please try again.');
        } finally {
            setIsAddingToCart(false);
        }
    };

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent
                    side="right"
                    className="w-[90%] md:w-[600px] lg:w-[800px] max-w-full h-[100vh] overflow-y-auto bg-[var(--color-surface)] border-l border-gray-700"
                >
                    {/* Custom close button with white color */}
                    <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity  focus:outline-none focus:ring-0 focus:ring-ring focus:ring-offset-0 disabled:pointer-events-none data-[state=open]:bg-secondary">
                        <Icons.x className="h-6 w-6 text-white" />
                        <span className="sr-only">Close</span>
                    </SheetClose>

                    <SheetHeader className="space-y-2 md:space-y-4 pt-6">
                        <SheetTitle className="text-xl md:text-xl text-white flex items-center gap-2">
                            {product?.title}
                            {product?.ageRestriction && (
                                <span className="ml-2 bg-red-600 text-white text-xs px-2 py-1 rounded flex items-center">
                                    <Icons.alertCircle className="w-3 h-3 mr-1" />
                                    18+
                                </span>
                            )}
                        </SheetTitle>
                    </SheetHeader>
                    <div className="mt-4 md:mt-6 space-y-4 md:space-y-6">
                        <div className="relative aspect-square rounded-lg overflow-hidden max-w-[300px] md:max-w-[400px] mx-auto">
                            {imageLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                                    <Spinner />
                                </div>
                            )}
                            <Image
                                src={productImage}
                                alt={product?.title}
                                fill
                                className={`object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                                onLoadingComplete={() => setImageLoading(false)}
                            />
                        </div>
                        <div className="space-y-3 md:space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl md:text-2xl font-bold text-[var(--color-primary)] flex items-center gap-1">
                                            <TokenSymbol />
                                            {product?.variants && product?.variants?.[0]?.price}
                                        </span>
                                        {product?.originalPrice && (
                                            <span className="text-xs md:text-sm text-gray-400 line-through">
                                                <TokenSymbol /> {product.originalPrice}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        ${product?.variants && product?.variants?.[0]?.price} USD
                                    </div>
                                </div>
                            </div>


                            <div className="relative inline-block">
                                <p className="text-[14px] md:text-[14px] text-gray-300 inline">
                                    {showFullDescription ? descriptionText : truncatedDescription}
                                </p>
                                {shouldShowButton && (
                                    <span
                                        onClick={() => setShowFullDescription(!showFullDescription)}
                                        className="text-[var(--color-primary)] text-sm mt-2 hover:underline focus:outline-none cursor-pointer ml-1"
                                    >
                                        {showFullDescription ? "Show Less" : "Show More"}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-3 md:space-y-4 py-3 md:py-4 border-y border-gray-700">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className="flex items-center border border-gray-700 rounded-md">
                                        <button
                                            disabled={outOfStock || quantity <= 1}
                                            onClick={handleDecreaseQuantity}
                                            className="w-10 h-10 flex items-center justify-center text-gray-300 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Icons.minus className="w-4 h-4" />
                                        </button>
                                        <div className="w-12 h-10 flex items-center justify-center text-white border-x border-gray-700">
                                            {quantity}
                                        </div>
                                        <button
                                            disabled={outOfStock || quantity >= maxInventory}
                                            onClick={handleIncreaseQuantity}
                                            className="w-10 h-10 flex items-center justify-center text-gray-300 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Icons.plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <Button
                                        disabled={isAddingToCart || outOfStock}
                                        onClick={handleAddToCart}
                                        className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/80 text-white font-medium py-2 disabled:bg-gray-700 disabled:text-gray-400"
                                    >
                                        {isAddingToCart ? (
                                            <div className="flex items-center">
                                                <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                                                Adding...
                                            </div>
                                        ) : outOfStock ? (
                                            <>
                                                <Icons.x className="w-4 h-4 mr-2" />
                                                Out of Stock
                                            </>
                                        ) : (
                                            <>
                                                <Icons.shoppingCart className="w-4 h-4 mr-2" />
                                                Add to Cart
                                            </>
                                        )}
                                    </Button>
                                </div>
                                <Link href={`/product/${product.id}`} className="block">
                                    <Button
                                        variant="outline"
                                        className="w-full text-white border-gray-600 hover:bg-[#667085] py-2 bg-[var(--color-surface)]/50"
                                    >
                                        View Full Details
                                    </Button>
                                </Link>
                            </div>
                            <div className="space-y-2">
                                {product?.features?.length > 0 && (
                                    <>
                                        <h4 className="font-medium text-sm md:text-base text-white">
                                            Key Features:
                                        </h4>
                                        <ul className="space-y-2">
                                            {product.features.map((feature: any, index: any) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <Icons.check className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0 mt-1" />
                                                    <span className="text-sm text-gray-300">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
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
};

export default QuickView;