import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Slider from '@react-native-community/slider';
import { colors } from '../../theme/theme';
import { panditApi, Pandit } from '../../api/panditApi';

interface Filters {
  priceRange: [number, number];
  rating: number;
  experience: string;
  languages: string[];
  distance: number;
}

const PanditListScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [pandits, setPandits] = useState<Pandit[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const [filters, setFilters] = useState<Filters>({
    priceRange: [500, 3000],
    rating: 0,
    experience: '1',
    languages: [],
    distance: 50,
  });

  const flatListRef = useRef<FlatList>(null);

  const loadPandits = useCallback(async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const currentPage = isLoadMore ? page : 1;
      const response = await panditApi.getPandits({
        page: currentPage,
        limit: 10,
        sortBy,
        filters: {
          ...filters,
          languages: filters.languages.length > 0 ? filters.languages : undefined,
        },
      });

      if (isLoadMore) {
        setPandits(prev => [...prev, ...response.pandits]);
      } else {
        setPandits(response.pandits);
      }

      setHasMore(response.hasMore);
      setPage(currentPage + 1);
    } catch (error) {
      console.error('Error loading pandits:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [page, sortBy, filters]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadPandits(true);
    }
  }, [loadingMore, hasMore, loadPandits]);

  const handleRefresh = useCallback(() => {
    setPage(1);
    loadPandits(false);
  }, [loadPandits]);

  const applyFilters = () => {
    setShowFilterModal(false);
    setPage(1);
    loadPandits(false);
  };

  const toggleLanguage = (language: string) => {
    setFilters(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language],
    }));
  };

  const renderPanditCard = ({ item }: { item: Pandit }) => (
    <TouchableOpacity
      style={styles.panditCard}
      onPress={() => navigation.navigate('PanditDetail', { panditId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.panditInfo}>
        <View style={styles.photoContainer}>
          <Icon name="person" size={40} color={colors.primary} />
        </View>
        <View style={styles.panditDetails}>
          <Text style={styles.panditName}>{item.name}</Text>
          <Text style={styles.panditExperience}>{item.experience}</Text>
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map(star => (
                <Icon
                  key={star}
                  name={star <= Math.floor(item.rating) ? 'star' : 'star-border'}
                  size={12}
                  color="#FFB800"
                />
              ))}
            </View>
            <Text style={styles.rating}>{item.rating}</Text>
            <Text style={styles.reviewCount}>({item.reviewCount})</Text>
          </View>
          <View style={styles.languagesContainer}>
            {item.languages.slice(0, 2).map((lang, index) => (
              <Text key={index} style={styles.languageBadge}>{lang}</Text>
            ))}
          </View>
          {item.distance && (
            <Text style={styles.distance}>{item.distance} km away</Text>
          )}
        </View>
      </View>
      <View style={styles.panditActions}>
        <Text style={styles.price}>From</Text>
        <Text style={styles.priceAmount}>${item.price}</Text>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => navigation.navigate('PanditDetail', { panditId: item.id })}
          activeOpacity={0.8}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowFilterModal(false)}>
            <Icon name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Filters</Text>
          <TouchableOpacity onPress={applyFilters}>
            <Text style={styles.applyButton}>Apply</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* Price Range */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Price Range</Text>
            <View style={styles.priceRangeContainer}>
              <Text style={styles.priceLabel}>${filters.priceRange[0]}</Text>
              <Slider
                style={styles.slider}
                minimumValue={500}
                maximumValue={3000}
                value={filters.priceRange[1]}
                onValueChange={(value) =>
                  setFilters(prev => ({ ...prev, priceRange: [prev.priceRange[0], value] }))
                }
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
                thumbStyle={{ backgroundColor: colors.primary }}
              />
              <Text style={styles.priceLabel}>${filters.priceRange[1]}</Text>
            </View>
          </View>

          {/* Rating */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Rating</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map(rating => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.ratingOption,
                    filters.rating === rating && styles.ratingOptionSelected,
                  ]}
                  onPress={() => setFilters(prev => ({ ...prev, rating }))}
                >
                  <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Icon
                        key={star}
                        name={star <= rating ? 'star' : 'star-border'}
                        size={16}
                        color={star <= rating ? '#FFB800' : colors.textSecondary}
                      />
                    ))}
                  </View>
                  <Text style={styles.ratingOptionText}>& up</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Experience */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Experience</Text>
            <View style={styles.experienceContainer}>
              {['1', '3', '5', '10'].map(exp => (
                <TouchableOpacity
                  key={exp}
                  style={[
                    styles.experienceOption,
                    filters.experience === exp && styles.experienceOptionSelected,
                  ]}
                  onPress={() => setFilters(prev => ({ ...prev, experience: exp }))}
                >
                  <Text style={styles.experienceOptionText}>{exp}+ years</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Languages */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Languages</Text>
            <View style={styles.languagesContainer}>
              {['Hindi', 'English', 'Sanskrit', 'Gujarati', 'Marathi', 'Tamil'].map(lang => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.languageOption,
                    filters.languages.includes(lang) && styles.languageOptionSelected,
                  ]}
                  onPress={() => toggleLanguage(lang)}
                >
                  <Text style={styles.languageOptionText}>{lang}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Distance */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Distance</Text>
            <View style={styles.distanceContainer}>
              <Text style={styles.distanceLabel}>{filters.distance} km</Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={50}
                value={filters.distance}
                onValueChange={(value) =>
                  setFilters(prev => ({ ...prev, distance: value }))
                }
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
                thumbStyle={{ backgroundColor: colors.primary }}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>Loading more...</Text>
      </View>
    );
  };

  React.useEffect(() => {
    loadPandits();
  }, []);

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
        <Text style={styles.headerTitle}>Pandits</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
          activeOpacity={0.7}
        >
          <Icon name="filter-list" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={[styles.sortOption, sortBy === 'alphabetical' && styles.sortOptionSelected]}
          onPress={() => {
            setSortBy('alphabetical');
            loadPandits(false);
          }}
        >
          <Text style={styles.sortOptionText}>A-Z</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortOption, sortBy === 'newest' && styles.sortOptionSelected]}
          onPress={() => {
            setSortBy('newest');
            loadPandits(false);
          }}
        >
          <Text style={styles.sortOptionText}>Newest</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortOption, sortBy === 'popular' && styles.sortOptionSelected]}
          onPress={() => {
            setSortBy('popular');
            loadPandits(false);
          }}
        >
          <Text style={styles.sortOptionText}>Popular</Text>
        </TouchableOpacity>
      </View>

      {/* Pandits List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={pandits}
          renderItem={renderPanditCard}
          keyExtractor={(item) => item.id}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Filter Modal */}
      {renderFilterModal()}
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
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  filterButton: {
    padding: 8,
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sortOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    marginRight: 8,
  },
  sortOptionSelected: {
    backgroundColor: colors.primary + '15',
  },
  sortOptionText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  listContainer: {
    padding: 16,
  },
  panditCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'space-between',
  },
  panditInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  photoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  panditDetails: {
    flex: 1,
  },
  panditName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  panditExperience: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 4,
  },
  rating: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textPrimary,
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  languagesContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  languageBadge: {
    fontSize: 10,
    color: colors.primary,
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
  },
  distance: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  panditActions: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  price: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  priceAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  bookButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    color: colors.textSecondary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  applyButton: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  priceRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    width: 40,
  },
  slider: {
    flex: 1,
    marginHorizontal: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingOption: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  ratingOptionSelected: {
    backgroundColor: colors.primary + '15',
  },
  ratingOptionText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  experienceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  experienceOption: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.background,
    marginHorizontal: 2,
  },
  experienceOptionSelected: {
    backgroundColor: colors.primary + '15',
  },
  experienceOptionText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  languagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  languageOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.background,
    marginBottom: 8,
  },
  languageOptionSelected: {
    backgroundColor: colors.primary + '15',
  },
  languageOptionText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  distanceContainer: {
    alignItems: 'center',
  },
  distanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
});

export default PanditListScreen;
