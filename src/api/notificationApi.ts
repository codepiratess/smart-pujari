import { apiClient } from './apiClient';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  meta: {
    booking_id?: number;
    pooja_name?: string;
    date?: string;
    amount?: string;
    duration?: string;
    slot_start?: string;
    slot_end?: string;
  } | null;
}

interface NotificationApiResponse {
  status: boolean;
  data: {
    current_page: number;
    data: any[];
    last_page: number;
    total: number;
    next_page_url: string | null;
  };
}

const mapNotification = (item: any): Notification => ({
  id:         item.id,
  title:      item.title,
  message:    item.message,
  type:       item.type,
  is_read:    item.is_read,
  created_at: item.created_at,
  meta:       item.meta ?? null,
});

export const notificationApi = {
  getAll: async (): Promise<Notification[]> => {
    const res = await apiClient.get<NotificationApiResponse>('/notifications');
    if (!res.status || !Array.isArray(res.data?.data)) return [];
    return res.data.data.map(mapNotification);
  },

  markAsRead: async (id: number): Promise<void> => {
    await apiClient.post(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.post('/notifications/read-all');
  },
};