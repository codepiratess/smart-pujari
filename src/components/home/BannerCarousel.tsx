import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../../theme/theme';

const { width } = Dimensions.get('window');

interface Banner {
  id: string;
  image: string;
  title?: string;
  link?: string;
}

interface BannerCarouselProps {
  banners: Banner[];
  loading?: boolean;
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({
  banners,
  loading = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<any>>(null);
  const navigation = useNavigation<StackNavigationProp<any>>();
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    // Auto-scroll every 3 seconds
    if (banners.length > 1 && !loading) {
      autoScrollRef.current = setInterval(() => {
        const nextIndex = (currentIndex + 1) % banners.length;
        setCurrentIndex(nextIndex);
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
      }, 3000);
    }

    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    };
  }, [currentIndex, banners.length, loading]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const index = Math.round(contentOffset.x / (width - 32));
    setCurrentIndex(index);
  };

  const handleBannerPress = (banner: Banner) => {
    // TODO: Navigate to banner link or handle banner action
    console.log('Banner pressed:', banner);
  };

  const renderBanner = ({ item }: { item: Banner }) => (
    <TouchableOpacity
      style={styles.bannerContainer}
      onPress={() => handleBannerPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.bannerPlaceholder}>
        <Text style={styles.bannerText}>{item.title || 'Banner'}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderDot = (index: number) => {
    const isActive = index === currentIndex;
    return (
      <View
        key={index}
        style={[
          styles.dot,
          isActive ? styles.activeDot : styles.inactiveDot,
        ]}
      />
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading banners...</Text>
        </View>
      </View>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={banners}
        renderItem={renderBanner}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        onMomentumScrollEnd={handleScroll}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.flatListContent}
      />
      
      {/* Dot indicators */}
      <View style={styles.dotContainer}>
        {banners.map((_, index) => renderDot(index))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  flatListContent: {
    paddingHorizontal: 16,
  },
  bannerContainer: {
    width: width - 32,
    marginHorizontal: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bannerPlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  bannerText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: colors.primary,
  },
  inactiveDot: {
    backgroundColor: colors.border,
  },
  loadingContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    marginHorizontal: 16,
  },
  loadingText: {
    color: colors.textSecondary,
  },
});

export default BannerCarousel;
