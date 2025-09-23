"use client"

import ProductDetails from "@/src/components/productDetails";
import { useParams } from 'next/navigation';

export default function ProductDetailsPage() {
    const params = useParams();
    const productId = params?.id;
    
    if (!productId) {
        return <div>Product not found</div>;
    }
    
    return <ProductDetails productId={Number(productId)} />;
}