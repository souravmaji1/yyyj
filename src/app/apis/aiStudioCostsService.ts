import { paymentAxiosClient } from './auth/axios';

export interface AIStudioCosts {
  imageCost: number;
  videoCost: number;
  enhancementCost: number;
  downloadCost: number;
  faceSwapCost: number;
  audioCost: number;
  audiobookCost: number;
  threeDCost: number;
}

class AIStudioCostsService {
  private costs: AIStudioCosts = {
    imageCost: 15,
    videoCost: 25,
    enhancementCost: 10,
    downloadCost: 5,
    faceSwapCost: 18,
    audioCost: 20,
    audiobookCost: 30,
    threeDCost: 30
  };

  async getAIStudioCosts(): Promise<AIStudioCosts> {
    try {
          const response = await paymentAxiosClient.get('/getAIStudioCosts');
      if (response.data.success) {
        // Merge API response with defaults for missing costs
        const apiCosts = response.data.data;
        this.costs = {
          imageCost: apiCosts.imageCost || this.costs.imageCost,
          videoCost: apiCosts.videoCost || this.costs.videoCost,
          enhancementCost: apiCosts.enhancementCost || this.costs.enhancementCost,
          downloadCost: apiCosts.downloadCost || this.costs.downloadCost,
          faceSwapCost: apiCosts.faceSwapCost || this.costs.faceSwapCost,
          audioCost: apiCosts.audioCost || this.costs.audioCost,
          audiobookCost: apiCosts.audiobookCost || this.costs.audiobookCost,
          threeDCost: apiCosts.threeDCost || this.costs.threeDCost,
        };
        return this.costs;
      }
      return this.costs; // Return default costs if API fails
    } catch (error) {
      console.error('Failed to fetch AI Studio costs:', error);
      return this.costs; // Return default costs on error
    }
  }

  getDefaultCosts(): AIStudioCosts {
    return this.costs;
  }
}

export const aiStudioCostsService = new AIStudioCostsService();