import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Modal,
  ScrollView,
  TextInput,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/theme';
import { homeApi, Pandit } from '../../api/homeApi';

const { width } = Dimensions.get('window');

const AllPanditsScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [showSortSheet, setShowSortSheet] = useState(false);
  const [pandits, setPandits] = useState<Pandit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPandits = async () => {
      try {
        setLoading(true);
        const data = await homeApi.getNearbyPandits({
          lat: 28.6139,
          lng: 77.209,
        });
        setPandits(data);
      } catch (error) {
        console.error('Error fetching pandits:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPandits();
  }, []);

  const sortOptions = [
    { value: 'popular', label: 'Popular Pandit' },
    { value: 'new', label: 'New Pandit' },
  ];

  const filterChips = [
    { value: 'rating', label: 'Highest Rated', icon: 'star-outline' },
    { value: 'price-low', label: 'Lowest Price', icon: 'currency-rupee' },
    { value: 'nearest', label: 'Nearest', icon: 'location-on' },
  ];

  const filteredAndSorted = useMemo(() => {
    const filtered = pandits.filter(p => {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.languages.some(l => l.toLowerCase().includes(q))
      );
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
        case 'popular':
          return b.rating - a.rating;
        case 'new':
          return parseInt(b.id) - parseInt(a.id);
        case 'price-low':
          return 0; // placeholder
        case 'nearest':
          return 0; // placeholder
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [pandits, searchQuery, sortBy]);

  const renderPanditCard = ({ item }: { item: Pandit }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        {/* Circular photo */}
        {item.photo ? (
          <Image source={{ uri: item.photo }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitials}>
              {item.name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </Text>
          </View>
        )}

        {/* Info */}
        <View style={styles.cardInfo}>
          <Text style={styles.panditName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.experience}>{item.experience}</Text>
          <View style={styles.ratingRow}>
            <Icon name="star" size={14} color="#f97316" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
      </View>

      {/* Language tags */}
      <View style={styles.tagsRow}>
        {item.languages.map((lang, i) => (
          <View key={i} style={styles.tag}>
            <Text style={styles.tagText}>{lang}</Text>
          </View>
        ))}
      </View>

      {/* View Profile button */}
      <TouchableOpacity
        style={styles.viewProfileBtn}
        onPress={() =>
          navigation.navigate('PanditDetail', { panditId: item.id })
        }
        activeOpacity={0.8}
      >
        <Text style={styles.viewProfileText}>View Profile</Text>
        <Icon name="chevron-right" size={18} color="#ea580c" />
      </TouchableOpacity>
    </View>
  );

  const renderSortSheet = () => (
    <Modal
      visible={showSortSheet}
      animationType="slide"
      transparent
      onRequestClose={() => setShowSortSheet(false)}
    >
      <TouchableOpacity
        style={styles.sheetOverlay}
        activeOpacity={1}
        onPress={() => setShowSortSheet(false)}
      />
      <View style={styles.sortSheet}>
        {/* Sheet header */}
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Sort By</Text>
          <TouchableOpacity
            onPress={() => setShowSortSheet(false)}
            style={styles.sheetClose}
          >
            <Icon name="close" size={22} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Options */}
        {sortOptions.map((opt, index) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.sortOption, index > 0 && styles.sortOptionBorder]}
            onPress={() => {
              setSortBy(opt.value);
              setShowSortSheet(false);
            }}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.sortOptionText,
                sortBy === opt.value && styles.sortOptionTextActive,
              ]}
            >
              {opt.label}
            </Text>

            {/* Radio button */}
            <View
              style={[styles.radio, sortBy === opt.value && styles.radioActive]}
            >
              {sortBy === opt.value && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </Modal>
  );

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
        <Text style={styles.headerTitle}>Available Pandits</Text>
        <TouchableOpacity
          onPress={() => setShowSortSheet(true)}
          style={styles.sortBtn}
        >
          <Icon name="tune" size={22} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Icon
          name="search"
          size={18}
          color="#9ca3af"
          style={{ marginRight: 8 }}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search pandit by name or language"
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {filterChips.map(chip => {
          const isActive = sortBy === chip.value;
          return (
            <TouchableOpacity
              key={chip.value}
              onPress={() =>
                setSortBy(prev =>
                  prev === chip.value ? 'popular' : chip.value,
                )
              }
              style={[styles.chip, isActive && styles.chipActive]}
              activeOpacity={0.8}
            >
              <Icon
                name={chip.icon}
                size={14}
                color={
                  isActive
                    ? '#fff'
                    : chip.icon === 'location-on'
                    ? '#ef4444'
                    : '#374151'
                }
              />
              <Text
                style={[styles.chipText, isActive && styles.chipTextActive]}
              >
                {chip.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* List */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Finding pandits...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredAndSorted}
          renderItem={renderPanditCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No pandits found</Text>
            </View>
          }
        />
      )}

      {renderSortSheet()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF9' },

  // Header
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
  backBtn: { padding: 8, borderRadius: 20 },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#111827' },
  sortBtn: { padding: 8, borderRadius: 20 },

  // Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 999,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#111827', paddingVertical: 0 },

  // Filter chips
  chipsRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    flexDirection: 'row',
    height: 32,
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#f3f4f6',
  },
  chipActive: { backgroundColor: '#f97316' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  chipTextActive: { color: '#fff' },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffedd5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: { fontSize: 20, fontWeight: '700', color: '#f97316' },
  cardInfo: { flex: 1, justifyContent: 'center' },
  panditName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  experience: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 14, fontWeight: '600', color: '#111827' },

  // Language tags
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#fff7ed',
    borderRadius: 999,
  },
  tagText: { fontSize: 11, fontWeight: '700', color: '#ea580c' },

  // View Profile button
  viewProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 11,
    borderWidth: 2,
    borderColor: '#ea580c',
    borderRadius: 999,
  },
  viewProfileText: { fontSize: 14, fontWeight: '700', color: '#ea580c' },

  // Loading / empty
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#6b7280', fontSize: 14 },
  emptyBox: { flex: 1, alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 14, color: '#6b7280', fontStyle: 'italic' },
  listContent: { paddingTop: 8, paddingBottom: 24 },

  // Sort bottom sheet
  sheetOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sortSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 32,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  sheetClose: { padding: 6, borderRadius: 20 },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  sortOptionBorder: { borderTopWidth: 1, borderTopColor: '#f9fafb' },
  sortOptionText: { fontSize: 16, fontWeight: '600', color: '#6b7280' },
  sortOptionTextActive: { color: '#111827' },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActive: { borderColor: '#f97316' },
  radioInner: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#f97316',
  },
});

export default AllPanditsScreen;
