import React, { useState, useCallback, useRef } from 'react';
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
  Modal,
  Animated,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { addressApi, SavedAddress } from '../../api/address';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getLabelIcon = (label: string): string => {
  switch (label) {
    case 'Home': return 'home';
    case 'Work': return 'work';
    case 'Temple': return 'place';
    default: return 'location-on';
  }
};

// ─── Screen ───────────────────────────────────────────────────────────────────

const SavedAddressesScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();

  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAddress, setMenuAddress] = useState<SavedAddress | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, []),
  );

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await addressApi.getAll();
      // Sort: default first
      const sorted = [...data].sort((a, b) =>
        a.is_default === b.is_default ? 0 : a.is_default ? -1 : 1,
      );
      setAddresses(sorted);
    } catch (err: any) {
      if (err.message === 'USER_NOT_FOUND') {
        Alert.alert('Session Expired', 'Please log in again.');
      } else {
        Alert.alert('Error', 'Could not load addresses. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const openMenu = (address: SavedAddress) => {
    setMenuAddress(address);
    setMenuVisible(true);
  };

  const closeMenu = () => {
    setMenuVisible(false);
    setMenuAddress(null);
  };

  const handleEdit = () => {
    closeMenu();
    setTimeout(() => {
      navigation.navigate('AddressForm', {
        mode: 'edit',
        addressId: menuAddress?.id,
      });
    }, 200);
  };

  const handleSetDefault = async () => {
    if (!menuAddress) return;
    closeMenu();
    try {
      // Send update with is_default: true
      await addressApi.update(menuAddress.id, {
        address_label: menuAddress.address_label,
        address_line: menuAddress.address_line,
        address_line_2: menuAddress.address_line_2,
        city: menuAddress.city,
        district: menuAddress.district,
        state: menuAddress.state,
        pincode: menuAddress.pincode,
        landmark: menuAddress.landmark ?? undefined,
        contact_name: menuAddress.contact_name,
        contact_phone: menuAddress.contact_phone,
        is_default: true,
      });
      fetchAddresses();
    } catch {
      Alert.alert('Error', 'Failed to set default address.');
    }
  };

  const handleDelete = () => {
    if (!menuAddress) return;
    closeMenu();
    setTimeout(() => {
      Alert.alert(
        'Delete Address',
        `Delete this ${menuAddress.address_label} address?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await addressApi.delete(menuAddress.id);
                fetchAddresses();
              } catch {
                Alert.alert('Error', 'Failed to delete address.');
              }
            },
          },
        ],
      );
    }, 300);
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

      {/* ── Orange Header ── */}
      <View style={styles.header}>
        {/* Top row: back | title | + */}
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerBtn}
          >
            <Icon name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Saved Addresses</Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('AddressForm', { mode: 'add' })}
            style={styles.headerPlusBtn}
          >
            <Icon name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search bar below top row */}
        <View style={styles.searchWrapper}>
          <Icon name="search" size={18} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search saved address"
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* ── Content ── */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredAddresses.length === 0 ? (
            <View style={styles.emptyBox}>
              <Icon name="location-off" size={52} color="#d1d5db" />
              <Text style={styles.emptyTitle}>No saved addresses yet</Text>
              <Text style={styles.emptySubtitle}>
                Tap + to add your first address
              </Text>
            </View>
          ) : (
            filteredAddresses.map(address => (
              <AddressCard
                key={address.id}
                address={address}
                onMenuPress={() => openMenu(address)}
              />
            ))
          )}
          <View style={{ height: 20 }} />
        </ScrollView>
      )}

      {/* ── Sticky Footer ── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddressForm', { mode: 'add' })}
          activeOpacity={0.85}
        >
          <Icon name="add" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Add New Address</Text>
        </TouchableOpacity>
      </View>

      {/* ── 3-dot Popup Menu ── */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={closeMenu}
        >
          <View style={styles.menuCard}>
            <TouchableOpacity style={styles.menuOption} onPress={handleEdit}>
              <Icon name="edit" size={18} color="#374151" />
              <Text style={styles.menuOptionText}>Edit</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuOption} onPress={handleSetDefault}>
              <Icon name="check-circle-outline" size={18} color="#374151" />
              <Text style={styles.menuOptionText}>Set as Default</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuOption} onPress={handleDelete}>
              <Icon name="delete-outline" size={18} color="#ef4444" />
              <Text style={[styles.menuOptionText, { color: '#ef4444' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
};

// ─── Address Card ─────────────────────────────────────────────────────────────

interface AddressCardProps {
  address: SavedAddress;
  onMenuPress: () => void;
}

const AddressCard: React.FC<AddressCardProps> = ({ address, onMenuPress }) => {
  return (
    <View style={[styles.card, address.is_default && styles.cardDefault]}>
      {/* Top row: label + default badge + 3-dot menu */}
      <View style={styles.cardTopRow}>
        <View style={styles.cardTopLeft}>
          {/* Label pill */}
          <View style={styles.labelPill}>
            <Text style={styles.labelPillText}>{address.address_label}</Text>
          </View>

          {/* Default badge */}
          {address.is_default && (
            <View style={styles.defaultBadge}>
              <Icon name="check-circle" size={12} color="#fff" />
              <Text style={styles.defaultBadgeText}>Default</Text>
            </View>
          )}
        </View>

        {/* 3-dot menu */}
        <TouchableOpacity onPress={onMenuPress} style={styles.menuDotBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Icon name="more-vert" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Address details */}
      <View style={styles.cardBody}>
        <Icon name="location-on" size={18} color="#f97316" style={styles.pinIcon} />
        <View style={styles.cardBodyText}>
          <Text style={styles.addressLine}>{address.address_line}</Text>
          <Text style={styles.addressSub}>
            {address.city}, {address.state} - {address.pincode}
          </Text>
        </View>
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },

  // Header
  header: {
    backgroundColor: '#f97316',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerBtn: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerPlusBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 0,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    paddingVertical: 0,
  },

  // Back/Plus row
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12 },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  cardDefault: {
    borderColor: '#f97316',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  labelPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#f3f4f6',
    borderRadius: 999,
  },
  labelPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#f97316',
    borderRadius: 999,
  },
  defaultBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  menuDotBtn: { padding: 4 },

  cardBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  pinIcon: { marginTop: 1, flexShrink: 0 },
  cardBodyText: { flex: 1 },
  addressLine: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  addressSub: { fontSize: 13, color: '#6b7280' },

  // Empty
  emptyBox: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#374151' },
  emptySubtitle: { fontSize: 13, color: '#9ca3af' },

  // Footer
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f97316',
    paddingVertical: 16,
    borderRadius: 999,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },

  // Popup menu
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingRight: 24,
    paddingBottom: 200,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 4,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  menuOptionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginHorizontal: 12,
  },
});

export default SavedAddressesScreen;