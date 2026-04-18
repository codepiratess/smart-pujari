import axios from 'axios';
import { apiClient } from './apiClient';

// Types
export interface Banner {
  id: string;
  image: string;
  title?: string;
  link?: string;
}

export interface PoojaType {
  id: number;
  name: string;
  description: string;
  image: string;
  default_price?: string;
  duration?: string;
  status?: string;
}

// Extended interface for OnlinePoojaScreen compatibility
export interface OnlinePoojaType extends PoojaType {
  price?: number;
}

export interface Pandit {
  id: string;
  name: string;
  experience: string;
  rating: number;
  reviewCount: number;
  languages: string[];
  photo?: string;
  location?: string;
  services?: string[];
}

// Backend API response shape for pandits
interface PanditApiItem {
  id: number;
  full_name: string;
  mobile_number: string;
  email?: string;
  role: string;
  status: string;
  profile_picture?: string;
  pandit_profile: {
    id: number;
    user_id: number;
    experience_years: number;
    rating: number;
    languages: string[];
    operating_city: string;
    bio: string;
    approval_status: string;
    created_at: string;
    updated_at: string;
  };
  created_at: string;
  updated_at: string;
}

interface PanditsApiResponse {
  status: boolean;
  data: {
    current_page: number;
    data: PanditApiItem[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: any[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

interface PoojaTypeApiItem {
  id: number;
  name: string;
  description: string;
  duration: string;
  default_price: string;
  image: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface PoojaTypesApiResponse {
  success: boolean;
  message: string;
  data: PoojaTypeApiItem[];
}

const mapPandit = (item: PanditApiItem): Pandit => {
  const profilePicture = item.profile_picture;
  const photoUrl = profilePicture
    ? `http://13.232.175.231/storage/${profilePicture}`
    : undefined;

  return {
    id: String(item.id),
    name: item.full_name,
    experience: `${item.pandit_profile.experience_years} years experience`,
    rating: item.pandit_profile.rating,
    reviewCount: 0,
    languages: item.pandit_profile.languages,
    photo: photoUrl,
    location: item.pandit_profile.operating_city || 'India',
    services: [],
  };
};

const mapPoojaType = (item: PoojaTypeApiItem): PoojaType => ({
  id: item.id,
  name: item.name,
  description: item.description,
  image: item.image,
  default_price: item.default_price,
  duration: item.duration,
  status: item.status,
});

// Backend API response shape for online poojas
interface OnlinePoojaApiItem {
  id: number;
  name: string;
  description: string;
  duration: string;
  price: string;
  image: string;
}

interface OnlinePoojasApiResponse {
  success: boolean;
  message: string;
  data: OnlinePoojaApiItem[];
}

const mapOnlinePooja = (item: OnlinePoojaApiItem): PoojaType => ({
  id: item.id,
  name: item.name,
  description: item.description,
  image: item.image,
  default_price: item.price,
  duration: item.duration,
});

// Mock data
const mockBanners: Banner[] = [
  { id: '1', image: 'https://picsum.photos/seed/diwali/400/200',       title: 'Diwali Special Pooja', link: '/diwali-pooja'     },
  { id: '2', image: 'https://picsum.photos/seed/satyanarayan/400/200', title: 'Satyanarayan Katha',   link: '/satyanarayan'     },
  { id: '3', image: 'https://picsum.photos/seed/ganesh/400/200',       title: 'Ganesh Chaturthi',     link: '/ganesh-chaturthi' },
  { id: '4', image: 'https://picsum.photos/seed/navratri/400/200',     title: 'Navratri Pooja',       link: '/navratri'         },
];

const mockPandits: Pandit[] = [
  { id: '1', name: 'Pandit Ramesh Sharma', experience: '10 years experience', rating: 4.8, reviewCount: 156, languages: ['Hindi', 'English', 'Sanskrit'], photo: 'https://picsum.photos/seed/pandit1/100/100', location: 'Delhi, India',     services: ['Satyanarayan Pooja', 'Ganesh Pooja', 'Lakshmi Pooja']    },
  { id: '2', name: 'Pandit Suresh Patel',  experience: '8 years experience',  rating: 4.6, reviewCount: 98,  languages: ['Hindi', 'Gujarati'],             photo: 'https://picsum.photos/seed/pandit2/100/100', location: 'Mumbai, India',    services: ['Ganesh Pooja', 'Shiv Pooja', 'Durga Pooja']              },
  { id: '3', name: 'Pandit Vijay Kumar',   experience: '15 years experience', rating: 4.9, reviewCount: 203, languages: ['Hindi', 'English', 'Tamil'],      photo: 'https://picsum.photos/seed/pandit3/100/100', location: 'Bangalore, India', services: ['Satyanarayan Pooja', 'Lakshmi Pooja', 'Navagraha Pooja'] },
  { id: '4', name: 'Pandit Mahesh Joshi',  experience: '12 years experience', rating: 4.7, reviewCount: 142, languages: ['Hindi', 'Marathi', 'Sanskrit'],   photo: 'https://picsum.photos/seed/pandit4/100/100', location: 'Pune, India',      services: ['Satyanarayan Pooja', 'Ganesh Pooja', 'Shiv Pooja']       },
  { id: '5', name: 'Pandit Amit Verma',    experience: '6 years experience',  rating: 4.5, reviewCount: 67,  languages: ['Hindi', 'English'],              photo: 'https://picsum.photos/seed/pandit5/100/100', location: 'Chennai, India',   services: ['Ganesh Pooja', 'Hanuman Pooja', 'Lakshmi Pooja']         },
];

const backendAxios = axios.create({
  baseURL: 'http://13.232.175.231/api/v1',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

const homeMockApi = {
  getBanners: async (): Promise<Banner[]> => {
    await new Promise<void>((resolve) => setTimeout(resolve, 800));
    return mockBanners;
  },
  getNearbyPandits: async (params: { lat: number; lng: number; limit?: number }): Promise<Pandit[]> => {
    await new Promise<void>((resolve) => setTimeout(resolve, 1000));
    return params.limit ? mockPandits.slice(0, params.limit) : mockPandits;
  },
};

export const homeApi = {
  getBanners: async (): Promise<Banner[]> => {
    if (__DEV__) return homeMockApi.getBanners();
    try {
      return await apiClient.get('/api/banners');
    } catch (error) {
      console.error('Backend API error, falling back to mock:', error);
      return homeMockApi.getBanners();
    }
  },

  getPoojaTypes: async (limit?: number): Promise<PoojaType[]> => {
    try {
      const { data: response } = await backendAxios.get<PoojaTypesApiResponse>('/pooja-types');

      if (!response.success || !Array.isArray(response.data)) {
        console.warn('Unexpected pooja-types response shape:', response);
        return [];
      }

      const mapped = response.data.map(mapPoojaType);
      return limit ? mapped.slice(0, limit) : mapped;
    } catch (error) {
      console.error('Error fetching pooja types from backend:', error);
      return [];
    }
  },

  getOnlinePoojas: async (): Promise<PoojaType[]> => {
    try {
      const { data: response } = await backendAxios.get<OnlinePoojasApiResponse>('/online-poojas');

      if (!response.success || !Array.isArray(response.data)) {
        console.warn('Invalid response format from backend for online poojas');
        return [];
      }

      const mapped = response.data.map(mapOnlinePooja);
      return mapped;
    } catch (error) {
      console.error('Error fetching online poojas from backend:', error);
      return [];
    }
  },

  getNearbyPandits: async (params: { lat: number; lng: number; limit?: number }): Promise<Pandit[]> => {
    try {
      const { data: response } = await backendAxios.get<PanditsApiResponse>('/pandits');

      if (!response.status || !Array.isArray(response.data.data)) {
        console.warn('Unexpected pandits response shape:', response);
        return [];
      }

      const mapped = response.data.data.map(mapPandit);
      return params.limit ? mapped.slice(0, params.limit) : mapped;
    } catch (error) {
      console.error('Error fetching pandits from backend:', error);
      return homeMockApi.getNearbyPandits(params);
    }
  },

  getPanditDetail: async (panditId: number): Promise<any> => {
    try {
      const { data: response } = await backendAxios.get(`/pandits/${panditId}`);
      
      if (!response.status || !response.data) {
        console.warn('Unexpected pandit detail response shape:', response);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching pandit detail from backend:', error);
      return null;
    }
  },

  getPanditAddons: async (panditId: number): Promise<any[]> => {
    try {
      const { data: response } = await backendAxios.get(`/pandits/${panditId}/addons`);
      
      if (!response.success || !Array.isArray(response.data)) {
        console.warn('Unexpected pandit addons response shape:', response);
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching pandit addons from backend:', error);
      return [];
    }
  },
};