import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Animated,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../theme/theme';

const { width, height } = Dimensions.get('window');

type OnboardingSlide = {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
};

type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Main: undefined;
};

type OnboardingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const slides: OnboardingSlide[] = [
    {
      id: 1,
      title: 'Book Trusted Pandits',
      subtitle: 'Find verified pandits near you for all puja ceremonies',
      icon: '📱',
    },
    {
      id: 2,
      title: 'Easy Booking',
      subtitle: 'Select pooja type, pandit, date and time in minutes',
      icon: '📅',
    },
    {
      id: 3,
      title: 'Verified Experts',
      subtitle: 'All pandits are background verified and rated by users',
      icon: '⭐',
    },
  ];

  useEffect(() => {
    // Check if onboarding was already seen
    const checkOnboardingStatus = async () => {
      try {
        const onboardingSeen = await AsyncStorage.getItem('onboarding_seen');
        if (onboardingSeen) {
          navigation.replace('Login');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };
    checkOnboardingStatus();
  }, [navigation]);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('onboarding_seen', 'true');
    navigation.replace('Login');
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem('onboarding_seen', 'true');
    navigation.replace('Login');
  };

  const handleDotPress = (index: number) => {
    setCurrentIndex(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={styles.slide}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{item.icon}</Text>
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
    </View>
  );

  const renderDotIndicator = (index: number) => {
    const isActive = index === currentIndex;
    return (
      <TouchableOpacity
        key={index}
        style={[styles.dot, isActive && styles.activeDot]}
        onPress={() => handleDotPress(index)}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        {/* Slides */}
        <FlatList
          ref={flatListRef}
          data={slides}
          renderItem={renderSlide}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(
              event.nativeEvent.contentOffset.x / width
            );
            setCurrentIndex(index);
          }}
          style={styles.flatList}
        />

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Dot Indicators */}
          <View style={styles.dotContainer}>
            {slides.map((_, index) => renderDotIndicator(index))}
          </View>

          {/* Next/Get Started Button */}
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skipButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
  },
  skipText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  flatList: {
    flex: 1,
  },
  slide: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  icon: {
    fontSize: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomSection: {
    paddingHorizontal: 40,
    paddingBottom: 40,
    alignItems: 'center',
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: colors.primary,
    width: 24,
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  nextButtonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: '600',
  },
});

export default OnboardingScreen;
