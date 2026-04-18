import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { authApi } from '../../api/authApi';
import { saveToken, saveUser } from '../../store/authStore';
import { colors } from '../../theme/theme';

type RootStackParamList = {
  Login: undefined;
  OTP: { phone: string };
  ProfileSetup: undefined;
  // Main: undefined;
};

type OTPRouteProp = RouteProp<RootStackParamList, 'OTP'>;
type OTPNavProp = StackNavigationProp<RootStackParamList, 'OTP'>;

const OTPScreen: React.FC = () => {
  const navigation = useNavigation<OTPNavProp>();
  const route = useRoute<OTPRouteProp>();
  const { phone } = route.params;

  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const isComplete = otp.every(d => d !== '');

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Auto-submit when all 4 digits entered
  useEffect(() => {
    const otpStr = otp.join('');
    if (otpStr.length === 4 && /^\d+$/.test(otpStr)) {
      handleVerify(otpStr);
    }
  }, [otp]);

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpString?: string) => {
    const otpToVerify = otpString || otp.join('');
    if (otpToVerify.length !== 4) return;

    setIsLoading(true);
    try {
      const response = await authApi.verifyOTP({ phone, otp: otpToVerify });

      await saveToken(response.token);
      await saveUser({
        id: response.user.id,
        name: response.user.name || '',
        email: response.user.email || '',
        phone: response.user.phone,
      });

      if (response.user.profile_complete) {
        navigation.getParent()?.reset({ index: 0, routes: [{ name: 'App' }] });
      } else {
        navigation.replace('ProfileSetup');
      }
    } catch (error: any) {
      Alert.alert(
        'Invalid OTP',
        error.response?.data?.message || 'The code you entered is incorrect. Please try again.',
      );
      setOtp(['', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      await authApi.sendOTP({ phone });
      setTimer(30);
      setCanResend(false);
      setOtp(['', '', '', '']);
      setTouched(false);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to resend OTP.');
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={22} color="#374151" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inner}>
          <View style={styles.card}>

            {/* Title */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>Verify OTP</Text>
              <Text style={styles.subtitle}>We sent a 4-digit code to</Text>
              <Text style={styles.phone}>{phone}</Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.changeNumber}>Change number</Text>
              </TouchableOpacity>
            </View>

            {/* OTP Inputs */}
            <View style={styles.otpRow}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => { inputRefs.current[index] = ref; }}
                  style={[
                    styles.otpInput,
                    digit ? styles.otpInputFilled : null,
                    touched && !isComplete ? styles.otpInputError : null,
                  ]}
                  value={digit}
                  onChangeText={val => handleChange(index, val)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                  onBlur={() => setTouched(true)}
                  keyboardType="number-pad"
                  maxLength={1}
                  autoFocus={index === 0}
                  editable={!isLoading}
                  textAlign="center"
                />
              ))}
            </View>

            {/* Error */}
            {touched && !isComplete && (
              <View style={styles.errorRow}>
                <View style={styles.errorDot} />
                <Text style={styles.errorText}>
                  Please enter the complete 4-digit code
                </Text>
              </View>
            )}

            {/* Resend */}
            <View style={styles.resendSection}>
              <Text style={styles.resendLabel}>Didn't receive the code?</Text>
              {!canResend ? (
                <Text style={styles.timerText}>
                  Resend OTP in{' '}
                  <Text style={styles.timerHighlight}>{formatTimer(timer)}</Text>
                </Text>
              ) : (
                <TouchableOpacity onPress={handleResend}>
                  <Text style={styles.resendBtn}>Resend OTP</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              style={[styles.verifyBtn, (!isComplete || isLoading) && styles.verifyBtnDisabled]}
              onPress={() => handleVerify()}
              disabled={!isComplete || isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.verifyBtnText}>Verify</Text>
              )}
            </TouchableOpacity>

          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF9' },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },

  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 48,
    justifyContent: 'center',
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },

  // Title
  titleSection: { alignItems: 'center', marginBottom: 32 },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: { fontSize: 13, color: '#6b7280' },
  phone: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginTop: 4,
  },
  changeNumber: {
    fontSize: 14,
    color: '#f97316',
    fontWeight: '600',
    marginTop: 8,
  },

  // OTP inputs
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  otpInput: {
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
  },
  otpInputFilled: {
    borderColor: '#f97316',
    backgroundColor: '#fff7ed',
  },
  otpInputError: {
    borderColor: '#ef4444',
  },

  // Error
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 12,
  },
  errorDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#ef4444',
  },
  errorText: {
    fontSize: 11,
    color: '#ef4444',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Resend
  resendSection: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  resendLabel: { fontSize: 12, color: '#6b7280' },
  timerText: { fontSize: 14, color: '#374151' },
  timerHighlight: { color: '#f97316', fontWeight: '600' },
  resendBtn: {
    fontSize: 14,
    color: '#f97316',
    fontWeight: '600',
  },

  // Button
  verifyBtn: {
    height: 52,
    borderRadius: 999,
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  verifyBtnDisabled: {
    backgroundColor: '#e5e7eb',
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default OTPScreen;