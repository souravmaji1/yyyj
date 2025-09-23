'use client';

import { AppDispatch } from "@/src/store";
import { fetchTags } from "@/src/store/slices/tag.Slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from '@/src/store';
import { Spinner } from "../../ui/spinner";

const ViewCatalog = () => {

    const [selectedCategory, setSelectedCategory] = useState<string | null>('all');

    const { items: trendingCatalogs, loading: trendingCatalogsLoading } = useSelector((state: RootState) => state.catalog);



    return (
        <div className="flex gap-3 items-center justify-center mt-2 overflow-x-auto w-full scroll-hide">
            <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 text-base font-semibold rounded-lg whitespace-nowrap hover:!scale-100 capitalize h-10 ${selectedCategory === "all"
                    ? "bg-[var(--color-primary-700)] text-white shadow-lg "
                    : "bg-[var(--color-surface)] hover:bg-transparent hover:!shadow-none hover:text-[var(--color-primary)]"
                    } transition-all duration-200 flex items-center gap-2 text-white`}
            >
                ALL PRODUCTS
            </button>
            {trendingCatalogsLoading ? (
                <div className="flex items-center justify-center py-2">
                    <Spinner />
                </div>
            ) : (
                trendingCatalogs
                    .filter((trendingCatalog: any) => trendingCatalog.category !== "all")
                    .map((trendingCatalog: any, i: number) => (
                        <button
                            key={i}
                            onClick={() => {
                                console.log("Clicked tag:", trendingCatalog.name);
                                setSelectedCategory(trendingCatalog.name);
                            }}
                            className={`px-4 py-2 rounded-lg capitalize whitespace-nowrap text-base font-semibold ${selectedCategory === trendingCatalog.name
                                ? "bg-[var(--color-primary-700)] text-white shadow-lg !transition-none"
                                : "bg-transparent hover:text-[var(--color-primary)] hover:!shadow-none"
                                } transition-all duration-200 flex items-center gap-2 text-white`}
                        >
                            {trendingCatalog.icon && <trendingCatalog.icon className="w-4 h-4" />}
                            {trendingCatalog.name}
                        </button>
                    ))
            )}
        </div>
    )
}

export default ViewCatalog; 