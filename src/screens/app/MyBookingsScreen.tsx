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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/theme';
import { bookingApi, Booking, BookingStatus } from '../../api/bookingApi';

const MyBookingsScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<BookingStatus>('all');

  const tabs: { key: BookingStatus; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  useEffect(() => {
    loadBookings();
  }, [selectedTab]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const bookingsData = await bookingApi.getBookings(selectedTab);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading bookings:', error);
      Alert.alert('Error', 'Unable to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const handleBookingPress = (booking: Booking) => {
    navigation.navigate('BookingDetail', { bookingId: booking.bookingId });
  };

  const handleBookAgain = () => {
    navigation.navigate('PanditList');
  };

  const handleSupport = () => {
    Alert.alert('Support', 'Contact us at support@smartpujari.com');
  };

  const getStatusColor = (status: BookingStatus) => {
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

  const getStatusText = (status: BookingStatus) => {
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

  const renderBookingCard = ({ item }: { item: Booking }) => (
    <TouchableOpacity
      style={styles.bookingCard}
      onPress={() => handleBookingPress(item)}
      activeOpacity={0.7}
    >
      {/* Header with Pooja name and Status */}
      <View style={styles.bookingHeader}>
        <Text style={styles.poojaName}>{item.poojaName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      {/* Booking ID */}
      <Text style={styles.bookingId}>{item.bookingId}</Text>

      {/* Pandit Info */}
      <View style={styles.panditInfo}>
        <View style={styles.panditAvatar}>
          <Icon name="person" size={20} color="#FFFFFF" />
        </View>
        <Text style={styles.panditName}>{item.panditName}</Text>
      </View>

      {/* Date and Time */}
      <View style={styles.dateTimeContainer}>
        <View style={styles.dateTimeRow}>
          <Icon name="event" size={16} color={colors.textSecondary} />
          <Text style={styles.dateTimeText}>{item.date}</Text>
        </View>
        <View style={styles.dateTimeRow}>
          <Icon name="schedule" size={16} color={colors.textSecondary} />
          <Text style={styles.dateTimeText}>{item.time}</Text>
        </View>
      </View>

      {/* Address */}
      <View style={styles.addressContainer}>
        <Icon name="location-on" size={16} color={colors.textSecondary} />
        <Text style={styles.addressText} numberOfLines={2}>
          {item.address}
        </Text>
      </View>

      {/* Separator */}
      <View style={styles.separator} />

      {/* Amount */}
      <Text style={styles.amount}>Total Amount</Text>
      <Text style={styles.amountValue}>${item.amount}</Text>
    </TouchableOpacity>
  );

  const renderTabButton = (tab: { key: BookingStatus; label: string }) => (
    <TouchableOpacity
      key={tab.key}
      style={[
        styles.tabButton,
        selectedTab === tab.key && styles.tabButtonActive,
      ]}
      onPress={() => setSelectedTab(tab.key)}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.tabButtonText,
        selectedTab === tab.key && styles.tabButtonTextActive,
      ]}>
        {tab.label}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="event-busy" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyText}>No {selectedTab === 'all' ? '' : getStatusText(selectedTab)} bookings found</Text>
      <TouchableOpacity
        style={styles.bookNowButton}
        onPress={() => navigation.navigate('PanditList')}
        activeOpacity={0.8}
      >
        <Text style={styles.bookNowButtonText}>Book Now</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>

      {/* Tab Filters */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map(renderTabButton)}
        </ScrollView>
      </View>

      {/* Bookings List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            bookings.length > 0 ? (
              <View style={styles.quickActionsCard}>
                <Text style={styles.quickActionsTitle}>Quick Actions</Text>
                <View style={styles.quickActionsButtons}>
                  <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={handleBookAgain}
                    activeOpacity={0.8}
                  >
                    <Icon name="repeat" size={20} color={colors.primary} />
                    <Text style={styles.quickActionButtonText}>Book Again</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={handleSupport}
                    activeOpacity={0.8}
                  >
                    <Icon name="support-agent" size={20} color={colors.primary} />
                    <Text style={styles.quickActionButtonText}>Support</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  tabContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: colors.background,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  bookingCard: {
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
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  poojaName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  bookingId: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  panditInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  panditAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  panditName: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  dateTimeContainer: {
    marginBottom: 8,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateTimeText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
    lineHeight: 20,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  amount: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  bookNowButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  bookNowButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  quickActionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  quickActionsButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  quickActionButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default MyBookingsScreen;
