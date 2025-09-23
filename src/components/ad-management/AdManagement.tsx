"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import { ConfirmationDialog } from "@/src/components/ui/confirmation-dialog";
import { useNotification } from "@/src/contexts/NotificationContext";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/store";
import { fetchAdvertisements, fetchUserStats, deleteAdvertisement, clearDeleteAdStatus, publishAdvertisement, clearPublishAdStatus } from "@/src/store/slices/adManagementSlice";
import { CreateAdModal } from "./CreateAdModal";
import { EditAdModal } from "./EditAdModal";
import { ViewAdModal } from "./ViewAdModal";
import { Advertisement } from "@/src/store/slices/adManagementSlice";
import { Plus, Edit, Eye, Trash2, Calendar, DollarSign, MapPin, Video, Loader2, RefreshCw, TrendingUp, Users, Clock, Target, AlertCircle, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import './ad-management.mobile.css';

export default function AdManagement() {
  const { showNotification } = useNotification();
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { advertisements, loading, deleteAdLoading, deleteAdSuccess, deleteAdError, error, userStats, userStatsLoading } = useSelector(
    (state: RootState) => state.adManagement
  );
  
  // Local state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [adToDelete, setAdToDelete] = useState<Advertisement | null>(null);
  const [hasInitialData, setHasInitialData] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const adsPerPage = 6;

  // Fetch advertisements and user stats on mount
  useEffect(() => {
    dispatch(fetchAdvertisements());
    dispatch(fetchUserStats());
  }, [dispatch]);

  // Update hasInitialData when we receive data
  useEffect(() => {
    if (advertisements.length > 0 || !loading) {
      setHasInitialData(true);
    }
  }, [advertisements.length, loading]);

  // Clean contaminated machine IDs on mount
  useEffect(() => {
    const cleanMachineIds = () => {
      try {
        // Clean sessionStorage
        const sessionMachineId = sessionStorage.getItem('machine_id');
        if (sessionMachineId && sessionMachineId.includes('/')) {
          const cleanId = sessionMachineId.split('/')[0];
          if (cleanId) {
            sessionStorage.setItem('machine_id', cleanId);
          }
        }
        
        // Clean localStorage
        const localMachineId = localStorage.getItem('machine_id');
        if (localMachineId && localMachineId.includes('/')) {
          const cleanId = localMachineId.split('/')[0];
          if (cleanId) {
            localStorage.setItem('machine_id', cleanId);
          }
        }
      } catch (error) {
        console.error('Error cleaning machine IDs:', error);
      }
    };
    
    cleanMachineIds();
  }, []);

  // Get machine ID from storage for filtering
  const getMachineId = () => {
    try {
      // Try sessionStorage first
      const fromSession = sessionStorage.getItem('machine_id');
      if (fromSession) {
        // Clean up the machine ID - remove any URL path contamination
        const slashIndex = fromSession.indexOf('/');
        const cleanMachineId = slashIndex >= 0 ? fromSession.slice(0, slashIndex) : fromSession;
        return cleanMachineId;
      }
      
      // Try localStorage as fallback
      const fromLocal = localStorage.getItem('machine_id');
      if (fromLocal) {
        // Clean up the machine ID - remove any URL path contamination
        const slashIndex = fromLocal.indexOf('/');
        const cleanMachineId = slashIndex >= 0 ? fromLocal.slice(0, slashIndex) : fromLocal;
        return cleanMachineId;
      }
      
      // Try URL hash as final fallback
      const fromHash = window.location.hash.match(/machine_id=([^&]+)/);
      if (fromHash && fromHash[1]) {
        const cleanMachineId = decodeURIComponent(fromHash[1]).split('/')[0];
        return cleanMachineId || null;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  };

  // Filter ads by machine ID if available
  const machineId = getMachineId();
  const machineIdFilteredAds = Array.isArray(advertisements) && machineId 
    ? advertisements.filter(ad => ad.machineId === machineId)
    : [];
  
  // Use machine ID filtered ads if available, otherwise show all ads
  const safeAds = machineIdFilteredAds.length > 0 ? machineIdFilteredAds : (Array.isArray(advertisements) ? advertisements : []);

  // Debug logging
  useEffect(() => {
    if (advertisements.length > 0) {
      console.log('Total ads from API:', advertisements.length);
      console.log('Machine ID for filtering:', machineId);
      console.log('Filtered ads count:', safeAds.length);
      console.log('Sample ad machine IDs:', advertisements.slice(0, 3).map(ad => ad.machineId));
    }
    
    // Mark that we have initial data regardless of count (prevents loading flash)
    if (!hasInitialData) {
      setHasInitialData(true);
    }
  }, [advertisements, machineId, safeAds.length, hasInitialData]);

  // Reset to first page when ads change
  useEffect(() => {
    setCurrentPage(1);
  }, [advertisements.length]);

  // Handle delete success/error notifications
  useEffect(() => {
    if (deleteAdSuccess) {
      showNotification({
        type: "success",
        title: "Success",
        message: "Advertisement deleted successfully!",
      });
      dispatch(clearDeleteAdStatus());
      dispatch(fetchAdvertisements());
    }
  }, [deleteAdSuccess, showNotification, dispatch]);

  useEffect(() => {
    if (deleteAdError) {
      showNotification({
        type: "error",
        title: "Error",
        message: deleteAdError,
      });
      dispatch(clearDeleteAdStatus());
    }
  }, [deleteAdError, showNotification, dispatch]);

  const handleCreateAd = () => {
    setShowCreateModal(true);
  };

  const handleEditAd = (ad: Advertisement) => {
    setSelectedAd({...ad,machineId:ad.machine.machine_id});
    setShowEditModal(true);
  };

  const handleViewAd = (ad: Advertisement) => {
    if (!ad) {
      console.error('handleViewAd: Advertisement object is null or undefined');
      showNotification({
        type: "error",
        title: "Error",
        message: "Unable to load advertisement details",
      });
      return;
    }
    
    // Ensure the ad has required basic fields
    if (!ad.id) {
      console.error('handleViewAd: Advertisement missing required ID field', ad);
      showNotification({
        type: "error",
        title: "Error",
        message: "Invalid advertisement data",
      });
      return;
    }
    
    console.log('handleViewAd: Opening view modal for ad:', {
      id: ad.id,
      title: ad.title,
      status: ad.status,
      machineId: ad.machineId || ad.machine?.machine_id
    });
    
    setSelectedAd(ad);
    setShowViewModal(true);
  };

  const handleDeleteAd = (ad: Advertisement) => {
    setAdToDelete(ad);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (adToDelete) {
      dispatch(deleteAdvertisement(adToDelete.id));
      setShowDeleteConfirm(false);
      setAdToDelete(null);
    }
  };

  const handlePublishAd = async (ad: Advertisement) => {
    try {
      const result = await dispatch(publishAdvertisement(ad.id)).unwrap();
      // Show success message from API response
      showNotification({
        type: "success",
        title: "Success",
        message: result.message || "Advertisement published successfully!",
      });
      // Refresh the advertisements list
      dispatch(fetchAdvertisements());
    } catch (error: any) {
      // Show error message from API response
      showNotification({
        type: "error",
        title: "Error",
        message: error.message || "Failed to publish advertisement",
      });
    }
  };

  const clearMachineIdFilter = () => {
    // Clear machine ID from storage
    sessionStorage.removeItem('machine_id');
    localStorage.removeItem('machine_id');
    // Force re-render by updating state
    dispatch(fetchAdvertisements());
  };

  const getStatusConfig = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'INITIATED':
        return {
          color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          icon: Clock,
          label: 'Initiated'
        };
      case 'APPROVED':
        return {
          color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          icon: Target,
          label: 'Approved'
        };
      case 'REJECTED':
        return {
          color: 'bg-red-500/20 text-red-400 border-red-500/30',
          icon: AlertCircle,
          label: 'Rejected'
        };
      case 'ACTIVE':
        return {
          color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          icon: TrendingUp,
          label: 'Active'
        };
      case 'COMPLETED':
        return {
          color: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
          icon: CheckCircle,
          label: 'Completed'
        };
      default:
        return {
          color: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
          icon: Clock,
          label: status || 'Unknown'
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Pagination logic
  const totalPages = Math.ceil(safeAds.length / adsPerPage);
  const startIndex = (currentPage - 1) * adsPerPage;
  const endIndex = startIndex + adsPerPage;
  const currentAds = safeAds.slice(startIndex, endIndex);
  
  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-2 sm:p-3 md:p-6 ad-management-container ad-content-scrollable">
      {/* Header Section */}
      <div className="mb-4 sm:mb-6 md:mb-8 ad-management-header">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 md:gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-xl">
                <Video className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent leading-tight">
                  Ad Management
                </h1>
                <p className="text-gray-400 text-xs sm:text-sm md:text-lg mt-1 leading-relaxed">
                  {machineId 
                    ? `Managing advertisements for Machine: ${machineId}`
                    : 'Create and manage your advertising campaigns'
                  }
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <Button
              onClick={() => {
                dispatch(fetchAdvertisements());
                dispatch(fetchUserStats());
              }}
              size="sm"
              className="border-slate-600/50 text-white bg-[var(--color-bg)] transition-all duration-200 text-xs sm:text-sm px-3 sm:px-4 py-2 ad-refresh-button"
              disabled={loading || userStatsLoading}
            >
              <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2 ${(loading || userStatsLoading) ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {loading || userStatsLoading ? 'Refreshing...' : 'Refresh'}
              </span>
              <span className="sm:hidden">
                {loading || userStatsLoading ? 'Refresh...' : 'Refresh'}
              </span>
            </Button>
            <Button
              onClick={handleCreateAd}
              size="sm"
              className="bg-gradient-to-r from-[#02a7fd] to-[#2e2d7b] text-white hover:from-[#0298E8] hover:to-[#2726A0] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-xs sm:text-sm px-3 sm:px-4 py-2 ad-create-button"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Create New AD</span>
              <span className="sm:hidden">New Ad</span>
            </Button>
            
          </div>
        </div>
      </div>

            {/* Stats Overview */}
      <div className="mb-8">
        {/* Show subtle loading indicator when refreshing */}
        {(loading || userStatsLoading) && hasInitialData && (
          <div className="mb-3 sm:mb-4 flex items-center justify-center">
            <div className="flex items-center gap-2 text-[var(--color-primary)] text-xs sm:text-sm">
              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
              <span>Refreshing data...</span>
            </div>
          </div>
        )}
        
        {userStatsLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-[var(--color-bg)] border-slate-700/50 animate-pulse">
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="h-3 sm:h-4 bg-slate-700 rounded w-16 sm:w-20"></div>
                      <div className="h-6 sm:h-8 bg-slate-700 rounded w-12 sm:w-16"></div>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-700 rounded-full flex-shrink-0 ml-2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 ad-stats-grid">
          {/* Total Ads */}
          <Card className="bg-[#1A264C] border-slate-700/50 hover:border-[var(--color-primary)]/30 transition-all duration-300 ad-stats-card">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-400 truncate ad-stats-title">Total Ads</p>
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white truncate ad-stats-value">
                    {userStatsLoading ? (
                      <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 animate-spin text-[var(--color-primary)]" />
                    ) : (
                      userStats?.total || safeAds.length || 0
                    )}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-500/20 rounded-full flex-shrink-0 ml-2">
                  <Video className="h-3 w-3 sm:h-4 sm:w-4 md:h-6 md:w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Campaigns */}
          <Card className="bg-[#1A264C] border-slate-700/50 hover:border-[var(--color-primary)]/30 transition-all duration-300 ad-stats-card">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-400 truncate ad-stats-title">Approved Ads</p>
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white truncate ad-stats-value">
                    {userStatsLoading ? (
                      <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 animate-spin text-[#02a7fd]" />
                    ) : (
                      userStats?.approved || 0
                    )}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-green-500/20 rounded-full flex-shrink-0 ml-2">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 md:h-6 md:w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Earnings */}
          <Card className="bg-[#1A264C] border-slate-700/50 hover:border-[var(--color-primary)]/30 transition-all duration-300 ad-stats-card">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-400 truncate ad-stats-title">Total spend XUT</p>
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white truncate ad-stats-value">
                    {userStatsLoading ? (
                      <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 animate-spin text-[#02a7fd]" />
                    ) : (
                      `${(userStats?.totalEarnings || 0).toFixed(2)} XUT`
                    )}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-purple-500/20 rounded-full flex-shrink-0 ml-2">
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 md:h-6 md:w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Review */}
          <Card className="bg-[#1A264C] border-slate-700/50 hover:border-[var(--color-primary)]/30 transition-all duration-300 ad-stats-card">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-400 truncate ad-stats-title">Pending Review</p>
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white truncate ad-stats-value">
                    {userStatsLoading ? (
                      <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 animate-spin text-[#02a7fd]" />
                    ) : (
                      userStats?.pendingReview || 0
                    )}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-amber-500/20 rounded-full flex-shrink-0 ml-2">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 md:h-6 md:w-6 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Spent */}
          <Card className="bg-[#1A264C] border-slate-700/50 hover:border-[var(--color-primary)]/30 transition-all duration-300 sm:col-span-2 lg:col-span-1 ad-stats-card">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-400 truncate ad-stats-title">Total Campaign Cost</p>
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white truncate ad-stats-value">
                    {userStatsLoading ? (
                      <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 animate-spin text-[#02a7fd]" />
                    ) : (
                      `${((userStats?.initiatedAmount || 0) + (userStats?.publishedAmount || 0) + (userStats?.approvedAmount || 0) + (userStats?.completedAmount || 0)).toFixed(2)} XUT`
                    )}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1 truncate">
                    {userStatsLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin text-[#02a7fd]" />
                    ) : (
                      `${(userStats?.initiated || 0) + (userStats?.published || 0) + (userStats?.approved || 0) + (userStats?.completed || 0)} ads spent`
                    )}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-red-500/20 rounded-full flex-shrink-0 ml-2">
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 md:h-6 md:w-6 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reserve Spent */}
          <Card className="bg-[#1A264C] border-slate-700/50 hover:border-[var(--color-primary)]/30 transition-all duration-300 sm:col-span-2 lg:col-span-1">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-400 truncate">Reserve XUT spent</p>
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white truncate">
                    {userStatsLoading ? (
                      <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 animate-spin text-[var(--color-primary)]" />
                    ) : (
                      `${((userStats?.initiatedAmount || 0) + (userStats?.publishedAmount || 0)).toFixed(2)} XUT`
                    )}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1 truncate">
                    {userStatsLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin text-[var(--color-primary)]" />
                    ) : (
                      `${(userStats?.initiated || 0) + (userStats?.published || 0)} ads reserved`
                    )}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-orange-500/20 rounded-full flex-shrink-0 ml-2">
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 md:h-6 md:w-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Stats Row */}
        {userStatsLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="bg-[var(--color-bg)] border-slate-700/50 animate-pulse">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="h-3 sm:h-4 bg-slate-700 rounded w-20 sm:w-24"></div>
                      <div className="h-5 sm:h-6 bg-slate-700 rounded w-16 sm:w-20"></div>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-700 rounded-full flex-shrink-0 ml-2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {userStats && !userStatsLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {/* Total Earnings */}
            {/* <Card className="bg-[#1A264C] border-slate-700/50 hover:border-[var(--color-primary)]/30 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Earnings</p>
                    <p className="text-2xl font-bold text-green-400">
                      {userStats.totalEarnings.toFixed(2)} XUT
                    </p>
                  </div>
                  <div className="p-3 bg-green-500/20 rounded-full">
                    <TrendingUp className="h-6 w-6 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card> */}

            {/* Total Payments */}
            {/* <Card className="bg-[#1A264C] border-slate-700/50 hover:border-[var(--color-primary)]/30 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Payments</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {userStats.totalPayments}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-full">
                    <DollarSign className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card> */}

            {/* Completed Payments */}
            {/* <Card className="bg-[#1A264C] border-slate-700/50 hover:border-[var(--color-primary)]/30 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Earnings</p>
                    <p className="text-2xl font-bold text-purple-400">
                      {userStats.totalPaidAmount.toFixed(2)} XUT
                    </p>
                  </div>
                  <div className="p-3 bg-purple-500/20 rounded-full">
                    <CheckCircle className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card> */}
          </div>
        )}
      </div>
      {/* Content */}
      <div className="space-y-6">
        {/* Error Display */}
        {error && (
          <Card className="bg-[var(--color-bg)] border-red-500/30">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-3 ad-error-state">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 bg-red-500/20 rounded-full flex-shrink-0">
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
                  </div>
                  <p className="text-red-400 font-medium text-sm sm:text-base">{error}</p>
                </div>
                <Button
                  onClick={() => dispatch(fetchAdvertisements())}
                  variant="outline"
                  size="sm"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 w-full sm:w-auto text-xs sm:text-sm px-3 sm:px-4 py-2 ad-error-button"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State - Show immediately when loading and no data */}
        {loading && safeAds.length === 0 && !error && (
          <div className="flex items-center justify-center py-12 sm:py-16"> 
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-blue-400" />
              <p className="text-gray-400 text-sm sm:text-base">Loading advertisements...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && safeAds.length === 0 && !error && (
          <Card className="bg-[var(--color-bg)] border-slate-700/50">
            <CardContent className="p-8 sm:p-12 md:p-16 text-center ad-empty-state">
              <div className="max-w-md mx-auto space-y-4 sm:space-y-6">
                <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-[#02a7fd] to-[#2e2d7b] rounded-full flex items-center justify-center ad-empty-state-icon">
                  <Video className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <h3 className="text-xl sm:text-2xl font-bold text-white ad-empty-state-title">No Advertisements Yet</h3>
                  <p className="text-gray-400 text-sm sm:text-base md:text-lg leading-relaxed ad-empty-state-description">Create your first advertisement to start reaching your audience</p>
                </div>
                <Button
                  onClick={handleCreateAd}
                  size="lg"
                  className="bg-gradient-to-r from-[#02a7fd] to-[#2e2d7b] text-white hover:from-[#0298E8] hover:to-[#2726A0] transition-all duration-200 w-full sm:w-auto px-6 sm:px-8 py-3 text-sm sm:text-base ad-create-button"
                >
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Create Your First Ad
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Advertisements Grid */}
        {!loading && safeAds.length > 0 && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Your Advertisements</h2>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                {/* Machine ID filter info can go here */}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6 ad-cards-grid">
              {currentAds.map((ad: Advertisement) => {
                const statusConfig = getStatusConfig(ad.status);
                const StatusIcon = statusConfig.icon;
                const daysRemaining = getDaysRemaining(ad.endDate);
                
                return (
                  <Card 
                    key={ad.id}
                    className="group bg-[#1A264C] border-slate-700/50 hover:border-[var(--color-primary)]/50 transition-all duration-300 hover:shadow-2xl hover:shadow-[var(--color-primary)]/10 transform hover:-translate-y-1 overflow-hidden relative ad-card"
                  >
                    {/* Status Badge */}
                    <div className="absolute top-3 right-2 sm:top-4 sm:right-3 z-10 ad-status-badge">
                      <Badge className={`${statusConfig.color} border px-2 py-1 sm:px-3 sm:py-1.5 text-xs font-medium flex items-center gap-1 sm:gap-1.5 whitespace-nowrap`}>
                        <StatusIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                        <span className="truncate">{statusConfig.label}</span>
                      </Badge>
                    </div>

                    {/* Card Header */}
                    <CardHeader className="pb-3 sm:pb-4 pt-4 sm:pt-6 pr-28 sm:pr-32 ad-card-header">
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg sm:text-xl font-bold text-white line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors duration-200 leading-tight break-words ad-card-title">
                              {ad.title}
                            </CardTitle>
                            <p className="text-gray-400 text-xs sm:text-sm mt-2 line-clamp-2 leading-relaxed break-words ad-card-description">
                              {ad.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3 sm:space-y-4 overflow-y-auto">
                      {/* Ad Details */}
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                          <div className="flex items-center gap-1 sm:gap-2 text-gray-400 min-w-0">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="font-medium truncate">Machine ID:</span>
                          </div>
                          <span className="text-white font-mono text-xs bg-slate-700/50 px-2 py-1 rounded truncate">
                            {ad?.machine?.machine_id || `${ad?.machineId.slice(0, 8)}...`}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                          <div className="flex items-center gap-1 sm:gap-2 text-gray-400 min-w-0">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="font-medium truncate">Campaign Period:</span>
                          </div>
                          <div className="text-white min-w-0">
                            <div className="font-medium truncate">{formatDate(ad.startDate)} - {formatDate(ad.endDate)}</div>
                            {daysRemaining > 0 && (
                              <div className="text-xs text-amber-400 truncate">
                                {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                          <div className="flex items-center gap-1 sm:gap-2 text-gray-400 min-w-0">
                            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="font-medium truncate">Budget:</span>
                          </div>
                          <span className="text-white font-bold text-sm sm:text-lg truncate">{typeof ad.amount === 'string' ? ad.amount : ad.amount.toFixed(2)} XUT</span>
                        </div>

                        {ad.media && ad.media.length > 0 && ad.media[0] && (
                          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                            <div className="flex items-center gap-1 sm:gap-2 text-gray-400 min-w-0">
                              <Video className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span className="font-medium truncate">Media:</span>
                            </div>
                            <span className="text-white truncate">
                              {ad.media?.[0]?.mediaType} • {Math.round((ad.media?.[0]?.metadata?.size || 0) / 1024 / 1024 * 100) / 100} MB
                            </span>
                          </div>
                        )}
                      </div>

                      <Separator className="bg-slate-600/50" />

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 pt-2 ad-action-buttons">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewAd(ad)}
                          className="flex-1 min-w-[100px] sm:min-w-[120px] bg-[var(--color-bg)] border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 hover:border-blue-500/60 transition-all duration-200 font-medium text-xs sm:text-sm px-2 sm:px-3 py-2 ad-action-button"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">View Details</span>
                          <span className="sm:hidden">View</span>
                        </Button>
                        
                        {ad.status?.toUpperCase() === 'INITIATED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePublishAd(ad)}
                            className="flex-1 min-w-[100px] sm:min-w-[120px] bg-[var(--color-bg)] border-green-500/30 text-green-400 hover:bg-green-500/20 hover:text-green-300 hover:border-green-500/60 transition-all duration-200 font-medium text-xs sm:text-sm px-2 sm:px-3 py-2 ad-action-button"
                          >
                            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Publish</span>
                            <span className="sm:hidden">Pub</span>
                          </Button>
                        )}
                        
                        {(ad.status?.toUpperCase() === 'REJECTED' || ad.status?.toUpperCase() === 'INITIATED') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditAd(ad)}
                            className="flex-1 min-w-[100px] sm:min-w-[120px] bg-[var(--color-bg)] border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 hover:border-amber-500/60 transition-all duration-200 font-medium text-xs sm:text-sm px-2 sm:px-3 py-2 ad-action-button"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Edit</span>
                            <span className="sm:hidden">Edit</span>
                          </Button>
                        )}
                        
                        {/* Only show delete button for INITIATED or REJECTED ads */}
                        {(ad.status?.toUpperCase() === 'INITIATED' || ad.status?.toUpperCase() === 'REJECTED') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAd(ad)}
                            className="min-w-[50px] bg-[var(--color-bg)] border-red-500 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200 font-medium text-xs sm:text-sm px-2 sm:px-3 py-2 ad-action-button"
                            disabled={deleteAdLoading}
                            title="Delete Advertisement"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 sm:gap-4 mt-4 sm:mt-6 md:mt-8 ad-pagination">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="bg-[var(--color-bg)] border-slate-600 text-white hover:bg-slate-700/50 hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm px-4 sm:px-6 py-2 ad-pagination-button"
                >
                  <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                
                {/* Page Numbers */}
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(page)}
                      className={`min-w-[35px] sm:min-w-[40px] h-8 sm:h-10 text-xs sm:text-sm ad-pagination-button ${
                        currentPage === page
                          ? "bg-[#02a7fd] text-white border-[#02a7fd]"
                          : "bg-[var(--color-bg)] border-slate-600 text-white hover:bg-slate-700/50 hover:border-slate-500"
                      }`}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="bg-[var(--color-bg)] border-slate-600 text-white hover:bg-slate-700/50 hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm px-4 sm:px-6 py-2 ad-pagination-button"
                >
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateAdModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          
        />
      )}

      {showEditModal && selectedAd && (
        <EditAdModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            dispatch(fetchAdvertisements());
          }}
          advertisement={selectedAd}
        />
      )}

      {showViewModal && selectedAd && (
        <ViewAdModal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          advertisement={selectedAd}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && adToDelete && (
        <ConfirmationDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          title="Delete Advertisement"
          description={`This ad is in ${adToDelete.status} state and can only be deleted now. This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setAdToDelete(null);
          }}
          variant="danger"
          isLoading={deleteAdLoading}
        />
      )}
    </div>
  );
}
