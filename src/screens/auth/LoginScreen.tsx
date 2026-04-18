import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { authApi } from '../../api/authApi';
import { colors } from '../../theme/theme';

type RootStackParamList = {
  Login: undefined;
  OTP: { phone: string };
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const [hasTextError, setHasTextError] = useState(false);

  const isValidPhone = phoneNumber.length === 10 && /^\d+$/.test(phoneNumber);
  const showPhoneError = touched && phoneNumber.length > 0 && (phoneNumber.length < 10 || hasTextError);
  const showRequiredError = touched && phoneNumber.length === 0;

  const handlePhoneChange = (value: string) => {
    if (/\D/.test(value)) {
      setHasTextError(true);
    } else {
      setHasTextError(false);
    }
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 10) {
      setPhoneNumber(numericValue);
    }
  };

  const handleSendOTP = async () => {
    setTouched(true);
    if (!isValidPhone) return;

    setIsLoading(true);
    try {
      await authApi.sendOTP({ phone: phoneNumber });
      navigation.navigate('OTP', { phone: phoneNumber });
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to send OTP. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>SmartPujari</Text>
            </View>
            <Text style={styles.logoSubtitle}>
              Trusted pandits for every sacred occasion
            </Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Login to continue</Text>
            <Text style={styles.cardSubtitle}>Enter your mobile number</Text>

            {/* Phone Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Mobile Number</Text>

              <View style={styles.phoneRow}>
                {/* Country code badge */}
                <View style={[
                  styles.countryBadge,
                  (showPhoneError || showRequiredError || hasTextError) && styles.inputError,
                ]}>
                  <Text style={styles.countryCode}>+91</Text>
                </View>

                {/* Phone input */}
                <TextInput
                  style={[
                    styles.phoneInput,
                    (showPhoneError || showRequiredError || hasTextError)
                      ? styles.inputError
                      : isValidPhone
                        ? styles.inputSuccess
                        : null,
                  ]}
                  placeholder="Enter mobile number"
                  placeholderTextColor="#9ca3af"
                  value={phoneNumber}
                  onChangeText={handlePhoneChange}
                  onBlur={() => setTouched(true)}
                  onFocus={() => setTouched(false)}
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={!isLoading}
                />
              </View>

              {/* Errors */}
              {hasTextError && (
                <Text style={styles.errorText}>
                  Please enter valid mobile number (digits only)
                </Text>
              )}
              {showPhoneError && !hasTextError && (
                <Text style={styles.errorText}>
                  Please enter a valid 10-digit mobile number
                </Text>
              )}
              {showRequiredError && (
                <Text style={styles.errorText}>Mobile number is required</Text>
              )}
            </View>

            <Text style={styles.helperText}>
              We'll send you an OTP to verify your number
            </Text>

            {/* Continue Button */}
            <TouchableOpacity
              style={[
                styles.continueBtn,
                (!isValidPhone || isLoading) && styles.continueBtnDisabled,
              ]}
              onPress={handleSendOTP}
              disabled={!isValidPhone || isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.continueBtnText}>Continue</Text>
              )}
            </TouchableOpacity>

            {/* Terms */}
            <Text style={styles.termsText}>
              By continuing, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>

        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF9',
  },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
    justifyContent: 'center',
  },

  // Logo
  logoContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  logoText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  logoSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },

  // Input
  inputSection: { marginBottom: 12 },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 8,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  countryBadge: {
    width: 56,
    height: 48,
    backgroundColor: '#f9fafb',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryCode: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  phoneInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#f9fafb',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#111827',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  inputSuccess: {
    borderColor: '#f97316',
  },
  errorText: {
    fontSize: 11,
    color: '#ef4444',
    fontWeight: '500',
    marginTop: 6,
    marginLeft: 2,
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 20,
  },

  // Button
  continueBtn: {
    height: 52,
    borderRadius: 999,
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueBtnDisabled: {
    backgroundColor: '#e5e7eb',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  // Terms
  termsText: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#f97316',
    fontWeight: '600',
  },
});

export default LoginScreen;