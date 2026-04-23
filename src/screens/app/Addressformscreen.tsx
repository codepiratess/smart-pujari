import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { addressApi, AddressPayload } from '../../api/address';

type AddressLabel = 'Home' | 'Work' | 'Temple' | 'Other';

const LABELS: { key: AddressLabel; icon: string }[] = [
  { key: 'Home', icon: 'home' },
  { key: 'Work', icon: 'work' },
  { key: 'Temple', icon: 'place' },
  { key: 'Other', icon: 'location-on' },
];

const AddressFormScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute<any>();
  const { mode, addressId } = route.params ?? { mode: 'add' };

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(mode === 'edit');

  // Form fields
  const [label, setLabel] = useState<AddressLabel>('Home');
  const [flatNo, setFlatNo] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Load address data when editing — runs once on mount
  useEffect(() => {
    if (mode === 'edit' && addressId) {
      loadAddress();
    }
  }, []);

  const loadAddress = async () => {
    try {
      setLoading(true);
      const addresses = await addressApi.getAll();
      const address = addresses.find(a => a.id === addressId);
      if (address) {
        setLabel(address.address_label || 'Home');
        setFlatNo(address.address_line || '');
        setArea(address.address_line_2 || '');
        setCity(address.city || '');
        setState(address.state || '');
        setDistrict(address.district || '');
        setPincode(address.pincode || '');
        setLandmark(address.landmark || '');
        setContactName(address.contact_name || '');
        setContactPhone(address.contact_phone || '');
        setIsDefault(address.is_default || false);
      }
    } catch (err: any) {
      if (err.message === 'USER_NOT_FOUND') {
        Alert.alert('Session Expired', 'Please log in again.');
      } else {
        Alert.alert('Error', 'Could not load address details');
      }
    } finally {
      setLoading(false);
    }
  };

  const touch = (field: string) =>
    setTouched(prev => ({ ...prev, [field]: true }));

  const getError = (
    field: string,
    value: string,
    exactLen?: number,
  ): string | null => {
    if (!touched[field]) return null;
    if (!value?.trim()) return 'Required';
    if (exactLen && value.replace(/\D/g, '').length !== exactLen)
      return field === 'pincode' ? 'Invalid pincode' : 'Invalid phone number';
    return null;
  };

  const isFormValid =
    flatNo.trim() !== '' &&
    area.trim() !== '' &&
    city.trim() !== '' &&
    state.trim() !== '' &&
    district.trim() !== '' &&
    pincode.trim().length === 6 &&
    contactName.trim() !== '' &&
    contactPhone.trim().length === 10;

  const handleSubmit = async () => {
    if (!isFormValid) {
      setTouched({
        flatNo: true,
        area: true,
        city: true,
        state: true,
        district: true,
        pincode: true,
        contactName: true,
        contactPhone: true,
      });
      return;
    }

    const payload: AddressPayload = {
      address_label: label,
      address_line: flatNo,
      address_line_2: area,
      city,
      district,
      state,
      pincode,
      landmark: landmark || undefined,
      contact_name: contactName,
      contact_phone: contactPhone,
      is_default: isDefault,
    };

    try {
      setSaving(true);
      if (mode === 'add') {
        await addressApi.create(payload);
      } else {
        await addressApi.update(addressId, payload);
      }
      navigation.goBack();
    } catch (err: any) {
      if (err.message === 'USER_NOT_FOUND') {
        Alert.alert('Session Expired', 'Please log in again.');
      } else {
        console.error('Save address error:', err);
        Alert.alert('Error', 'Failed to save address. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#f97316" />
          <Text style={styles.loadingText}>Loading address...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Icon name="arrow-back" size={22} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {mode === 'add' ? 'Add New Address' : 'Edit Address'}
        </Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {/* Address Label */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>
            ADDRESS LABEL <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.labelsRow}>
            {LABELS.map(l => (
              <TouchableOpacity
                key={l.key}
                style={[
                  styles.labelBtn,
                  label === l.key && styles.labelBtnActive,
                ]}
                onPress={() => setLabel(l.key)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.labelIconCircle,
                    label === l.key && styles.labelIconCircleActive,
                  ]}
                >
                  <Icon
                    name={l.icon}
                    size={18}
                    color={label === l.key ? '#f97316' : '#9ca3af'}
                  />
                </View>
                <Text
                  style={[
                    styles.labelBtnText,
                    label === l.key && styles.labelBtnTextActive,
                  ]}
                >
                  {l.key}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Flat / Building Name */}
        <Field
          label="FLAT / BUILDING NAME"
          required
          error={getError('flatNo', flatNo)}
        >
          <TextInput
            style={[
              styles.input,
              getError('flatNo', flatNo) ? styles.inputError : null,
            ]}
            placeholder="e.g. A-201, Shree Krishna Apartments"
            placeholderTextColor="#9ca3af"
            value={flatNo}
            onChangeText={setFlatNo}
            onBlur={() => touch('flatNo')}
          />
        </Field>

        {/* Area / Street */}
        <Field label="AREA / STREET" required error={getError('area', area)}>
          <TextInput
            style={[
              styles.input,
              getError('area', area) ? styles.inputError : null,
            ]}
            placeholder="e.g. Andheri West"
            placeholderTextColor="#9ca3af"
            value={area}
            onChangeText={setArea}
            onBlur={() => touch('area')}
          />
        </Field>

        {/* City + State */}
        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>
              CITY <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                getError('city', city) ? styles.inputError : null,
              ]}
              placeholder="Mumbai"
              placeholderTextColor="#9ca3af"
              value={city}
              onChangeText={setCity}
              onBlur={() => touch('city')}
            />
            {getError('city', city) && <ErrorMsg msg="City Required" />}
          </View>
          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>
              STATE <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                getError('state', state) ? styles.inputError : null,
              ]}
              placeholder="Maharashtra"
              placeholderTextColor="#9ca3af"
              value={state}
              onChangeText={setState}
              onBlur={() => touch('state')}
            />
            {getError('state', state) && <ErrorMsg msg="State Required" />}
          </View>
        </View>

        {/* District + Pincode */}
        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>
              DISTRICT <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                getError('district', district) ? styles.inputError : null,
              ]}
              placeholder="e.g. Mumbai Sub"
              placeholderTextColor="#9ca3af"
              value={district}
              onChangeText={setDistrict}
              onBlur={() => touch('district')}
            />
            {getError('district', district) && (
              <ErrorMsg msg="District Required" />
            )}
          </View>
          <View style={styles.halfField}>
            <View style={styles.labelRowWithCounter}>
              <Text style={styles.fieldLabel}>
                PINCODE <Text style={styles.required}>*</Text>
              </Text>
              <Text
                style={[
                  styles.counter,
                  pincode.length === 6 && styles.counterDone,
                ]}
              >
                {pincode.length}/6
              </Text>
            </View>
            <TextInput
              style={[
                styles.input,
                getError('pincode', pincode, 6) ? styles.inputError : null,
              ]}
              placeholder="400053"
              placeholderTextColor="#9ca3af"
              value={pincode}
              keyboardType="numeric"
              maxLength={6}
              onChangeText={v => setPincode(v.replace(/\D/g, ''))}
              onBlur={() => touch('pincode')}
            />
            {getError('pincode', pincode, 6) && (
              <ErrorMsg
                msg={
                  pincode.length === 0
                    ? 'Pincode is required'
                    : 'Invalid Pincode'
                }
              />
            )}
          </View>
        </View>

        {/* Landmark */}
        <Field label="LANDMARK" optional>
          <TextInput
            style={styles.input}
            placeholder="Near Metro Station"
            placeholderTextColor="#9ca3af"
            value={landmark}
            onChangeText={setLandmark}
          />
        </Field>

        <View style={styles.divider} />

        {/* Contact Name */}
        <Field
          label="CONTACT NAME"
          required
          error={getError('contactName', contactName)}
        >
          <TextInput
            style={[
              styles.input,
              getError('contactName', contactName) ? styles.inputError : null,
            ]}
            placeholder="Your Name"
            placeholderTextColor="#9ca3af"
            value={contactName}
            onChangeText={setContactName}
            onBlur={() => touch('contactName')}
          />
        </Field>

        {/* Contact Phone */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRowWithCounter}>
            <Text style={styles.fieldLabel}>
              CONTACT PHONE <Text style={styles.required}>*</Text>
            </Text>
            <Text
              style={[
                styles.counter,
                contactPhone.length === 10 && styles.counterDone,
              ]}
            >
              {contactPhone.length}/10
            </Text>
          </View>
          <TextInput
            style={[
              styles.input,
              getError('contactPhone', contactPhone, 10)
                ? styles.inputError
                : null,
            ]}
            placeholder="9876543210"
            placeholderTextColor="#9ca3af"
            value={contactPhone}
            keyboardType="numeric"
            maxLength={10}
            onChangeText={v => setContactPhone(v.replace(/\D/g, ''))}
            onBlur={() => touch('contactPhone')}
          />
          {getError('contactPhone', contactPhone, 10) && (
            <ErrorMsg
              msg={
                contactPhone.length === 0
                  ? 'Phone number required'
                  : 'Invalid Phone Number'
              }
            />
          )}
        </View>

        {/* Set as Default */}
        <TouchableOpacity
          style={styles.defaultRow}
          onPress={() => setIsDefault(!isDefault)}
          activeOpacity={0.8}
        >
          <View style={styles.defaultLeft}>
            <Text style={styles.defaultTitle}>Set as Default Address</Text>
            <Text style={styles.defaultSubtitle}>
              Use this address for all bookings
            </Text>
          </View>
          <Switch
            value={isDefault}
            onValueChange={setIsDefault}
            trackColor={{ false: '#e5e7eb', true: '#f97316' }}
            thumbColor="#fff"
          />
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveBtn, !isFormValid && styles.saveBtnDisabled]}
          onPress={handleSubmit}
          disabled={!isFormValid || saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>
              {mode === 'add' ? 'Save Address' : 'Update Address'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ─── Helper sub-components ────────────────────────────────────────────────────

const Field: React.FC<{
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string | null;
  hint?: string | null;
  children: React.ReactNode;
}> = ({ label, required, optional, error, children }) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>
      {label}
      {required && <Text style={styles.required}> *</Text>}
      {optional && <Text style={styles.optional}> (Optional)</Text>}
    </Text>
    {children}
    {error && <ErrorMsg msg={error} />}
  </View>
);

const ErrorMsg: React.FC<{ msg: string }> = ({ msg }) => (
  <View style={styles.errorRow}>
    <Icon name="error-outline" size={13} color="#ef4444" />
    <Text style={styles.errorText}>{msg}</Text>
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 15, color: '#6b7280' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backBtn: { padding: 8, borderRadius: 20 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },

  scrollContent: { padding: 16 },

  fieldGroup: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  required: { color: '#ef4444' },
  optional: {
    color: '#9ca3af',
    fontSize: 9,
    textTransform: 'none',
    fontWeight: '400',
  },

  labelsRow: { flexDirection: 'row', gap: 8 },
  labelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    alignItems: 'center',
    gap: 6,
  },
  labelBtnActive: { borderColor: '#f97316', backgroundColor: '#fff7ed' },
  labelIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelIconCircleActive: { backgroundColor: '#fed7aa' },
  labelBtnText: { fontSize: 11, fontWeight: '600', color: '#9ca3af' },
  labelBtnTextActive: { color: '#f97316' },

  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: '#111827',
  },
  inputError: { borderColor: '#f87171', backgroundColor: '#fef2f2' },

  row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  halfField: { flex: 1 },

  labelRowWithCounter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  counter: { fontSize: 10, fontWeight: '700', color: '#9ca3af' },
  counterDone: { color: '#16a34a' },

  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 5,
  },
  errorText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ef4444',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  divider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 8 },

  defaultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff7ed',
    borderWidth: 1.5,
    borderColor: '#fed7aa',
    borderRadius: 14,
    marginBottom: 8,
  },
  defaultLeft: { flex: 1, marginRight: 12 },
  defaultTitle: { fontSize: 13, fontWeight: '700', color: '#111827' },
  defaultSubtitle: { fontSize: 11, color: '#6b7280', marginTop: 2 },

  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: { fontSize: 14, fontWeight: '700', color: '#6b7280' },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#f97316',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    elevation: 4,
  },
  saveBtnDisabled: {
    backgroundColor: '#e5e7eb',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});

export default AddressFormScreen;
