import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/theme';
import { panditApi, Pandit, PoojaType, Review } from '../../api/panditApi';

const PanditDetailScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute<any>();
  const { panditId } = route.params;
  const [pandit, setPandit] = useState<Pandit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPanditDetails();
  }, [panditId]);

  const loadPanditDetails = async () => {
    try {
      setLoading(true);
      const panditData = await panditApi.getPanditDetails(panditId);
      setPandit(panditData);
    } catch (error) {
      console.error('Error loading pandit details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookPandit = () => {
    if (pandit) {
      navigation.navigate('BookingSlot', { 
        panditId: pandit.id, 
        panditName: pandit.name,
        price: pandit.price 
      });
    }
  };

  const renderPoojaType = ({ item }: { item: PoojaType }) => (
    <TouchableOpacity
      style={styles.poojaCard}
      onPress={() => navigation.navigate('PoojaDetail', { poojaId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.poojaCardContent}>
        <Text style={styles.poojaName}>{item.name}</Text>
        <Text style={styles.poojaDuration}>{item.duration}</Text>
        <Text style={styles.poojaPrice}>${item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderReview = ({ item }: { item: Review }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewUserName}>{item.userName}</Text>
        <View style={styles.reviewRating}>
          {[1, 2, 3, 4, 5].map(star => (
            <Icon
              key={star}
              name={star <= item.rating ? 'star' : 'star-border'}
              size={12}
              color="#FFB800"
            />
          ))}
        </View>
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
      <Text style={styles.reviewDate}>{item.date}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!pandit) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error" size={48} color={colors.error} />
          <Text style={styles.errorText}>Unable to load pandit details</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Photo with Back Button Overlay */}
        <View style={styles.headerPhotoContainer}>
          <Image
            source={{ uri: 'https://picsum.photos/seed/pandit-header/400/220' }}
            style={styles.headerPhoto}
          />
          <TouchableOpacity
            style={styles.backButtonOverlay}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <View style={styles.backButtonCircle}>
              <Icon name="arrow-back" size={24} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Profile Photo Overlapping Header */}
        <View style={styles.profilePhotoContainer}>
          <View style={styles.profilePhotoWrapper}>
            <Image
              source={{ uri: pandit.photo }}
              style={styles.profilePhoto}
            />
          </View>
        </View>

        {/* Pandit Basic Info */}
        <View style={styles.panditInfoContainer}>
          <Text style={styles.panditName}>{pandit.name}</Text>
          <Text style={styles.panditCity}>{pandit.city}</Text>
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map(star => (
                <Icon
                  key={star}
                  name={star <= Math.floor(pandit.rating) ? 'star' : 'star-border'}
                  size={16}
                  color="#FFB800"
                />
              ))}
            </View>
            <Text style={styles.rating}>{pandit.rating}</Text>
            <Text style={styles.reviewCount}>({pandit.reviewCount} reviews)</Text>
          </View>
          <Text style={styles.panditExperience}>{pandit.experience}</Text>
          
          {/* Language Tags */}
          <View style={styles.languagesContainer}>
            {pandit.languages.map((lang, index) => (
              <View key={index} style={styles.languageTag}>
                <Text style={styles.languageText}>{lang}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{pandit.bio}</Text>
        </View>

        {/* Pooja Types Offered */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pooja Types Offered</Text>
          <FlatList
            data={pandit.poojaTypes}
            renderItem={renderPoojaType}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.poojaListContainer}
          />
        </View>

        {/* Reviews Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          <FlatList
            data={pandit.reviews}
            renderItem={renderReview}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Bottom padding for sticky bottom bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Starting from</Text>
          <Text style={styles.price}>${pandit.price}</Text>
        </View>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBookPandit}
          activeOpacity={0.8}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  // Header Photo Section
  headerPhotoContainer: {
    height: 220,
    position: 'relative',
  },
  headerPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backButtonOverlay: {
    position: 'absolute',
    top: 40,
    left: 16,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Profile Photo Section (Instagram-style)
  profilePhotoContainer: {
    alignItems: 'center',
    marginTop: -40, // Overlap with header photo
    zIndex: 1,
  },
  profilePhotoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePhoto: {
    width: 72,
    height: 72,
    borderRadius: 36,
    resizeMode: 'cover',
  },
  // Pandit Info Section
  panditInfoContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  panditName: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  panditCity: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  rating: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  panditExperience: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  // Language Tags (Orange Pills)
  languagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  languageTag: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 4,
    marginVertical: 4,
  },
  languageText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  // Section Styles
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  bioText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  // Pooja Types Section
  poojaListContainer: {
    paddingRight: 16,
  },
  poojaCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 160,
    borderWidth: 1,
    borderColor: colors.border,
  },
  poojaCardContent: {
    alignItems: 'center',
  },
  poojaName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  poojaDuration: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  poojaPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  // Reviews Section
  reviewCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewUserName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  reviewDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  // Bottom Bar
  bottomPadding: {
    height: 100,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  priceContainer: {
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  price: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
  },
  bookButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PanditDetailScreen;
