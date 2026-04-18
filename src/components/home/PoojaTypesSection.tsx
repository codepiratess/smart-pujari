import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/theme';
import { homeApi, PoojaType } from '../../api/homeApi';

interface PoojaTypesSectionProps {}

const PoojaTypesSection: React.FC<PoojaTypesSectionProps> = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [poojaTypes, setPoojaTypes] = useState<PoojaType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoojaTypes = async () => {
      try {
        setLoading(true);
        const data = await homeApi.getPoojaTypes(4); // Limit to 4 for home screen
        setPoojaTypes(data);
      } catch (error) {
        console.error('Error fetching pooja types:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPoojaTypes();
  }, []);

  const handleViewAllPress = () => {
    navigation.navigate('AllPoojaTypes');
  };

  const handlePoojaPress = (pooja: PoojaType) => {
    navigation.navigate('PoojaDetail', { poojaId: pooja.id });
  };

  const renderPoojaCard = ({ item }: { item: PoojaType }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handlePoojaPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {item.image && item.image !== '' ? (
          <Image
            source={{ uri: item.image }}
            style={styles.poojaImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imageText}>{item.name[0]}</Text>
          </View>
        )}
      </View>
      <Text style={styles.poojaName}>{item.name}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.infoContainer}>
        {item.default_price && (
          <View style={styles.infoItem}>
            <Icon name="currency-rupee" size={12} color={colors.primary} />
            <Text style={styles.infoText}>
              {parseFloat(item.default_price).toLocaleString()}
            </Text>
          </View>
        )}
        {item.duration && (
          <View style={styles.infoItem}>
            <Icon name="schedule" size={12} color={colors.textSecondary} />
            <Text style={styles.infoText}>{item.duration} hrs</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.viewDetailsButton}
        onPress={() => handlePoojaPress(item)}
        activeOpacity={0.7}
      >
        <Text style={styles.viewDetailsText}>View Details</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.sectionTitle}>Pooja Types</Text>
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
          <Text style={styles.loadingText}>Loading pooja types...</Text>
        </View>
      </View>
    );
  }

  if (poojaTypes.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        data={poojaTypes}
        renderItem={renderPoojaCard}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        keyExtractor={(item) => item.id.toString()}
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
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
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
  listContainer: {
    paddingHorizontal: 16,
  },
  card: {
    width: 300,
    height: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    marginBottom: 8,
  },
  poojaImage: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  imagePlaceholder: {
    width: '100%',
    height: 140,
    backgroundColor: colors.primary + '20',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
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
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  infoText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  viewDetailsButton: {
    alignSelf: 'flex-start',
  },
  viewDetailsText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  loadingContainer: {
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    marginHorizontal: 16,
  },
  loadingText: {
    color: colors.textSecondary,
  },
});

export default PoojaTypesSection;