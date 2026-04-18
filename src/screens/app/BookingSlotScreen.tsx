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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Calendar } from 'react-native-calendars';
import { colors } from '../../theme/theme';
import { panditApi, TimeSlot, BookingRequest } from '../../api/panditApi';

const BookingSlotScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute<any>();
  const { panditId, panditName, price } = route.params;
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attendees, setAttendees] = useState(1);
  const [specialRequest, setSpecialRequest] = useState('');
  const [address, setAddress] = useState('123 Main St, Delhi, India');

  useEffect(() => {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    loadTimeSlots(today);
  }, []);

  const loadTimeSlots = async (date: string) => {
    try {
      setLoadingSlots(true);
      const slots = await panditApi.getTimeSlots(panditId, date);
      setTimeSlots(slots);
      setSelectedTimeSlot(null); // Reset selected time slot
    } catch (error) {
      console.error('Error loading time slots:', error);
      Alert.alert('Error', 'Unable to load time slots');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateSelect = (day: any) => {
    const selectedDateStr = day.dateString;
    setSelectedDate(selectedDateStr);
    loadTimeSlots(selectedDateStr);
  };

  const handleTimeSlotSelect = (slot: TimeSlot) => {
    if (slot.status === 'available') {
      setSelectedTimeSlot(slot);
    }
  };

  const handleAttendeesChange = (type: 'increase' | 'decrease') => {
    if (type === 'increase') {
      setAttendees(prev => prev + 1);
    } else {
      setAttendees(prev => Math.max(1, prev - 1));
    }
  };

  const handleAddressPress = () => {
    // TODO: Navigate to address selection screen
    Alert.alert('Address', 'Address selection coming soon!');
  };

  const calculateTotal = () => {
    return price * attendees;
  };

  const handleProceedToPayment = async () => {
    if (!selectedTimeSlot) {
      Alert.alert('Error', 'Please select a time slot');
      return;
    }

    try {
      setLoading(true);
      
      const bookingRequest: BookingRequest = {
        panditId,
        date: selectedDate,
        timeSlot: selectedTimeSlot.time,
        attendees,
        specialRequest,
        address,
        amount: calculateTotal(),
      };

      const response = await panditApi.createBooking(bookingRequest);
      
      // Navigate to payment screen
      navigation.navigate('Payment', {
        bookingId: response.id,
        paymentIntent: response.paymentIntent,
        amount: response.amount,
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert('Error', 'Unable to create booking');
    } finally {
      setLoading(false);
    }
  };

  const renderTimeSlot = (slot: TimeSlot) => {
    const isSelected = selectedTimeSlot?.id === slot.id;
    const slotColor = slot.status === 'available' ? colors.primary : 
                     slot.status === 'booked' ? '#FF5252' : '#9E9E9E';
    
    return (
      <TouchableOpacity
        key={slot.id}
        style={[
          styles.timeSlot,
          isSelected && styles.selectedTimeSlot,
          { borderColor: slotColor }
        ]}
        onPress={() => handleTimeSlotSelect(slot)}
        disabled={slot.status !== 'available'}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.timeSlotText,
          isSelected && styles.selectedTimeSlotText,
          { color: slot.status === 'available' ? slotColor : slotColor }
        ]}>
          {slot.time}
        </Text>
      </TouchableOpacity>
    );
  };

  const markedDates = {
    [selectedDate]: {
      selected: true,
      selectedColor: colors.primary,
      selectedTextColor: '#FFFFFF',
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Date & Time</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Calendar Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <Calendar
            onDayPress={handleDateSelect}
            markedDates={markedDates}
            minDate={new Date().toISOString().split('T')[0]}
            theme={{
              backgroundColor: '#FFFFFF',
              calendarBackground: '#FFFFFF',
              textSectionTitleColor: colors.textPrimary,
              selectedDayBackgroundColor: colors.primary,
              selectedDayTextColor: '#FFFFFF',
              todayTextColor: colors.primary,
              dayTextColor: colors.textPrimary,
              textDisabledColor: colors.textSecondary,
              arrowColor: colors.primary,
            }}
          />
        </View>

        {/* Time Slots Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Time Slots</Text>
          {loadingSlots ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Loading time slots...</Text>
            </View>
          ) : timeSlots.length > 0 ? (
            <View style={styles.timeSlotsContainer}>
              {timeSlots.map(renderTimeSlot)}
            </View>
          ) : (
            <Text style={styles.noSlotsText}>No time slots available for this date</Text>
          )}
        </View>

        {/* Attendees Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Number of Attendees</Text>
          <View style={styles.attendeesContainer}>
            <TouchableOpacity
              style={styles.attendeeButton}
              onPress={() => handleAttendeesChange('decrease')}
              activeOpacity={0.7}
            >
              <Icon name="remove" size={20} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.attendeesCount}>{attendees}</Text>
            <TouchableOpacity
              style={styles.attendeeButton}
              onPress={() => handleAttendeesChange('increase')}
              activeOpacity={0.7}
            >
              <Icon name="add" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Special Request Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Request (Optional)</Text>
          <TextInput
            style={styles.specialRequestInput}
            placeholder="Any special requirements or preferences..."
            placeholderTextColor={colors.textSecondary}
            value={specialRequest}
            onChangeText={setSpecialRequest}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Address</Text>
          <TouchableOpacity
            style={styles.addressContainer}
            onPress={handleAddressPress}
            activeOpacity={0.7}
          >
            <Icon name="location-on" size={20} color={colors.primary} />
            <Text style={styles.addressText}>{address}</Text>
            <Icon name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Price Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Summary</Text>
          <View style={styles.priceSummary}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Base Price</Text>
              <Text style={styles.priceValue}>${price}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Attendees</Text>
              <Text style={styles.priceValue}>x{attendees}</Text>
            </View>
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${calculateTotal()}</Text>
            </View>
          </View>
        </View>

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Proceed Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.proceedButton,
            (!selectedTimeSlot || loading) && styles.proceedButtonDisabled,
          ]}
          onPress={handleProceedToPayment}
          disabled={!selectedTimeSlot || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.proceedButtonText}>Proceed to Payment</Text>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    color: colors.textSecondary,
  },
  noSlotsText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlot: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: colors.background,
  },
  selectedTimeSlot: {
    backgroundColor: colors.primary + '15',
    borderWidth: 2,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedTimeSlotText: {
    fontWeight: '600',
  },
  attendeesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attendeeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  attendeesCount: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    minWidth: 30,
    textAlign: 'center',
  },
  specialRequestInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 80,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addressText: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 12,
    marginRight: 8,
  },
  priceSummary: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 16,
  },
  priceRow: {
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
  priceLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  priceValue: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  totalLabel: {
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '600',
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
  proceedButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  proceedButtonDisabled: {
    backgroundColor: colors.border,
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BookingSlotScreen;
