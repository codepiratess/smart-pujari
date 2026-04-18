import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HomeScreen from '../screens/HomeScreen';
import BookingsScreen from '../screens/BookingsScreen';
import AccountScreen from '../screens/AccountScreen';
import FAQScreen from '../screens/app/FAQScreen';
import AboutUsScreen from '../screens/app/AboutUsScreen';
import RefundPolicyScreen from '../screens/app/RefundPolicyScreen';
import PrivacyPolicyScreen from '../screens/app/PrivacyPolicyScreen';
import { colors } from '../theme/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{
          tabBarLabel: 'Bookings',
          tabBarIcon: ({ color, size }) => (
            <Icon name="calendar-today" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={AccountScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Icon name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const AppStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen 
        name="FAQ" 
        component={FAQScreen}
        options={{ title: 'FAQs' }}
      />
      <Stack.Screen 
        name="AboutUs" 
        component={AboutUsScreen}
        options={{ title: 'About Us' }}
      />
      <Stack.Screen 
        name="RefundPolicy" 
        component={RefundPolicyScreen}
        options={{ title: 'Refund Policy' }}
      />
      <Stack.Screen 
        name="PrivacyPolicy" 
        component={PrivacyPolicyScreen}
        options={{ title: 'Privacy Policy' }}
      />
    </Stack.Navigator>
  );
};