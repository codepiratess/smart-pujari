import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
  MediaType,
} from 'react-native-image-picker';
import { authApi } from '../../api/authApi';

type RootStackParamList = {
  Auth: undefined;
  App: undefined;
  ProfileSetup: { editMode?: boolean };
  Main: undefined;
  Account: undefined;
};

type ProfileSetupNavProp = StackNavigationProp<
  RootStackParamList,
  'ProfileSetup'
>;

interface DocumentFile {
  uri: string;
  name: string;
  type: string;
}

const ProfileSetupScreen: React.FC = () => {
  const navigation = useNavigation<ProfileSetupNavProp>();
  const route = useRoute<any>();
  const isEditMode: boolean = route.params?.editMode === true;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [document, setDocument] = useState<DocumentFile | null>(null);
  const [existingDocName, setExistingDocName] = useState<string | null>(null);

  const [touchedName, setTouchedName] = useState(false);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);

  const isFormValid = fullName.trim().length > 0;
  const showNameError = touchedName && !fullName.trim();

  // Fetch existing profile in edit mode
  useEffect(() => {
    if (!isEditMode) return;
    (async () => {
      try {
        const res = await authApi.getProfile();
        const user = res?.user;
        if (!user) return;
        setFullName(user.full_name || '');
        setEmail(user.email || '');
        if (user.profile_picture) {
          setProfileImageUri(user.profile_picture);
        }
        if (user.aadhaar_pan_path) {
          const name = user.aadhaar_pan_path.split('/').pop() || 'document';
          setExistingDocName(name);
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
      } finally {
        setIsFetching(false);
      }
    })();
  }, [isEditMode]);

  const handlePhotoSelect = () => {
    Alert.alert('Profile Photo', 'Choose an option', [
      {
        text: 'Camera',
        onPress: () =>
          launchCamera(
            {
              mediaType: 'photo' as MediaType,
              quality: 0.8,
              maxWidth: 800,
              maxHeight: 800,
            },
            (res: ImagePickerResponse) => {
              const asset = res.assets?.[0];
              if (asset?.uri) {
                setProfileImageUri(asset.uri);
                uploadPhoto(asset);
              }
            },
          ),
      },
      {
        text: 'Gallery',
        onPress: () =>
          launchImageLibrary(
            {
              mediaType: 'photo' as MediaType,
              quality: 0.8,
              maxWidth: 800,
              maxHeight: 800,
            },
            (res: ImagePickerResponse) => {
              const asset = res.assets?.[0];
              if (asset?.uri) {
                setProfileImageUri(asset.uri);
                uploadPhoto(asset);
              }
            },
          ),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const uploadPhoto = async (asset: any) => {
    try {
      await authApi.uploadProfileImage({
        uri: asset.uri,
        fileName: asset.fileName,
        type: asset.type,
      });
    } catch (err) {
      console.error('Photo upload error:', err);
    }
  };

  const handleDocumentPick = () => {
    launchImageLibrary(
      {
        mediaType: 'mixed' as MediaType, // allows PDFs on some versions
        quality: 1.0,
      },
      (res: ImagePickerResponse) => {
        const asset = res.assets?.[0];
        if (asset?.uri) {
          setDocument({
            uri: asset.uri,
            name: asset.fileName || 'document',
            type: asset.type || 'image/jpeg',
          });
          setExistingDocName(null);
        }
      },
    );
  };

  const handleContinue = async () => {
    setTouchedName(true);
    if (!fullName.trim()) {
      setNameError('Please enter your full name');
      return;
    }

    setIsLoading(true);
    setNameError('');
    setEmailError('');

    try {
      // Always calls PUT /profile
      await authApi.updateProfile({
        full_name: fullName.trim(),
        email: email.trim() || undefined,
        aadhaar_pan: document
          ? { uri: document.uri, name: document.name, type: document.type }
          : undefined,
      });

      if (isEditMode) {
        navigation.goBack();
      } else {
        navigation.getParent()?.reset({
          index: 0,
          routes: [{ name: 'App' }],
        });
      }
    } catch (error: any) {
      const msg: string = error?.response?.data?.message || '';
      if (
        error?.response?.status === 422 ||
        msg.toLowerCase().includes('email')
      ) {
        setEmailError('This email is already associated with another account.');
      } else {
        Alert.alert(
          'Error',
          msg || 'Failed to update profile. Please try again.',
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingFull}>
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      </SafeAreaView>
    );
  }

  const docDisplayName = document?.name || existingDocName;
  const hasDocument = !!docDisplayName;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Icon name="arrow-back" size={22} color="#374151" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>
            {isEditMode ? 'Edit Profile' : 'Complete Your Profile'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isEditMode
              ? 'Update your profile details'
              : 'This helps us personalize your bookings'}
          </Text>
        </View>
      </View>

      {/* Scrollable Form */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Photo */}
        <View style={styles.photoSection}>
          <TouchableOpacity
            onPress={handlePhotoSelect}
            style={styles.photoWrapper}
            activeOpacity={0.85}
          >
            <View style={styles.photoCircle}>
              {profileImageUri ? (
                <Image source={{ uri: profileImageUri }} style={styles.photo} />
              ) : (
                <Icon name="person" size={48} color="#fed7aa" />
              )}
            </View>
            <View style={styles.cameraBadge}>
              <Icon name="camera-alt" size={18} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          {/* Full Name */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>
              Full Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, showNameError && styles.inputError]}
              placeholder="Enter your full name"
              placeholderTextColor="#9ca3af"
              value={fullName}
              onChangeText={val => {
                setFullName(val);
                if (val.trim() && nameError) setNameError('');
              }}
              onBlur={() => setTouchedName(true)}
              editable={!isLoading}
            />
            {showNameError && (
              <View style={styles.errorRow}>
                <View style={styles.errorDot} />
                <Text style={styles.errorText}>FULL NAME IS REQUIRED</Text>
              </View>
            )}
          </View>

          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email (Optional)</Text>
            <TextInput
              style={[styles.input, !!emailError && styles.inputError]}
              placeholder="your.email@example.com"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={val => {
                setEmail(val);
                if (emailError) setEmailError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
            {!!emailError && (
              <Text style={styles.emailError}>{emailError}</Text>
            )}
          </View>

          {/* Aadhaar / PAN */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Aadhaar / PAN (Optional)</Text>

            {hasDocument ? (
              <View style={styles.docUploaded}>
                <View style={styles.docIconBox}>
                  <Icon name="check-circle" size={20} color="#16a34a" />
                </View>
                <View style={styles.docInfo}>
                  <Text style={styles.docName} numberOfLines={1}>
                    {docDisplayName}
                  </Text>
                  {existingDocName && !document && (
                    <Text style={styles.docExisting}>Previously uploaded</Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setDocument(null);
                    setExistingDocName(null);
                  }}
                >
                  <Icon name="close" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.docUploadBtn}
                onPress={handleDocumentPick}
                activeOpacity={0.7}
              >
                <View style={styles.docUploadIconBox}>
                  <Icon name="upload-file" size={24} color="#9ca3af" />
                </View>
                <Text style={styles.docUploadTitle}>Upload Document</Text>
                <Text style={styles.docUploadSubtitle}>
                  PDF or Image (Max 5MB)
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitBtn,
            (!isFormValid || isLoading) && styles.submitBtnDisabled,
          ]}
          onPress={handleContinue}
          disabled={!isFormValid || isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.submitBtnText}>
              {isEditMode ? 'Save Changes' : 'Continue'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF9' },
  loadingFull: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFDF9',
  },
  backBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    flexShrink: 0,
    marginTop: 2,
  },
  headerText: { flex: 1 },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  headerSubtitle: { fontSize: 13, color: '#6b7280' },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },

  photoSection: { alignItems: 'center', marginBottom: 24 },
  photoWrapper: { position: 'relative' },
  photoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#ffedd5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  photo: { width: 110, height: 110 },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ea580c',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFDF9',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  field: { gap: 8 },
  fieldLabel: { fontSize: 14, fontWeight: '500', color: '#374151' },
  required: { color: '#ef4444' },
  input: {
    height: 50,
    backgroundColor: '#f9fafb',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#111827',
  },
  inputError: { borderColor: '#ef4444' },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  errorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ef4444',
  },
  errorText: {
    fontSize: 10,
    color: '#ef4444',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  emailError: { fontSize: 12, color: '#ef4444' },

  docUploaded: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 14,
    padding: 14,
  },
  docIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  docInfo: { flex: 1 },
  docName: { fontSize: 13, fontWeight: '500', color: '#111827' },
  docExisting: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  docUploadBtn: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    borderRadius: 14,
    paddingVertical: 24,
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fafafa',
  },
  docUploadIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  docUploadTitle: { fontSize: 14, fontWeight: '500', color: '#374151' },
  docUploadSubtitle: { fontSize: 12, color: '#9ca3af' },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  submitBtn: {
    height: 52,
    borderRadius: 999,
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    backgroundColor: '#d1d5db',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});

export default ProfileSetupScreen;
