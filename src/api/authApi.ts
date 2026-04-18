import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Base client (mirrors your web axiosInstance) ───────────────────────────
const BASE_URL = 'http://13.232.175.231/api/v1';

const backendAxios = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// Attach auth token to every request
backendAxios.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Types ───────────────────────────────────────────────────────────────────

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

export interface UpdateProfileRequest {
  full_name: string;
  email?: string;
  aadhaar_pan?: {
    uri: string;
    name: string;
    type: string;
  };
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const authApi = {
  /**
   * Send OTP — matches web: POST /auth/send-otp { mobile }
   */
  sendOTP: async (data: SendOTPRequest): Promise<void> => {
    await backendAxios.post('/auth/send-otp', {
      mobile: data.phone,
    });
  },

  /**
   * Verify OTP — matches web: POST /auth/verify-otp { mobile, otp }
   */
  verifyOTP: async (data: VerifyOTPRequest): Promise<VerifyOTPResponse> => {
    const response = await backendAxios.post('/auth/verify-otp', {
      mobile: data.phone,
      otp: data.otp,
    });
    const res = response.data;

    // Save token immediately
    if (res?.token) {
      await AsyncStorage.setItem('authToken', res.token);
    }

    // Normalise to expected shape
    return {
      token: res.token,
      user: {
        id: String(res.user_id || res.user?.id),
        name: res.user?.full_name || res.user?.name || '',
        email: res.user?.email || '',
        phone: data.phone,
        profile_complete: res.is_profile_completed ?? res.user?.profile_complete ?? false,
      },
    };
  },

  /**
   * Get profile — matches web: GET /profile
   */
  getProfile: async (): Promise<any> => {
    const response = await backendAxios.get('/profile');
    return response.data;
  },

  /**
   * Update profile — matches web: PUT /profile
   * Sends FormData if document is attached, JSON otherwise
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<any> => {
    if (data.aadhaar_pan) {
      const formData = new FormData();
      formData.append('full_name', data.full_name);
      if (data.email) formData.append('email', data.email);
      formData.append('aadhaar_pan', {
        uri: data.aadhaar_pan.uri,
        name: data.aadhaar_pan.name,
        type: data.aadhaar_pan.type,
      } as any);
      // Laravel FormData PUT fix
      formData.append('_method', 'PUT');

      const response = await backendAxios.post('/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }

    // JSON path
    const response = await backendAxios.put('/profile', {
      full_name: data.full_name,
      email: data.email,
    });
    return response.data;
  },

  /**
   * Upload profile image — matches web: POST /profile/image
   */
  uploadProfileImage: async (asset: {
    uri: string;
    fileName?: string;
    type?: string;
  }): Promise<any> => {
    const formData = new FormData();
    formData.append('profile_image', {
      uri: asset.uri,
      name: asset.fileName || 'profile.jpg',
      type: asset.type || 'image/jpeg',
    } as any);

    const response = await backendAxios.post('/profile/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Profile setup (legacy — kept for backward compat)
   */
  profileSetup: async (formData: FormData): Promise<any> => {
    const response = await backendAxios.post('/auth/profile-setup', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};