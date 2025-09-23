import { Icons } from "@/src/core/icons";
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from "@/src/store";
import { removeFromCart, updateQuantity, clearCart, CartItem } from "@/src/store/slices/cartSlice";
import { Button } from "../ui/button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, ChevronRight, Minus, Trash2, MapPin, Truck } from "lucide-react";
import { TokenSymbol } from "@/src/core/icons/tokenIcon";
import { useEffect, useState } from "react";
import { fetchUserAddresses, updateSelectedAddressId } from "@/src/store/slices/userSlice";
import { clearPayment } from "@/src/store/slices/paymentSlice";
import { useNotificationUtils } from "@/src/core/utils/notificationUtils";
import { useCheckoutProgress } from "@/src/hooks/useCheckoutProgress";
import CheckoutProgress from "../ui/checkoutProgress";
import { clearOrder } from "@/src/store/slices/orderSlice";
import { isKioskInterface } from "@/src/core/utils";
import "./cart.mobile.css";

const Cart = () => {
    const user = useSelector((state: RootState) => state.user.profile);
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const cartItems = useSelector((state: RootState) => state.cart.items);
    console.log("cartItems", cartItems);
    const cartError = useSelector((state: RootState) => state.cart.error);
    const cartType = useSelector((state: RootState) => state.cart.cartType);
    const { addresses, loading, selectedAddressId } = useSelector((state: RootState) => state.user);

    // Get selected address
    const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);

    // Use the dynamic checkout progress hook
    const {
        steps: checkoutSteps,
        currentStepIndex,
        progressPercentage,
        canProceedToNextStep,
        getNextStep,
        hasPhysicalItems,
        hasDigitalItems,
        productType
    } = useCheckoutProgress();

    // Set initial activeTab based on cartType from store
    const [activeTab, setActiveTab] = useState<'physical' | 'digital'>(cartItems.length === 0 ? 'physical' : cartType === 'mixed' ? 'physical' : cartType);

    // Filter cart items based on active tab
    const filteredCartItems = cartItems.filter(item =>
        activeTab === 'physical' ? !item.isDigital : item.isDigital
    );

    // Option A: Check if cart has ANY regular physical items that need delivery
    const hasRegularPhysicalItems = cartItems.some(item => !item.isDigital && item.soldBy !== 'Kiosk');

    // Update activeTab when cart items change to ensure we show the correct tab
    useEffect(() => {
        if (cartItems.length === 0) {
            setActiveTab('physical');
            return;
        }

        const hasPhysicalItems = cartItems.some(item => !item.isDigital);
        const hasDigitalItems = cartItems.some(item => item.isDigital);

        // If current tab has no items but other tab has items, switch to that tab
        if (activeTab === 'digital' && !hasDigitalItems && hasPhysicalItems) {
            setActiveTab('physical');
        } else if (activeTab === 'physical' && !hasPhysicalItems && hasDigitalItems) {
            setActiveTab('digital');
        }
    }, [cartItems, activeTab]);

    const { showError, showInfo, showSuccess } = useNotificationUtils();

    // Set default address when addresses are loaded
    useEffect(() => {
        if (addresses.length > 0 && !selectedAddressId) {
            const defaultAddress = addresses.find(addr => addr.setAsDefault);
            if (defaultAddress) {
                dispatch(updateSelectedAddressId(defaultAddress.id));
            } else if (addresses.length > 0) {
                // If no default address, select the first one
                const firstAddress = addresses[0];
                if (firstAddress) {
                    dispatch(updateSelectedAddressId(firstAddress.id));
                }
            }
        }
    }, [addresses, selectedAddressId, dispatch]);

    const handleQuantityChange = (productId: number, variantId: number, newQuantity: number) => {
        dispatch(updateQuantity({ productId, variantId, quantity: newQuantity }));
        if (cartError) {
            showError('Cart Error', cartError);
        }
    };

    const handleIncrement = (productId: number, variantId: number) => {
        const item = cartItems.find(item => item.productId === productId && item.variantId === variantId);
        if (item) {
            handleIncreaseQuantity(item);
        }
    };

    const handleDecrement = (productId: number, variantId: number) => {
        const item = cartItems.find(item => item.productId === productId && item.variantId === variantId);
        if (item && item.quantity > 1) {
            handleQuantityChange(productId, variantId, item.quantity - 1);
        }
    };

    const handleIncreaseQuantity = (item: CartItem) => {
        if (item.isDigital) {
            showInfo('Digital Product', 'Digital products cannot be increased in quantity');
            return;
        }
        handleQuantityChange(item.productId, item.variantId, item.quantity + 1);
    };

    const handleRemoveItem = (productId: number, variantId: number) => {
        // Only remove the specific variant
        dispatch(removeFromCart({ productId, variantId }));
        showSuccess('Item Removed', 'Item removed from cart');
    };

    const handleAddAddress = () => {
        if (!user) {
            // If not logged in, redirect to login with return URL
            router.push('/auth?returnUrl=/addresses');
            return;
        }
        // If logged in, go to addresses page
        router.push('/addresses');
    };

    const handleCheckoutPhysical = () => {
        const physicalItems = cartItems.filter(item => !item.isDigital);
        if (physicalItems.length === 0) {
            showInfo('No Physical Items', 'No physical items in cart');
            return;
        }
        // ... existing code ...
    };

    const handleCheckoutDigital = () => {
        const digitalItems = cartItems.filter(item => item.isDigital);
        if (digitalItems.length === 0) {
            showInfo('No Digital Items', 'No digital items in cart');
            return;
        }
        // ... existing code ...
    };

    useEffect(() => {
        if (user) {
            dispatch(fetchUserAddresses());
        }
    }, [user]);

    useEffect(() => {
        if (cartError) {
            showError('Cart Error', cartError);
        }
    }, [cartError, showError]);

    console.log("progressPercentage", cartItems);

    // Clear order and payment state when visiting cart
    useEffect(() => {
        dispatch(clearPayment());
        dispatch(clearOrder());
    }, [dispatch]);

    console.log("activeTab", activeTab);
    console.log("filteredCartItems", filteredCartItems);

    return (
        <div className="container mx-auto py-10 max-w-full min-h-screen bg-[var(--color-surface)]">
            <div className="px-4 md:px-20">
                {/* Dynamic Checkout Progress */}
                <CheckoutProgress
                    steps={checkoutSteps}
                    progressPercentage={progressPercentage}
                    className="hidden md:block"
                />

                <h1 className="text-3xl font-bold mb-8 text-white flex items-center">
                    <Icons.shoppingCart className="mr-3 h-7 w-7" />
                    Your Cart {cartItems.length > 0 && <span className="text-xl ml-2 text-gray-400">({cartItems.length} items)</span>}
                </h1>

                {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-[var(--color-surface)] rounded-lg border border-gray-800">
                        <Icons.shoppingCart className="h-16 w-16 text-gray-600 mb-4" />
                        <h2 className="text-2xl font-semibold text-white mb-2">Your cart is empty</h2>
                        <p className="text-gray-400 mb-6">Looks like you haven't added any items to your cart yet.</p>
                        <Link href="/shop">
                            <Button className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 transition-all text-white px-8 py-4">
                                Start Shopping
                                <Icons.arrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <>
                        {user && activeTab === 'physical' && hasRegularPhysicalItems && (
                            <div className="bg-[var(--color-surface)] rounded-lg p-6 mb-6 shadow-lg border border-gray-800">
                                <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-4">
                                    <h2 className="text-xl font-bold text-white flex items-center">
                                        <MapPin className="mr-2 h-5 w-5 text-[var(--color-primary)]" />
                                        Deliver to:
                                    </h2>
                                    {addresses.length > 0 && (
                                        <Button
                                            onClick={handleAddAddress}
                                            className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 transition-all text-white border-none"
                                        >
                                            Change Address
                                        </Button>
                                    )}
                                </div>

                                {addresses.length > 0 ? (
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="flex-1">
                                            {selectedAddress ? (
                                                <div className="space-y-3">
                                                    {/* Recipient Name and Type */}
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="font-medium text-white text-lg">{selectedAddress.fullName}</h3>
                                                        <span className="bg-[var(--color-primary)]/20 text-[var(--color-primary)] px-2 py-1 rounded text-xs capitalize">
                                                            {selectedAddress.typeOfAddress}
                                                        </span>
                                                        {selectedAddress.setAsDefault && (
                                                            <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">
                                                                Default
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Complete Address */}
                                                    <div className="text-gray-300 space-y-1">
                                                        <p>
                                                            {selectedAddress.houseNo}, {selectedAddress.buildingName}
                                                        </p>
                                                        <p>
                                                            {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.postalCode}
                                                        </p>
                                                        <p>
                                                            {selectedAddress.country}
                                                        </p>
                                                    </div>

                                                    {/* Contact Information */}
                                                    <div className="space-y-2 pt-2 border-t border-gray-700">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-gray-400 text-sm">Phone:</span>
                                                            <span className="text-gray-300">{selectedAddress.phoneNumber}</span>
                                                        </div>
                                                        {selectedAddress.alternatePhoneNumber && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-gray-400 text-sm">Alternate Phone:</span>
                                                                <span className="text-gray-300">{selectedAddress.alternatePhoneNumber}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-gray-300">Please select a delivery address</p>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <div className="bg-green-900/30 text-green-400 px-3 py-1 rounded-full text-sm flex items-center">
                                                <Truck className="mr-1 h-3 w-3" />
                                                Delivery Available
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-end py-4">
                                        <Button
                                            onClick={handleAddAddress}
                                            className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 transition-all text-white"
                                        >
                                            Add Your First Address
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Product Type Tabs - Only show if there are both types of products */}
                            {cartItems.some(item => !item.isDigital) && cartItems.some(item => item.isDigital) && (
                                <div className="lg:col-span-3">
                                    <div className="flex space-x-4 mb-6">
                                        <button
                                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === 'physical'
                                                ? 'bg-[var(--color-primary)] text-white'
                                                : 'bg-[var(--color-surface)] text-gray-400 hover:text-white'
                                                }`}
                                            onClick={() => {
                                                setActiveTab('physical');
                                                handleCheckoutPhysical();
                                            }}
                                        >
                                            Physical Products
                                        </button>
                                        <button
                                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === 'digital'
                                                ? 'bg-[var(--color-primary)] text-white'
                                                : 'bg-[var(--color-surface)] text-gray-400 hover:text-white'
                                                }`}
                                            onClick={() => {
                                                setActiveTab('digital');
                                                handleCheckoutDigital();
                                            }}
                                        >
                                            Digital Products
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="lg:col-span-2">
                                <div className="bg-[var(--color-surface)] rounded-lg overflow-hidden shadow-lg border border-gray-800">
                                    {/* Header */}
                                    <div className="px-6 py-4 border-b border-gray-700 grid grid-cols-12 gap-4 bg-[var(--color-panel)]">
                                        <div className="col-span-6 font-medium text-white">Product</div>
                                        <div className="col-span-2 text-center font-medium text-white">Price</div>
                                        <div className="col-span-2 text-center font-medium text-white">Quantity</div>
                                        <div className="col-span-2 text-right font-medium text-white">Total</div>
                                    </div>

                                    {/* Cart Items */}
                                    <div className="divide-y divide-gray-700">
                                        {filteredCartItems.map((item) => {
                                            // Proper number conversions with fallbacks
                                            const price = Number(item.price) || 0;
                                            const tokenPrice = Number(item.tokenPrice) || 0;
                                            const itemTotal = (price * item.quantity).toFixed(2);
                                            const itemTokenTotal = (tokenPrice * item.quantity).toFixed(2);
                                            const compareAtPrice = item.compareAtPrice ? Number(item.compareAtPrice) : null;

                                            return (
                                                <div key={`${item.productId}-${item.variantId}`} className="p-6">
                                                    <div className="grid grid-cols-12 gap-4 items-center">
                                                        <div className="col-span-6">
                                                            <div className="flex gap-4">
                                                                <div className="relative w-20 h-20 flex-shrink-0 bg-gray-800 rounded-md overflow-hidden">
                                                                    <Image
                                                                        src={item.image || '/placeholder.png'}
                                                                        alt={item.title}
                                                                        fill
                                                                        className="object-cover"
                                                                        sizes="80px"
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <h3 className="text-white font-medium">{item.title}</h3>
                                                                    <p className="text-gray-400 text-sm mt-1">
                                                                        Sold by: {item.soldBy || 'Official Store'}
                                                                    </p>
                                                                    <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                                                                        {item.color && (
                                                                            <div className="flex items-center gap-1">
                                                                                <span>Color:</span>
                                                                                <div
                                                                                    className="w-4 h-4 rounded-full border border-gray-700"
                                                                                    style={{ backgroundColor: item.color.toLowerCase() }}
                                                                                    title={item.color}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                        {item.color && item.size && <span>|</span>}
                                                                        {item.size && (
                                                                            <div className="flex items-center gap-1">
                                                                                <span>Size:</span>
                                                                                <span>{item.size}</span>
                                                                            </div>
                                                                        )}
                                                                        {/* Dimension and/or Weight display for physical products */}
                                                                        {(item.dimension || item.weight) && (
                                                                            <>
                                                                                {(item.color || item.size) && <span></span>}
                                                                                <div className="flex items-center gap-1">
                                                                                    {item.dimension && (
                                                                                        <>
                                                                                            <span>Dimension:</span>
                                                                                            <span>{(() => {
                                                                                                try {
                                                                                                    const dim = typeof item.dimension === 'string' ? JSON.parse(item.dimension) : item.dimension;
                                                                                                    if (dim && dim.w && dim.l && dim.h) {
                                                                                                        return `${dim.w}W × ${dim.l}L × ${dim.h}H`;
                                                                                                    }
                                                                                                    return item.dimension;
                                                                                                } catch {
                                                                                                    return item.dimension;
                                                                                                }
                                                                                            })()}</span>
                                                                                        </>
                                                                                    )}
                                                                                    {item.dimension && (item.weight && parseFloat(item.weight) > 0) && <span>×</span>}
                                                                                    {item.weight && parseFloat(item.weight) > 0 && (
                                                                                        <>
                                                                                            <span>Weight:</span>
                                                                                            <span>{item.weight}</span>
                                                                                        </>
                                                                                    )}
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="col-span-2 text-center">
                                                            <div className="text-white font-small flex items-center justify-center">
                                                                <TokenSymbol /> <span className="text-sm">{tokenPrice.toFixed(2)}</span>
                                                            </div>
                                                            <div className="text-gray-400 text-[8px] mt-1 flex items-center justify-center">
                                                                ${price.toFixed(2)}
                                                            </div>
                                                            {compareAtPrice && compareAtPrice > price && (
                                                                <div className="text-gray-400 line-through text-sm mt-1 flex items-center justify-center">
                                                                    <TokenSymbol /> {compareAtPrice.toFixed(2)}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="col-span-2 text-center">
                                                            {item.isDigital ? (
                                                                <div className="text-gray-400 text-sm">
                                                                    Digital Product
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center justify-center">
                                                                    <button
                                                                        onClick={() => handleDecrement(item.productId, item.variantId)}
                                                                        className="w-8 h-8 flex items-center justify-center border border-gray-700 rounded-l-md hover:bg-gray-800 text-white"
                                                                        disabled={item.quantity <= 1}
                                                                    >
                                                                        <Minus className="h-4 w-4" />
                                                                    </button>
                                                                    <div className="w-12 h-8 flex items-center justify-center border-t border-b border-gray-700 text-white">
                                                                        {item.quantity}
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleIncrement(item.productId, item.variantId)}
                                                                        className="w-8 h-8 flex items-center justify-center border border-gray-700 rounded-r-md hover:bg-gray-800 text-white"
                                                                        disabled={item.inventoryQuantity !== null && item.quantity >= item.inventoryQuantity}
                                                                    >
                                                                        <Plus className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                            <button
                                                                onClick={() => handleRemoveItem(item.productId, item.variantId)}
                                                                className="mt-2 text-red-400 hover:text-red-300 text-xs flex items-center gap-1 mx-auto"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                Remove
                                                            </button>
                                                        </div>

                                                        <div className="col-span-2 text-right">
                                                            <div className="text-white font-medium flex items-center justify-end">
                                                                <TokenSymbol /> {itemTokenTotal}
                                                            </div>
                                                            <div className="text-gray-400 text-xs flex items-center justify-end">
                                                                ${itemTotal}
                                                            </div>
                                                            {compareAtPrice && compareAtPrice > price && (
                                                                <div className="text-green-400 text-sm mt-1 flex items-center justify-end">
                                                                    Save <TokenSymbol /> {((compareAtPrice - price) * item.quantity).toFixed(2)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Cart Actions */}
                                    <div className="px-6 py-4 border-t border-gray-700 flex justify-between bg-[var(--color-panel)]/50">
                                        {filteredCartItems.length > 0 && (
                                            <Button
                                                variant="outline"
                                                className="border-gray-600 bg-gray-900 text-gray-300 hover:bg-gray-400"
                                                onClick={() => {
                                                    // Get items that will remain after clearing current tab
                                                    const remainingItems = cartItems.filter(item =>
                                                        activeTab === 'physical' ? item.isDigital : !item.isDigital
                                                    );

                                                    // Clear only the current tab items
                                                    const itemsToRemove = cartItems.filter(item =>
                                                        activeTab === 'physical' ? !item.isDigital : item.isDigital
                                                    );

                                                    // Remove items from current tab
                                                    itemsToRemove.forEach(item => {
                                                        dispatch(removeFromCart({
                                                            productId: item.productId,
                                                            variantId: item.variantId
                                                        }));
                                                    });

                                                    // Switch to other tab if it has items
                                                    if (remainingItems.length > 0) {
                                                        setActiveTab(activeTab === 'physical' ? 'digital' : 'physical');
                                                    }
                                                }}
                                            >
                                                <Icons.trash className="mr-2 h-4 w-4" />
                                                Clear Cart
                                            </Button>
                                        )}
                                        <Link href={`/shop?tab=${activeTab}`}>
                                            <Button className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 transition-all text-white px-6 py-4 text-[14px]">
                                                <Icons.arrowLeft className="mr-2 h-4 w-4" />
                                                Continue Shopping
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Order Summary */}
                            {
                                filteredCartItems && filteredCartItems.length > 0 && (
                                    <div className="lg:col-span-1">
                                        <div className="bg-[var(--color-surface)] rounded-lg p-6 shadow-lg border border-gray-500 sticky top-4">
                                            <h2 className="text-xl font-bold text-white mb-4 pb-3 border-b border-gray-700">Order Summary</h2>

                                            <div className="space-y-3 mb-4">
                                                <div className="flex justify-between text-gray-300">
                                                    <span>Subtotal ({filteredCartItems.length} items)</span>
                                                    <span className="flex flex-col items-end">
                                                        <span className="flex items-center">
                                                            <TokenSymbol /> {filteredCartItems.reduce((sum, item) => {
                                                                const tokenPrice = Number(item.tokenPrice) || 0;
                                                                return sum + (tokenPrice * item.quantity);
                                                            }, 0).toFixed(2)}
                                                        </span>
                                                        {/* USD value under subtotal */}
                                                        <span className="text-xs text-gray-400">
                                                            ${filteredCartItems.reduce((sum, item) => {
                                                                const price = Number(item.price) || 0;
                                                                return sum + (price * item.quantity);
                                                            }, 0).toFixed(2)}
                                                        </span>
                                                    </span>
                                                </div>

                                                <div className="flex justify-between text-gray-300">
                                                    <span>Discount</span>
                                                    <span className="text-green-400 flex items-center">-<TokenSymbol /> 0.00</span>
                                                </div>

                                                <div className="flex justify-between text-gray-300">
                                                    <span>Total in USD</span>
                                                    <span className="flex items-center">
                                                        ${filteredCartItems.reduce((sum, item) => {
                                                            const price = Number(item.price) || 0;
                                                            return sum + (price * item.quantity);
                                                        }, 0).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Total */}
                                            <div className="flex justify-between items-center mb-6 text-lg font-bold">
                                                <span className="text-white">Total Amount</span>
                                                <span className="flex flex-col items-end text-[var(--color-primary)]">
                                                    <span className="flex items-center">
                                                        <TokenSymbol /> {filteredCartItems.reduce((sum, item) => {
                                                            const tokenPrice = Number(item.tokenPrice) || 0;
                                                            return sum + (tokenPrice * item.quantity);
                                                        }, 0).toFixed(2)}
                                                    </span>
                                                    {/* USD value under total */}
                                                    <span className="text-xs text-gray-400">
                                                        ${filteredCartItems.reduce((sum, item) => {
                                                            const price = Number(item.price) || 0;
                                                            return sum + (price * item.quantity);
                                                        }, 0).toFixed(2)}
                                                    </span>
                                                </span>
                                            </div>

                                            {/* Savings */}
                                            <div className="bg-green-900/20 text-green-400 p-3 rounded-md mb-6 text-sm flex items-start">
                                                <Icons.piggyBank className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                                                <span>You're saving <TokenSymbol /> {filteredCartItems.reduce((sum, item) => {
                                                    const price = Number(item.price) || 0;
                                                    const compareAtPrice = item.compareAtPrice ? Number(item.compareAtPrice) : price;
                                                    return sum + ((compareAtPrice - price) * item.quantity);
                                                }, 0).toFixed(2)} on this order!</span>
                                            </div>

                                            {/* Checkout Button */}
                                            <div className="mt-6">
                                                {user ? (
                                                    <>
                                                        <Button
                                                            className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 transition-all text-white px-8 py-6 text-lg"
                                                            onClick={() => {
                                                                // Check if all items in filtered cart are digital
                                                                const allItemsAreDigital = filteredCartItems.every(item => item.isDigital);

                                                                if (allItemsAreDigital || selectedAddress || !hasRegularPhysicalItems) {
                                                                    dispatch(clearPayment())
                                                                    router.push(`/checkout?productType=${activeTab}`);
                                                                }
                                                            }}
                                                            disabled={filteredCartItems.length === 0}
                                                        >
                                                            {filteredCartItems.length === 0 ? (
                                                                'Cart is Empty'
                                                            ) : (
                                                                <>
                                                                    Proceed to Checkout
                                                                    <ChevronRight className="ml-2 h-5 w-5" />
                                                                </>
                                                            )}
                                                        </Button>
                                                        {!selectedAddress && !filteredCartItems.every(item => item.isDigital) && hasRegularPhysicalItems && (
                                                            <div className="text-center text-red-400 text-sm mt-2">
                                                                Please add a delivery address to proceed to checkout
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <Link href="/auth?redirect=/cart" className={filteredCartItems.length === 0 ? 'pointer-events-none' : ''}>
                                                        <Button
                                                            className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 transition-all text-white px-8 py-6 text-lg"
                                                            disabled={filteredCartItems.length === 0}
                                                        >
                                                            {filteredCartItems.length === 0 ? (
                                                                'Cart is Empty'
                                                            ) : (
                                                                <>
                                                                    Login to Checkout
                                                                    <ChevronRight className="ml-2 h-5 w-5" />
                                                                </>
                                                            )}
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>

                                            {/* Payment Methods */}
                                            <div className="mt-6 flex flex-wrap gap-2 justify-center">
                                                <div className="bg-gray-800 p-2 rounded-md w-12 h-8"></div>
                                                <div className="bg-gray-800 p-2 rounded-md w-12 h-8"></div>
                                                <div className="bg-gray-800 p-2 rounded-md w-12 h-8"></div>
                                                <div className="bg-gray-800 p-2 rounded-md w-12 h-8"></div>
                                                <div className="bg-gray-800 p-2 rounded-md w-12 h-8"></div>
                                            </div>

                                            {/* Secure Checkout */}
                                            <div className="mt-4 text-center text-xs text-gray-400 flex items-center justify-center">
                                                <Icons.lock className="h-3 w-3 mr-1" />
                                                Secure Checkout
                                            </div>
                                        </div>
                                    </div>
                                )
                            }

                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Cart;
