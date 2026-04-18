import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/theme';
import { homeApi, PoojaType } from '../../api/homeApi';

interface AllPoojaTypesScreenProps {}

const AllPoojaTypesScreen: React.FC<AllPoojaTypesScreenProps> = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([1000, 6000]);
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [poojaTypes, setPoojaTypes] = useState<PoojaType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoojaTypes = async () => {
      try {
        setLoading(true);
        const data = await homeApi.getPoojaTypes();
        setPoojaTypes(data);
      } catch (error) {
        console.error('Error fetching pooja types:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPoojaTypes();
  }, []);

  const filteredAndSortedPoojas = useMemo(() => {
    const filtered = poojaTypes.filter(pooja => {
      const matchesSearch =
        pooja.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pooja.description.toLowerCase().includes(searchQuery.toLowerCase());

      const price = parseFloat(pooja.default_price || '0');
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];

      // Backend sends duration as "1-2", "2-3", "3-4", "4-5", "6-8" etc.
      const matchesDuration =
        selectedDuration === 'all' ||
        (selectedDuration === 'short' && pooja.duration === '1-2') ||
        (selectedDuration === 'medium' && (pooja.duration === '2-3' || pooja.duration === '3-4')) ||
        (selectedDuration === 'long' && (pooja.duration === '4-5' || pooja.duration === '6-8'));

      return matchesSearch && matchesPrice && matchesDuration;
    });

    return [...filtered].sort((a, b) => {
      const priceA = parseFloat(a.default_price || '0');
      const priceB = parseFloat(b.default_price || '0');

      switch (sortBy) {
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return priceA - priceB;
        case 'price-high':
          return priceB - priceA;
        case 'duration':
          return (a.duration || '').localeCompare(b.duration || '');
        default: // popular — sort by id ascending
          return a.id - b.id;
      }
    });
  }, [poojaTypes, searchQuery, priceRange, selectedDuration, sortBy]);

  const resetFilters = () => {
    setPriceRange([1000, 6000]);
    setSelectedDuration('all');
    setSortBy('popular');
    setSearchQuery('');
  };

  const renderPoojaCard = ({ item }: { item: PoojaType }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('PoojaDetail', { poojaId: item.id })}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.poojaImage}
          resizeMode="cover"
        />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.poojaName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        {item.duration ? (
          <Text style={styles.duration}>{item.duration} hrs</Text>
        ) : null}
        <View style={styles.priceRow}>
          <Text style={styles.price}>
            ₹{parseFloat(item.default_price || '0').toLocaleString()}
          </Text>
          <Text style={styles.viewDetails}>View Details</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <Icon name="arrow-back" size={24} color={colors.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>All Pooja Types</Text>
      <View style={styles.placeholder} />
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Icon name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search pooja type"
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor={colors.textSecondary}
      />
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowFilters(true)}
        activeOpacity={0.8}
      >
        <Icon name="filter-list" size={20} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.filterModal}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filters & Sort</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowFilters(false)}
              activeOpacity={0.8}
            >
              <Icon name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterContent}>
            {/* Price Range */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Price Range</Text>
              <View style={styles.priceRangeContainer}>
                <Text style={styles.priceRangeText}>
                  ₹{priceRange[0]} - ₹{priceRange[1]}
                </Text>
              </View>
            </View>

            {/* Duration Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Duration</Text>
              <View style={styles.durationButtons}>
                {[
                  { value: 'all',    label: 'All'       },
                  { value: 'short',  label: '1-2 hours' },
                  { value: 'medium', label: '2-4 hours' },
                  { value: 'long',   label: '4+ hours'  },
                ].map(({ value, label }) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.durationButton,
                      selectedDuration === value && styles.durationButtonActive,
                    ]}
                    onPress={() => setSelectedDuration(value)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.durationButtonText,
                        selectedDuration === value && styles.durationButtonTextActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sort By */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Sort By</Text>
              <View style={styles.sortButtons}>
                {[
                  { value: 'popular',      label: 'Popular'           },
                  { value: 'alphabetical', label: 'Alphabetical'      },
                  { value: 'price-low',    label: 'Price: Low to High'},
                  { value: 'price-high',   label: 'Price: High to Low'},
                  { value: 'duration',     label: 'Duration'          },
                ].map(({ value, label }) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.sortButton,
                      sortBy === value && styles.sortButtonActive,
                    ]}
                    onPress={() => setSortBy(value)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.sortButtonText,
                        sortBy === value && styles.sortButtonTextActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.filterFooter}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetFilters}
              activeOpacity={0.8}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowFilters(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading pooja types...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderSearchBar()}

      <FlatList
        data={filteredAndSortedPoojas}
        renderItem={renderPoojaCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="search-off" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No pooja types found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your search or filter criteria
            </Text>
            <TouchableOpacity
              style={styles.clearSearchButton}
              onPress={() => setSearchQuery('')}
              activeOpacity={0.8}
            >
              <Text style={styles.clearSearchText}>Clear Search</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {renderFilterModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: colors.surface,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  poojaImage: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    padding: 12,
  },
  poojaName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 16,
  },
  duration: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  viewDetails: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  clearSearchButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 16,
  },
  clearSearchText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  closeButton: {
    padding: 8,
  },
  filterContent: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  priceRangeContainer: {
    alignItems: 'center',
  },
  priceRangeText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  durationButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  durationButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  durationButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  durationButtonTextActive: {
    color: colors.background,
  },
  sortButtons: {
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sortButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: colors.background,
  },
  filterFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  applyButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: colors.background,
    fontWeight: '600',
  },
});

export default AllPoojaTypesScreen;