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
import PoojaDetailScreen from '../screens/app/PoojaDetailScreen';
import BookPoojaScreen from '../screens/app/BookPoojaScreen';
import CartScreen from '../screens/app/CartScreen';
import ProfileSetupScreen from '../screens/auth/ProfileSetupScreen';
import SavedAddressesScreen from '../screens/app/SavedAddressesScreen';
import AddressFormScreen    from '../screens/app/AddressFormScreen';
import SelectLocationScreen from '../screens/app/SelectLocationScreen';
import { colors } from '../theme/theme';
import NotificationsScreen from '../screens/app/NotificationsScreen';
import MyBookingsScreen from '../screens/app/MyBookingsScreen';

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

      {/* Auth */}
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} options={{ gestureEnabled: false }} />

      {/* Pooja flow */}
      <Stack.Screen name="AllPoojaTypes" component={AllPoojaTypesScreen} />
      <Stack.Screen name="PoojaDetail" component={PoojaDetailScreen} />
      <Stack.Screen name="BookPooja" component={BookPoojaScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />

      {/* Pandit flow */}
      <Stack.Screen name="AllPandits" component={AllPanditsScreen} />
      <Stack.Screen name="PanditDetail" component={PanditDetailScreen} />

      {/* Online Pooja */}
      <Stack.Screen name="OnlinePooja" component={OnlinePoojaScreen} />

      {/* Address */}
      <Stack.Screen name="SavedAddresses" component={SavedAddressesScreen} />
      <Stack.Screen name="AddressForm" component={AddressFormScreen} />
      <Stack.Screen name="SelectLocation" component={SelectLocationScreen} />

      {/* Account pages */}
      <Stack.Screen name="FAQ" component={FAQScreen} />
      <Stack.Screen name="AboutUs" component={AboutUsScreen} />
      <Stack.Screen name="RefundPolicy" component={RefundPolicyScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="TermsConditions" component={TermsConditionsScreen} />

      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
    </Stack.Navigator>
  );
};