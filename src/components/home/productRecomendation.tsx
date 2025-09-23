'use client';

import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchCatalog } from "@/src/store/slices/catalog.Slice";
import { RootState, AppDispatch } from '@/src/store';
import { fetchProducts, fetchFeaturedProducts, Product, getProductsForKiosk } from "@/src/store/slices/productSlice";
import { Spinner } from "../ui/spinner";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import HomeProductCard from "../product/homeProductCard";
import { productType } from "@/src/constants";
import './responsive.mobile.css';
import { isKioskInterface } from "@/src/core/utils";

const ProductRecommendations = () => {

    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const [selectedCatalog, setSelectedCatalog] = useState<string | null>('all');

    const {
        items: products,
        loading,
        error: productsError,
        pagination,
        featuredPagination
    } = useSelector((state: RootState) => state.product);

    const { items: catalogs, loading: catalogsLoading } = useSelector((state: RootState) => state.catalog);


    const fetchCatalogData = (page: number, limit: number) => {

        const machineId = localStorage.getItem('machine_id');
        if (isKioskInterface()) {
            if (machineId) {
                dispatch(fetchCatalog({
                    page,
                    limit,
                    productType: productType.PHYSICAL,
                    machineId: machineId
                }));
            }
        } else {
            dispatch(fetchCatalog({
                page,
                limit,
                productType: productType.PHYSICAL,
                machineId: ''
            }));
        }
    };

    const fetchProductData = (page: number, limit: number, catalog?: string) => {
        const machineId = localStorage.getItem('machine_id');
        if (isKioskInterface()) {
            if (machineId) {
                dispatch(getProductsForKiosk({
                    page,
                    limit,
                    productType: productType.PHYSICAL,
                    machineId: machineId,
                    ...(catalog && catalog !== 'all' ? { catalogs: catalog } : {})
                })).then((result) => {
                    if (result.payload) {
                        setSelectedCatalog(catalog || 'all');
                    }
                });
            }

        } else {
            dispatch(fetchProducts({
                page,
                limit,
                productType: productType.PHYSICAL,
                ...(catalog && catalog !== 'all' ? { catalogs: catalog } : {})
            })).then((result) => {
                if (result.payload) {
                    setSelectedCatalog(catalog || 'all');
                }
            });
        }
    };

    const fetchFeatureProductData = (page: number, limit: number) => {
        dispatch(fetchFeaturedProducts({
            page,
            limit
        }));
    };

    useEffect(() => {
        fetchCatalogData(1, 5);
    }, []);

    useEffect(() => {
        fetchProductData(pagination.currentPage, 12, selectedCatalog || undefined);
    }, [dispatch, pagination.currentPage, pagination.pageSize, selectedCatalog]);

    useEffect(() => {
        // fetchFeatureProductData(featuredPagination.currentPage, featuredPagination.pageSize);
    }, [featuredPagination.currentPage, featuredPagination.pageSize]);

    const handleCatalogSelect = (catalogName: string) => {
        fetchProductData(1, pagination.pageSize, catalogName);
    };

    return (
        <section className=" py-10 bg-[url(/images/product-bg.png)] bg-no-repeat bg-center bg-cover overflow-x-hidden productrec-mobile-fix">

            <div className="container mx-auto px-4 relative">
                <img
                    src="/images/productright.png"
                    alt="product"
                    className="hidden 2xl:block  w-[80px] h-[150px] 2xl:w-[140px] 2xl:h-[240px] mb-4 object-cover absolute -right-36 top-0"
                />
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12 ">
                    <div className="lg:col-span-4">
                        <div className="flex flex-col items-center gap-4 mb-12">
                            <h3 className="text-2xl md:text-6xl font-semibold text-white relative inline-block whitespace-nowrap">
                                Trending Products
                            </h3>
                            <div className="flex gap-3 items-center justify-center mt-2 overflow-x-auto w-full scroll-hide flex-wrap sm:flex-nowrap">
                                <button
                                    onClick={() => handleCatalogSelect("all")}
                                    className={`px-4 py-2 text-base font-semibold rounded-lg whitespace-nowrap hover:!scale-100 capitalize h-10 ${selectedCatalog === "all"
                                        ? "bg-[var(--color-primary-700)] text-white shadow-lg "
                                        : "bg-[var(--color-surface)] hover:bg-transparent hover:!shadow-none hover:text-[var(--color-primary)]"
                                        } transition-all duration-200 flex items-center gap-2 text-white`}
                                >
                                    ALL PRODUCTS
                                </button>
                                {catalogsLoading ? (
                                    <div className="flex items-center justify-center py-2">
                                        <Spinner />
                                    </div>
                                ) : catalogs && catalogs.length > 0 ? (
                                    catalogs
                                        .filter((catalog: any) => catalog.name && catalog.name !== "all")
                                        .map((catalog: any, i: number) => (
                                            <button
                                                key={i}
                                                onClick={() => handleCatalogSelect(catalog.name)}
                                                className={`px-4 py-2 rounded-lg capitalize whitespace-nowrap text-base font-semibold ${selectedCatalog === catalog.name
                                                    ? "bg-[var(--color-primary-700)] text-white shadow-lg !transition-none"
                                                    : "bg-transparent hover:text-[var(--color-primary)] hover:!shadow-none"
                                                    } transition-all duration-200 flex items-center gap-2 text-white`}
                                            >
                                                {catalog.icon && <catalog.icon className="w-4 h-4" />}
                                                {catalog.name}
                                            </button>
                                        ))
                                ) : (
                                    <div className="text-gray-400">No categories available</div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {loading ? (
                                <div className="flex justify-center col-span-full text-center py-8">
                                    <Spinner />
                                </div>
                            ) : products?.length > 0 ? (
                                products.map((product: Product) => (
                                    <HomeProductCard
                                        key={product.id}
                                        product={product}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full text-center text-gray-400 py-8">
                                    No products found
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <img
                    src="/images/productleft.png"
                    alt="product"
                    className="hidden 2xl:block w-[90px] h-[170px] 2xl:w-[150px] 2xl:h-[260px] mb-4 object-cover absolute -left-32 -bottom-32"
                />
            </div>

        </section>
    );
};

export default ProductRecommendations;