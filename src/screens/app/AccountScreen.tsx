import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../../api/authApi';
import { colors } from '../../theme/theme';

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserData {
  id: number;
  full_name: string;
  email: string;
  mobile_number: string;
  profile_picture: string | null;
  aadhaar_pan_path: string | null;
  is_profile_completed: boolean;
  role: string;
  status: string;
  points?: number;
}

// ─── MenuItem ─────────────────────────────────────────────────────────────────
interface MenuItemProps {
  icon: string;
  label: string;
  onPress: () => void;
  badge?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, onPress, badge }) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.menuIconBox}>
      <Icon name={icon} size={18} color="#ea580c" />
    </View>
    <Text style={styles.menuLabel}>{label}</Text>
    <View style={styles.menuRight}>
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      <Icon name="chevron-right" size={18} color="#9ca3af" />
    </View>
  </TouchableOpacity>
);

// ─── MenuSection ──────────────────────────────────────────────────────────────
interface MenuSectionProps {
  title: string;
  children: React.ReactNode;
}

const MenuSection: React.FC<MenuSectionProps> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionCard}>{children}</View>
  </View>
);

// ─── AccountScreen ────────────────────────────────────────────────────────────
const AccountScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Reload profile every time screen comes into focus (so edits reflect immediately)
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, []),
  );

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await authApi.getProfile();
      if (res?.user) setUserData(res.user);
    } catch (err) {
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

const handleLogoutConfirm = async () => {
  setLoggingOut(true);
  try {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userId');
    await AsyncStorage.removeItem('user');
    setShowLogoutModal(false);

    // ✅ Correct — climbs TWO levels: TabNavigator → AppStack → RootNavigator
    navigation.getParent()?.getParent()?.reset({
      index: 0,
      routes: [{ name: 'Auth' }],
    });
  } catch (err) {
    console.error('Logout error:', err);
    Alert.alert('Error', 'Unable to logout. Please try again.');
  } finally {
    setLoggingOut(false);
  }
};

  const navigate = (screen: string, params?: any) => {
    navigation.navigate(screen, params);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBtn}
        >
          <Icon name="arrow-back" size={20} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account</Text>
        <TouchableOpacity
          onPress={() => navigate('Notifications')}
          style={styles.headerBtn}
        >
          <Icon name="notifications" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

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
          {/* ── Profile Card ── */}
          <View style={styles.profileCard}>
            <View style={styles.profileRow}>
              {/* Avatar */}
              <View style={styles.avatarWrapper}>
                {userData?.profile_picture ? (
                  <Image
                    source={{ uri: userData.profile_picture }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Icon name="person" size={32} color="#fed7aa" />
                  </View>
                )}
              </View>

              {/* Info */}
              <View style={styles.profileInfo}>
                <Text style={styles.profileName} numberOfLines={1}>
                  {userData?.full_name || 'User'}
                </Text>
                <Text style={styles.profilePhone}>
                  {userData?.mobile_number || ''}
                </Text>
              </View>
            </View>

            {/* Edit Profile Button */}
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigate('ProfileSetup', { editMode: true })}
              activeOpacity={0.8}
            >
              <Icon name="edit" size={16} color="#ea580c" />
              <Text style={styles.editBtnText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* ── MY ACTIVITY ── */}
          <MenuSection title="MY ACTIVITY">
            <MenuItem
              icon="description"
              label="My Bookings"
              onPress={() => navigate('MyBookings')}
            />
            <MenuItem
              icon="star"
              label="My Reviews"
              onPress={() => navigate('MyReviews')}
            />
            <MenuItem
              icon="notifications"
              label="Notifications"
              onPress={() => navigate('Notifications')}
            />
          </MenuSection>

          {/* ── REWARDS ── */}
          <MenuSection title="REWARDS">
            <MenuItem
              icon="card-giftcard"
              label="Referral & Rewards"
              onPress={() => navigate('ReferralScreen')}
            />
            <MenuItem
              icon="military-tech"
              label={`My Points (${userData?.points ?? 0})`}
              onPress={() => navigate('MyPoints')}
            />
          </MenuSection>

          {/* ── PREFERENCES ── */}
          <MenuSection title="PREFERENCES">
            <MenuItem
              icon="location-on"
              label="Saved Addresses"
              onPress={() =>
                Alert.alert(
                  'Saved Addresses',
                  'Address management coming soon!',
                )
              }
            />
            <MenuItem
              icon="near-me"
              label="Change Location"
              onPress={() =>
                Alert.alert('Change Location', 'Location change coming soon!')
              }
            />
          </MenuSection>

          {/* ── SUPPORT ── */}
          <MenuSection title="SUPPORT">
            <MenuItem
              icon="help"
              label="Help & Support"
              onPress={() => navigate('FAQ')}
            />
            <MenuItem
              icon="question-answer"
              label="FAQs"
              onPress={() => navigate('FAQ')}
            />
          </MenuSection>

          {/* ── LEGAL ── */}
          <MenuSection title="LEGAL">
            <MenuItem
              icon="description"
              label="Terms & Conditions"
              onPress={() => navigate('TermsConditions')}
            />
            <MenuItem
              icon="security"
              label="Privacy Policy"
              onPress={() => navigate('PrivacyPolicy')}
            />
            <MenuItem
              icon="assignment-return"
              label="Refund Policy"
              onPress={() => navigate('RefundPolicy')}
            />
            <MenuItem
              icon="info"
              label="About Us"
              onPress={() => navigate('AboutUs')}
            />
          </MenuSection>

          {/* ── Logout ── */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => setShowLogoutModal(true)}
            activeOpacity={0.8}
          >
            <Icon name="logout" size={16} color="#dc2626" />
            <Text style={styles.logoutBtnText}>Logout</Text>
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>
      )}

      {/* ── Logout Modal ── */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Power icon */}
            <View style={styles.modalIconBox}>
              <Icon name="power-settings-new" size={32} color="#dc2626" />
            </View>

            <Text style={styles.modalTitle}>Logout</Text>
            <Text style={styles.modalSubtitle}>
              Are you sure you want to logout from your account?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowLogoutModal(false)}
                disabled={loggingOut}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalLogoutBtn, loggingOut && { opacity: 0.7 }]}
                onPress={handleLogoutConfirm}
                disabled={loggingOut}
              >
                {loggingOut ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalLogoutText}>Logout</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF9' },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },

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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerBtn: { padding: 8, borderRadius: 10 },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 0 },

  // Profile card
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  avatarWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#fed7aa',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatar: { width: 64, height: 64 },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    backgroundColor: '#ffedd5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: { flex: 1 },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  profilePhone: { fontSize: 13, color: '#6b7280' },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: '#fdba74',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ea580c',
  },

  // Sections
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },

  // Menu items
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff7ed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    backgroundColor: '#f97316',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },

  // Logout button
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
  },

  // Logout modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  modalIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  modalLogoutBtn: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#dc2626',
    borderRadius: 14,
    alignItems: 'center',
  },
  modalLogoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});

export default AccountScreen;
