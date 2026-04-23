import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://13.232.175.231/api/v1';

const backendAxios = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

backendAxios.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SlotItem {
  slot_start: string;
  slot_end: string;
  is_booked: boolean;
}

export interface CartAddon {
  addon_id: number;
  pandit_addon_id: number;
  addon_name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface CartItem {
  id: number;
  item_id: string;
  pandit_id: number;
  pandit_pooja_id: number;
  price: string;
  addons: CartAddon[];
  meta: {
    date: string;
    slot_start: string;
    slot_end: string;
    duration: string;
    pooja_name: string;
    pooja_price: string;
    number_of_guests: number;
    special_instructions: string;
  };
  pandit_pooja: {
    id: number;
    price: string;
    duration: string;
    pooja_type: {
      id: number;
      name: string;
      image: string;
      description: string;
    };
  };
  pandit: {
    id: number;
    experience_years: number;
    rating: number;
    languages: string[];
    operating_city: string;
  };
}

export interface Cart {
  cart_id: string;
  user_id: number;
  base_price: number;
  addons_total: number;
  sub_total: number;
  platform_fee: number;
  tax_amount: number;
  total_amount: number;
  total_payable: number;
  discount_amount: number;
  coupon_code: string | null;
  items: CartItem[];
  address: any | null;
}

export interface AddToCartPayload {
  pandit_pooja_id: number;
  pandit_id: number;
  date: string;           // YYYY-MM-DD
  slot_start: string;     // HH:MM
  slot_end: string;       // HH:MM
  number_of_guests: number;
  special_instructions?: string;
  addons: { pandit_addon_id: number; quantity: number }[];
  address_id?: number;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const cartApi = {
  getSlots: async (panditId: number, date: string): Promise<SlotItem[]> => {
    const res = await backendAxios.get(`/pandits/${panditId}/slots`, {
      params: { date },
    });
    // API returns array or object with data
    const data = res.data?.data ?? res.data ?? [];
    return Array.isArray(data) ? data : [];
  },

  addToCart: async (payload: AddToCartPayload): Promise<any> => {
    const res = await backendAxios.post('/cart', payload);
    return res.data;
  },

  getCart: async (): Promise<Cart | null> => {
    const res = await backendAxios.get('/cart');
    return res.data?.data ?? null;
  },

  updateCartAddress: async (addressId: number): Promise<any> => {
    const res = await backendAxios.put('/cart/address', { address_id: addressId });
    return res.data;
  },

  updateCartAddons: async (itemId: string, addons: { pandit_addon_id: number; quantity: number }[]): Promise<any> => {
    const res = await backendAxios.put(`/cart/items/${itemId}/addons`, { addons });
    return res.data;
  },

  clearCart: async (): Promise<any> => {
    const res = await backendAxios.delete('/cart');
    return res.data;
  },

  applyCoupon: async (couponCode: string): Promise<any> => {
    const res = await backendAxios.post('/cart/coupon', { coupon_code: couponCode });
    return res.data;
  },

  checkout: async (paymentMethod: string): Promise<any> => {
    const res = await backendAxios.post('/bookings', { payment_method: paymentMethod });
    return res.data;
  },
};