import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Share,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/theme';
import { paymentApi, BookingConfirmation } from '../../api/paymentApi';

const BookingConfirmationScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute<any>();
  const { bookingId } = route.params;
  
  const [bookingConfirmation, setBookingConfirmation] = useState<BookingConfirmation | null>(null);
  const [loading, setLoading] = useState(true);
  const [animating, setAnimating] = useState(true);

  useEffect(() => {
    loadBookingConfirmation();
    
    // Stop animation after 2 seconds
    const timer = setTimeout(() => {
      setAnimating(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [bookingId]);

  const loadBookingConfirmation = async () => {
    try {
      setLoading(true);
      const confirmation = await paymentApi.getBookingConfirmation(bookingId);
      setBookingConfirmation(confirmation);
    } catch (error) {
      console.error('Error loading booking confirmation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      // Generate invoice PDF URL
      const invoiceUrl = `https://api.smartpujari.com/invoices/${bookingId}.pdf`;
      
      // Open the URL in browser
      const supported = await Linking.canOpenURL(invoiceUrl);
      if (supported) {
        await Linking.openURL(invoiceUrl);
      } else {
        // For demo, show alert
        alert(`Invoice would be downloaded from: ${invoiceUrl}`);
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Unable to download invoice');
    }
  };

  const handleShareBooking = async () => {
    try {
      const shareMessage = `
        Booking Confirmed! #${bookingConfirmation?.bookingId}
        Pandit: ${bookingConfirmation?.panditName}
        Pooja: ${bookingConfirmation?.poojaType}
        Date: ${bookingConfirmation?.date}
        Time: ${bookingConfirmation?.time}
        Amount: $${bookingConfirmation?.amount}
        
        Download the SmartPujari app for more details!
      `.trim();

      await Share.share({
        message: shareMessage,
        title: 'SmartPujari Booking Confirmation',
      });
    } catch (error) {
      console.error('Error sharing booking:', error);
    }
  };

  const handleGoToBookings = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Bookings' }],
    });
  };

  const handleBackToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading booking details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Animation */}
        <View style={styles.successContainer}>
          <View style={[styles.successCircle, animating && styles.successCircleAnimating]}>
            <Icon name="check" size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successSubtitle}>
            Your booking has been successfully confirmed
          </Text>
        </View>

        {/* Booking Details */}
        {bookingConfirmation && (
          <View style={styles.detailsContainer}>
            <View style={styles.bookingIdContainer}>
              <Text style={styles.bookingIdLabel}>Booking ID</Text>
              <Text style={styles.bookingId}>{bookingConfirmation.bookingId}</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Service Details</Text>
              <View style={styles.detailRow}>
                <Icon name="person" size={20} color={colors.textSecondary} />
                <Text style={styles.detailLabel}>Pandit</Text>
                <Text style={styles.detailValue}>{bookingConfirmation.panditName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="spa" size={20} color={colors.textSecondary} />
                <Text style={styles.detailLabel}>Pooja Type</Text>
                <Text style={styles.detailValue}>{bookingConfirmation.poojaType}</Text>
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Schedule</Text>
              <View style={styles.detailRow}>
                <Icon name="event" size={20} color={colors.textSecondary} />
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>{bookingConfirmation.date}</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="schedule" size={20} color={colors.textSecondary} />
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>{bookingConfirmation.time}</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="location-on" size={20} color={colors.textSecondary} />
                <Text style={styles.detailLabel}>Address</Text>
                <Text style={styles.detailValue} numberOfLines={2}>
                  {bookingConfirmation.address}
                </Text>
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Payment</Text>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Total Amount Paid</Text>
                <Text style={styles.paymentAmount}>${bookingConfirmation.amount}</Text>
              </View>
              <View style={styles.statusRow}>
                <View style={[styles.statusBadge, { backgroundColor: '#4CAF50' }]}>
                  <Icon name="check-circle" size={16} color="#FFFFFF" />
                  <Text style={styles.statusText}>Paid</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShareBooking}
            activeOpacity={0.8}
          >
            <Icon name="share" size={20} color={colors.primary} />
            <Text style={styles.shareButtonText}>Share Booking</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.invoiceButton}
            onPress={handleDownloadInvoice}
            activeOpacity={0.8}
          >
            <Icon name="picture-as-pdf" size={20} color={colors.primary} />
            <Text style={styles.invoiceButtonText}>Download Invoice</Text>
          </TouchableOpacity>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleGoToBookings}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Go to My Bookings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleBackToHome}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successCircleAnimating: {
    // Simple scale animation effect
    transform: [{ scale: 1.1 }],
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  detailsContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  bookingIdContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  bookingIdLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  bookingId: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
  },
  detailSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 12,
  },
  detailValue: {
    flex: 2,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
    textAlign: 'right',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
  statusRow: {
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shareButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  invoiceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  invoiceButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  navigationContainer: {
    gap: 12,
  },
  secondaryButton: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default BookingConfirmationScreen;
