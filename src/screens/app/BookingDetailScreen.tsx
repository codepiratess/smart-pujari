import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/theme';
import { bookingApi, BookingDetail } from '../../api/bookingApi';

const BookingDetailScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute<any>();
  const { bookingId } = route.params;
  
  const [bookingDetail, setBookingDetail] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

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

  const handleCancelBooking = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? Refund will be processed within 5-7 business days.',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: confirmCancelBooking,
        },
      ]
    );
  };

  const confirmCancelBooking = async () => {
    try {
      setCancelling(true);
      const result = await bookingApi.cancelBooking(bookingId);
      
      if (result.success) {
        Alert.alert(
          'Booking Cancelled',
          result.message,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Unable to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      Alert.alert('Error', 'Unable to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!bookingDetail) return;
    
    try {
      const supported = await Linking.canOpenURL(bookingDetail.invoiceUrl);
      if (supported) {
        await Linking.openURL(bookingDetail.invoiceUrl);
      } else {
        Alert.alert('Info', `Invoice would be downloaded from: ${bookingDetail.invoiceUrl}`);
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      Alert.alert('Error', 'Unable to download invoice');
    }
  };

  const handleContactPandit = () => {
    if (!bookingDetail) return;
    
    Alert.alert(
      'Contact Pandit',
      `Phone: ${bookingDetail.panditPhone}\nEmail: ${bookingDetail.panditEmail}`,
      [
        {
          text: 'Call',
          onPress: () => Linking.openURL(`tel:${bookingDetail.panditPhone}`),
        },
        {
          text: 'Email',
          onPress: () => Linking.openURL(`mailto:${bookingDetail.panditEmail}`),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FF9800';
      case 'confirmed':
        return '#4CAF50';
      case 'completed':
        return '#9E9E9E';
      case 'cancelled':
        return '#F44336';
      default:
        return colors.primary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
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

  const canCancel = bookingDetail.status === 'pending' || bookingDetail.status === 'confirmed';

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
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.poojaName}>{bookingDetail.poojaName}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(bookingDetail.status) }]}>
              <Text style={styles.statusText}>{getStatusText(bookingDetail.status)}</Text>
            </View>
          </View>
          <Text style={styles.bookingId}>{bookingDetail.bookingId}</Text>
        </View>

        {/* Pandit Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pandit Information</Text>
          <View style={styles.panditCard}>
            <View style={styles.panditAvatar}>
              <Icon name="person" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.panditInfo}>
              <Text style={styles.panditName}>{bookingDetail.panditName}</Text>
              <Text style={styles.panditContact}>{bookingDetail.panditPhone}</Text>
              <Text style={styles.panditContact}>{bookingDetail.panditEmail}</Text>
            </View>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={handleContactPandit}
              activeOpacity={0.7}
            >
              <Icon name="call" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Booking Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Icon name="event" size={20} color={colors.textSecondary} />
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{bookingDetail.date}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="schedule" size={20} color={colors.textSecondary} />
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>{bookingDetail.time}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="location-on" size={20} color={colors.textSecondary} />
              <Text style={styles.detailLabel}>Address</Text>
              <Text style={styles.detailValue} numberOfLines={2}>
                {bookingDetail.address}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="timer" size={20} color={colors.textSecondary} />
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{bookingDetail.duration}</Text>
            </View>
            {bookingDetail.attendees && (
              <View style={styles.detailRow}>
                <Icon name="people" size={20} color={colors.textSecondary} />
                <Text style={styles.detailLabel}>Attendees</Text>
                <Text style={styles.detailValue}>{bookingDetail.attendees}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Pooja Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this Pooja</Text>
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionText}>{bookingDetail.description}</Text>
          </View>
        </View>

        {/* Special Request */}
        {bookingDetail.specialRequest && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Request</Text>
            <View style={styles.requestCard}>
              <Text style={styles.requestText}>{bookingDetail.specialRequest}</Text>
            </View>
          </View>
        )}

        {/* Payment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <View style={styles.paymentCard}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Payment Method</Text>
              <Text style={styles.paymentValue}>{bookingDetail.paymentMethod}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Payment Status</Text>
              <Text style={styles.paymentValue}>{bookingDetail.paymentStatus}</Text>
            </View>
            <View style={[styles.paymentRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>${bookingDetail.amount}</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleDownloadInvoice}
            activeOpacity={0.8}
          >
            <Icon name="picture-as-pdf" size={20} color={colors.primary} />
            <Text style={styles.actionButtonText}>Download Invoice</Text>
          </TouchableOpacity>

          {canCancel && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancelBooking}
              disabled={cancelling}
              activeOpacity={0.8}
            >
              {cancelling ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Icon name="cancel" size={20} color="#FFFFFF" />
                  <Text style={styles.cancelButtonText}>Cancel Booking</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
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
  statusCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  poojaName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  bookingId: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  panditCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  panditAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  panditInfo: {
    flex: 1,
  },
  panditName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  panditContact: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    marginTop: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  paymentValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  totalLabel: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  actionsSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 20,
  },
});

export default BookingDetailScreen;
