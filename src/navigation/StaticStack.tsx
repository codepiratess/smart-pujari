import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FAQScreen from '../screens/app/FAQScreen';
import AboutUsScreen from '../screens/app/AboutUsScreen';
import RefundPolicyScreen from '../screens/app/RefundPolicyScreen';
import PrivacyPolicyScreen from '../screens/app/PrivacyPolicyScreen';
import WebViewScreen from '../screens/app/WebViewScreen';

const Stack = createNativeStackNavigator();

export const StaticStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
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
      <Stack.Screen 
        name="WebView" 
        component={WebViewScreen}
        options={{ title: 'WebView' }}
      />
    </Stack.Navigator>
  );
};
