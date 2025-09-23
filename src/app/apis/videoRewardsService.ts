import authAxiosClient from './auth/axios';

// Video Rewards API Service - User Endpoints Only
export const videoRewardsService = {
  // Create video watch log when user completes video
  createVideoWatch: async (watchData: {
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
    try {
      const response = await authAxiosClient.post('/video-rewards/watch', watchData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create video watch log');
    }
  },

  // Get user video watch history
  getUserVideoHistory: async (params?: {
    page?: number;
    limit?: number;
  }) => {
    try {
      const response = await authAxiosClient.get('/video-rewards/history', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch video history');
    }
  },

  // Get user video watch log by ID
  getUserVideoWatchLog: async (id: string) => {
    try {
      const response = await authAxiosClient.get(`/video-rewards/logs/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch video watch log');
    }
  },

  // Health check for video rewards service
  healthCheck: async () => {
    try {
      const response = await authAxiosClient.get('/video-rewards/health');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Video rewards service health check failed');
    }
  }
};
