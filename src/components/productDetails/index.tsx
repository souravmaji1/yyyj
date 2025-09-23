import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchProductById } from '../../store/slices/productSlice';
import { Spinner } from "../ui/spinner";
import ProductMedia from "./productMedia";
import ProductInfo from "./productInfo";
import Details from "./details";

interface ProductDetailsProps {
    productId: number;
}

export interface ProductVariant {
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
}

const ProductDetails = ({ productId }: ProductDetailsProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const { selectedProduct, selectedProductLoading } = useSelector((state: RootState) => state.product);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

    // Set initial variant options when product loads
    useEffect(() => {
        if (selectedProduct?.variants?.length) {
            const firstVariant = selectedProduct.variants[0];
            if (!firstVariant) return;
            
            const initialOptions: Record<string, string> = {};

            // Set initial options based on the first variant's option values
            if (selectedProduct.options) {
                selectedProduct.options.forEach(option => {
                    let value: string | null = null;
                    
                    switch (option.position) {
                        case 1:
                            value = firstVariant.option1;
                            break;
                        case 2:
                            value = firstVariant.option2;
                            break;
                        case 3:
                            value = firstVariant.option3;
                            break;
                        default:
                            break;
                    }

                    // For Weight option, construct the weight value
                    if (option.name === "Weight" && firstVariant.weight) {
                        value = firstVariant.weight_unit 
                            ? `${firstVariant.weight}${firstVariant.weight_unit}`
                            : firstVariant.weight;
                    }

                    // For Size option, check if it has dimensions or sizes
                    if (option.name === "Size") {
                        if (firstVariant.dimensions && firstVariant.dimensions.width && firstVariant.dimensions.length && firstVariant.dimensions.height) {
                            value = `${firstVariant.dimensions.width}W × ${firstVariant.dimensions.length}L × ${firstVariant.dimensions.height}H`;
                        } else if (firstVariant.sizes) {
                            value = firstVariant.sizes;
                        }
                    }

                    // For Dimension option, construct the dimension value
                    if (option.name === "Dimension" && firstVariant.dimensions) {
                        if (firstVariant.dimensions.width && firstVariant.dimensions.length && firstVariant.dimensions.height) {
                            value = `${firstVariant.dimensions.width}W × ${firstVariant.dimensions.length}L × ${firstVariant.dimensions.height}H`;
                        }
                    }

                    if (value) {
                        initialOptions[option.name] = value;
                    }
                });
            }

            setSelectedOptions(initialOptions);

            // Set initial image if variant has an image
            if (firstVariant.image_id && selectedProduct.media) {
                const imageIndex = selectedProduct.media.findIndex(
                    media => media.mediaID === firstVariant.image_id
                );
                if (imageIndex >= 0) {
                    setSelectedImage(imageIndex);
                }
            }
        }
    }, [selectedProduct]);

    // Get all possible sizes from product options
    const getAllSizes = useMemo(() => {
        if (!selectedProduct?.options) return [];
        const sizeOption = selectedProduct.options.find(opt => opt.name === "Size");
        return sizeOption?.values || [];
    }, [selectedProduct?.options]);

    // Get available sizes for selected color
    const getAvailableSizesForColor = (color: string | null) => {
        if (!selectedProduct?.variants || !color) return new Set<string>();

        const sizesSet = new Set<string>();
        selectedProduct.variants
            .filter(variant => variant.color === color && variant.sizes)
            .forEach(variant => {
                if (variant.sizes && variant.inventoryStatus !== "out_of_stock") {
                    sizesSet.add(variant.sizes);
                }
            });

        return sizesSet;
    };

    // Get variant status for a specific color and size combination
    const getVariantStatus = (color: string, size: string) => {
        if (!selectedProduct?.variants) return null;

        const variant = selectedProduct.variants.find(v =>
            v.color === color && v.sizes === size
        );

        return variant?.inventoryStatus || null;
    };

    // Get the selected variant based on current options
    const selectedVariant = useMemo(() => {
        if (!selectedProduct) return null;

        // If there are no variants (digital product), create a default variant
        if (!selectedProduct.variants?.length) {
            const defaultVariant: ProductVariant = {
                id: selectedProduct.id,
                shopifyId: null,
                title: selectedProduct.title,
                price: "0",
                sku: null,
                position: null,
                product_id: selectedProduct.id,
                inventory_policy: "",
                compare_at_price: null,
                option1: null,
                option2: null,
                option3: null,
                inventory_quantity: null,
                color: null,
                measurement: null,
                measurementType: null,
                tokenPrice: "0",
                image_id: null,
                inventoryStatus: selectedProduct.inventoryStatus,
                inventoryManagement: null,
                sizes: null,
            };
            return defaultVariant;
        }

        // If no options are selected, return first variant
        if (Object.keys(selectedOptions).length === 0) {
            return selectedProduct.variants[0];
        }

        // Find the variant that matches all selected options
        return selectedProduct.variants.find(variant => {
            // Check each option based on its position
            for (const option of selectedProduct.options || []) {
                const selectedValue = selectedOptions[option.name];
                if (!selectedValue) continue;

                let variantValue: string | null = null;
                switch (option.position) {
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

                // For Weight option, we need to check if the variant's weight matches
                if (option.name === "Weight") {
                    const weightValue = variant.weight && variant.weight_unit 
                        ? `${variant.weight}${variant.weight_unit}`
                        : variant.weight;
                    if (weightValue !== selectedValue) {
                        return false;
                    }
                } else if (option.name === "Size") {
                    // For Size option, check if it matches dimensions or sizes
                    let sizeValue: string | null = null;
                    if (variant.dimensions && variant.dimensions.width && variant.dimensions.length && variant.dimensions.height) {
                        sizeValue = `${variant.dimensions.width}W × ${variant.dimensions.length}L × ${variant.dimensions.height}H`;
                    } else if (variant.sizes) {
                        sizeValue = variant.sizes;
                    } else {
                        sizeValue = variantValue;
                    }
                    
                    if (sizeValue !== selectedValue) {
                        return false;
                    }
                } else if (option.name === "Dimension") {
                    // For Dimension option, check if it matches dimensions
                    if (variant.dimensions && variant.dimensions.width && variant.dimensions.length && variant.dimensions.height) {
                        const dimensionValue = `${variant.dimensions.width}W × ${variant.dimensions.length}L × ${variant.dimensions.height}H`;
                        if (dimensionValue !== selectedValue) {
                            return false;
                        }
                    } else {
                        return false;
                    }
                } else {
                    // For other options, check direct match
                    if (variantValue !== selectedValue) {
                        return false;
                    }
                }
            }
            return true;
        }) || selectedProduct.variants[0];
    }, [selectedProduct, selectedOptions]);

    // Reset selected options when product changes
    useEffect(() => {
        setSelectedOptions({});
    }, [productId]);

    // Fetch product data
    useEffect(() => {
        if (productId) {
            dispatch(fetchProductById(productId));
        }
    }, [dispatch, productId]);

    // Update selected image when variant changes
    useEffect(() => {
        if (selectedVariant?.image_id && selectedProduct?.media) {
            const imageIndex = selectedProduct.media.findIndex(
                media => media.mediaID === selectedVariant.image_id
            );
            if (imageIndex >= 0) {
                setSelectedImage(imageIndex);
            }
        }
    }, [selectedVariant, selectedProduct?.media]);

    return (
        <div className="min-h-screen bg-[var(--color-surface)] pt-20 sm:pt-20 md:pt-20 pb-12">
            <div className="container mx-auto px-4 sm:px-6">
                <div>
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center text-sm text-gray-400 mb-4 sm:mb-6 overflow-x-auto whitespace-nowrap py-2"
                    >
                        <a href="/" className="hover:text-[var(--color-primary)] transition-colors">
                            Home
                        </a>
                        <span className="mx-2">/</span>
                        <a href="/shop" className="hover:text-[var(--color-primary)] transition-colors">
                            Shop
                        </a>
                        {selectedProductLoading ? (
                            <></>
                            // <div className="flex items-center space-x-2">
                            //     <div className="animate-pulse h-4 bg-gray-600 rounded w-32"></div>
                            //     <span className="mx-2">/</span>
                            //     <div className="animate-pulse h-4 bg-gray-600 rounded w-24"></div>
                            // </div>
                        ) : !selectedProduct ? (
                            <div className="flex items-center space-x-2">
                                <span className="text-gray-300">Product not found</span>
                            </div>
                        ) : (
                            <>
                                {selectedProduct.productType && (
                                    <>
                                        <span className="mx-2">/</span>

                                        {selectedProduct.productType}

                                    </>
                                )}
                                <span className="mx-2">/</span>
                                <span className="text-gray-300 truncate max-w-[150px] sm:max-w-none">
                                    {selectedProduct.title}
                                </span>
                            </>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-[var(--color-surface)] rounded-xl shadow-lg border border-gray-700 overflow-hidden"
                    >
                        <div className="flex flex-col lg:flex-row">
                            {selectedProductLoading ? (
                                <div className="flex items-center justify-center w-full h-[400px]">
                                    <Spinner />
                                </div>
                            ) : selectedProduct ? (
                                <ProductMedia
                                    selectedImage={selectedImage}
                                    product={selectedProduct}
                                    setSelectedImage={setSelectedImage}
                                />
                            ) : (
                                <div className="flex items-center justify-center w-full h-[400px]">
                                    <span className="text-gray-300">Product not found</span>
                                </div>
                            )}

                            {selectedProductLoading ? (
                                <div className="flex items-center justify-center p-8">
                                    <Spinner />
                                </div>
                            ) : (selectedProduct && selectedVariant) ? (
                                <ProductInfo
                                    product={selectedProduct}
                                    selectedVariant={selectedVariant}
                                    selectedOptions={selectedOptions}
                                    setSelectedOptions={setSelectedOptions}
                                />
                            ) : null}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-[#232e41] rounded-xl shadow-lg overflow-hidden"
                    >
                        {selectedProductLoading ? (
                            <div className="flex items-center justify-center p-8">
                                <Spinner />
                            </div>
                        ) : (selectedProduct && selectedVariant) ? (
                            <Details
                                product={selectedProduct}
                                selectedVariant={selectedVariant}
                            />
                        ) : null}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;