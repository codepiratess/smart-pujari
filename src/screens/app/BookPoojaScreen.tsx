import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Image,
  SafeAreaView,
  Alert,
  Modal,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { addressApi } from '../../api/address';
import { cartApi } from '../../api/cartApi';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Matches the API response from GET /pandits/:id/slots
 * Fields: start, end, start_label, end_label, slot_label,
 *         status, is_available, is_booked, is_closed, is_past, is_clickable
 */
interface Slot {
  start: string; // "06:00"
  end: string; // "07:00"
  start_label: string; // "6:00 AM"
  end_label: string; // "7:00 AM"
  slot_label: string; // "6:00 AM - 7:00 AM"
  status: string; // "available" | "booked" | "past"
  is_available: boolean;
  is_booked: boolean;
  is_past: boolean;
  is_clickable: boolean;
}

interface DateItem {
  id: number;
  date: number;
  month: string;
  day: string;
  fullDate: Date;
  isToday: boolean;
}

interface SavedAddress {
  id: number;
  address_label: string;
  address_line: string;
  address_line_2: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toLocalDateString = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const generateDates = (): DateItem[] => {
  const dates: DateItem[] = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({
      id: i,
      date: d.getDate(),
      month: d.toLocaleString('en-US', { month: 'short' }),
      day: d.toLocaleString('en-US', { weekday: 'short' }),
      fullDate: d,
      isToday: i === 0,
    });
  }
  return dates;
};

// ─── Screen ───────────────────────────────────────────────────────────────────

const BookPoojaScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute<any>();
  const {
    panditId,
    panditPoojaId,
    poojaName,
    panditName,
    duration,
    basePrice,
    poojaImage,
    selectedAddons = [],
  } = route.params;

  const baseDates = useMemo(() => generateDates(), []);
  const [selectedDate, setSelectedDate] = useState(
    toLocalDateString(new Date()),
  );
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [guests, setGuests] = useState(25);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(
    null,
  );
  const [proceeding, setProceeding] = useState(false);
  const [hasCart, setHasCart] = useState(false);

  // Calendar modal
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [tempDate, setTempDate] = useState<Date | null>(null);

  const dateScrollRef = useRef<ScrollView>(null);

  const displayedDates = useMemo(() => {
    const inBase = baseDates.some(
      d => toLocalDateString(d.fullDate) === selectedDate,
    );
    if (!inBase && selectedDate) {
      const [y, m, day] = selectedDate.split('-').map(Number);
      const custom = new Date(y, m - 1, day);
      return [
        ...baseDates,
        {
          id: 999,
          date: custom.getDate(),
          month: custom.toLocaleString('en-US', { month: 'short' }),
          day: custom.toLocaleString('en-US', { weekday: 'short' }),
          fullDate: custom,
          isToday: false,
        },
      ];
    }
    return baseDates;
  }, [baseDates, selectedDate]);

  // ── Load address ──────────────────────────────────────────────────────────
  const fetchAddress = useCallback(async () => {
    try {
      const addresses = await addressApi.getAll();
      if (addresses.length > 0) {
        const def = addresses.find((a: any) => a.is_default) ?? addresses[0];
        setSelectedAddress(def as any);
      }
    } catch (err) {
      console.error('Address fetch error:', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAddress();
    }, [fetchAddress]),
  );

  useEffect(() => {
    checkCart();
  }, []);

  useEffect(() => {
    if (selectedDate && panditId) {
      fetchSlots();
      setSelectedSlot(null);
    }
  }, [selectedDate, panditId]);

  const checkCart = async () => {
    try {
      const cart = await cartApi.getCart();
      setHasCart(!!cart && cart.items?.length > 0);
    } catch {
      setHasCart(false);
    }
  };

  const fetchSlots = async () => {
    try {
      setSlotsLoading(true);
      const data = await cartApi.getSlots(panditId, selectedDate);
      console.log('Slots raw:', JSON.stringify(data));
      // API returns array of { start, end, start_label, end_label, ... }
      setSlots(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Slots error:', err);
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const totalPrice = useMemo(() => {
    const addonsTotal = (selectedAddons as any[]).reduce(
      (sum: number, a: any) => sum + (a.price ?? 0) * (a.quantity ?? 1),
      0,
    );
    return basePrice + addonsTotal;
  }, [basePrice, selectedAddons]);

  const isFormValid = !!selectedDate && !!selectedSlot && !!selectedAddress;

  /**
   * FIX: Wrap payload in { cart: { ... } } to match the API contract.
   * Use slot.start / slot.end (not slot_start / slot_end).
   */
  const handleContinue = async () => {
    if (!isFormValid) {
      Alert.alert(
        'Incomplete',
        'Please select a date, time slot, and address.',
      );
      return;
    }

    setProceeding(true);
    try {
      const payload = {
        cart: {
          panditPoojaId: panditPoojaId,
          pandit_id: panditId,
          date: selectedDate,
          time: `${selectedSlot!.start} - ${selectedSlot!.end}`,
          address_id: (selectedAddress as any)!.id,
          number_of_guests: guests,
          special_instructions: specialInstructions || undefined,
          addons: (selectedAddons as any[]).map((a: any) => ({
            pandit_pooja_addon_id: a.panditAddonId ?? a.id,
            quantity: a.quantity ?? 1,
          })),
        },
      };

      console.log('Cart payload:', JSON.stringify(payload));
      const res = await cartApi.addToCart(payload);

      if (res?.success || res?.data) {
        setHasCart(true);
        navigation.navigate('Cart');
      } else {
        Alert.alert('Error', res?.message || 'Failed to add to cart');
      }
    } catch (err: any) {
      console.error('Add to cart error:', err?.response?.data);
      Alert.alert(
        'Error',
        err?.response?.data?.message || 'Something went wrong',
      );
    } finally {
      setProceeding(false);
    }
  };

  // ── Calendar helpers ──────────────────────────────────────────────────────

  const getDaysInMonth = (d: Date) => {
    const y = d.getFullYear();
    const mo = d.getMonth();
    return {
      daysInMonth: new Date(y, mo + 1, 0).getDate(),
      startingDayOfWeek: new Date(y, mo, 1).getDay(),
      year: y,
      month: mo,
    };
  };

  const isPastDate = (d: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
  };

  const isSameDay = (d1: Date | null, d2: Date) =>
    d1?.getDate() === d2.getDate() &&
    d1?.getMonth() === d2.getMonth() &&
    d1?.getFullYear() === d2.getFullYear();

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Icon name="arrow-back" size={22} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Pooja</Text>
        <TouchableOpacity
          style={styles.cartBtn}
          onPress={() => navigation.navigate('Cart')}
        >
          <Icon name="shopping-cart" size={22} color="#f97316" />
          {hasCart && <View style={styles.cartDot} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Service Summary Card */}
        <View style={styles.card}>
          <View style={styles.summaryRow}>
            {poojaImage ? (
              <Image source={{ uri: poojaImage }} style={styles.summaryImg} />
            ) : (
              <View style={[styles.summaryImg, styles.summaryImgFallback]}>
                <Icon name="spa" size={28} color="#f97316" />
              </View>
            )}
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryName}>{poojaName}</Text>
              {panditName ? (
                <Text style={styles.summaryPandit}>by {panditName}</Text>
              ) : null}
              <View style={styles.summaryMeta}>
                <Icon name="schedule" size={13} color="#6b7280" />
                <Text style={styles.summaryMetaText}>
                  {duration?.includes('hour') ? duration : `${duration} hours`}
                </Text>
                <Text style={styles.summaryPrice}>
                  ₹{Number(basePrice).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Select Date */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <TouchableOpacity
            onPress={() => setShowCalendar(true)}
            style={styles.calendarBtn}
          >
            <Icon name="calendar-today" size={20} color="#f97316" />
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={dateScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateScroll}
        >
          {displayedDates.map(item => {
            const isSelected =
              toLocalDateString(item.fullDate) === selectedDate;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.dateCard, isSelected && styles.dateCardSelected]}
                onPress={() => {
                  setSelectedDate(toLocalDateString(item.fullDate));
                  setSelectedSlot(null);
                }}
              >
                <Text
                  style={[
                    styles.dateDayText,
                    isSelected && styles.dateTextWhiteLight,
                  ]}
                >
                  {item.day}
                </Text>
                <Text
                  style={[
                    styles.dateNumText,
                    isSelected && styles.dateTextWhite,
                  ]}
                >
                  {item.date}
                </Text>
                <Text
                  style={[
                    styles.dateMonthText,
                    isSelected && styles.dateTextWhiteLight,
                  ]}
                >
                  {item.month}
                </Text>
                {item.isToday && (
                  <Text
                    style={[
                      styles.dateTodayText,
                      isSelected && styles.dateTextWhiteLight,
                    ]}
                  >
                    TODAY
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Select Time Slot */}
        <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>
          Select Time Slot
        </Text>

        {slotsLoading ? (
          <View style={styles.slotLoadingBox}>
            <ActivityIndicator size="small" color="#f97316" />
            <Text style={styles.slotLoadingText}>Loading slots...</Text>
          </View>
        ) : slots.length === 0 ? (
          <View style={styles.slotEmptyBox}>
            <Text style={styles.slotEmptyText}>
              No slots available for this date
            </Text>
          </View>
        ) : (
          <View style={styles.slotsGrid}>
            {slots.map((slot, i) => {
              // A slot is selectable only if it's available and clickable
              const isClickable =
                slot.is_available && slot.is_clickable && !slot.is_past;
              const isSelected =
                selectedSlot?.start === slot.start &&
                selectedSlot?.end === slot.end;

              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.slotBtn,
                    !isClickable && styles.slotBtnBooked,
                    isSelected && styles.slotBtnSelected,
                  ]}
                  onPress={() => isClickable && setSelectedSlot(slot)}
                  disabled={!isClickable}
                  activeOpacity={0.7}
                >
                  {/* Use start_label / end_label from API for clean display */}
                  <Text
                    style={[
                      styles.slotBtnText,
                      !isClickable && styles.slotBtnTextBooked,
                      isSelected && styles.slotBtnTextSelected,
                    ]}
                  >
                    {slot.start_label}
                  </Text>
                  <Text
                    style={[
                      styles.slotBtnSep,
                      !isClickable && styles.slotBtnTextBooked,
                      isSelected && styles.slotBtnTextSelected,
                    ]}
                  >
                    —
                  </Text>
                  <Text
                    style={[
                      styles.slotBtnText,
                      !isClickable && styles.slotBtnTextBooked,
                      isSelected && styles.slotBtnTextSelected,
                    ]}
                  >
                    {slot.end_label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Slot Legend */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={styles.legendDotAvailable} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.legendDotBooked} />
            <Text style={styles.legendText}>Booked</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.legendDotSelected} />
            <Text style={styles.legendText}>Selected</Text>
          </View>
        </View>

        {/* Booking Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Booking Details</Text>
          <Text style={styles.detailLabel}>Number of Guests</Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setGuests(g => Math.max(1, g - 1))}
            >
              <Icon name="remove" size={18} color="#f97316" />
            </TouchableOpacity>
            <View style={styles.stepperCenter}>
              <Text style={styles.stepperNum}>{guests}</Text>
              <Text style={styles.stepperSub}>guests</Text>
            </View>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setGuests(g => Math.min(100, g + 1))}
            >
              <Icon name="add" size={18} color="#f97316" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.detailLabel, { marginTop: 16 }]}>
            Special Instructions
          </Text>
          <TextInput
            style={styles.textarea}
            placeholder="Any special instructions for pandit..."
            placeholderTextColor="#9ca3af"
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Service Address */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Service Address</Text>
          <View style={styles.addressRow}>
            <View style={styles.addressIconCircle}>
              <Icon name="location-on" size={18} color="#f97316" />
            </View>
            <View style={styles.addressInfo}>
              {selectedAddress ? (
                <>
                  <Text style={styles.addressText}>
                    {(selectedAddress as any).address_line},{' '}
                    {(selectedAddress as any).city}
                  </Text>
                  <Text style={styles.addressSub}>
                    {(selectedAddress as any).state} -{' '}
                    {(selectedAddress as any).pincode}
                  </Text>
                </>
              ) : (
                <Text style={styles.addressEmpty}>No address selected</Text>
              )}
              <TouchableOpacity
                onPress={() => navigation.navigate('SelectLocation')}
                style={styles.changeAddressBtn}
              >
                <Text style={styles.changeAddressText}>Change Address</Text>
                <Icon name="chevron-right" size={14} color="#f97316" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Total Price</Text>
          <Text style={styles.footerPrice}>₹{totalPrice.toLocaleString()}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.continueBtn,
            !isFormValid && styles.continueBtnDisabled,
          ]}
          onPress={handleContinue}
          disabled={!isFormValid || proceeding}
        >
          {proceeding ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.continueBtnText}>Continue</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Calendar Modal */}
      <Modal
        visible={showCalendar}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.calHeader}>
              <TouchableOpacity
                onPress={() =>
                  setCalendarMonth(
                    new Date(
                      calendarMonth.getFullYear(),
                      calendarMonth.getMonth() - 1,
                    ),
                  )
                }
                style={styles.calNavBtn}
              >
                <Icon name="chevron-left" size={22} color="#374151" />
              </TouchableOpacity>
              <Text style={styles.calMonthTitle}>
                {calendarMonth.toLocaleString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setCalendarMonth(
                    new Date(
                      calendarMonth.getFullYear(),
                      calendarMonth.getMonth() + 1,
                    ),
                  )
                }
                style={styles.calNavBtn}
              >
                <Icon name="chevron-right" size={22} color="#374151" />
              </TouchableOpacity>
            </View>

            <View style={styles.calWeekRow}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <Text key={d} style={styles.calWeekDay}>
                  {d}
                </Text>
              ))}
            </View>

            <View style={styles.calGrid}>
              {(() => {
                const { daysInMonth, startingDayOfWeek, year, month } =
                  getDaysInMonth(calendarMonth);
                const cells = [];
                for (let i = 0; i < startingDayOfWeek; i++) {
                  cells.push(<View key={`e${i}`} style={styles.calDayEmpty} />);
                }
                for (let day = 1; day <= daysInMonth; day++) {
                  const d = new Date(year, month, day);
                  const disabled = isPastDate(d);
                  const isSelected = isSameDay(tempDate, d);
                  cells.push(
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.calDayBtn,
                        disabled && styles.calDayDisabled,
                        isSelected && styles.calDaySelected,
                      ]}
                      onPress={() => !disabled && setTempDate(d)}
                      disabled={disabled}
                    >
                      <Text
                        style={[
                          styles.calDayText,
                          disabled && styles.calDayTextDisabled,
                          isSelected && styles.calDayTextSelected,
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>,
                  );
                }
                return cells;
              })()}
            </View>

            <View style={styles.calActions}>
              <TouchableOpacity
                style={styles.calCancelBtn}
                onPress={() => setShowCalendar(false)}
              >
                <Text style={styles.calCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.calConfirmBtn, !tempDate && { opacity: 0.4 }]}
                disabled={!tempDate}
                onPress={() => {
                  if (tempDate) {
                    setSelectedDate(toLocalDateString(tempDate));
                    setSelectedSlot(null);
                    setTempDate(null);
                    setShowCalendar(false);
                  }
                }}
              >
                <Text style={styles.calConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backBtn: { padding: 8, borderRadius: 20, width: 38 },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  cartBtn: {
    padding: 8,
    width: 38,
    alignItems: 'center',
    position: 'relative',
  },
  cartDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#16a34a',
    borderWidth: 1.5,
    borderColor: '#fff',
  },

  content: { padding: 16 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
  },

  summaryRow: { flexDirection: 'row', gap: 12 },
  summaryImg: { width: 80, height: 80, borderRadius: 12 },
  summaryImgFallback: {
    backgroundColor: '#ffedd5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryInfo: { flex: 1, justifyContent: 'center' },
  summaryName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  summaryPandit: { fontSize: 12, color: '#6b7280', marginBottom: 6 },
  summaryMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  summaryMetaText: { fontSize: 12, color: '#6b7280' },
  summaryPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f97316',
    marginLeft: 4,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  calendarBtn: { padding: 6 },

  dateScroll: { gap: 10, paddingRight: 16, marginBottom: 20 },
  dateCard: {
    width: 60,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  dateCardSelected: { backgroundColor: '#f97316', borderColor: '#f97316' },
  dateDayText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 2,
  },
  dateNumText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  dateMonthText: { fontSize: 10, color: '#6b7280' },
  dateTodayText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#f97316',
    marginTop: 2,
  },
  dateTextWhite: { color: '#fff' },
  dateTextWhiteLight: { color: 'rgba(255,255,255,0.85)' },

  slotLoadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
    marginBottom: 16,
  },
  slotLoadingText: { fontSize: 13, color: '#6b7280' },
  slotEmptyBox: { paddingVertical: 24, alignItems: 'center', marginBottom: 16 },
  slotEmptyText: { fontSize: 13, color: '#9ca3af' },

  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  slotBtn: {
    width: '30%',
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#fed7aa',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 70,
  },
  slotBtnBooked: { borderColor: '#e5e7eb', backgroundColor: '#f3f4f6' },
  slotBtnSelected: { backgroundColor: '#f97316', borderColor: '#f97316' },
  slotBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
  },
  slotBtnSep: { fontSize: 10, color: '#9ca3af', marginVertical: 1 },
  slotBtnTextBooked: { color: '#9ca3af' },
  slotBtnTextSelected: { color: '#fff' },

  legendRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendText: { fontSize: 12, color: '#6b7280' },
  legendDotAvailable: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fed7aa',
    backgroundColor: '#fff',
  },
  legendDotBooked: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
  },
  legendDotSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#f97316',
  },

  detailLabel: { fontSize: 14, color: '#374151', marginBottom: 10 },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepperBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperCenter: { alignItems: 'center', flex: 1 },
  stepperNum: { fontSize: 28, fontWeight: '700', color: '#111827' },
  stepperSub: { fontSize: 12, color: '#6b7280' },
  textarea: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#f9fafb',
    minHeight: 80,
  },

  addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  addressIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff7ed',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  addressInfo: { flex: 1 },
  addressText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    lineHeight: 20,
  },
  addressSub: { fontSize: 12, color: '#6b7280', marginBottom: 6 },
  addressEmpty: { fontSize: 13, color: '#9ca3af', marginBottom: 6 },
  changeAddressBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  changeAddressText: { fontSize: 13, fontWeight: '600', color: '#f97316' },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    elevation: 8,
  },
  footerLabel: { fontSize: 12, color: '#6b7280', marginBottom: 2 },
  footerPrice: { fontSize: 20, fontWeight: '700', color: '#f97316' },
  continueBtn: {
    backgroundColor: '#f97316',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 999,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    elevation: 4,
  },
  continueBtnDisabled: {
    backgroundColor: '#e5e7eb',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
  },
  calHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  calNavBtn: { padding: 8 },
  calMonthTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  calWeekRow: { flexDirection: 'row', marginBottom: 8 },
  calWeekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
  },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  calDayEmpty: { width: '14.28%', aspectRatio: 1 },
  calDayBtn: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  calDayDisabled: { opacity: 0.3 },
  calDaySelected: { backgroundColor: '#f97316' },
  calDayText: { fontSize: 14, fontWeight: '600', color: '#111827' },
  calDayTextDisabled: { color: '#d1d5db' },
  calDayTextSelected: { color: '#fff' },
  calActions: { flexDirection: 'row', gap: 12 },
  calCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 999,
    alignItems: 'center',
  },
  calCancelText: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  calConfirmBtn: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#f97316',
    borderRadius: 999,
    alignItems: 'center',
  },
  calConfirmText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});

export default BookPoojaScreen;
