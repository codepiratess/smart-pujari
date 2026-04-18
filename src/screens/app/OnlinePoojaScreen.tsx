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
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Calendar } from 'react-native-calendars';
import { colors } from '../../theme/theme';
import { paymentApi, OnlinePoojaRequest, OnlinePoojaResponse } from '../../api/paymentApi';
import { panditApi, TimeSlot } from '../../api/panditApi';

interface PoojaType {
  id: string;
  name: string;
  price: number;
  duration: string;
  image: string;
  description: string;
}

const OnlinePoojaScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  
  const [poojaTypes, setPoojaTypes] = useState<PoojaType[]>([]);
  const [selectedPoojaTypes, setSelectedPoojaTypes] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [specialRequest, setSpecialRequest] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    loadPoojaTypes();
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    loadTimeSlots(today);
  }, []);

  useEffect(() => {
    calculateTotalPrice();
  }, [selectedPoojaTypes]);

  const loadPoojaTypes = async () => {
    try {
      setLoading(true);
      
      // Mock pooja types for online pooja
      const mockPoojaTypes: PoojaType[] = [
        {
          id: '1',
          name: 'Satyanarayan Pooja',
          price: 1500,
          duration: '2 hours',
          image: 'https://picsum.photos/seed/satyanarayan/100/100',
          description: 'Traditional Satyanarayan pooja for prosperity and well-being',
        },
        {
          id: '2',
          name: 'Ganesh Pooja',
          price: 800,
          duration: '1 hour',
          image: 'https://picsum.photos/seed/ganesh/100/100',
          description: 'Lord Ganesh pooja for removing obstacles',
        },
        {
          id: '3',
          name: 'Lakshmi Pooja',
          price: 1200,
          duration: '1.5 hours',
          image: 'https://picsum.photos/seed/lakshmi/100/100',
          description: 'Goddess Lakshmi pooja for wealth and prosperity',
        },
        {
          id: '4',
          name: 'Shiv Pooja',
          price: 1000,
          duration: '1 hour',
          image: 'https://picsum.photos/seed/shiv/100/100',
          description: 'Lord Shiva pooja for peace and harmony',
        },
        {
          id: '5',
          name: 'Durga Pooja',
          price: 1800,
          duration: '2 hours',
          image: 'https://picsum.photos/seed/durga/100/100',
          description: 'Goddess Durga pooja for strength and protection',
        },
        {
          id: '6',
          name: 'Navagraha Pooja',
          price: 2000,
          duration: '2.5 hours',
          image: 'https://picsum.photos/seed/navagraha/100/100',
          description: 'Nine planets pooja for astrological remedies',
        },
      ];
      
      setPoojaTypes(mockPoojaTypes);
    } catch (error) {
      console.error('Error loading pooja types:', error);
      Alert.alert('Error', 'Unable to load pooja types');
    } finally {
      setLoading(false);
    }
  };

  const loadTimeSlots = async (date: string) => {
    try {
      setLoadingSlots(true);
      const slots = await panditApi.getTimeSlots('online', date);
      setTimeSlots(slots);
      setSelectedTimeSlot(null);
    } catch (error) {
      console.error('Error loading time slots:', error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const calculateTotalPrice = () => {
    const total = poojaTypes
      .filter(pooja => selectedPoojaTypes.includes(pooja.id))
      .reduce((sum, pooja) => sum + pooja.price, 0);
    setTotalPrice(total);
  };

  const handleDateSelect = (day: any) => {
    const selectedDateStr = day.dateString;
    setSelectedDate(selectedDateStr);
    loadTimeSlots(selectedDateStr);
  };

  const handlePoojaToggle = (poojaId: string) => {
    setSelectedPoojaTypes(prev => {
      if (prev.includes(poojaId)) {
        return prev.filter(id => id !== poojaId);
      } else {
        return [...prev, poojaId];
      }
    });
  };

  const handleTimeSlotSelect = (slot: TimeSlot) => {
    if (slot.status === 'available') {
      setSelectedTimeSlot(slot);
    }
  };

  const handleProceedToPay = async () => {
    if (selectedPoojaTypes.length === 0) {
      Alert.alert('Error', 'Please select at least one pooja type');
      return;
    }

    if (!selectedTimeSlot) {
      Alert.alert('Error', 'Please select a time slot');
      return;
    }

    try {
      setLoading(true);
      
      const request: OnlinePoojaRequest = {
        poojaTypes: selectedPoojaTypes,
        date: selectedDate,
        time: selectedTimeSlot.time,
        specialRequest,
        amount: totalPrice,
      };

      const response = await paymentApi.bookOnlinePooja(request);
      
      // Show success message
      Alert.alert(
        'Request Sent!',
        response.message,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error booking online pooja:', error);
      Alert.alert('Error', 'Unable to book online pooja');
    } finally {
      setLoading(false);
    }
  };

  const renderPoojaType = ({ item }: { item: PoojaType }) => {
    const isSelected = selectedPoojaTypes.includes(item.id);
    
    return (
      <TouchableOpacity
        style={[styles.poojaCard, isSelected && styles.selectedPoojaCard]}
        onPress={() => handlePoojaToggle(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.poojaImageContainer}>
          <Icon name="spa" size={32} color={colors.primary} />
        </View>
        <View style={styles.poojaInfo}>
          <Text style={styles.poojaName}>{item.name}</Text>
          <Text style={styles.poojaDescription}>{item.description}</Text>
          <View style={styles.poojaMeta}>
            <Text style={styles.poojaDuration}>{item.duration}</Text>
            <Text style={styles.poojaPrice}>${item.price}</Text>
          </View>
        </View>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Icon name="check" size={16} color="#FFFFFF" />}
        </View>
      </TouchableOpacity>
    );
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading pooja types...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Book Online Pooja</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Pooja Types Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Pooja Types</Text>
          <FlatList
            data={poojaTypes}
            renderItem={renderPoojaType}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Price Summary */}
        {selectedPoojaTypes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Summary</Text>
            <View style={styles.priceSummary}>
              <Text style={styles.totalPrice}>Total: ${totalPrice}</Text>
              <Text style={styles.priceNote}>
                {selectedPoojaTypes.length} pooja type{selectedPoojaTypes.length > 1 ? 's' : ''} selected
              </Text>
            </View>
          </View>
        )}

        {/* Date Selection */}
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

        {/* Time Slots */}
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

        {/* Special Request */}
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

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Proceed Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.proceedButton,
            (selectedPoojaTypes.length === 0 || !selectedTimeSlot || loading) && styles.proceedButtonDisabled,
          ]}
          onPress={handleProceedToPay}
          disabled={selectedPoojaTypes.length === 0 || !selectedTimeSlot || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.proceedButtonText}>
              Proceed to Pay ${totalPrice}
            </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: colors.textSecondary,
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
  poojaCard: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedPoojaCard: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },
  poojaImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  poojaInfo: {
    flex: 1,
  },
  poojaName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  poojaDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  poojaMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  poojaDuration: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  poojaPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  priceSummary: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  priceNote: {
    fontSize: 14,
    color: colors.textSecondary,
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
  noSlotsText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontStyle: 'italic',
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

export default OnlinePoojaScreen;
