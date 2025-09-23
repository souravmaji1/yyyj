import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/src/store';
import {
  selectVideoRewards,
  selectWatchHistory,
  selectCurrentWatch,
  selectVideoRewardsStats,
  selectWatchInProgress,
  selectAntiCheatFlags,
  selectVideoRewardsLoading,
  selectVideoRewardsError,
  startVideoWatch,
  stopVideoWatch,
  setAntiCheatFlag,
  resetAntiCheatFlags,
  clearError,
  updateStats,
  createVideoWatch,
  fetchUserVideoHistory,
  getVideoWatchLog,
} from '@/src/store/slices/videoRewardsSlice';

export const useVideoRewards = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Selectors
  const videoRewards = useSelector(selectVideoRewards);
  const watchHistory = useSelector(selectWatchHistory);
  const currentWatch = useSelector(selectCurrentWatch);
  const stats = useSelector(selectVideoRewardsStats);
  const watchInProgress = useSelector(selectWatchInProgress);
  const antiCheatFlags = useSelector(selectAntiCheatFlags);
  const loading = useSelector(selectVideoRewardsLoading);
  const error = useSelector(selectVideoRewardsError);

  // Actions
  const startWatch = useCallback((videoData: {
    videoId: string;
    videoTitle: string;
    channelId: string;
    channelName: string;
    videoDuration: number;
  }) => {
    dispatch(startVideoWatch(videoData));
  }, [dispatch]);

  const stopWatch = useCallback(() => {
    dispatch(stopVideoWatch());
  }, [dispatch]);

  const setFlag = useCallback((flag: keyof typeof antiCheatFlags, value: boolean) => {
    dispatch(setAntiCheatFlag({ flag, value }));
  }, [dispatch, antiCheatFlags]);

  const resetFlags = useCallback(() => {
    dispatch(resetAntiCheatFlags());
  }, [dispatch]);

  const clearErrorAction = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const updateStatsAction = useCallback((newStats: Partial<typeof stats>) => {
    dispatch(updateStats(newStats));
  }, [dispatch, stats]);

  const createWatch = useCallback(async (watchData: {
    videoId: string;
    videoTitle: string;
    channelId: string;
    channelName: string;
    videoDuration: number;
    watchStartedAt: Date;
    watchCompletedAt: Date;
    rewardAmount?: number;
    validationFlags?: Record<string, any>;
    watchData?: Record<string, any>;
  }) => {
    return await dispatch(createVideoWatch(watchData)).unwrap();
  }, [dispatch]);

  const fetchHistory = useCallback(async (params :{
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }) => {
    return await dispatch(fetchUserVideoHistory(params)).unwrap(); 
  }, [dispatch]);

  const getWatchLog = useCallback(async (id: string) => {
    return await dispatch(getVideoWatchLog(id)).unwrap();
  }, [dispatch]);

  // Check if current video is eligible for rewards
  const isVideoEligible = useCallback((videoId: string) => {
    return !watchHistory.some(log => log.videoId === videoId);
  }, [watchHistory]);

  // Get reward amount for current video
  const getRewardAmount = useCallback((baseAmount: number = 2) => {
    return baseAmount + watchHistory.length;
  }, [watchHistory]);

  // Check if anti-cheat violations occurred
  const hasAntiCheatViolations = useCallback(() => {
    return Object.values(antiCheatFlags).some(flag => flag);
  }, [antiCheatFlags]);

  return {
    // State
    videoRewards,
    watchHistory,
    currentWatch,
    stats,
    watchInProgress,
    antiCheatFlags,
    loading,
    error,
    
    // Actions
    startWatch,
    stopWatch,
    setFlag,
    resetFlags,
    clearError: clearErrorAction,
    updateStats: updateStatsAction,
    createWatch,
    fetchHistory,
    getWatchLog,
    
    // Computed values
    isVideoEligible,
    getRewardAmount,
    hasAntiCheatViolations,
  };
};
