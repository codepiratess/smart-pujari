import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/theme';
import { poojaApi, PoojaDetail } from '../../api/poojaApi';

interface PoojaDetailRouteProp {
  params: {
    poojaId: number;
  };
  key: string;
  name: string;
  path?: string;
}

const PoojaDetailScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute<PoojaDetailRouteProp>();
  const { poojaId } = route.params;
  
  const [pooja, setPooja] = useState<PoojaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // Load pooja details from backend
  const loadPoojaDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const poojaData = await poojaApi.getPoojaDetail(poojaId);
      setPooja(poojaData);
    } catch (err) {
      console.error('Error loading pooja details:', err);
      setError('Unable to load pooja details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPoojaDetails();
  }, [poojaId]);

  const handleBookPooja = () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Required', 'Please select both date and time for pooja');
      return;
    }
    
    // Navigate to booking screen
    navigation.navigate('BookPooja', {
      poojaId: pooja?.id,
      date: selectedDate,
      time: selectedTime,
    });
  };

  const renderIncludesItem = (item: string, index: number) => (
    <View key={index} style={styles.includesItem}>
      <Icon name="check-circle" size={16} color={colors.primary} />
      <Text style={styles.includesText}>{item}</Text>
    </View>
  );

  const renderBenefitItem = (item: string, index: number) => (
    <View key={index} style={styles.benefitItem}>
      <Icon name="stars" size={16} color="#FFB800" />
      <Text style={styles.benefitText}>{item}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading pooja details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !pooja) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error" size={48} color={colors.error} />
          <Text style={styles.errorText}>{error || 'Pooja details not found'}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadPoojaDetails}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Pooja Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Pooja Image */}
        <View style={styles.imageContainer}>
          {pooja.image ? (
            <Image source={{ uri: pooja.image }} style={styles.poojaImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Icon name="spa" size={48} color={colors.primary} />
            </View>
          )}
        </View>

        {/* Pooja Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.poojaName}>{pooja?.name}</Text>
          <Text style={styles.poojaDescription}>{pooja?.full_description}</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Icon name="schedule" size={20} color={colors.primary} />
              <Text style={styles.infoLabel}>Duration</Text>
              <Text style={styles.infoValue}>{pooja?.duration_hours}</Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="currency-rupee" size={20} color={colors.primary} />
              <Text style={styles.infoLabel}>Price</Text>
              <Text style={styles.infoValue}>${pooja?.price}</Text>
            </View>
          </View>
        </View>

        {/* What's Included */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's Included</Text>
          <View style={styles.includesContainer}>
            {pooja?.what_includes?.map(renderIncludesItem)}
          </View>
        </View>

        {/* Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Benefits</Text>
          <View style={styles.benefitsContainer}>
            {pooja?.benefits_list?.map(renderBenefitItem)}
          </View>
        </View>

        {/* Booking Section */}
        <View style={styles.bookingSection}>
          <Text style={styles.sectionTitle}>Book Pooja</Text>
          
          <View style={styles.bookingForm}>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => {
                // TODO: Show date picker
                Alert.alert('Date Picker', 'Date picker will be implemented');
              }}
              activeOpacity={0.7}
            >
              <Icon name="event" size={20} color={colors.textSecondary} />
              <Text style={styles.dateText}>
                {selectedDate || 'Select Date'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.timeInput}
              onPress={() => {
                // TODO: Show time picker
                Alert.alert('Time Picker', 'Time picker will be implemented');
              }}
              activeOpacity={0.7}
            >
              <Icon name="schedule" size={20} color={colors.textSecondary} />
              <Text style={styles.dateText}>
                {selectedTime || 'Select Time'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.bookButton}
            onPress={handleBookPooja}
            activeOpacity={0.8}
          >
            <Text style={styles.bookButtonText}>Book Pooja</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
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
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
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
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  poojaImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: colors.primary + '20',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    padding: 16,
  },
  poojaName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  poojaDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  infoRow: {
    gap: 16,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 8,
  },
  section: {
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  includesContainer: {
    gap: 12,
  },
  includesItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  includesText: {
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 8,
  },
  benefitsContainer: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitText: {
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 8,
  },
  bookingSection: {
    padding: 16,
    marginTop: 8,
  },
  bookingForm: {
    gap: 12,
    marginBottom: 20,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
  },
  timeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 8,
  },
  bookButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomPadding: {
    height: 20,
  },
});

export default PoojaDetailScreen;
