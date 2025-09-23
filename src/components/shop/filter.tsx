import { motion } from "framer-motion";
import { Input } from "../ui/input";
import { Icons } from "@/src/core/icons";
import { useDispatch, useSelector } from "react-redux";
import { updateFilter, resetFilters } from "@/src/store/slices/productFilter.slice";
import { RootState } from "@/src/store";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { useState, useCallback } from "react";
import { PRODUCT_COLORS } from "@/src/constants/colors";
import { PRODUCT_SIZES } from "@/src/constants/sizes";
import { filterStyles } from "./styles/filter.styles";
import { cn } from "@/src/core/utils/index";

interface FilterSections {
    price: boolean;
    catalogs: boolean;
    colors: boolean;
    sizes: boolean;
}

interface FilterProps {
    filterData: (range: [number, number]) => void;
    isDropdown?: boolean;
}

const Filter = ({ filterData, isDropdown = false }: FilterProps) => {
    const dispatch = useDispatch();
    const { searchQuery, priceRange, selectedCatalogs, selectedColors, selectedSizes } = useSelector((state: RootState) => state.productFilter);
    const { items: trendingCatalogs, loading: trendingCatalogsLoading } = useSelector((state: RootState) => state.catalog);

    const [openFilters, setOpenFilters] = useState<FilterSections>({
        price: false,
        catalogs: false,
        colors: false,
        sizes: false
    });
    const [localPriceRange, setLocalPriceRange] = useState<[number, number]>(priceRange);

    const handleSearch = (value: string) => {
        dispatch(updateFilter({ key: 'searchQuery', value }));
    };

    const toggleFilter = useCallback((filterName: keyof FilterSections) => {
        setOpenFilters(prev => ({
            ...prev,
            [filterName]: !prev[filterName]
        }));
    }, []);

    const handlePriceChange = useCallback((value: number | number[]) => {
        const newRange = Array.isArray(value) ? value : [value, value];
        setLocalPriceRange(newRange as [number, number]);
    }, [filterData]);

    const applyPriceFilter = useCallback(() => {
        dispatch(updateFilter({ 
            key: 'priceRange', 
            value: [localPriceRange[0] / 1000, localPriceRange[1] / 1000] 
        }));
            filterData([localPriceRange[0] / 2, localPriceRange[1] / 2]);
    }, [dispatch, localPriceRange]);

    const handleCatalogToggle = useCallback((catalogName: string) => {
        const newSelectedCatalogs = selectedCatalogs.includes(catalogName)
            ? selectedCatalogs.filter((cat: string) => cat !== catalogName)
            : [...selectedCatalogs, catalogName];

        dispatch(updateFilter({
            key: 'selectedCatalogs',
            value: newSelectedCatalogs
        }));
    }, [selectedCatalogs, dispatch]);

    const handleColorToggle = useCallback((colorName: string) => {
        const newSelectedColors = selectedColors.includes(colorName)
            ? selectedColors.filter(color => color !== colorName)
            : [...selectedColors, colorName];

        dispatch(updateFilter({
            key: 'selectedColors',
            value: newSelectedColors
        }));
    }, [selectedColors, dispatch]);

    const handleSizeToggle = useCallback((sizeName: string) => {
        const newSelectedSizes = selectedSizes.includes(sizeName)
            ? selectedSizes.filter(size => size !== sizeName)
            : [...selectedSizes, sizeName];

        dispatch(updateFilter({
            key: 'selectedSizes',
            value: newSelectedSizes
        }));
    }, [selectedSizes, dispatch]);

    const handleResetFilters = useCallback(() => {
        // Reset Redux state
        dispatch(resetFilters());
        // Reset local state
        setLocalPriceRange([0, 1000000]);
        // Optionally close all filter sections
        setOpenFilters({
            price: false,
            catalogs: false,
            colors: false,
            sizes: false
        });
    }, [dispatch]);

    // Check if any filters are applied
    const hasActiveFilters = useCallback(() => {
        return (
            searchQuery.trim() !== '' ||
            selectedCatalogs.length > 0 ||
            selectedColors.length > 0 ||
            selectedSizes.length > 0 ||
            (priceRange[0] !== 0 || priceRange[1] !== 1000000)
        );
    }, [searchQuery, selectedCatalogs, selectedColors, selectedSizes, priceRange]);

    return (
        <div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={cn(
                    "bg-[var(--color-surface)]/50 backdrop-blur-sm py-6 px-4 rounded-2xl border border-[#667085]/30",
                    !isDropdown && "sticky top-24"
                )}
            >
                <h3 className="text-xl font-bold mb-6 text-white relative inline-block">
                    Filters
                    <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]"></span>
                </h3>

                <form className="relative mt-0 mb-5" onSubmit={(e) => e.preventDefault()}>
                    <Input
                        type="search"
                        placeholder="Search products..."
                        className="pr-12 rounded-xl bg-[var(--color-surface)]/50 border-[#667085]/30 text-white placeholder:text-[#667085]"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                    <div className="absolute inset-y-0 right-4 flex items-center text-white">
                        <Icons.search className="h-5 w-5" />
                    </div>
                </form>

                {/* Price Range Filter */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <button
                            onClick={() => toggleFilter("price")}
                            className="flex items-center justify-between w-full text-left group"
                        >
                            <div className="flex items-center">
                                <div className="w-1 h-6 bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full mr-3"></div>
                                <h4 className="text-[16px] xl:text-lg font-semibold text-white group-hover:text-[var(--color-primary)] transition-colors">
                                    Price Range
                                </h4>
                            </div>
                            <div className={`flex items-center justify-center h-7 w-7 rounded-full transition-all duration-300 ${!openFilters.price ? "" : "bg-[var(--color-surface)]"}`}>
                                <Icons.chevronDown className={`h-6 w-6 transition-transform duration-300 ${openFilters.price ? "rotate-180 text-white" : "text-white"}`} />
                            </div>
                        </button>
                    </div>

                    {openFilters.price && (
                        <div className="space-y-4 px-2 pb-2">
                            <div className="flex items-center justify-between text-white">
                                <div className="flex items-center">
                                    <Icons.token className="h-4 w-4 mr-1" />
                                    <span className="text-[14px] xl:text-[16px]">{localPriceRange[0]}</span>
                                </div>
                                <div className="flex items-center">
                                    <Icons.token className="h-4 w-4 mr-1" />
                                    <span className="text-[14px] xl:text-[16px]">{localPriceRange[1]}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-white/70">
                                <span className="text-[14px] xl:text-[16px]">${(localPriceRange[0] / 1000).toFixed(2)}</span>
                                <span className="text-[14px] xl:text-[16px]">${(localPriceRange[1] / 1000).toFixed(2)}</span>
                            </div>

                            <div className="px-2 py-2">
                                <Slider
                                    range
                                    min={0}
                                    max={1000000}
                                    step={5}
                                    value={localPriceRange}
                                    onChange={handlePriceChange}
                                    className="custom-slider"
                                />
                            </div>  

                            <Button
                                onClick={applyPriceFilter}
                                className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 shadow-lg shadow-[var(--color-primary)]/10 font-medium py-4 xl:py-6 relative overflow-hidden group text-[14px] xl:text-[16px]"
                            >
                                <span className="relative z-10">Apply Filter</span>
                                <div className="absolute inset-0 bg-[var(--color-primary-50)] opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                                <div className="absolute -right-12 -top-12 w-24 h-24 bg-[var(--color-primary-100)]/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
                            </Button>
                        </div>
                    )}
                </div>

                {/* Catalogs Filter */}
                <div className="mb-6 border-t border-[#667085]/20 pt-6">
                    <div className="flex items-center justify-between mb-2">
                        <button
                            onClick={() => toggleFilter("catalogs")}
                            className="flex items-center justify-between w-full text-left"
                        >
                            <div className="flex items-center">
                                <div className="w-1 h-6 bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full mr-3"></div>
                                <h4 className="text-[16px] xl:text-lg font-semibold text-white">
                                    Catalogs
                                </h4>
                            </div>
                            <div className={`flex items-center justify-center h-7 w-7 rounded-full transition-all duration-300 ${!openFilters.catalogs ? "" : "bg-[var(--color-surface)]"}`}>
                                <Icons.chevronDown className={`h-6 w-6 transition-transform duration-300 ${openFilters.catalogs ? "rotate-180 text-white" : "text-white"}`} />
                            </div>
                        </button>
                    </div>

                    {openFilters.catalogs && (
                        <div className="space-y-3 max-h-[200px] my-4 overflow-y-auto pr-2 custom-scrollbar">
                            {trendingCatalogsLoading ? (
                                <div className="flex justify-center py-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--color-primary)]"></div>
                                </div>
                            ) : trendingCatalogs?.length > 0 ? (
                                trendingCatalogs.map((catalog: any, index: number) => (
                                    <div
                                        key={index}
                                        className={`flex items-center justify-between group hover:bg-[var(--color-surface)]/30 p-2 rounded-lg ${selectedCatalogs.includes(catalog.name) ? 'bg-[var(--color-primary)]/10' : ''}`}
                                    >
                                        <div className="flex items-center flex-1">
                                            <Checkbox
                                                id={`catalog-${index}`}
                                                className="border-[#667085]/50 rounded-sm data-[state=checked]:bg-[var(--color-primary)] data-[state=checked]:border-[var(--color-primary)]"
                                                checked={selectedCatalogs.includes(catalog.name)}
                                                onCheckedChange={() => handleCatalogToggle(catalog.name)}
                                            />
                                            <div className="ml-3 flex flex-col">
                                                <label
                                                    htmlFor={`catalog-${index}`}
                                                    className={`text-sm font-medium ${selectedCatalogs.includes(catalog.name) ? 'text-[var(--color-primary)]' : 'text-white group-hover:text-[var(--color-primary)]'} transition-colors cursor-pointer`}
                                                >
                                                    {catalog.name}
                                                </label>
                                                <span className="text-xs text-[#667085] mt-0.5">
                                                    {catalog.productcount || 0} products
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-400 py-2">
                                    No catalogs available
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Color Filter */}
                {/* <div className="mb-6 border-t border-[#667085]/20 pt-6">
                    <div className="flex items-center justify-between mb-2">
                        <button
                            onClick={() => toggleFilter("colors")}
                            className="flex items-center justify-between w-full text-left"
                        >
                            <div className="flex items-center">
                                <div className="w-1 h-6 bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full mr-3"></div>
                                <h4 className="text-[16px] xl:text-lg font-semibold text-white">
                                    Colors
                                </h4>
                            </div>
                            <div className={`flex items-center justify-center h-7 w-7 rounded-full transition-all duration-300 ${!openFilters.colors ? "" : "bg-[var(--color-surface)]"}`}>
                                <Icons.chevronDown className={`h-6 w-6 transition-transform duration-300 ${openFilters.colors ? "rotate-180 text-white" : "text-white"}`} />
                            </div>
                        </button>
                    </div>

                    {openFilters.colors && (
                        <div className="space-y-4">
                            <div className="space-y-3">
                                {PRODUCT_COLORS.map((color, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between group hover:bg-[var(--color-surface)]/30 p-2 rounded-lg"
                                    >
                                        <div className="flex items-center flex-1">
                                            <Checkbox
                                                id={`color-${index}`}
                                                className="border-[#667085]/50 rounded-sm data-[state=checked]:bg-[var(--color-primary)] data-[state=checked]:border-[var(--color-primary)]"
                                                checked={selectedColors.includes(color.name)}
                                                onCheckedChange={() => handleColorToggle(color.name)}
                                            />
                                            <div className="ml-3 flex items-center">
                                                <div
                                                    className="w-4 h-4 rounded-full mr-2 border border-[#667085]/30"
                                                    style={{ backgroundColor: color.value }}
                                                />
                                                <label
                                                    htmlFor={`color-${index}`}
                                                    className="text-sm font-medium text-white group-hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                                                >
                                                    {color.name}
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div> */}

                {/* Size Filter */}
                {/* <div className="mb-6 border-t border-[#667085]/20 pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => toggleFilter("sizes")}
                            className="flex items-center justify-between w-full text-left"
                        >
                            <div className="flex items-center">
                                <div className="w-1 h-6 bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full mr-3"></div>
                                <h4 className="text-[16px] xl:text-lg font-semibold text-white">Size</h4>
                            </div>
                            <div className={`flex items-center justify-center h-7 w-7 rounded-full transition-all duration-300 ${!openFilters.sizes ? "" : "bg-[var(--color-surface)]"}`}>
                                <Icons.chevronDown className={`h-6 w-6 transition-transform duration-300 ${openFilters.sizes ? "rotate-180 text-white" : "text-white"}`} />
                            </div>
                        </button>
                    </div>

                    {openFilters.sizes && (
                        <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                            {PRODUCT_SIZES.map((size, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between group hover:bg-[var(--color-surface)]/30 p-2 rounded-lg"
                                >
                                    <div className="flex items-center flex-1">
                                        <Checkbox
                                            id={`size-${index}`}
                                            className="border-[#667085]/50 rounded-sm data-[state=checked]:bg-[var(--color-primary)] data-[state=checked]:border-[var(--color-primary)]"
                                            checked={selectedSizes.includes(size.name)}
                                            onCheckedChange={() => handleSizeToggle(size.name)}
                                        />
                                        <div className="ml-3 flex flex-col">
                                            <label
                                                htmlFor={`size-${index}`}
                                                className="text-sm font-medium text-white group-hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                                            >
                                                {size.name}
                                            </label>
                                            <span className="text-xs text-[#667085] mt-0.5">
                                                {size.value}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div> */}

                {/* Reset Filters Button */}
                {hasActiveFilters() && (
                    <Button
                        onClick={handleResetFilters}
                        className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-[var(--color-primary)]/20 hover:shadow-xl mt-6"
                    >
                        <Icons.refreshCw className="w-4 h-4 mr-2" />
                        Reset Filters
                    </Button>
                )}
            </motion.div>

            {/* Custom styles */}
            <style jsx global>{`
                ${filterStyles}
                
                .custom-slider .rc-slider-handle {
                    width: 15px !important;
                    height: 15px !important;
                    background-color: var(--color-primary) !important;
                    border: 2px solid var(--color-primary) !important;
                    box-shadow: 0 0 0 2px rgba(2, 167, 253, 0.2) !important;
                    opacity: 1 !important;
                    cursor: pointer !important;
                    position: absolute !important;
                    transform: none !important;
                    transition: box-shadow 0.2s ease !important;
                }

                .custom-slider .rc-slider-handle:hover {
                    box-shadow: 0 0 0 3px rgba(2, 167, 253, 0.3) !important;
                }

                .custom-slider .rc-slider-handle:active {
                    box-shadow: 0 0 0 2px rgba(2, 167, 253, 0.2) !important;
                }

                .custom-slider .rc-slider-track {
                    background-color: var(--color-primary) !important;
                }

                .custom-slider .rc-slider-rail {
                    background-color: rgba(102, 112, 133, 0.2) !important;
                }
            `}</style>
        </div>
    );
};

export default Filter;