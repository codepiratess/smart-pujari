import React from 'react';
import {
  View,
  TextInput,
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

interface SearchBarProps {
  placeholder?: string;
  onFocus?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search pooja or pandit',
  onFocus,
}) => {
  const navigation = useNavigation<StackNavigationProp<any>>();

  const handlePress = () => {
    // Navigate to SearchScreen
    navigation.navigate('Search');
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.searchContainer}>
        <Icon name="search" size={16} color={colors.textSecondary} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          editable={false}
          pointerEvents="none"
          onFocus={onFocus}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
});

export default SearchBar;
