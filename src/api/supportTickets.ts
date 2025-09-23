import authAxiosClient from '../app/apis/auth/axios';
import { SupportTicketDetails } from '../components/notifications/types';

class SupportTicketsAPI {
  /**
   * Get support ticket details by ID
   */
  async getSupportTicket(ticketId: number): Promise<SupportTicketDetails> {
    try {
      // console.log(' API Call: GET /api/user/support-tickets/' + ticketId);
      const response = await authAxiosClient.get(`/support-tickets/${ticketId}`);
      console.log('API Response:', response);
      
      // Handle nested response structure: response.data.data
      if (response?.data?.data) {
        return response.data.data as SupportTicketDetails;
      }
      
      // Fallback to direct response.data
      if (response?.data) {
        return response.data as SupportTicketDetails;
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error(' Error fetching support ticket:', error);
      throw error;
    }
  }

  /**
   * Get support ticket history/status changes
   */
  async getSupportTicketHistory(ticketId: number): Promise<any[]> {
    try {
      const response = await authAxiosClient.get(`/support-tickets/${ticketId}/history`);
      
      return response?.data || [];
    } catch (error) {
      console.error('Error fetching support ticket history:', error);
      return [];
    }
  }
}

export const supportTicketsAPI = new SupportTicketsAPI();
export default supportTicketsAPI;
