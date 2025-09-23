import { Product } from "@/src/store/slices/productSlice";
import Image from "next/image";
import Link from "next/link";
import { Icons } from "@/src/core/icons";
import { useState } from "react";
import { TokenSymbol } from "@/src/core/icons/tokenIcon";
import QuickView from "./quickView";
import { DUMMY_IMAGES } from "@/src/constants";
import { Spinner } from "../ui/spinner";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/store";
import { addToCart } from "@/src/store/slices/cartSlice";
import { useCartNotification } from "@/src/hooks/useCartNotification";
import { useNotificationUtils } from "@/src/core/utils/notificationUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const dispatch = useDispatch();
  const cartError = useSelector((state: RootState) => state.cart.error);
  const { showCartNotification, CartNotificationComponent } = useCartNotification();
  const { showError } = useNotificationUtils();
  const [showKycPrompt, setShowKycPrompt] = useState(false);
  const user = useSelector((state: RootState) => state.user.profile);
  const kycStatus = user?.kycStatus;

  const productImage = product.imageUrl || (product.media && product.media.length > 0 ? product.media[0]?.src : null) || DUMMY_IMAGES

  // Get the default variant
  const defaultVariant = product?.variants?.[0];

  // Check if product is digital
  const isDigitalProduct = product.productFormat?.toLowerCase() === "digital";

  // Check if imageUrl is a video
  const isImageUrlVideo = product.imageUrl?.match(/\.(mp4|webm|ogg|mov|avi)$/i);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (
      product.ageRestriction && kycStatus !== "verified" ||
      product.ageRestriction && kycStatus === 'pending' ||
      product.ageRestriction && kycStatus === 'rejected'
    ) {
      setShowKycPrompt(true);
      return;
    }

    try {
      // Create cart item without requiring variant
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
        variantId: product.variants?.[0]?.id || product.id,
        shopifyId: product.variants?.[0]?.shopifyId || null,
        title: product.title,
        price: product.variants?.[0]?.price || "0",
        compareAtPrice: product.variants?.[0]?.compare_at_price || null,
        color: isDigitalProduct ? null : product.variants?.[0]?.color || null,
        size: isDigitalProduct ? null : product.variants?.[0]?.sizes || null,
        length: isDigitalProduct
          ? null
          : product.variants?.[0]?.measurementType || null,
        dimension: dimensionValue,
        weight: weightValue,
        quantity: 1,
        image: product.media?.[0]?.src || null,
        inventoryQuantity: isDigitalProduct
          ? null
          : product.variants?.[0]?.inventory_quantity || null,
        tokenPrice: product.variants?.[0]?.tokenPrice || "0",
        productHandle: product.handle || "",
        variantTitle: product.variants?.[0]?.title || product.title,
        soldBy: product.vendor || "",
        userId: product?.userId || "",
        isDigital: isDigitalProduct,
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
        price: Number(product.variants?.[0]?.price || 0),
        tokenPrice: product.variants?.[0]?.tokenPrice ? Number(product.variants[0].tokenPrice) : undefined,
        quantity: 1
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      showError('Add to Cart Failed', 'Failed to add item to cart. Please try again.');
    }
  };

  // Get available sizes from variants
  const availableSizes = product.variants
    .filter((variant) => variant.sizes)
    .map((variant) => variant.sizes)
    .filter(Boolean);

  return (
    <>
      <div className="bg-[var(--color-surface)] rounded-lg overflow-hidden border border-gray-700 group transform hover:scale-105 hover:shadow-xl hover:shadow-[var(--color-primary)]/10 transition-transform duration-300">
        <div className="relative">
          <Link href={`/product/${product.id}`}>
            <div className="relative h-48 w-full">
              {isImageUrlVideo ? (
                <video
                  src={product.imageUrl || ''}
                  className="w-full h-full object-cover"
                  controls
                  muted
                  autoPlay
                  loop
                  playsInline
                  preload="metadata"
                  onLoadStart={() => setImageLoading(false)}
                  onError={(e) => {
                    console.error('Video failed to load:', product.imageUrl);
                    e.currentTarget.style.display = 'none';
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <>
                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                      <Spinner />
                    </div>
                  )}
                  <Image
                    src={productImage || DUMMY_IMAGES}
                    alt={product.title || "Product Image"}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className={`object-cover object-top transition-opacity duration-300 ${imageLoading ? "opacity-0" : "opacity-100"}`}
                    priority={false}
                    onLoad={() => setImageLoading(false)}
                    onError={() => {
                      setImageLoading(false);
                      setImageError(true);
                    }}
                  />
                </>
              )}
              {imageError && (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                  <Icons.image className="w-12 h-12 text-gray-600" />
                </div>
              )}
              {isImageUrlVideo && (
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded flex items-center">
                  <Icons.play className="w-3 h-3 mr-1" />
                  Video
                </div>
              )}
            </div>
          </Link>

          {/* Tag container to prevent overlap */}
          {(product.isFeature || product.ageRestriction || product.isTrial) && (
            <div className="absolute top-2 left-2 flex flex-col gap-2 z-10">
              {product.ageRestriction && (
                <div className="bg-red-600 text-white text-xs px-2 py-1 rounded flex items-center">
                  <Icons.alertCircle className="w-3 h-3 mr-1" />
                  18+
                </div>
              )}
              {product.isTrial && (
                <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded flex items-center">
                  <Icons.sparkles className="w-3 h-3 mr-1" />
                  Try It Out
                </div>
              )}
              {product.isFeature && (
                <div className="bg-[var(--color-primary)] text-white text-xs px-2 py-1 rounded">
                  Featured
                </div>
              )}
            </div>
          )}

          <div className="absolute top-2 right-2 flex flex-col gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                setQuickViewOpen(true);
              }}
              className="p-2 bg-[#667085] rounded-full shadow-lg hover:bg-[var(--color-surface)] transition-colors opacity-0 group-hover:opacity-100"
            >
              <Icons.eye className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={handleAddToCart}
              className="p-2 bg-[#667085] rounded-full shadow-lg hover:bg-[var(--color-surface)] transition-colors opacity-0 group-hover:opacity-100"
            >
              <Icons.shoppingCart className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <div className="py-4 px-3 pb-1">
          <Link href={`/product/${product.id}`}>
            <h3 className="text-white font-bold mb-2 text-[16px] leading-tight hover:text-[var(--color-primary)] transition-colors line-clamp-2">
              {product.title}
            </h3>
          </Link>
          <div className="flex items-center mb-1">
            <span className="text-[var(--color-primary)] font-bold flex items-center text-lg">
              <TokenSymbol />
              <span className="ml-1">
                {product.variants[0]?.tokenPrice
                  ? Number(product.variants[0].tokenPrice).toLocaleString()
                  : "0"}
              </span>
            </span>
          </div>
          <div className="text-xs text-gray-400 mb-3">
            ${product.variants[0]?.price || "0"} USD
          </div>

          {/* Sizes Display - Only show for non-digital products */}
          {!isDigitalProduct && availableSizes.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex flex-wrap gap-1">
                {availableSizes.slice(0, 4).map((size, index) => (
                  <span
                    key={index}
                    className="text-xs bg-[var(--color-surface)] flex items-center justify-center text-white px-2 py-1 rounded font-semibold shadow-sm border border-[var(--color-primary)]/40"
                  >
                    {String(size)}
                  </span>
                ))}
                {availableSizes.length > 4 && (
                  <Link href={`/product/${product.id}`}>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs px-1 py-1 h-[30px] rounded font-semibold bg-[var(--color-primary)] border border-[var(--color-primary)]/40 text-white"
                    >
                      <Icons.ellipsis size={20} />
                    </button>
                  </Link>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{product.tagName}</span>
              {isDigitalProduct && (
                <span className="text-xs bg-[var(--color-primary)]/20 text-[var(--color-primary)] px-2 py-1 rounded">
                  Digital Product
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
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
  );
};

export default ProductCard;
