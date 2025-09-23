import { RootState, AppDispatch } from "@/src/store";
import { MapPin, ShoppingBag } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "../ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchUserAddresses, updateSelectedAddressId } from "@/src/store/slices/userSlice";
import OrderSummary from "./orderSummary"; 
import { CartItem } from "@/src/store/slices/cartSlice";
import { useCheckoutProgress } from "@/src/hooks/useCheckoutProgress";
import CheckoutProgress from "../ui/checkoutProgress";
import { isKioskInterface } from "@/src/core/utils";

const Checkout = () => {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<'physical' | 'digital'>('physical');
    const productType = searchParams?.get('productType');

    const { addresses, selectedAddressId } = useSelector((state: RootState) => state.user);
    const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
    const cartItems = useSelector((state: RootState) => state.cart.items);
    
    // Check if cart has regular physical items (not kiosk products)
    const hasRegularPhysicalItems = cartItems.some(item => !item.isDigital && item.soldBy !== 'Kiosk');

    // Use the dynamic checkout progress hook
    const {
        steps: checkoutSteps,
        currentStepIndex,
        progressPercentage,
        canProceedToNextStep,
        getNextStep,
        hasPhysicalItems,
        hasDigitalItems
    } = useCheckoutProgress();

    // Set default address when addresses are loaded
    useEffect(() => {
        if (addresses.length > 0 && !selectedAddressId) {
            const defaultAddress = addresses.find(addr => addr.setAsDefault);
            if (defaultAddress) {
                dispatch(updateSelectedAddressId(defaultAddress.id));
            } else {
                // If no default address, select the first one
                const firstAddress = addresses[0];
                if (firstAddress) {
                    dispatch(updateSelectedAddressId(firstAddress.id));
                }
            }
        }
    }, [addresses, selectedAddressId, dispatch]);

    useEffect(() => {
        dispatch(fetchUserAddresses());
        setActiveTab(productType === 'physical' ? 'physical' : 'digital');
    }, [dispatch, productType]);

    return (
        <div className=" mx-auto py-8 md:py-16 px-4 min-h-screen bg-[var(--color-surface)]">
            {/* Dynamic Checkout Progress */}
            <CheckoutProgress
                steps={checkoutSteps}
                progressPercentage={progressPercentage}
                className="mb-8"
            />

            <h1 className="text-3xl font-bold mb-8 text-white flex items-center">
                <ShoppingBag className="h-8 w-8 text-[var(--color-primary)] mr-3" />
                Checkout
            </h1>

            {
                productType === 'physical' ? (
                    <div className="mb-6">
                        <button
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === 'physical'
                                ? 'bg-[var(--color-primary)] text-white'
                                : 'bg-[var(--color-surface)] text-gray-400 hover:text-white'
                                }`}
                        >
                            Physical Products
                        </button>
                    </div>
                )
                    : (
                        <div className="mb-6">
                            <button
                                className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === 'digital'
                                    ? 'bg-[var(--color-primary)] text-white'
                                    : 'bg-[var(--color-surface)] text-gray-400 hover:text-white'
                                    }`}
                            >
                                Digital Products
                            </button>
                        </div>
                    )
            }


            {activeTab === 'physical' && selectedAddress && hasRegularPhysicalItems && (
                <div className="bg-[var(--color-surface)] rounded-lg p-6 mb-6 shadow-lg border border-gray-800">
                    <div className="flex flex-wrap gap-4 justify-between items-center mb-4 border-b border-gray-700 pb-4">
                        <h2 className="text-xl font-bold text-white flex items-center">
                            <MapPin className="mr-2 h-5 w-5 text-[var(--color-primary)]" />
                            Deliver to:
                        </h2>
                        <Button
                            onClick={() => router.push('/addresses?callbackUrl=/checkout')}
                            className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 transition-all text-white border-none"
                        >
                            Change Address
                        </Button>
                    </div>
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
                </div>
            )}

            {activeTab === 'physical' && !selectedAddress && hasRegularPhysicalItems && (
                <div className="bg-[var(--color-surface)] rounded-lg p-6 mb-6 shadow-lg border border-gray-800">
                    <div className="flex flex-wrap gap-4 justify-between items-center">
                        <div className="flex items-center">
                            <MapPin className="mr-2 h-5 w-5 text-[var(--color-primary)]" />
                            <span className="text-white">No delivery address selected</span>
                        </div>
                        <Button
                            onClick={() => router.push('/addresses?callbackUrl=/checkout')}
                            className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 transition-all text-white border-none"
                        >
                            Add Address
                        </Button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="lg:col-span-2">
                    <OrderSummary activeTab={activeTab} />
                </div>
            </div>
        </div>
    )
}

export default Checkout;