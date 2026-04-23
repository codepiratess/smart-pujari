import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addressApi, SavedAddress } from '../../api/address';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getLabelIcon = (label: string): string => {
  switch (label) {
    case 'Home':
      return 'home';
    case 'Work':
      return 'work';
    case 'Temple':
      return 'place';
    default:
      return 'location-on';
  }
};

const getLabelColor = (label: string) => {
  switch (label) {
    case 'Home':
      return { bg: '#dcfce7', icon: '#16a34a' };
    case 'Work':
      return { bg: '#ede9fe', icon: '#7c3aed' };
    case 'Temple':
      return { bg: '#fff7ed', icon: '#ea580c' };
    default:
      return { bg: '#f3f4f6', icon: '#6b7280' };
  }
};

// ─── Screen ───────────────────────────────────────────────────────────────────

const SelectLocationScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();

  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Refresh every time screen comes into focus (after add / edit / delete)
  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, []),
  );

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await addressApi.getAll();
      setAddresses(data);
    } catch (err: any) {
      if (err.message === 'USER_NOT_FOUND') {
        Alert.alert('Session Expired', 'Please log in again.');
      } else {
        console.error('fetchAddresses error:', err);
        Alert.alert('Error', 'Could not load addresses. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = (address: SavedAddress) => {
    Alert.alert(
      'Delete Address',
      `Delete this ${address.address_label} address?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await addressApi.delete(address.id);
              fetchAddresses();
            } catch {
              Alert.alert('Error', 'Failed to delete address');
            }
          },
        },
      ],
    );
  };

  const handleSelectAddress = async (address: SavedAddress) => {
    const displayText = `${address.city}, ${
      address.address_line_2 || address.address_line
    }`;
    await AsyncStorage.setItem('selectedAddress', JSON.stringify(address));
    await AsyncStorage.setItem('locationDisplay', displayText);
    navigation.goBack();
  };

  const filteredAddresses = addresses.filter(addr => {
    const q = searchQuery.toLowerCase();
    return (
      addr.address_line?.toLowerCase().includes(q) ||
      addr.address_line_2?.toLowerCase().includes(q) ||
      addr.city?.toLowerCase().includes(q) ||
      addr.address_label?.toLowerCase().includes(q) ||
      addr.pincode?.includes(q)
    );
  });

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
        <Text style={styles.headerTitle}>Select Location</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
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
              placeholder="Search area, street, building"
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Use Current Location */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() =>
              Alert.alert('GPS', 'GPS location detection coming soon')
            }
            activeOpacity={0.7}
          >
            <View style={[styles.optionIcon, { backgroundColor: '#eff6ff' }]}>
              <Icon name="near-me" size={22} color="#3b82f6" />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Use Current Location</Text>
              <Text style={styles.optionSubtitle}>Detect via GPS</Text>
            </View>
          </TouchableOpacity>

          {/* Select on Map */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => Alert.alert('Map', 'Map picker coming soon')}
            activeOpacity={0.7}
          >
            <View style={[styles.optionIcon, { backgroundColor: '#fff7ed' }]}>
              <Icon name="location-on" size={22} color="#f97316" />
            </View>
            <Text style={styles.optionTitle}>Select on Map</Text>
          </TouchableOpacity>

          {/* Add New Address */}
          <TouchableOpacity
            style={styles.addCard}
            onPress={() => navigation.navigate('AddressForm', { mode: 'add' })}
            activeOpacity={0.7}
          >
            <View style={[styles.optionIcon, { backgroundColor: '#fff7ed' }]}>
              <Icon name="add" size={22} color="#f97316" />
            </View>
            <Text style={styles.addTitle}>Add New Address</Text>
          </TouchableOpacity>

          {/* Saved Addresses */}
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#f97316" />
            </View>
          ) : filteredAddresses.length > 0 ? (
            <>
              <Text style={styles.savedLabel}>SAVED ADDRESSES</Text>
              {filteredAddresses.map(address => {
                const colors = getLabelColor(address.address_label);
                return (
                  <TouchableOpacity
                    key={address.id}
                    style={styles.addressCard}
                    onPress={() => handleSelectAddress(address)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.addressTop}>
                      <View
                        style={[
                          styles.addressIcon,
                          { backgroundColor: colors.bg },
                        ]}
                      >
                        <Icon
                          name={getLabelIcon(address.address_label)}
                          size={20}
                          color={colors.icon}
                        />
                      </View>
                      <View style={styles.addressInfo}>
                        <View style={styles.addressLabelRow}>
                          <Text style={styles.addressLabel}>
                            {address.address_label}
                          </Text>
                          {address.is_default && (
                            <View style={styles.defaultBadge}>
                              <Text style={styles.defaultBadgeText}>
                                Default
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.addressLine} numberOfLines={2}>
                          {address.address_line}
                          {address.address_line_2
                            ? `, ${address.address_line_2}`
                            : ''}
                        </Text>
                        <Text style={styles.addressCity}>
                          {address.city}, {address.state} - {address.pincode}
                        </Text>
                      </View>
                      <Icon name="chevron-right" size={20} color="#d1d5db" />
                    </View>

                    <View style={styles.addressDivider} />

                    <View style={styles.addressActions}>
                      <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() =>
                          navigation.navigate('AddressForm', {
                            mode: 'edit',
                            addressId: address.id,
                          })
                        }
                      >
                        <Icon name="edit" size={15} color="#6b7280" />
                        <Text style={styles.editBtnText}>Edit</Text>
                      </TouchableOpacity>

                      <View style={styles.actionDivider} />

                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDeleteAddress(address)}
                      >
                        <Icon name="delete-outline" size={15} color="#ef4444" />
                        <Text style={styles.deleteBtnText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </>
          ) : addresses.length === 0 && !loading ? (
            <View style={styles.emptyBox}>
              <Icon name="location-off" size={48} color="#d1d5db" />
              <Text style={styles.emptyTitle}>No saved addresses yet</Text>
              <Text style={styles.emptySubtitle}>
                Add your address for faster booking
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
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
  backBtn: { padding: 8, borderRadius: 20 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },

  content: { padding: 16, gap: 12 },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 4,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#111827', paddingVertical: 0 },

  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    padding: 16,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: { flex: 1 },
  optionTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  optionSubtitle: { fontSize: 12, color: '#6b7280', marginTop: 2 },

  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fff7ed',
    borderWidth: 2,
    borderColor: '#fed7aa',
    borderRadius: 14,
    padding: 16,
  },
  addTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },

  savedLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: 1,
    marginTop: 8,
    marginBottom: 4,
  },

  addressCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    overflow: 'hidden',
  },
  addressTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  addressIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  addressInfo: { flex: 1 },
  addressLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  addressLabel: { fontSize: 15, fontWeight: '700', color: '#111827' },
  defaultBadge: {
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  defaultBadgeText: { fontSize: 10, fontWeight: '700', color: '#f97316' },
  addressLine: { fontSize: 13, color: '#374151', lineHeight: 18 },
  addressCity: { fontSize: 12, color: '#6b7280', marginTop: 2 },

  addressDivider: { height: 1, backgroundColor: '#f3f4f6' },
  addressActions: { flexDirection: 'row' },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  editBtnText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  actionDivider: { width: 1, backgroundColor: '#f3f4f6', marginVertical: 8 },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  deleteBtnText: { fontSize: 13, fontWeight: '600', color: '#ef4444' },

  loadingBox: { paddingVertical: 24, alignItems: 'center' },
  emptyBox: { paddingVertical: 40, alignItems: 'center', gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151' },
  emptySubtitle: { fontSize: 13, color: '#9ca3af' },
});

export default SelectLocationScreen;
