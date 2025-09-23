import { Icons } from "@/src/core/icons";
import { CatalogItem } from "@/src/store/slices/catalog.Slice";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface TrendingCatalogProps {
    catalog: CatalogItem;
    index: number;
}

const TrendingCatalog = ({ catalog, index }: TrendingCatalogProps) => {
    const [hoveredCatalog, setHoveredCatalog] = useState<string | null>(null);
    console.log(catalog)
    return (
        <>
            <div
                key={index}
                className="transition-all duration-300"
                onMouseEnter={() => setHoveredCatalog(catalog.name)}
                onMouseLeave={() => setHoveredCatalog(null)}
            >
                <Link
                    href={`/catalogs/${catalog.id}`}
                    className={`block relative overflow-hidden rounded-xl transition-all duration-300 ${hoveredCatalog === catalog.name
                        ? "scale-105 shadow-lg shadow-[var(--color-primary)]/20"
                        : ""
                        }`}
                >
                    <div
                        className={`absolute inset-0 bg-gradient-to-r ${'from-[var(--color-primary)] to-[var(--color-secondary)]'} opacity-80`}
                    ></div>
                    <div
                        className={`absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/40 to-[var(--color-secondary)]/40 opacity-0 transition-opacity duration-300 ${hoveredCatalog === catalog.name ? "opacity-100" : ""
                            }`}
                    ></div>

                    <div className="relative px-3 py-4 flex items-center">
                        <div className="w-16 h-16 rounded-lg bg-black/30 backdrop-blur-sm p-2 flex items-center justify-center mr-2 transition-transform duration-300 transform group-hover:scale-110 overflow-hidden">
                            <Image
                                src={catalog.thumbnail}
                                alt={catalog.name}
                                width={40}
                                height={40}
                                className="object-contain w-full h-full"
                            />
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1 mr-[10px]">
                                <h4 className="font-semibold text-white">
                                    {catalog.name}
                                </h4>
                                <span className="bg-black/30 backdrop-blur-sm text-white px-2 py-1 w-6 flex items-center justify-center h-6 rounded-full text-[10px] absolute right-1 top-1 ">
                                    {catalog.productcount || 0}
                                </span>
                            </div>
                            <p className="text-xs text-white/80">
                                {"Explore our collection"}
                            </p>
                        </div>
                    </div>

                    {/* Animated arrow that appears on hover */}
                    <div
                        className={`absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${hoveredCatalog === catalog.name
                            ? "opacity-100 translate-x-0"
                            : "opacity-0 -translate-x-4"
                            }`}
                    >
                        <Icons.arrowRight />
                    </div>
                </Link>
            </div>
        </>
    )
};

export default TrendingCatalog;