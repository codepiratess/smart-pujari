import { apiClient } from './apiClient';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'pooja' | 'addon';
  image?: string;
}

export interface CartSummary {
  basePrice: number;
  addonTotal: number;
  platformFee: number;
  taxes: number;
  totalPayable: number;
  discount: number;
  pointsUsed: number;
}

export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
}

export interface PaymentVerification {
  paymentId: string;
  orderId: string;
  signature: string;
}

export interface BookingConfirmation {
  bookingId: string;
  panditName: string;
  poojaType: string;
  date: string;
  time: string;
  address: string;
  amount: number;
  status: string;
}

export interface OnlinePoojaRequest {
  poojaTypes: string[];
  date: string;
  time: string;
  specialRequest?: string;
  amount: number;
}

export interface OnlinePoojaResponse {
  requestId: string;
  status: string;
  message: string;
}

// Mock data for development
const mockCartItems: CartItem[] = [
  {
    id: '1',
    name: 'Satyanarayan Pooja',
    price: 1500,
    quantity: 1,
    type: 'pooja',
    image: 'https://picsum.photos/seed/pooja1/100/100',
  },
  {
    id: '2',
    name: 'Flowers & Garland',
    price: 200,
    quantity: 2,
    type: 'addon',
    image: 'https://picsum.photos/seed/addon1/100/100',
  },
  {
    id: '3',
    name: 'Sweets & Prasad',
    price: 150,
    quantity: 1,
    type: 'addon',
    image: 'https://picsum.photos/seed/addon2/100/100',
  },
];

const paymentMockApi = {
  getCartItems: async (): Promise<CartItem[]> => {
    // Simulate API delay
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });
    return mockCartItems;
  },

  updateCartItem: async (itemId: string, quantity: number): Promise<CartItem[]> => {
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 300);
    });
    
    const updatedItems = mockCartItems.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    );
    return updatedItems.filter(item => item.quantity > 0);
  },

  removeCartItem: async (itemId: string): Promise<CartItem[]> => {
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 300);
    });
    
    return mockCartItems.filter(item => item.id !== itemId);
  },

  getCartSummary: async (items: CartItem[], couponCode?: string, pointsToUse?: number): Promise<CartSummary> => {
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 400);
    });

    const basePrice = items.filter(item => item.type === 'pooja').reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const addonTotal = items.filter(item => item.type === 'addon').reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const platformFee = 50;
    const subtotal = basePrice + addonTotal + platformFee;
    const taxes = Math.round(subtotal * 0.18); // 18% GST
    let discount = 0;

    // Apply coupon discount
    if (couponCode === 'SAVE10') {
      discount = Math.round(subtotal * 0.1); // 10% discount
    } else if (couponCode === 'SAVE20') {
      discount = Math.round(subtotal * 0.2); // 20% discount
    }

    const pointsUsed = pointsToUse || 0;
    const pointsValue = Math.min(pointsUsed, Math.floor(subtotal * 0.1)); // Max 10% of subtotal
    const totalPayable = subtotal + taxes - discount - pointsValue;

    return {
      basePrice,
      addonTotal,
      platformFee,
      taxes,
      totalPayable: Math.max(0, totalPayable),
      discount,
      pointsUsed: pointsValue,
    };
  },

  createPaymentOrder: async (amount: number): Promise<PaymentOrder> => {
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 1000);
    });

    return {
      orderId: 'ORDER' + Date.now(),
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      razorpayOrderId: 'razorpay_order_' + Math.random().toString(36).substr(2, 9),
    };
  },

  verifyPayment: async (verification: PaymentVerification): Promise<{ success: boolean; bookingId?: string }> => {
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 1500);
    });

    // Simulate payment verification
    if (verification.paymentId && verification.orderId) {
      return {
        success: true,
        bookingId: 'BOOK-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      };
    }

    return { success: false };
  },

  getBookingConfirmation: async (bookingId: string): Promise<BookingConfirmation> => {
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 800);
    });

    return {
      bookingId,
      panditName: 'Pandit Ramesh Sharma',
      poojaType: 'Satyanarayan Pooja',
      date: '2024-04-20',
      time: '06:00 AM',
      address: '123 Main St, Delhi, India',
      amount: 1850,
      status: 'confirmed',
    };
  },

  bookOnlinePooja: async (request: OnlinePoojaRequest): Promise<OnlinePoojaResponse> => {
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 1200);
    });

    return {
      requestId: 'REQ-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      status: 'pending',
      message: 'Request sent to Admin. Pandit will be assigned shortly.',
    };
  },

  getUserPoints: async (): Promise<number> => {
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 300);
    });
    return 250; // Mock user has 250 points
  },
};

// Use mock API for development when backend is not available
const USE_MOCK_API = __DEV__;

export const paymentApi = {
  getCartItems: async (): Promise<CartItem[]> => {
    if (USE_MOCK_API) {
      return await paymentMockApi.getCartItems();
    }
    return await apiClient.get('/api/cart/items');
  },

  updateCartItem: async (itemId: string, quantity: number): Promise<CartItem[]> => {
    if (USE_MOCK_API) {
      return await paymentMockApi.updateCartItem(itemId, quantity);
    }
    return await apiClient.put(`/api/cart/items/${itemId}`, { quantity });
  },

  removeCartItem: async (itemId: string): Promise<CartItem[]> => {
    if (USE_MOCK_API) {
      return await paymentMockApi.removeCartItem(itemId);
    }
    return await apiClient.delete(`/api/cart/items/${itemId}`);
  },

  getCartSummary: async (items: CartItem[], couponCode?: string, pointsToUse?: number): Promise<CartSummary> => {
    if (USE_MOCK_API) {
      return await paymentMockApi.getCartSummary(items, couponCode, pointsToUse);
    }
    
    const params = new URLSearchParams();
    if (couponCode) params.append('coupon', couponCode);
    if (pointsToUse) params.append('points', pointsToUse.toString());
    
    return await apiClient.post(`/api/cart/summary?${params.toString()}`, { items });
  },

  createPaymentOrder: async (amount: number): Promise<PaymentOrder> => {
    if (USE_MOCK_API) {
      return await paymentMockApi.createPaymentOrder(amount);
    }
    return await apiClient.post('/api/payments/create-order', { amount });
  },

  verifyPayment: async (verification: PaymentVerification): Promise<{ success: boolean; bookingId?: string }> => {
    if (USE_MOCK_API) {
      return await paymentMockApi.verifyPayment(verification);
    }
    return await apiClient.post('/api/payments/verify', verification);
  },

  getBookingConfirmation: async (bookingId: string): Promise<BookingConfirmation> => {
    if (USE_MOCK_API) {
      return await paymentMockApi.getBookingConfirmation(bookingId);
    }
    return await apiClient.get(`/api/bookings/${bookingId}/confirmation`);
  },

  bookOnlinePooja: async (request: OnlinePoojaRequest): Promise<OnlinePoojaResponse> => {
    if (USE_MOCK_API) {
      return await paymentMockApi.bookOnlinePooja(request);
    }
    return await apiClient.post('/api/online-pooja/book', request);
  },

  getUserPoints: async (): Promise<number> => {
    if (USE_MOCK_API) {
      return await paymentMockApi.getUserPoints();
    }
    const response = await apiClient.get('/api/user/points');
    return response.points;
  },
};
