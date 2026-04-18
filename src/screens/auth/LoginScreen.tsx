import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
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
  const [countryCode, setCountryCode] = useState('+91');
  const [isLoading, setIsLoading] = useState(false);

  const countries = [
    { code: '+91', name: 'India', flag: 'IN' },
    { code: '+1', name: 'USA', flag: 'US' },
    { code: '+44', name: 'UK', flag: 'GB' },
  ];

  const isPhoneValid = phoneNumber.length === 10 && /^\d+$/.test(phoneNumber);

  const handleSendOTP = async () => {
    if (!isPhoneValid) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.sendOTP({ phone: `${countryCode}${phoneNumber}` });
      navigation.navigate('OTP', { phone: `${countryCode}${phoneNumber}` });
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to send OTP. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderCountrySelector = () => (
    <TouchableOpacity style={styles.countrySelector}>
      <Text style={styles.flagEmoji}>IN</Text>
      <Text style={styles.countryCode}>{countryCode}</Text>
      <Text style={styles.dropdownArrow}>+</Text>
    </TouchableOpacity>
  );

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
            <View style={styles.iconPlaceholder}>
              <Text style={styles.iconText}>SmartPujari</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Enter your mobile number</Text>

          {/* Phone Input */}
          <View style={styles.phoneInputContainer}>
            {renderCountrySelector()}
            <TextInput
              style={styles.phoneInput}
              placeholder="Enter phone number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              maxLength={10}
              editable={!isLoading}
            />
          </View>

          {/* Send OTP Button */}
          <TouchableOpacity
            style={[
              styles.sendOTPButton,
              (!isPhoneValid || isLoading) && styles.disabledButton,
            ]}
            onPress={handleSendOTP}
            disabled={!isPhoneValid || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.background} size="small" />
            ) : (
              <Text style={styles.sendOTPButtonText}>Send OTP</Text>
            )}
          </TouchableOpacity>

          {/* Terms */}
          <Text style={styles.termsText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 32,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  flagEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginRight: 4,
  },
  dropdownArrow: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    paddingHorizontal: 16,
  },
  sendOTPButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  disabledButton: {
    backgroundColor: colors.border,
  },
  sendOTPButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default LoginScreen;
