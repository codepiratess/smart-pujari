import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getToken } from '../../store/authStore';
import { colors } from '../../theme/theme';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Main: undefined;
};

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Check for token after 2.5 seconds
    const timer = setTimeout(async () => {
      try {
        const token = await getToken();
        if (token) {
          // User is logged in, navigate to main app
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        } else {
          // User not logged in, check if onboarding was seen
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
          {/* Pandit Icon Placeholder */}
          <View style={styles.iconPlaceholder}>
            <Text style={styles.iconText}>🙏</Text>
          </View>
          
          {/* App Name */}
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
