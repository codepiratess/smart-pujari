import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../theme/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

interface TopBarProps {
  unreadCount?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
];

// Static translations for the modal UI itself
const UI_STRINGS: Record<string, Record<string, string>> = {
  en: {
    selectLanguage: 'Select Language',
    cancel: 'Cancel',
    apply: 'Apply',
  },
  hi: {
    selectLanguage: 'भाषा चुनें',
    cancel: 'रद्द करें',
    apply: 'लागू करें',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

const TopBar: React.FC<TopBarProps> = ({ unreadCount = 3 }) => {
  const navigation = useNavigation<StackNavigationProp<any>>();

  const [locationDisplay, setLocationDisplay] = useState('Select Location');
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // Currently applied language
  const [appliedLang, setAppliedLang] = useState<string>('en');
  // Temporary selection inside the modal (not applied yet)
  const [pendingLang, setPendingLang] = useState<string>('en');

  const t = UI_STRINGS[appliedLang] ?? UI_STRINGS.en;

  // Refresh location display on focus
  useFocusEffect(
    useCallback(() => {
      loadLocation();
      loadLanguage();
    }, []),
  );

  const loadLocation = async () => {
    try {
      const saved = await AsyncStorage.getItem('locationDisplay');
      if (saved) {
        setLocationDisplay(saved);
        return;
      }
      const selectedRaw = await AsyncStorage.getItem('selectedAddress');
      if (selectedRaw) {
        const addr = JSON.parse(selectedRaw);
        setLocationDisplay(
          `${addr.city}, ${addr.address_line_2 || addr.address_line}`,
        );
      }
    } catch {
      // keep default
    }
  };

  const loadLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem('appLanguage');
      if (saved) {
        setAppliedLang(saved);
        setPendingLang(saved);
      }
    } catch {}
  };

  const openLanguageModal = () => {
    // Reset pending to current applied so cancel works correctly
    setPendingLang(appliedLang);
    setShowLanguageModal(true);
  };

  const handleCancel = () => {
    setPendingLang(appliedLang); // discard changes
    setShowLanguageModal(false);
  };

  const handleApply = async () => {
    setAppliedLang(pendingLang);
    setShowLanguageModal(false);
    try {
      await AsyncStorage.setItem('appLanguage', pendingLang);
      // TODO: plug into your i18n library here, e.g. i18n.changeLanguage(pendingLang)
    } catch {}
  };

  return (
    <>
      <View style={styles.container}>
        {/* Left — Location */}
        <TouchableOpacity
          style={styles.locationContainer}
          onPress={() => navigation.getParent()?.navigate('SelectLocation')}
          activeOpacity={0.7}
        >
          <Icon
            name="location-on"
            size={18}
            color={colors.primary}
            style={styles.locationIcon}
          />
          <Text style={styles.locationText} numberOfLines={1}>
            {locationDisplay}
          </Text>
          <Icon name="keyboard-arrow-down" size={18} color={colors.primary} />
        </TouchableOpacity>

        {/* Right — Icons */}
        <View style={styles.rightContainer}>
          {/* Language button */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={openLanguageModal}
            activeOpacity={0.7}
          >
            <Icon name="translate" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Notifications button */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.getParent()?.navigate('Notifications')}
            activeOpacity={0.7}
          >
            <Icon name="notifications" size={20} color={colors.textSecondary} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Language Selector Modal ── */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={handleCancel}
      >
        {/* Dimmed backdrop — tap to cancel */}
        <Pressable style={styles.backdrop} onPress={handleCancel}>
          {/* Stop tap propagation so tapping inside the sheet doesn't close it */}
          <Pressable style={styles.sheet} onPress={() => {}}>
            {/* Sheet handle */}
            <View style={styles.sheetHandle} />

            {/* Header row */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t.selectLanguage}</Text>
              <TouchableOpacity
                onPress={handleCancel}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon name="close" size={22} color="#374151" />
              </TouchableOpacity>
            </View>

            {/* Language options */}
            <View style={styles.optionsList}>
              {LANGUAGES.map(lang => {
                const isSelected = pendingLang === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.optionRow,
                      isSelected && styles.optionRowSelected,
                    ]}
                    onPress={() => setPendingLang(lang.code)}
                    activeOpacity={0.7}
                  >
                    {/* Flag emoji */}
                    {/* <Text style={styles.flagEmoji}>{lang.flag}</Text> */}

                    {/* Names */}
                    <View style={styles.optionTextBlock}>
                      <Text
                        style={[
                          styles.optionNativeName,
                          isSelected && styles.optionNameSelected,
                        ]}
                      >
                        {lang.nativeName}
                      </Text>
                      <Text style={styles.optionSubName}>{lang.name}</Text>
                    </View>

                    {/* Radio circle */}
                    <View
                      style={[styles.radio, isSelected && styles.radioSelected]}
                    >
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Footer buttons */}
            <View style={styles.sheetFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={handleCancel}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={handleApply}
                activeOpacity={0.8}
              >
                <Text style={styles.applyBtnText}>{t.apply}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── TopBar ──
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationIcon: { marginRight: 4 },
  locationText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginRight: 2,
    flex: 1,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 4,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },

  // ── Modal backdrop ──
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },

  // ── Bottom sheet ──
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  // ── Language options ──
  optionsList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    gap: 14,
  },
  optionRowSelected: {
    borderColor: '#f97316',
    backgroundColor: '#fff7ed',
  },
  flagEmoji: {
    fontSize: 28,
  },
  optionTextBlock: {
    flex: 1,
  },
  optionNativeName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  optionNameSelected: {
    color: '#111827',
  },
  optionSubName: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },

  // ── Radio button ──
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#f97316',
    backgroundColor: '#f97316',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },

  // ── Footer buttons ──
  sheetFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
  },
  applyBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 50,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});

export default TopBar;
