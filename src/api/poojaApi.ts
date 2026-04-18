import { apiClient } from './apiClient';

export interface PoojaType {
  id: number;
  name: string;
  description: string;
  image: string;
  default_price?: string;
  duration?: string;
  includes?: string[];
  benefits?: string[];
}

export interface PoojaDetail extends PoojaType {
  full_description: string;
  price: number;
  duration_hours: string;
  what_includes: string[];
  benefits_list: string[];
  popular: boolean;
}

// Mock data for development
const mockPoojaTypes: PoojaType[] = [
  {
    id: 1,
    name: 'Satyanarayan Pooja',
    description: 'Traditional worship of Lord Vishnu for prosperity and happiness',
    image: 'https://picsum.photos/seed/satyanarayan/400/300',
    default_price: '2100',
    duration: '2-3 hours',
  },
  {
    id: 2,
    name: 'Ganesh Pooja',
    description: 'Worship of Lord Ganesha for removing obstacles and success',
    image: 'https://picsum.photos/seed/ganesh/400/300',
    default_price: '1500',
    duration: '1-2 hours',
  },
  {
    id: 3,
    name: 'Lakshmi Pooja',
    description: 'Goddess Lakshmi worship for wealth and prosperity',
    image: 'https://picsum.photos/seed/lakshmi/400/300',
    default_price: '1800',
    duration: '2-3 hours',
  },
  {
    id: 4,
    name: 'Shiv Pooja',
    description: 'Lord Shiva worship for peace and spiritual growth',
    image: 'https://picsum.photos/seed/shiv/400/300',
    default_price: '1200',
    duration: '1-2 hours',
  },
  {
    id: 5,
    name: 'Durga Pooja',
    description: 'Goddess Durga worship for protection and strength',
    image: 'https://picsum.photos/seed/durga/400/300',
    default_price: '2500',
    duration: '3-4 hours',
  },
  {
    id: 6,
    name: 'Navagraha Pooja',
    description: 'Worship of nine planets for astrological benefits',
    image: 'https://picsum.photos/seed/navagraha/400/300',
    default_price: '3000',
    duration: '4-5 hours',
  },
];

const mockPoojaDetails: Record<number, PoojaDetail> = {
  1: {
    id: 1,
    name: 'Satyanarayan Pooja',
    description: 'Traditional worship of Lord Vishnu for prosperity and happiness',
    image: 'https://picsum.photos/seed/satyanarayan/400/300',
    default_price: '2100',
    duration: '2-3 hours',
    full_description: 'Satyanarayan Pooja is one of the most popular rituals performed to honor Lord Vishnu. This pooja is performed to seek health, wealth, and prosperity for the family. It is believed that performing this pooja with devotion brings happiness and removes obstacles from one\'s life. The ritual involves worshipping Lord Satyanarayan, a form of Vishnu, along with his consort Lakshmi.',
    price: 2100,
    duration_hours: '2-3 hours',
    what_includes: [
      'All Pooja Samagri',
      'Qualified Pandit',
      'Pooja Vidhi Instructions',
      'Online Puja Support',
      'Prasad Distribution',
      'Holy Water (Gangajal)'
    ],
    benefits_list: [
      'Health and Longevity',
      'Prosperity and Wealth',
      'Family Happiness',
      'Removal of Obstacles',
      'Spiritual Growth',
      'Peace of Mind'
    ],
    popular: true,
  },
  2: {
    id: 2,
    name: 'Ganesh Pooja',
    description: 'Worship of Lord Ganesha for removing obstacles and success',
    image: 'https://picsum.photos/seed/ganesh/400/300',
    default_price: '1500',
    duration: '1-2 hours',
    full_description: 'Ganesh Pooja is dedicated to Lord Ganesha, the remover of obstacles and the god of beginnings. This pooja is performed before starting any new venture, undertaking important tasks, or during festivals. Lord Ganesha is worshipped to seek his blessings for success, wisdom, and the removal of all obstacles in life.',
    price: 1500,
    duration_hours: '1-2 hours',
    what_includes: [
      'All Pooja Samagri',
      'Qualified Pandit',
      'Modak Prasad',
      'Pooja Instructions',
      'Sacred Thread'
    ],
    benefits_list: [
      'Removal of Obstacles',
      'Success in Endeavors',
      'Wisdom and Knowledge',
      'Good Fortune',
      'Protection from Evil'
    ],
    popular: true,
  },
  3: {
    id: 3,
    name: 'Lakshmi Pooja',
    description: 'Goddess Lakshmi worship for wealth and prosperity',
    image: 'https://picsum.photos/seed/lakshmi/400/300',
    default_price: '1800',
    duration: '2-3 hours',
    full_description: 'Lakshmi Pooja is performed to worship Goddess Lakshmi, the deity of wealth, fortune, and prosperity. This pooja is especially important during Diwali and is performed to seek the goddess\'s blessings for financial stability, abundance, and overall prosperity in life.',
    price: 1800,
    duration_hours: '2-3 hours',
    what_includes: [
      'All Pooja Samagri',
      'Qualified Pandit',
      'Lakshmi Yantra',
      'Prasad Materials',
      'Coins for Offering'
    ],
    benefits_list: [
      'Wealth and Prosperity',
      'Financial Stability',
      'Business Success',
      'Family Well-being',
      'Abundance in Life'
    ],
    popular: false,
  },
  4: {
    id: 4,
    name: 'Shiv Pooja',
    description: 'Lord Shiva worship for peace and spiritual growth',
    image: 'https://picsum.photos/seed/shiv/400/300',
    default_price: '1200',
    duration: '1-2 hours',
    full_description: 'Shiv Pooja is dedicated to Lord Shiva, the supreme deity of transformation and destruction. This pooja is performed to seek blessings for peace, spiritual growth, and liberation. Lord Shiva is worshipped in his various forms, including as the Lingam, and is considered the destroyer of evil and the transformer of consciousness.',
    price: 1200,
    duration_hours: '1-2 hours',
    what_includes: [
      'All Pooja Samagri',
      'Qualified Pandit',
      'Shivling',
      'Bilva Leaves',
      'Holy Water'
    ],
    benefits_list: [
      'Peace and Tranquility',
      'Spiritual Growth',
      'Liberation from Sins',
      'Health and Longevity',
      'Mental Clarity'
    ],
    popular: false,
  },
  5: {
    id: 5,
    name: 'Durga Pooja',
    description: 'Goddess Durga worship for protection and strength',
    image: 'https://picsum.photos/seed/durga/400/300',
    default_price: '2500',
    duration: '3-4 hours',
    full_description: 'Durga Pooja is performed to worship Goddess Durga, the embodiment of divine feminine power and protection. This pooja is especially significant during Navratri and is performed to seek the goddess\'s blessings for protection from evil, strength to overcome challenges, and victory over obstacles.',
    price: 2500,
    duration_hours: '3-4 hours',
    what_includes: [
      'All Pooja Samagri',
      'Qualified Pandit',
      'Durga Idol',
      'Flowers and Fruits',
      'Red Cloth Offering'
    ],
    benefits_list: [
      'Protection from Evil',
      'Strength and Courage',
      'Victory over Enemies',
      'Family Protection',
      'Success in Life'
    ],
    popular: true,
  },
  6: {
    id: 6,
    name: 'Navagraha Pooja',
    description: 'Worship of nine planets for astrological benefits',
    image: 'https://picsum.photos/seed/navagraha/400/300',
    default_price: '3000',
    duration: '4-5 hours',
    full_description: 'Navagraha Pooja is performed to worship the nine celestial bodies (Navagrahas) that influence human life according to Hindu astrology. This pooja is performed to mitigate the negative effects of planetary positions and to seek blessings for overall well-being, success, and prosperity.',
    price: 3000,
    duration_hours: '4-5 hours',
    what_includes: [
      'All Pooja Samagri',
      'Qualified Pandit',
      'Navagraha Yantra',
      'Planetary Gems',
      'Sacred Offerings'
    ],
    benefits_list: [
      'Astrological Benefits',
      'Planetary Peace',
      'Career Success',
      'Marital Harmony',
      'Health Benefits'
    ],
    popular: false,
  },
};

const poojaMockApi = {
  getPoojaTypes: async (): Promise<PoojaType[]> => {
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 800);
    });
    return mockPoojaTypes;
  },

  getPoojaDetail: async (poojaId: number): Promise<PoojaDetail> => {
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 600);
    });
    
    const detail = mockPoojaDetails[poojaId];
    if (!detail) {
      throw new Error('Pooja not found');
    }
    
    return detail;
  },

  searchPoojaTypes: async (query: string): Promise<PoojaType[]> => {
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 400);
    });
    
    if (!query) return mockPoojaTypes;
    
    const lowerQuery = query.toLowerCase();
    return mockPoojaTypes.filter(pooja => 
      pooja.name.toLowerCase().includes(lowerQuery) ||
      pooja.description.toLowerCase().includes(lowerQuery)
    );
  },
};

// Use mock API for development when backend is not available
const USE_MOCK_API = __DEV__;

export const poojaApi = {
  getPoojaTypes: async (): Promise<PoojaType[]> => {
    if (USE_MOCK_API) {
      return await poojaMockApi.getPoojaTypes();
    }
    return await apiClient.get('/api/pooja-types');
  },

  getPoojaDetail: async (poojaId: number): Promise<PoojaDetail> => {
    if (USE_MOCK_API) {
      return await poojaMockApi.getPoojaDetail(poojaId);
    }
    return await apiClient.get(`/api/pooja-types/${poojaId}`);
  },

  searchPoojaTypes: async (query: string): Promise<PoojaType[]> => {
    if (USE_MOCK_API) {
      return await poojaMockApi.searchPoojaTypes(query);
    }
    return await apiClient.get(`/api/pooja-types/search?q=${query}`);
  },
};
