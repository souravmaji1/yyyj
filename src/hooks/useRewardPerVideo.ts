import { useState, useEffect } from 'react';
import authAxiosClient from '@/src/app/apis/auth/axios';

export const useRewardPerVideo = () => {
  const [rewardPerVideo, setRewardPerVideo] = useState<number>(2.0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRewardPerVideo = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Call the user API endpoint (not admin)
        const response = await authAxiosClient.get('/video-rewards/budget/reward-per-video');

        // console.log(' useRewardPerVideo response:', response);
        // console.log(' response.data:', response.data);
        // console.log(' response.data type:', typeof response.data);
        // console.log('response.data.rewardPerVideo:', response.data?.rewardPerVideo);
        // console.log(' response.data.rewardPerVideo type:', typeof response.data?.rewardPerVideo);

        // Extract the data from the response
        const responseData = response.data || response;
        console.log(' responseData:', responseData);

        if (responseData && typeof responseData === 'object' && 'rewardPerVideo' in responseData) {
          console.log(' Found rewardPerVideo in responseData');

          // Convert string to number if needed (e.g., "4.00" → 4.00)
          const rewardValue = typeof responseData.rewardPerVideo === 'string'
            ? parseFloat(responseData.rewardPerVideo)
            : responseData.rewardPerVideo;

          console.log(' rewardValue:', rewardValue);
          console.log(' rewardValue type:', typeof rewardValue);

          if (typeof rewardValue === 'number' && !isNaN(rewardValue)) {
            setRewardPerVideo(rewardValue);
            console.log(' Reward per video set to:', rewardValue, 'XUT');
          } else {
            console.warn(' Invalid reward value, using default 2.0 XUT');
            setRewardPerVideo(2.0);
          }
        } else {
          // Fallback to default value if response format is unexpected
          console.warn(' Unexpected response format, using default 2.0 XUT');
          console.warn(' responseData:', responseData);
          console.warn(' has rewardPerVideo:', 'rewardPerVideo' in (responseData || {}));
          setRewardPerVideo(2.0);
        }
      } catch (err: any) {
        console.warn(' Failed to fetch reward per video, using default:', err.message);
        // Fallback to default value on error
        setRewardPerVideo(2.0);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRewardPerVideo();
  }, []);

  return {
    rewardPerVideo,
    isLoading,
    error
  };
};
