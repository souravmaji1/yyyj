import { DUMMY_IMAGES } from "@/src/constants";
import Image from "next/image";
import { Icons } from "@/src/core/icons";

const MediaDisplay = ({ mediaItem }: { mediaItem: any }) => {
    if (!mediaItem || !mediaItem.media_type) return null;
    if (mediaItem.media_type === "video") {
        return (
            <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-700">
                <video
                    src={mediaItem.src}
                    controls
                    className="w-full h-full object-cover"
                    poster={mediaItem.preview_image}
                    playsInline
                >
                    Your browser does not support the video tag.
                </video>
                {mediaItem.isTrial && (
                    <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded flex items-center">
                        <Icons.sparkles className="w-3 h-3 mr-1" />
                        Try It Out
                    </div>
                )}
            </div>
        );
    }
    return (
        <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-700">
            <Image
                src={mediaItem.src || DUMMY_IMAGES}
                alt={mediaItem.metadata?.alt || "Product image"}
                fill
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 40vw, 33vw"
                className="object-contain"
            />
            {mediaItem.isTrial && (
                <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded flex items-center">
                    <Icons.sparkles className="w-3 h-3 mr-1" />
                    Try It Out
                </div>
            )}
        </div>
    );
}

export default MediaDisplay;