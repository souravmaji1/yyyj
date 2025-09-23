import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/src/store';
import { updateFilter } from '@/src/store/slices/productFilter.slice';
import { Product } from "../../store/slices/productSlice";

const ITEMS_PER_PAGE_OPTIONS = [12, 24, 36, 48] as const;

const SORT_OPTIONS = [
    { value: 'default', label: 'Default Sorting' },
    { value: 'newest', label: 'Newest Arrivals' },
    // { value: 'best-selling', label: 'Best Selling' },
    // { value: 'featured', label: 'Featured Items' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    // { value: 'rating', label: 'Customer Rating' },
    // { value: 'popularity', label: 'Most Popular' },
] as const;

const SelectChevron = memo(() => (
    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <ChevronDown className="text-white" size={16} />
    </div>
));

interface PaginationInfo {
    currentPage: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
}

interface SellerProps {
    products: Product[];
    pagination: PaginationInfo;
    isLoading: boolean;
}

const Seller: React.FC<SellerProps> = ({ products, pagination, isLoading }) => {
    const dispatch = useDispatch();
    const { itemsPerPage, sortOption, currentPage, view } = useSelector((state: RootState) => state.productFilter);

    const baseSelectStyles = "focus-visible:outline-none text-[14px] cursor-pointer appearance-none bg-[var(--color-primary-50)] border border-[var(--color-primary-600)]/30 rounded-xl py-1.5 text-[var(--color-primary-700)] focus:border-[var(--color-primary)] transition-colors";

    const handleItemsPerPageChange = (value: string) => {
        dispatch(updateFilter({ key: 'itemsPerPage', value }));
        dispatch(updateFilter({ key: 'currentPage', value: 1 }));
    };

    const handleSortOptionChange = (value: string) => {
        dispatch(updateFilter({ key: 'sortOption', value }));
        dispatch(updateFilter({ key: 'currentPage', value: 1 }));
    };

    const startItem = (currentPage - 1) * Number(itemsPerPage) + 1;
    const endItem = Math.min(currentPage * Number(itemsPerPage), 1000);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-[var(--color-surface)]/50 backdrop-blur-sm p-3 rounded-2xl border border-[#667085]/30 mb-8 flex flex-wrap gap-6 items-center justify-between"
        >
            <div className="flex items-center gap-3 flex-wrap">
                <p className="text-white">
                    {startItem}-{endItem}
                </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
                <div className="relative">
                    <select
                        value={itemsPerPage}
                        onChange={(e) => handleItemsPerPageChange(e.target.value)}
                        className={`${baseSelectStyles} w-32 xl:w-32 px-3`}
                    >
                        {ITEMS_PER_PAGE_OPTIONS.map((num) => (
                            <option
                                key={num}
                                value={num}
                                className="bg-[var(--color-surface)]"
                            >
                                Show {num}
                            </option>
                        ))}
                    </select>
                    <SelectChevron />
                </div>

                <div className="relative">
                    <select
                        className={`${baseSelectStyles} w-48 px-4`}
                        value={sortOption}
                        onChange={(e) => handleSortOptionChange(e.target.value)}
                    >
                        {SORT_OPTIONS.map(({ value, label }) => (
                            <option
                                key={value}
                                value={value}
                                className="bg-[var(--color-surface)]"
                            >
                                {label}
                            </option>
                        ))}
                    </select>
                    <SelectChevron />
                </div>
            </div>
        </motion.div>
    );
};

Seller.displayName = 'Seller';

export default Seller;  