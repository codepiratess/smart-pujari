import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getToken } from '../../store/authStore';
import { colors } from '../../theme/theme';

const { width, height } = Dimensions.get('window');

type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
};

type SplashNavProp = StackNavigationProp<AuthStackParamList, 'Splash'>;

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<SplashNavProp>();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(async () => {
      try {
        const token = await getToken();
        if (token) {
          // ✅ Climb up to RootNavigator to reset to 'App'
          navigation.getParent()?.reset({
            index: 0,
            routes: [{ name: 'App' }],
          });
        } else {
          navigation.replace('Onboarding');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        navigation.replace('Onboarding');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [fadeAnim, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, { opacity: fadeAnim }]}>
          <View style={styles.iconPlaceholder}>
            <Text style={styles.iconText}>🙏</Text>
          </View>
          <Text style={styles.appName}>SmartPujari</Text>
          <Text style={styles.tagline}>Your Trusted Puja Partner</Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  iconPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconText: {
    fontSize: 40,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default SplashScreen;