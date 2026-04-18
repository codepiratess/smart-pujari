import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  SafeAreaView,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/theme';
import { reviewApi, Review } from '../../api/reviewApi';

const MyReviewsScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMyReviews();
  }, []);

  const loadMyReviews = async () => {
    try {
      setLoading(true);
      const reviewsData = await reviewApi.getMyReviews();
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
      Alert.alert('Error', 'Unable to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMyReviews();
    setRefreshing(false);
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            name={star <= rating ? 'star' : 'star-border'}
            size={16}
            color="#FF6B35"
          />
        ))}
      </View>
    );
  };

  const renderReviewCard = ({ item }: { item: Review }) => (
    <View style={styles.reviewCard}>
      {/* Header */}
      <View style={styles.reviewHeader}>
        <View style={styles.reviewInfo}>
          <Text style={styles.poojaName}>{item.poojaName}</Text>
          <Text style={styles.panditName}>{item.panditName}</Text>
          <Text style={styles.bookingId}>{item.bookingId}</Text>
        </View>
        <View style={styles.ratingContainer}>
          {renderStars(item.rating)}
          <Text style={styles.ratingText}>{item.rating}.0</Text>
        </View>
      </View>

      {/* Date */}
      <Text style={styles.reviewDate}>{item.date}</Text>

      {/* Comment */}
      {item.comment && (
        <Text style={styles.reviewComment}>{item.comment}</Text>
      )}

      {/* Photos */}
      {item.photos && item.photos.length > 0 && (
        <View style={styles.photosContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {item.photos.map((photo, index) => (
              <Image
                key={index}
                source={{ uri: photo }}
                style={styles.reviewPhoto}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Verified Badge */}
      {item.isVerified && (
        <View style={styles.verifiedBadge}>
          <Icon name="verified" size={14} color="#4CAF50" />
          <Text style={styles.verifiedText}>Verified Review</Text>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="rate-review" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyText}>No reviews yet</Text>
      <Text style={styles.emptySubtext}>
        Start by rating your completed bookings
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => navigation.navigate('MyBookings')}
        activeOpacity={0.8}
      >
        <Text style={styles.browseButtonText}>View My Bookings</Text>
      </TouchableOpacity>
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Reviews</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Reviews List */}
      <FlatList
        data={reviews}
        renderItem={renderReviewCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  listContainer: {
    padding: 16,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewInfo: {
    flex: 1,
  },
  poojaName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  panditName: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  bookingId: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  ratingContainer: {
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  reviewDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  reviewComment: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: 12,
  },
  photosContainer: {
    marginBottom: 12,
  },
  reviewPhoto: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#4CAF5015',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MyReviewsScreen;
