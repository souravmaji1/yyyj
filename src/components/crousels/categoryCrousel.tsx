import { AppDispatch, RootState } from "@/src/store";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Badge } from "../ui/badge";
import { Icons } from "@/src/core/icons";
import { fetchCatalog } from "@/src/store/slices/catalog.Slice";
import { Spinner } from "../ui/spinner";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { productType } from "@/src/constants";
import { updateFilter } from "@/src/store/slices/productFilter.slice";

interface CatalogItem {
    id: number;
    name: string;
    tags: string;
    thumbnail: string;
    productcount: number;
}

interface ImageLoadState {
    [key: number]: {
        isLoading: boolean;
        hasError: boolean;
        isLoaded: boolean;
    };
}

interface CategoryCrouselProps {
    selectedTab: "digital" | "physical" | "NFT" | "online";
}

const CategoryCrousel = ({ selectedTab }: CategoryCrouselProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [imageLoadStates, setImageLoadStates] = useState<ImageLoadState>({});
    const [showLeftButton, setShowLeftButton] = useState(false);
    const [showRightButton, setShowRightButton] = useState(true);

    const { items: trendingCatalogs, loading: trendingCatalogsLoading } = useSelector((state: RootState) => state.catalog);
    const { selectedCatalogs } = useSelector((state: RootState) => state.productFilter);

    const handleCatalogClick = useCallback((catalogName: string) => {
        const newSelectedCatalogs = selectedCatalogs.includes(catalogName)
            ? selectedCatalogs.filter(cat => cat !== catalogName)
            : [...selectedCatalogs, catalogName];

        dispatch(updateFilter({
            key: 'selectedCatalogs',
            value: newSelectedCatalogs
        }));
    }, [selectedCatalogs, dispatch]);

    // const fetchCatalogData = (page: number, limit: number) => {
    //     dispatch(fetchCatalog({
    //         page,
    //         limit,
    //         productType: selectedTab === "physical" ? productType.PHYSICAL : productType.DIGITAL
    //     }));
    // };

    // useEffect(() => {
    //     fetchCatalogData(1, 10);
    // }, []);

    const isValidImageUrl = (url: string): boolean => {
        return Boolean(url && url.startsWith('https://') && !url.includes('example.com'));
    };

    const initializeImageState = useCallback((catalogId: number) => {
        setImageLoadStates(prev => ({
            ...prev,
            [catalogId]: {
                isLoading: true,
                hasError: false,
                isLoaded: false
            }
        }));
    }, []);

    const handleImageLoad = useCallback((catalogId: number) => {
        setImageLoadStates(prev => ({
            ...prev,
            [catalogId]: {
                isLoading: false,
                hasError: false,
                isLoaded: true
            }
        }));
    }, []);

    const handleImageError = useCallback((catalogId: number) => {
        setImageLoadStates(prev => ({
            ...prev,
            [catalogId]: {
                isLoading: false,
                hasError: true,
                isLoaded: false
            }
        }));
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            const newScrollPosition = direction === 'left'
                ? scrollContainerRef.current.scrollLeft - scrollAmount
                : scrollContainerRef.current.scrollLeft + scrollAmount;

            scrollContainerRef.current.scrollTo({
                left: newScrollPosition,
                behavior: 'smooth'
            });
        }
    };

    const handleScroll = useCallback(() => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setShowLeftButton(scrollLeft > 0);
            setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);
        }
    }, []);

    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll);
            handleScroll();
        }
        return () => {
            if (scrollContainer) {
                scrollContainer.removeEventListener('scroll', handleScroll);
            }
        };
    }, [handleScroll, trendingCatalogs]);

    return (
        <div className="mb-8 relative px-12 min-h-[200px]">
            {showLeftButton && !trendingCatalogsLoading && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-[var(--color-surface)] hover:bg-[var(--color-primary)] rounded-full h-12 w-12 shadow-lg border border-[#667085]/30"
                    onClick={() => scroll('left')}
                >
                    <ChevronLeft className="h-6 w-6 text-white" />
                </Button>
            )}

            <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto pb-2 space-x-5 no-scrollbar scroll-smooth px-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {trendingCatalogsLoading ? (
                    // Skeleton loading state with same dimensions as actual content
                    Array.from({ length: 6 }).map((_, index) => (
                        <div key={`skeleton-${index}`} className="flex-none w-40 h-40">
                            <div className="flex flex-col items-center p-4 bg-[var(--color-surface)]/50 backdrop-blur-sm rounded-2xl border border-[#667085]/30 h-full">
                                <div className="w-full h-full relative mb-3">
                                    <div className="absolute inset-0 bg-gray-800 animate-pulse rounded-md"></div>
                                </div>
                                <div className="w-20 h-3 bg-gray-700 animate-pulse rounded mb-2"></div>
                                <div className="w-16 h-5 bg-gray-700 animate-pulse rounded"></div>
                            </div>
                        </div>
                    ))
                ) : trendingCatalogs.map((catalog: CatalogItem, index: number) => {
                    const hasValidImage = isValidImageUrl(catalog.thumbnail);
                    const imageState = imageLoadStates[catalog.id] || {
                        isLoading: true,
                        hasError: false,
                        isLoaded: false
                    };
                    const isSelected = selectedCatalogs.includes(catalog.name);

                    if (!imageLoadStates[catalog.id]) {
                        initializeImageState(catalog.id);
                    }

                    return (
                        <div key={catalog.id} className="flex-none w-40 h-40 group">
                            <div
                                onClick={() => handleCatalogClick(catalog.name)}
                                className={`group flex flex-col items-center p-4 bg-[var(--color-surface)]/50 backdrop-blur-sm hover:bg-[var(--color-primary)]/10 rounded-2xl border ${isSelected ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 shadow-lg shadow-[var(--color-primary)]/20' : 'border-[#667085]/30 hover:border-[var(--color-primary)]/30'} transition-all duration-300 h-full cursor-pointer relative`}
                            >
                                {isSelected && (
                                    <div className="absolute top-2 right-2 z-10">
                                        <div className="h-6 w-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                                            <Icons.check className="h-4 w-4 text-white" />
                                        </div>
                                    </div>
                                )}
                                <div className="w-full h-full relative mb-3 group-hover:scale-110 transition-transform duration-300 rounded-md">
                                    {imageState.isLoading && (
                                        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                                            <Spinner />
                                        </div>
                                    )}
                                    {hasValidImage && !imageState.hasError ? (
                                        <Image
                                            src={catalog.thumbnail}
                                            alt={catalog.name}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            className={`object-cover object-top transition-opacity duration-300 ${imageState.isLoaded ? 'opacity-100' : 'opacity-0'} ${isSelected ? 'brightness-110' : ''}`}
                                            priority={index === 0}
                                            onLoad={() => handleImageLoad(catalog.id)}
                                            onError={() => handleImageError(catalog.id)}
                                            unoptimized={true}
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                                            <Icons.image className="w-12 h-12 text-gray-600" />
                                        </div>
                                    )}
                                </div>
                                <span className={`text-[12px] font-medium ${isSelected ? 'text-[var(--color-primary)]' : 'text-white group-hover:text-[var(--color-primary)]'} text-center line-clamp-1 h-8`}>
                                    {catalog.name}
                                </span>
                                <Badge
                                    variant="secondary"
                                    className={`mt-2 ${isSelected ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]'} font-medium`}
                                >
                                    {catalog.productcount} products
                                </Badge>
                            </div>
                        </div>
                    );
                })}
            </div>

            {showRightButton && !trendingCatalogsLoading && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[var(--color-surface)] hover:bg-[var(--color-primary)] rounded-full h-12 w-12 shadow-lg border border-[#667085]/30"
                    onClick={() => scroll('right')}
                >
                    <ChevronRight className="h-6 w-6 text-white" />
                </Button>
            )}
        </div>
    );
};

export default CategoryCrousel;