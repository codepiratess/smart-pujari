import { apiClient } from './apiClient';
import { mockApi } from './mockApi';

export interface SendOTPRequest {
  phone: string;
}

export interface VerifyOTPRequest {
  phone: string;
  otp: string;
}

export interface VerifyOTPResponse {
  token: string;
  user: {
    id: string;
    name?: string;
    email?: string;
    phone: string;
    profile_complete: boolean;
  };
}

export interface ProfileSetupRequest {
  name: string;
  email?: string;
  photo?: FormData;
}

export interface ProfileSetupResponse {
  user: {
    id: string;
    name: string;
    email?: string;
    phone: string;
    profile_complete: boolean;
  };
}

// Use mock API for development when backend is not available
const USE_MOCK_API = __DEV__;

export const authApi = {
  sendOTP: async (data: SendOTPRequest): Promise<void> => {
    if (USE_MOCK_API) {
      return await mockApi.sendOTP(data);
    }
    await apiClient.post('/auth/send-otp', data);
  },

  verifyOTP: async (data: VerifyOTPRequest): Promise<VerifyOTPResponse> => {
    if (USE_MOCK_API) {
      return await mockApi.verifyOTP(data);
    }
    return await apiClient.post('/auth/verify-otp', data);
  },

  profileSetup: async (formData: FormData): Promise<ProfileSetupResponse> => {
    if (USE_MOCK_API) {
      // For mock API, return a simple success response
      return await mockApi.profileSetup({
        name: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
      });
    }
    return await apiClient.post('/auth/profile-setup', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
