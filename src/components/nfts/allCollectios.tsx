"use client";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  Filter,
  Check,
  Pencil,
  Loader2,
  X,
  Play,
  Pause,
  Eye,
} from "lucide-react";
import Select, { OptionProps, components } from "react-select";
import Link from "next/link";
import { useAuth } from "@/src/app/apis/auth/UserAuth";
import { useDispatch } from "react-redux";
import { transferNft } from "@/src/store/slices/transferSlice";
import { AppDispatch } from "@/src/store";
import { useNotificationUtils } from "@/src/core/utils/notificationUtils";

// Define types based on your API response
interface NFTData {
  id: number;
  createdBy: string;
  nftImgUrl: string;
  nftAttribute: any[];
  nftTags: any[];
  description: string;
  nftGame: string;
  collectionId: number | null;
  supply: number;
  collectionName: string;
  isApproved: string;
  createdAt: string;
  status: "Pending" | "Approved" | "Rejected";
  price?: number;
  discount?: number;
  sold?: number;
  public?: number;
}

interface BuyNFTData {
  id: number;
  nftName: string;
  nftId: number | null;
  userId: string;
  collectionName: string;
  image: string;
  supply: number;
  updatedAt: string; // Add this
  createdAt: string;
}

// Add EligibleNFT interface
interface EligibleNFT {
  id: string;
  name: string;
  image: string;
  discountPercentage: number;
  discountAmount: number;
  collection: string;
  eligibilityReason: string;
}

type Option = { label: string; value: string };
const actionOptions: any = [
  { label: "Approved", value: "Approved" },
  { label: "Rejected", value: "Rejected" },
];

// Constants
const ITEMS_PER_PAGE = 8;

// Custom Option component with checkmark
const CustomOption = (props: OptionProps<Option>) => {
  return (
    <components.Option {...props}>
      <div className="flex justify-between items-center text-[14px]">
        {props.label}
        {props.isSelected && <Check size={18} color="#7E28FF" />}
      </div>
    </components.Option>
  );
};

export default function NFTsManagement(): JSX.Element {
  const { getUserBuyNft, buynft, getUserNft, nftuserbyid } = useAuth();
  const [nftData, setNftData] = useState<NFTData[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "buy">("all");
  const [transferringNftId, setTransferringNftId] = useState<number | null>(
    null
  );
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [selectedNft, setSelectedNft] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const userId =
    JSON.parse(localStorage.getItem("userAuthDetails") || "{}").id || "";
  const ApprovedNFTs = nftData.filter((nft: any) => nft?.Userid == userId);
  // Dummy data for Discount Eligible NFTs
  // const eligibleNFTs: EligibleNFT[] = [
  //   {
  //     id: "201",
  //     name: "Cyber Warrior #001",
  //     image: "https://via.placeholder.com/150",
  //     discountPercentage: 7,
  //     discountAmount: 22.5,
  //     collection: "CyberPunk Warriors",
  //     eligibilityReason: "High supply holder",
  //   },
  //   {
  //     id: "202",
  //     name: "Lightning Racer #042",
  //     image: "https://via.placeholder.com/150",
  //     discountPercentage: 6,
  //     discountAmount: 18,
  //     collection: "Speed Demons",
  //     eligibilityReason: "High supply holder",
  //   },
  //   {
  //     id: "203",
  //     name: "Dark Blade Supreme",
  //     image: "https://via.placeholder.com/150",
  //     discountPercentage: 15,
  //     discountAmount: 45,
  //     collection: "Mythic Weapons",
  //     eligibilityReason: "Premium NFT holder",
  //   },
  // ];
  const filteredNftData =
    activeTab === "all"
      ? nftData
      : activeTab === "buy"
        ? [...buynft]?.filter(itm=>itm?.supply).sort(
            (a, b) =>
              new Date(b.buyDate).getTime() - new Date(a.buyDate).getTime()
          )
        : [];

  const totalPages = Math.ceil((filteredNftData?.length || 0) / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(
    startIndex + ITEMS_PER_PAGE,
    filteredNftData?.length || 0
  );

  const currentItems = filteredNftData?.slice(startIndex, endIndex) || [];

  const { showError } = useNotificationUtils();

  const handleTransfer = async (nftId: any) => {
    if (!recipientAddress) {
      showError("User ID Required", "Please enter a UserId");
      return;
    }
    const currentNft = nftuserbyid.find((nft) => nft.id === nftId).supply;

    try {
      const transferPayload = {
        userId: userId,
        to: recipientAddress,
        type: "nft",
        nftId: nftId.toString(),
        nftAmount: currentNft,
      };

      dispatch(transferNft(transferPayload));
      setTransferringNftId(null);
      setRecipientAddress("");
      await getUserNft(userId);
    } catch (error) {
      console.error(error);
    }
  };

  const openNftDetails = (buynft: any) => {
    setSelectedNft(buynft);
    setIsModalOpen(true);
    setIsPlaying(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNft(null);
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    getUserBuyNft(userId);
  }, [getUserBuyNft, userId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await getUserNft(userId);
      } catch (error) {
        setError("Failed to fetch NFTs");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (nftuserbyid) {
      try {
        const formattedData: any[] = nftuserbyid?.map(
          (nft: any, index: any) => ({
            id: nft?.id || index,
            Userid: nft?.userId,
            createdBy: nft?.createdBy || "Unnamed NFT",
            image: nft?.image,
            nftAttribute: nft?.nftAttribute || [],
            nftTags: nft?.nftTags || [],
            description: nft?.description || "",
            nftGame: nft?.nftGame || "No linked game",
            collectionId: nft?.collectionId || null,
            isApproved: nft?.isApproved || "0",
            supply: nft?.supply || 0,
            collectionName: nft?.collectionName || "Unnamed Collection",
            createdAt: formatDate(nft?.createdAt),
            formattedDate: formatDate(nft?.createdAt),
            status:
              nft?.isApproved === "1"
                ? "Approved"
                : nft?.isApproved === "2"
                  ? "Rejected"
                  : nft?.isApproved === "0"
                    ? "Pending"
                    : "",
            price: nft?.price || 0,
            discount: nft?.discount || 0,
            sold: nft?.sold || 0,
            public: nft?.public || 0,
            nftName: nft?.nftName || "Unnamed NFT",
          })
        );
        // .sort(
        //   (a, b) =>
        //     new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        // );
        setNftData(formattedData);
      } catch (error) {
        setError("Error processing NFT data");
      }
    }
  }, [nftuserbyid]);

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else if (currentPage <= 3) {
      for (let i = 1; i <= maxVisiblePages; i++) {
        pages.push(i);
      }
    } else if (currentPage >= totalPages - 2) {
      for (let i = totalPages - maxVisiblePages + 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      for (let i = currentPage - 2; i <= currentPage + 2; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--color-bg)]">
        <div className="flex justify-center items-center h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-bg-[var(--color-bg)] bg-[var(--color-bg)]  " />
            <p className="text-gray-300 text-lg">Loading your NFTs...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[var(--color-bg)] ">
        <div className="max-w-[1600px] mx-auto p-6">
          <div className="flex justify-center items-center h-64">
            <p className="text-red-400 bg-red-900/30 px-4 py-2 rounded-lg">
              {error}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)]  p-4 md:p-8">
      {/* NFT Details Modal */}
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
                        controls
                        muted
                        autoPlay
                        loop
                        playsInline
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
                    <p className="text-white font-bold">{selectedNft.supply}</p>
                  </div>
                  {/* <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-gray-400 text-sm">Sold</h3>
                    <p className="text-white font-bold">{selectedNft.sold}</p>
                  </div> */}
                  <div className="bg-gray-700 p-4 rounded-lg">
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
                  </div>
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
                      selectedNft.nftAttribute.map(
                        (attr: any, index: number) => (
                          <div
                            key={index}
                            className="bg-gray-700 rounded-lg p-3 min-w-[120px]"
                          >
                            <p className="text-gray-400 text-xs">
                              {attr.name || "Attribute"}
                            </p>
                            <p className="text-white font-medium">
                              {attr.values || "Value"}
                            </p>
                          </div>
                        )
                      )
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
                      {/* {formatDate(selectedNft.updatedAt)} */}

                      {formatDate(selectedNft?.createdAt)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-gray-400 text-sm mb-2">Game</h3>
                    <p className="text-white">{selectedNft.nftGame}</p>
                  </div>
                </div>

                {/* {selectedNft.isApproved === "1" && (
                  <div className="pt-4">
                    <h3 className="text-gray-400 text-sm mb-2">Transfer NFT</h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        placeholder="Enter Recipient Address"
                        className="flex-1 bg-gray-700 text-white px-3 py-2 rounded text-sm"
                      />
                      <button
                        onClick={() => handleTransfer(selectedNft.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                      >
                        Transfer
                      </button>
                    </div>
                  </div>
                )} */}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rest of your existing component */}
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              NFT Management
            </h1>
            <p className="text-gray-400 mt-1">
              {activeTab === "all"
                ? "View and manage your NFT collection"
                : activeTab === "buy"
                  ? "Browse available NFTs to purchase"
                  : "View your NFTs with active discounts"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link href="/create-Collection" className="w-full md:w-auto">
              <button className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]  transition-colors text-white px-6 py-3 rounded-lg font-medium w-full flex items-center justify-center gap-2">
                <Pencil size={16} />
                Create NFT Collection
              </button>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex mb-8 border-b border-gray-700 overflow-x-auto">
          <button
            className={`py-3 px-6 font-medium text-sm flex items-center gap-2 ${activeTab === "all" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-white"}`}
            onClick={() => {
              setActiveTab("all");
              setCurrentPage(1);
            }}
          >
            <span>All NFTs</span>
            <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">
              {nftuserbyid?.length}
            </span>
          </button>
          <button
            className={`py-3 px-6 font-medium text-sm flex items-center gap-2 ${activeTab === "buy" ? "text-blue-400 border-b-2 border-purple-400" : "text-gray-400 hover:text-white"}`}
            onClick={() => {
              setActiveTab("buy");
              setCurrentPage(1);
            }}
          >
            <span>Buy NFTs</span>
            <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">
              {[...buynft]?.filter(itm=>itm?.supply)?.length || 0}
            </span>
          </button>
        </div>

        {/* Content Area */}
        <div className=" rounded-xl p-6 shadow-lg">
          {filteredNftData?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="bg-gray-700 p-6 rounded-full mb-4">
                <Filter size={32} className="text-gray-500" />
              </div>
              <h3 className="text-xl text-white font-medium mb-2">
                No NFTs found
              </h3>
              <p className="text-gray-400 max-w-md text-center">
                {activeTab === "all"
                  ? "You haven't created any NFTs yet. Start by creating a new collection."
                  : activeTab === "buy"
                    ? "There are currently no buy NFTs available."
                    : "You don't have any NFTs with active discounts."}
              </p>
              {activeTab === "all" && (
                <Link href="/create-Collection" className="mt-6">
                  <button className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:bg-purple-700 text-white px-6 py-2 rounded-lg">
                    Create Your First NFT
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* NFT Grid */}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {currentItems?.map((item: any, index: number) => (
                  <div
                    key={`${item?.id}-${index}`}
                    className="bg-[var(--color-surface)] rounded-lg overflow-hidden border border-gray-700 group transform hover:scale-105 hover:shadow-xl hover:shadow-[var(--color-primary)]/10 transition-transform duration-300 h-full flex flex-col relative"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      {/* Eye Icon */}
                      <button
                        className="absolute top-2 right-2 z-10 p-2 rounded-full shadow-lg bg-[#667085] hover:bg-[var(--color-surface)] transition-all opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          openNftDetails(item);
                        }}
                      >
                        <Eye className="w-4 h-4 text-white" />
                      </button>

                      {/* Image or Video */}
                      {item?.image ? (
                        item?.image.endsWith(".mp4") ||
                        item?.image.endsWith(".webm") ||
                        item?.image.endsWith(".ogg") ? (
                          <video
                            src={item?.image}
                            className="w-full h-full object-cover"
                            controls
                            muted
                            autoPlay
                            loop
                            playsInline
                          />
                        ) : (
                          <img
                            src={item?.image}
                            className="w-full h-full object-cover"
                            alt={item?.nftName || item?.collectionName}
                          />
                        )
                      ) : (
                        <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                          <span className="text-gray-400">No Media</span>
                        </div>
                      )}

                      {activeTab === "all" && (
                        <div className="absolute top-3 inset-x-3 flex justify-between items-center">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              item?.isApproved === "1"
                                ? "bg-green-900/80 text-green-300"
                                : item?.isApproved === "2"
                                  ? "bg-red-900/80 text-red-300"
                                  : "bg-yellow-900/80 text-yellow-300"
                            }`}
                          >
                            {item?.isApproved === "1"
                              ? "Approved"
                              : item?.isApproved === "2"
                                ? "Rejected"
                                : "Pending"}
                          </span>

                          {/* {item?.isApproved === "1" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setTransferringNftId(
                                  item.id === transferringNftId ? null : item.id
                                );
                              }}
                              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                            >
                              {item.id === transferringNftId
                                ? "Cancel"
                                : "Transfer NFT"}
                            </button>
                          )} */}
                        </div>
                      )}
                    </div>

                    {/* NFT Info */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-white font-semibold truncate">
                              {activeTab === "all"
                                ? item?.collectionName
                                : item?.nftName}
                            </h3>
                            <p className="text-gray-400 text-sm truncate">
                              {activeTab === "all"
                                ? item?.nftName
                                : item?.collectionName}
                            </p>
                          </div>
                          <div>
                            <p className="text-[12px] text-green-500 font-medium hover:text-green-500 text-right">
                              {item.discount}% Off
                            </p>
                            <span className="bg-gray-600 text-purple-300 text-xs px-2 py-1 rounded">
                              {item?.supply}{" "}
                              {item?.supply === 1 ? "supply" : "supply"}
                            </span>
                          </div>
                        </div>

                        <div className="border-t border-gray-600 pt-3 mt-3">
                          <div className="flex justify-between text-sm text-gray-400">
                            <span>Creator</span>
                            <span className="text-white truncate max-w-[120px]">
                              {item?.createdBy || "Unknown"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-400 mt-1">
                            <span>Created</span>
                            <span className="text-white">
                              {activeTab === "all"
                                ? formatDate(item?.createdAt)
                                : formatDate(item?.buyDate)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Transfer NFT Form */}
                      {transferringNftId === item.id && (
                        <div className="p-4 border-t border-gray-600 mt-4">
                          <div className="mb-2">
                            <label className="block text-gray-400 text-sm mb-1">
                              Recipient Address
                            </label>
                            <input
                              type="text"
                              value={recipientAddress}
                              onChange={(e) =>
                                setRecipientAddress(e.target.value)
                              }
                              placeholder="Enter User ID"
                              className="w-full bg-gray-600 text-white px-3 py-2 rounded text-sm"
                            />
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTransfer(item.id);
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Confirm Transfer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center mt-10 gap-1 flex-wrap">
                  <button
                    className="px-4 py-2 flex items-center justify-center rounded-lg text-gray-300 font-medium text-sm bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:hover:bg-gray-700 transition-colors"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                  >
                    Previous
                  </button>

                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm border ${
                        currentPage === page
                          ? "bg-purple-600 border-purple-600 text-white"
                          : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    className="px-4 py-2 flex items-center justify-center rounded-lg text-gray-300 font-medium text-sm bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:hover:bg-gray-700 transition-colors"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
