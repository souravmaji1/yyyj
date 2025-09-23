'use client';

import React, { useState, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '../../store/hooks';
import { createGame } from '../../store/slices/gameSlice';

import UploadGameFiles from './UploadGameFiles';
import GameRevenueConfig from './GameRevenueConfig';
import RichTextEditor from '../common/RichTextEditor';
import SocketConnection from './SocketConnection';

// Comprehensive form data interface matching API payload requirements
interface GameFormData {
  // Basic Information
  gameTitle: string;
  gameDescription: string;
  logoFile: File | null;
  coverPhotoFiles: File[];
  
  // Game Files & Configuration
  zipFile: File | null;
  initializationCode: string;
  serverPath: string;
  gameType: string;
  
  // Game Steps
  steps: Array<{
    id: number;
    title: string;
    content: string;
  }>;
  
  // Platform Support
  supportsMobile: boolean;
  isMultiplayer: boolean;
  hasInGamePurchases: boolean;
  orientation: 'portrait' | 'landscape' | 'both';
  gameCategories: string[];
  
  // Game Controls & Instructions
  gameControls: string;
  
  // SDK & Competition
  sdkIntegrated: boolean;
  hasTournament: boolean;
  hasLeaderboard: boolean;
  
  // Tournament Prizes
  entryFee: string;
  firstPrize: string;
  runnerUpPrize: string;
  thirdPrize: string;
  
  // Revenue Configuration
  revenueSources: {
    ads: boolean;
    subscriptions: boolean;
  };
  adsPublisherId: string;
  adsNetworkIntegration: string;
  adsFrequency: string;
  adsPlacementTypes: string;
  subscriptionTiers: Array<{
    id: number;
    price: string;
    tierName: string;
    features: {
      noAds: boolean;
      extraLevels: boolean;
      specialNfts: boolean;
    };
    customFeature: string;
    duration: string;
  }>;
  
  // Form Status
  status: 'active' | 'inactive';
  termsAccepted: boolean;
}

interface AddGameProps {
  onBack?: () => void;
}

export default function AddGame({ onBack }: AddGameProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // Get userId from localStorage or use a default for demo
  const [userId] = useState(() => {
    if (typeof window !== 'undefined') {
      const userAuthDetails = localStorage.getItem('userAuthDetails');
      if (userAuthDetails) {
        try {
          const parsed = JSON.parse(userAuthDetails);
          return parsed.id || 'demo-user-id';
        } catch (e) {
          return 'demo-user-id';
        }
      }
    }
    return 'demo-user-id';
  });
  
  // Initialize comprehensive form data
  const [formData, setFormData] = useState<GameFormData>({
    // Basic Information
    gameTitle: '',
    gameDescription: '',
    logoFile: null,
    coverPhotoFiles: [],
    
    // Game Files & Configuration
    zipFile: null,
    initializationCode: '',
    serverPath: '',
    gameType: 'HTML5',
    
    // Game Steps
    steps: [{ id: 1, title: 'Game Controls', content: '' }],
    
    // Platform Support
    supportsMobile: true,
    isMultiplayer: true,
    hasInGamePurchases: true,
    orientation: 'portrait',
    gameCategories: ['Adventure', 'Card', 'PVP'],
    
    // Game Controls & Instructions
    gameControls: '',
    
    // SDK & Competition
    sdkIntegrated: true,
    hasTournament: true,
    hasLeaderboard: true,
    
    // Tournament Prizes
    entryFee: '500000',
    firstPrize: '',
    runnerUpPrize: '',
    thirdPrize: '',
    
    // Revenue Configuration
    revenueSources: {
      ads: true,
      subscriptions: true
    },
    adsPublisherId: '',
    adsNetworkIntegration: '',
    adsFrequency: '',
    adsPlacementTypes: '',
    subscriptionTiers: [
      {
        id: 1,
        price: '',
        tierName: '',
        features: {
          noAds: true,
          extraLevels: false,
          specialNfts: false
        },
        customFeature: '',
        duration: ''
      }
    ],
    
    // Form Status
    status: 'active',
    termsAccepted: true,
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDescriptionChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      gameDescription: value,
    }));
  };

  const handleLogoUpload = (file: File) => {
    setFormData(prev => ({
      ...prev,
      logoFile: file,
    }));
  };

  const handleCoverPhotosUpload = (files: File[]) => {
    setFormData(prev => ({
      ...prev,
      coverPhotoFiles: files,
    }));
  };

  const handleZipFileUpload = (file: File) => {
    setFormData(prev => ({
      ...prev,
      zipFile: file,
    }));
  };

  const handleUploadGameFilesData = useCallback((data: Partial<GameFormData>) => {
    console.log('UploadGameFiles data received:', data);
    console.log('Current formData before update:', formData);
    setFormData(prev => {
      const newData = {
        ...prev,
        ...data,
      };
      console.log('Updated formData:', newData);
      return newData;
    });
  }, [formData]);

  const handleRevenueConfigData = useCallback((data: Partial<GameFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...data,
    }));
  }, []);
  
  const createApiPayload = (): FormData => {
    console.log('Creating API payload with formData:', formData);
    console.log('Radio button values in formData:', {
      supportsMobile: formData.supportsMobile,
      isMultiplayer: formData.isMultiplayer,
      hasInGamePurchases: formData.hasInGamePurchases,
      sdkIntegrated: formData.sdkIntegrated,
      hasTournament: formData.hasTournament,
      hasLeaderboard: formData.hasLeaderboard
    });
    console.log('Other important values:', {
      initializationCode: formData.initializationCode,
      serverPath: formData.serverPath,
      firstPrize: formData.firstPrize,
      runnerUpPrize: formData.runnerUpPrize,
      thirdPrize: formData.thirdPrize
    });
    const formDataToSend = new FormData();
    
    // Basic Information
    formDataToSend.append('gameTitle', formData.gameTitle);
    formDataToSend.append('gameDescription', formData.gameDescription);
    if (formData.logoFile) {
      console.log('Adding logoFile:', formData.logoFile);
      formDataToSend.append('logoFile', formData.logoFile);
    }
    
    // Cover Photos - Send as array of files
    if (formData.coverPhotoFiles && formData.coverPhotoFiles.length > 0) {
      console.log('Adding coverPhotoFiles:', formData.coverPhotoFiles);
      formData.coverPhotoFiles.forEach((file) => {
        formDataToSend.append('coverPhotoFiles', file);
      });
    }
    
    // Game Files & Configuration
    if (formData.zipFile) {
      console.log('Adding zipFile:', formData.zipFile);
      formDataToSend.append('zipFile', formData.zipFile);
    }
    formDataToSend.append('initializationCode', formData.initializationCode);
    formDataToSend.append('serverPath', formData.serverPath);
    formDataToSend.append('gameType', formData.gameType);
    formDataToSend.append('steps', JSON.stringify(formData.steps));
    
    // Platform Support
    formDataToSend.append('supportsMobile', formData.supportsMobile.toString());
    formDataToSend.append('isMultiplayer', formData.isMultiplayer.toString());
    formDataToSend.append('hasInGamePurchases', formData.hasInGamePurchases.toString());
    formDataToSend.append('orientation', formData.orientation);
    formDataToSend.append('gameCategories', JSON.stringify(formData.gameCategories));
    
    // Game Controls & Instructions
    formDataToSend.append('gameControls', formData.gameControls);
    
    // SDK & Competition
    formDataToSend.append('sdkIntegrated', formData.sdkIntegrated.toString());
    formDataToSend.append('hasTournament', formData.hasTournament.toString());
    formDataToSend.append('hasLeaderboard', formData.hasLeaderboard.toString());
    
    // Tournament Prizes
    formDataToSend.append('entryFee', formData.entryFee);
    formDataToSend.append('firstPrize', formData.firstPrize);
          formDataToSend.append('runnerUpPrize', formData.runnerUpPrize);
    formDataToSend.append('thirdPrize', formData.thirdPrize);
    
    // Revenue Configuration
    formDataToSend.append('revenueSources', JSON.stringify(formData.revenueSources));
    formDataToSend.append('adsPublisherId', formData.adsPublisherId);
    formDataToSend.append('adsNetworkIntegration', formData.adsNetworkIntegration);
    formDataToSend.append('adsFrequency', formData.adsFrequency);
    formDataToSend.append('adsPlacementTypes', formData.adsPlacementTypes);
    formDataToSend.append('subscriptionTiers', JSON.stringify(formData.subscriptionTiers));
    
    // Form Status
    formDataToSend.append('status', formData.status);
    formDataToSend.append('termsAccepted', formData.termsAccepted.toString());
    
    return formDataToSend;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create the FormData payload with all files and data
      const payload = createApiPayload();
      
      // Use Redux to create the game with the FormData payload that contains files
      const response = await dispatch(createGame(payload)).unwrap();
      
      // Extract the message from the response
      const successMessage = 'Game created successfully!';
      
      onBack ? onBack() : router.push('/games/list');
    } catch (error: any) {
      console.error('Error creating game:', error);
      
      // Show error toast
      const errorMessage = error.message || 'Please try again.';
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06080f] via-[#0c1120] to-[#0f1529]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={onBack || (() => router.push('/games/list'))}
              className="flex items-center gap-2 text-lg font-semibold text-[#E6E9F2] hover:text-[#02a7fd] transition-all duration-200 group"
            >
              <ArrowLeft size={20} className="group-hover:translate-x-[-2px] transition-transform duration-200" />
              Back to Games
            </button>
          </div>
          <h1 className="text-4xl font-bold text-[#E6E9F2] mb-3 bg-gradient-to-r from-[#02a7fd] to-[#7c3aed] bg-clip-text text-transparent">
            Add New Game
          </h1>
          <p className="text-[#9AA3B2] text-lg">
            Create and configure your game with all the necessary details
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="bg-[#0c1120]/80 backdrop-blur-sm border border-[#1e1b4d]/30 rounded-2xl shadow-2xl p-8 hover:border-[#2e2d7b]/50 transition-all duration-300">
            <h2 className="text-2xl font-semibold text-[#E6E9F2] mb-6 flex items-center gap-3">
              <div className="w-2 h-8 bg-gradient-to-b from-[#02a7fd] to-[#7c3aed] rounded-full"></div>
              Basic Information
            </h2>

            <div className="space-y-6">
              {/* Logo and Title Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Logo Upload */}
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-[#9AA3B2] mb-3">
                    Game Logo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleLogoUpload(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="block w-32 h-32 mx-auto border-2 border-dashed border-[#2e2d7b]/50 rounded-xl flex items-center justify-center cursor-pointer hover:border-[#02a7fd] hover:bg-[#0f1529]/50 transition-all duration-300 bg-[#0f1529]/30 group"
                  >
                    {formData.logoFile ? (
                      <img
                        src={URL.createObjectURL(formData.logoFile)}
                        alt="Logo"
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <div className="text-center">
                        <span className="text-sm text-[#9AA3B2] group-hover:text-[#02a7fd] transition-colors duration-200">Upload Logo</span>
                      </div>
                    )}
                  </label>
                </div>

                {/* Game Title */}
                <div className="lg:col-span-2">
                  <label htmlFor="gameTitle" className="block text-sm font-medium text-[#9AA3B2] mb-3">
                    Game Title *
                  </label>
                  <input
                    type="text"
                    id="gameTitle"
                    name="gameTitle"
                    value={formData.gameTitle}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-[#0f1529]/50 border border-[#2e2d7b]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#02a7fd] focus:border-transparent text-[#E6E9F2] placeholder-[#6B7280] transition-all duration-200 hover:border-[#2e2d7b]/50"
                    placeholder="Enter your game title"
                  />
                </div>
              </div>

              {/* Cover Photos */}
              <div>
                <h3 className="text-lg font-medium text-[#E6E9F2] mb-4">
                  Cover Photos
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {formData.coverPhotoFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Cover ${index + 1}`}
                        className="w-full h-24 object-cover rounded-xl border border-[#2e2d7b]/30 group-hover:border-[#02a7fd] transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newFiles = formData.coverPhotoFiles.filter((_, i) => i !== index);
                          setFormData(prev => ({
                            ...prev,
                            coverPhotoFiles: newFiles,
                          }));
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-[#ef4444] text-white rounded-full flex items-center justify-center hover:bg-[#dc2626] transition-all duration-200 shadow-lg"
                      >
                        <span className="text-xs">×</span>
                      </button>
                    </div>
                  ))}

                  {formData.coverPhotoFiles.length < 4 && (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          if (e.target.files) {
                            const files = Array.from(e.target.files);
                            const currentCount = formData.coverPhotoFiles.length;
                            const availableSlots = 4 - currentCount;
                            const filesToAdd = files.slice(0, availableSlots);

                            if (filesToAdd.length > 0) {
                              const newFiles = [...formData.coverPhotoFiles, ...filesToAdd];
                              handleCoverPhotosUpload(newFiles);
                            }
                          }
                        }}
                        className="hidden"
                        id="cover-photos-upload"
                      />
                      <label
                        htmlFor="cover-photos-upload"
                        className="block w-full h-24 border-2 border-dashed border-[#2e2d7b]/50 rounded-xl flex items-center justify-center cursor-pointer hover:border-[#02a7fd] hover:bg-[#0f1529]/50 bg-[#0f1529]/30 transition-all duration-300 group"
                      >
                        <span className="text-sm text-[#9AA3B2] group-hover:text-[#02a7fd] transition-colors duration-200">Add Photo</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Game Description */}
              <div>
                <h3 className="text-lg font-medium text-[#E6E9F2] mb-4">
                  Game Description
                </h3>
                <RichTextEditor
                  value={formData.gameDescription}
                  onChange={handleDescriptionChange}
                  placeholder="Describe your game in detail..."
                  height="200px"
                />
              </div>


            </div>
          </div>

          {/* Background Socket Connection */}
          {/* <div className="bg-[#0c1120]/80 backdrop-blur-sm border border-[#1e1b4d]/30 rounded-2xl shadow-2xl p-8 hover:border-[#2e2d7b]/50 transition-all duration-300">
            <h2 className="text-2xl font-semibold text-[#E6E9F2] mb-6 flex items-center gap-3">
              <div className="w-2 h-8 bg-gradient-to-b from-[#22d3ee] to-[#7c3aed] rounded-full"></div>
              Background Connection
            </h2>
            <SocketConnection userId={userId} />
          </div> */}

          {/* Upload Game Files Component */}
          <div className="bg-[#0c1120]/80 backdrop-blur-sm border border-[#1e1b4d]/30 rounded-2xl shadow-2xl p-8 hover:border-[#2e2d7b]/50 transition-all duration-300">
            <h2 className="text-2xl font-semibold text-[#E6E9F2] mb-6 flex items-center gap-3">
              <div className="w-2 h-8 bg-gradient-to-b from-[#f59e0b] to-[#7c3aed] rounded-full"></div>
              Game Files & Configuration
            </h2>
            <UploadGameFiles
              onDataChange={handleUploadGameFilesData}
              formData={formData}
            />
          </div>

          {/* Game Revenue Configuration Component */}
          <div className="bg-[#0c1120]/80 backdrop-blur-sm border border-[#1e1b4d]/30 rounded-2xl shadow-2xl p-8 hover:border-[#2e2d7b]/50 transition-all duration-300">
            <h2 className="text-2xl font-semibold text-[#E6E9F2] mb-6 flex items-center gap-3">
              <div className="w-2 h-8 bg-gradient-to-b from-[#22c55e] to-[#7c3aed] rounded-full"></div>
              Revenue Configuration
            </h2>
            <GameRevenueConfig
              onDataChange={handleRevenueConfigData}
              formData={formData}
            />
          </div>

          {/* Footer with Terms and Action Buttons */}
          <div className="bg-[#0c1120]/80 backdrop-blur-sm border border-[#1e1b4d]/30 rounded-2xl shadow-2xl p-8 hover:border-[#2e2d7b]/50 transition-all duration-300">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.termsAccepted}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      termsAccepted: e.target.checked
                    }));
                  }}
                  className="w-5 h-5 text-[#02a7fd] border-[#2e2d7b]/50 rounded focus:ring-[#02a7fd] bg-[#0f1529]/50 focus:ring-offset-[#0c1120] transition-all duration-200"
                />
                <span className="text-sm text-[#9AA3B2] group-hover:text-[#E6E9F2] transition-colors duration-200">
                  I agree to the Terms and Conditions and Privacy Policy
                </span>
              </label>

              <div className="flex gap-4 w-full lg:w-auto">
                <button
                  type="button"
                  onClick={() => onBack ? onBack() : router.push('/games/list')}
                  className="flex-1 lg:flex-none px-8 py-3 bg-[#0f1529]/50 border border-[#2e2d7b]/30 text-[#9AA3B2] rounded-xl hover:bg-[#0f1529] hover:border-[#2e2d7b]/50 hover:text-[#E6E9F2] transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.termsAccepted}
                  className="flex-1 lg:flex-none px-8 py-3 bg-gradient-to-r from-[#02a7fd] to-[#7c3aed] text-white rounded-xl hover:from-[#0284c7] hover:to-[#6d28d9] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {loading ? 'Creating...' : 'Create Game'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
