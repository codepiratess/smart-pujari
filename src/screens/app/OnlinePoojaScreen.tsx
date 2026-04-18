import React, { useState, useEffect, useMemo } from 'react';
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
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/theme';
import { homeApi, PoojaType } from '../../api/homeApi';

const { width } = Dimensions.get('window');

// ── Fixed time slots (admin assigns pandit) ──────────────────────────────────
const DEFAULT_SLOTS = [
  { id: 1, start: '08:00', end: '10:00' },
  { id: 2, start: '10:00', end: '12:00' },
  { id: 3, start: '12:00', end: '14:00' },
  { id: 4, start: '14:00', end: '16:00' },
  { id: 5, start: '16:00', end: '18:00' },
  { id: 6, start: '18:00', end: '20:00' },
  { id: 7, start: '20:00', end: '22:00' },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const formatTo12Hour = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
};

const formatDisplayDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const isPastDate = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

// ── Calendar Bottom Sheet Modal ───────────────────────────────────────────────
interface CalendarModalProps {
  visible: boolean;
  onConfirm: (date: string, slot: string) => void;
  onClose: () => void;
  initialDate?: string | null;
}

const CalendarModal: React.FC<CalendarModalProps> = ({ visible, onConfirm, onClose, initialDate }) => {
  const today = new Date();
  const [calMonth, setCalMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    initialDate ? new Date(initialDate) : null
  );
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

  const year = calMonth.getFullYear();
  const month = calMonth.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const isSameDay = (a: Date | null, b: Date) => {
    if (!a) return false;
    return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  };

  const handleConfirm = () => {
    if (!selectedDate || selectedSlotId === null) return;
    const slot = DEFAULT_SLOTS.find(s => s.id === selectedSlotId)!;
    const dateStr = selectedDate.toISOString().split('T')[0];
    const slotStr = `${slot.start} - ${slot.end}`;
    onConfirm(dateStr, slotStr);
  };

  const canConfirm = !!selectedDate && selectedSlotId !== null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          {/* Month nav */}
          <View style={modalStyles.monthRow}>
            <TouchableOpacity
              onPress={() => setCalMonth(new Date(year, month - 1, 1))}
              style={modalStyles.navBtn}
            >
              <Icon name="chevron-left" size={22} color="#374151" />
            </TouchableOpacity>
            <Text style={modalStyles.monthTitle}>{MONTHS[month]} {year}</Text>
            <TouchableOpacity
              onPress={() => setCalMonth(new Date(year, month + 1, 1))}
              style={modalStyles.navBtn}
            >
              <Icon name="chevron-right" size={22} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Day labels */}
          <View style={modalStyles.dayLabelRow}>
            {DAYS.map(d => (
              <Text key={d} style={modalStyles.dayLabel}>{d}</Text>
            ))}
          </View>

          {/* Calendar grid */}
          <View style={modalStyles.calGrid}>
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <View key={`empty-${i}`} style={modalStyles.dayCell} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const date = new Date(year, month, day);
              const disabled = isPastDate(date);
              const isSelected = isSameDay(selectedDate, date);
              return (
                <TouchableOpacity
                  key={day}
                  disabled={disabled}
                  onPress={() => {
                    setSelectedDate(date);
                    setSelectedSlotId(null);
                  }}
                  style={[
                    modalStyles.dayCell,
                    isSelected && modalStyles.dayCellSelected,
                  ]}
                >
                  <Text style={[
                    modalStyles.dayText,
                    disabled && modalStyles.dayTextDisabled,
                    isSelected && modalStyles.dayTextSelected,
                  ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Time Slots */}
          {selectedDate && (
            <>
              <Text style={modalStyles.slotTitle}>Select Time Slot</Text>
              <View style={modalStyles.slotGrid}>
                {DEFAULT_SLOTS.map(slot => {
                  const isSelected = selectedSlotId === slot.id;
                  return (
                    <TouchableOpacity
                      key={slot.id}
                      onPress={() => setSelectedSlotId(slot.id)}
                      style={[modalStyles.slotBtn, isSelected && modalStyles.slotBtnSelected]}
                    >
                      <Text style={[modalStyles.slotText, isSelected && modalStyles.slotTextSelected]}>
                        {formatTo12Hour(slot.start)} – {formatTo12Hour(slot.end)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {/* Confirm */}
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={!canConfirm}
            style={[modalStyles.confirmBtn, !canConfirm && modalStyles.confirmBtnDisabled]}
          >
            <Text style={modalStyles.confirmBtnText}>Confirm Date & Time</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
const OnlinePoojaScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();

  const [poojaTypes, setPoojaTypes] = useState<PoojaType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPooja, setSelectedPooja] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await homeApi.getPoojaTypes();
        setPoojaTypes(data);
      } catch (e) {
        Alert.alert('Error', 'Unable to load pooja types');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = useMemo(() =>
    poojaTypes.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    ), [poojaTypes, searchQuery]);

  const selectedPoojaData = poojaTypes.find(p => p.id === selectedPooja);
  const totalPrice = selectedPoojaData ? parseFloat(selectedPoojaData.default_price || '0') : 0;
  const hasDateTime = !!selectedDate && !!selectedSlot;

  const toggleSelect = (id: number) => {
    if (selectedPooja === id) {
      setSelectedPooja(null);
      setSelectedDate(null);
      setSelectedSlot(null);
    } else {
      setSelectedPooja(id);
      setSelectedDate(null);
      setSelectedSlot(null);
    }
  };

  const handleDateTimeConfirm = (date: string, slot: string) => {
    setSelectedDate(date);
    setSelectedSlot(slot);
    setShowCalendar(false);
  };

  const handleNext = () => {
    if (!selectedPooja || !hasDateTime) return;
    // Navigate to payment/cart
    Alert.alert('Booking', `Pooja: ${selectedPoojaData?.name}\nDate: ${selectedDate}\nTime: ${selectedSlot}`);
  };

  const formatSlotDisplay = (slot: string) => {
    const [start, end] = slot.split(' - ');
    return `${formatTo12Hour(start)} – ${formatTo12Hour(end)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={22} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Online Pooja</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Icon name="info-outline" size={15} color="#ea580c" />
        <Text style={styles.infoText}>
          Pandit will be assigned by admin after booking confirmation
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <Icon name="search" size={18} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search pooja type"
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading poojas...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filtered.map(pooja => {
            const isSelected = selectedPooja === pooja.id;
            return (
              <View key={pooja.id}>
                {/* Pooja Card */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => toggleSelect(pooja.id)}
                  style={[
                    styles.card,
                    isSelected && styles.cardSelected,
                    isSelected && styles.cardSelectedBottom,
                  ]}
                >
                  <Image source={{ uri: pooja.image }} style={styles.cardImage} />
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName} numberOfLines={1}>{pooja.name}</Text>
                    <View style={styles.durationRow}>
                      <Icon name="schedule" size={12} color="#6b7280" />
                      <Text style={styles.durationText}>{pooja.duration}-2 hours</Text>
                    </View>
                    <Text style={styles.cardDesc} numberOfLines={2}>{pooja.description}</Text>
                    <View style={styles.cardBottom}>
                      <Text style={styles.cardPrice}>
                        ₹{parseFloat(pooja.default_price || '0').toLocaleString()}
                      </Text>
                      <View style={[styles.selectBadge, isSelected && styles.selectBadgeActive]}>
                        <Text style={[styles.selectBadgeText, isSelected && styles.selectBadgeTextActive]}>
                          {isSelected ? 'Selected' : 'Select'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Expandable date/time panel */}
                {isSelected && (
                  <View style={styles.datePanel}>
                    {hasDateTime ? (
                      <View style={styles.datePanelConfirmed}>
                        <View style={styles.datePanelInfo}>
                          <View style={styles.dateRow}>
                            <Icon name="event" size={14} color="#ea580c" />
                            <Text style={styles.dateText}>{formatDisplayDate(selectedDate!)}</Text>
                          </View>
                          <View style={styles.dateRow}>
                            <Icon name="schedule" size={14} color="#ea580c" />
                            <Text style={styles.timeText}>{formatSlotDisplay(selectedSlot!)}</Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          onPress={() => setShowCalendar(true)}
                          style={styles.editBtn}
                        >
                          <Icon name="edit" size={13} color="#f97316" />
                          <Text style={styles.editBtnText}>Edit</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => setShowCalendar(true)}
                        style={styles.selectDateBtn}
                      >
                        <Icon name="event" size={16} color="#f97316" />
                        <Text style={styles.selectDateText}>Select Date & Time</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            );
          })}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Footer */}
      {selectedPooja !== null && (
        <View style={styles.footer}>
          <View>
            <Text style={styles.footerLabel}>1 pooja selected</Text>
            <Text style={styles.footerPrice}>₹{totalPrice.toLocaleString()}</Text>
          </View>
          {hasDateTime ? (
            <TouchableOpacity onPress={handleNext} style={styles.nextBtn}>
              <Text style={styles.nextBtnText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setShowCalendar(true)} style={styles.nextBtn}>
              <Icon name="event" size={15} color="#fff" />
              <Text style={styles.nextBtnText}>Select Date & Time</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Calendar Modal */}
      <CalendarModal
        visible={showCalendar}
        onConfirm={handleDateTimeConfirm}
        onClose={() => setShowCalendar(false)}
        initialDate={selectedDate}
      />
    </SafeAreaView>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF9' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  backBtn: { padding: 8, borderRadius: 20 },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#111827' },

  // Info banner
  infoBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    margin: 12, padding: 12,
    backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#fed7aa', borderRadius: 12,
  },
  infoText: { flex: 1, fontSize: 12, color: '#9a3412', lineHeight: 18 },

  // Search
  searchWrapper: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 12, marginBottom: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: '#111827', paddingVertical: 0 },

  // Loading
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#6b7280', fontSize: 14 },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 12, paddingTop: 4 },

  // Card
  card: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderRadius: 16, borderWidth: 2, borderColor: '#f3f4f6',
    marginBottom: 12, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  cardSelected: { borderColor: '#f97316', shadowOpacity: 0.15 },
  cardSelectedBottom: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, marginBottom: 0 },
  cardImage: { width: 90, height: 90, borderRadius: 0 },
  cardInfo: { flex: 1, padding: 10 },
  cardName: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 3 },
  durationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  durationText: { fontSize: 12, color: '#4b5563' },
  cardDesc: { fontSize: 12, color: '#4b5563', lineHeight: 17, marginBottom: 6 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardPrice: { fontSize: 16, fontWeight: '700', color: '#111827' },
  selectBadge: {
    paddingHorizontal: 14, paddingVertical: 4,
    borderRadius: 999, backgroundColor: '#f3f4f6',
  },
  selectBadgeActive: { backgroundColor: '#ffedd5' },
  selectBadgeText: { fontSize: 12, fontWeight: '600', color: '#4b5563' },
  selectBadgeTextActive: { color: '#c2410c' },

  // Date panel
  datePanel: {
    backgroundColor: '#fff7ed', borderWidth: 2, borderColor: '#f97316',
    borderTopWidth: 1, borderTopColor: '#fed7aa',
    borderBottomLeftRadius: 16, borderBottomRightRadius: 16,
    marginBottom: 12, padding: 12,
  },
  datePanelConfirmed: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  datePanelInfo: { gap: 4 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontSize: 13, fontWeight: '600', color: '#111827' },
  timeText: { fontSize: 13, color: '#374151' },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1.5, borderColor: '#f97316',
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
  },
  editBtnText: { fontSize: 12, fontWeight: '600', color: '#c2410c' },
  selectDateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: '#f97316', borderStyle: 'dashed',
    borderRadius: 12, padding: 12,
  },
  selectDateText: { fontSize: 13, fontWeight: '600', color: '#c2410c' },

  // Footer
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb',
    paddingHorizontal: 16, paddingVertical: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06, elevation: 8,
  },
  footerLabel: { fontSize: 12, color: '#4b5563', marginBottom: 2 },
  footerPrice: { fontSize: 18, fontWeight: '700', color: '#111827' },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#f97316',
    paddingHorizontal: 24, paddingVertical: 13, borderRadius: 999,
    shadowColor: '#f97316', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, elevation: 4,
  },
  nextBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});

// ── Modal Styles ──────────────────────────────────────────────────────────────
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 32,
  },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  navBtn: { padding: 8, borderRadius: 20 },
  monthTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },

  dayLabelRow: { flexDirection: 'row', marginBottom: 8 },
  dayLabel: { flex: 1, textAlign: 'center', fontSize: 11, color: '#9ca3af', fontWeight: '600' },

  calGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  dayCell: {
    width: `${100 / 7}%`, aspectRatio: 1,
    justifyContent: 'center', alignItems: 'center',
    borderRadius: 10,
  },
  dayCellSelected: { backgroundColor: '#f97316' },
  dayText: { fontSize: 13, color: '#111827' },
  dayTextDisabled: { color: '#d1d5db' },
  dayTextSelected: { color: '#fff', fontWeight: '700' },

  slotTitle: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 10 },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  slotBtn: {
    width: '47%', padding: 10, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#e5e7eb',
    backgroundColor: '#fff', alignItems: 'center',
  },
  slotBtnSelected: { borderColor: '#f97316', backgroundColor: '#fff7ed' },
  slotText: { fontSize: 12, color: '#374151' },
  slotTextSelected: { color: '#c2410c', fontWeight: '600' },

  confirmBtn: {
    backgroundColor: '#f97316', paddingVertical: 14,
    borderRadius: 999, alignItems: 'center',
  },
  confirmBtnDisabled: { backgroundColor: '#e5e7eb' },
  confirmBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

export default OnlinePoojaScreen;