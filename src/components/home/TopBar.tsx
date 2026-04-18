import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/theme';

interface TopBarProps {
  location?: string;
  unreadCount?: number;
}

const TopBar: React.FC<TopBarProps> = ({
  location = 'Mumbai, Andheri',
  unreadCount = 3,
}) => {
  const navigation = useNavigation<StackNavigationProp<any>>();

  const handleLocationPress = () => {
    // TODO: Navigate to LocationPickerScreen
    console.log('Location picker pressed');
  };

  const handleLanguagePress = () => {
    // TODO: Navigate to LanguageScreen
    console.log('Language pressed');
  };

  const handleNotificationPress = () => {
    // TODO: Navigate to NotificationsScreen
    console.log('Notifications pressed');
  };

  return (
    <View style={styles.container}>
      {/* Left side - Location */}
      <TouchableOpacity
        style={styles.locationContainer}
        onPress={handleLocationPress}
        activeOpacity={0.7}
      >
        <View style={styles.locationIcon}>
          <Icon name="location-on" size={16} color={colors.primary} />
        </View>
        <Text style={styles.locationText}>{location}</Text>
      </TouchableOpacity>

      {/* Right side - Icons */}
      <View style={styles.rightContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleLanguagePress}
          activeOpacity={0.7}
        >
          <Icon name="language" size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleNotificationPress}
          activeOpacity={0.7}
        >
          <Icon name="notifications" size={18} color={colors.textSecondary} />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 8, // Add padding for status bar
    backgroundColor: '#FFFFFF',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationIcon: {
    marginRight: 6,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginRight: 4,
  },
    rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default TopBar;
