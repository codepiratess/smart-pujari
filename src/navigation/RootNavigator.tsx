import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text, StyleSheet } from 'react-native';
import { getToken } from '../store/authStore';

// Import components with error handling
let AuthStack: React.FC | null = null;
let AppStack: React.FC | null = null;

try {
  const authStackModule = require('./AuthStack');
  AuthStack = authStackModule.AuthStack;
} catch (error) {
  console.error('Failed to load AuthStack:', error);
}

try {
  const appStackModule = require('./AppStack');
  AppStack = appStackModule.AppStack;
} catch (error) {
  console.error('Failed to load AppStack:', error);
}

// Fallback component when stacks are not available
const ErrorFallback: React.FC = () => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorTitle}>Loading Error</Text>
    <Text style={styles.errorMessage}>Failed to load navigation components. Please restart the app.</Text>
  </View>
);

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});

export const RootNavigator: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await getToken();
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    // You could return a loading screen here
    return null;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        AppStack ? <AppStack /> : <ErrorFallback />
      ) : (
        AuthStack ? <AuthStack /> : <ErrorFallback />
      )}
    </NavigationContainer>
  );
};
