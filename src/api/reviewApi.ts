import { apiClient } from './apiClient';

export interface Review {
  id: string;
  bookingId: string;
  rating: number;
  comment: string;
  photos: string[];
  panditName: string;
  poojaName: string;
  date: string;
  isVerified: boolean;
}

export interface ReviewRequest {
  booking_id: string;
  rating: number;
  comment?: string;
  photos?: string[];
}

export interface ReferralInfo {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  totalEarnings: number;
  referralHistory: ReferralHistory[];
}

export interface ReferralHistory {
  id: string;
  referredUser: string;
  date: string;
  status: 'pending' | 'completed';
  earnings: number;
}

export interface PointsInfo {
  totalBalance: number;
  pointsHistory: PointsHistory[];
}

export interface PointsHistory {
  id: string;
  type: 'earned' | 'spent';
  amount: number;
  date: string;
  source: string;
  description: string;
}

export interface StaticContent {
  title: string;
  content: string;
  lastUpdated: string;
}

// Mock data for development
const mockReviews: Review[] = [
  {
    id: '1',
    bookingId: 'BOOK-69E0B341BA487',
    rating: 5,
    comment: 'Excellent pandit! Very professional and performed the pooja with great devotion. Would definitely recommend.',
    photos: ['https://picsum.photos/seed/review1/300/200', 'https://picsum.photos/seed/review2/300/200'],
    panditName: 'Pandit Ramesh Sharma',
    poojaName: 'Satyanarayan Pooja',
    date: '15 Apr 2024',
    isVerified: true,
  },
  {
    id: '2',
    bookingId: 'BOOK-45F2C819D3A92',
    rating: 4,
    comment: 'Good experience overall. Pandit was knowledgeable and explained the rituals well.',
    photos: [],
    panditName: 'Pandit Suresh Kumar',
    poojaName: 'Ganesh Pooja',
    date: '10 Apr 2024',
    isVerified: true,
  },
];

const mockReferralInfo: ReferralInfo = {
  referralCode: 'RAHUL123',
  referralLink: 'https://smartpujari.com/referral/RAHUL123',
  totalReferrals: 5,
  totalEarnings: 500,
  referralHistory: [
    {
      id: '1',
      referredUser: 'user@example.com',
      date: '10 Apr 2024',
      status: 'completed',
      earnings: 100,
    },
    {
      id: '2',
      referredUser: 'friend@example.com',
      date: '08 Apr 2024',
      status: 'pending',
      earnings: 0,
    },
  ],
};

const mockPointsInfo: PointsInfo = {
  totalBalance: 250,
  pointsHistory: [
    {
      id: '1',
      type: 'earned',
      amount: 50,
      date: '15 Apr 2024',
      source: 'Booking',
      description: 'Points earned from Satyanarayan Pooja booking',
    },
    {
      id: '2',
      type: 'spent',
      amount: 25,
      date: '12 Apr 2024',
      source: 'Redemption',
      description: 'Points used for discount on Ganesh Pooja',
    },
    {
      id: '3',
      type: 'earned',
      amount: 100,
      date: '05 Apr 2024',
      source: 'Referral',
      description: 'Referral bonus from friend signup',
    },
  ],
};

const mockStaticContent: Record<string, StaticContent> = {
  terms: {
    title: 'Terms & Conditions',
    content: `
      <h1>Terms & Conditions</h1>
      <p>Welcome to SmartPujari. These terms and conditions outline the rules and regulations for the use of our website and services.</p>
      
      <h2>1. Acceptance of Terms</h2>
      <p>By accessing this website, we assume you accept these terms and conditions. Do not continue to use SmartPujari if you do not agree to take all of the terms and conditions stated on this page.</p>
      
      <h2>2. License</h2>
      <p>Unless otherwise stated, SmartPujari and/or its licensors own intellectual property rights for all material on SmartPujari.</p>
      
      <h2>3. User Responsibilities</h2>
      <p>Users must provide accurate information and maintain the security of their account.</p>
      
      <h2>4. Booking Terms</h2>
      <p>All bookings are subject to availability and confirmation. Payment must be made in advance to secure your booking.</p>
    `,
    lastUpdated: '2024-04-01',
  },
  privacy: {
    title: 'Privacy Policy',
    content: `
      <h1>Privacy Policy</h1>
      <p>Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.</p>
      
      <h2>Information We Collect</h2>
      <p>We collect information you provide directly to us, such as when you create an account, make a booking, or contact us for support.</p>
      
      <h2>How We Use Your Information</h2>
      <p>We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.</p>
      
      <h2>Data Security</h2>
      <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access.</p>
    `,
    lastUpdated: '2024-04-01',
  },
  about: {
    title: 'About Us',
    content: `
      <h1>About SmartPujari</h1>
      <p>SmartPujari is your trusted platform for connecting with verified pandits for traditional Hindu ceremonies and poojas.</p>
      
      <h2>Our Mission</h2>
      <p>To make traditional Hindu rituals accessible to everyone through technology, while preserving their authenticity and spiritual significance.</p>
      
      <h2>Why Choose Us?</h2>
      <ul>
        <li>Verified and experienced pandits</li>
        <li>Transparent pricing</li>
        <li>Easy booking process</li>
        <li>Quality assurance</li>
      </ul>
      
      <h2>Our Team</h2>
      <p>We are a team of technology enthusiasts and spiritual practitioners dedicated to preserving and promoting Hindu traditions.</p>
    `,
    lastUpdated: '2024-04-01',
  },
  faqs: {
    title: 'Frequently Asked Questions',
    content: `
      <h1>Frequently Asked Questions</h1>
      
      <h2>How do I book a pandit?</h2>
      <p>Browse our list of pandits, select your preferred one, choose a date and time, and complete the payment process.</p>
      
      <h2>What payment methods are accepted?</h2>
      <p>We accept UPI, credit/debit cards, and cash on delivery.</p>
      
      <h2>Can I reschedule my booking?</h2>
      <p>Yes, you can reschedule up to 24 hours before the scheduled time, subject to pandit availability.</p>
      
      <h2>What if the pandit doesn't show up?</h2>
      <p>We offer a 100% refund if the pandit fails to arrive at the scheduled time.</p>
      
      <h2>How do I become a pandit on SmartPujari?</h2>
      <p>Contact our support team with your credentials and experience to join our platform.</p>
    `,
    lastUpdated: '2024-04-01',
  },
  'refund-policy': {
    title: 'Refund Policy',
    content: `
      <h1>Refund Policy</h1>
      <p>We want you to be completely satisfied with our services. Here's our refund policy:</p>
      
      <h2>Full Refund</h2>
      <p>You are eligible for a full refund if:</p>
      <ul>
        <li>You cancel at least 48 hours before the scheduled time</li>
        <li>The pandit fails to arrive at the scheduled time</li>
        <li>The service is not provided as described</li>
      </ul>
      
      <h2>Partial Refund</h2>
      <p>Partial refunds may be available for cancellations made 24-48 hours before the scheduled time.</p>
      
      <h2>No Refund</h2>
      <p>No refunds are available for cancellations made less than 24 hours before the scheduled time.</p>
      
      <h2>How to Request a Refund</h2>
      <p>Contact our support team with your booking details and reason for cancellation.</p>
    `,
    lastUpdated: '2024-04-01',
  },
};

const reviewMockApi = {
  createReview: async (bookingId: string, data: ReviewRequest): Promise<Review> => {
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 1000);
    });
    
    const newReview: Review = {
      id: Date.now().toString(),
      bookingId,
      rating: data.rating,
      comment: data.comment || '',
      photos: data.photos || [],
      panditName: 'Pandit Ramesh Sharma',
      poojaName: 'Satyanarayan Pooja',
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      isVerified: true,
    };
    
    return newReview;
  },

  getMyReviews: async (): Promise<Review[]> => {
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 800);
    });
    return mockReviews;
  },

  getReferralInfo: async (): Promise<ReferralInfo> => {
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 600);
    });
    return mockReferralInfo;
  },

  getPointsInfo: async (): Promise<PointsInfo> => {
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 600);
    });
    return mockPointsInfo;
  },

  getStaticContent: async (page: string): Promise<StaticContent> => {
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 400);
    });
    
    const content = mockStaticContent[page];
    if (!content) {
      throw new Error('Content not found');
    }
    
    return content;
  },
};

// Use mock API for development when backend is not available
const USE_MOCK_API = __DEV__;

export const reviewApi = {
  createReview: async (bookingId: string, data: ReviewRequest): Promise<Review> => {
    if (USE_MOCK_API) {
      return await reviewMockApi.createReview(bookingId, data);
    }
    return await apiClient.post(`/bookings/${bookingId}/rating`, data);
  },

  getMyReviews: async (): Promise<Review[]> => {
    if (USE_MOCK_API) {
      return await reviewMockApi.getMyReviews();
    }
    return await apiClient.get('/api/my-reviews');
  },

  getReferralInfo: async (): Promise<ReferralInfo> => {
    if (USE_MOCK_API) {
      return await reviewMockApi.getReferralInfo();
    }
    return await apiClient.get('/api/referral');
  },

  getPointsInfo: async (): Promise<PointsInfo> => {
    if (USE_MOCK_API) {
      return await reviewMockApi.getPointsInfo();
    }
    return await apiClient.get('/api/my-points');
  },

  getStaticContent: async (page: string): Promise<StaticContent> => {
    if (USE_MOCK_API) {
      return await reviewMockApi.getStaticContent(page);
    }
    return await apiClient.get(`/api/static/${page}`);
  },
};
