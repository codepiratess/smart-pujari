import React from 'react';
import { View, StyleSheet } from 'react-native';
import AccountScreenDetailed from './app/AccountScreen';

const AccountScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <AccountScreenDetailed />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
});

export default AccountScreen;
