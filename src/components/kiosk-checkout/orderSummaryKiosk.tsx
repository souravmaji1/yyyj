import { TokenSymbol } from "@/src/core/icons/tokenIcon";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/src/store";
import { AppDispatch } from "@/src/store";
import { Button } from "../ui/button";
import { Icons } from "@/src/core/icons";
import { useEffect, useState } from "react";
import {
  Coins as Token,
  Shield,
  Check,
} from "lucide-react";
import {
  clearPayment,
  setPaymentData,
  transferToken,
} from "@/src/store/slices/paymentSlice";
import { Spinner } from "../ui/spinner";
import { fetchUserNfts, transferNftForDiscount } from "@/src/store/slices/nftSlice";
import { clearKioskCart } from "@/src/store/slices/kioskCartSlice";
import {
  setOrderId,
  createKioskOrder,
  setOrderItems,
} from "@/src/store/slices/orderSlice";
import { useRouter } from "next/navigation";
import { usePaymentSocket } from "@/src/contexts/PaymentSocketProvider";
import { useNotificationUtils } from "@/src/core/utils/notificationUtils";
import { setSelectedDiscountNFT, clearSelectedDiscountNFT } from "@/src/store/slices/orderSlice";
import { fetchWalletBalance, updateWalletBalance } from "@/src/store/slices/userSlice";
import { getUserByMachineId } from "@/src/store/slices/machineSlice";
import { getKioskMacFromLocalStorage } from "@/src/core/utils";

// NFT Card Component
const NFTCard = ({
  nft,
  isActive,
  onSelect,
}: {
  nft: any;
  isActive: boolean | any;
  onSelect: () => void;
}) => {
  return (
    <button
      onClick={onSelect}
      className={`relative overflow-hidden rounded-lg transition-all ${isActive
        ? "ring-2 ring-[var(--color-primary)]"
        : "ring-1 ring-gray-700 hover:ring-gray-500"
        }`}
    >
      <div className="aspect-square bg-gray-800 relative">
        <Image
          src={nft.imageUrl}
          alt={nft.name}
          width={150}
          height={150}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent p-3 flex flex-col justify-end">
          <span className="text-white font-medium text-sm truncate">
            {nft.name}
          </span>
          <span className="text-white/80 text-xs">
            -{nft.discountPercentage}%
          </span>
        </div>

        {isActive && (
          <div className="absolute top-2 right-2 h-6 w-6 bg-[var(--color-primary)] rounded-full flex items-center justify-center shadow-[var(--shadow-sm)]">
            <Check className="h-4 w-4 text-white" />
          </div>
        )}
      </div>
    </button>
  );
};

interface OrderSummaryKioskProps {
  activeTab: "physical" | "digital";
}

const PAYMENT_METHODS = {
  TOKEN: "token",
} as const;

type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

const OrderSummaryKiosk = ({ activeTab }: OrderSummaryKioskProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const kioskCartItems = useSelector((state: RootState) => state.kioskCart.items);
  const isUser = useSelector((state: RootState) => state.user.profile);
  const userTokenBalance = useSelector(
    (state: RootState) => state.user.profile?.tokenBalance || 0
  );
  const paymentLoading = useSelector(
    (state: RootState) => state.payment.loading
  );
  const existingOrderId = useSelector(
    (state: RootState) => state.order.orderId
  );
  const existingOrderItems = useSelector(
    (state: RootState) => state.order.orderItems
  );
  const machineData = useSelector((state: RootState) => state.machine.userData);
  const machineLoading = useSelector((state: RootState) => state.machine.loading);
  const machineError = useSelector((state: RootState) => state.machine.error);

  // Convert kiosk cart items to order format
  const cartItems = kioskCartItems.map((kioskItem) => ({
    productId: kioskItem.productId, // Keep as string (UUID) for kiosk products
    variantId: 0,
    shopifyId: null,
    title: kioskItem.name,
    price: kioskItem.price,
    compareAtPrice: null,
    color: null,
    size: null,
    length: null,
    dimension: null,
    weight: null,
    quantity: kioskItem.quantity,
    image: kioskItem.image,
    inventoryQuantity: kioskItem.totalStock,
    tokenPrice: kioskItem.tokenPrice, // Use actual tokenPrice from cart item
    productHandle: "",
    variantTitle: "",
    soldBy: "Kiosk",
    isDigital: false,
  }));

  // Kiosk only uses token payment
  const [paymentMethod] = useState<PaymentMethod>(PAYMENT_METHODS.TOKEN);
  const [activeNFT, setActiveNFT] = useState<any>(null);
  const [showAllNFTs, setShowAllNFTs] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Select user-specific NFTs from Redux
  const userNftItems = useSelector((state: RootState) => state.allNft?.nftItems || []) as any[];
  const userNftLoading = useSelector((state: RootState) => state.allNft?.loading || false);
  const userNftError = useSelector((state: RootState) => state.allNft?.error || null);
  const selectedDiscountNFT = useSelector((state: RootState) => state.order.selectedDiscountNFT);

  const displayedNFTs = showAllNFTs ? userNftItems : userNftItems.slice(0, 2);

  const router = useRouter();
  const { joinPaymentRoom } = usePaymentSocket();
  const userId = useSelector((state: RootState) => state.user.profile?.id);
  const { showSuccess, showError, showInfo } = useNotificationUtils();

  // Fetch user NFTs on mount or when userId changes
  useEffect(() => {
    if (userId) {
      dispatch(fetchUserNfts({ userId }));
    }
  }, [dispatch, userId]);

  // Function to get machine ID and fetch user data
  const getMachineIdAndUser = async () => {
    try {
      // Get machine ID from localStorage or environment variable
      const machineId = getKioskMacFromLocalStorage() || localStorage.getItem('machine_id');

      if (machineId) {
        await dispatch(getUserByMachineId(machineId)).unwrap();
      }
    } catch (error) {
      console.error('Failed to get machine user data:', error);
    }
  };

  // Call machine API on component mount
  useEffect(() => {
    getMachineIdAndUser();
  }, [dispatch]);

  // Filter cart items based on active tab (for kiosk, always physical)
  // For kiosk, just use all cart items since they're all physical
  const filteredCartItems = cartItems; // No filtering needed for kiosk



  const subtotal = filteredCartItems
    .reduce((total: number, item) => {
      const price = Number(item.price) || 0;
      return total + price * item.quantity;
    }, 0)
    .toFixed(2);

  // Calculate NFT discount percentage and amount
  const nftDiscountPercentage = activeNFT
    ? ((activeNFT as any).discount ?? (activeNFT as any).discountPercentage ?? 0)
    : 0;
  const nftDiscount = (Number(subtotal) * nftDiscountPercentage) / 100;
  const totalDiscount = isNaN(nftDiscount) ? 0 : nftDiscount;

  // Calculate required token amount
  const requiredTokenAmount = filteredCartItems.reduce((sum, item) => {
    const tokenPrice = Number(item.tokenPrice) || 0;
    return sum + tokenPrice * item.quantity;
  }, 0);

  // Check if user has sufficient tokens
  const hasSufficientTokens = userTokenBalance >= requiredTokenAmount;

  // Add authentication check - prioritize login status over token balance
  const isUserAuthenticated = !!isUser;
  const shouldShowLoginPrompt = !isUserAuthenticated;
  const shouldShowInsufficientTokens = isUserAuthenticated && !hasSufficientTokens;

  useEffect(() => {
    if (selectedDiscountNFT) {
      setActiveNFT(selectedDiscountNFT);
    }
  }, [selectedDiscountNFT]);

  const applyNFTDiscount = (nft: any) => {
    if (activeNFT && (activeNFT as any).id === nft.id) {
      setActiveNFT(null);
      dispatch(setSelectedDiscountNFT(null));
      showInfo("NFT discount removed");
    } else {
      setActiveNFT(nft);
      dispatch(setSelectedDiscountNFT(nft));
      showSuccess("Discount Applied", `${nft.discount || nft.discountPercentage || 0}% discount applied!`);
    }
  };

  const handleSubmit = async () => {
    if (!isUser) {
      // Redirect to login with return URL to come back to kiosk checkout
      router.push("/auth?returnUrl=/kiosk-checkout");
      return;
    }

    // Set loading state
    setIsProcessingPayment(true);

    try {
      // Check if cart items have changed
      const currentCartItems = filteredCartItems.map((item) => ({
        productId: item.productId, // Keep as string for kiosk products (UUID)
        variantId: item.variantId ? Number(item.variantId) : 0,
        quantity: item.quantity,
        unitPrice: Number(item.price),
        totalPrice: Number(item.price) * item.quantity,
      }));

      const hasCartChanged =
        !existingOrderItems ||
        JSON.stringify(existingOrderItems) !== JSON.stringify(currentCartItems);

      let orderId = existingOrderId;

      // Calculate required amount
      const totalTokenAmount = filteredCartItems.reduce((sum, item) => {
        const tokenPrice = Number(item.tokenPrice) || 0;
        return sum + tokenPrice * item.quantity;
      }, 0);

      const requiredAmount = Number((totalTokenAmount - totalDiscount).toFixed(2));

      // Create new order if needed
      if (!orderId || hasCartChanged) {
        // Ensure all numeric values are valid
        const validTotalAmount = isNaN(requiredAmount) ? 0 : Number(requiredAmount);
        const validDiscountAmount = isNaN(totalDiscount) ? 0 : Number(totalDiscount);
        const validNftDiscountPercentage = isNaN(nftDiscountPercentage) ? 0 : Number(nftDiscountPercentage);

        const orderPayload = {
          totalAmount: validTotalAmount,
          discountAmount: validDiscountAmount,
          nftId: (activeNFT as any)?.id || null,
          nftName: (activeNFT as any)?.nftName || (activeNFT as any)?.name || null,
          nftDiscountAmount: validDiscountAmount,
          nftDiscountPercentage: validNftDiscountPercentage,
          couponCode: "",
          message: "",
          addressId: "", // No address for kiosk
          currency: "app_token",
          orderItems: currentCartItems,
          paymentMethod: "app_token",
          machineId: machineData?.data?.machineId || getKioskMacFromLocalStorage() || localStorage.getItem('machine_id') || "",
        };

        // Debug log to check for any NaN values
        console.log('🔍 Kiosk Order Payload Debug:', {
          requiredAmount,
          validTotalAmount,
          totalDiscount,
          validDiscountAmount,
          nftDiscountPercentage,
          validNftDiscountPercentage,
          orderPayload
        });

        // Show order creation feedback
        showInfo("Creating Order", "Please wait while we create your kiosk order...");

        const orderResult = await dispatch(createKioskOrder(orderPayload)).unwrap();

        if (!orderResult.orderId) {
          throw new Error("Failed to create order");
        }

        orderId = orderResult.orderId;
        dispatch(setOrderId(orderId));
        dispatch(setOrderItems(currentCartItems));
      }

      // Process token payment
      if (!orderId) {
        throw new Error("Order ID is required for payment");
      }

      const tokenPaymentPayload = {
        amount: Number(requiredAmount),
        userId: isUser.id,
        currency: "app_token",
        paymentType: "buyProduct",
        orderId: orderId,
        paymentMethod: "app_token",
        to: machineData?.data?.userId || "", // Use machine user ID if available"
      };

      // Show payment processing feedback
      showInfo("Processing Payment", "Please wait while we process your token payment...");


      const result = await dispatch(transferToken(tokenPaymentPayload)).unwrap();

      if (result.success) {
        // Update wallet balance immediately for better UX
        const newBalance = userTokenBalance - requiredAmount;
        dispatch(updateWalletBalance(newBalance));

        // Also refresh from server to ensure accuracy
        if (isUser?.id) {
          await dispatch(fetchWalletBalance(isUser.id));
        }

        // Transfer NFT to admin if discount was used
        if (activeNFT && isUser && orderId) {
          await dispatch(transferNftForDiscount({
            nftId: (activeNFT as any).id,
            userId: isUser.id,
            orderId: orderId
          }));

          // Refresh user NFTs and clear selection
          await dispatch(fetchUserNfts({ userId: isUser.id }));
          dispatch(clearSelectedDiscountNFT());
          setActiveNFT(null);
        }

        dispatch(clearKioskCart());
        dispatch(clearPayment());
        showSuccess(
          "Payment Successful",
          result.message || "Kiosk order completed successfully!"
        );

        router.push(
          `/payment-success?paymentId=${result.paymentId}&status=paid&orderType=buyProduct`
        );
      } else {
        throw new Error(result.message || "Failed to process token payment");
      }
    } catch (error: any) {
      console.error("🚨 Kiosk Order/Payment Full Error:", error);
      console.error("🚨 Error Response:", error?.response);
      console.error("🚨 Error Response Data:", error?.response?.data);
      console.error("🚨 Error Status:", error?.response?.status);
      console.error("🚨 Error Message:", error?.message);

      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to process kiosk order. Please try again.";
      showError("Order Error", errorMessage);
    } finally {
      // Clear loading state
      setIsProcessingPayment(false);
    }
  };

  // Calculate subtotal in dollars and tokens
  const subtotalUSD = filteredCartItems.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    return sum + price * item.quantity;
  }, 0);
  const subtotalTokens = filteredCartItems.reduce((sum, item) => {
    const tokenPrice = Number(item.tokenPrice) || 0;
    return sum + tokenPrice * item.quantity;
  }, 0);

  // Calculate NFT discount in tokens
  const nftDiscountTokens = (subtotalTokens * nftDiscountPercentage) / 100;
  const finalTotalTokens = subtotalTokens - nftDiscountTokens;

  // Modal state for showing all NFTs
  const [showNftModal, setShowNftModal] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="bg-[var(--color-surface)] rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="font-bold text-white">
              Kiosk Order Items ({filteredCartItems.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-700">
            {filteredCartItems.map((item) => {
              const price = Number(item.price) || 0;
              const tokenPrice = Number(item.tokenPrice) || 0;
              const itemTotal = (price * item.quantity).toFixed(2);
              const itemTokenTotal = (tokenPrice * item.quantity).toFixed(2);

              return (
                <div key={item.productId} className="p-6">
                  <div className="flex gap-4">
                    <div className="relative w-20 h-20 flex-shrink-0 bg-gray-800 rounded-md overflow-hidden">
                      <Image
                        src={item.image || "/placeholder.png"}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-white font-medium">
                            {item.title}
                          </h3>
                          <p className="text-gray-400 text-sm mt-1">
                            Sold by: Kiosk
                          </p>
                          <div className="text-gray-400 text-sm mt-2">
                            Qty: {item.quantity}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-white font-medium flex items-center justify-end">
                            <TokenSymbol /> {itemTokenTotal}
                          </div>
                          <div className="text-gray-400 text-xs flex items-center justify-end">
                            ${itemTotal}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Kiosk Payment Method - Token Only */}
        <div className="bg-[var(--color-surface)] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-6 text-white">Payment Method</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="relative p-2 rounded-xl border-2 border-[var(--color-primary)] bg-[var(--color-primary)]/5 h-32">
              <div className="flex flex-col items-center text-center justify-center h-full">
                <div className="p-2 rounded-full mb-2 text-[var(--color-primary)] bg-[var(--color-primary)]/20">
                  <Token className="h-6 w-6" />
                </div>
                <h3 className="font-medium text-[var(--color-primary)]">
                  Pay with Tokens
                </h3>
                <p className="text-gray-400 text-xs mt-1">Kiosk token payment</p>
              </div>
              <div className="absolute -top-2 -right-2 h-6 w-6 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white text-xs">
                ✓
              </div>
            </div>
          </div>

          {/* Token Balance Display */}
          {isUserAuthenticated ? (
            <div className="bg-[var(--color-panel)] p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-300">Available Balance</p>
                  <p className="text-white font-bold text-xl mt-1 flex items-center">
                    <TokenSymbol /> {Number(userTokenBalance).toFixed(2)}
                  </p>
                </div>
                <Token className="h-10 w-10 text-[var(--color-primary)]" />
              </div>

              {/* Insufficient Balance Warning */}
              {shouldShowInsufficientTokens && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">
                    Insufficient balance. You need <TokenSymbol /> {(requiredTokenAmount - userTokenBalance).toFixed(2)} more tokens.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[var(--color-panel)] p-4 rounded-lg">
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="mb-4">
                    <Token className="h-16 w-16 text-[var(--color-primary)] mx-auto" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">Login Required</h3>
                  <p className="text-gray-400 text-sm">
                    Please login to view your token balance and complete the purchase
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <div className="bg-[var(--color-surface)] rounded-lg p-6 sticky top-4 border border-gray-700">
          <h2 className="text-xl font-bold mb-6 text-white">Order Summary</h2>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-gray-300">
              <span>Price ({filteredCartItems.length} items)</span>
              <span className="flex flex-col items-end">
                <span className="flex items-center">
                  <TokenSymbol /> {subtotalTokens.toFixed(2)}
                </span>
                <span className="text-xs text-gray-400">
                  ${subtotalUSD.toFixed(2)}
                </span>
              </span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Discount</span>
              <span className="text-green-400 flex items-center">
                -<TokenSymbol /> {nftDiscountTokens.toFixed(2)}
                {activeNFT && (
                  <span className="ml-2 text-xs text-blue-400">
                    ({(activeNFT as any).nftName || (activeNFT as any).name})
                  </span>
                )}
              </span>
            </div>
            <div className="border-t border-gray-700 pt-3 flex justify-between font-bold text-white">
              <span>Total Amount</span>
              <span className="flex flex-col items-end text-[var(--color-primary)]">
                <span className="flex items-center text-lg font-bold">
                  <TokenSymbol /> {finalTotalTokens.toFixed(2)}
                </span>
              </span>
            </div>
          </div>

          {/* NFT Discounts Section */}
          {userNftItems.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Token className="h-5 w-5 text-[var(--color-primary)]" />
                  <h3 className="font-medium text-white">Apply NFT Discount</h3>
                </div>
                {userNftItems.length > 2 && (
                  <button
                    onClick={() => setShowNftModal(true)}
                    className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 transition-colors flex items-center gap-1"
                  >
                    Show All ({userNftItems.length})
                    <Icons.plus className="h-4 w-4" />
                  </button>
                )}
              </div>
              {userNftLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Spinner className="h-8 w-8 text-[var(--color-primary)] animate-spin" />
                  <span className="ml-3 text-gray-400 text-sm">Loading NFTs...</span>
                </div>
              ) : userNftError ? (
                <div className="text-red-400 text-sm py-4">{userNftError}</div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {displayedNFTs.map((nft) => (
                    <NFTCard
                      key={nft.id}
                      nft={{
                        ...nft,
                        name: nft.nftName,
                        imageUrl: nft.image || nft.nftImgUrl,
                        discountPercentage: nft.discount || 0,
                      }}
                      isActive={activeNFT && (activeNFT as any).id === nft.id}
                      onSelect={() => applyNFTDiscount(nft)}
                    />
                  ))}
                </div>
              )}
              <div className="mt-4 text-xs text-gray-400">
                <p>Select an NFT to apply its discount to your kiosk purchase</p>
              </div>
            </div>
          )}

          {totalDiscount > 0 && (
            <div className="bg-green-900/20 border border-green-900/30 rounded-lg p-3 mt-6">
              <div className="flex items-center gap-2 text-green-400 font-medium">
                <Check className="h-5 w-5" />
                <span>
                  You will save <TokenSymbol /> {totalDiscount.toFixed(2)} on
                  this order
                </span>
              </div>
            </div>
          )}

          {/* Payment button */}
          <Button
            onClick={handleSubmit}
            disabled={
              isProcessingPayment ||
              paymentLoading ||
              machineLoading ||
              filteredCartItems.length === 0 ||
              (isUserAuthenticated && shouldShowInsufficientTokens)
            }
            className={`w-full py-6 text-lg mt-6 ${!isUserAuthenticated
              ? 'bg-blue-600 hover:bg-blue-700 border-2 border-blue-400'
              : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90'
              }`}
          >
            {isProcessingPayment || paymentLoading || machineLoading ? (
              <>
                <Spinner className="mr-2 h-4 w-4 animate-spin" />
                {isProcessingPayment ? "Processing Payment..." : machineLoading ? "Loading Machine Data..." : "Processing..."}
              </>
            ) : filteredCartItems.length === 0 ? (
              "No Items in Cart"
            ) : !isUserAuthenticated ? (
              "Login to Continue →"
            ) : shouldShowInsufficientTokens ? (
              "Insufficient Tokens"
            ) : (
              "Complete Kiosk Payment"
            )}
          </Button>

          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
              <Shield className="h-4 w-4" />
              <span>Secure kiosk transaction</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryKiosk; 