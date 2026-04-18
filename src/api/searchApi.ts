import { apiClient } from './apiClient';

interface SearchResult {
  id: string;
  name: string;
  type: 'pooja' | 'pandit';
  description?: string;
  image?: string;
  rating?: number;
  reviewCount?: number;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
}

// Mock search data for development
const mockPoojaTypes = [
  { id: '1', name: 'Satyanarayan Pooja', type: 'pooja' as const, description: 'Prosperity and happiness pooja' },
  { id: '2', name: 'Ganesh Pooja', type: 'pooja' as const, description: 'Remove obstacles and bring success' },
  { id: '3', name: 'Lakshmi Pooja', type: 'pooja' as const, description: 'Wealth and prosperity pooja' },
  { id: '4', name: 'Shiv Pooja', type: 'pooja' as const, description: 'Lord Shiva worship' },
  { id: '5', name: 'Durga Pooja', type: 'pooja' as const, description: 'Goddess Durga worship' },
  { id: '6', name: 'Hanuman Pooja', type: 'pooja' as const, description: 'Strength and courage pooja' },
];

const mockPandits = [
  { id: '1', name: 'Pandit Ramesh Sharma', type: 'pandit' as const, description: '10 years experience', rating: 4.8, reviewCount: 156 },
  { id: '2', name: 'Pandit Suresh Patel', type: 'pandit' as const, description: '8 years experience', rating: 4.6, reviewCount: 98 },
  { id: '3', name: 'Pandit Vijay Kumar', type: 'pandit' as const, description: '15 years experience', rating: 4.9, reviewCount: 203 },
  { id: '4', name: 'Pandit Mahesh Joshi', type: 'pandit' as const, description: '12 years experience', rating: 4.7, reviewCount: 142 },
  { id: '5', name: 'Pandit Amit Kumar', type: 'pandit' as const, description: '6 years experience', rating: 4.5, reviewCount: 87 },
];

const searchMockApi = {
  search: async (query: string): Promise<SearchResult[]> => {
    // Simulate API delay
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 300);
    });

    const lowerQuery = query.toLowerCase();
    const results: SearchResult[] = [];

    // Search in pooja types
    mockPoojaTypes.forEach(pooja => {
      if (pooja.name.toLowerCase().includes(lowerQuery)) {
        results.push(pooja);
      }
    });

    // Search in pandits
    mockPandits.forEach(pandit => {
      if (pandit.name.toLowerCase().includes(lowerQuery)) {
        results.push(pandit);
      }
    });

    return results;
  },
};

// Use mock API for development when backend is not available
const USE_MOCK_API = __DEV__;

export const searchApi = {
  search: async (query: string): Promise<SearchResult[]> => {
    if (USE_MOCK_API) {
      return await searchMockApi.search(query);
    }
    return await apiClient.get('/api/search', { params: { q: query } });
  },
};

export type { SearchResult };
