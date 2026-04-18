import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../theme/theme';
import { searchApi } from '../../api/searchApi';

interface SearchResult {
  id: string;
  name: string;
  type: 'pooja' | 'pandit';
  description?: string;
  image?: string;
  rating?: number;
  reviewCount?: number;
}

interface SearchScreenRouteProp {
  params?: {
    query?: string;
  };
  key: string;
  name: string;
  path?: string;
}

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load search history on mount
  useEffect(() => {
    loadSearchHistory();
  }, []);

  // Real-time search
  useEffect(() => {
    if (debouncedQuery.trim()) {
      performSearch(debouncedQuery);
    } else {
      setSearchResults([]);
    }
  }, [debouncedQuery]);

  const performSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setLoading(true);
    
    try {
      const results = await searchApi.search(query);
      setSearchResults(results);
      
      // Add to search history
      if (!searchHistory.includes(query)) {
        const newHistory = [query, ...searchHistory.slice(0, 4)];
        setSearchHistory(newHistory);
        saveSearchHistory(newHistory);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSearchHistory = async () => {
    // Load from AsyncStorage
    try {
      const history = await AsyncStorage.getItem('searchHistory');
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };

  const saveSearchHistory = async (history: string[]) => {
    try {
      await AsyncStorage.setItem('searchHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };

  const handleResultPress = (result: SearchResult) => {
    if (result.type === 'pooja') {
      navigation.navigate('PoojaDetail', { poojaId: result.id });
    } else {
      navigation.navigate('PanditDetail', { panditId: result.id });
    }
  };

  const handleHistoryPress = (query: string) => {
    setSearchQuery(query);
    performSearch(query);
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleResultPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.resultIcon}>
        <Icon 
          name={item.type === 'pooja' ? 'spa' : 'person'} 
          size={20} 
          color={colors.primary} 
        />
      </View>
      <View style={styles.resultContent}>
        <Text style={styles.resultName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.resultDescription}>{item.description}</Text>
        )}
        {item.rating && (
          <View style={styles.ratingContainer}>
            <Icon name="star" size={12} color="#FFB800" />
            <Text style={styles.rating}>{item.rating}</Text>
            {item.reviewCount && (
              <Text style={styles.reviewCount}>({item.reviewCount})</Text>
            )}
          </View>
        )}
      </View>
      <Icon name="chevron-right" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderHistoryItem = (item: string, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.historyItem}
      onPress={() => handleHistoryPress(item)}
      activeOpacity={0.7}
    >
      <Icon name="history" size={16} color={colors.textSecondary} />
      <Text style={styles.historyText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderPoojaResults = () => {
    const poojaResults = searchResults.filter(item => item.type === 'pooja');
    if (poojaResults.length === 0) return null;
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pooja Types</Text>
          <Text style={styles.sectionCount}>({poojaResults.length})</Text>
        </View>
        <FlatList
          data={poojaResults}
          renderItem={renderSearchResult}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>
    );
  };

  const renderPanditResults = () => {
    const panditResults = searchResults.filter(item => item.type === 'pandit');
    if (panditResults.length === 0) return null;
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pandits</Text>
          <Text style={styles.sectionCount}>({panditResults.length})</Text>
        </View>
        <FlatList
          data={panditResults}
          renderItem={renderSearchResult}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by: Pooja Type, Pandit Name"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearSearch}
              activeOpacity={0.7}
            >
              <Icon name="close" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Results */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : searchResults.length > 0 ? (
        <ScrollView 
          style={styles.resultsContainer} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderPoojaResults()}
          {renderPanditResults()}
        </ScrollView>
      ) : searchQuery.trim() ? (
        <View style={styles.noResults}>
          <Icon name="search-off" size={48} color={colors.textSecondary} />
          <Text style={styles.noResultsText}>No results found for "{searchQuery}"</Text>
        </View>
      ) : (
        /* Search History */
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Recent Searches</Text>
          {searchHistory.map(renderHistoryItem)}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: colors.textPrimary,
  },
  clearButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  sectionCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  resultContent: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textPrimary,
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 2,
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noResultsText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  historyContainer: {
    flex: 1,
    padding: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  historyText: {
    marginLeft: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
});

export default SearchScreen;
