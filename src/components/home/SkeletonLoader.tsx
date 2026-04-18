import React from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { colors } from '../../theme/theme';

const { width } = Dimensions.get('window');

interface SkeletonLoaderProps {
  width?: number;
  height?: number;
  style?: any;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width: skeletonWidth = width,
  height: skeletonHeight = 20,
  style,
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmerAnimation.start();
    return () => shimmerAnimation.stop();
  }, [animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-skeletonWidth, skeletonWidth],
  });

  return (
    <View style={[styles.container, { width: skeletonWidth, height: skeletonHeight }, style]}>
      <View style={styles.skeleton} />
      <Animated.View
        style={[
          styles.shimmer,
          {
            width: skeletonWidth * 0.5,
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
};

// Specialized skeleton components
export const SearchBarSkeleton: React.FC = () => (
  <SkeletonLoader width={width - 32} height={48} style={styles.searchSkeleton} />
);

export const BannerSkeleton: React.FC = () => (
  <SkeletonLoader width={width - 32} height={180} style={styles.bannerSkeleton} />
);

export const PoojaCardSkeleton: React.FC = () => (
  <View style={styles.poojaCardContainer}>
    <SkeletonLoader width={140} height={100} style={styles.poojaImageSkeleton} />
    <SkeletonLoader width={120} height={16} style={styles.poojaTitleSkeleton} />
    <SkeletonLoader width={140} height={12} style={styles.poojaDescSkeleton} />
    <SkeletonLoader width={80} height={14} style={styles.poojaLinkSkeleton} />
  </View>
);

export const PanditCardSkeleton: React.FC = () => (
  <View style={styles.panditCardContainer}>
    <SkeletonLoader width={60} height={60} style={styles.panditPhotoSkeleton} />
    <SkeletonLoader width={100} height={16} style={styles.panditNameSkeleton} />
    <SkeletonLoader width={80} height={12} style={styles.panditExpSkeleton} />
    <SkeletonLoader width={60} height={14} style={styles.panditRatingSkeleton} />
    <View style={styles.languageContainer}>
      <SkeletonLoader width={40} height={20} style={styles.languageSkeleton} />
      <SkeletonLoader width={50} height={20} style={styles.languageSkeleton} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  skeleton: {
    flex: 1,
    backgroundColor: colors.border,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  searchSkeleton: {
    borderRadius: 24,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  bannerSkeleton: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  poojaCardContainer: {
    width: 160,
    marginHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  poojaImageSkeleton: {
    borderRadius: 8,
    marginBottom: 8,
  },
  poojaTitleSkeleton: {
    borderRadius: 4,
    marginBottom: 4,
  },
  poojaDescSkeleton: {
    borderRadius: 4,
    marginBottom: 8,
  },
  poojaLinkSkeleton: {
    borderRadius: 4,
  },
  panditCardContainer: {
    width: 140,
    marginHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  panditPhotoSkeleton: {
    borderRadius: 30,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  panditNameSkeleton: {
    borderRadius: 4,
    marginBottom: 4,
  },
  panditExpSkeleton: {
    borderRadius: 4,
    marginBottom: 4,
  },
  panditRatingSkeleton: {
    borderRadius: 4,
    marginBottom: 8,
  },
  languageContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  languageSkeleton: {
    borderRadius: 10,
  },
});

export default SkeletonLoader;
