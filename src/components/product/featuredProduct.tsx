import { Product } from "@/src/store/slices/productSlice";
import { Spinner } from "../ui/spinner";
import ProductCard from "./productCard";

const FeaturedProduct = ({ featuredProducts, featuredLoading, featuredError }: { featuredProducts: Product[], featuredLoading: boolean, featuredError: string }) => {
    return (
        <>
            <div className="text-center mb-12 border-t border-gray-700 pt-10">
                <h2 className="text-4xl font-bold mb-4 font-previous text-[var(--color-primary)]">
                    Featured Products
                </h2>
                <p className="text-[#667085] font-previous">
                    Enhance your gaming experience with premium gear. Use your earned
                    tokens for exclusive discounts.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {
                    featuredLoading ? (
                        <div className="flex justify-center items-center h-[300px]">
                            <Spinner />
                        </div>
                    ) : featuredError ? (
                        <div className="text-red-500 text-center p-4">
                            {featuredError}
                        </div>
                    ) : featuredProducts?.length > 0 ? (
                        featuredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                            />
                        ))
                    ) :
                        <div className="col-span-full text-center text-gray-400 py-8">
                            No Featured products found
                        </div>
                }
            </div>
        </>
    )
}

export default FeaturedProduct;