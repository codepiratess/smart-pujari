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
import TermsConditionsScreen from '../screens/app/TermsConditionsScreen';
import AllPoojaTypesScreen from '../screens/app/AllPoojaTypesScreen';
import OnlinePoojaScreen from '../screens/app/OnlinePoojaScreen';
import AllPanditsScreen from '../screens/app/AllPanditsScreen';
import PanditDetailScreen from '../screens/app/PanditDetailScreen';
import ProfileSetupScreen from '../screens/auth/ProfileSetupScreen';
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
      {/* Main tabs */}
      <Stack.Screen name="Main" component={TabNavigator} />

      {/* Profile setup — accessible from OTP flow and Account edit */}
      <Stack.Screen
        name="ProfileSetup"
        component={ProfileSetupScreen}
        options={{ gestureEnabled: false }} // prevent swipe-back after OTP
      />

      {/* Account screens */}
      <Stack.Screen name="FAQ" component={FAQScreen} />
      <Stack.Screen name="AboutUs" component={AboutUsScreen} />
      <Stack.Screen name="RefundPolicy" component={RefundPolicyScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="TermsConditions" component={TermsConditionsScreen} />

      {/* Pooja & Pandit screens */}
      <Stack.Screen name="AllPoojaTypes" component={AllPoojaTypesScreen} />
      <Stack.Screen name="OnlinePooja" component={OnlinePoojaScreen} />
      <Stack.Screen name="AllPandits" component={AllPanditsScreen} />
      <Stack.Screen name="PanditDetail" component={PanditDetailScreen} />
    </Stack.Navigator>
  );
};