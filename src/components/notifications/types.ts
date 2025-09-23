export interface Notification {
    id: string;
    type: "order" | "delivery" | "payment" | "alert" | "security" | "account" | "general" | "ai-query";
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    actionUrl?: string;
  }

export interface SupportTicketDetails {
  id: number;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  previousStatus?: 'open' | 'in_progress' | 'resolved' | 'closed';
  additional_info?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}
  