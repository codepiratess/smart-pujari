import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/theme';

const { width } = Dimensions.get('window');

interface OnlinePoojaBannerProps {
  onPress?: () => void;
}

const OnlinePoojaBanner: React.FC<OnlinePoojaBannerProps> = ({
  onPress,
}) => {
  const navigation = useNavigation<StackNavigationProp<any>>();

  const handlePress = () => {
    // Navigate to OnlinePoojaScreen
    navigation.navigate('OnlinePooja');
    onPress?.();
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.leftContent}>
        <View style={styles.iconContainer}>
          <Icon name="videocam" size={20} color="#FFFFFF" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Book Online Pooja</Text>
          <Text style={styles.subtitle}>Pooja without selecting a pandit</Text>
          <Text style={styles.subtext}>Pandit will be assigned by admin</Text>
        </View>
      </View>
      <View style={styles.rightContent}>
        <Icon name="arrow-forward" size={24} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
  },
  subtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  rightContent: {
    paddingLeft: 16,
  },
});

export default OnlinePoojaBanner;
