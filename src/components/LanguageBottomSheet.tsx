import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/theme';

const { height } = Dimensions.get('window');

type Language = 'en' | 'hi';

interface LanguageBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onLanguageSelected?: (language: Language) => void;
}

const LanguageBottomSheet: React.FC<LanguageBottomSheetProps> = ({
  visible,
  onClose,
  onLanguageSelected,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const slideAnim = useRef(new Animated.Value(height)).current;

  const languages = [
    { code: 'en' as Language, name: 'English', flag: '🇬🇧' },
    { code: 'hi' as Language, name: 'हिंदी', flag: '🇮🇳' },
  ];

  useEffect(() => {
    // Load saved language preference
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('selected_language');
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'hi')) {
          setSelectedLanguage(savedLanguage);
        }
      } catch (error) {
        console.error('Error loading language:', error);
      }
    };
    loadLanguage();
  }, []);

  useEffect(() => {
    // Animate modal in/out
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleLanguageSelect = async (language: Language) => {
    try {
      setSelectedLanguage(language);
      await AsyncStorage.setItem('selected_language', language);
      onLanguageSelected?.(language);
      onClose();
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const renderLanguageOption = (language: {
    code: Language;
    name: string;
    flag: string;
  }) => {
    const isSelected = selectedLanguage === language.code;
    return (
      <TouchableOpacity
        key={language.code}
        style={[styles.languageOption, isSelected && styles.selectedOption]}
        onPress={() => handleLanguageSelect(language.code)}
      >
        <View style={styles.languageInfo}>
          <Text style={styles.flag}>{language.flag}</Text>
          <Text style={[styles.languageName, isSelected && styles.selectedText]}>
            {language.name}
          </Text>
        </View>
        {isSelected && (
          <View style={styles.checkmarkContainer}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <Animated.View
          style={[styles.bottomSheet, { transform: [{ translateY: slideAnim }] }]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.handle} />
            <Text style={styles.title}>Select Language</Text>
          </View>

          {/* Language Options */}
          <View style={styles.languageList}>
            {languages.map(renderLanguageOption)}
          </View>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: height * 0.4,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  languageList: {
    padding: 20,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedOption: {
    backgroundColor: colors.primary + '10',
    borderColor: colors.primary,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 24,
    marginRight: 16,
  },
  languageName: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  selectedText: {
    color: colors.primary,
    fontWeight: '600',
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});

export default LanguageBottomSheet;
