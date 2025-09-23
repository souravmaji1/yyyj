"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CirclePlus, FolderUp, MoveLeft, Trash2, X } from "lucide-react";
import Select, { components, MultiValueRemoveProps } from "react-select";

import { boolean } from "zod";
import { useAuth } from "@/src/app/apis/auth/UserAuth";
import { fetchTags } from "@/src/store/slices/tag.Slice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/store";
import { useNotificationUtils } from "@/src/core/utils/notificationUtils";

type CollectionOption = {
  value: string;
  label: string;
  isCreateNew?: boolean;
  icon?: JSX.Element;
  redirectPath?: string;
  image?: string;
  description?: string;
};

type GameOption = {
  label: string;
};

type FormErrors = {
  uploadImageVideo: string;
  collection: string;
  name: string;
  supply: any;
  price: any;
  description: string;
  tags: any;
  prompt: string;
  attributes: string;
  game: string;
};

type TagOption = {
  value: string;
  label: string;
};

const gameOptions: GameOption[] = [{ label: "Last to live" }, { label: "Game 2" }];

const CustomOption = (props: any) => {
  const { data, innerRef, innerProps, setIsRefresh, SetAllCollection } = props;
  const { deleteCollection } = useAuth();
  const { showError, showSuccess } = useNotificationUtils();

  const handleDelete = async (id: string) => {
    try {
      const response: any = await deleteCollection(id);
      if (response?.data?.success) {
        showSuccess("Collection Deleted", response?.data?.message);
        setIsRefresh((prevState: boolean) => {
          return !prevState;
        });
        SetAllCollection((prevState: any) => {
          return prevState?.filter((collection: any) => collection?.id !== id);
        });
        if (props?.selectProps?.value?.value === id) {
          props?.selectProps.onChange(null);
        }
      }
    } catch (error) {
      showError("Delete Failed", "Failed to delete collection");
    }
  };

  return (
    <div
      ref={innerRef}
      {...innerProps}
      className={`flex items-center gap-3 px-3 py-2 cursor-pointer rounded-none ${
        data.isCreateNew
          ? "bg-transparent hover:bg-[#2D3748] border-b border-[#374151]"
          : "hover:bg-[#2D3748]"
      }`}
    >
      {data.isCreateNew ? (
        <div className="w-8 h-8 flex items-center justify-center bg-[#3A4556] rounded-md">
          {data.icon}
        </div>
      ) : (
        <img
          src={data.image}
          alt={data.label}
          className="w-8 h-8 rounded-md object-cover"
        />
      )}
      <div className="flex-1">
        <div
          className={`font-medium text-sm ${data.isCreateNew ? "text-[#E5E7EB]" : "text-[#E5E7EB]"}`}
        >
          {data.label}
        </div>
        {data.description && (
          <div className="text-xs text-[#9CA3AF]">{data.description}</div>
        )}
      </div>
      {!data.isCreateNew && (
        <button
          type="button"
          className="ml-2 p-1 hover:bg-red-900 rounded"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(data.value);
          }}
        >
          <Trash2 size={18} className="text-red-400" />
        </button>
      )}
    </div>
  );
};

const CustomSingleValue = ({ data }: any) => (
  <div className="flex items-center gap-2 absolute left-[10px]">
    {data.isCreateNew ? (
      <div className="w-5 h-5 flex items-center justify-center bg-[#3A4556] rounded">
        {data.icon}
      </div>
    ) : (
      <img
        src={data.image}
        alt={data.label}
        className="w-6 h-6 rounded object-cover"
      />
    )}
    <div className="flex flex-col">
      <span className="text-[14px] text-[#E5E7EB] font-medium">
        {data.label}
      </span>
      {data.description && (
        <span className="text-[10px] font-medium text-[#9CA3AF]">
          {data.description}
        </span>
      )}
    </div>
  </div>
);

const CustomMultiValueRemove = (props: MultiValueRemoveProps<any>) => (
  <components.MultiValueRemove {...props}>
    <X size={14} className="text-[#E5E7EB] hover:text-[#A5B4FC]" />
  </components.MultiValueRemove>
);

type AttributeInputProps = {
  attributes: { name: string; values: string }[];
  setAttributes: React.Dispatch<
    React.SetStateAction<{ name: string; values: string }[]>
  >;
  error?: string;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
};

const AttributeInput = ({
  attributes,
  setAttributes,
  error,
  setErrors,
}: AttributeInputProps) => {
  const handleNameChange = (index: number, value: string) => {
    const newAttributes = [...attributes];
    const attribute = newAttributes[index];
    if (attribute) {
      attribute.name = value;
      setAttributes(newAttributes);

      if (value.trim() !== "" && attribute.values.trim() !== "") {
        setErrors((prev) => ({ ...prev, attributes: "" }));
      }
    }
  };

  const handleValueChange = (index: number, value: string) => {
    const newAttributes = [...attributes];
    const attribute = newAttributes[index];
    if (attribute) {
      attribute.values = value;
      setAttributes(newAttributes);

      if (value.trim() !== "" && attribute.name.trim() !== "") {
        setErrors((prev) => ({ ...prev, attributes: "" }));
      }
    }
  };

  const addAttribute = () => {
    setAttributes([...attributes, { name: "", values: "" }]);
  };

  const removeAttribute = (index: number) => {
    const newAttributes = [...attributes];
    newAttributes.splice(index, 1);
    setAttributes(newAttributes);

    const hasValidAttribute = newAttributes.some(
      (attr) => attr.name.trim() !== "" && attr.values.trim() !== ""
    );
    if (hasValidAttribute) {
      setErrors((prev) => ({ ...prev, attributes: "" }));
    }
  };

  return (
    <div className="space-y-3">
      {error && <div className="text-red-400 text-xs mb-2">{error}</div>}

      {attributes.map((attr, attrIndex) => (
        <div key={attrIndex} className="flex items-start gap-3">
          {/* Attribute Name */}
          <div className="flex-1">
            <label className="block text-xs text-[#9CA3AF] mb-1">Name</label>
            <input
              type="text"
              value={attr.name}
              onChange={(e) => handleNameChange(attrIndex, e.target.value)}
              className="w-full border border-[#4B5563] bg-[#2D3748] rounded-lg px-3 py-2 text-sm text-[#E5E7EB] h-11"
              placeholder="e.g. Color"
            />
          </div>

          {/* Attribute Value (now a single string) */}
          <div className="flex-1">
            <label className="block text-xs text-[#9CA3AF] mb-1">Value</label>
            <input
              type="number"
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
              inputMode="numeric"
              pattern="[0-9]"
              value={attr.values}
              onChange={(e) => handleValueChange(attrIndex, e.target.value)}
              className="w-full border border-[#4B5563] bg-[#2D3748] rounded-lg px-3 py-2 text-sm text-[#E5E7EB] h-11"
              placeholder="e.g. 10, 20"
            />
          </div>

          {/* Remove Attribute Button */}
          {attributes.length > 1 && (
            <button
              type="button"
              onClick={() => removeAttribute(attrIndex)}
              className="text-red-400 hover:text-red-500 mt-6"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addAttribute}
        className="text-[#4F46E5] hover:text-[#4338CA] text-sm flex items-center gap-1 mt-2"
      >
        <CirclePlus size={16} />
        Add Attribute
      </button>
    </div>
  );
};

export default function CreateNFT(): JSX.Element {
  const router = useRouter();
  const {
    getAllCollection,
    allcollection,
    ImageUrl,
    createNFT,
    imageEnhance,
    uploadNftImahe,
    SetAllCollection,
  } = useAuth();

  const { showError, showSuccess } = useNotificationUtils();
  const user = useSelector((state: RootState) => state.user.profile);
  const [isRefresh, setIsRefresh] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [collection, setCollection] = useState<any>("");
  const [supply, setSupply] = useState<any>("");
  const [price, setPrice] = useState<any>("");
  const [discount, setDiscount] = useState<any>("");
  const [nameNft, setNameNft] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [logo, setLogo] = useState<File | null>(null);
  const [useAI, setUseAI] = useState<boolean>(false);
  const [selectedGame, setSelectedGame] = useState<GameOption | null>(null);
  const [enhancementPrompt, setEnhancementPrompt] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<TagOption[]>([]);
  const dispatch = useDispatch<AppDispatch>();
  const [enhanceimage, setEnhanceImage] = useState<any>("");
  const [attributes, setAttributes] = useState<
    { name: string; values: string }[]
  >([{ name: "", values: "" }]);
  const userId =
    JSON.parse(localStorage.getItem("userAuthDetails") || "{}").id || "";
  const userCollection = allcollection?.filter(
    (collection: any) => collection?.userId == userId
  );

  const {
    items: tags,
    loading: tagsLoading,
    error: tagsError,
  } = useSelector((state: RootState) => state.tags);

  const tagOptions: any = useMemo(() => {
    return (
      tags?.map((tag: any) => ({
        value: tag.id.toString(),
        label: tag.name,
      })) || []
    );
  }, [tags]);

  const [errors, setErrors] = useState<FormErrors>({
    uploadImageVideo: "",
    collection: "",
    name: "",
    supply: "",
    price: "",
    description: "",
    tags: "",
    prompt: "",
    attributes: "",
    game: "",
  });

  const [isDragActive, setIsDragActive] = useState(false);

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/svg+xml",
    "video/mp4",
    "image/gif",
    "video/webm",
    "audio/wav",
    "image/jpg",
  ];
  const maxFileSize = 50 * 1024 * 1024;

  const handleBack = () => router.back();

  useEffect(() => {
    const enhanceImage = localStorage.getItem("enhanceImage");
    setEnhanceImage(enhanceImage);
  }, []);

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLLabelElement>
  ) => {
    let file: File | undefined;
    if ("dataTransfer" in e) {
      file = e.dataTransfer.files?.[0];
    } else {
      file = e.target.files?.[0];
    }

    if (file) {
      setEnhanceImage("");
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          uploadImageVideo:
            "Invalid file type. Allowed: JPG, PNG, SVG, MP4, GIF, WEBM, WAV.",
        }));
        setLogo(null);
        showError(
          "Invalid file type",
          "Invalid file type. Allowed: JPG, PNG, SVG, MP4, GIF, WEBM, WAV."
        );

        return;
      }
      if (file.size > maxFileSize) {
        setErrors((prev) => ({
          ...prev,
          uploadImageVideo: "File size exceeds 50MB.",
        }));
        setLogo(null);
        showError("File size exceeds 50MB", "File size exceeds 50MB.");
        return;
      }

      setLogo(file);
      setErrors((prev) => ({ ...prev, uploadImageVideo: "" }));

      try {
        const response = await uploadNftImahe({
          imageUrls: file,
        });
        return response;
      } catch (error) {
        console.error("Error uploading image:", error);
        showError("Failed to upload image", "Failed to upload image.");
      }
    }
    setIsDragActive(false);
  };

  const validateFields = (): boolean => {
    // Filter out empty attributes and values
    const filteredAttributes = attributes
      .filter((attr) => attr.name.trim() !== "")
      .filter((attr) => attr.values.trim() !== "");

    const newErrors: FormErrors = {
      uploadImageVideo:
        !logo && !enhanceimage ? "Please upload an image/video" : "",
      collection: !collection ? "Please select a collection" : "",
      name: !nameNft.trim() ? "Please enter a name" : "",
      supply: supply <= 0 ? "Supply must be greater than 0" : "",
      price: supply <= 0 ? "Price must be greater than 0" : "",
      description: !description.trim() ? "Please enter a description" : "",
      tags: selectedTags.length === 0 ? "Please select at least one tag" : "",
      prompt: "",
      attributes:
        filteredAttributes.length === 0
          ? "Please add at least one valid attribute (with name and values)"
          : "",
      game: !selectedGame ? "Please select a game" : "",
    };
    if (useAI && !enhancementPrompt.trim()) {
      newErrors.prompt = "Please enter an enhancement prompt";
    } else if (!useAI && !logo) {
      newErrors.uploadImageVideo = "Please upload an image/video";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (!userId || !user) {
      router.push("/auth?returnUrl=/addresses");
      return;
    }
    e.preventDefault();
    if (validateFields()) {
      setIsLoading(true);
      try {
        const filteredAttributes = attributes
          .filter((attr) => attr.name.trim() !== "")
          .filter((attr) => attr.values.trim() !== "");

        let finalImage = enhanceimage || logo;
        if (useAI) {
          try {
            const enhancementResponse = await imageEnhance({
              userId:
                JSON.parse(localStorage.getItem("userAuthDetails") || "{}")
                  .id || "",
              imageUrls: [ImageUrl],
              type: "user",
              model: "gpt-4o",
              prompt: enhancementPrompt,
              isAiPrompt: "false",
              tags: selectedTags,
            });
            if (!enhancementResponse?.data?.enhancedImageUrl) {
              showError(
                "Image enhancement failed",
                "Image enhancement failed. Please try again."
              );
              setIsLoading(false);
              return;
            }
            if (enhancementResponse?.data?.enhancedImageUrl) {
              finalImage = enhancementResponse?.data?.enhancedImageUrl;
            }

            const response: any = await createNFT({
              collectionId: collection.value,
              userId:
                JSON.parse(localStorage.getItem("userAuthDetails") || "{}")
                  .id || "",
              collectionName: collection.label,
              supply: supply,
              price: price,
              discount: discount,
              nftName: nameNft,
              description: description,
              imageUrl: enhancementResponse?.data?.enhancedImageUrl ?? ImageUrl,
              nftGame: selectedGame?.label || "",
              nftAttribute: filteredAttributes,
              nftTags: selectedTags,
            });

            if (response) {
              showSuccess(
                "NFT created successfully",
                "NFT created successfully."
              );
              router.push("/create-Items");
            }
          } catch (error) {
            console.error("Image enhancement error:", error);
            showError(
              "Image enhancement failed",
              "Image enhancement failed. Please try again."
            );
            setIsLoading(false);
            return;
          }
        } else {
          const response = await createNFT({
            collectionId: collection.value,
            userId:
              JSON.parse(localStorage.getItem("userAuthDetails") || "{}").id ||
              "",
            collectionName: collection.label,
            supply: supply,
            price: price,
            discount: discount,
            nftName: nameNft,
            description: description,
            imageUrl: ImageUrl,
            nftGame: selectedGame?.label || "",
            nftAttribute: filteredAttributes,
            nftTags: selectedTags,
          });
          if (response) {
            showSuccess(
              "NFT created successfully",
              "NFT created successfully."
            );
            router.push("/create-Items");
          }
        }
      } catch (error) {
        console.error("Error creating NFT:", error);
        showError(
          "Error creating NFT",
          "Error creating NFT. Please try again."
        );
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllCollection();
    dispatch(fetchTags({ page: 1, limit: 15 }));
  }, [getAllCollection]);

  const collectionOptions: CollectionOption[] = useMemo(
    () => [
      {
        value: "new-collection",
        label: "Create a new collection",
        isCreateNew: true,
        icon: <CirclePlus size={20} className="text-[#E5E7EB]" />,
        redirectPath: "/create-Collection",
      },
      ...((Array.isArray(userCollection) ? userCollection : []).map(
        (col: any) => ({
          value: col.id,
          label: col.name,
          image: col.logo || "/images/default-collection.png",
          description: col.blockchain || "",
        })
      ) || []),
    ],
    [userCollection, isRefresh]
  );

  return (
    <main className="min-h-screen bg-[var(--color-surface)] text-[#E5E7EB]">
      <div className="flex items-center mb-6 p-6">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-[#2D3748] rounded-lg text-[#E5E7EB] transition-colors duration-200"
        >
          <MoveLeft size={24} className="text-[#E5E7EB]" />
        </button>
        <h1 className="text-[18px] font-semibold text-[#E5E7EB] ml-2">
          Create NFT
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="max-w-4xl mx-auto bg-[#2D3748] border border-[#374151] rounded-lg p-6 shadow-sm">
          <div className="flex gap-6 flex-col sm:flex-row">
            {/* Upload Section */}
            <div className="w-full sm:w-2/5 py-3">
              <label className="block text-[14px] text-[#E5E7EB] font-medium mb-2">
                Upload Image/Video *
                {errors.uploadImageVideo && (
                  <span className="text-red-400 text-xs ml-1">
                    {errors.uploadImageVideo}
                  </span>
                )}
              </label>
              <label
                className={`relative flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#4F46E5] bg-[#1F293780] rounded-lg h-[calc(100%-75px)] w-full text-[#E5E7EB] text-sm font-medium cursor-pointer text-center transition-colors duration-200 ${
                  isDragActive ? "bg-[#3B82F6] border-[#3B82F6]" : ""
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragActive(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileChange(e);
                }}
              >
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/svg+xml,video/mp4,image/gif,video/webm,audio/wav,image/jpg"
                  key={logo ? "file-input" + logo.lastModified : "file-input"}
                  id="file-upload-input"
                />

                {logo ? (
                  <div className="relative w-full h-full">
                    {logo.type.startsWith("video/") ? (
                      <>
                        <video
                          src={URL.createObjectURL(logo)}
                          controls
                          className="w-full h-full object-cover rounded-md"
                          onClick={(e) => {
                            const isControl =
                              (e.target as HTMLVideoElement).tagName ===
                                "VIDEO" &&
                              (e.nativeEvent as MouseEvent).offsetX >
                                (e.target as HTMLVideoElement).clientWidth -
                                  100;
                            if (!isControl) {
                              document
                                .getElementById("file-upload-input")
                                ?.click();
                            }
                          }}
                        />
                        <div className="absolute bottom-2 right-2">
                          <button
                            type="button"
                            className="bg-[#4F46E5] text-white px-3 py-1 rounded-md text-xs flex items-center gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              document
                                .getElementById("file-upload-input")
                                ?.click();
                            }}
                          >
                            <FolderUp size={14} />
                            Change
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <img
                          src={URL.createObjectURL(logo)}
                          alt="upload"
                          className="w-full h-full object-cover rounded-md"
                          onClick={() =>
                            document
                              .getElementById("file-upload-input")
                              ?.click()
                          }
                        />
                        <div className="absolute bottom-2 right-2">
                          <button
                            type="button"
                            className="bg-[#4F46E5] text-white px-3 py-1 rounded-md text-xs flex items-center gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              document
                                .getElementById("file-upload-input")
                                ?.click();
                            }}
                          >
                            <FolderUp size={14} />
                            Change
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    <FolderUp size={36} className="text-[#E5E7EB]" />
                    <span className="font-medium text-[#E5E7EB] text-[14px]">
                      Drag and drop media <br />
                      <span className="text-[#A5B4FC] font-bold my-1.5 block">
                        Browse files
                      </span>
                      <span className="text-[#9CA3AF] text-[12px] font-normal block">
                        Max size: 50MB
                      </span>
                      <span className="text-[#9CA3AF] text-[12px] font-normal block">
                        JPG, PNG, SVG, MP4, GIF, WEBM, WAV
                      </span>
                    </span>
                  </>
                )}
              </label>

              {/* Toggle */}
              <div className="flex items-center mt-4 space-x-2 justify-between">
                <span className="text-sm text-[#E5E7EB] font-medium">
                  Use AI Enhancement
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={useAI}
                    onChange={() => setUseAI(!useAI)}
                  />
                  <div className="w-11 h-6 bg-[#4B5563] peer-focus:outline-none peer-focus:ring-0 peer-focus:ring-[#4F46E5] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4F46E5]"></div>
                </label>
              </div>
            </div>

            {/* Form Inputs */}
            <div className="space-y-2 w-full sm:w-3/5">
              <div className="select-custom padding-no w-full change-design">
                <label className="block text-[14px] text-[#E5E7EB] font-medium mb-1">
                  Collection *
                  {errors.collection && (
                    <span className="text-red-400 text-xs ml-1">
                      {errors.collection}
                    </span>
                  )}
                </label>
                <Select
                  isClearable={false}
                  isMulti={false}
                  options={collectionOptions}
                  value={collectionOptions.find(
                    (opt) => opt.value === collection?.value
                  )}
                  onChange={(selectedOption: CollectionOption | null) => {
                    if (selectedOption) {
                      setCollection({
                        value: selectedOption.value,
                        label: selectedOption.label,
                      });
                      setErrors((prev) => ({ ...prev, collection: "" }));
                      if (selectedOption.redirectPath) {
                        router.push(selectedOption.redirectPath);
                      }
                    }
                  }}
                  placeholder="Choose a Collection"
                  components={{
                    Option: (props) => (
                      <CustomOption
                        {...props}
                        allcollection={allcollection}
                        setIsRefresh={setIsRefresh}
                        SetAllCollection={SetAllCollection}
                      />
                    ),
                    SingleValue: CustomSingleValue,
                  }}
                  className="react-select-container !w-full"
                  classNamePrefix="custom-select"
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      backgroundColor: "#2D3748",
                      borderColor: "#4B5563",
                      color: "#E5E7EB",
                    }),
                    menu: (provided) => ({
                      ...provided,
                      backgroundColor: "#2D3748",
                      borderColor: "#4B5563",
                    }),
                    input: (provided) => ({
                      ...provided,
                      color: "#E5E7EB",
                    }),
                    placeholder: (provided) => ({
                      ...provided,
                      color: "#9CA3AF",
                    }),
                    singleValue: (provided) => ({
                      ...provided,
                      color: "#E5E7EB",
                    }),
                  }}
                />
              </div>

              <div>
                <label className="block text-[14px] text-[#E5E7EB] font-medium mb-1">
                  Name *
                  {errors.name && (
                    <span className="text-red-400 text-xs ml-1">
                      {errors.name}
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={nameNft}
                  onChange={(e) => {
                    setNameNft(e.target.value);
                    setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  className="w-full border border-[#4B5563] bg-[#2D3748] rounded-lg px-3 py-2 h-11 text-sm text-[#E5E7EB]"
                  placeholder="Blue Waves 1"
                />
              </div>

              <div>
                <label className="block text-[14px] text-[#E5E7EB] font-medium mb-1">
                  Supply *
                  {errors.supply && (
                    <span className="text-red-400 text-xs ml-1">
                      {errors.supply}
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  value={supply}
                  min="1"
                  onChange={(e) => {
                    setSupply(Number(e.target.value));
                    setErrors((prev) => ({ ...prev, supply: "" }));
                  }}
                  className="w-full border border-[#4B5563] bg-[#2D3748] rounded-lg px-3 py-2 h-11 text-sm text-[#E5E7EB]"
                  placeholder="10"
                />
              </div>

              <div>
                <label className="block text-[14px] text-[#E5E7EB] font-medium mb-1">
                  Price (XUT) *
                  {errors.price && (
                    <span className="text-red-400 text-xs ml-1">
                      {errors.price}
                    </span>
                  )}
                </label>
                <input
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  type="number"
                  value={price}
                  min="1"
                  onChange={(e) => {
                    setPrice(Number(e.target.value));
                  }}
                  className="w-full border border-[#4B5563] bg-[#2D3748] rounded-lg px-3 py-2 h-11 text-sm text-[#E5E7EB]"
                  placeholder="20"
                />
              </div>

              <div>
                <label className="block text-[14px] text-[#E5E7EB] font-medium mb-1">
                  Discount (%)
                </label>
                <input
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  type="number"
                  value={discount}
                  min="0"
                  step="0.01"
                  onChange={(e) => {
                    setDiscount(Number(e.target.value));
                    setErrors((prev) => ({ ...prev, discount: "" }));
                  }}
                  className="w-full border border-[#4B5563] bg-[#2D3748] rounded-lg px-3 py-2 h-11 text-sm text-[#E5E7EB]"
                  placeholder="10%"
                />
              </div>

              <div className="flex flex-col">
                <label className="block text-[14px] text-[#E5E7EB] font-medium mb-1">
                  Description *
                  {errors.description && (
                    <span className="text-red-400 text-xs ml-1">
                      {errors.description}
                    </span>
                  )}
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setErrors((prev) => ({ ...prev, description: "" }));
                  }}
                  className="w-full border border-[#4B5563] bg-[#2D3748] rounded-lg px-3 py-2 text-sm text-[#E5E7EB]"
                  placeholder="Description here.."
                />
              </div>

              <div className="select-custom padding-no w-full">
                <label className="block text-[14px] text-[#E5E7EB] font-medium mb-1">
                  Select Game *
                  {errors.game && (
                    <span className="text-red-400 text-xs ml-1">
                      {errors.game}
                    </span>
                  )}
                </label>
                <Select
                  value={selectedGame}
                  onChange={(option: GameOption | null) => {
                    setSelectedGame(option);
                    setErrors((prev) => ({ ...prev, game: "" }));
                  }}
                  options={gameOptions}
                  className="react-select-container !w-full"
                  classNamePrefix="custom-select"
                  placeholder="Select a Game"
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      backgroundColor: "#2D3748",
                      borderColor: "#4B5563",
                      color: "#E5E7EB",
                      minHeight: "44px",
                    }),
                    menu: (provided) => ({
                      ...provided,
                      backgroundColor: "#2D3748",
                      borderColor: "#4B5563",
                      zIndex: 9999,
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      backgroundColor: state.isSelected
                        ? "#4F46E5"
                        : state.isFocused
                          ? "#374151"
                          : "#2D3748",
                      color: "#E5E7EB",
                      ":active": {
                        backgroundColor: "#4F46E5",
                      },
                    }),
                    input: (provided) => ({
                      ...provided,
                      color: "#E5E7EB",
                    }),
                    placeholder: (provided) => ({
                      ...provided,
                      color: "#9CA3AF",
                    }),
                    singleValue: (provided) => ({
                      ...provided,
                      color: "#E5E7EB",
                    }),
                    multiValue: (provided) => ({
                      ...provided,
                      backgroundColor: "#374151",
                    }),
                    multiValueLabel: (provided) => ({
                      ...provided,
                      color: "#E5E7EB",
                    }),
                    multiValueRemove: (provided) => ({
                      ...provided,
                      color: "#E5E7EB",
                      ":hover": {
                        backgroundColor: "#EF4444",
                        color: "#FFFFFF",
                      },
                    }),
                  }}
                />
              </div>

              <div className="select-custom padding-no w-full">
                <label className="block text-[14px] text-[#E5E7EB] font-medium mb-1">
                  Tags *
                  {errors.tags && (
                    <span className="text-red-400 text-xs ml-1">
                      {errors.tags}
                    </span>
                  )}
                </label>
                <Select
                  isMulti
                  isClearable={false}
                  menuPlacement="top"
                  options={tagOptions}
                  value={selectedTags}
                  onChange={(selected: readonly TagOption[]) => {
                    setSelectedTags([...selected]);
                    setErrors((prev) => ({ ...prev, tags: "" }));
                  }}
                  placeholder={
                    tagsLoading ? "Loading tags..." : "Select or type tags..."
                  }
                  isLoading={tagsLoading}
                  className="react-select-container"
                  classNamePrefix="custom-select"
                  components={{ MultiValueRemove: CustomMultiValueRemove }}
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      backgroundColor: "#2D3748",
                      borderColor: "#4B5563",
                      color: "#E5E7EB",
                      minHeight: "44px",
                    }),

                    valueContainer: (base) => ({
                      ...base,
                      flexWrap: "wrap",
                      maxHeight: "auto",
                      overflowY: "auto",
                    }),
                    menu: (provided) => ({
                      ...provided,
                      backgroundColor: "#2D3748",
                      borderColor: "#4B5563",
                      zIndex: 9999,
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      backgroundColor: state.isSelected
                        ? "#4F46E5"
                        : state.isFocused
                          ? "#374151"
                          : "#2D3748",
                      color: "#E5E7EB",
                      ":active": {
                        backgroundColor: "#4F46E5",
                      },
                    }),
                    input: (provided) => ({
                      ...provided,
                      color: "#E5E7EB",
                    }),
                    placeholder: (provided) => ({
                      ...provided,
                      color: "#9CA3AF",
                    }),
                    singleValue: (provided) => ({
                      ...provided,
                      color: "#E5E7EB",
                    }),
                    multiValue: (provided) => ({
                      ...provided,
                      backgroundColor: "#374151",
                    }),
                    multiValueLabel: (provided) => ({
                      ...provided,
                      color: "#E5E7EB",
                    }),
                    multiValueRemove: (provided) => ({
                      ...provided,
                      color: "#E5E7EB",
                      ":hover": {
                        backgroundColor: "#EF4444",
                        color: "#FFFFFF",
                      },
                    }),
                  }}
                />
              </div>
            </div>
          </div>

          {/* Attributes Section */}
          <div className="mt-6">
            <label className="block text-[14px] text-[#E5E7EB] font-medium mb-2">
              Attributes *
            </label>
            <AttributeInput
              attributes={attributes}
              setAttributes={setAttributes}
              error={errors.attributes}
              setErrors={setErrors}
            />
          </div>

          {useAI && (
            <div className="mt-6">
              <label className="block text-[14px] text-[#E5E7EB] font-medium mb-1">
                Enter Prompt to Enhance *
                {errors.prompt && (
                  <span className="text-red-400 text-xs ml-1">
                    {errors.prompt}
                  </span>
                )}
              </label>
              <input
                type="text"
                value={enhancementPrompt}
                onChange={(e) => {
                  setEnhancementPrompt(e.target.value);
                  setErrors((prev) => ({ ...prev, prompt: "" }));
                }}
                className="w-full border border-[#4B5563] bg-[#2D3748] rounded-lg px-3 py-2 h-11 text-sm text-[#E5E7EB]"
                placeholder="Type here.."
              />
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end items-center gap-4 mx-auto mt-6 max-w-4xl p-6">
          <button
            type="submit"
            disabled={isLoading}
            onClick={(e) => {
              if (!userId || !user) {
                e.preventDefault();
                router.push("/auth?returnUrl=/addresses");
                return;
              }
            }}
            className="bg-[#4F46E5] border border-[#4F46E5] text-white px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-[#4338CA]"
          >
            {!userId || !user
              ? "Login to Create NFT"
              : isLoading
                ? "Creating..."
                : "Create NFT"}
          </button>
        </div>
      </form>
    </main>
  );
}
