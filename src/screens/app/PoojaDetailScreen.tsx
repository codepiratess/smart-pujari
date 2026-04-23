import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PoojaType {
  id: number;
  name: string;
  description: string;
  image: string;
  default_price: string;
  duration: string;
  status: string;
}

interface AddonItem {
  pandit_addon_id: number;
  name: string;
  price: string;
  notes: string | null;
  status: string;
  quantity: number;
}

interface ExpertPandit {
  pandit_pooja_id: number;
  pandit_id: number;
  name: string;
  price: string;
  duration: string;
  image: string;
  is_expertise: boolean;
  profile: {
    id: number;
    experience_years: number;
    rating: number;
    languages: string[];
    operating_city: string;
  };
}

// ─── API ──────────────────────────────────────────────────────────────────────

const backendAxios = axios.create({
  baseURL: 'http://13.232.175.231/api/v1',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

const PoojaDetailScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute<any>();
  const { poojaId } = route.params;

  const [pooja, setPooja] = useState<PoojaType | null>(null);
  const [pandits, setPandits] = useState<ExpertPandit[]>([]);
  const [selectedPandit, setSelectedPandit] = useState<ExpertPandit | null>(
    null,
  );
  const [addons, setAddons] = useState<AddonItem[]>([]);
  const [addonsLoading, setAddonsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFullDesc, setShowFullDesc] = useState(false);

  useEffect(() => {
    loadData();
  }, [poojaId]);

  useEffect(() => {
    if (selectedPandit) {
      fetchAddons(selectedPandit.pandit_id);
    } else {
      setAddons([]);
    }
  }, [selectedPandit]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [poojaRes, panditsRes] = await Promise.all([
        backendAxios.get(`/pooja-types/${poojaId}`),
        backendAxios.get(`/pooja-types/${poojaId}/pandits`),
      ]);
      if (poojaRes.data.success) setPooja(poojaRes.data.data);
      if (panditsRes.data.success && Array.isArray(panditsRes.data.data)) {
        setPandits(panditsRes.data.data);
      }
    } catch (error) {
      console.error('Error loading pooja detail:', error);
      Alert.alert('Error', 'Unable to load pooja details');
    } finally {
      setLoading(false);
    }
  };

  const fetchAddons = async (panditId: number) => {
    try {
      setAddonsLoading(true);
      const res = await backendAxios.get(`/pandits/${panditId}/addons`);
      if (res.data.success && Array.isArray(res.data.data)) {
        const items: AddonItem[] = res.data.data
          .filter((a: any) => (a.status ?? '').toUpperCase() === 'ACTIVE')
          .map((a: any) => ({
            pandit_addon_id: a.pandit_addon_id ?? a.id,
            name: a.name ?? a.addon?.name ?? `Add-on #${a.addon_id ?? a.id}`,
            price: a.price,
            notes: a.notes ?? null,
            status: a.status,
            quantity: 0,
          }));
        setAddons(items);
      } else {
        setAddons([]);
      }
    } catch (err) {
      console.error('Error fetching addons for pandit', panditId, err);
      setAddons([]);
    } finally {
      setAddonsLoading(false);
    }
  };

  const increaseAddon = (id: number) =>
    setAddons(prev =>
      prev.map(a =>
        a.pandit_addon_id === id ? { ...a, quantity: a.quantity + 1 } : a,
      ),
    );

  const decreaseAddon = (id: number) =>
    setAddons(prev =>
      prev.map(a =>
        a.pandit_addon_id === id
          ? { ...a, quantity: Math.max(0, a.quantity - 1) }
          : a,
      ),
    );

  const getTotalPrice = () => {
    if (!selectedPandit) return 0;
    const base = parseFloat(selectedPandit.price || '0');
    const addonsTotal = addons.reduce(
      (sum, a) => sum + parseFloat(a.price) * a.quantity,
      0,
    );
    return base + addonsTotal;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#f97316" />
          <Text style={styles.loadingText}>Loading pooja details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!pooja) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingBox}>
          <Icon name="error-outline" size={48} color="#9ca3af" />
          <Text style={styles.loadingText}>Unable to load pooja details</Text>
        </View>
      </SafeAreaView>
    );
  }

  const desc = pooja.description || '';
  const shouldTruncate = desc.length > 160;
  const displayDesc =
    showFullDesc || !shouldTruncate ? desc : desc.slice(0, 160) + '....';

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
        <Text style={styles.headerTitle}>Pooja Details</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: pooja.image }} style={styles.heroImage} />
          <View style={styles.heroOverlay} />
          <Text style={styles.heroTitle}>{pooja.name}</Text>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconCircle}>
              <Icon name="schedule" size={20} color="#f97316" />
            </View>
            <View>
              <Text style={styles.infoLabel}>Duration</Text>
              <Text style={styles.infoValue}>{pooja.duration} hours</Text>
            </View>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <View style={styles.infoIconCircle}>
              <Icon name="inventory-2" size={20} color="#f97316" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Samagri Required</Text>
              <View style={styles.includedBadge}>
                <Icon name="check" size={13} color="#16a34a" />
                <Text style={styles.includedText}>Included</Text>
              </View>
            </View>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <View style={styles.infoIconCircle}>
              <Icon name="group" size={20} color="#f97316" />
            </View>
            <View>
              <Text style={styles.infoLabel}>Pandits Required</Text>
              <Text style={styles.infoValue}>1 Pandit</Text>
            </View>
          </View>
        </View>

        {/* Expert Pandits */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Expert Pandits</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllPandits')}>
              <Text style={styles.seeAll}>See All {'>'}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.panditsScroll}
          >
            {pandits.map(p => {
              const isSelected = selectedPandit?.pandit_id === p.pandit_id;
              const imageUri = p.image?.startsWith('/storage')
                ? `http://13.232.175.231${p.image}`
                : p.image;

              return (
                <View
                  key={p.pandit_pooja_id}
                  style={[
                    styles.panditCard,
                    isSelected && styles.panditCardSelected,
                  ]}
                >
                  {imageUri ? (
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.panditAvatar}
                    />
                  ) : (
                    <View style={styles.panditAvatarPlaceholder}>
                      <Text style={styles.panditInitials}>
                        {p.name
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </Text>
                    </View>
                  )}

                  <Text style={styles.panditName} numberOfLines={1}>
                    {p.name.length > 14 ? p.name.slice(0, 13) + '...' : p.name}
                  </Text>
                  <Text style={styles.panditExp}>
                    {p.profile?.experience_years ?? 0} years exp.
                  </Text>

                  <View style={styles.ratingRow}>
                    <Icon name="star" size={14} color="#f97316" />
                    <Text style={styles.ratingText}>
                      {p.profile?.rating ?? 0}
                    </Text>
                  </View>

                  <View style={styles.langsRow}>
                    {(p.profile?.languages ?? []).slice(0, 2).map((l, i) => (
                      <View key={i} style={styles.langChip}>
                        <Text style={styles.langChipText}>{l}</Text>
                      </View>
                    ))}
                  </View>

                  <Text style={styles.panditPrice}>
                    ₹{Number(p.price).toLocaleString()}
                  </Text>
                  <Text style={styles.panditPriceSub}>for this pooja</Text>

                  <TouchableOpacity
                    style={[
                      styles.viewProfileBtn,
                      isSelected && styles.selectedBtn,
                    ]}
                    onPress={() => setSelectedPandit(isSelected ? null : p)}
                  >
                    <Text
                      style={[
                        styles.viewProfileText,
                        isSelected && styles.selectedBtnText,
                      ]}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* Available Add-ons */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Available Add-ons</Text>

          {!selectedPandit && (
            <Text style={styles.emptyNote}>Select a pandit to see add-ons</Text>
          )}

          {selectedPandit && addonsLoading && (
            <View style={styles.addonsLoadingRow}>
              <ActivityIndicator size="small" color="#f97316" />
              <Text style={styles.addonsLoadingText}>Loading add-ons...</Text>
            </View>
          )}

          {selectedPandit && !addonsLoading && addons.length === 0 && (
            <Text style={styles.emptyNote}>No add-ons available</Text>
          )}

          {selectedPandit &&
            !addonsLoading &&
            addons.map(addon => (
              <View key={addon.pandit_addon_id} style={styles.addonCard}>
                <View style={styles.addonTopRow}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={styles.addonName}>{addon.name}</Text>
                    {addon.notes ? (
                      <Text style={styles.addonNotes}>{addon.notes}</Text>
                    ) : null}
                  </View>
                  <Text style={styles.addonPrice}>
                    ₹{Number(addon.price).toLocaleString()}
                  </Text>
                </View>

                {addon.quantity > 0 ? (
                  <View style={styles.qtyRow}>
                    <TouchableOpacity
                      onPress={() => decreaseAddon(addon.pandit_addon_id)}
                      style={styles.qtyBtn}
                    >
                      <Icon name="remove" size={18} color="#f97316" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{addon.quantity}</Text>
                    <TouchableOpacity
                      onPress={() => increaseAddon(addon.pandit_addon_id)}
                      style={styles.qtyBtn}
                    >
                      <Icon name="add" size={18} color="#f97316" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => increaseAddon(addon.pandit_addon_id)}
                    style={styles.addBtn}
                  >
                    <Icon name="add" size={16} color="#f97316" />
                    <Text style={styles.addBtnText}>Add</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
        </View>

        {/* About this Pooja */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About this Pooja</Text>
          <Text style={styles.aboutTitle}>{pooja.name}</Text>
          <Text style={styles.aboutDesc}>{displayDesc}</Text>
          {shouldTruncate && (
            <TouchableOpacity onPress={() => setShowFullDesc(!showFullDesc)}>
              <Text style={styles.readMore}>
                {showFullDesc ? 'Read less' : 'Read more'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Sticky Footer */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Total Price</Text>
          {selectedPandit ? (
            <Text style={styles.footerPrice}>
              ₹{getTotalPrice().toLocaleString()}
            </Text>
          ) : (
            <Text style={styles.footerSelectText}>
              Select Pandit to see price
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.bookBtn, !selectedPandit && styles.bookBtnDisabled]}
          disabled={!selectedPandit}
          onPress={() => {
            if (!selectedPandit || !pooja) return;

            // Collect selected addons with quantities > 0
            const selectedAddonPayload = addons
              .filter(a => a.quantity > 0)
              .map(a => ({
                pandit_addon_id: a.pandit_addon_id,
                quantity: a.quantity,
                price: parseFloat(a.price),
              }));

            // ✅ Navigate directly to BookPooja — NOT PanditDetail
            navigation.navigate('BookPooja', {
              panditId: selectedPandit.pandit_id,
              panditPoojaId: selectedPandit.pandit_pooja_id,
              poojaName: pooja.name,
              panditName: selectedPandit.name,
              duration: selectedPandit.duration,
              basePrice: parseFloat(selectedPandit.price),
              poojaImage: pooja.image,
              selectedAddons: selectedAddonPayload,
            });
          }}
        >
          <Text style={styles.bookBtnText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 15, color: '#6b7280' },

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

  heroContainer: { position: 'relative', height: 220 },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  heroTitle: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },

  infoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -24,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  infoIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff7ed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: { fontSize: 12, color: '#6b7280', marginBottom: 3 },
  infoValue: { fontSize: 15, fontWeight: '600', color: '#111827' },
  infoDivider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 14 },
  includedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginTop: 3,
  },
  includedText: { fontSize: 12, fontWeight: '600', color: '#16a34a' },

  section: { marginBottom: 16 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  seeAll: { fontSize: 14, color: '#f97316', fontWeight: '600' },
  panditsScroll: { paddingHorizontal: 16, gap: 12 },

  panditCard: {
    width: 148,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  panditCardSelected: { borderColor: '#f97316' },
  panditAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#fed7aa',
  },
  panditAvatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffedd5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#fed7aa',
  },
  panditInitials: { fontSize: 20, fontWeight: '700', color: '#f97316' },
  panditName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  panditExp: { fontSize: 11, color: '#6b7280', marginTop: 2, marginBottom: 6 },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 8,
  },
  ratingText: { fontSize: 13, fontWeight: '600', color: '#111827' },
  langsRow: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 8,
  },
  langChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#f3f4f6',
    borderRadius: 999,
  },
  langChipText: { fontSize: 10, color: '#374151', fontWeight: '500' },
  panditPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f97316',
    marginBottom: 1,
  },
  panditPriceSub: { fontSize: 10, color: '#6b7280', marginBottom: 10 },
  viewProfileBtn: {
    width: '100%',
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  selectedBtn: { backgroundColor: '#f97316' },
  viewProfileText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  selectedBtnText: { color: '#fff' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  emptyNote: { fontSize: 13, color: '#9ca3af' },

  addonsLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  addonsLoadingText: { fontSize: 13, color: '#6b7280' },

  addonCard: {
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  addonTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  addonName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  addonNotes: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  addonPrice: { fontSize: 15, fontWeight: '600', color: '#111827' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#f97316',
    borderRadius: 10,
  },
  addBtnText: { fontSize: 14, fontWeight: '600', color: '#f97316' },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff7ed',
    borderRadius: 10,
    paddingVertical: 4,
  },
  qtyBtn: { padding: 10 },
  qtyText: { fontSize: 16, fontWeight: '700', color: '#111827' },

  aboutTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  aboutDesc: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 22,
    marginBottom: 8,
  },
  readMore: { fontSize: 14, color: '#f97316', fontWeight: '600' },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    elevation: 8,
  },
  footerLabel: { fontSize: 12, color: '#6b7280', marginBottom: 2 },
  footerPrice: { fontSize: 20, fontWeight: '700', color: '#111827' },
  footerSelectText: { fontSize: 13, fontWeight: '600', color: '#f97316' },
  bookBtn: {
    backgroundColor: '#f97316',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 999,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    elevation: 4,
  },
  bookBtnDisabled: {
    backgroundColor: '#e5e7eb',
    shadowOpacity: 0,
    elevation: 0,
  },
  bookBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default PoojaDetailScreen;
