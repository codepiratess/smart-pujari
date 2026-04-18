// Mock API service for testing purposes
// This simulates the backend API responses

export const mockApi = {
  sendOTP: async (data: { phone: string }): Promise<void> => {
    // Simulate API delay
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 1000);
    });
    
    // Simulate success (in real app, this would send SMS)
    console.log(`Mock: OTP sent to ${data.phone}`);
    
    // Simulate occasional failure for testing
    if (Math.random() < 0.1) { // 10% failure rate
      throw new Error('Network error: Failed to send OTP');
    }
  },

  verifyOTP: async (data: { phone: string; otp: string }): Promise<{
    token: string;
    user: {
      id: string;
      name?: string;
      email?: string;
      phone: string;
      profile_complete: boolean;
    };
  }> => {
    // Simulate API delay
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });
    
    // Mock verification - accept "1234" as valid OTP for testing
    if (data.otp === '1234') {
      return {
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: 'user-' + Date.now(),
          name: undefined,
          email: undefined,
          phone: data.phone,
          profile_complete: false, // User needs to complete profile
        }
      };
    } else {
      throw new Error('Invalid OTP. Please try again.');
    }
  },

  profileSetup: async (data: { name: string; email?: string; phone: string }): Promise<{
    user: {
      id: string;
      name: string;
      email?: string;
      phone: string;
      profile_complete: boolean;
    };
  }> => {
    // Simulate API delay
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 1000);
    });
    
    const { name, email, phone } = data;
    
    return {
      user: {
        id: 'user-' + Date.now(),
        name: name || 'User',
        email: email || undefined,
        phone: phone || '+1234567890',
        profile_complete: true,
      }
    };
  }
};
