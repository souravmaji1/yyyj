import { useEffect, useCallback, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import ShopHeader from "./shopHeader";
import CategoryCrousel from "../crousels/categoryCrousel";
import Filter from "./filter";
import Seller from "./seller";
import { useDebounce } from "../../hooks/useDebounce";
import { Spinner } from "../ui/spinner";
import ProductCard from "../product/productCard";
import { fetchAllnfts } from "@/src/store/slices/nftSlice";
import { Button } from "../ui/button";
import { useAuth } from "@/src/app/apis/auth/UserAuth";
import { fetchFilterOptions, updateFilter } from "@/src/store/slices/productFilter.slice";
import { fetchCatalog } from "@/src/store/slices/catalog.Slice";
import { productType } from "@/src/constants";
import { fetchProducts, clearProducts, getProductsForKiosk, fetchKioskProductsByMachine, KioskProduct } from "../../store/slices/productSlice";
import ProductTypeTabs from "./ProductTypeTabs";
import { X, Play, Eye } from "lucide-react";
import { useNotificationUtils } from "@/src/core/utils/notificationUtils";
import { paymentAxiosClient } from "@/src/app/apis/auth/axios";
import { fetchWalletBalance } from "@/src/store/slices/userSlice";
import { useSearchParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { isKioskInterface } from "@/src/core/utils";
import KioskProductCard from "./KioskProductCard";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../dropdown";
import SearchBar from "@/src/components/common/SearchBar";
import "./styles/shop.mobile.css";

const Shop = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user.profile);
  const { purchaseNFT } = useAuth();
  const { showSuccess, showError } = useNotificationUtils();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [processingNftId, setProcessingNftId] = useState<any | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");

  // Get tab from URL parameter or default to physical
  const urlTab = searchParams?.get("tab");
  const urlSearch = searchParams?.get("search");
  const [tab, setTab] = useState<"digital" | "physical" | "NFT" | "online">(
    urlTab === "digital" ? "digital" : "physical"
  );

  const {
    currentPage,
    itemsPerPage,
    selectedCatalogs,
    selectedColors,
    selectedSizes,
    searchQuery,
    sortOption,
    priceRange,
  } = useSelector((state: RootState) => state.productFilter);

  // Initialize search from URL parameter
  useEffect(() => {
    if (urlSearch && urlSearch !== searchQuery) {
      dispatch(updateFilter({ key: 'searchQuery', value: urlSearch }));
    }
  }, [urlSearch, searchQuery, dispatch]);

  const tabChangeTimeoutRef = useRef<NodeJS.Timeout>();
  const isTabChangingRef = useRef(false);
  const [priceFilter, setPriceFilter] = useState<any>([]);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentId, setPaymentId] = useState("");
  const [selectedNft, setSelectedNft] = useState<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPurchasePopupOpen, setIsPurchasePopupOpen] = useState(false);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [selectedNftForPurchase, setSelectedNftForPurchase] = useState<
    any | null
  >(null);
  const userId =
    JSON.parse(localStorage.getItem("userAuthDetails") || "{}").id || "";
  const { nftItems, loading: isLoadingNfts } = useSelector(
    (state: RootState) => state.allNft
  );
  const ApprovedNFTs = nftItems?.filter((nft: any) => nft.isApproved === "1");

  // Modal functions
  const openModal = (nft: any) => {
    setSelectedNft(nft);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNft(null);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    setPriceFilter([]);
  }, [tab]);

  const filteredNFTs = isLoadingNfts
    ? []
    : priceFilter?.length === 0 || tab !== "digital"
      ? ApprovedNFTs
      : ApprovedNFTs.filter((nft: any) => {
        const nftPrice = Number(nft?.price) || 0;
        return nftPrice >= priceFilter[0] && nftPrice <= priceFilter[1];
      });

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const purchaseNFTs = async (nft: any, quantity: number = 1) => {
    setProcessingNftId(nft.id);

    if (!userId || !user) {
      router.push("/auth?returnUrl=/addresses");
      return;
    }
    try {
      const balanceResponse = await paymentAxiosClient.get(
        `/getUserWalletBalance/${userId}`
      );

      const walletBalance = balanceResponse?.data?.data?.balance || 0;

      const totalCost = nft.price * quantity;

      if (walletBalance < totalCost) {
        showError(
          "Insufficient Balance",
          `You need XUT ${totalCost}, but only XUT ${walletBalance} is available.`
        );
        setProcessingNftId(null);
        return;
      }

      const response: any = await purchaseNFT({
        userId: userId,
        amount: totalCost,
        nftId: nft.id,
        nftAmount: quantity,
      });

      if (response?.data?.success) {
        setPaymentId(response?.data?.paymentId);
        showSuccess("NFT purchase is being processed...", response?.data?.message);
        dispatch(fetchWalletBalance(userId));
        dispatch(
          fetchAllnfts({
            page: 1,
            limit: Number(itemsPerPage),
          })
        );
      }
    } catch (error) {
      console.error("Purchase failed:", error);
      showError("Purchase Failed", "Failed to Purchase NFT");
    }
    setProcessingNftId(null);
  };

  const SOCKET_URL = process.env.NEXT_PUBLIC_API_PAYMENT_BASE_URL;
  let socket: Socket;
  const connectToPaymentSocket = (): Socket => {
    if (!socket) {
      socket = io(SOCKET_URL, {
        path: "/socket.io",
        transports: ["websocket"],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        query: {
          clientId: userId,
        },
        secure: true,
        rejectUnauthorized: false,
        withCredentials: true,
      });

      socket.on("connect", () => {
        joinPaymentRoom(userId, paymentId);
      });

      // socket.on("disconnect", (reason) => {
      //   console.warn("Socket disconnected:", reason);
      // });

      // socket.on("connect_error", (error) => {
      //   console.error("Socket connection error:", error);
      // });
    }

    return socket;
  };

  const disconnectPaymentSocket = () => {
    if (socket) {
      socket.disconnect();
    }
  };
  useEffect(() => {
    const socket = connectToPaymentSocket();

    socket.on("payment-status", (data) => {
      // console.log("Payment Status Received:", data);
    });

    return () => {
      disconnectPaymentSocket();
    };
  }, [paymentId, userId]);

  const joinPaymentRoom = (userId: string, paymentId: string) => {
    if (!socket) return;

    const roomName = `payment_${userId}_${paymentId}`;
    socket.emit(
      "joinPaymentRoom",
      {
        userId,
        roomName,
        paymentId,
      },
      // (response: any) => {
      //   console.log("Join payment room response:", response);
      // }
    );

    socket.on("paymentStatusUpdate", (data) => {
      if (data.status === "completed" && data.forpayment === "nftPurchase") {
        showSuccess(`Purchase NFT Successfully\nPayment ID: ${data.paymentId}`);
        dispatch(fetchWalletBalance(userId));
        dispatch(
          fetchAllnfts({
            page: 1,
            limit: Number(itemsPerPage),
          })
        );
      } else {
        showSuccess(`ℹPayment Status: ${data.status}`);
      }
      socket.emit("paymentStatusUpdate", (payment: string[]) => {
        console.log("Current payment rooms:", payment);
      });
    });
  };

  const {
    items: products,
    loading: isLoadingProducts,
    pagination,
  } = useSelector((state: RootState) => state.product);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const debouncedPriceRange = useDebounce(priceRange, 500);

  // Check if there are more pages to load
  const hasMorePages = pagination && pagination.hasMore;

  const fetchFilteredProducts = useCallback(
    (page = currentPage, append = false) => {
      if (isTabChangingRef.current) return;

      const filterParams = {
        page,
        productType: tab,
        limit: Number(itemsPerPage),
        append,
        ...(debouncedSearchQuery ? { query: debouncedSearchQuery } : {}),
        ...(sortOption !== "default" ? { sortOption } : {}),
        ...(debouncedPriceRange
          ? {
            priceMin: debouncedPriceRange[0],
            priceMax: debouncedPriceRange[1],
          }
          : {}),
        ...(selectedCatalogs.length > 0
          ? {
            catalogs: selectedCatalogs
              .map((catalog) =>
                catalog
                  .replace(/\s+/g, "")
                  .replace(/\t/g, "")
                  .replace(/['"]/g, "")
                  .replace(/[^a-zA-Z0-9-]/g, "")
              )
              .join(","),
          }
          : {}),
        ...(selectedColors.length > 0
          ? { colors: selectedColors.join(",") }
          : {}),
        ...(selectedSizes.length > 0 ? { sizes: selectedSizes.join(",") } : {}),
      };

      const machineId = localStorage.getItem('machine_id');

      if (isKioskInterface() && machineId) {
        return dispatch(getProductsForKiosk({
          ...filterParams,
          machineId: machineId,
        }));
      } else {
        return dispatch(fetchProducts(filterParams));
      }
    },
    [
      dispatch,
      currentPage,
      itemsPerPage,
      selectedCatalogs,
      selectedColors,
      selectedSizes,
      debouncedSearchQuery,
      sortOption,
      debouncedPriceRange,
      tab,
    ]
  );

  // Load more products for infinite scroll
  const loadMoreProducts = useCallback(async () => {
    if (isLoadingMore || !hasMorePages || isTabChangingRef.current) return;

    setIsLoadingMore(true);
    const nextPage = currentPage + 1;

    try {
      await fetchFilteredProducts(nextPage, true);
    } catch (error) {
      console.error("Failed to load more products:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMorePages, currentPage, fetchFilteredProducts]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (!loadingRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (
          entry &&
          entry.isIntersecting &&
          hasMorePages &&
          !isLoadingMore &&
          !isLoadingProducts
        ) {
          loadMoreProducts();
        }
      },
      {
        rootMargin: "100px", // Start loading when 100px away from bottom
        threshold: 0.1,
      }
    );

    observerRef.current = observer;
    observer.observe(loadingRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMorePages, isLoadingMore, isLoadingProducts, loadMoreProducts]);

  useEffect(() => {
    if (isTabChangingRef.current) return;

    if (
      selectedCatalogs.length > 0 ||
      selectedColors.length > 0 ||
      selectedSizes.length > 0 ||
      sortOption !== "default"
    ) {
      fetchFilteredProducts();
    }
  }, [
    selectedCatalogs,
    selectedColors,
    selectedSizes,
    sortOption,
    fetchFilteredProducts,
  ]);

  useEffect(() => {
    if (isTabChangingRef.current) return;
    fetchFilteredProducts();
  }, [debouncedSearchQuery, debouncedPriceRange, fetchFilteredProducts]);

  useEffect(() => {
    dispatch(fetchFilterOptions());
  }, [dispatch]);

  const fetchCatalogData = useCallback(
    (page: number, limit: number) => {
      if (!isTabChangingRef.current) {
        const machineId = localStorage.getItem('machine_id');

        if (isKioskInterface() && machineId) {

          dispatch(
            fetchCatalog({
              page,
              limit,
              productType: tab === "physical" ? productType.PHYSICAL : tab === "digital" ? productType.DIGITAL : tab === "NFT" ? productType.NFT : productType.ONLINE,
              machineId: machineId,
            })
          );
        } else {
          dispatch(
            fetchCatalog({
              page,
              limit,
              productType:
                tab === "physical" ? productType.PHYSICAL : productType.DIGITAL,
              machineId: "",
            })
          );
        }

      }
    },
    [dispatch, tab]
  );

  const kioskProducts = useSelector((state: RootState) => state?.product?.kioskProducts?.items);
  const kioskProductsLoading = useSelector((state: RootState) => state?.product?.kioskProducts?.loading);
  const kioskProductsError = useSelector((state: RootState) => state?.product?.kioskProducts?.error);


  useEffect(() => {

    dispatch(clearProducts());

    const machineId = localStorage.getItem('machine_id');


    if (tabChangeTimeoutRef.current) {
      clearTimeout(tabChangeTimeoutRef.current);
    }

    isTabChangingRef.current = true;
    dispatch(clearProducts());

    tabChangeTimeoutRef.current = setTimeout(() => {
      if (tab === "digital") {
        dispatch(
          fetchAllnfts({
            page: 1,
            limit: Number(itemsPerPage),
          })
        );
        if (isKioskInterface() && machineId) {
          dispatch(
            getProductsForKiosk({
              productType: "digital",
              page: 1,
              limit: Number(itemsPerPage),
              machineId: machineId,
            })
          );
        } else {
          dispatch(
            fetchProducts({
              productType: "digital",
              page: 1,
              limit: Number(itemsPerPage),
            })
          );
        }
      } else if (tab === "physical") {
        if (isKioskInterface() && machineId) {
          dispatch(
            getProductsForKiosk({
              productType: "physical",
              page: 1,
              limit: Number(itemsPerPage),
              machineId: machineId,
            })
          );
        } else {
          dispatch(
            fetchProducts({
              productType: "physical",
              page: 1,
              limit: Number(itemsPerPage),
            })
          );
        }
      } else {
        dispatch(clearProducts());
        machineId && dispatch(fetchKioskProductsByMachine(machineId));
      }

      setTimeout(() => {
        isTabChangingRef.current = false;
        fetchCatalogData(1, 10);
      }, 500);
    }, 300);

    return () => {
      if (tabChangeTimeoutRef.current) {
        clearTimeout(tabChangeTimeoutRef.current);
      }
    };
  }, [tab, dispatch, itemsPerPage, fetchCatalogData]);

  // Custom setTab function that updates both state and URL
  const handleTabChange = (newTab: "digital" | "physical" | "NFT" | "online") => {
    setTab(newTab);

    // Update URL without causing a page refresh
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (newTab === "physical") {
      params.delete("tab"); // Remove tab param for physical (default)
    } else if (newTab === "digital") {
      params.set("tab", newTab);
    } else if (newTab === "online") {
      params.set("tab", newTab);
    }

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/shop${newUrl}`, { scroll: false });
  };

  // Handle search input changes
  const handleSearchChange = (value: string) => {
    dispatch(updateFilter({ key: 'searchQuery', value }));
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <ShopHeader />
      <div className="container mx-auto px-4 pt-4">
        <SearchBar value={searchQuery} onChange={handleSearchChange} placeholder="Search shop..." />
      </div>
      <div className="container mx-auto px-4 pb-10">
        <CategoryCrousel selectedTab={tab} />
        <div className="flex flex-col gap-10">
          <div className="w-full">
            <div className="flex items-center justify-between">
              <ProductTypeTabs tab={tab} setTab={handleTabChange} />
              {tab !== "online" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Filters</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="p-0 bg-transparent border-none shadow-none w-80">
                    <Filter filterData={setPriceFilter} isDropdown />
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            {tab === "online" ? (
              <>
                {/* Kiosk Products */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                  {kioskProductsLoading ? (
                    <div className="flex justify-center col-span-full text-center py-8"><Spinner /></div>
                  ) : kioskProductsError ? (
                    <div className="text-red-500 text-center py-8">{kioskProductsError}</div>
                  ) : kioskProducts.length > 0 ? (
                    kioskProducts.map((product) => (
                      <KioskProductCard key={product.id} product={product} />
                    ))
                  ) : (
                    <div className="text-gray-400 text-center py-8">No kiosk products found</div>
                  )}
                </div>
                {/* Infinite scroll loading indicator */}
                {hasMorePages && (
                  <div ref={loadingRef} className="flex justify-center py-8">
                    {isLoadingMore && <Spinner />}
                  </div>
                )}
              </>
            ) : (
              <>
                <Seller
                  products={products}
                  pagination={pagination}
                  isLoading={isLoadingProducts}
                />
                <div
                  className={`grid ${view === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                    : "grid-cols-1 gap-4"
                    }`}
                >
                  {isLoadingNfts? (
                    <div className="flex justify-center col-span-full text-center py-8">
                      <Spinner />
                    </div>
                  ) : tab === "digital" ? (
                    <>
                      {filteredNFTs?.filter(
                        (nft: any) => nft?.adminNftSupply > 0
                      ).length > 0 ? (
                        filteredNFTs
                          ?.filter((nft: any) => nft?.adminNftSupply > 0)
                          .map((nft: any) => {
                            const availableSupply = nft?.adminNftSupply;
                            return (
                              <div
                                key={nft.id}
                                className="bg-[var(--color-surface)] rounded-lg overflow-hidden border border-gray-700 group transform hover:scale-105 hover:shadow-xl hover:shadow-[var(--color-primary)]/10 transition-transform duration-300 h-full flex flex-col relative"
                              >
                                <button
                                  onClick={() => openModal(nft)}
                                  className="absolute top-2 right-2 z-10 p-2 rounded-full shadow-lg bg-[#667085] hover:bg-[var(--color-surface)] transition-all opacity-0 group-hover:opacity-100"
                                >
                                  <Eye className="w-4 h-4 text-white" />
                                </button>
                                <div className="w-full h-64 mb-2 rounded-lg overflow-hidden bg-black flex items-center justify-center">
                                  {nft?.image ? (
                                    nft.image.match(/\.(mp4|webm|ogg)$/i) ? (
                                      <video
                                        src={nft.image}
                                        className="relative h-64 w-full"
                                        controls
                                        muted
                                        autoPlay
                                        loop
                                        playsInline
                                      />
                                    ) : (
                                      <img
                                        src={nft.image}
                                        className="relative h-64 w-full"
                                        alt={nft.nftName || "NFT"}
                                      />
                                    )
                                  ) : (
                                    <span className="text-gray-500">
                                      No media available
                                    </span>
                                  )}
                                </div>

                                <div className="w-full text-left px-4 flex-grow">
                                  <h3 className="w-full flex justify-between text-white font-bold mb-2 text-[16px] leading-tight hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                                    {nft?.nftName || "Unnamed NFT"}
                                    <span className="text-[12px] text-green-500 font-medium hover:text-green-500">
                                      {nft?.discount || ""}% Off
                                    </span>
                                  </h3>
                                  <div className="flex justify-between text-sm text-blue-400">
                                    <span className="ml-1">
                                      Supply: {availableSupply}
                                    </span>
                                    <span>
                                      Price: {nft?.price || "N/A"} XUT
                                    </span>
                                  </div>
                                </div>

                                <div className="px-4 pb-4 mt-auto flex justify-center">
                                  <Button
                                    onClick={() => {
                                      setSelectedNftForPurchase(nft);
                                      setIsPurchasePopupOpen(true);
                                      setPurchaseQuantity(1);
                                    }}
                                    className="mt-3 w-full sm:w-auto bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 text-white justify-align-center mx-auto"
                                    disabled={processingNftId === nft.id}
                                  >
                                    {processingNftId === nft.id ? (
                                      <span className="flex items-center justify-center">
                                        <Spinner size="sm" className="mr-2" />
                                        Processing...
                                      </span>
                                    ) : (
                                      "Purchase NFT"
                                    )}
                                  </Button>
                                </div>
                              </div>
                            );
                          })
                      ) : (
                        <div className="col-span-full text-center text-gray-400 py-8">
                          No NFTs available
                        </div>
                      )}

                      {products?.length > 0 ? (
                        products.map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))
                      ) : (
                        <div className="col-span-full text-center text-gray-400 py-8">
                          No products found
                        </div>
                      )}
                    </>
                  ) : (
                    products?.length > 0 ? (
                      products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))
                    ) : (
                      <div className="col-span-full text-center text-gray-400 py-8">
                        No products found
                      </div>
                    )
                  )}
                </div>

                {/* Infinite scroll loading indicator for physical products */}
                {hasMorePages && (
                  <div ref={loadingRef} className="flex justify-center py-8">
                    {isLoadingMore && <Spinner />}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {isPurchasePopupOpen && selectedNftForPurchase && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-80 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Purchase NFT</h2>
              <button
                onClick={() => {
                  setIsPurchasePopupOpen(false);
                  setSelectedNftForPurchase(null);
                  setPurchaseQuantity(1);
                }}
                className="text-gray-400 hover:text-white p-1 rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-gray-300 mb-1">You're purchasing:</p>
                <p className="text-white font-medium">
                  {selectedNftForPurchase.nftName}
                </p>
              </div>

              <div className="flex justify-between">
                <p className="text-gray-300">Price per item:</p>
                <p className="text-white">{selectedNftForPurchase.price} XUT</p>
              </div>

              <div className="flex justify-between">
                <p className="text-gray-300">Available supply:</p>
                <p className="text-white">
                  {selectedNftForPurchase?.adminNftSupply}
                </p>
              </div>

              <div className="pt-2">
                <label htmlFor="quantity" className="block text-gray-300 mb-2">
                  Supply
                </label>
                <div className="flex items-center">
                  <button
                    onClick={() =>
                      setPurchaseQuantity(Math.max(1, purchaseQuantity - 1))
                    }
                    className="bg-gray-700 text-white px-3 py-1 rounded-l-md hover:bg-gray-600"
                    disabled={purchaseQuantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    onWheel={(e) => (e.target as HTMLInputElement).blur()}
                    pattern="[0-9]"
                    id="quantity"
                    min="1"
                    max={selectedNftForPurchase?.adminNftSupply}
                    value={purchaseQuantity}
                    onChange={(e) => {
                      const maxSupply = selectedNftForPurchase?.adminNftSupply;
                      const value = Math.min(
                        maxSupply,
                        Math.max(1, parseInt(e.target.value) || 1)
                      );
                      setPurchaseQuantity(value);
                    }}
                    className="bg-gray-700 text-white text-center w-full py-1 border-t border-b border-gray-600"
                  />
                  <button
                    onClick={() => {
                      const maxSupply = selectedNftForPurchase?.adminNftSupply;
                      setPurchaseQuantity(
                        Math.min(maxSupply, purchaseQuantity + 1)
                      );
                    }}
                    className="bg-gray-700 text-white px-3 py-1 rounded-r-md hover:bg-gray-600"
                    disabled={
                      purchaseQuantity >= selectedNftForPurchase?.adminNftSupply
                    }
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-700">
                <div className="flex justify-between mb-4">
                  <p className="text-gray-300">Total:</p>
                  <p className="text-white font-bold">
                    {selectedNftForPurchase.price * purchaseQuantity} XUT
                  </p>
                </div>

                <Button
                  onClick={() => {
                    if (!userId || !user) {
                      router.push("/auth?returnUrl=/addresses");
                      return;
                    }

                    purchaseNFTs(selectedNftForPurchase, purchaseQuantity);
                    setIsPurchasePopupOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 text-white"
                  disabled={processingNftId === selectedNftForPurchase.id}
                >
                  {processingNftId === selectedNftForPurchase.id ? (
                    <span className="flex items-center justify-center">
                      <Spinner size="sm" className="mr-2" />
                      Processing...
                    </span>
                  ) : userId || user ? (
                    "Confirm Purchase"
                  ) : (
                    "Login to Purchase"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && selectedNft && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-80 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700 z-10">
              <h2 className="text-xl font-bold text-white">
                {selectedNft.nftName}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white p-1 rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
              <div className="relative">
                <div className="aspect-square bg-gray-700 rounded-lg overflow-hidden mb-4">
                  {selectedNft.image?.endsWith(".mp4") ||
                    selectedNft.image?.endsWith(".webm") ||
                    selectedNft.image?.endsWith(".ogg") ? (
                    <div className="relative h-full">
                      <video
                        src={selectedNft.image}
                        className="w-full h-full object-contain"
                        controls={isPlaying}
                        autoPlay
                        loop
                      />
                    </div>
                  ) : (
                    <img
                      src={selectedNft.image}
                      alt={selectedNft.nftName}
                      className="w-full h-full object-contain"
                    // onError={(e) => {
                    //   const target = e.target as HTMLImageElement;
                    //   target.onerror = null;
                    //   target.src = "/placeholder-nft.png";
                    // }}
                    />
                  )}
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-gray-400 text-sm">Price</h3>
                    <p className="text-white font-bold">
                      {selectedNft.price} XUT{" "}
                      {selectedNft.discount > 0 && (
                        <span className="text-purple-400 text-sm ml-2">
                          ({selectedNft.discount}% OFF)
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-gray-400 text-sm">Supply</h3>
                    <p className="text-white font-bold">
                      {selectedNft.adminNftSupply}
                    </p>
                  </div>
                  {/* <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-gray-400 text-sm">Status</h3>
                    <p
                      className={`font-bold ${
                        selectedNft.isApproved === "1"
                          ? "text-green-400"
                          : selectedNft.isApproved === "2"
                            ? "text-red-400"
                            : "text-yellow-400"
                      }`}
                    >
                      {selectedNft.isApproved === "1"
                        ? "Approved"
                        : selectedNft.isApproved === "2"
                          ? "Rejected"
                          : "Pending"}
                    </p>
                  </div> */}
                </div>
              </div>

              {/* Details Section */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-gray-400 text-sm mb-2">Collection</h3>
                  <p className="text-white font-medium">
                    {selectedNft.collectionName}
                  </p>
                </div>

                <div>
                  <h3 className="text-gray-400 text-sm mb-2">Created By</h3>
                  <p className="text-white font-medium">
                    {selectedNft.createdBy}
                  </p>
                </div>

                <div>
                  <h3 className="text-gray-400 text-sm mb-2">Description</h3>
                  <p className="text-white">
                    {selectedNft.description || "No description provided"}
                  </p>
                </div>
                <div>
                  <h3 className="text-gray-400 text-sm mb-2">Attributes</h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(selectedNft.nftAttribute) &&
                      selectedNft.nftAttribute.length > 0 ? (
                      selectedNft.nftAttribute.map((attr: any, index: any) => (
                        <div
                          key={index}
                          className="bg-gray-700 rounded-lg p-3 min-w-[120px]"
                        >
                          <p className="text-gray-400 text-xs">
                            {attr.name || "Attribute"}
                          </p>
                          <p
                            className="text-white font-medium truncate"
                            title={attr.values?.join(",")}
                          >
                            {attr.values && attr.values.length > 0
                              ? attr.values.join(", ")
                              : "No value"}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400">No attributes</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-gray-400 text-sm mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(selectedNft.nftTags) &&
                      selectedNft.nftTags.length > 0 ? (
                      selectedNft.nftTags.map((tag: any, index: any) => (
                        <span
                          key={index}
                          className="bg-purple-900/50 text-purple-300 px-3 py-1 rounded-full text-sm"
                        >
                          {tag.label || tag.value || "Tag"}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-400">No tags</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-gray-400 text-sm mb-2">Created</h3>
                    <p className="text-white">
                      {formatDate(selectedNft.createdAt)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-gray-400 text-sm mb-2">Game</h3>
                    <p className="text-white">{selectedNft.nftGame}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;