import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/theme';

type TabType = 'home' | 'booking' | 'account';

interface BottomNavProps {
  activeTab: TabType;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab }) => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  
  const tabs = [
    {
      id: 'home' as TabType,
      iconName: 'home',
      label: 'Home',
      screenName: 'Home',
    },
    {
      id: 'booking' as TabType,
      iconName: 'calendar-today',
      label: 'Booking',
      screenName: 'Bookings',
    },
    {
      id: 'account' as TabType,
      iconName: 'person',
      label: 'Account',
      screenName: 'Profile',
    },
  ];

  const renderTab = (tab: typeof tabs[0]) => {
    const isActive = activeTab === tab.id;
    
    return (
      <TouchableOpacity
        key={tab.id}
        style={styles.tab}
        onPress={() => navigation.navigate(tab.screenName)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
          <Icon 
            name={tab.iconName} 
            size={20} 
            color={isActive ? colors.primary : colors.textSecondary} 
          />
        </View>
        {isActive && (
          <Text style={styles.label}>{tab.label}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {tabs.map(renderTab)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    // No border top shadow as specified
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 20,
  },
  activeIconContainer: {
    backgroundColor: colors.primary + '15', // Very light orange background
  },
  label: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
    marginTop: 2,
  },
});

export default BottomNav;
