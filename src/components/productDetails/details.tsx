import { Product } from "@/src/store/slices/productSlice";
import { ProductVariant } from ".";
import { Badge } from "../ui/badge";
import { useState, useMemo, memo, useEffect } from "react";
import { Icons } from "@/src/core/icons";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductReviews, createReview, deleteReview } from "@/src/store/slices/reviewSlice";
import { fetchUserProfile } from "@/src/store/slices/userSlice";
import { RootState } from "@/src/store";
import { useNotificationUtils } from '@/src/core/utils/notificationUtils';
import { X } from 'lucide-react';

import type { Review } from '@/src/store/slices/reviewSlice';

// Types
type Tab = "description" | "specifications" | "shipping" | "reviews";

interface DetailsProps {
    product: Product;
    selectedVariant: ProductVariant;
}

// Memoized Components
const ProductInfo = memo(({ product, selectedVariant }: DetailsProps) => (
    <div className="space-y-3 bg-[var(--color-surface)] grid grid-cols-1 p-8 border border-gray-700 align-right" style={{ marginLeft: "auto" }}>
        <h3 className="text-sm font-medium text-white mb-2">Product Details</h3>

        {selectedVariant.sku && (
            <InfoRow label="SKU" value={selectedVariant.sku} />
        )}

        {product.productType && (
            <InfoRow label="Catalog" value={product.productType} />
        )}

        {product.tagName && (
            <div className="flex items-start text-sm">
                <span className="text-gray-400 w-24">Tags:</span>
                <div className="flex flex-wrap gap-1">
                    {product.tagName.split(",").map((tag, index) => (
                        <Badge
                            key={index}
                            variant="outline"
                            className="border-gray-700 text-gray-300 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] cursor-pointer"
                        >
                            {tag.trim()}
                        </Badge>
                    ))}
                </div>
            </div>
        )}

        {product.vendor && (
            <div className="flex items-center text-sm mt-2 bg-[var(--color-surface)] rounded-lg px-3 py-2 shadow border border-[var(--color-primary)]/20 max-w-fit">
                <span className="text-gray-400 w-24">Vendor:</span>
                <span className="text-gray-300 font-semibold">{product.vendor}</span>
            </div>
        )}
    </div>
));

const InfoRow = memo(({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center text-sm">
        <span className="text-gray-400 w-24">{label}:</span>
        <span className="text-gray-300">{value}</span>
    </div>
));

const TabButton = memo(({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`px-5 py-4 text-sm font-medium transition-colors whitespace-nowrap ${isActive
            ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]"
            : "text-gray-300 hover:text-white"
            }`}
    >
        {label}
    </button>
));

const SpecificationsTab = memo(({ product, selectedVariant }: DetailsProps) => (
    <div>
        <h3 className="text-xl font-bold text-white mb-4">Technical Specifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SpecificationSection
                title="General"
                specs={[
                    { label: "Brand", value: product.vendor },
                    { label: "Model", value: selectedVariant.sku },
                    { label: "Type", value: product.productType },
                    { label: "Material", value: product.material },
                    { label: "Origin", value: product.originCountry },
                    { label: "Manufacturer", value: product.manufacturerAddress },
                    { label: "Gender", value: product.productFor },
                    { label: "Age Restriction", value: product.ageRestriction ? "Yes" : "No" }
                ]}
            />
            <SpecificationSection
                title="Dimensions & Details"
                specs={[
                    { label: "Measurement", value: selectedVariant.measurement || 'N/A' },
                    { label: "Measurement Type", value: selectedVariant.measurementType || 'N/A' },
                    { label: "Product Format", value: product.productFormat || 'N/A' },
                    { label: "Expiry Date", value: product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : 'N/A' }
                ]}
            />
        </div>
    </div>
));

const SpecificationSection = memo(({ title, specs }: {
    title: string;
    specs: Array<{ label: string; value: string | null | undefined }>
}) => (
    <div className="bg-[var(--color-surface)] rounded-lg p-4 border border-gray-700">
        <h4 className="text-lg font-medium text-white mb-3">{title}</h4>
        <table className="w-full text-sm">
            <tbody>
                {specs.map((spec, index) => (
                    <tr key={index} className={index < specs.length - 1 ? "border-b border-gray-700" : ""}>
                        <td className="py-2 text-gray-400">{spec.label}</td>
                        <td className="py-2 text-gray-300">{spec.value || "N/A"}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
));

const ShippingTab = memo(() => (
    <div>
        <h3 className="text-xl font-bold text-white mb-4">Shipping Information</h3>
        <div className="bg-[var(--color-surface)] rounded-lg p-4 border border-gray-700 mb-4">
            <h4 className="text-lg font-medium text-white mb-3">Delivery Options</h4>
            <p className="text-gray-300 mb-4">
                We offer fast and reliable shipping to ensure you receive your products as quickly as possible.
            </p>
            <div className="space-y-3">
                <ShippingOption
                    icon={<Icons.truck className="w-5 h-5 text-[var(--color-primary)] mt-0.5 mr-3" />}
                    title="Standard Shipping"
                    description="3-5 business days"
                />
                <ShippingOption
                    icon={<Icons.zap className="w-5 h-5 text-[var(--color-primary)] mt-0.5 mr-3" />}
                    title="Express Shipping"
                    description="1-2 business days"
                />
            </div>
        </div>

        <div className="bg-[var(--color-surface)] rounded-lg p-4 border border-gray-700">
            <h4 className="text-lg font-medium text-white mb-3">Returns & Warranty</h4>
            <p className="text-gray-300 mb-4">
                We want you to be completely satisfied with your purchase.
            </p>
            <div className="space-y-3">
                <ShippingOption
                    icon={<Icons.refreshCcw className="w-5 h-5 text-[var(--color-primary)] mt-0.5 mr-3" />}
                    title="30-Day Returns"
                    description="Return for any reason within 30 days"
                />
                <ShippingOption
                    icon={<Icons.shield className="w-5 h-5 text-[var(--color-primary)] mt-0.5 mr-3" />}
                    title="Warranty"
                    description="1 year manufacturer warranty included"
                />
            </div>
        </div>
    </div>
));

const ShippingOption = memo(({ icon, title, description }: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) => (
    <div className="flex items-start">
        {icon}
        <div>
            <h5 className="text-white font-medium">{title}</h5>
            <p className="text-gray-400 text-sm">{description}</p>
        </div>
    </div>
));

const ReviewsTab = memo(({ product }: { product: Product }) => {
    const dispatch = useDispatch();
    const { productReviews, loading, error } = useSelector((state: RootState) => state.reviews);
    const currentUser = useSelector((state: RootState) => state.user.profile);

    useEffect(() => {
        if (product?.id) {
            dispatch(fetchProductReviews(String(product.id)) as any);
        }
    }, [dispatch, product?.id]);

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Customer Reviews</h3>
            </div>

            {loading && (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
                    <span className="ml-2 text-gray-300">Loading reviews...</span>
                </div>
            )}

            {error ? (
                <div className="text-red-400 py-8">{error}</div>
            ) : !loading && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                    <ReviewStats reviews={productReviews} />
                    <ReviewList reviews={productReviews} currentUser={currentUser} />
                </div>
            )}
        </div>
    );
});

const ReviewStats = memo(({ reviews }: { reviews: Review[] }) => {
    const safeReviews = Array.isArray(reviews) ? reviews : [];
    // Calculate average rating
    const avgRating = safeReviews.length
        ? (safeReviews.reduce((sum, r) => sum + r.rating, 0) / safeReviews.length).toFixed(1)
        : '0.0';
    // Calculate rating distribution
    const ratingCounts = [5, 4, 3, 2, 1].map(rating =>
        safeReviews.filter(r => r.rating === rating).length
    );
    const total = safeReviews.length || 1;
    return (
        <div className="bg-[var(--color-surface)] rounded-lg p-4 border border-gray-700 lg:col-span-1">
            <div className="text-center">
                <div className="text-4xl font-bold text-white mb-1">{avgRating}</div>
                <div className="flex justify-center mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Icons.star
                            key={star}
                            className={`w-5 h-5 ${star <= Math.round(Number(avgRating)) ? "text-yellow-400 fill-current" : "text-gray-600"}`}
                        />
                    ))}
                </div>
                <p className="text-gray-400 text-sm">Based on {safeReviews.length} reviews</p>
            </div>
            <div className="mt-4 space-y-2">
                {[5, 4, 3, 2, 1].map((rating, i) => (
                    <RatingBar
                        key={rating}
                        rating={rating}
                        percentage={Math.round(((ratingCounts[i] || 0) / total) * 100)}
                    />
                ))}
            </div>
        </div>
    );
});

const RatingBar = memo(({ rating, percentage }: { rating: number; percentage: number }) => (
    <div className="flex items-center">
        <div className="text-gray-400 text-sm w-8">{rating} ★</div>
        <div className="flex-1 mx-2 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
                className="h-full bg-yellow-400 rounded-full"
                style={{ width: `${percentage}%` }}
            />
        </div>
        <div className="text-gray-400 text-sm w-8">{percentage}%</div>
    </div>
));

const ReviewList = memo(({ reviews, currentUser }: { reviews: Review[], currentUser: any }) => {
    const safeReviews = Array.isArray(reviews) ? reviews : [];
    return (
        <div className="lg:col-span-3">
            {safeReviews.length === 0 ? (
                <div className="text-gray-400 py-8">No reviews yet.</div>
            ) : (
                <>
                    {safeReviews.map((review) => (
                        <ReviewItem key={review.id} review={review} currentUser={currentUser} />
                    ))}
                    <Button
                        variant="outline"
                        className="w-1/4 flex flex-col justify-end items-center mx-auto mt-4 border-gray-700 text-gray-300 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white"
                    >
                        Load More
                    </Button>
                </>
            )}
        </div>
    );
});

const ReviewItem: React.FC<{ review: Review, currentUser: any }> = memo(({ review, currentUser }) => {
    const dispatch = useDispatch();
    const { loading } = useSelector((state: RootState) => state.reviews);
    const [deleting, setDeleting] = useState(false);
    
    let displayName = review.user?.name || 'Anonymous';
    let avatarUrl = review.user?.avatarUrl;
    if (currentUser && review.user?.id && review.user.id === currentUser.id) {
        displayName = currentUser.firstName || currentUser.userName || currentUser.email || 'Anonymous';
        avatarUrl = currentUser.profilePicture;
    }
    // Countdown logic
    const [remaining, setRemaining] = useState<number>(0);
    useEffect(() => {
        if (!currentUser || review.user?.id !== currentUser.id) {
            return;
        }

        const update = () => {
            const diff = 15 * 60 * 1000 - (Date.now() - new Date(review.createdAt).getTime());
            setRemaining(diff > 0 ? diff : 0);
        };
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [review.createdAt, currentUser, review.user?.id]);
    const canDelete = currentUser && review.user?.id === currentUser.id && remaining > 0;
    const handleDelete = async () => {
        if (deleting) return;
        setDeleting(true);
        try {
            await dispatch(deleteReview(review.id) as any);
        } catch (error) {
            console.error('Failed to delete review:', error);
        } finally {
            setDeleting(false);
        }
    };
    return (
        <div className="mb-6 pb-6 border-b border-gray-700 last:border-0 last:mb-0 last:pb-0">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={displayName} className="w-10 h-10 rounded-full object-cover mr-3" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white font-bold mr-3">
                            {displayName[0]}
                        </div>
                    )}
                    <div>
                        <div className="text-white font-medium">
                            {displayName}
                        </div>
                        <div className="text-gray-400 text-xs">Verified Purchase</div>
                    </div>
                </div>
                <div className="text-gray-400 text-sm">{new Date(review.createdAt).toLocaleDateString()}</div>
            </div>

            <div className="mb-2">
                <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Icons.star
                            key={star}
                            className={`w-4 h-4 ${star <= review.rating ? "text-yellow-400 fill-current" : "text-gray-600"}`}
                        />
                    ))}
                </div>
            </div>

            <p className="text-sm text-gray-300 mb-3">{review.text}</p>

            {review.media && review.media.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-2">
                    {review.media.map((m) => (
                        m.mediaType === 'image' ? (
                            <img key={m.id} src={m.mediaUrl} alt="review media" className="w-20 h-20 object-cover rounded-md border border-gray-700" />
                        ) : (
                            <video key={m.id} src={m.mediaUrl} controls className="w-28 h-20 rounded-md border border-gray-700 bg-black" />
                        )
                    ))}
                </div>
            )}
            {/* Delete/Lock logic */}
            {canDelete ? (
                <div className="flex items-center gap-2 mt-2">
                    <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handleDelete} 
                        className="text-rose-400 border-rose-400"
                        disabled={deleting}
                    >
                        {deleting ? (
                            <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-rose-400 mr-1"></div>
                                Deleting...
                            </>
                        ) : (
                            'Delete'
                        )}
                    </Button>
                    <span className="text-xs text-gray-400">
                        {`Delete available for ${Math.floor(remaining / 60000)}:${String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0')}`}
                    </span>
                </div>
            ) : (
                review.user?.id === currentUser?.id && (
                    <span className="text-xs text-gray-500 ml-2 flex items-center gap-1">   
                        <Icons.lock className="w-3 h-3" /> Review locked
                    </span>
                )
            )}
        </div>
    );
});

const ReviewModal = ({ open, onClose, productId, orderId, onSuccess }: { open: boolean, onClose: () => void, productId: number, orderId: string, onSuccess: () => void }) => {
    const dispatch = useDispatch();
    const { showSuccess, showError } = useNotificationUtils();
    const [rating, setRating] = useState(0);
    const [text, setText] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [videos, setVideos] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [imageInputKey, setImageInputKey] = useState(0);
    const [videoInputKey, setVideoInputKey] = useState(0);

    // File size and count constants
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
    const MAX_VIDEO_SIZE = 25 * 1024 * 1024; // 25MB
    const MAX_IMAGE_COUNT = 5;
    const MAX_VIDEO_COUNT = 2;

    // Reset form and previews when modal opens/closes
    useEffect(() => {
        if (!open) {
            setRating(0);
            setText('');
            setImages([]);
            setVideos([]);
            setImagePreviews([]);
            setVideoPreviews([]);
            setError('');
            setSubmitting(false);
            setImageInputKey(prev => prev + 1);
            setVideoInputKey(prev => prev + 1);
        }
    }, [open]);

    const validateAndFilterFiles = (files: File[], maxSize: number, maxCount: number, currentCount: number, fileType: 'image' | 'video') => {
        const validFiles: File[] = [];
        const rejectedFiles: string[] = [];

        // Check if adding these files would exceed the count limit
        if (currentCount + files.length > maxCount) {
            const remainingSlots = maxCount - currentCount;
            if (remainingSlots <= 0) {
                showError(
                    'File Count Exceeded', 
                    `Maximum ${maxCount} ${fileType}s allowed. Please remove some existing ${fileType}s first.`
                );
                return validFiles;
            } else {
                showError(
                    'File Count Exceeded', 
                    `You can only add ${remainingSlots} more ${fileType}(s). Maximum ${maxCount} ${fileType}s allowed.`
                );
                // Only take the files that fit within the limit
                files = files.slice(0, remainingSlots);
            }
        }

        files.forEach(file => {
            if (file.size > maxSize) {
                rejectedFiles.push(`${file.name} (${formatFileSize(file.size)})`);
            } else {
                validFiles.push(file);
            }
        });

        if (rejectedFiles.length > 0) {
            const maxSizeMB = maxSize / (1024 * 1024);
            showError(
                'File Size Exceeded', 
                `The following files exceed the ${maxSizeMB}MB limit:\n${rejectedFiles.join('\n')}`
            );
        }

        return validFiles;
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const validFiles = validateAndFilterFiles(files, MAX_IMAGE_SIZE, MAX_IMAGE_COUNT, images.length, 'image');
            
            if (validFiles.length > 0) {
                // Append new files to existing ones instead of replacing
                setImages(prev => [...prev, ...validFiles]);
                setImagePreviews(prev => [...prev, ...validFiles.map(file => URL.createObjectURL(file))]);
            }
            // Clear the input value to reset the file name display
            e.target.value = '';
        }
    };
    
    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const validFiles = validateAndFilterFiles(files, MAX_VIDEO_SIZE, MAX_VIDEO_COUNT, videos.length, 'video');
            
            if (validFiles.length > 0) {
                // Append new files to existing ones instead of replacing
                setVideos(prev => [...prev, ...validFiles]);
                setVideoPreviews(prev => [...prev, ...validFiles.map(file => URL.createObjectURL(file))]);
            }
            // Clear the input value to reset the file name display
            e.target.value = '';
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => {
            const newPreviews = prev.filter((_, i) => i !== index);
            // Revoke the object URL to prevent memory leaks
            if (prev[index]) {
                URL.revokeObjectURL(prev[index]);
            }
            return newPreviews;
        });
        // Reset the file input to clear the file name
        setImageInputKey(prev => prev + 1);
    };

    const removeVideo = (index: number) => {
        setVideos(prev => prev.filter((_, i) => i !== index));
        setVideoPreviews(prev => {
            const newPreviews = prev.filter((_, i) => i !== index);
            // Revoke the object URL to prevent memory leaks
            if (prev[index]) {
                URL.revokeObjectURL(prev[index]);
            }
            return newPreviews;
        });
        // Reset the file input to clear the file name
        setVideoInputKey(prev => prev + 1);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return; // Prevent multiple submissions
        setSubmitting(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('productId', String(productId));
            formData.append('orderId', String(orderId));
            formData.append('rating', String(rating));
            formData.append('content', text);
            images.forEach(file => formData.append('files', file));
            videos.forEach(file => formData.append('files', file));

            const result = await dispatch(createReview(formData) as any);
            // Check if the action was rejected
            if (createReview.rejected.match(result)) {
                const errorPayload = result.payload as string;
                throw new Error(errorPayload || 'Failed to submit review');
            }
            showSuccess('Review Submitted', 'Your review has been posted successfully!');
            onSuccess();
            onClose();
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to submit review. Please try again.';
            setError(errorMessage);
            showError('Review Submission Failed', errorMessage);
            onClose();
        } finally {
            setSubmitting(false);
        }
    };

    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-[#232946] rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto relative mx-2 sm:mx-0">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose} 
                    className="absolute top-2 right-2 text-white font-bold hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                    disabled={submitting}
                >
                    <Icons.x className="h-5 w-5" />
                </Button>
                <h2 className="text-xl font-bold text-white mb-4">Write a Review</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-300 mb-1">Your Rating</label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(star => (
                                <span 
                                    key={star} 
                                    onClick={() => !submitting && setRating(star)} 
                                    className={`cursor-pointer text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-600'} ${submitting ? 'pointer-events-none' : ''}`}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-300 mb-1">Your Review</label>
                        <textarea 
                            className="w-full rounded bg-gray-800 text-white p-2" 
                            rows={4} 
                            value={text} 
                            onChange={e => setText(e.target.value)} 
                            required 
                            disabled={submitting}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-300 mb-1">
                            Upload Images (Max 5 images, 10MB each) 
                            <span className="text-gray-500 text-xs ml-2">
                                {images.length}/{MAX_IMAGE_COUNT}
                            </span>
                        </label>
                        <div className="relative">
                            <input 
                                key={imageInputKey}
                                type="file" 
                                accept="image/*" 
                                multiple 
                                onChange={handleImageChange} 
                                className="hidden" 
                                disabled={submitting || images.length >= MAX_IMAGE_COUNT}
                                id="image-upload"
                            />
                            <label 
                                htmlFor="image-upload" 
                                className={`block w-full px-4 py-2 text-sm rounded cursor-pointer transition-colors duration-200 ${
                                    images.length >= MAX_IMAGE_COUNT 
                                        ? 'text-gray-500 bg-gray-900 border border-gray-600 cursor-not-allowed' 
                                        : 'text-gray-300 bg-gray-800 border border-gray-700 hover:bg-gray-700 hover:text-white'
                                }`}
                            >
                                {images.length >= MAX_IMAGE_COUNT ? 'Maximum images reached' : 'Choose Images'}
                            </label>
                        </div>
                        <div className="flex gap-2 mt-2 flex-wrap">
                            {imagePreviews.map((src, idx) => (
                                <div key={idx} className="relative">
                                    <img src={src} alt="preview" className="w-20 h-20 object-cover rounded-md border border-gray-700" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(idx)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                        disabled={submitting}
                                    >
                                        ×
                                    </button>
                                    <div className="text-xs text-gray-400 mt-1">
                                        {formatFileSize(images[idx]?.size || 0)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-300 mb-1">
                            Upload Videos (Max 2 videos, 25MB each)
                            <span className="text-gray-500 text-xs ml-2">
                                {videos.length}/{MAX_VIDEO_COUNT}
                            </span>
                        </label>
                        <div className="relative">
                            <input 
                                key={videoInputKey}
                                type="file" 
                                accept="video/*" 
                                multiple 
                                onChange={handleVideoChange} 
                                className="hidden" 
                                disabled={submitting || videos.length >= MAX_VIDEO_COUNT}
                                id="video-upload"
                            />
                            <label 
                                htmlFor="video-upload" 
                                className={`block w-full px-4 py-2 text-sm rounded cursor-pointer transition-colors duration-200 ${
                                    videos.length >= MAX_VIDEO_COUNT 
                                        ? 'text-gray-500 bg-gray-900 border border-gray-600 cursor-not-allowed' 
                                        : 'text-gray-300 bg-gray-800 border border-gray-700 hover:bg-gray-700 hover:text-white'
                                }`}
                            >
                                {videos.length >= MAX_VIDEO_COUNT ? 'Maximum videos reached' : 'Choose Videos'}
                            </label>
                        </div>
                        <div className="flex gap-2 mt-2 flex-wrap">
                            {videoPreviews.map((src, idx) => (
                                <div key={idx} className="relative">
                                    <video src={src} controls className="w-28 h-20 rounded-md border border-gray-700 bg-black" />
                                    <button
                                        type="button"
                                        onClick={() => removeVideo(idx)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                        disabled={submitting}
                                    >
                                        ×
                                    </button>
                                    <div className="text-xs text-gray-400 mt-1">
                                        {formatFileSize(videos[idx]?.size || 0)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {error && <div className="text-red-400 mb-2">{error}</div>}
                    <div className="flex justify-end gap-2">
                        <Button 
                            type="button" 
                            onClick={onClose} 
                            disabled={submitting}
                            className="border border-gray-700 text-white bg-gray-800 hover:bg-gray-700"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white" 
                            disabled={submitting || rating === 0 || !text}
                        >
                            {submitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Submitting...
                                </>
                            ) : (
                                'Submit Review'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Main Component
const Details = ({ product, selectedVariant }: DetailsProps) => {
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState<Tab>("description");
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewProductId, setReviewProductId] = useState<number | null>(null);
    const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);

    const tabs = useMemo(() => [
        { id: "description" as const, label: "Description" },
        { id: "specifications" as const, label: "Specifications" },
        { id: "shipping" as const, label: "Shipping" },
        { id: "reviews" as const, label: "Reviews" }
    ], []);

    const handleWriteReview = (productId: number, orderId: string) => {
        setReviewProductId(productId);
        setReviewOrderId(orderId);
        setReviewModalOpen(true);
    };

    const renderTabContent = useMemo(() => {
        switch (activeTab) {
            case "description":
                return (
                    <div className="mt-0 space-y-8">
                        {/* Product Description */}
                        {product.bodyHtml && (
                            <div className="bg-[var(--color-surface)] rounded-lg p-6 border border-gray-700">
                                <h4 className="text-lg font-medium text-white mb-4">Product Description</h4>
                                <div className="prose prose-invert max-w-none text-gray-300">
                                    <div dangerouslySetInnerHTML={{ __html: product.bodyHtml }} />
                                </div>
                            </div>
                        )}

                        {/* Key Features */}
                        {product.features && product.features.length > 0 && (
                            <div className="bg-[var(--color-surface)] rounded-lg p-6 border border-gray-700">
                                <h4 className="text-lg font-medium text-white mb-4">Key Features</h4>
                                <ul className="space-y-3 text-gray-300">
                                    {product.features.map((feature, index) => (
                                        <li key={index} className="flex items-start">
                                            <Icons.check className="w-5 h-5 text-[var(--color-primary)] mr-2 mt-0.5 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Additional Information */}
                        <div className="bg-[var(--color-surface)] rounded-lg p-6 border border-gray-700">
                            <h4 className="text-lg font-medium text-white mb-4">Additional Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {product.vendor && (
                                    <div className="flex items-center">
                                        <span className="text-gray-400 w-32">Brand:</span>
                                        <span className="text-gray-300">{product.vendor}</span>
                                    </div>
                                )}
                                {product.productType && (
                                    <div className="flex items-center">
                                        <span className="text-gray-400 w-32">Category:</span>
                                        <span className="text-gray-300">{product.productType}</span>
                                    </div>
                                )}
                                {product.material && (
                                    <div className="flex items-center">
                                        <span className="text-gray-400 w-32">Material:</span>
                                        <span className="text-gray-300">{product.material}</span>
                                    </div>
                                )}
                                {product.originCountry && (
                                    <div className="flex items-center">
                                        <span className="text-gray-400 w-32">Origin:</span>
                                        <span className="text-gray-300">{product.originCountry}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case "specifications":
                return <SpecificationsTab product={product} selectedVariant={selectedVariant} />;
            case "shipping":
                return <ShippingTab />;
            case "reviews":
                return <ReviewsTab product={product} />;
            default:
                return null;
        }
    }, [activeTab, product, selectedVariant]);

    return (
        <>
            <ProductInfo product={product} selectedVariant={selectedVariant} />

            <div className="flex border-b border-gray-700 overflow-x-auto">
                {tabs.map(tab => (
                    <TabButton
                        key={tab.id}
                        label={tab.label}
                        isActive={activeTab === tab.id}
                        onClick={() => setActiveTab(tab.id)}
                    />
                ))}
            </div>

            <div className="p-5">
                {renderTabContent}
            </div>

            <ReviewModal open={reviewModalOpen} onClose={() => setReviewModalOpen(false)} productId={reviewProductId!} orderId={reviewOrderId!} onSuccess={() => dispatch(fetchProductReviews(String(reviewProductId)) as any)} />
        </>
    );
};

export default memo(Details);
export { ReviewModal };