import React from 'react';
import { View, StyleSheet } from 'react-native';
import MyBookingsScreen from './app/MyBookingsScreen';

const BookingsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <MyBookingsScreen />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
});

export default BookingsScreen;
