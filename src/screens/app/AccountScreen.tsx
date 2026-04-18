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
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/theme';
import { bookingApi, UserProfile } from '../../api/bookingApi';

const AccountScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const profile = await bookingApi.getUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
      Alert.alert('Error', 'Unable to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing feature coming soon!');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Logout',
          style: 'destructive',
          onPress: confirmLogout,
        },
      ]
    );
  };

  const confirmLogout = async () => {
    try {
      setLoggingOut(true);
      // Simulate logout API call
      await new Promise<void>(resolve => setTimeout(resolve, 1000));
      
      // Reset navigation to login screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'Unable to logout');
    } finally {
      setLoggingOut(false);
    }
  };

  const handleMenuItem = (item: string) => {
    switch (item) {
      case 'My Bookings':
        navigation.navigate('MyBookings');
        break;
      case 'My Reviews':
        navigation.navigate('MyReviews');
        break;
      case 'Notifications':
        navigation.navigate('Notifications');
        break;
      case 'Referral & Rewards':
        navigation.navigate('ReferralScreen');
        break;
      case 'My Points':
        navigation.navigate('MyPoints');
        break;
      case 'Saved Addresses':
        Alert.alert('Saved Addresses', 'Address management coming soon!');
        break;
      case 'Change Location':
        Alert.alert('Change Location', 'Location change feature coming soon!');
        break;
      case 'Help & Support':
        navigation.navigate('FAQ');
        break;
      case 'FAQs':
        navigation.navigate('FAQ');
        break;
      case 'Terms & Conditions':
        navigation.navigate('TermsConditions');
        break;
      case 'Privacy Policy':
        navigation.navigate('PrivacyPolicy');
        break;
      case 'Refund Policy':
        navigation.navigate('RefundPolicy');
        break;
      case 'About Us':
        navigation.navigate('AboutUs');
        break;
      default:
        break;
    }
  };

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.profileCard}>
        <Image
          source={{ uri: userProfile?.avatar || 'https://picsum.photos/seed/user/150/150' }}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>{userProfile?.name || 'User Name'}</Text>
        <Text style={styles.profilePhone}>{userProfile?.phone || '+91 98765 43210'}</Text>
        <TouchableOpacity
          style={styles.editProfileButton}
          onPress={handleEditProfile}
          activeOpacity={0.8}
        >
          <Text style={styles.editProfileButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSection = (title: string, items: any[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => handleMenuItem(item.label)}
            activeOpacity={0.7}
          >
            <View style={styles.menuIcon}>
              <Icon name={item.icon} size={20} color={colors.primary} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            {item.badge && (
              <View style={styles.menuBadge}>
                <Text style={styles.menuBadgeText}>{item.badge}</Text>
              </View>
            )}
            <Icon name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        {renderProfileHeader()}

        {/* MY ACTIVITY Section */}
        {renderSection('MY ACTIVITY', [
          { icon: 'description', label: 'My Bookings' },
          { icon: 'star', label: 'My Reviews' },
          { icon: 'notifications', label: 'Notifications' },
        ])}

        {/* REWARDS Section */}
        {renderSection('REWARDS', [
          { icon: 'card-giftcard', label: 'Referral & Rewards' },
          { icon: 'military-tech', label: 'My Points', badge: userProfile?.points.toString() },
        ])}

        {/* PREFERENCES Section */}
        {renderSection('PREFERENCES', [
          { icon: 'location-on', label: 'Saved Addresses' },
          { icon: 'arrow-forward', label: 'Change Location' },
        ])}

        {/* SUPPORT Section */}
        {renderSection('SUPPORT', [
          { icon: 'help', label: 'Help & Support' },
          { icon: 'question-answer', label: 'FAQs' },
        ])}

        {/* LEGAL Section */}
        {renderSection('LEGAL', [
          { icon: 'description', label: 'Terms & Conditions' },
          { icon: 'security', label: 'Privacy Policy' },
          { icon: 'assignment-return', label: 'Refund Policy' },
          { icon: 'info', label: 'About Us' },
        ])}

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={[styles.logoutButton, loggingOut && styles.logoutButtonDisabled]}
            onPress={handleLogout}
            disabled={loggingOut}
            activeOpacity={0.8}
          >
            {loggingOut ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={styles.logoutButtonText}>Logout</Text>
            )}
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
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    padding: 16,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  editProfileButton: {
    borderWidth: 1,
    borderColor: '#FF6B35',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  editProfileButtonText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF6B3515',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  menuBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  menuBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  logoutSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FF6B35',
    borderRadius: 8,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
  },
  bottomPadding: {
    height: 20,
  },
});

export default AccountScreen;
