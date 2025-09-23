import { aiAxiosClient } from '@/src/app/apis/auth/axios';

export interface AIStudioTransaction {
    id: string;
    type: 'deduction' | 'refund';
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    referenceId: string;
    referenceType: string;
    description: string;
    createdAt: string;
    userId: string;
}

export interface AIStudioTransactionResponse {
    success: boolean;
    data: {
        transactions: AIStudioTransaction[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
        summary: {
            totalDeductions: number;
            totalRefunds: number;
            totalDeducted: number;
            totalRefunded: number;
            netCost: number;
        };
    };
    message: string;
}

export const aiStudioTransactionService = {
    async getAIStudioTransactions(userId: string): Promise<AIStudioTransactionResponse> {
        try {
            console.log('🚀 Calling AI Studio transactions API for user:', userId);
            console.log('🔑 Using aiAxiosClient with base URL:', aiAxiosClient.defaults.baseURL);

            // Use aiAxiosClient since the API endpoint is in the AI Studio service
            const response = await aiAxiosClient.get(`/ai-studio/transactions/${userId}`);
            console.log('✅ API call successful:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Failed to fetch AI Studio transactions:', error);
            console.error('❌ Error response:', error.response?.data);
            console.error('❌ Error status:', error.response?.status);
            throw new Error(error.response?.data?.message || 'Failed to fetch AI Studio transactions');
        }
    }
};