import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from "@/src/store";
import { 
  removeFromKioskCart, 
  updateKioskCartQuantity, 
  clearKioskCart,
  KioskCartItem 
} from "@/src/store/slices/kioskCartSlice";
import { Button } from "../ui/button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, ChevronRight, Minus, Trash2, ShoppingCart } from "lucide-react";
import { TokenSymbol } from "@/src/core/icons/tokenIcon";
import { useNotificationUtils } from "@/src/core/utils/notificationUtils";
import { Icons } from "@/src/core/icons";

const KioskCart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  
  const kioskCartItems = useSelector((state: RootState) => state.kioskCart.items);
  const kioskCartTotals = useSelector((state: RootState) => state.kioskCart.totals);
  const kioskCartError = useSelector((state: RootState) => state.kioskCart.error);
  
  const { showError, showSuccess } = useNotificationUtils();

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    dispatch(updateKioskCartQuantity({ productId, quantity: newQuantity }));
    if (kioskCartError) {
      showError('Cart Error', kioskCartError);
    }
  };

  const handleIncrement = (productId: string) => {
    const item = kioskCartItems.find(item => item.productId === productId);
    if (item) {
      handleQuantityChange(productId, item.quantity + 1);
    }
  };

  const handleDecrement = (productId: string) => {
    const item = kioskCartItems.find(item => item.productId === productId);
    if (item && item.quantity > 1) {
      handleQuantityChange(productId, item.quantity - 1);
    }
  };

  const handleRemoveItem = (productId: string) => {
    dispatch(removeFromKioskCart({ productId }));
    showSuccess('Item Removed', 'Item removed from kiosk cart');
  };

  const handleClearCart = () => {
    dispatch(clearKioskCart());
    showSuccess('Cart Cleared', 'All items removed from kiosk cart');
  };

  const handleCheckout = () => {
    // Navigate to kiosk checkout
    router.push('/kiosk-checkout');
  };

  return (
    <div className="container mx-auto py-10 max-w-full min-h-screen bg-[var(--color-surface)]">
      <div className="px-4 md:px-20">
        {/* Kiosk Checkout Progress - Simplified */}
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 my-12">
          <div className="flex items-center justify-between relative pb-24">
            {/* Progress Bar */}
            <div className="absolute top-5 left-5 h-1.5 -translate-y-1/2" style={{ width: 'calc(100% - 2.5rem)' }}>
              <div className="w-full h-full bg-gray-700 rounded-full" />
              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full" style={{ width: '33%' }} />
            </div>

            {/* Steps */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center border-4 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] border-[var(--color-secondary)] shadow-lg shadow-[var(--color-primary)]/20">
                <Icons.check className="h-5 w-5 text-white" />
              </div>
              <div className="text-center mt-4 absolute top-12 w-48">
                <p className="font-semibold text-white text-base">Cart</p>
                <p className="text-sm text-gray-500">Review your items</p>
              </div>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center border-4 border-gray-600 bg-[var(--color-surface)]">
                <span className="font-bold text-base text-gray-400">2</span>
              </div>
              <div className="text-center mt-4 absolute top-12 w-48">
                <p className="font-semibold text-gray-400 text-base">Payment</p>
                <p className="text-sm text-gray-500">Choose payment method</p>
              </div>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center border-4 border-gray-600 bg-[var(--color-surface)]">
                <span className="font-bold text-base text-gray-400">3</span>
              </div>
              <div className="text-center mt-4 absolute top-12 w-48">
                <p className="font-semibold text-gray-400 text-base">Complete</p>
                <p className="text-sm text-gray-500">Order confirmation</p>
              </div>
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-8 text-white flex items-center">
          <ShoppingCart className="mr-3 h-7 w-7" />
          Kiosk Cart {kioskCartItems.length > 0 && <span className="text-xl ml-2 text-gray-400">(1 product)</span>}
        </h1>

        {kioskCartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-[var(--color-surface)] rounded-lg border border-gray-800">
            <ShoppingCart className="h-16 w-16 text-gray-600 mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-2">Your kiosk cart is empty</h2>
            <p className="text-gray-400 mb-6">Select one product from the kiosk to purchase. Adding a different product will replace the current one.</p>
            <Link href="/shop?tab=online">
              <Button className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 transition-all text-white px-8 py-4">
                Browse Kiosk Products
                <Icons.arrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
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
                  {kioskCartItems.map((item) => {

                    return (
                      <div key={item.productId} className="p-6">
                        <div className="grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-6">
                            <div className="flex gap-4">
                              <div className="relative w-20 h-20 flex-shrink-0 bg-gray-800 rounded-md overflow-hidden">
                                <Image
                                  src={item.image || '/placeholder.png'}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                  sizes="80px"
                                />
                              </div>

                              <div>
                                <h3 className="text-white font-medium">{item.name}</h3>
                                <p className="text-gray-400 text-sm mt-1">Sold by: Kiosk</p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {item.tags.map((tag) => (
                                    <span key={tag} className="bg-blue-900 text-blue-300 px-2 py-1 rounded text-xs">{tag}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="col-span-2 text-center">
                            <div className="text-white font-small flex flex-col items-center justify-center">
                              <div className="flex items-center">
                                <TokenSymbol /> <span className="text-sm">{parseFloat(item.tokenPrice || item.price).toFixed(2)}</span>
                              </div>
                              {item.tokenPrice && item.tokenPrice !== item.price && (
                                <div className="text-gray-400 text-xs mt-1">
                                  ${parseFloat(item.price).toFixed(2)} USD
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="col-span-2 text-center">
                            <div className="flex items-center justify-center">
                              <button
                                onClick={() => handleDecrement(item.productId)}
                                className="w-8 h-8 flex items-center justify-center border border-gray-700 rounded-l-md hover:bg-gray-800 text-white"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <div className="w-12 h-8 flex items-center justify-center border-t border-b border-gray-700 text-white">
                                {item.quantity}
                              </div>
                              <button
                                onClick={() => handleIncrement(item.productId)}
                                className="w-8 h-8 flex items-center justify-center border border-gray-700 rounded-r-md hover:bg-gray-800 text-white"
                                disabled={item.quantity >= item.totalStock}
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.productId)}
                              className="mt-2 text-red-400 hover:text-red-300 text-xs flex items-center gap-1 mx-auto"
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </button>
                          </div>

                          <div className="col-span-2 text-right">
                            <div className="text-white font-medium flex flex-col items-end">
                              <div className="flex items-center">
                                <TokenSymbol /> {(parseFloat(item.tokenPrice || item.price) * item.quantity).toFixed(2)}
                              </div>
                              {item.tokenPrice && item.tokenPrice !== item.price && (
                                <div className="text-gray-400 text-xs mt-1">
                                  ${(parseFloat(item.price) * item.quantity).toFixed(2)} USD
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Cart Actions */}
                <div className="px-6 py-4 border-t border-gray-700 flex justify-between bg-[var(--color-panel)]/50">
                  <Button
                    variant="outline"
                    className="border-gray-600 bg-gray-900 text-gray-300 hover:bg-gray-400"
                    onClick={handleClearCart}
                  >
                    <Icons.trash className="mr-2 h-4 w-4" />
                    Clear Cart
                  </Button>
                  <Link href="/shop?tab=online">
                    <Button className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 transition-all text-white px-6 py-4 text-[14px]">
                      <Icons.arrowLeft className="mr-2 h-4 w-4" />
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[var(--color-surface)] rounded-lg p-6 shadow-lg border border-gray-500 sticky top-4">
                <h2 className="text-xl font-bold text-white mb-4 pb-3 border-b border-gray-700">Order Summary</h2>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal ({kioskCartTotals.itemCount} items)</span>
                    <span className="flex items-center">
                      <TokenSymbol /> {kioskCartTotals.subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-300">
                    <span>Kiosk Service</span>
                    <span className="text-green-400 flex items-center">Free</span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center mb-6 text-lg font-bold">
                  <span className="text-white">Total Amount</span>
                  <div className="flex flex-col items-end">
                    <span className="flex items-center text-[var(--color-primary)]">
                      <TokenSymbol /> {kioskCartTotals.subtotal.toFixed(2)}
                    </span>
                    {/* Show USD equivalent if there are items with tokenPrice */}
                    {kioskCartItems.some(item => item.tokenPrice && item.tokenPrice !== item.price) && (
                      <span className="text-gray-400 text-sm mt-1">
                        ${kioskCartItems.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0).toFixed(2)} USD
                      </span>
                    )}
                  </div>
                </div>

                {/* Checkout Button */}
                <div className="mt-6">
                  <Button
                    className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 transition-all text-white px-8 py-6 text-lg"
                    onClick={handleCheckout}
                    disabled={kioskCartItems.length === 0}
                  >
                    {kioskCartItems.length === 0 ? (
                      'Cart is Empty'
                    ) : (
                      <>
                        Proceed to Payment
                        <ChevronRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>

                {/* Secure Checkout */}
                <div className="mt-4 text-center text-xs text-gray-400 flex items-center justify-center">
                  <Icons.lock className="h-3 w-3 mr-1" />
                  Secure Kiosk Checkout
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KioskCart; 