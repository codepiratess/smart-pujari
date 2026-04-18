import { apiClient } from './apiClient';

export interface Pandit {
  id: string;
  name: string;
  photo: string;
  city: string;
  experience: string;
  rating: number;
  reviewCount: number;
  price: number;
  languages: string[];
  bio?: string;
  poojaTypes?: PoojaType[];
  reviews?: Review[];
  distance?: number;
}

export interface PoojaType {
  id: string;
  name: string;
  price: number;
  duration: string;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  status: 'available' | 'booked' | 'closed';
}

export interface BookingRequest {
  panditId: string;
  date: string;
  timeSlot: string;
  attendees: number;
  specialRequest?: string;
  address: string;
  amount: number;
}

export interface BookingResponse {
  id: string;
  paymentIntent: string;
  amount: number;
  status: string;
}

// Mock data for development
const mockPandits: Pandit[] = [
  {
    id: '1',
    name: 'Pandit Ramesh Sharma',
    photo: 'https://picsum.photos/seed/pandit1/200/200',
    city: 'Delhi',
    experience: '10 years experience',
    rating: 4.8,
    reviewCount: 156,
    price: 1500,
    languages: ['Hindi', 'English', 'Sanskrit'],
    bio: 'Experienced pandit specializing in Vedic rituals and ceremonies. Known for precise pronunciation and traditional approach.',
    distance: 2.5,
  },
  {
    id: '2',
    name: 'Pandit Suresh Patel',
    photo: 'https://picsum.photos/seed/pandit2/200/200',
    city: 'Mumbai',
    experience: '8 years experience',
    rating: 4.6,
    reviewCount: 98,
    price: 1200,
    languages: ['Hindi', 'Gujarati'],
    bio: 'Traditional pandit with expertise in various poojas and havans.',
    distance: 5.2,
  },
  {
    id: '3',
    name: 'Pandit Vijay Kumar',
    photo: 'https://picsum.photos/seed/pandit3/200/200',
    city: 'Bangalore',
    experience: '15 years experience',
    rating: 4.9,
    reviewCount: 203,
    price: 2000,
    languages: ['Hindi', 'English', 'Tamil'],
    bio: 'Senior pandit with deep knowledge of ancient scriptures and rituals.',
    distance: 8.1,
  },
  {
    id: '4',
    name: 'Pandit Mahesh Joshi',
    photo: 'https://picsum.photos/seed/pandit4/200/200',
    city: 'Pune',
    experience: '12 years experience',
    rating: 4.7,
    reviewCount: 142,
    price: 1800,
    languages: ['Hindi', 'Marathi', 'Sanskrit'],
    bio: 'Expert in traditional Maharashtrian rituals and Vedic ceremonies.',
    distance: 3.8,
  },
];

const mockReviews: Review[] = [
  {
    id: '1',
    userName: 'Rahul Verma',
    rating: 5,
    comment: 'Excellent pandit! Very knowledgeable and performed the ceremony perfectly.',
    date: '2024-01-15',
  },
  {
    id: '2',
    userName: 'Priya Sharma',
    rating: 4,
    comment: 'Good experience, punctual and professional.',
    date: '2024-01-10',
  },
];

const mockTimeSlots: TimeSlot[] = [
  { id: '1', time: '06:00 AM', available: true, status: 'available' },
  { id: '2', time: '07:00 AM', available: true, status: 'available' },
  { id: '3', time: '08:00 AM', available: false, status: 'booked' },
  { id: '4', time: '09:00 AM', available: true, status: 'available' },
  { id: '5', time: '10:00 AM', available: true, status: 'available' },
  { id: '6', time: '11:00 AM', available: false, status: 'booked' },
  { id: '7', time: '12:00 PM', available: true, status: 'available' },
  { id: '8', time: '01:00 PM', available: true, status: 'available' },
  { id: '9', time: '02:00 PM', available: false, status: 'booked' },
  { id: '10', time: '03:00 PM', available: true, status: 'available' },
  { id: '11', time: '04:00 PM', available: true, status: 'available' },
  { id: '12', time: '05:00 PM', available: false, status: 'closed' },
  { id: '13', time: '06:00 PM', available: true, status: 'available' },
  { id: '14', time: '07:00 PM', available: true, status: 'available' },
  { id: '15', time: '08:00 PM', available: false, status: 'booked' },
];

const panditMockApi = {
  getPandits: async (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    filters?: {
      priceRange?: [number, number];
      rating?: number;
      experience?: string;
      languages?: string[];
      distance?: number;
    };
  }): Promise<{ pandits: Pandit[]; hasMore: boolean; total: number }> => {
    // Simulate API delay
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 1000);
    });

    let filteredPandits = [...mockPandits];

    // Apply filters
    if (params?.filters) {
      const { priceRange, rating, experience, languages, distance } = params.filters;

      if (priceRange) {
        filteredPandits = filteredPandits.filter(p => 
          p.price >= priceRange[0] && p.price <= priceRange[1]
        );
      }

      if (rating) {
        filteredPandits = filteredPandits.filter(p => p.rating >= rating);
      }

      if (experience) {
        const expYears = parseInt(experience);
        filteredPandits = filteredPandits.filter(p => {
          const panditExp = parseInt(p.experience);
          return panditExp >= expYears;
        });
      }

      if (languages && languages.length > 0) {
        filteredPandits = filteredPandits.filter(p => 
          languages.some(lang => p.languages.includes(lang))
        );
      }

      if (distance) {
        filteredPandits = filteredPandits.filter(p => 
          (p.distance || 0) <= distance
        );
      }
    }

    // Apply sorting
    if (params?.sortBy) {
      switch (params.sortBy) {
        case 'alphabetical':
          filteredPandits.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'newest':
          filteredPandits.sort((a, b) => b.id.localeCompare(a.id));
          break;
        case 'popular':
          filteredPandits.sort((a, b) => b.rating - a.rating);
          break;
      }
    }

    // Apply pagination
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPandits = filteredPandits.slice(startIndex, endIndex);

    return {
      pandits: paginatedPandits,
      hasMore: endIndex < filteredPandits.length,
      total: filteredPandits.length,
    };
  },

  getPanditDetails: async (id: string): Promise<Pandit> => {
    // Simulate API delay
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 800);
    });

    const pandit = mockPandits.find(p => p.id === id);
    if (!pandit) {
      throw new Error('Pandit not found');
    }

    // Add additional details
    return {
      ...pandit,
      poojaTypes: [
        { id: '1', name: 'Satyanarayan Pooja', price: 1500, duration: '2 hours' },
        { id: '2', name: 'Ganesh Pooja', price: 800, duration: '1 hour' },
        { id: '3', name: 'Lakshmi Pooja', price: 1200, duration: '1.5 hours' },
        { id: '4', name: 'Shiv Pooja', price: 1000, duration: '1 hour' },
      ],
      reviews: mockReviews,
    };
  },

  getTimeSlots: async (panditId: string, date: string): Promise<TimeSlot[]> => {
    // Simulate API delay
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });

    return mockTimeSlots;
  },

  createBooking: async (booking: BookingRequest): Promise<BookingResponse> => {
    // Simulate API delay
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 1500);
    });

    return {
      id: 'BK' + Date.now(),
      paymentIntent: 'pi_' + Math.random().toString(36).substr(2, 9),
      amount: booking.amount,
      status: 'pending_payment',
    };
  },
};

// Use mock API for development when backend is not available
const USE_MOCK_API = __DEV__;

export const panditApi = {
  getPandits: async (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    filters?: {
      priceRange?: [number, number];
      rating?: number;
      experience?: string;
      languages?: string[];
      distance?: number;
    };
  }): Promise<{ pandits: Pandit[]; hasMore: boolean; total: number }> => {
    if (USE_MOCK_API) {
      return await panditMockApi.getPandits(params);
    }
    
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    
    if (params?.filters) {
      const { priceRange, rating, experience, languages, distance } = params.filters;
      if (priceRange) {
        queryParams.append('minPrice', priceRange[0].toString());
        queryParams.append('maxPrice', priceRange[1].toString());
      }
      if (rating) queryParams.append('rating', rating.toString());
      if (experience) queryParams.append('experience', experience);
      if (languages) queryParams.append('languages', languages.join(','));
      if (distance) queryParams.append('distance', distance.toString());
    }
    
    return await apiClient.get(`/api/pandits?${queryParams.toString()}`);
  },

  getPanditDetails: async (id: string): Promise<Pandit> => {
    if (USE_MOCK_API) {
      return await panditMockApi.getPanditDetails(id);
    }
    return await apiClient.get(`/api/pandits/${id}`);
  },

  getTimeSlots: async (panditId: string, date: string): Promise<TimeSlot[]> => {
    if (USE_MOCK_API) {
      return await panditMockApi.getTimeSlots(panditId, date);
    }
    return await apiClient.get(`/api/pandits/${panditId}/slots?date=${date}`);
  },

  createBooking: async (booking: BookingRequest): Promise<BookingResponse> => {
    if (USE_MOCK_API) {
      return await panditMockApi.createBooking(booking);
    }
    return await apiClient.post('/api/bookings/create', booking);
  },
};
