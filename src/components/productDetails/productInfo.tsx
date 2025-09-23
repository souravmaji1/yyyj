import { Product } from "@/src/store/slices/productSlice";
import { Badge } from "../ui/badge";
import { motion } from "framer-motion";
import { Icons } from "@/src/core/icons";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/src/store/slices/cartSlice";
import { createTryOnJob, clearError, addJob } from "@/src/store/slices/tryonSlice";
import { RootState } from "@/src/store";
import { useCartNotification } from "@/src/hooks/useCartNotification";
import { useNotificationUtils } from "@/src/core/utils/notificationUtils";
import { TokenSymbol } from "@/src/core/icons/tokenIcon";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { isKioskInterface } from "@/src/core/utils";


interface ProductVariant {
    id: number;
    shopifyId: string | null;
    title: string;
    price: string;
    sku: string | null;
    position: string | null;
    product_id: number;
    inventory_policy: string;
    compare_at_price: string | null;
    option1: string | null;
    option2: string | null;
    option3: string | null;
    inventory_quantity: number | null;
    color: string | null;
    measurement: string | null;
    measurementType: string | null;
    tokenPrice: string;
    image_id: string | null;
    inventoryStatus: string | null;
    inventoryManagement: string | null;
    sizes: string | null;
    dimensions?: {
        width: string;
        length: string;
        height: string;
    };
    weight?: string | null;
    weight_unit?: string | null;
}

interface ProductInfoProps {
    product: Product;
    selectedVariant: ProductVariant;
    selectedOptions: Record<string, string>;
    setSelectedOptions: (options: Record<string, string>) => void;
}

const ProductInfo = ({ product, selectedVariant, selectedOptions, setSelectedOptions }: ProductInfoProps) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const cartError = useSelector((state: RootState) => state.cart.error);
    const cartItems = useSelector((state: RootState) => state.cart.items);
    const user = useSelector((state: RootState) => state.user.profile);
    const { isGenerating, error: tryonError } = useSelector((state: RootState) => state.tryon);
    const kycStatus = user?.kycStatus;
    const isDigitalProduct = product.productFormat?.toLowerCase() === 'digital';
    const { showCartNotification, CartNotificationComponent } = useCartNotification();
    const { showOutOfStock, showError, showWarning, showSuccess } = useNotificationUtils();

    const [showFullDescription, setShowFullDescription] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [showKycPrompt, setShowKycPrompt] = useState(false);
    const [showTryItOnModal, setShowTryItOnModal] = useState(false);

    // Get total quantity of all variants of this product in cart
    const totalProductQuantity = cartItems
        .filter(item => item.productId === product.id)
        .reduce((total, item) => total + item.quantity, 0);

    // Check if the current variant is in cart
    const isInCart = cartItems.some(item => item.variantId === selectedVariant.id);

    // Get current cart item quantity if in cart
    const cartItemQuantity = cartItems.find(item => item.variantId === selectedVariant.id)?.quantity || 0;

    // Check if all options are selected
    const areAllOptionsSelected = product.options ? product.options.every(option => selectedOptions[option.name]) : true;

    const discountPercentage = selectedVariant.compare_at_price
        ? Math.round(
            ((parseFloat(selectedVariant.compare_at_price) -
                parseFloat(selectedVariant.price)) /
                parseFloat(selectedVariant.compare_at_price)) *
            100
        )
        : 0;

    // Get available values for an option based on other selected options
    const getAvailableValuesForOption = (optionName: string) => {
        if (!product?.variants) return [];

        const option = product.options.find(opt => opt.name === optionName);
        if (!option) return [];

        // For Color option, show only colors that have available variants
        if (option.name === "Color") {
            const availableColors = new Set<string>();
            product.variants.forEach(variant => {
                if (variant.inventoryStatus !== "out_of_stock" && variant.option1) {
                    availableColors.add(variant.option1);
                }
            });
            const colors = Array.from(availableColors);
            console.log('Available colors:', colors);
            return colors;
        }

        // For other options, filter based on selected previous options
        const availableVariants = product.variants.filter(variant => {
            // Check if variant matches all previously selected options
            for (const selectedOption of product.options || []) {
                if (selectedOption.name === option.name) continue; // Skip the current option

                const selectedValue = selectedOptions[selectedOption.name];
                if (!selectedValue) continue;

                // Check if variant matches this selected value
                if (selectedOption.name === "Weight") {
                    // For Weight option, check the variant's weight
                    const variantWeightValue = variant.weight && variant.weight_unit
                        ? `${variant.weight}${variant.weight_unit}`
                        : variant.weight;
                    if (variantWeightValue !== selectedValue) {
                        return false;
                    }
                } else if (selectedOption.name === "Color") {
                    // For Color option, check the variant's option1 (color)
                    if (variant.option1 !== selectedValue) {
                        return false;
                    }
                } else if (selectedOption.name === "Dimension") {
                    // For Dimension option, check the variant's dimensions
                    if (variant.dimensions && variant.dimensions.width && variant.dimensions.length && variant.dimensions.height) {
                        const dimensionValue = `${variant.dimensions.width}W × ${variant.dimensions.length}L × ${variant.dimensions.height}H`;
                        if (dimensionValue !== selectedValue) {
                            return false;
                        }
                    } else {
                        return false;
                    }
                } else {
                    // For other options, check based on position
                    let variantValue: string | null = null;
                    switch (selectedOption.position) {
                        case 1:
                            variantValue = variant.option1;
                            break;
                        case 2:
                            variantValue = variant.option2;
                            break;
                        case 3:
                            variantValue = variant.option3;
                            break;
                        default:
                            continue;
                    }
                    if (variantValue !== selectedValue) {
                        return false;
                    }
                }
            }
            return variant.inventoryStatus !== "out_of_stock";
        });

        // Get unique values for this option from available variants
        const availableValues = new Set<string>();
        availableVariants.forEach(variant => {
            let value: string | null = null;

            if (option.name === "Weight") {
                // For Weight option, construct the weight value
                value = variant.weight && variant.weight_unit
                    ? `${variant.weight}${variant.weight_unit}`
                    : variant.weight;
            } else if (option.name === "Size") {
                // For Size option, check if it has dimensions or sizes
                if (variant.dimensions && variant.dimensions.width && variant.dimensions.length && variant.dimensions.height) {
                    // If variant has dimensions, use them
                    value = `${variant.dimensions.width}W × ${variant.dimensions.length}L × ${variant.dimensions.height}H`;
                } else if (variant.sizes) {
                    // If variant has sizes, use them
                    value = variant.sizes;
                } else {
                    // Fallback to option2 (size)
                    value = variant.option2;
                }
            } else if (option.name === "Dimension") {
                // For Dimension option, construct the dimension value
                if (variant.dimensions && variant.dimensions.width && variant.dimensions.length && variant.dimensions.height) {
                    value = `${variant.dimensions.width}W × ${variant.dimensions.length}L × ${variant.dimensions.height}H`;
                }
            } else {
                value = getVariantOptionValue(variant, option.position);
            }

            if (value) {
                availableValues.add(value);
            }
        });

        const values = Array.from(availableValues);
        console.log(`Available ${optionName} for selected options:`, values, 'Selected options:', selectedOptions);
        return values;
    };

    // Helper function to get option value from variant based on position
    const getVariantOptionValue = (variant: ProductVariant, position: number) => {
        switch (position) {
            case 1:
                return variant.option1;
            case 2:
                return variant.option2;
            case 3:
                return variant.option3;
            default:
                return null;
        }
    };

    // Handle option change
    const handleOptionChange = (optionName: string, value: string) => {
        const newSelectedOptions = { ...selectedOptions };
        const option = product.options.find(opt => opt.name === optionName);

        if (!option) return;

        // Set the selected value
        newSelectedOptions[optionName] = value;

        // If color is changing, reset all other options
        if (optionName === "Color") {
            product.options.forEach(opt => {
                if (opt.name !== "Color") {
                    delete newSelectedOptions[opt.name];
                }
            });
        } else {
            // Reset subsequent options when an earlier option changes
            product.options.forEach(opt => {
                if (opt.position > option.position) {
                    delete newSelectedOptions[opt.name];
                }
            });
        }

        // Reset quantity when options change
        setQuantity(1);

        setSelectedOptions(newSelectedOptions);
    };

    // Handle adding to cart
    const handleAddToCart = async (): Promise<boolean> => {
        // KYC check for age-restricted products
        if (
            product.ageRestriction && kycStatus !== "verified" ||
            product.ageRestriction && kycStatus === 'pending' ||
            product.ageRestriction && kycStatus === 'rejected'
        ) {
            setShowKycPrompt(true);
            return false;
        }
        if (selectedVariant.inventory_quantity !== null && selectedVariant.inventory_quantity <= 0) {
            showOutOfStock();
            return false;
        }

        try {
            setIsAddingToCart(true);

            const weightValue = selectedVariant.weight && selectedVariant.weight_unit
                ? `${selectedVariant.weight}${selectedVariant.weight_unit}`
                : selectedVariant.weight;

            const cartItem = {
                productId: product.id,
                variantId: selectedVariant.id,
                shopifyId: selectedVariant.shopifyId,
                title: product.title,
                price: selectedVariant.price,
                compareAtPrice: selectedVariant.compare_at_price,
                color: isDigitalProduct ? null : selectedOptions["Color"] || null,
                size: isDigitalProduct ? null : selectedOptions["Size"] || null,
                weight: weightValue,
                dimension: isDigitalProduct ? null : (selectedOptions["Dimension"] || (selectedOptions["Size"] && selectedOptions["Size"].includes("×") ? selectedOptions["Size"] : null)),
                length: isDigitalProduct ? null : selectedOptions["Top length type"] || null,
                quantity: quantity,
                image: product.media?.[0]?.src || null,
                inventoryQuantity: selectedVariant.inventory_quantity,
                tokenPrice: selectedVariant.tokenPrice,
                productHandle: product.handle || '',
                variantTitle: selectedVariant.title,
                soldBy: product.vendor,
                isDigital: isDigitalProduct
            };

            dispatch(addToCart(cartItem));

            if (cartError) {
                showError('Cart Error', cartError);
                return false;
            }

            showCartNotification({
                title: product.title,
                image: product.media?.[0]?.src,
                price: Number(selectedVariant.price),
                tokenPrice: selectedVariant.tokenPrice ? Number(selectedVariant.tokenPrice) : undefined,
                quantity: quantity
            });
            return true;
        } catch (error) {
            showError('Add to Cart Failed', 'Failed to add to cart. Please try again.');
            return false;
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleGoToCart = () => {
        router.push("/cart");
    };

    const handleTryItOn = () => {
        dispatch(clearError()); // Clear any previous errors
        setShowTryItOnModal(true);
    };

    const confirmTryItOn = async () => {
        if (!user?.profilePicture) {
            showError('Profile Image Required', 'Please upload a profile picture to use the virtual try-on feature.');
            setTimeout(() => {
                router.push('/profile');
            }, 1000);
            return;
        }

        if (!product.media?.[0]?.src) {
            showError('Try It On Error', 'Product image is missing. Please try again later.');
            return;
        }

        try {
            setShowTryItOnModal(false);
            
            // Extract S3 keys from URLs
            const modelImageS3Key = user.profilePicture.split('amazonaws.com/')[1] || '';
            const garmentImageS3Key = product.media[0].src.split('amazonaws.com/')[1] || '';

            const tryOnRequest = {
                modelImage: user.profilePicture,
                model_image_s3_key: modelImageS3Key,
                garmentImage: product.media[0].src,
                garment_image_s3_key: garmentImageS3Key,
                options: {
                    quality: 'high' as const
                }
            };

            const result = await dispatch(createTryOnJob(tryOnRequest) as any).unwrap();
            
            // Add the job with product and variant info
            dispatch(addJob({
                id: result.jobId,
                productId: product.id,
                variantId: selectedVariant.id,
                status: result.status,
                createdAt: new Date().toISOString(),
                modelImage: user.profilePicture,
                garmentImage: product.media[0].src
            }));

            showSuccess('Try It On', 'Your virtual try-on is being processed! We will notify you soon when it\'s ready.');
            
        } catch (error) {
            console.error('Try-on creation failed:', error);
            showError('Try It On Error', 'Failed to create try-on job. Please try again.');
        }
    };

    // Render option selection based on option type
    const renderOptionSelection = (option: any) => {
        const availableValues = getAvailableValuesForOption(option.name);

        // Color selection
        if (option.name === "Color") {
            const availableValues = getAvailableValuesForOption(option.name);

            return (
                <div className="variant-group">
                    <h3 className="text-sm font-medium text-gray-300 mb-2">
                        Select Color:
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {availableValues.map((value: string) => {
                            const isSelected = selectedOptions["Color"] === value;

                            return (
                                <motion.button
                                    key={value}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleOptionChange("Color", value)}
                                    className={`w-10 h-10 rounded-full border-2 transition-all duration-200 relative
                                        ${isSelected ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]" : "border-gray-700 hover:border-[var(--color-primary)]/50"}
                                    `}
                                    style={{
                                        backgroundColor: value.startsWith('#') ? value : value.toLowerCase(),
                                        boxShadow: isSelected ? "0 0 0 2px var(--color-primary)" : "none"
                                    }}
                                    title={value}
                                >
                                    {isSelected && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                                            <Icons.check className="w-3 h-3 text-white" />
                                        </span>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            );
        }

        // Size selection
        if (option.name === "Size") {
            const availableValues = getAvailableValuesForOption(option.name);

            return (
                <div className="variant-group">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium text-gray-300">
                            Select Size:
                        </h3>
                        <span className="text-xs text-[var(--color-primary)]">
                            {!selectedOptions.Color ?
                                "Please select a color first" :
                                selectedOptions["Size"] ?
                                    `Selected: ${selectedOptions["Size"]}` :
                                    "Choose a size"}
                        </span>
                    </div>
                    <div className="grid grid-cols-5 gap-2 sm:flex sm:flex-wrap">
                        {availableValues.map((value: string) => {
                            const isSelected = selectedOptions["Size"] === value;
                            const isAvailable = true; // All values in availableValues are available

                            return (
                                <motion.button
                                    key={value}
                                    whileHover={selectedOptions.Color ? { scale: 1.05 } : {}}
                                    whileTap={selectedOptions.Color ? { scale: 0.95 } : {}}
                                    onClick={() => selectedOptions.Color && handleOptionChange("Size", value)}
                                    disabled={!selectedOptions.Color}
                                    className={`px-3 py-2 text-sm rounded-md transition-all duration-200 flex items-center justify-center
                                        ${isSelected ? "bg-[var(--color-primary)] text-white" :
                                            !selectedOptions.Color ? "bg-gray-800 text-gray-500 cursor-not-allowed" :
                                                "bg-gray-700 text-gray-300 hover:bg-gray-600"}
                                        ${!selectedOptions.Color ? "opacity-50" : ""}
                                    `}
                                >
                                    {value}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            );
        }

        // Weight selection (for products like water bottles)
        if (option.name === "Weight") {
            const availableValues = getAvailableValuesForOption(option.name);

            return (
                <div className="variant-group">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium text-gray-300">
                            Select Weight:
                        </h3>
                        <span className="text-xs text-[var(--color-primary)]">
                            {!selectedOptions.Color ?
                                "Please select a color first" :
                                selectedOptions["Weight"] ?
                                    `Selected: ${selectedOptions["Weight"]}` :
                                    "Choose a weight"}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {availableValues.map((value: string) => {
                            const isSelected = selectedOptions["Weight"] === value;
                            const isAvailable = selectedOptions.Color; // Only available if color is selected

                            return (
                                <motion.button
                                    key={value}
                                    whileHover={isAvailable ? { scale: 1.05 } : {}}
                                    whileTap={isAvailable ? { scale: 0.95 } : {}}
                                    onClick={() => isAvailable && handleOptionChange("Weight", value)}
                                    disabled={!isAvailable}
                                    className={`px-4 py-2 text-sm rounded-md transition-all duration-200
                                        ${isSelected ? "bg-[var(--color-primary)] text-white" :
                                            !selectedOptions.Color ? "bg-gray-800 text-gray-500 cursor-not-allowed" :
                                                "bg-gray-700 text-gray-300 hover:bg-gray-600"}
                                        ${!selectedOptions.Color ? "opacity-50" : ""}
                                    `}
                                >
                                    {value}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            );
        }

        // Dimension selection (for products like cushions/pillows)
        if (option.name === "Dimension") {
            const availableValues = getAvailableValuesForOption(option.name);

            return (
                <div className="variant-group">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium text-gray-300">
                            Select Size:
                        </h3>
                        <span className="text-xs text-[var(--color-primary)]">
                            {!selectedOptions.Color ?
                                "Please select a color first" :
                                selectedOptions["Dimension"] ?
                                    `Selected: ${selectedOptions["Dimension"]}` :
                                    "Choose a size"}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {availableValues.map((value: string) => {
                            const isSelected = selectedOptions["Dimension"] === value;
                            const isAvailable = selectedOptions.Color; // Only available if color is selected

                            return (
                                <motion.button
                                    key={value}
                                    whileHover={isAvailable ? { scale: 1.05 } : {}}
                                    whileTap={isAvailable ? { scale: 0.95 } : {}}
                                    onClick={() => isAvailable && handleOptionChange("Dimension", value)}
                                    disabled={!isAvailable}
                                    className={`px-4 py-2 text-sm rounded-md transition-all duration-200
                                        ${isSelected ? "bg-[var(--color-primary)] text-white" :
                                            !selectedOptions.Color ? "bg-gray-800 text-gray-500 cursor-not-allowed" :
                                                "bg-gray-700 text-gray-300 hover:bg-gray-600"}
                                        ${!selectedOptions.Color ? "opacity-50" : ""}
                                    `}
                                >
                                    {value}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            );
        }

        // For any other option types, don't render them
        return null;
    };

    return (
        <>
            <div className="lg:w-3/5 p-4 sm:p-6 border-t lg:border-t-0 lg:border-l border-gray-700">
                {/* Product Title and Badges */}
                <div className="mb-4">
                    <div className="flex flex-wrap gap-2 mb-2">
                        {discountPercentage > 0 && (
                            <Badge className="bg-[var(--color-primary)] text-white">
                                {discountPercentage}% OFF
                            </Badge>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between mb-2">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                            {product.title}
                        </h1>
                        <div className="flex items-center gap-2">
                            {product.isTrial && (
                                <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white flex items-center px-3 py-1 text-sm font-medium shadow-lg">
                                    <Icons.sparkles className="w-4 h-4 mr-1" />
                                    Try It Out
                                </Badge>
                            )}
                            {product.ageRestriction && (
                                <Badge className="bg-red-600 text-white flex items-center">
                                    <Icons.alertCircle className="w-3 h-3 mr-1" />
                                    18+
                                </Badge>
                            )}
                        </div>
                    </div>


                    {selectedVariant &&
                        selectedVariant.title &&
                        selectedVariant.title !== "Default Title" && (
                            <h2 className="text-md sm:text-lg text-[var(--color-primary)] mb-2">
                                {selectedVariant.title}
                            </h2>
                        )}
                </div>

                {/* Price */}
                <div className="mb-4 sm:mb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                            <span className="text-xl sm:text-2xl font-bold text-[var(--color-primary)]">
                                ${parseFloat(selectedVariant.price).toFixed(2)}
                            </span>
                            <span className="text-sm text-gray-400">
                                <TokenSymbol />{parseInt(selectedVariant.tokenPrice)}{" "}
                            </span>
                        </div>
                        {selectedVariant.compare_at_price && (
                            <span className="text-md sm:text-lg text-gray-400 line-through">
                                $
                                {parseFloat(selectedVariant.compare_at_price).toFixed(
                                    2
                                )}
                            </span>
                        )}
                    </div>
                    {discountPercentage > 0 && (
                        <motion.p
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-sm text-green-500 mt-1"
                        >
                            You save: $
                            {(
                                parseFloat(selectedVariant.compare_at_price || "0") -
                                parseFloat(selectedVariant.price)
                            ).toFixed(2)}{" "}
                            ({discountPercentage}%)
                        </motion.p>
                    )}
                </div>

                {/* Divider */}
                {!isDigitalProduct && <div className="h-px w-full bg-gray-700 my-4"></div>}

                {/* Product Description */}
                {product.bodyHtml && (
                    <div className="mb-4 sm:mb-6">
                        <h3 className="text-lg font-medium text-white mb-2">
                            Description
                        </h3>
                        <div
                            className={`text-gray-300 text-sm leading-relaxed ${!showFullDescription && "line-clamp-3 sm:line-clamp-4"}`}
                            dangerouslySetInnerHTML={{ __html: product.bodyHtml }}
                        />
                    </div>
                )}
                {!isDigitalProduct && <div className="h-px w-full bg-gray-700 my-4"></div>}

                {/* Variant Selection */}
                {!isDigitalProduct && product.options && product.options.length > 0 && (() => {
                    const sortedOptions = product.options
                        .filter(option => ["Color", "Size", "Weight", "Dimension"].includes(option.name))
                        .sort((a, b) => (a.position || 0) - (b.position || 0));

                    return (
                        <div className="space-y-6 mb-4 sm:mb-6">
                            {/* Render each option dynamically - only Color, Size, Weight, and Dimension */}
                            {sortedOptions.map((option) => (
                                <div key={option.id}>
                                    {renderOptionSelection(option)}
                                </div>
                            ))}
                        </div>
                    );
                })()}
                {!isDigitalProduct && <div className="h-px w-full bg-gray-700 my-4"></div>}

                {/* Quantity Selector */}
                {!isDigitalProduct && (
                    <div className="mb-4 sm:mb-6">
                        <h3 className="text-sm font-medium text-gray-300 mb-2">
                            Quantity
                        </h3>
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center border border-gray-700 rounded-md">
                                <motion.button
                                    whileHover={{ backgroundColor: "rgba(75, 85, 99, 0.3)" }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 flex items-center justify-center text-gray-300 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={quantity <= 1 || !selectedVariant || !selectedVariant.inventory_quantity || selectedVariant.inventory_quantity <= 0}
                                >
                                    <Icons.minus className="w-4 h-4" />
                                </motion.button>
                                <div className="w-12 h-10 flex items-center justify-center text-white border-x border-gray-700">
                                    {quantity}
                                </div>
                                <motion.button
                                    whileHover={{ backgroundColor: "rgba(75, 85, 99, 0.3)" }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        const maxQuantity = selectedVariant?.inventory_quantity || 0;
                                        if (quantity < maxQuantity) {
                                            setQuantity(quantity + 1);
                                        } else {
                                            showWarning('Stock Limit', `Only ${maxQuantity} items available in stock`);
                                        }
                                    }}
                                    className="w-10 h-10 flex items-center justify-center text-gray-300 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!selectedVariant || !selectedVariant.inventory_quantity || selectedVariant.inventory_quantity <= 0 || (selectedVariant.inventory_quantity !== null && quantity >= selectedVariant.inventory_quantity)}
                                >
                                    <Icons.plus className="w-4 h-4" />
                                </motion.button>
                            </div>
                            <div className="text-sm text-gray-400">
                                {(!selectedVariant.inventory_quantity || selectedVariant.inventory_quantity <= 0) && (
                                    <span className="text-red-500 flex items-center">
                                        <Icons.x className="w-4 h-4 mr-1" />
                                        Out of Stock
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mb-4 sm:mb-6">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full sm:w-auto"
                    >
                        <Button
                            onClick={handleAddToCart}
                            disabled={
                                isAddingToCart ||
                                !selectedVariant ||
                                !selectedVariant.inventory_quantity ||
                                selectedVariant.inventory_quantity <= 0
                            }
                            className="w-full sm:w-auto px-6 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 text-white disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                            {isAddingToCart ? (
                                <div className="flex items-center">
                                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                    Adding...
                                </div>
                            ) : !selectedVariant || !selectedVariant.inventory_quantity || selectedVariant.inventory_quantity <= 0 ? (
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
                    </motion.div>
                    {!isDigitalProduct && (
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full sm:w-auto"
                        >
                            <Button
                                onClick={async () => {
                                    const added = await handleAddToCart();
                                    if (added) {
                                        setTimeout(() => handleGoToCart(), 300);
                                    }
                                }}
                                disabled={
                                    isAddingToCart ||
                                    !selectedVariant ||
                                    !selectedVariant.inventory_quantity ||
                                    selectedVariant.inventory_quantity <= 0
                                }
                                variant="outline"
                                className="w-full sm:w-auto px-6 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Icons.creditCard className="w-4 h-4 mr-2" />
                                Buy Now
                            </Button>
                        </motion.div>
                    )}
                    {product.isTrial && (
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full sm:w-auto"
                        >
                            <Button
                                onClick={handleTryItOn}
                                className="w-full sm:w-auto px-6 bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:opacity-90 text-white font-medium"
                            >
                                <Icons.sparkles className="w-4 h-4 mr-2" />
                                Try it on
                            </Button>
                        </motion.div>
                    )}
                </div>

                {/* Cart Status */}
                {isInCart && (
                    <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Icons.shoppingCart className="w-5 h-5 text-[var(--color-primary)] mr-2" />
                                <span className="text-white">In Cart: {totalProductQuantity} items</span>
                            </div>
                            <Button
                                onClick={handleGoToCart}
                                variant="ghost"
                                className="text-[var(--color-primary)] hover:text-[var(--color-primary)]/80"
                            >
                                View Cart
                            </Button>
                        </div>
                    </div>
                )}
            </div>
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
                            To access or purchase this item, you need to complete KYC (Know Your Customer) verification.<br />
                            If your KYC is pending, rejected, or failed, please re-upload your documents to proceed.<br />
                            Once verified, you'll be able to add age-restricted products to your cart.<br />
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

            {/* Try It On Confirmation Modal */}
            <Dialog open={showTryItOnModal} onOpenChange={setShowTryItOnModal}>
                <DialogContent className="bg-[var(--color-bg)] rounded-xl p-8 max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-center text-white text-2xl font-bold mb-2 flex items-center justify-center">
                            <Icons.sparkles className="w-6 h-6 mr-2 text-[#FFD700]" />
                            Virtual Try-On
                        </DialogTitle>
                    </DialogHeader>
                    <div className="text-center py-4">
                        <div className="mb-6">
                            <div className="relative w-full max-w-md mx-auto">
                                <img 
                                    src={product.media?.[0]?.src || '/placeholder-product.jpg'} 
                                    alt={product.title}
                                    className="w-full h-80 object-cover rounded-lg shadow-lg"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg"></div>
                                <div className="absolute bottom-4 left-4 right-4">
                                    <p className="text-white font-semibold text-lg mb-1">
                                        {product.title}
                                    </p>
                                    {selectedVariant.title && selectedVariant.title !== "Default Title" && (
                                        <p className="text-[#FFD700] text-sm">
                                            {selectedVariant.title}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <p className="mb-6 text-gray-300 text-lg">
                            Are you ready to see how this looks on you?<br />
                            <span className="text-[#FFD700] font-medium">Generate your virtual try-on experience</span>
                        </p>
                        
                        {/* Profile Image Check */}
                        <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
                                    {user?.profilePicture ? (
                                        <img 
                                            src={user.profilePicture} 
                                            alt="Profile" 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Icons.user className="w-6 h-6 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-medium">
                                        {user?.profilePicture ? 'Profile Image Ready' : 'Profile Image Required'}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        {user?.profilePicture 
                                            ? 'Your profile image will be used for the try-on' 
                                            : 'Upload a profile picture to use this feature'
                                        }
                                    </p>
                                </div>
                                {!user?.profilePicture && (
                                    <Icons.alertCircle className="w-5 h-5 text-yellow-500" />
                                )}
                            </div>
                        </div>
                        {tryonError && (
                            <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                                <p className="text-red-400 text-sm">{tryonError}</p>
                            </div>
                        )}
                        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
                            <button
                                className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-white px-8 py-3 rounded-lg font-bold hover:opacity-90 transition w-full sm:w-auto flex items-center justify-center text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={confirmTryItOn}
                                disabled={isGenerating || !user?.profilePicture}
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="animate-spin w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                                        Generating...
                                    </>
                                ) : !user?.profilePicture ? (
                                    <>
                                        <Icons.user className="w-5 h-5 mr-2" />
                                        Upload Profile First
                                    </>
                                ) : (
                                    <>
                                        <Icons.sparkles className="w-5 h-5 mr-2" />
                                        Generate Try-On
                                    </>
                                )}
                            </button>
                            <button
                                className="px-8 py-3 rounded-lg border border-gray-300 text-gray-200 hover:bg-gray-100/10 transition w-full sm:w-auto text-lg disabled:opacity-50"
                                onClick={() => setShowTryItOnModal(false)}
                                disabled={isGenerating}
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

export default ProductInfo;