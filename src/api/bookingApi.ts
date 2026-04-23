import { apiClient } from './apiClient';

export type BookingStatus = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  booking_id: string;
  pooja_name: string;
  status: BookingStatus;
  status_label: string;
  pandit_name: string;
  date: string;
  time: string;
  address: string;
  amount: number;
  type: string | null;
  coupon: string | null;
  action: string | null;
}

export interface BookingDetail extends Booking {
  description?: string;
  duration?: string;
  pandit_phone?: string;
  pandit_email?: string;
  payment_method?: string;
  payment_status?: string;
}

const mapBooking = (item: any): Booking => ({
  id: item.booking_id,
  booking_id: item.booking_id,
  pooja_name: item.pooja_name,
  status: item.status as BookingStatus,
  status_label: item.status_label,
  pandit_name: item.pandit_name,
  date: item.date,
  time: item.time,
  address: item.address,
  amount: item.amount,
  type: item.type,
  coupon: item.coupon,
  action: item.action,
});

export const bookingApi = {
  getBookings: async (status: BookingStatus): Promise<Booking[]> => {
    // ✅ Always fetch all — client-side filter karo
    const response: any = await apiClient.get('/bookings');

    if (!response?.success || !Array.isArray(response?.data)) {
      return [];
    }

    const all = response.data.map(mapBooking);

    // ✅ Client-side filter
    if (status === 'all') return all;
    return all.filter((b: Booking) => b.status === status);
  },

  getBookingDetail: async (bookingId: string): Promise<BookingDetail> => {
    const response: any = await apiClient.get(`/bookings/${bookingId}`);
    const item = response?.data;

    return {
      ...mapBooking(item),
      description: item.description,
      duration: item.duration,
      pandit_phone: item.pandit_phone,
      pandit_email: item.pandit_email,
      payment_method: item.payment_method,
      payment_status: item.payment_status,
    };
  },

  cancelBooking: async (bookingId: string): Promise<{ success: boolean; message: string }> => {
    return await apiClient.post(`/bookings/${bookingId}/cancel`);
  },
};