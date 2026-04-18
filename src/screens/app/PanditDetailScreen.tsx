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
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/theme';
import { homeApi } from '../../api/homeApi';

interface PanditProfile {
  id: number;
  user_id: number;
  experience_years: number;
  rating: number;
  languages: string[];
  expertise: string[];
  operating_city: string;
  bio: string;
  poojas: PoojaService[];
  approval_status: string;
}

interface PoojaService {
  id: number;
  pandit_id: number;
  pooja_type_id: number;
  price: string;
  duration: string;
  status: string;
  pooja_type: {
    id: number;
    name: string;
    image: string;
    default_price: string;
    description: string;
  };
}

interface PanditAddon {
  pandit_addon_id: number;
  name: string;
  price: string;
  notes: string | null;
  status: string;
  quantity?: number;
}

interface PanditDetailData {
  id: number;
  full_name: string;
  mobile_number: string;
  email: string;
  profile_picture: string;
  pandit_profile: PanditProfile;
}

const MOCK_REVIEWS = [
  {
    id: 1,
    reviewerName: 'Priya Deshmukh',
    rating: 5,
    comment:
      'Pandit ji performed the Griha Pravesh ceremony beautifully. Very knowledgeable and punctual. Highly recommend!',
    timeAgo: '2 weeks ago',
  },
  {
    id: 2,
    reviewerName: 'Rajesh Kumar',
    rating: 4.5,
    comment:
      'Great experience. The pandit was very professional and explained every ritual clearly.',
    timeAgo: '1 month ago',
  },
];

const maskMobile = (mobile?: string) => {
  if (!mobile || mobile.length < 6) return mobile || '';
  return `${mobile.slice(0, 2)}${'*'.repeat(mobile.length - 4)}${mobile.slice(
    -2,
  )}`;
};

const maskEmail = (email?: string) => {
  if (!email) return '';
  const [name, domain] = email.split('@');
  if (!name || !domain) return email;
  return `${name.slice(0, 2)}${'*'.repeat(
    Math.max(0, name.length - 2),
  )}@${domain}`;
};

const PanditDetailScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute<any>();
  const { panditId } = route.params;

  const [pandit, setPandit] = useState<PanditDetailData | null>(null);
  const [addons, setAddons] = useState<PanditAddon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoojaId, setSelectedPoojaId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFullBio, setShowFullBio] = useState(false);

  useEffect(() => {
    loadPanditData();
  }, [panditId]);

  const loadPanditData = async () => {
    try {
      setLoading(true);
      const panditData = await homeApi.getPanditDetail(panditId);
      if (panditData) {
        setPandit(panditData);
        // Auto-select first pooja
        if (panditData.pandit_profile?.poojas?.length > 0) {
          setSelectedPoojaId(panditData.pandit_profile.poojas[0].id);
        }
      }
      const addonsData = await homeApi.getPanditAddons(panditId);
      setAddons(addonsData.map((a: PanditAddon) => ({ ...a, quantity: 0 })));
    } catch (error) {
      console.error('Error loading pandit data:', error);
      Alert.alert('Error', 'Unable to load pandit details');
    } finally {
      setLoading(false);
    }
  };

  const increaseAddon = (id: number) => {
    setAddons(prev =>
      prev.map(a =>
        a.pandit_addon_id === id
          ? { ...a, quantity: (a.quantity || 0) + 1 }
          : a,
      ),
    );
  };

  const decreaseAddon = (id: number) => {
    setAddons(prev =>
      prev.map(a =>
        a.pandit_addon_id === id
          ? { ...a, quantity: Math.max(0, (a.quantity || 0) - 1) }
          : a,
      ),
    );
  };

  const getTotalPrice = () => {
    if (!pandit) return 0;
    const selectedPooja = pandit.pandit_profile.poojas.find(
      p => p.id === selectedPoojaId,
    );
    const basePrice = parseFloat(selectedPooja?.price || '0');
    const addonsTotal = addons.reduce(
      (sum, a) => sum + parseFloat(a.price) * (a.quantity || 0),
      0,
    );
    return basePrice + addonsTotal;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f97316" />
          <Text style={styles.loadingText}>Loading pandit details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!pandit) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Icon name="error-outline" size={48} color="#9ca3af" />
          <Text style={styles.loadingText}>Unable to load pandit details</Text>
        </View>
      </SafeAreaView>
    );
  }

  const bio = pandit.pandit_profile?.bio || '';
  const shouldTruncate = bio.length > 150;
  const displayBio =
    showFullBio || !shouldTruncate ? bio : bio.slice(0, 150) + '...';

  const filteredPoojas = (pandit.pandit_profile?.poojas || []).filter(p =>
    p.pooja_type?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
        <Text style={styles.headerTitle}>Pandit Profile</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Profile Card ── */}
        <View style={styles.card}>
          <View style={styles.profileRow}>
            {/* Avatar + Rating */}
            <View style={styles.avatarCol}>
              {pandit.profile_picture ? (
                <Image
                  source={{
                    uri: `http://13.232.175.231/storage/${pandit.profile_picture}`,
                  }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitials}>
                    {pandit.full_name
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </Text>
                </View>
              )}
              <View style={styles.ratingRow}>
                <Icon name="star" size={18} color="#f97316" />
                <Text style={styles.ratingText}>
                  {pandit.pandit_profile?.rating ?? 0}
                </Text>
              </View>
            </View>

            {/* Info */}
            <View style={styles.profileInfo}>
              <Text style={styles.panditName}>{pandit.full_name}</Text>
              <Text style={styles.panditId}>ID: PND-{pandit.id}</Text>
              <Text style={styles.infoLine}>
                {pandit.pandit_profile?.experience_years ?? 0} years experience
              </Text>
              <View style={styles.locationRow}>
                <Icon name="location-on" size={14} color="#6b7280" />
                <Text style={styles.infoLine}>
                  {pandit.pandit_profile?.operating_city ?? 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          {/* Divider + Languages */}
          <View style={styles.divider} />
          <Text style={styles.langLabel}>Languages</Text>
          <View style={styles.tagsRow}>
            {(pandit.pandit_profile?.languages ?? []).map((lang, i) => (
              <View key={i} style={styles.langTag}>
                <Text style={styles.langTagText}>{lang}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── About Card ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About</Text>
          <Text style={styles.bioText}>{displayBio}</Text>
          {shouldTruncate && (
            <TouchableOpacity onPress={() => setShowFullBio(!showFullBio)}>
              <Text style={styles.readMore}>
                {showFullBio ? 'Read less' : 'Read more'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Expertise Card ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Expertise</Text>
          <View style={styles.tagsRow}>
            {(pandit.pandit_profile?.expertise ?? []).length > 0 ? (
              pandit.pandit_profile.expertise.map((item, i) => (
                <View key={i} style={styles.expertiseTag}>
                  <Text style={styles.expertiseTagText}>{item}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyNote}>No expertise available</Text>
            )}
          </View>
        </View>

        {/* ── Select Pooja Card ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Select Pooja Type to Book</Text>
          <Text style={styles.cardSubtitle}>
            Choose the pooja you want to book with this pandit
          </Text>

          {/* Search */}
          <View style={styles.searchRow}>
            <Icon
              name="search"
              size={16}
              color="#9ca3af"
              style={{ marginRight: 8 }}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search pooja type"
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* All poojas — NO scroll, all visible */}
          <ScrollView
            style={styles.poojaList}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
          >
            {filteredPoojas.length > 0 ? (
              filteredPoojas.map(pooja => {
                const isSelected = selectedPoojaId === pooja.id;
                return (
                  <TouchableOpacity
                    key={pooja.id}
                    onPress={() => setSelectedPoojaId(pooja.id)}
                    style={[
                      styles.poojaCard,
                      isSelected && styles.poojaCardSelected,
                    ]}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: pooja.pooja_type?.image }}
                      style={styles.poojaImage}
                    />
                    <View style={styles.poojaInfo}>
                      <View style={styles.poojaTopRow}>
                        <Text style={styles.poojaName} numberOfLines={1}>
                          {pooja.pooja_type?.name}
                        </Text>
                        <View
                          style={[
                            styles.radio,
                            isSelected && styles.radioSelected,
                          ]}
                        >
                          {isSelected && <View style={styles.radioInner} />}
                        </View>
                      </View>
                      <Text style={styles.poojaDesc} numberOfLines={1}>
                        {pooja.pooja_type?.description ??
                          'No description available'}
                      </Text>
                      <View style={styles.poojaMeta}>
                        <View style={styles.dot} />
                        <Text style={styles.poojaDuration}>
                          {pooja.duration} hours
                        </Text>
                        <Text style={styles.poojaPrice}>
                          ₹{Number(pooja.price).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyNote}>No pooja types found</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* ── Available Add-ons Card ── */}
        {addons.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Available Add-ons</Text>
            <View style={styles.addonList}>
              {addons.map(addon => (
                <View key={addon.pandit_addon_id} style={styles.addonCard}>
                  <View style={styles.addonTopRow}>
                    <Text style={styles.addonName}>{addon.name}</Text>
                    <Text style={styles.addonPrice}>
                      ₹
                      {(
                        Number(addon.price) * Math.max(1, addon.quantity || 0)
                      ).toLocaleString()}
                    </Text>
                  </View>
                  {(addon.quantity || 0) > 0 ? (
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
          </View>
        )}

        {/* ── Contact Card ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contact</Text>

          <View style={styles.contactRow}>
            <View style={styles.contactIcon}>
              <Icon name="phone" size={18} color="#f97316" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Mobile</Text>
              <Text style={styles.contactValue}>
                {maskMobile(pandit.mobile_number)}
              </Text>
            </View>
            <Icon name="lock-outline" size={18} color="#9ca3af" />
          </View>

          <View style={[styles.contactRow, { marginTop: 12 }]}>
            <View style={styles.contactIcon}>
              <Icon name="mail-outline" size={18} color="#f97316" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>{maskEmail(pandit.email)}</Text>
            </View>
            <Icon name="lock-outline" size={18} color="#9ca3af" />
          </View>

          <View style={styles.contactNote}>
            <Icon name="lock-outline" size={14} color="#ea580c" />
            <Text style={styles.contactNoteText}>
              Contact details will be visible after booking confirmation
            </Text>
          </View>
        </View>

        {/* ── Ratings & Reviews Card ── */}
        <View style={styles.card}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.cardTitle}>Ratings & Reviews</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {/* Rating summary */}
          <View style={styles.ratingSummary}>
            <View style={styles.ratingBig}>
              <Text style={styles.ratingBigNum}>
                {pandit.pandit_profile?.rating ?? 0}
              </Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map(s => (
                  <Icon
                    key={s}
                    name="star"
                    size={14}
                    color={
                      s <= Math.floor(pandit.pandit_profile?.rating ?? 0)
                        ? '#f97316'
                        : '#e5e7eb'
                    }
                  />
                ))}
              </View>
              <Text style={styles.reviewCount}>0 reviews</Text>
            </View>

            <View style={styles.ratingBars}>
              {[5, 4, 3, 2, 1].map(r => (
                <View key={r} style={styles.barRow}>
                  <Text style={styles.barLabel}>{r}</Text>
                  <Icon name="star" size={12} color="#f97316" />
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${r === 5 ? 75 : r === 4 ? 20 : 5}%` },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Individual reviews */}
          <View style={styles.reviewsList}>
            {MOCK_REVIEWS.map((review, i) => (
              <View
                key={review.id}
                style={[
                  styles.reviewItem,
                  i < MOCK_REVIEWS.length - 1 && styles.reviewBorder,
                ]}
              >
                <View style={styles.reviewTopRow}>
                  <View>
                    <Text style={styles.reviewerName}>
                      {review.reviewerName}
                    </Text>
                    <Text style={styles.reviewTime}>{review.timeAgo}</Text>
                  </View>
                  <View style={styles.reviewRatingBadge}>
                    <Icon name="star" size={12} color="#f97316" />
                    <Text style={styles.reviewRatingText}>{review.rating}</Text>
                  </View>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.viewAllReviewsBtn}>
            <Text style={styles.viewAllReviewsText}>View All Reviews</Text>
            <Icon name="chevron-right" size={18} color="#ea580c" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ── Sticky Footer ── */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Total Price</Text>
          <Text style={styles.footerPrice}>
            ₹{getTotalPrice().toLocaleString()}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.bookBtn, !selectedPoojaId && styles.bookBtnDisabled]}
          onPress={() => {
            if (!selectedPoojaId) return;
            Alert.alert(
              'Booking',
              `Proceeding to book with Pandit ${pandit.full_name}`,
            );
          }}
          disabled={!selectedPoojaId}
        >
          <Text style={styles.bookBtnText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF9' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 15, color: '#6b7280' },

  // Header
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

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12 },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    height: 'auto',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    padding: 20,
    marginBottom: 12,
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
    marginBottom: 4,
  },
  cardSubtitle: { fontSize: 12, color: '#6b7280', marginBottom: 14 },

  // Profile
  profileRow: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  avatarCol: { alignItems: 'center' },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fed7aa',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffedd5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fed7aa',
  },
  avatarInitials: { fontSize: 24, fontWeight: '700', color: '#f97316' },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  ratingText: { fontSize: 16, fontWeight: '600', color: '#111827' },
  profileInfo: { flex: 1, justifyContent: 'center' },
  panditName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  panditId: { fontSize: 12, color: '#6b7280', marginBottom: 6 },
  infoLine: { fontSize: 14, color: '#374151', marginBottom: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 16 },
  langLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 10,
  },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  langTag: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#fff7ed',
    borderRadius: 999,
  },
  langTagText: { fontSize: 13, color: '#ea580c', fontWeight: '500' },

  // Bio
  bioText: { fontSize: 14, color: '#4b5563', lineHeight: 22, marginBottom: 8 },
  readMore: { fontSize: 14, color: '#f97316', fontWeight: '600' },

  // Expertise
  expertiseTag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
    borderRadius: 999,
  },
  expertiseTagText: { fontSize: 12, color: '#ea580c', fontWeight: '500' },
  emptyNote: { fontSize: 13, color: '#9ca3af' },
  emptyBox: { paddingVertical: 20, alignItems: 'center' },

  // Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#fff7ed20',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 999,
    marginBottom: 14,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#111827', paddingVertical: 0 },

  // Pooja list — fixed height with scroll
  poojaList: {
    height: 450,
  },
  poojaCard: {
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  poojaCardSelected: { borderColor: '#f97316', backgroundColor: '#fff7ed20' },
  poojaImage: { width: 80, height: 80 },
  poojaInfo: { flex: 1, padding: 10 },
  poojaTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  poojaName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  radioSelected: { borderColor: '#f97316' },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#f97316',
  },
  poojaDesc: { fontSize: 12, color: '#6b7280', marginBottom: 6 },
  poojaMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#9ca3af' },
  poojaDuration: { fontSize: 12, color: '#6b7280' },
  poojaPrice: { fontSize: 14, fontWeight: '700', color: '#f97316' },

  // Add-ons
  addonList: { gap: 10 },
  addonCard: {
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#fff',
  },
  addonTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  addonName: { fontSize: 15, fontWeight: '600', color: '#111827' },
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

  // Contact
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff7ed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: { flex: 1 },
  contactLabel: { fontSize: 12, color: '#6b7280', marginBottom: 2 },
  contactValue: { fontSize: 14, fontWeight: '500', color: '#374151' },
  contactNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff7ed',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },
  contactNoteText: { flex: 1, fontSize: 12, color: '#ea580c', lineHeight: 18 },

  // Reviews
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: { fontSize: 14, color: '#f97316', fontWeight: '600' },
  ratingSummary: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  ratingBig: { alignItems: 'center', minWidth: 70 },
  ratingBigNum: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  starsRow: { flexDirection: 'row', gap: 2, marginBottom: 4 },
  reviewCount: { fontSize: 12, color: '#6b7280' },
  ratingBars: { flex: 1, gap: 6, justifyContent: 'center' },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  barLabel: { fontSize: 12, color: '#6b7280', width: 10 },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: '#f97316', borderRadius: 3 },
  reviewsList: { gap: 12 },
  reviewItem: { paddingBottom: 12 },
  reviewBorder: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  reviewTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewerName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  reviewTime: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  reviewRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#fff7ed',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  reviewRatingText: { fontSize: 12, fontWeight: '600', color: '#ea580c' },
  reviewComment: { fontSize: 14, color: '#374151', lineHeight: 20 },
  viewAllReviewsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#ea580c',
    borderRadius: 999,
  },
  viewAllReviewsText: { fontSize: 14, fontWeight: '600', color: '#ea580c' },

  // Footer
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
  bookBtnDisabled: { backgroundColor: '#e5e7eb' },
  bookBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default PanditDetailScreen;
