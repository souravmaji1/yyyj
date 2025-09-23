import { TokenSymbol } from "@/src/core/icons/tokenIcon";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/src/store";
import { AppDispatch } from "@/src/store";
import { Button } from "../ui/button";
import { Icons } from "@/src/core/icons";
import { useEffect, useState } from "react";
import {
  CreditCard,
  Wallet,
  Coins as Token,
  Shield,
  Check,
  Apple,
} from "lucide-react";
import ApplePay from "./ApplePay";
import {
  clearPayment,
  setPaymentData,
  setPaymentError,
  transferToken,
  createCryptoPayment,
} from "@/src/store/slices/paymentSlice";
import { Spinner } from "../ui/spinner";
import { fetchUserNfts, transferNftForDiscount } from "@/src/store/slices/nftSlice";
import { createProductPayment } from "@/src/store/slices/productPaymentSlice";

import { clearCart } from "@/src/store/slices/cartSlice";
import {
  setOrderId,
  createOrder,
  setOrderItems,
} from "@/src/store/slices/orderSlice";
import { useRouter } from "next/navigation";
import { usePaymentSocket } from "@/src/contexts/PaymentSocketProvider";
import { useNotificationUtils } from "@/src/core/utils/notificationUtils";
import { updateSelectedAddressId } from "@/src/store/slices/userSlice";
import { getLocalData } from "@/src/core/config/localStorage";
import { setSelectedDiscountNFT, clearSelectedDiscountNFT } from "@/src/store/slices/orderSlice";
import { isKioskInterface } from "@/src/core/utils";
import { detectPaymentMethods, isDigitalWalletSupported } from "@/src/core/utils/paymentUtils";


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

interface OrderSummaryProps {
  activeTab: "physical" | "digital";
}

// Define a more specific type for payment methods
const PAYMENT_METHODS = {
  SCAN: "scan",
  CARD: "card",
  TOKEN: "token",
  CRYPTO: "crypto",
  SACAN_PAY: "sacanPay",
  APPLE_PAY: "apple_pay",
  GOOGLE_PAY: "google_pay",
} as const;

type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

const OrderSummary = ({ activeTab }: OrderSummaryProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const isUser = useSelector((state: RootState) => state.user.profile);
  const userTokenBalance = useSelector(
    (state: RootState) => state.user.profile?.tokenBalance || 0
  );
  const paymentData = useSelector(
    (state: RootState) => state.payment.paymentData
  );
  const paymentLoading = useSelector(
    (state: RootState) => state.payment.loading
  );
  const paymentError = useSelector((state: RootState) => state.payment.error);
  const existingOrderId = useSelector(
    (state: RootState) => state.order.orderId
  );
  const existingOrderItems = useSelector(
    (state: RootState) => state.order.orderItems
  );
  // Always set paymentMethod to 'token' in kiosk mode
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(isKioskInterface() ? PAYMENT_METHODS.TOKEN : PAYMENT_METHODS.SCAN);
  // Keep paymentMethod locked to 'token' in kiosk mode
  useEffect(() => {
    if (isKioskInterface() && paymentMethod !== PAYMENT_METHODS.TOKEN) {
      setPaymentMethod(PAYMENT_METHODS.TOKEN);
    }
  }, [isKioskInterface(), paymentMethod]);
  const [totalInUsd, setTotalInUsd] = useState<number>(0);
  const [showAllNFTs, setShowAllNFTs] = useState(false);

  const [activeNFT, setActiveNFT] = useState<any>(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [paymentCooldown, setPaymentCooldown] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [digitalWalletSupported, setDigitalWalletSupported] = useState(false);
  const [applePayOrderId, setApplePayOrderId] = useState<string | null>(null);
  const productPaymentLoading = useSelector(
    (state: RootState) => state.productPayment.loading
  );
  const { addresses, selectedAddressId } = useSelector(
    (state: RootState) => state.user
  );
  const selectedAddress = addresses.find(
    (addr) => addr.id === selectedAddressId
  );
  // Select user-specific NFTs from Redux
  const userNftItems = useSelector((state: RootState) => state.allNft?.nftItems || []) as any[];

  const userNftLoading = useSelector((state: RootState) => state.allNft?.loading || false);
  const userNftError = useSelector((state: RootState) => state.allNft?.error || null);

  const selectedDiscountNFT = useSelector((state: RootState) => state.order.selectedDiscountNFT);


  const displayedNFTs = showAllNFTs ? userNftItems : userNftItems.slice(0, 2);

  const router = useRouter();
  const cartType = useSelector((state: RootState) => state.cart.cartType);
  const { joinPaymentRoom } = usePaymentSocket();
  const userId = useSelector((state: RootState) => state.user.profile?.id);
  const { showSuccess, showError, showInfo } = useNotificationUtils();

  // Set default address when addresses are loaded
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find((addr) => addr.setAsDefault);
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

  // Fetch user NFTs on mount or when userId changes
  useEffect(() => {
    if (userId) {
      dispatch(fetchUserNfts({ userId }));
    }
  }, [dispatch, userId]);

  // Check digital wallet support on mount
  useEffect(() => {
    const support = isDigitalWalletSupported();
    setDigitalWalletSupported(support);
  }, []);



  // Filter cart items based on active tab
  const filteredCartItems = cartItems.filter((item) =>
    activeTab === "physical" ? !item.isDigital : item.isDigital
  );

  // Check if cart has regular physical items (not kiosk products)
  const hasRegularPhysicalItems = filteredCartItems.some(item => !item.isDigital && item.soldBy !== 'Kiosk');

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

  const toggleShowAllNFTs = () => {
    setShowAllNFTs(!showAllNFTs);
  };

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

  useEffect(() => {
    let amount = filteredCartItems.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      return sum + price * item.quantity || 1;
    }, 0);

    setTotalInUsd(Number(amount.toFixed(2)));
  }, [filteredCartItems]);

  // Update payment method handler
  const handlePaymentMethodChange = (method: PaymentMethod) => {
    if (isKioskInterface()) return; // Prevent changing in kiosk mode
    if (method === PAYMENT_METHODS.TOKEN && !hasSufficientTokens) {
      showError(
        "Insufficient Tokens",
        `You need ${requiredTokenAmount.toFixed(2)} tokens but only have ${userTokenBalance.toFixed(2)} tokens available.`
      );
      return;
    }

    // Clear payment data when switching between different payment systems
    const currentPaymentSystem =
      paymentMethod === PAYMENT_METHODS.SCAN || paymentMethod === PAYMENT_METHODS.CARD ? 'stripe' :
        paymentMethod === PAYMENT_METHODS.CRYPTO ? 'crypto' :
          paymentMethod === PAYMENT_METHODS.TOKEN ? 'token' : 'stripe';

    const newPaymentSystem =
      method === PAYMENT_METHODS.SCAN || method === PAYMENT_METHODS.CARD ? 'stripe' :
        method === PAYMENT_METHODS.CRYPTO ? 'crypto' :
          method === PAYMENT_METHODS.TOKEN ? 'token' : 'stripe';

    if (currentPaymentSystem !== newPaymentSystem) {
      dispatch(clearPayment());
    }

    setPaymentMethod(method);
  };

  const handleSubmit = async () => {
    if (activeTab === "physical" && !selectedAddressId && hasRegularPhysicalItems) {
      showError("Address Required", "Please select an address to continue");
      return;
    }
    if (!isUser) {
      showError("Login Required", "Please login to continue");
      return;
    }

    // Check if payment is in cooldown
    if (
      paymentCooldown &&
      (paymentMethod === PAYMENT_METHODS.SCAN ||
        paymentMethod === PAYMENT_METHODS.CARD)
    ) {
      showError(
        "Please Wait",
        `Please wait ${cooldownSeconds} seconds before generating a new payment.`
      );
      return;
    }

    setIsSubmitting(true); // Start loading

    try {
      // Check if cart items have changed
      const currentCartItems = filteredCartItems.map((item) => ({
        productId: Number(item.productId),
        variantId: item.variantId ? Number(item.variantId) : 0,
        quantity: item.quantity,
        unitPrice: Number(item.price),
        totalPrice: Number(item.price) * item.quantity,
      }));

      const hasCartChanged =
        !existingOrderItems ||
        JSON.stringify(existingOrderItems) !== JSON.stringify(currentCartItems);

      let orderId = existingOrderId;

      // Calculate required amount regardless of order creation
      let requiredAmount = 0;
      const currency =
        paymentMethod === PAYMENT_METHODS.TOKEN ? "app_token" : "USD";

      const totalTokenAmount = filteredCartItems.reduce((sum, item) => {
        const tokenPrice = Number(item.tokenPrice) || 0;
        return sum + tokenPrice * item.quantity;
      }, 0);

      requiredAmount =
        paymentMethod === PAYMENT_METHODS.SCAN ||
          paymentMethod === PAYMENT_METHODS.CARD ||
          paymentMethod === PAYMENT_METHODS.CRYPTO
          ? Number(totalInUsd)
          : Number(totalTokenAmount);

      // requiredAmount = paymentMethod === PAYMENT_METHODS.SCAN || paymentMethod === PAYMENT_METHODS.CARD ? Number(totalInUsd) : Number(totalTokenAmount);
      requiredAmount = paymentMethod === PAYMENT_METHODS.SCAN || paymentMethod === PAYMENT_METHODS.CARD || paymentMethod === PAYMENT_METHODS.CRYPTO || paymentMethod === PAYMENT_METHODS.APPLE_PAY || paymentMethod === PAYMENT_METHODS.GOOGLE_PAY
        ? subtotalUSD - nftDiscountUSD
        : totalTokenAmount - totalDiscount;
      // Check if this is a "Generate New QR" action (existing order and payment data exists)
      const isGeneratingNewQR =
        orderId &&
        paymentData?.paymentId &&
        paymentMethod === PAYMENT_METHODS.SCAN;

      // Create new order if:
      // 1. No existing order OR
      // 2. Cart items have changed
      // 3. NOT generating new QR (skip order creation for new QR generation)
      if ((!orderId || hasCartChanged) && !isGeneratingNewQR) {
        const orderPayload = {
          totalAmount: Number(requiredAmount),
          discountAmount: nftDiscountUSD,
          nftId: (activeNFT as any)?.id,
          nftName: (activeNFT as any)?.nftName || (activeNFT as any)?.name || null,
          numberOfSupply: activeNFT && Number(1) || 0,
          buyNftId: activeNFT && (activeNFT as any)?.nftBuyId || 0,
          nftDiscountAmount: Number(nftDiscountUSD),
          nftDiscountPercentage: nftDiscountPercentage, // <-- ADD THIS LINE

          couponCode: "",
          message: "",
          addressId:
            activeTab === "physical" && selectedAddressId && hasRegularPhysicalItems
              ? selectedAddressId
              : "",
          currency: currency,
          orderItems: currentCartItems,
          paymentMethod:
            paymentMethod === PAYMENT_METHODS.SCAN ||
              paymentMethod === PAYMENT_METHODS.CARD
              ? "stripe"
              : paymentMethod === PAYMENT_METHODS.TOKEN
                ? "app_token"
                : paymentMethod === PAYMENT_METHODS.CRYPTO
                  ? "crypto"
                  : "stripe",
        };

        // Create new order
        const orderResult = await dispatch(createOrder(orderPayload)).unwrap();

        if (!orderResult.orderId) {
          throw new Error("Failed to create order");
        }

        orderId = orderResult.orderId;
        // Update Redux state with new order ID and items
        dispatch(setOrderId(orderId));
        dispatch(setOrderItems(currentCartItems));
      }

      // Ensure we have a valid orderId before proceeding with payment
      if (!orderId) {
        throw new Error("No valid order ID available for payment");
      }

      // Handle payment based on selected payment method
      switch (paymentMethod) {
        case PAYMENT_METHODS.CARD:
        case PAYMENT_METHODS.SCAN:
          // Always generate new payment data when button is clicked (for both scan and card)
          const paymentPayload = {
            amount: Number(finalTotalUSD), // Use discounted total
            userId: isUser.id,
            currency: "USD",
            paymentType: "buyProduct",
            orderId: orderId, // Use the existing order ID
            paymentMethod: "stripe",
          };

          const result = await dispatch(
            createProductPayment(paymentPayload)
          ).unwrap();

          // Start cooldown timer after successful payment generation
          startPaymentCooldown();

          dispatch(
            setPaymentData({
              url: result.url,
              qrCode: result.qrCode,
              paymentId: result.paymentId,
              status: result.status,
            })
          );

          if (userId) {
            joinPaymentRoom(userId, result.paymentId);
          }
          break;

        case PAYMENT_METHODS.TOKEN:
          const tokenPaymentPayload = {
            amount: Number(requiredAmount),
            userId: isUser.id,
            currency: "app_token",
            paymentType: "buyProduct",
            orderId: orderId,
            paymentMethod: "app_token",
          };

          await handleTokenPayment(tokenPaymentPayload);
          break;

        // case PAYMENT_METHODS.CRYPTO:
        //   await handleCryptoPayment();
        //   break;
        case PAYMENT_METHODS.CRYPTO:

          const cryptoPayload = {
            userId: isUser.id,
            currency: "USD",
            paymentType: "buyProduct",
            orderId: orderId
          }

          await handleCryptoPayment(cryptoPayload);
          break;

        case PAYMENT_METHODS.APPLE_PAY:
          // ✅ FIX: Save order to database BEFORE Apple Pay
          try {
            const orderPayload = {
              totalAmount: subtotalUSD - nftDiscountUSD,
              discountAmount: nftDiscountUSD,
              userId: isUser.id,
              currency: "USD",
              paymentMethod: "apple_pay",
              orderItems: filteredCartItems.map((item) => ({
                productId: Number(item.productId),
                variantId: item.variantId ? Number(item.variantId) : 0,
                quantity: item.quantity,
                unitPrice: Number(item.price),
                totalPrice: Number(item.price) * item.quantity,
              })),
              addressId: activeTab === "physical" && selectedAddressId && hasRegularPhysicalItems ? selectedAddressId : "",
              nftId: (activeNFT as any)?.id || null,
              nftName: (activeNFT as any)?.nftName || (activeNFT as any)?.name || null,
              numberOfSupply: activeNFT && Number(1) || 0,
              buyNftId: activeNFT && (activeNFT as any)?.nftBuyId || 0,
              nftDiscountAmount: Number(nftDiscountUSD),
              nftDiscountPercentage: nftDiscountPercentage,
              couponCode: "",
              message: "",
            };

            // ✅ SAVE ORDER TO DATABASE FIRST
            const orderResult = await dispatch(createOrder(orderPayload)).unwrap();
            const orderId = orderResult.orderId;

            // ✅ IMMEDIATE STATE UPDATE - CRITICAL FIX
            dispatch(setOrderId(orderId));
            setApplePayOrderId(orderId);

            // ✅ NOW PASS VALID ORDER ID TO APPLE PAY
          showInfo("Apple Pay", "Please complete your payment using the Apple Pay button above.");
          } catch (error: any) {
            showError("Order Creation Failed", error.message || "Failed to create order");
          }
          break;

        case PAYMENT_METHODS.GOOGLE_PAY:
          // Generate Google Pay QR code using existing payment flow
          try {
            const googlePayPayload = {
              amount: Number(finalTotalUSD),
              userId: isUser.id,
              currency: "USD",
              paymentType: "buyProduct",
              orderId: orderId,
              paymentMethod: "googlepay",
            };

            const result = await dispatch(createProductPayment(googlePayPayload)).unwrap();

            // Set payment data for QR code display
            dispatch(
              setPaymentData({
                url: result.url,
                qrCode: result.qrCode,
                paymentId: result.paymentId,
                status: result.status,
              })
            );

            if (userId) {
              joinPaymentRoom(userId, result.paymentId);
            }

            showSuccess("Google Pay QR Generated", "Scan the QR code with your mobile device to complete payment");
          } catch (error: any) {
            showError("Google Pay Error", error.message || 'Failed to generate Google Pay QR code');
          }
          break;

        case PAYMENT_METHODS.SACAN_PAY:
          // For cash on delivery, redirect with order ID
          dispatch(clearCart());
          router.push(`/checkout/success?orderId=${orderId}`);
          break;
          
        default:
          break;
      }
    } catch (error: any) {
      console.error("Order/Payment error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to process order. Please try again.";
      showError("Order Error", errorMessage);
    } finally {
      setIsSubmitting(false); // End loading
    }
  };

  // Add effect to clear order when cart changes
  useEffect(() => {
    // Clear order when cart items change
    dispatch(setOrderId(null));
    dispatch(setOrderItems(null));
    setApplePayOrderId(null); // ✅ FIX: Clear Apple Pay order ID too
  }, [cartItems, dispatch]);

  // Handle payment cooldown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (paymentCooldown && cooldownSeconds > 0) {
      interval = setInterval(() => {
        setCooldownSeconds((prev) => {
          if (prev <= 1) {
            setPaymentCooldown(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [paymentCooldown, cooldownSeconds]);

  const startPaymentCooldown = () => {
    setPaymentCooldown(true);
    setCooldownSeconds(60);
  };

  const handleCryptoPayment = async (cryptoPayload: any) => {
    console.log("shdbcchj")
    try {
      if (!isUser) {
        showError("Please login to continue");
        return;
      }

      // Call the crypto payment API with the passed payload
      const result = await dispatch(createCryptoPayment(cryptoPayload)).unwrap();

      if (result?.success && result?.hosted_url) {
        // Set payment data for display
        dispatch(
          setPaymentData({
            url: result.hosted_url, // Use the hosted_url from Coinbase
            qrCode: result.qr_code_url, // Use the QR code from base64
            paymentId: result.paymentId || result.charge_id,
            status: "pending",
          })
        );

        // Join payment room for real-time updates if paymentId exists
        if (userId && (result.paymentId || result.charge_id)) {
          joinPaymentRoom(userId, result.paymentId || result.charge_id);
        }

        showSuccess("Crypto Payment Created", "Please complete your payment using the provided QR code or link.");
      } else {
        showInfo("Payment creation is pending!");
      }
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create crypto payment";
      showError(errorMsg);
    }
  };

  const handleTokenPayment = async (tokenPaymentPayload: any) => {
    try {
      const requiredPayload = {
        ...tokenPaymentPayload,
        to: filteredCartItems[0]?.userId,
      };

      const result = await dispatch(transferToken(requiredPayload)).unwrap();

      if (result.success) {
        // Transfer NFT to admin if discount was used
        if (activeNFT && isUser && tokenPaymentPayload.orderId) { // Use orderId from payload
          console.log("Starting NFT transfer...");
          await dispatch(transferNftForDiscount({
            nftId: (activeNFT as any).id,    // Use activeNFT.id instead of nft.id
            userId: isUser.id,
            orderId: tokenPaymentPayload.orderId // Use orderId from payload
          }));
          console.log("NFT transfer completed");

          // Refresh user NFTs and clear selection
          await dispatch(fetchUserNfts({ userId: isUser.id }));
          dispatch(clearSelectedDiscountNFT());
          setActiveNFT(null);
        } else {
          console.log("NFT transfer skipped - missing:", {
            activeNFT: !!activeNFT,
            isUser: !!isUser,
            orderId: !!tokenPaymentPayload.orderId
          });
        }

        dispatch(clearCart());
        dispatch(clearPayment());
        showSuccess(
          "Payment Successful",
          result.message || "Payment successful and order created!"
        );

        router.push(
          `/payment-success?paymentId=${result.paymentId}&status=paid&orderType=buyProduct`
        );
        showSuccess("Payment Successful", result.message || "Payment successful and order created!");

        router.push(`/payment-success?paymentId=${result.paymentId}&status=paid&orderType=buyProduct`);
      } else {
        throw new Error(result.message || "Failed to process token payment");
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong";
      showError("Payment Error", errorMessage);
    }
  };

  const renderPaymentForm = (method = paymentMethod) => {
    switch (method) {
      case PAYMENT_METHODS.SCAN:
        return (
          <div className="space-y-4">
            <div className="bg-[var(--color-panel)] p-4 rounded-lg flex flex-col items-center">
              <p className="text-gray-300 mb-2">
                Scan this QR code with your UPI or banking app to pay
              </p>
              {paymentLoading || productPaymentLoading ? (
                <div className="w-40 h-40 mb-2 border-2 border-[var(--color-primary)] rounded-lg flex items-center justify-center bg-gray-800">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
                </div>
              ) : paymentError ? (
                <div className="w-full p-3 mb-2 bg-red-900/30 text-red-400 rounded-lg text-center">
                  {paymentError}
                </div>
              ) : paymentData?.qrCode ? (
                <>
                  {paymentData.paymentId && (
                    <div className="w-full p-2 mb-2 bg-green-900/20 border border-green-900/30 rounded-lg text-center">
                      <p className="text-green-400 text-xs">
                        ✓ Payment link already generated
                      </p>
                    </div>
                  )}
                  <img
                    src={paymentData.qrCode}
                    alt="Scan & Pay QR"
                    className="w-40 h-40 mb-2 border-2 border-[var(--color-primary)] rounded-lg"
                  />
                </>
              ) : (
                <div className="w-40 h-40 mb-2 border-2 border-[var(--color-primary)] rounded-lg flex items-center justify-center bg-gray-800">
                  <p className="text-gray-400 text-sm text-center px-2">
                    Click Place Order to generate QR code
                  </p>
                </div>
              )}
              <p className="text-xs text-gray-400">
                After payment, click 'Place Order' to confirm.
              </p>
            </div>
          </div>
        );
      case PAYMENT_METHODS.CARD:
        return (
          <div className="space-y-4">
            <div className="bg-[var(--color-panel)] p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-300">Total Amount</p>
                  <p className="font-semibold text-xl mt-2 sm:mt-0 text-[var(--color-secondary)]">
                    ${(subtotalUSD - nftDiscountUSD)}
                  </p>
                </div>
                <CreditCard className="h-10 w-10 text-[var(--color-primary)]" />
              </div>
            </div>

            {paymentData?.url ? (
              <div className="space-y-3">
                <div className="w-full p-2 bg-green-900/20 border border-green-900/30 rounded-lg text-center">
                  <p className="text-green-400 text-xs">
                    ✓ Payment link already generated
                  </p>
                </div>
                <Button
                  onClick={() => {
                    const redirectUrl = new URL(paymentData.url);
                    redirectUrl.searchParams.append(
                      "orderId",
                      existingOrderId || ""
                    );
                    window.location.href = redirectUrl.toString();
                  }}
                  disabled={paymentLoading}
                  className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-medium py-3 px-4 rounded-xl transition-colors"
                >
                  {paymentLoading ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Proceed to Payment
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                You will be redirected to our secure payment processor to
                complete your purchase.
              </p>
            )}
          </div>
        );
      case PAYMENT_METHODS.TOKEN:
        return (
          <div className="space-y-4">
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
            </div>
          </div>
        );
      case PAYMENT_METHODS.CRYPTO:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              {/* <div>
                <Label className="block text-gray-300 mb-1">
                  Select Cryptocurrency
                </Label>
                <select className="w-full bg-[var(--color-panel)] border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow text-white">
                  <option value="btc">Bitcoin (BTC)</option>
                  <option value="eth">Ethereum (ETH)</option>
                  <option value="sol">Solana (SOL)</option>
                  <option value="bnb">Binance Coin (BNB)</option>
                </select>
              </div> */}

              {paymentLoading ? (
                <div className="w-full p-4 border-2 border-[var(--color-primary)] rounded-lg flex items-center justify-center bg-gray-800">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
                </div>
              ) : paymentError ? (
                <div className="w-full p-3 bg-red-900/30 text-red-400 rounded-lg text-center">
                  {paymentError}
                </div>
              ) : paymentData?.url ? (
                <div className="bg-[var(--color-panel)] p-4 rounded-lg flex flex-col items-center">
                  <p className="text-gray-300 mb-2">
                    Complete your crypto payment
                  </p>

                  {/* Show QR Code if available */}
                  {paymentData?.qrCode && (
                    <>
                      <p className="text-gray-300 mb-2 text-sm">
                        Scan this QR code to pay with crypto
                      </p>
                      <img
                        src={paymentData.qrCode}
                        alt="Crypto Payment QR"
                        className="w-40 h-40 mb-4 border-2 border-[var(--color-primary)] rounded-lg"
                      />
                    </>
                  )}

                  {/* Show hosted URL as clickable link */}
                  <div className="w-full text-center">
                    <p className="text-gray-300 mb-2 text-sm">
                      Or click the link below to pay:
                    </p>
                    <a
                      href={paymentData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                      Complete Payment
                    </a>
                  </div>

                  <p className="text-xs text-gray-400 mt-4">
                    After payment, click 'Place Order' to confirm.
                  </p>
                </div>
              ) : (
                <></>
                // <Button
                //   onClick={handleCryptoPayment}
                //   disabled={paymentLoading}
                //   className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-medium py-3 px-4 rounded-xl transition-colors"
                // >
                //   {paymentLoading ? (
                //     <>
                //       <Spinner className="mr-2 h-4 w-4 animate-spin" />
                //       Processing...
                //     </>
                //   ) : (
                //     <>
                //       <Wallet className="mr-2 h-4 w-4" />
                //       Pay with Crypto
                //     </>
                //   )}
                // </Button>
              )}
            </div>
          </div>
        );
      case PAYMENT_METHODS.APPLE_PAY:
        return (
          <div className="space-y-4">
            <div className="bg-[var(--color-panel)] p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-gray-300">Total Amount</p>
                  <p className="font-semibold text-xl mt-2 sm:mt-0 text-[var(--color-secondary)]">
                    ${(subtotalUSD - nftDiscountUSD)}
                  </p>
                </div>
                <Apple className="h-10 w-10 text-[var(--color-primary)]" />
              </div>

              <ApplePay
                amount={Math.round((subtotalUSD - nftDiscountUSD) * 100)}
                currency="USD"
                orderData={{
                  totalAmount: subtotalUSD - nftDiscountUSD,
                  discountAmount: nftDiscountUSD,
                  nftId: (activeNFT as any)?.id,
                  nftName: (activeNFT as any)?.nftName || (activeNFT as any)?.name || null,
                  numberOfSupply: activeNFT && Number(1) || 0,
                  buyNftId: activeNFT && (activeNFT as any)?.nftBuyId || 0,
                  nftDiscountAmount: Number(nftDiscountUSD),
                  nftDiscountPercentage: nftDiscountPercentage,
                  couponCode: "",
                  message: "",
                  addressId: activeTab === "physical" && selectedAddressId && hasRegularPhysicalItems ? selectedAddressId : "",
                  currency: "USD",
                   orderId: applePayOrderId || existingOrderId || undefined, // ✅ FIX: Use local state first
                  orderItems: filteredCartItems.map((item) => ({
                    productId: Number(item.productId),
                    variantId: item.variantId ? Number(item.variantId) : 0,
                    quantity: item.quantity,
                    unitPrice: Number(item.price),
                    totalPrice: Number(item.price) * item.quantity,
                  })),
                  paymentMethod: "stripe",
                }}
                onPaymentSuccess={(paymentMethod, paymentIntent) => {
                  showSuccess('Payment Successful', `Payment completed via ${paymentMethod}`);
                  router.push('/payment-success?paymentId=' + paymentIntent.id);
                }}
                onPaymentError={(error) => {
                  showError('Payment Failed', error.message || 'Payment failed');
                }}
                disabled={paymentLoading || productPaymentLoading}
              />
            </div>
          </div>
        );

      case PAYMENT_METHODS.GOOGLE_PAY:
        return (
          <div className="space-y-4">
            <div className="bg-[var(--color-panel)] p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-gray-300">Total Amount</p>
                  <p className="font-semibold text-xl mt-2 sm:mt-0 text-[var(--color-secondary)]">
                    ${(subtotalUSD - nftDiscountUSD)}
                  </p>
                </div>
                <CreditCard className="h-10 w-10 text-[var(--color-primary)]" />
              </div>
            </div>

            {paymentData?.qrCode ? (
              <div className="space-y-3">
                <div className="w-full p-2 bg-green-900/20 border border-green-900/30 rounded-lg text-center">
                  <p className="text-green-400 text-xs">
                    ✓ Google Pay QR Code Generated
                  </p>
                </div>
                
                {/* QR Code Display */}
                <div className="bg-[var(--color-panel)] p-6 rounded-lg flex flex-col items-center">
                  <p className="text-gray-300 mb-2 text-sm">
                    Scan this QR code with your mobile device to pay with Google Pay
                  </p>
                  <img
                    src={paymentData.qrCode}
                    alt="Google Pay QR Code"
                    className="w-48 h-48 border-2 border-[var(--color-primary)] rounded-lg mb-4"
                  />
                  <p className="text-xs text-gray-400 text-center">
                    1. Open Google Pay on your mobile device<br />
                    2. Scan this QR code<br />
                    3. Complete the payment on your mobile
                  </p>
                </div>

                <Button
                  onClick={() => {
                    const redirectUrl = new URL(paymentData.url);
                    redirectUrl.searchParams.append(
                      "orderId",
                      existingOrderId || ""
                    );
                    window.location.href = redirectUrl.toString();
                  }}
                  disabled={paymentLoading}
                  className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-medium py-3 px-4 rounded-xl transition-colors"
                >
                  {paymentLoading ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Open Google Pay Link
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                Click "Place Order" to generate a QR code for mobile Google Pay payment.
              </p>
            )}
          </div>
        );
      case PAYMENT_METHODS.SACAN_PAY:
        return (
          <div className="bg-[var(--color-panel)] p-4 rounded-lg">
            <p className="text-gray-300 text-sm">
              Pay with cash upon delivery. Please ensure you have the exact
              amount ready.
            </p>
            <div className="mt-4 p-4 border border-gray-700 rounded-lg">
              <p className="text-white font-medium">
                Amount to be paid on delivery:
              </p>
              <p className="text-[var(--color-primary)] font-bold text-xl mt-1">
                ${totalInUsd}
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Modal state for showing all NFTs
  const [showNftModal, setShowNftModal] = useState(false);

  // Only show token payment in kiosk mode
  const isKiosk = isKioskInterface();

  // Force paymentMethod to 'token' in kiosk mode for payment details
  const effectivePaymentMethod = isKiosk ? PAYMENT_METHODS.TOKEN : paymentMethod;

  // Calculate subtotal in dollars
  const subtotalUSD = filteredCartItems.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    return sum + price * item.quantity;
  }, 0);
  const subtotalTokens = filteredCartItems.reduce((sum, item) => {
    const tokenPrice = Number(item.tokenPrice) || 0;
    return sum + tokenPrice * item.quantity;
  }, 0);

  // Calculate NFT discount in dollars
  const nftDiscountUSD = (subtotalUSD * nftDiscountPercentage) / 100;
  const nftDiscountTokens = (subtotalTokens * nftDiscountPercentage) / 100;

  const finalTotalUSD = subtotalUSD - nftDiscountUSD;
  const finalTotalTokens = subtotalTokens - nftDiscountTokens;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="bg-[var(--color-surface)] rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="font-bold text-white">
              Order Items ({filteredCartItems.length})
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
                            Sold by: {item.soldBy || "Official Store"}
                          </p>

                          <div className="flex items-center gap-4 mt-2">
                            {item.size && (
                              <div className="text-gray-400 text-sm">
                                Size: {item.size}
                              </div>
                            )}
                            {item.color && (
                              <div className="flex items-center text-gray-400 text-sm">
                                Color:
                                <span
                                  className="inline-block w-5 h-5 rounded-full border border-black ml-1"
                                  style={{ backgroundColor: item.color }}
                                  title={item.color}
                                />
                                <span className="ml-1"></span>
                              </div>
                            )}
                            <div className="text-gray-400 text-sm">
                              Qty: {item.quantity}
                            </div>
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

        {/* Payment Method */}
        <div className="bg-[var(--color-surface)] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-6 text-white">Payment Method</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {/* Only show token payment in kiosk mode, otherwise show all */}
            {isKiosk ? (
              <button
                onClick={() => handlePaymentMethodChange(PAYMENT_METHODS.TOKEN)}
                disabled={!hasSufficientTokens}
                className={`relative p-2 rounded-xl border-2 transition-all h-32 ${!hasSufficientTokens
                  ? "border-gray-600 bg-gray-800/50 cursor-not-allowed opacity-50"
                  : paymentMethod === PAYMENT_METHODS.TOKEN
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                    : "border-gray-700 hover:border-gray-600"
                  }`}
              >
                <div className="flex flex-col items-center text-center justify-center h-full">
                  <div
                    className={`p-2 rounded-full mb-2 ${!hasSufficientTokens
                      ? "text-gray-500 bg-gray-700"
                      : paymentMethod === PAYMENT_METHODS.TOKEN
                        ? "text-[var(--color-primary)] bg-[var(--color-primary)]/20"
                        : "text-gray-400 bg-gray-800"
                      }`}
                  >
                    <Token className="h-6 w-6" />
                  </div>
                  <h3
                    className={`font-medium ${!hasSufficientTokens
                      ? "text-gray-500"
                      : paymentMethod === PAYMENT_METHODS.TOKEN
                        ? "text-[var(--color-primary)]"
                        : "text-white"
                      }`}
                  >
                    Pay with Tokens
                  </h3>
                  {!hasSufficientTokens && (
                    <p className="text-xs text-red-400 mt-1">
                      Insufficient tokens
                    </p>
                  )}
                </div>
                {paymentMethod === PAYMENT_METHODS.TOKEN &&
                  hasSufficientTokens && (
                    <div className="absolute -top-2 -right-2 h-6 w-6 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white text-xs">
                      ✓
                    </div>
                  )}
              </button>
            ) : (
              <>
                {/* Scan & Pay Option */}
                <button
                  onClick={() => handlePaymentMethodChange(PAYMENT_METHODS.SCAN)}
                  className={`relative p-2 rounded-xl border-2 transition-all h-32 ${paymentMethod === PAYMENT_METHODS.SCAN
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                    : "border-gray-700 hover:border-gray-600"
                    }`}
                >
                  <div className="flex flex-col items-center text-center justify-center h-full">
                    <div
                      className={`p-2 rounded-full mb-2 ${paymentMethod === PAYMENT_METHODS.SCAN
                        ? "text-[var(--color-primary)] bg-[var(--color-primary)]/20"
                        : "text-gray-400 bg-gray-800"
                        }`}
                    >
                      <Icons.qrCode className="h-6 w-6" />
                    </div>
                    <h3
                      className={`font-medium ${paymentMethod === PAYMENT_METHODS.SCAN
                        ? "text-[var(--color-primary)]"
                        : "text-white"
                        }`}
                    >
                      Scan & Pay
                    </h3>
                  </div>
                  {paymentMethod === PAYMENT_METHODS.SCAN && (
                    <div className="absolute -top-2 -right-2 h-6 w-6 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white text-xs">
                      ✓
                    </div>
                  )}
                </button>
                {/* Credit Card Payment Option */}
                <button
                  onClick={() => handlePaymentMethodChange(PAYMENT_METHODS.CARD)}
                  className={`relative p-2 rounded-xl border-2 transition-all h-32 ${paymentMethod === PAYMENT_METHODS.CARD
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                    : "border-gray-700 hover:border-gray-600"
                    }`}
                >
                  <div className="flex flex-col items-center text-center justify-center h-full">
                    <div
                      className={`p-2 rounded-full mb-2 ${paymentMethod === PAYMENT_METHODS.CARD
                        ? "text-[var(--color-primary)] bg-[var(--color-primary)]/20"
                        : "text-gray-400 bg-gray-800"
                        }`}
                    >
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <h3
                      className={`font-medium ${paymentMethod === PAYMENT_METHODS.CARD
                        ? "text-[var(--color-primary)]"
                        : "text-white"
                        }`}
                    >
                      Credit Card
                    </h3>
                  </div>
                  {paymentMethod === PAYMENT_METHODS.CARD && (
                    <div className="absolute -top-2 -right-2 h-6 w-6 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white text-xs">
                      ✓
                    </div>
                  )}
                </button>
                {/* Token Payment Option */}
                <button
                  onClick={() => handlePaymentMethodChange(PAYMENT_METHODS.TOKEN)}
                  disabled={!hasSufficientTokens}
                  className={`relative p-2 rounded-xl border-2 transition-all h-32 ${!hasSufficientTokens
                    ? "border-gray-600 bg-gray-800/50 cursor-not-allowed opacity-50"
                    : paymentMethod === PAYMENT_METHODS.TOKEN
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                      : "border-gray-700 hover:border-gray-600"
                    }`}
                >
                  <div className="flex flex-col items-center text-center justify-center h-full">
                    <div
                      className={`p-2 rounded-full mb-2 ${!hasSufficientTokens
                        ? "text-gray-500 bg-gray-700"
                        : paymentMethod === PAYMENT_METHODS.TOKEN
                          ? "text-[var(--color-primary)] bg-[var(--color-primary)]/20"
                          : "text-gray-400 bg-gray-800"
                        }`}
                    >
                      <Token className="h-6 w-6" />
                    </div>
                    <h3
                      className={`font-medium ${!hasSufficientTokens
                        ? "text-gray-500"
                        : paymentMethod === PAYMENT_METHODS.TOKEN
                          ? "text-[var(--color-primary)]"
                          : "text-white"
                        }`}
                    >
                      Pay with Tokens
                    </h3>
                    {!hasSufficientTokens && (
                      <p className="text-xs text-red-400 mt-1">
                        Insufficient tokens
                      </p>
                    )}
                  </div>
                  {paymentMethod === PAYMENT_METHODS.TOKEN &&
                    hasSufficientTokens && (
                      <div className="absolute -top-2 -right-2 h-6 w-6 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white text-xs">
                        ✓
                      </div>
                    )}
                </button>
                {/* Crypto Payment Option */}
                <button
                  onClick={() => handlePaymentMethodChange(PAYMENT_METHODS.CRYPTO)}
                  className={`relative p-2 rounded-xl border-2 transition-all h-32 ${paymentMethod === PAYMENT_METHODS.CRYPTO
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                    : "border-gray-700 hover:border-gray-600"
                    }`}
                >
                  <div className="flex flex-col items-center text-center justify-center h-full">
                    <div
                      className={`p-2 rounded-full mb-2 ${paymentMethod === PAYMENT_METHODS.CRYPTO
                        ? "text-[var(--color-primary)] bg-[var(--color-primary)]/20"
                        : "text-gray-400 bg-gray-800"
                        }`}
                    >
                      <Wallet className="h-6 w-6" />
                    </div>
                    <h3
                      className={`font-medium ${paymentMethod === PAYMENT_METHODS.CRYPTO
                        ? "text-[var(--color-primary)]"
                        : "text-white"
                        }`}
                    >
                      Pay with Crypto
                    </h3>
                  </div>
                  {paymentMethod === PAYMENT_METHODS.CRYPTO && (
                    <div className="absolute -top-2 -right-2 h-6 w-6 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white text-xs">
                      ✓
                    </div>
                  )}
                </button>

                {/* Apple Pay Option - Only show if supported */}
                {digitalWalletSupported && (
                  <button
                    onClick={() => handlePaymentMethodChange(PAYMENT_METHODS.APPLE_PAY)}
                    className={`relative p-2 rounded-xl border-2 transition-all h-32 ${paymentMethod === PAYMENT_METHODS.APPLE_PAY
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                      : "border-gray-700 hover:border-gray-600"
                      }`}
                  >
                    <div className="flex flex-col items-center text-center justify-center h-full">
                      <div
                        className={`p-2 rounded-full mb-2 ${paymentMethod === PAYMENT_METHODS.APPLE_PAY
                          ? "text-[var(--color-primary)] bg-[var(--color-primary)]/20"
                          : "text-gray-400 bg-gray-800"
                          }`}
                      >
                        <Apple className="h-6 w-6" />
                      </div>
                      <h3
                        className={`font-medium ${paymentMethod === PAYMENT_METHODS.APPLE_PAY
                          ? "text-[var(--color-primary)]"
                          : "text-white"
                          }`}
                      >
                        Apple Pay
                      </h3>
                    </div>
                    {paymentMethod === PAYMENT_METHODS.APPLE_PAY && (
                      <div className="absolute -top-2 -right-2 h-6 w-6 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white text-xs">
                        ✓
                      </div>
                    )}
                  </button>
                )}

                {/* Google Pay Option - Only show if supported */}
                {digitalWalletSupported && (
                  <button
                    onClick={() => handlePaymentMethodChange(PAYMENT_METHODS.GOOGLE_PAY)}
                    className={`relative p-2 rounded-xl border-2 transition-all h-32 ${paymentMethod === PAYMENT_METHODS.GOOGLE_PAY
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                      : "border-gray-700 hover:border-gray-600"
                      }`}
                  >
                    <div className="flex flex-col items-center text-center justify-center h-full">
                      <div
                        className={`p-2 rounded-full mb-2 ${paymentMethod === PAYMENT_METHODS.GOOGLE_PAY
                          ? "text-[var(--color-primary)] bg-[var(--color-primary)]/20"
                          : "text-gray-400 bg-gray-800"
                          }`}
                      >
                        <CreditCard className="h-6 w-6" />
                      </div>
                      <h3
                        className={`font-medium ${paymentMethod === PAYMENT_METHODS.GOOGLE_PAY
                          ? "text-[var(--color-primary)]"
                          : "text-white"
                          }`}
                      >
                        Google Pay
                      </h3>
                    </div>
                    {paymentMethod === PAYMENT_METHODS.GOOGLE_PAY && (
                      <div className="absolute -top-2 -right-2 h-6 w-6 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white text-xs">
                        ✓
                      </div>
                    )}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Payment Method Details */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            {renderPaymentForm(effectivePaymentMethod)}
          </div>

          {/* Only show address requirement for regular physical products (not kiosk products) */}
          {activeTab === "physical" && !selectedAddress && hasRegularPhysicalItems && (
            <div className="mt-4 text-center text-red-400 text-sm">
              Please add a delivery address to proceed with payment
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
            <div className="flex justify-between text-gray-300">
              <span>Delivery Charges</span>
              <span className="text-green-400">Free</span>
            </div>
            <div className="border-t border-gray-700 pt-3 flex justify-between font-bold text-white">
              <span>Total Amount</span>
              <span className="flex flex-col items-end text-[var(--color-primary)]">
                <span className="flex items-center text-lg font-bold">
                  <TokenSymbol /> {finalTotalTokens.toFixed(2)}
                </span>
                <span className="text-xs text-gray-400 font-semibold">
                  ${finalTotalUSD.toFixed(2)}
                </span>
              </span>
            </div>
            {paymentMethod === PAYMENT_METHODS.TOKEN && (
              <div className="flex justify-between text-sm text-gray-400">
                <span>Token Price</span>
                <span>
                  {(finalTotalTokens).toFixed(2)} tokens
                </span>
              </div>

            )}
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
                <p>Select an NFT to apply its discount to your purchase</p>
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
              productPaymentLoading ||
              paymentLoading ||
              (activeTab === "physical" && !selectedAddress && hasRegularPhysicalItems) ||
              filteredCartItems.length === 0 ||
              (paymentCooldown &&
                (paymentMethod === PAYMENT_METHODS.SCAN ||
                  paymentMethod === PAYMENT_METHODS.CARD)) ||
              isSubmitting // Disable if submitting
            }
            className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-700)] py-6 text-lg mt-6 motion-hover-brand"
          >
            {isSubmitting ? (
              <>
                <Spinner className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : filteredCartItems.length === 0 ? (
              "No Items in Cart"
            ) : paymentCooldown &&
              (paymentMethod === PAYMENT_METHODS.SCAN ||
                paymentMethod === PAYMENT_METHODS.CARD) ? (
              `Wait ${cooldownSeconds}s to generate new payment`
            ) : (paymentMethod === PAYMENT_METHODS.SCAN ||
              paymentMethod === PAYMENT_METHODS.CARD ||
              paymentMethod === PAYMENT_METHODS.CRYPTO) &&
              paymentData?.url ? (
              paymentMethod === PAYMENT_METHODS.SCAN ? (
                "Generate New QR"
              ) : paymentMethod === PAYMENT_METHODS.CRYPTO ? (
                "Generate New Crypto Payment"
              ) : (
                "Generate New Payment Link"
              )
            ) : (
              "Place Order"
            )}
          </Button>

          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
              <Shield className="h-4 w-4" />
              <span>Secure payment options</span>
            </div>
          </div>
        </div>
      </div>

      {showNftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4">
          <div className="bg-gradient-to-br from-[#0A1628] to-[var(--color-bg)] rounded-2xl w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl relative border border-gray-600/30 shadow-2xl max-h-[95vh] flex flex-col">
            {/* Header - Fixed */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-600/30 flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 3a2 2 0 00-2 2v1.5h16V5a2 2 0 00-2-2H4z" />
                    <path fillRule="evenodd" d="M18 8.5H2v5.5a2 2 0 002 2h12a2 2 0 002-2V8.5zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">NFT Discounts</h2>
                  <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">Select an NFT to apply discount</p>
                </div>
              </div>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-all duration-200"
                onClick={() => setShowNftModal(false)}
              >
                <Icons.x className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-hidden">
              <div className="p-4 sm:p-6 h-full">
                {userNftItems.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <h3 className="text-base sm:text-lg font-medium text-white mb-2">No NFTs Available</h3>
                    <p className="text-sm text-gray-400">You don't have any NFTs with discounts yet.</p>
                  </div>
                ) : (
                  <div className="h-full flex flex-col">
                    {/* Stats - Fixed */}
                    <div className="flex items-center justify-between mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-800/30 rounded-xl border border-gray-600/20 flex-shrink-0">
                      <div className="text-center">
                        <div className="text-lg sm:text-2xl font-bold text-white">{userNftItems.length}</div>
                        <div className="text-xs sm:text-sm text-gray-400">Available NFTs</div>
                      </div>
                      <div className="w-px h-6 sm:h-8 bg-gray-600/30"></div>
                      <div className="text-center">
                        <div className="text-lg sm:text-2xl font-bold text-green-400">
                          {Math.max(...userNftItems.map(nft => nft.discount || 0))}%
                        </div>
                        <div className="text-xs sm:text-sm text-gray-400">Max Discount</div>
                      </div>
                    </div>

                    {/* NFT Grid - Scrollable */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 sm:pr-2 max-h-[60vh]">
                      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 pb-4">
                        {userNftItems.map((nft) => (
                          <div
                            key={nft.id}
                            className={`group relative bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl border transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-xl ${activeNFT && (activeNFT as any).id === nft.id
                              ? 'border-blue-500/60 shadow-blue-500/20 shadow-lg bg-gradient-to-br from-blue-900/20 to-blue-800/20'
                              : 'border-gray-600/30 hover:border-gray-500/50'
                              }`}
                            onClick={() => {
                              applyNFTDiscount(nft);
                              setShowNftModal(false);
                            }}
                          >
                            {/* Discount Badge */}
                            {nft.discount && nft.discount > 0 && (
                              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 z-10 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full shadow-lg">
                                -{nft.discount}%
                              </div>
                            )}

                            {/* Active Indicator */}
                            {activeNFT && (activeNFT as any).id === nft.id && (
                              <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}

                            <div className="p-3 sm:p-4">
                              {/* NFT Image */}
                              <div className="relative mb-2 sm:mb-3 aspect-square rounded-lg overflow-hidden bg-gray-800/50">
                                <img
                                  src={nft.image || nft.nftImgUrl || '/placeholder-nft.png'}
                                  alt={nft.nftName}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder-nft.png';
                                  }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              </div>

                              {/* NFT Info */}
                              <div className="space-y-1 sm:space-y-2">
                                <h3
                                  className="font-semibold text-white text-xs sm:text-sm leading-tight line-clamp-2 group-hover:text-blue-300 transition-colors duration-200 min-h-[2.5rem] sm:min-h-[2.8rem]"
                                  title={nft.nftName}
                                >
                                  {nft.nftName}
                                </h3>

                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-400 truncate max-w-[60%]">
                                    {nft.collectionName}
                                  </span>
                                  <span className="text-gray-300 font-medium text-xs">
                                    #{nft.nftId || nft.id}
                                  </span>
                                </div>

                                {/* Price & Discount Info */}
                                <div className="flex items-center justify-between pt-1 sm:pt-2 border-t border-gray-600/20">
                                  {nft.price && (
                                    <div className="text-xs">
                                      <span className="text-gray-400">Price: </span>
                                      <span className="text-white font-medium">${nft.price}</span>
                                    </div>
                                  )}
                                  {nft.discount && nft.discount > 0 && (
                                    <div className="text-xs text-green-400 font-medium">
                                      Save {nft.discount}%
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Hover Effect Overlay */}
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-t border-gray-600/30 bg-gray-800/20 flex-shrink-0">
              <p className="text-xs sm:text-sm text-gray-400">
                <span className="hidden sm:inline">Click on any NFT to apply its discount</span>
                <span className="sm:hidden">Tap NFT to apply discount</span>
              </p>
              <button
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium"
                onClick={() => setShowNftModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(8, 80, 224, 0.91) rgba(55, 65, 81, 0.3);
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(55, 65, 81, 0.3);
    border-radius: 2px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(107, 114, 128, 0.5);
    border-radius: 2px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(107, 114, 128, 0.7);
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Custom breakpoint for extra small screens */
  @media (min-width: 475px) {
    .xs\:grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
`}</style>

    </div>
  );
};
export default OrderSummary;