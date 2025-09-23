import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import authAxiosClient from '@/src/app/apis/auth/axios';
import { RootState } from '@/src/store';

// Notification types based on the backend enum
export enum NotificationType {
  ORDER = 'order',
  PAYMENT = 'payment',
  ACCOUNT = 'account',
  SECURITY = 'security',
  GENERAL = 'general',
  AI_QUERY = 'ai-query'
}

// Notification interface
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: NotificationType;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

// Counts interface
export interface NotificationCounts {
  total: number;
  unread: number;
  read: number;
  byType: {
    security: number;
    order: number;
    payment: number;
    account: number;
    general: number;
    'ai-query': number;
  };
}

// Pagination interface
export interface NotificationPagination {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}

// Grouped notifications interface
export interface GroupedNotifications {
  security: Notification[];
  order: Notification[];
  payment: Notification[];
  account: Notification[];
  general: Notification[];
  'ai-query': Notification[];
}

// Main response interface
export interface NotificationsResponse {
  notifications: GroupedNotifications;
  counts: NotificationCounts;
  pagination: NotificationPagination;
}

// State interface
interface NotificationState {
  notifications: GroupedNotifications;
  counts: NotificationCounts | null;
  pagination: NotificationPagination | null;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: {
    security: [],
    order: [],
    payment: [],
    account: [],
    general: [],
    'ai-query': []
  },
  counts: null,
  pagination: null,
  loading: false,
  error: null
};

// Async thunk for fetching notifications
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params: { type?: string; page?: number; limit?: number; isRead?: boolean } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.type) queryParams.append('type', params.type);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.isRead !== undefined) queryParams.append('isRead', params.isRead.toString());

      const response = await authAxiosClient.get(`/notifications?${queryParams.toString()}`);
      
      if (response.data.status) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message || 'Failed to fetch notifications');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

// Async thunk for marking notifications as read
export const markNotificationsAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationIds: string[], { rejectWithValue }) => {
    try {
      const response = await authAxiosClient.post('/notifications/mark-read', {
        notificationIds
      });
      
      if (response.data.status) {
        return response.data;
      }
      return rejectWithValue(response.data.message || 'Failed to mark notifications as read');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark notifications as read');
    }
  }
);

// Async thunk for marking all notifications as read
export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAxiosClient.post('/notifications/mark-all-read');
      
      if (response.data.status) {
        return response.data;
      }
      return rejectWithValue(response.data.message || 'Failed to mark all notifications as read');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all notifications as read');
    }
  }
);

// Async thunk for deleting a notification
export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const response = await authAxiosClient.delete(`/notifications/${notificationId}`);
      if (response.data.status) {
        return notificationId;
      }
      return rejectWithValue(response.data.message || 'Failed to delete notification');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete notification');
    }
  }
);

// Create the slice
const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotifications: (state) => {
      state.notifications = {
        security: [],
        order: [],
        payment: [],
        account: [],
        general: [],
        'ai-query': []
      };
      state.counts = null;
      state.pagination = null;
      state.error = null;
    },
    clearErrors: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<NotificationsResponse>) => {
        state.loading = false;
        state.notifications = action.payload.notifications;
        state.counts = action.payload.counts;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Mark notifications as read
    builder
      .addCase(markNotificationsAsRead.pending, (state) => {
        // Optimistic update: mark notifications as read immediately
        const allNotifications = [
          ...state.notifications.security,
          ...state.notifications.order,
          ...state.notifications.payment,
          ...state.notifications.account,
          ...state.notifications.general,
          ...state.notifications['ai-query']
        ];
        
        // Update counts optimistically
        if (state.counts) {
          const unreadCount = allNotifications.filter(n => !n.isRead).length;
          state.counts.unread = Math.max(0, unreadCount);
          state.counts.read = state.counts.total - state.counts.unread;
        }
      })
      .addCase(markNotificationsAsRead.fulfilled, (state) => {
        // Success - optimistic update already applied
        state.error = null;
      })
      .addCase(markNotificationsAsRead.rejected, (state, action) => {
        state.error = action.payload as string;
        // Could revert optimistic update here if needed
      });

    // Mark all notifications as read
    builder
      .addCase(markAllNotificationsAsRead.pending, (state) => {
        // Optimistic update: mark all notifications as read immediately
        Object.keys(state.notifications).forEach((group) => {
          // @ts-ignore
          state.notifications[group] = state.notifications[group].map((notification) => ({
            ...notification,
            isRead: true
          }));
        });
        
        // Update counts optimistically
        if (state.counts) {
          state.counts.unread = 0;
          state.counts.read = state.counts.total;
        }
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        // Success - optimistic update already applied
        state.error = null;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.error = action.payload as string;
        // Could revert optimistic update here if needed
      });

    // Delete notification
    builder
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const id = action.payload;
        // Remove from all groups
        Object.keys(state.notifications).forEach((group) => {
          // @ts-ignore
          state.notifications[group] = state.notifications[group].filter((n) => n.id !== id);
        });
        // Update counts if needed
        if (state.counts) {
          state.counts.total = Math.max(0, state.counts.total - 1);
          state.counts.unread = Math.max(0, state.counts.unread - 1);
          state.counts.read = Math.max(0, state.counts.read - 1);
        }
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  }
});

// Export actions
export const { clearNotifications, clearErrors } = notificationSlice.actions;

// Export selectors
export const selectNotifications = (state: RootState) => state.notifications.notifications;
export const selectNotificationCounts = (state: RootState) => state.notifications.counts;
export const selectNotificationPagination = (state: RootState) => state.notifications.pagination;
export const selectNotificationsLoading = (state: RootState) => state.notifications.loading;
export const selectNotificationsError = (state: RootState) => state.notifications.error;

// Helper selectors
export const selectAllNotifications = (state: RootState) => {
  const notifications = state.notifications.notifications;
  return [
    ...notifications.security,
    ...notifications.order,
    ...notifications.payment,
    ...notifications.account,
    ...notifications.general,
    ...notifications['ai-query']
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const selectUnreadNotifications = (state: RootState) => {
  return selectAllNotifications(state).filter(notification => !notification.isRead);
};

export const selectReadNotifications = (state: RootState) => {
  return selectAllNotifications(state).filter(notification => notification.isRead);
};

export default notificationSlice.reducer; 