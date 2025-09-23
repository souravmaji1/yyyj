import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchUserProfile, fetchWalletBalance, updateProfilePicture } from '../../store/slices/userSlice';
import { Icons } from '@/src/core/icons';
import { ProfileTabs } from './profile-tabs';
import { WalletSidebar } from './wallet-sidebar';
import { KYCSection } from './kyc-section';
import { Button } from '@/src/components/ui/button';
import { useNotificationUtils } from '@/src/core/utils/notificationUtils';
import Image from 'next/image';
import { isKioskInterface } from '@/src/core/utils';
import './profile.mobile.css';
import Link from 'next/link';

const Profile = () => {
    // Get user from Redux store
    const user = useSelector((state: RootState) => state.user.profile);

    const dispatch = useDispatch<AppDispatch>();
    const { showSuccess, showError } = useNotificationUtils();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Fetch user profile on component mount
    useEffect(() => {
        if (user?.id) {
            dispatch(fetchUserProfile());
            dispatch(fetchWalletBalance(user?.id));
        }
    }, [dispatch, user?.id]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                showError('Invalid File', 'Please select an image file');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showError('File Too Large', 'Please select an image smaller than 5MB');
                return;
            }

            setSelectedImage(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageUpload = async () => {
        if (!selectedImage) {
            showError('No Image Selected', 'Please select an image to upload');
            return;
        }

        setIsUploadingImage(true);
        try {
            const result = await dispatch(updateProfilePicture(selectedImage)).unwrap();

            showSuccess('Success', result.message || 'Profile picture updated successfully');
            setSelectedImage(null);
            setImagePreview(null);

            // Refresh user data to get updated profile picture
            dispatch(fetchUserProfile());
        } catch (error: any) {
            showError('Upload Failed', error || 'An error occurred while uploading profile picture');
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleRemoveImage = async () => {
        setIsUploadingImage(true);
        try {
            // Show upcoming feature message
            showSuccess('Coming Soon', 'Profile picture removal feature will be available soon!');
        } catch (error: any) {
            showError('Feature Not Available', 'This feature is not yet implemented');
        } finally {
            setIsUploadingImage(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-surface)] profile-mobile-fix">

            {/* Profile Header */}
            <div className="relative bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-primary)] py-20 pb-10 profile-header">
                <div className="absolute inset-0 bg-[url('/gaming-pattern.svg')] opacity-10" />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 profile-header-content">
                        <div className='text-center'>
                            <div className="relative group">
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[var(--color-surface)] border-4 border-white/20 overflow-hidden shadow-xl profile-image-container">
                                    <Image
                                        src={imagePreview || user?.profilePicture || '/icons/users.svg'}
                                        alt={`${user?.firstName} ${user?.lastName}`}
                                        width={128}
                                        height={128}
                                        className="w-full h-full object-cover"
                                    />
                                    {isUploadingImage && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <Icons.spinner className="w-6 h-6 animate-spin text-white" />
                                        </div>
                                    )}
                                </div>

                                {/* Hidden file input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                />

                                {/* Camera overlay - center (only on hover) */}
                                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer">
                                    <Button
                                        onClick={() => fileInputRef.current?.click()}
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 bg-[var(--color-primary-50)]/30 hover:bg-[var(--color-primary-50)]/40 text-white"
                                        disabled={isUploadingImage}
                                    >
                                        <Icons.camera className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Trash overlay - bottom right (only when user has custom profile picture) */}
                                {user?.profilePicture && user.profilePicture !== '/icons/users.svg' && (
                                    <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center cursor-pointer">
                                        <Button
                                            onClick={handleRemoveImage}
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white"
                                            disabled={isUploadingImage}
                                        >
                                            <Icons.trash className="w-3 h-3" />
                                        </Button>
                                    </div>
                                )}

                                {/* Upload button when image is selected */}
                                {selectedImage && (
                                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                                        <Button
                                            onClick={handleImageUpload}
                                            disabled={isUploadingImage}
                                            size="sm"
                                            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white text-xs px-3 py-1 h-7"
                                        >
                                            {isUploadingImage && <Icons.spinner className="w-3 h-3 mr-1 animate-spin" />}
                                            {isUploadingImage ? 'Uploading' : 'Upload'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="text-center md:text-left">
                            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 profile-title">
                                {user?.firstName} {user?.lastName}
                            </h1>
                            {/* <p className="text-white/80 mb-4">@{user.username}</p> */}
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6 profile-badges">
                                <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 profile-badge">
                                    <Icons.token className="h-5 w-5 text-[var(--color-primary)]" />
                                    <span className="text-white font-semibold">{user?.tokenBalance || 0} Tokens</span>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 profile-badge">
                                    <Icons.mail className="h-5 w-5 text-[var(--color-primary)]" />
                                    <span className="text-white">{user?.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8 profile-content">
                <div className="flex items-center justify-between mb-8 profile-section-header">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2 profile-section-title">My Account</h2>
                        <p className="text-[#667085] profile-section-description">Manage your profile, addresses, password and settings</p>
                    </div>
                    {/* <div className="mr-5">
                        <Link href={"/games/list"}><Button className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 transition-all wallet-button"> 🎮 Games List</Button></Link>
                    </div> */}
                </div>
                <KYCSection />

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 profile-grid">
                    {/* Main Content Area */}
                    <div className="lg:col-span-3 profile-main-content">
                        <div className="bg-[var(--color-surface)]/50 backdrop-blur-sm rounded-xl border border-[#667085]/20 overflow-hidden shadow-lg">
                            <ProfileTabs
                                user={user}
                                onProfileUpdate={async () => {
                                    console.log("Profile updated")
                                }}
                            />
                        </div>
                    </div>

                    {/* Sidebar - Wallet & NFTs */}
                    <div className="lg:col-span-1 profile-sidebar">
                        <div className="sticky top-8 wallet-sidebar">
                            <WalletSidebar
                                user={user}
                                nfts={[]}
                            />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default Profile;