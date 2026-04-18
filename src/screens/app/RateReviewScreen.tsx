import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
  Alert,
  Image,
  Share,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { colors } from '../../theme/theme';
import { reviewApi, ReviewRequest } from '../../api/reviewApi';
import { bookingApi, BookingDetail } from '../../api/bookingApi';

const RateReviewScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute<any>();
  const { bookingId } = route.params;
  
  const [bookingDetail, setBookingDetail] = useState<BookingDetail | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    loadBookingDetail();
  }, [bookingId]);

  const loadBookingDetail = async () => {
    try {
      setLoading(true);
      const detail = await bookingApi.getBookingDetail(bookingId);
      setBookingDetail(detail);
    } catch (error) {
      console.error('Error loading booking detail:', error);
      Alert.alert('Error', 'Unable to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const getRatingLabel = (stars: number): string => {
    switch (stars) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return '';
    }
  };

  const handleImageUpload = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      maxWidth: 800,
      maxHeight: 600,
      quality: 0.8 as any,
      selectionLimit: 3 - uploadedImages.length,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const newImages = response.assets.map(asset => asset.uri || '');
        setUploadedImages(prev => [...prev, ...newImages].slice(0, 3));
      }
    });
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setShowError(true);
      return;
    }

    try {
      setSubmitting(true);
      setShowError(false);

      const reviewData: ReviewRequest = {
        booking_id: bookingId,
        rating,
        comment: reviewText.trim() || undefined,
        photos: uploadedImages,
      };

      await reviewApi.createReview(bookingId, reviewData);
      
      Alert.alert(
        'Review Submitted!',
        'Thank you for your feedback. Your review has been submitted successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Unable to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!bookingDetail) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error" size={48} color={colors.error} />
          <Text style={styles.errorText}>Unable to load booking details</Text>
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
        <Text style={styles.headerTitle}>Rate Your Experience</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Instructions */}
        <Text style={styles.instructions}>
          Share your feedback about the pandit and pooja service
        </Text>

        {/* Booking Card */}
        <View style={styles.bookingCard}>
          <View style={styles.bookingHeader}>
            <View style={styles.bookingInfo}>
              <Text style={styles.poojaName}>{bookingDetail.poojaName}</Text>
              <Text style={styles.panditName}>{bookingDetail.panditName}</Text>
              <Text style={styles.bookingId}>ID: {bookingDetail.bookingId}</Text>
            </View>
            <View style={styles.panditAvatar}>
              <Icon name="person" size={24} color="#FFFFFF" />
            </View>
          </View>
          
          <View style={styles.bookingDetails}>
            <View style={styles.detailRow}>
              <Icon name="event" size={16} color={colors.textSecondary} />
              <Text style={styles.detailText}>{bookingDetail.date}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="schedule" size={16} color={colors.textSecondary} />
              <Text style={styles.detailText}>{bookingDetail.time}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="location-on" size={16} color={colors.textSecondary} />
              <Text style={styles.detailText} numberOfLines={2}>
                {bookingDetail.address}
              </Text>
            </View>
          </View>
        </View>

        {/* Rating Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How was your experience?</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                style={styles.starButton}
                onPress={() => setRating(star)}
                onPressIn={() => setHoverRating(star)}
                onPressOut={() => setHoverRating(0)}
                activeOpacity={0.7}
              >
                <Icon
                  name="star"
                  size={40}
                  color={
                    star <= (hoverRating || rating)
                      ? '#FF6B35'
                      : '#E0E0E0'
                  }
                />
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <Text style={styles.ratingLabel}>{getRatingLabel(rating)}</Text>
          )}
          {showError && (
            <Text style={styles.errorText}>Please select a rating</Text>
          )}
        </View>

        {/* Review Text */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Write a review (optional)</Text>
          <TextInput
            style={styles.reviewInput}
            placeholder="Share your experience..."
            placeholderTextColor={colors.textSecondary}
            value={reviewText}
            onChangeText={setReviewText}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={300}
          />
          <Text style={styles.characterCount}>
            {reviewText.length} / 300
          </Text>
        </View>

        {/* Photo Upload */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Add Photos <Text style={styles.optionalText}>(optional)</Text>
          </Text>
          
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleImageUpload}
            disabled={uploadedImages.length >= 3}
            activeOpacity={0.7}
          >
            <View style={styles.uploadIcon}>
              <Icon name="photo-camera" size={24} color={colors.primary} />
            </View>
            <Text style={styles.uploadText}>Upload images</Text>
            <Text style={styles.uploadSubtext}>
              JPG / PNG (Max 5MB) - {3 - uploadedImages.length} remaining
            </Text>
          </TouchableOpacity>

          {uploadedImages.length > 0 && (
            <View style={styles.uploadedImagesContainer}>
              {uploadedImages.map((image, index) => (
                <View key={index} style={styles.uploadedImageContainer}>
                  <Image source={{ uri: image }} style={styles.uploadedImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                    activeOpacity={0.7}
                  >
                    <Icon name="close" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Skip Button */}
        <View style={styles.skipContainer}>
          <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (rating === 0 || submitting) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={rating === 0 || submitting}
          activeOpacity={0.8}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Review</Text>
          )}
        </TouchableOpacity>
      </View>
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
  content: {
    flex: 1,
  },
  instructions: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
    marginTop: 16,
    marginBottom: 24,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  bookingInfo: {
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
  panditAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingDetails: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  optionalText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
  },
  ratingLabel: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '500',
    textAlign: 'center',
  },
  reviewInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
    minHeight: 100,
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  uploadButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    padding: 24,
    alignItems: 'center',
  },
  uploadIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF6B3515',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  uploadedImagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 12,
  },
  uploadedImageContainer: {
    position: 'relative',
  },
  uploadedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  skipText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  bottomPadding: {
    height: 100,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.border,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RateReviewScreen;
