import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TextInput,
  SafeAreaView,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/theme';
import { poojaApi, PoojaType } from '../../api/poojaApi';

const PoojaListScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  
  const [poojaTypes, setPoojaTypes] = useState<PoojaType[]>([]);
  const [filteredPoojaTypes, setFilteredPoojaTypes] = useState<PoojaType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([1000, 6000]);
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadPoojaTypes();
  }, []);

  useEffect(() => {
    filterAndSortPoojaTypes();
  }, [poojaTypes, searchQuery, priceRange, selectedDuration, sortBy]);

  const loadPoojaTypes = async () => {
    try {
      setLoading(true);
      const types = await poojaApi.getPoojaTypes();
      setPoojaTypes(types);
    } catch (error) {
      console.error('Error loading pooja types:', error);
      Alert.alert('Error', 'Unable to load pooja types');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortPoojaTypes = () => {
    let filtered = [...poojaTypes];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(pooja =>
        pooja.name.toLowerCase().includes(query) ||
        pooja.description.toLowerCase().includes(query)
      );
    }

    // Apply price filter
    filtered = filtered.filter(pooja => {
      const price = parseInt(pooja.default_price || '0');
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Apply duration filter
    if (selectedDuration !== 'all') {
      filtered = filtered.filter(pooja => {
        const duration = pooja.duration || '';
        switch (selectedDuration) {
          case 'short':
            return duration.includes('1-2');
          case 'medium':
            return duration.includes('2-3') || duration.includes('3-4');
          case 'long':
            return duration.includes('4') || duration.includes('5');
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const priceA = parseInt(a.default_price || '0');
      const priceB = parseInt(b.default_price || '0');

      switch (sortBy) {
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return priceA - priceB;
        case 'price-high':
          return priceB - priceA;
        case 'duration':
          return (a.duration || '').localeCompare(b.duration || '');
        default: // popular
          return a.id - b.id;
      }
    });

    setFilteredPoojaTypes(filtered);
  };

  const resetFilters = () => {
    setPriceRange([1000, 6000]);
    setSelectedDuration('all');
    setSortBy('popular');
    setSearchQuery('');
  };

  const handlePoojaPress = (pooja: PoojaType) => {
    navigation.navigate('PoojaDetail', { poojaId: pooja.id });
  };

  const renderPoojaCard = ({ item }: { item: PoojaType }) => (
    <TouchableOpacity
      style={styles.poojaCard}
      onPress={() => handlePoojaPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.poojaImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Icon name="spa" size={32} color={colors.primary} />
          </View>
        )}
      </View>
      
      <View style={styles.cardContent}>
        <Text style={styles.poojaName}>{item.name}</Text>
        <Text style={styles.poojaDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.cardFooter}>
          <View style={styles.durationContainer}>
            <Icon name="schedule" size={14} color={colors.textSecondary} />
            <Text style={styles.durationText}>{item.duration}</Text>
          </View>
          <Text style={styles.price}>${item.default_price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="search-off" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyText}>No pooja types found</Text>
      <Text style={styles.emptySubtext}>
        Try adjusting your search or filter criteria
      </Text>
      <TouchableOpacity
        style={styles.clearButton}
        onPress={resetFilters}
        activeOpacity={0.8}
      >
        <Text style={styles.clearButtonText}>Clear Search</Text>
      </TouchableOpacity>
    </View>
  );

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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Pooja Types</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search pooja type"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
          activeOpacity={0.7}
        >
          <Icon name="filter-list" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredPoojaTypes.length} {filteredPoojaTypes.length === 1 ? 'result' : 'results'}
        </Text>
      </View>

      {/* Pooja List */}
      <FlatList
        data={filteredPoojaTypes}
        renderItem={renderPoojaCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Filter Modal */}
      {showFilters && (
        <View style={styles.filterOverlay}>
          <View style={styles.filterModal}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Filters & Sort</Text>
              <TouchableOpacity
                onPress={() => setShowFilters(false)}
                activeOpacity={0.7}
              >
                <Icon name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterContent}>
              {/* Price Range */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Price Range</Text>
                <View style={styles.priceRangeContainer}>
                  <Text style={styles.priceRangeText}>${priceRange[0]} - ${priceRange[1]}</Text>
                </View>
                <View style={styles.priceSlider}>
                  <Text style={styles.sliderLabel}>Min: ${priceRange[0]}</Text>
                  <Text style={styles.sliderLabel}>Max: ${priceRange[1]}</Text>
                </View>
              </View>

              {/* Duration */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Duration</Text>
                <View style={styles.durationButtons}>
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'short', label: '1-2 hours' },
                    { value: 'medium', label: '2-4 hours' },
                    { value: 'long', label: '4+ hours' },
                  ].map(({ value, label }) => (
                    <TouchableOpacity
                      key={value}
                      style={[
                        styles.durationButton,
                        selectedDuration === value && styles.durationButtonActive,
                      ]}
                      onPress={() => setSelectedDuration(value)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.durationButtonText,
                        selectedDuration === value && styles.durationButtonTextActive,
                      ]}>
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
                    { value: 'popular', label: 'Popular' },
                    { value: 'alphabetical', label: 'Alphabetical' },
                    { value: 'price-low', label: 'Price: Low to High' },
                    { value: 'price-high', label: 'Price: High to Low' },
                    { value: 'duration', label: 'Duration' },
                  ].map(({ value, label }) => (
                    <TouchableOpacity
                      key={value}
                      style={[
                        styles.sortButton,
                        sortBy === value && styles.sortButtonActive,
                      ]}
                      onPress={() => setSortBy(value)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.sortButtonText,
                        sortBy === value && styles.sortButtonTextActive,
                      ]}>
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
                activeOpacity={0.7}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setShowFilters(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
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
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 8,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  listContainer: {
    padding: 16,
  },
  poojaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  poojaImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 16,
  },
  poojaName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  poojaDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  clearButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  filterOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: '#FFFFFF',
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
  filterContent: {
    flex: 1,
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
    marginBottom: 8,
  },
  priceRangeText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  priceSlider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    fontSize: 12,
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
    borderRadius: 16,
    backgroundColor: colors.background,
  },
  durationButtonActive: {
    backgroundColor: colors.primary,
  },
  durationButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  durationButtonTextActive: {
    color: '#FFFFFF',
  },
  sortButtons: {
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  sortButtonActive: {
    backgroundColor: colors.primary + '15',
  },
  sortButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  sortButtonTextActive: {
    color: colors.primary,
    fontWeight: '500',
  },
  filterFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default PoojaListScreen;
