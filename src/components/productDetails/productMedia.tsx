import { AnimatePresence, motion } from "framer-motion";

import MediaDisplay from "./mediaDisaplay";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DUMMY_IMAGES } from "@/src/constants";
import { Icons } from "@/src/core/icons";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Product } from "@/src/store/slices/productSlice";

const PrevArrow = (props: any) => {
    const { className, style, onClick } = props;
    return (
        <div
            className={`${className} absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9 !bg-gray-500 hover:bg-black/70 rounded-full cursor-pointer transition-all duration-200`}
            style={{ ...style, display: 'flex', left: '-12px' }}
            onClick={onClick}
        >
            <ChevronLeft size={18} className="text-white" />
        </div>
    );
};

const NextArrow = (props: any) => {
    const { className, style, onClick } = props;
    return (
        <div
            className={`${className} absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9 !bg-gray-500 hover:bg-black/70 rounded-full cursor-pointer transition-all duration-200`}
            style={{ ...style, display: 'flex', right: '-12px' }}
            onClick={onClick}
        >
            <ChevronRight size={18} className="text-white" />
        </div>
    );
};

const sliderSettings = {
    dots: false,
    arrows: true,
    infinite: true,
    speed: 300,
    slidesToShow: 5,
    slidesToScroll: 5,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    responsive: [
        {
            breakpoint: 1024,
            settings: {
                slidesToShow: 4,
            },
        },
        {
            breakpoint: 768,
            settings: {
                slidesToShow: 3,
            },
        },
        {
            breakpoint: 480,
            settings: {
                slidesToShow: 2,
            },
        },
    ],
};


const ProductMedia = ({ selectedImage, product, setSelectedImage }: { selectedImage: number, product: Product, setSelectedImage: (index: number) => void }) => {



    return (
        <div className="lg:w-2/5 p-4">
            <AnimatePresence mode="wait">
                <motion.div key={selectedImage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }} className="mb-4">
                    <MediaDisplay mediaItem={product.media[selectedImage]} />
                </motion.div>
            </AnimatePresence>
            <div className="slider-custom">
                {product.media.length > 1 && (
                    <Slider {...sliderSettings} className="mb-4">
                        {product.media.map((mediaItem, index) => (
                            <motion.button key={mediaItem.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() =>
                                setSelectedImage(index)}
                                className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all duration-200 mx-1
                                         ${selectedImage === index
                                        ? "border-[var(--color-primary)] shadow-[var(--color-primary)]/20 shadow-sm"
                                        : "border-gray-700 hover:border-[var(--color-primary)]/50"
                                    }`}
                            >
                                {mediaItem.media_type === "video" ? (
                                    <>
                                        <video
                                            src={mediaItem.src}
                                            className="w-full h-full object-cover"
                                            muted
                                            loop
                                            playsInline
                                        >
                                            Your browser does not support the video tag.
                                        </video>
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                            <Icons.play className="w-4 h-4 text-white" />
                                        </div>
                                        {mediaItem.isTrial && (
                                            <div className="absolute top-1 right-1 bg-orange-500 text-white text-xs px-1 py-0.5 rounded flex items-center">
                                                <Icons.sparkles className="w-2 h-2 mr-1" />
                                                Try
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <Image src={mediaItem.src || DUMMY_IMAGES} alt={mediaItem.metadata?.alt || `Product image ${index +
                                            1}`} fill sizes="(max-width: 768px) 20vw, 10vw" className="object-cover" />
                                        {mediaItem.isTrial && (
                                            <div className="absolute top-1 right-1 bg-orange-500 text-white text-xs px-1 py-0.5 rounded flex items-center">
                                                <Icons.sparkles className="w-2 h-2 mr-1" />
                                                Try
                                            </div>
                                        )}
                                    </>
                                )}
                            </motion.button>
                        ))}
                    </Slider>
                )}
            </div>
        </div>
    )
}

export default ProductMedia;