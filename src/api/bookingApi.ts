import { apiClient } from './apiClient';

export type BookingStatus = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  poojaName: string;
  status: BookingStatus;
  bookingId: string;
  panditName: string;
  panditAvatar: string;
  date: string;
  time: string;
  address: string;
  amount: number;
  createdAt: string;
  specialRequest?: string;
  attendees?: number;
}

export interface BookingDetail extends Booking {
  description: string;
  duration: string;
  panditPhone: string;
  panditEmail: string;
  paymentMethod: string;
  paymentStatus: string;
  invoiceUrl: string;
}

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  avatar: string;
  points: number;
  referralCode: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'booking' | 'payment' | 'promotion' | 'system';
}

export interface SavedAddress {
  id: string;
  label: string;
  address: string;
  isDefault: boolean;
}

// Mock data for development
const mockBookings: Booking[] = [
  {
    id: '1',
    poojaName: 'Satyanarayan Pooja',
    status: 'confirmed',
    bookingId: 'BOOK-69E0B341BA487',
    panditName: 'Pandit Ramesh Sharma',
    panditAvatar: 'https://picsum.photos/seed/pandit1/100/100',
    date: '20 Apr 2024',
    time: '06:00 AM - 08:00 AM',
    address: '123 Main St, Delhi, India',
    amount: 1850,
    createdAt: '2024-04-15T10:30:00Z',
    specialRequest: 'Please bring extra flowers',
    attendees: 5,
  },
  {
    id: '2',
    poojaName: 'Ganesh Pooja',
    status: 'pending',
    bookingId: 'BOOK-45F2C819D3A92',
    panditName: 'Pandit Suresh Kumar',
    panditAvatar: 'https://picsum.photos/seed/pandit2/100/100',
    date: '25 Apr 2024',
    time: '07:00 AM - 08:00 AM',
    address: '456 Park Ave, Mumbai, India',
    amount: 1200,
    createdAt: '2024-04-16T14:20:00Z',
    attendees: 3,
  },
  {
    id: '3',
    poojaName: 'Lakshmi Pooja',
    status: 'completed',
    bookingId: 'BOOK-78A1B3C9E4F56',
    panditName: 'Pandit Mahesh Verma',
    panditAvatar: 'https://picsum.photos/seed/pandit3/100/100',
    date: '10 Apr 2024',
    time: '06:30 AM - 08:00 AM',
    address: '789 Temple Rd, Bangalore, India',
    amount: 1500,
    createdAt: '2024-04-08T09:15:00Z',
    attendees: 4,
  },
  {
    id: '4',
    poojaName: 'Shiv Pooja',
    status: 'cancelled',
    bookingId: 'BOOK-23D8A7F1B9C42',
    panditName: 'Pandit Vijay Singh',
    panditAvatar: 'https://picsum.photos/seed/pandit4/100/100',
    date: '18 Apr 2024',
    time: '05:30 AM - 07:00 AM',
    address: '321 Shiv Colony, Varanasi, India',
    amount: 1000,
    createdAt: '2024-04-12T11:45:00Z',
    attendees: 2,
  },
];

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Booking Confirmed',
    message: 'Your Satyanarayan Pooja booking has been confirmed for 20 Apr 2024',
    time: '2 hours ago',
    isRead: false,
    type: 'booking',
  },
  {
    id: '2',
    title: 'Payment Successful',
    message: 'Payment of $1,850 for Satyanarayan Pooja has been processed successfully',
    time: '3 hours ago',
    isRead: false,
    type: 'payment',
  },
  {
    id: '3',
    title: 'New Pandit Available',
    message: 'Pandit Ramesh Sharma is now available in your area for online poojas',
    time: '1 day ago',
    isRead: true,
    type: 'promotion',
  },
  {
    id: '4',
    title: 'Booking Reminder',
    message: 'Your Ganesh Pooja is scheduled for tomorrow at 07:00 AM',
    time: '2 days ago',
    isRead: true,
    type: 'system',
  },
];

const bookingMockApi = {
  getBookings: async (status: BookingStatus): Promise<Booking[]> => {
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 800);
    });
    
    if (status === 'all') {
      return mockBookings;
    }
    return mockBookings.filter(booking => booking.status === status);
  },

  getBookingDetail: async (bookingId: string): Promise<BookingDetail> => {
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 600);
    });
    
    const booking = mockBookings.find(b => b.bookingId === bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }
    
    return {
      ...booking,
      description: 'Traditional Satyanarayan pooja performed with all rituals and mantras for prosperity and well-being',
      duration: '2 hours',
      panditPhone: '+91 98765 43210',
      panditEmail: 'ramesh.sharma@smartpujari.com',
      paymentMethod: 'UPI',
      paymentStatus: 'Paid',
      invoiceUrl: `https://api.smartpujari.com/invoices/${bookingId}.pdf`,
    };
  },

  cancelBooking: async (bookingId: string): Promise<{ success: boolean; message: string }> => {
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 1000);
    });
    
    return {
      success: true,
      message: 'Booking cancelled successfully. Refund will be processed within 5-7 business days.',
    };
  },

  getUserProfile: async (): Promise<UserProfile> => {
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });
    
    return {
      name: 'Rahul Kumar',
      phone: '+91 98765 43210',
      email: 'rahul.kumar@email.com',
      avatar: 'https://picsum.photos/seed/user/150/150',
      points: 250,
      referralCode: 'RAHUL123',
    };
  },

  updateUserProfile: async (profile: Partial<UserProfile>): Promise<UserProfile> => {
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 800);
    });
    
    return {
      name: profile.name || 'Rahul Kumar',
      phone: profile.phone || '+91 98765 43210',
      email: profile.email || 'rahul.kumar@email.com',
      avatar: profile.avatar || 'https://picsum.photos/seed/user/150/150',
      points: 250,
      referralCode: 'RAHUL123',
    };
  },

  getNotifications: async (): Promise<Notification[]> => {
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 400);
    });
    
    return mockNotifications;
  },

  markNotificationAsRead: async (notificationId: string): Promise<{ success: boolean }> => {
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 300);
    });
    
    const notification = mockNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }
    
    return { success: true };
  },

  markAllNotificationsAsRead: async (): Promise<{ success: boolean }> => {
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });
    
    mockNotifications.forEach(notification => {
      notification.isRead = true;
    });
    
    return { success: true };
  },

  getSavedAddresses: async (): Promise<SavedAddress[]> => {
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 400);
    });
    
    return [
      {
        id: '1',
        label: 'Home',
        address: '123 Main St, Delhi, India',
        isDefault: true,
      },
      {
        id: '2',
        label: 'Office',
        address: '456 Business Park, Gurgaon, India',
        isDefault: false,
      },
    ];
  },
};

// Use mock API for development when backend is not available
const USE_MOCK_API = __DEV__;

export const bookingApi = {
  getBookings: async (status: BookingStatus): Promise<Booking[]> => {
    if (USE_MOCK_API) {
      return await bookingMockApi.getBookings(status);
    }
    return await apiClient.get(`/api/my-bookings?status=${status}`);
  },

  getBookingDetail: async (bookingId: string): Promise<BookingDetail> => {
    if (USE_MOCK_API) {
      return await bookingMockApi.getBookingDetail(bookingId);
    }
    return await apiClient.get(`/api/bookings/${bookingId}`);
  },

  cancelBooking: async (bookingId: string): Promise<{ success: boolean; message: string }> => {
    if (USE_MOCK_API) {
      return await bookingMockApi.cancelBooking(bookingId);
    }
    return await apiClient.post(`/api/bookings/${bookingId}/cancel`);
  },

  getUserProfile: async (): Promise<UserProfile> => {
    if (USE_MOCK_API) {
      return await bookingMockApi.getUserProfile();
    }
    return await apiClient.get('/api/profile');
  },

  updateUserProfile: async (profile: Partial<UserProfile>): Promise<UserProfile> => {
    if (USE_MOCK_API) {
      return await bookingMockApi.updateUserProfile(profile);
    }
    return await apiClient.put('/api/profile', profile);
  },

  getNotifications: async (): Promise<Notification[]> => {
    if (USE_MOCK_API) {
      return await bookingMockApi.getNotifications();
    }
    return await apiClient.get('/api/notifications');
  },

  markNotificationAsRead: async (notificationId: string): Promise<{ success: boolean }> => {
    if (USE_MOCK_API) {
      return await bookingMockApi.markNotificationAsRead(notificationId);
    }
    return await apiClient.post(`/api/notifications/${notificationId}/read`);
  },

  markAllNotificationsAsRead: async (): Promise<{ success: boolean }> => {
    if (USE_MOCK_API) {
      return await bookingMockApi.markAllNotificationsAsRead();
    }
    return await apiClient.post('/api/notifications/read-all');
  },

  getSavedAddresses: async (): Promise<SavedAddress[]> => {
    if (USE_MOCK_API) {
      return await bookingMockApi.getSavedAddresses();
    }
    return await apiClient.get('/api/addresses');
  },
};
