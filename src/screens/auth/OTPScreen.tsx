import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// Note: react-native-otp-verify is Android-only and doesn't work on iOS
// We'll implement a safe wrapper that only enables OTP auto-reading on Android
const OtpAutoReader = {
  isAvailable: () => Platform.OS === 'android',
  
  getOtp: async (): Promise<string | null> => {
    if (Platform.OS !== 'android') return null;
    
    try {
      // Import dynamically to avoid iOS import issues
      const RNOtpVerify = require('react-native-otp-verify').default;
      return await RNOtpVerify.getOtp();
    } catch (error) {
      console.log('OTP auto-read not available:', error);
      return null;
    }
  },
  
  addListener: (callback: (otp: string) => void) => {
    if (Platform.OS !== 'android') return;
    
    try {
      const RNOtpVerify = require('react-native-otp-verify').default;
      RNOtpVerify.addListener(callback);
    } catch (error) {
      console.log('OTP listener not available:', error);
    }
  },
  
  removeListener: () => {
    if (Platform.OS !== 'android') return;
    
    try {
      const RNOtpVerify = require('react-native-otp-verify').default;
      RNOtpVerify.removeListener();
    } catch (error) {
      console.log('OTP listener removal failed:', error);
    }
  }
};
import { authApi } from '../../api/authApi';
import { saveToken, saveUser } from '../../store/authStore';
import { colors } from '../../theme/theme';

type RootStackParamList = {
  OTP: { phone: string };
  ProfileSetup: undefined;
  Main: undefined;
};

type OTPScreenRouteProp = RouteProp<RootStackParamList, 'OTP'>;
type OTPScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OTP'>;

const OTPScreen: React.FC = () => {
  const navigation = useNavigation<OTPScreenNavigationProp>();
  const route = useRoute<OTPScreenRouteProp>();
  const { phone } = route.params;

  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Auto-read OTP for Android only
    if (OtpAutoReader.isAvailable()) {
      OtpAutoReader.getOtp()
        .then((otp: string | null) => {
          if (otp && otp.length === 4) {
            const otpArray = otp.split('');
            setOtp(otpArray);
            handleVerifyOTP(otp);
          }
        })
        .catch((error: any) => {
          console.log('Auto OTP read error:', error);
        });

      OtpAutoReader.addListener((otp: string) => {
        if (otp && otp.length === 4) {
          const otpArray = otp.split('');
          setOtp(otpArray);
          handleVerifyOTP(otp);
        }
      });
    }

    return () => {
      if (OtpAutoReader.isAvailable()) {
        OtpAutoReader.removeListener();
      }
    };
  }, []);

  useEffect(() => {
    // Auto-submit when all 4 digits are entered
    const otpString = otp.join('');
    if (otpString.length === 4 && /^\d+$/.test(otpString)) {
      handleVerifyOTP(otpString);
    }
  }, [otp]);

  useEffect(() => {
    // Resend timer countdown
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    // Handle backspace
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (otpString?: string) => {
    const otpToVerify = otpString || otp.join('');
    
    if (otpToVerify.length !== 4 || !/^\d+$/.test(otpToVerify)) {
      Alert.alert('Error', 'Please enter a valid 4-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.verifyOTP({ phone, otp: otpToVerify });
      
      // Save token and user data
      await saveToken(response.token);
      await saveUser({
        id: response.user.id,
        name: response.user.name || '',
        email: response.user.email || '',
        phone: response.user.phone,
      });

      // Navigate based on profile completion
      if (response.user.profile_complete) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else {
        navigation.replace('ProfileSetup');
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Invalid OTP. Please try again.'
      );
      // Clear OTP inputs on error
      setOtp(['', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    try {
      await authApi.sendOTP({ phone });
      setResendTimer(30);
      setCanResend(false);
      setOtp(['', '', '', '']);
      inputRefs.current[0]?.focus();
      Alert.alert('Success', 'OTP sent successfully');
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to resend OTP. Please try again.'
      );
    }
  };

  const renderOTPInput = (index: number) => (
    <TextInput
      key={index}
      ref={(ref) => {
        inputRefs.current[index] = ref;
      }}
      style={styles.otpInput}
      value={otp[index]}
      onChangeText={(value) => handleOtpChange(value, index)}
      onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
      keyboardType="number-pad"
      maxLength={1}
      secureTextEntry
      editable={!isLoading}
      autoFocus={index === 0}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>Verify OTP</Text>

          {/* Phone Number */}
          <Text style={styles.subtitle}>OTP sent to {phone}</Text>

          {/* OTP Inputs */}
          <View style={styles.otpContainer}>
            {[0, 1, 2, 3].map(renderOTPInput)}
          </View>

          {/* Loading Indicator */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={styles.loadingText}>Verifying...</Text>
            </View>
          )}

          {/* Resend OTP */}
          <View style={styles.resendContainer}>
            {canResend ? (
              <TouchableOpacity onPress={handleResendOTP}>
                <Text style={styles.resendText}>Resend OTP</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.timerText}>Resend in {resendTimer}s</Text>
            )}
          </View>

          {/* Change Number */}
          <TouchableOpacity
            style={styles.changeNumberButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.changeNumberText}>Change Number</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  otpInput: {
    width: 60,
    height: 60,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.textPrimary,
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resendText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  timerText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  changeNumberButton: {
    alignItems: 'center',
  },
  changeNumberText: {
    fontSize: 16,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
});

export default OTPScreen;
