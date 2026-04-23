import { apiClient } from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SavedAddress {
  id: number;
  address_label: 'Home' | 'Work' | 'Temple' | 'Other';
  address_line: string;
  address_line_2: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  landmark: string | null;
  contact_name: string;
  contact_phone: string;
  is_default: boolean;
}

export interface AddressPayload {
  address_label: string;
  address_line: string;
  address_line_2: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  landmark?: string;
  contact_name: string;
  contact_phone: string;
  is_default: boolean;
}

export const getUserId = async (): Promise<number | null> => {
  try {
    // Try 'user' object first (set during login)
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user?.id) return Number(user.id);
    }
    // Fallback: try direct 'userId' key
    const userId = await AsyncStorage.getItem('userId');
    if (userId && !isNaN(Number(userId))) return Number(userId);

    return null;
  } catch (e) {
    console.error('getUserId error:', e);
    return null;
  }
};

export const addressApi = {
  getAll: async (): Promise<SavedAddress[]> => {
    const userId = await getUserId();
    if (!userId) throw new Error('USER_NOT_FOUND');
    const res = await apiClient.get<{ success: boolean; data: SavedAddress[] }>(
      `/users/${userId}/addresses`,
    );
    return res.data ?? [];
  },

  create: async (payload: AddressPayload): Promise<void> => {
    const userId = await getUserId();
    if (!userId) throw new Error('USER_NOT_FOUND');
    await apiClient.post(`/users/${userId}/addresses`, payload);
  },

  update: async (addressId: number, payload: AddressPayload): Promise<void> => {
    const userId = await getUserId();
    if (!userId) throw new Error('USER_NOT_FOUND');
    await apiClient.put(`/users/${userId}/addresses/${addressId}`, payload);
  },

  delete: async (addressId: number): Promise<void> => {
    const userId = await getUserId();
    if (!userId) throw new Error('USER_NOT_FOUND');
    await apiClient.delete(`/users/${userId}/addresses/${addressId}`);
  },
};
