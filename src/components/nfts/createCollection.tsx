"use client";
import { useRouter } from "next/navigation";
import { CirclePlus, MoveLeft } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/src/app/apis/auth/UserAuth";
import { useNotificationUtils } from "@/src/core/utils/notificationUtils";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";

type CreatedState = {
  EnterName: string;
  Blockchain: string;
  userId: string;
  Prompt: string;
  Description: string;
  UploadLogo: File | null;
};

export default function CreateNFTCollection(): JSX.Element {
  const router = useRouter();
  const { createCollection } = useAuth();
  const { showError, showSuccess } = useNotificationUtils();
  const user = useSelector((state: RootState) => state.user.profile);
  const [name, setName] = useState("");
  const [blockchain, setBlockchain] = useState("");
  const [prompt, setPrompt] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [isCreated, setIsCreated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [created, setCreated] = useState<CreatedState>({
    EnterName: "",
    Blockchain: "",
    Prompt: "",
    userId: "",
    Description: "",
    UploadLogo: null,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userId =
        JSON.parse(localStorage.getItem("userAuthDetails") || "{}").id || "";
      setCreated((prev) => ({ ...prev, userId }));
    }
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/svg+xml",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        showError(
          "Invalid File Type",
          "Only JPG, PNG, SVG, and WEBP image files are allowed."
        );
        return;
      }
      setLogo(file);
      setCreated((prev) => ({ ...prev, UploadLogo: file }));
      setErrors((prev) => ({ ...prev, logo: "" }));
    }
  };

  const handleLogoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/svg+xml",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        showError(
          "Invalid File Type",
          "Only JPG, PNG, SVG, and WEBP image files are allowed."
        );
        return;
      }
      setLogo(file);
      setCreated((prev) => ({ ...prev, UploadLogo: file }));
      setErrors((prev) => ({ ...prev, logo: "" }));
    }
  };

  const [errors, setErrors] = useState({
    name: "",
    blockchain: "",
    prompt: "",
    description: "",
    logo: "",
  });

  const validateFields = () => {
    const newErrors = {
      name: name.trim() ? "" : "Collection name is required",
      blockchain: blockchain.trim() ? "" : "Blockchain is required",
      prompt: prompt.trim() ? "" : "Prompt is required",
      description: description.trim() ? "" : "Description is required",
      logo: logo ? "" : "Logo is required",
    };

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === "");
  };

  const collectionSubmit = async () => {
    if (!validateFields()) return;
    setIsLoading(true);
    try {
      const response = await createCollection(created);
      if (response) {
        setIsCreated(true);
        showSuccess("Collection Created", "Collection created successfully!");
      }
    } catch (error) {
      console.error("Collection creation error:", error);
      showError("Creation Failed", "Failed to create collection");
    }
    setIsLoading(false);
  };

  return (
    <main className="min-h-screen bg-[var(--color-surface)] text-[#E5E7EB] p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-[#2D3748] rounded-lg text-[#E5E7EB] transition-colors duration-200"
          aria-label="Go back"
        >
          <MoveLeft size={24} className="text-[#E5E7EB]" />
        </button>
        <h1 className="text-[18px] font-semibold text-[#E5E7EB] ml-2">
          Create NFT Collection
        </h1>
      </div>

      {!isCreated ? (
        <div>
          <div className="w-full max-w-3xl mx-auto bg-[#2D3748] rounded-lg shadow-sm p-6 border border-[#374151]">
            <div className="block mb-6">
              <label
                className="border-dashed border-2 border-[#4F46E5] bg-[#1F293780] text-[#E5E7EB] rounded-lg w-28 h-28 flex items-center justify-center cursor-pointer text-center text-sm font-medium"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={handleLogoDrop}
              >
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/svg+xml,image/jpg,image/webp"
                />
                {logo ? (
                  <img
                    src={URL.createObjectURL(logo)}
                    alt="Collection logo"
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 text-[#E5E7EB]">
                    <CirclePlus className="text-[#E5E7EB]" />
                    <span className="font-semibold text-[12px]">
                      Upload
                      <br />
                      Logo
                    </span>
                  </div>
                )}
              </label>
              {errors.logo && (
                <p className="text-red-400 text-sm mt-1">{errors.logo}</p>
              )}
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[14px] text-[#E5E7EB] font-medium mb-1">
                    NFT Collection Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setCreated((prev) => ({
                        ...prev,
                        EnterName: e.target.value,
                      }));
                      setErrors((prev) => ({ ...prev, name: "" }));
                    }}
                    className="w-full border border-[#4B5563] bg-[#2D3748] rounded-lg px-3 py-2 mt-1 placeholder-[#9CA3AF] text-[14px] h-11 text-[#E5E7EB]"
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="text-[14px] text-[#E5E7EB] font-medium mb-1">
                    Blockchain *
                  </label>
                  <input
                    type="text"
                    value={blockchain}
                    onChange={(e) => {
                      setBlockchain(e.target.value);
                      setCreated((prev) => ({
                        ...prev,
                        Blockchain: e.target.value,
                      }));
                      setErrors((prev) => ({ ...prev, blockchain: "" }));
                    }}
                    className="w-full border border-[#4B5563] bg-[#2D3748] rounded-lg px-3 py-2 mt-1 placeholder-[#9CA3AF] text-[14px] h-11 text-[#E5E7EB]"
                    placeholder="Enter Blockchain"
                  />
                  {errors.blockchain && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.blockchain}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-[14px] text-[#E5E7EB] font-medium mb-1">
                Enter Prompt *
              </label>
              <input
                type="text"
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  setCreated((prev) => ({ ...prev, Prompt: e.target.value }));
                  setErrors((prev) => ({ ...prev, prompt: "" }));
                }}
                className="w-full border border-[#4B5563] bg-[#2D3748] rounded-lg px-3 py-2 h-11 text-sm text-[#E5E7EB]"
                placeholder="Type here.."
              />
              {errors.prompt && (
                <p className="text-red-400 text-sm mt-1">{errors.prompt}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="text-[14px] text-[#E5E7EB] font-medium mb-1">
                Description *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setCreated((prev) => ({
                    ...prev,
                    Description: e.target.value,
                  }));
                  setErrors((prev) => ({ ...prev, description: "" }));
                }}
                className="w-full border border-[#4B5563] bg-[#2D3748] rounded-lg px-3 py-2 mt-1 placeholder-[#9CA3AF] text-[14px] text-[#E5E7EB]"
                placeholder="Description here.."
              />
              {errors.description && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 max-w-3xl mx-auto my-6">
            <Link href="/nft-Management">
              <button className="bg-[#4B5563] text-white px-4 py-2 rounded-xl text-[14px] font-medium hover:bg-[#374151]">
                Skip
              </button>
            </Link>
            <button
              onClick={(e) => {
                if (!user) {
                  e.preventDefault();
                  router.push("/auth?returnUrl=/addresses");
                  return;
                }
                collectionSubmit();
              }}
              disabled={isLoading}
              className="bg-[#4F46E5] text-white px-4 py-2 rounded-xl text-[14px] font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4338CA]"
            >
              {!user
                ? "Login to Create Collection"
                : isLoading
                  ? "Creating..."
                  : "Create Collection"}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="w-full max-w-md mx-auto bg-[#2D3748] rounded-lg shadow-sm p-6 border border-[#374151]">
              {logo ? (
              <img
                src={URL.createObjectURL(logo)}
                alt="collection"
                className="w-28 h-28 mx-auto mb-3 rounded-lg object-cover"
              />
            ) : (
              <img
                src="/images/painting.png"
                alt="collection"
                className="w-28 h-28 mx-auto mb-3 rounded-lg object-cover"
              />
            )}
            <p className="text-[20px] sm:text-[24px] text-[#E5E7EB] text-center font-semibold mb-1">
              Your collection has been <br className="hidden sm:block" />{" "}
              created
            </p>
          </div>
          <div className="flex justify-center gap-4 mt-6">
            <Link href="/nft-Management">
              <button className="bg-[#4F46E5] text-white px-4 py-2 rounded-xl text-[14px] font-medium hover:bg-[#4338CA]">
                Create an NFT
              </button>
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
