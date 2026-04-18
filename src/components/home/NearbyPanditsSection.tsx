import React from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/theme';

const { width } = Dimensions.get('window');

interface Pandit {
  id: string;
  name: string;
  experience: string;
  rating: number;
  reviewCount: number;
  languages: string[];
  photo?: string;
}

interface NearbyPanditsSectionProps {
  pandits: Pandit[];
  loading?: boolean;
}

const NearbyPanditsSection: React.FC<NearbyPanditsSectionProps> = ({
  pandits,
  loading = false,
}) => {
  const navigation = useNavigation<StackNavigationProp<any>>();

  const handleViewAllPress = () => {
    // TODO: Navigate to AllPanditsScreen
    console.log('View all pandits pressed');
  };

  const handlePanditPress = (pandit: Pandit) => {
    // Navigate to PanditDetailScreen
    navigation.navigate('PanditDetail', { panditId: pandit.id });
  };

  const renderPanditCard = ({ item }: { item: Pandit }) => {
  // Debug logging
  console.log('Rendering pandit card:', item.name, 'Photo URL:', item.photo);
  
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handlePanditPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.photoContainer}>
        {item.photo && item.photo !== '' ? (
          <Image 
            source={{ uri: item.photo }} 
            style={styles.photoPlaceholder}
            resizeMode="cover"
            onError={(error) => console.log('Image load error:', error.nativeEvent.error)}
            onLoad={() => console.log('Image loaded successfully:', item.photo)}
          />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoText}>{item.name.split(' ').map(n => n[0]).join('')}</Text>
          </View>
        )}
      </View>
      <Text style={styles.panditName}>{item.name}</Text>
      <Text style={styles.experience}>{item.experience}</Text>
      <View style={styles.ratingContainer}>
        <Icon name="star" size={12} color="#FFB800" />
        <Text style={styles.rating}>{item.rating}</Text>
        <Text style={styles.reviewCount}>({item.reviewCount})</Text>
      </View>
      <View style={styles.languageContainer}>
        {item.languages.slice(0, 2).map((language, index) => (
          <View key={index} style={styles.languageTag}>
            <Text style={styles.languageText}>{language}</Text>
          </View>
        ))}
        {item.languages.length > 2 && (
          <View style={styles.languageTag}>
            <Text style={styles.languageText}>+{item.languages.length - 2}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.sectionTitle}>Nearby Pandits</Text>
        <Text style={styles.subtitle}>Based on your location</Text>
      </View>
      <TouchableOpacity
        style={styles.viewAllButton}
        onPress={handleViewAllPress}
        activeOpacity={0.7}
      >
        <Text style={styles.viewAllText}>View All</Text>
        <Icon name="arrow-forward" size={14} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading nearby pandits...</Text>
        </View>
      </View>
    );
  }

  if (pandits.length === 0) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.emptyContainer}>
          <Icon name="location-searching" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyText}>No pandits available in your area</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        data={pandits}
        renderItem={renderPanditCard}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  arrow: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 4,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  card: {
    width: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  photoContainer: {
    marginBottom: 8,
  },
  photoPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: colors.primary + '20',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  panditName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  experience: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textPrimary,
    marginRight: 2,
  },
  reviewCount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  languageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
  },
  languageTag: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  languageText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '500',
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    marginHorizontal: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
});

export default NearbyPanditsSection;
