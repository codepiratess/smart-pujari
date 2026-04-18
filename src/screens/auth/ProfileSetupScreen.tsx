import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { authApi } from '../../api/authApi';
import { getUser } from '../../store/authStore';
import { colors } from '../../theme/theme';

type RootStackParamList = {
  ProfileSetup: undefined;
  Main: undefined;
};

type ProfileSetupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProfileSetup'>;

const ProfileSetupScreen: React.FC = () => {
  const navigation = useNavigation<ProfileSetupScreenNavigationProp>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePhotoSelect = () => {
    Alert.alert(
      'Profile Photo',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: openCamera,
        },
        {
          text: 'Gallery',
          onPress: openGallery,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const openCamera = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.7,
      maxWidth: 500,
      maxHeight: 500,
    };

    launchCamera(options, (response: ImagePickerResponse) => {
      if (response.assets && response.assets[0]) {
        setProfilePhoto(response.assets[0].uri || null);
      }
    });
  };

  const openGallery = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.7,
      maxWidth: 500,
      maxHeight: 500,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.assets && response.assets[0]) {
        setProfilePhoto(response.assets[0].uri || null);
      }
    });
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      
      if (email.trim()) {
        formData.append('email', email.trim());
      }

      if (profilePhoto) {
        const uri = profilePhoto;
        const filename = uri.split('/').pop() || 'profile.jpg';
        const type = 'image/jpeg';
        
        formData.append('photo', {
          uri,
          name: filename,
          type,
        } as any);
      }

      const response = await authApi.profileSetup(formData);
      
      // Update user data in storage
      await getUser(); // Refresh user data
      
      // Navigate to main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update profile. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = name.trim().length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>Complete your profile</Text>

          {/* Profile Photo */}
          <View style={styles.photoSection}>
            <TouchableOpacity style={styles.photoContainer} onPress={handlePhotoSelect}>
              {profilePhoto ? (
                <Image source={{ uri: profilePhoto }} style={styles.profileImage} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoPlaceholderText}>Add Photo</Text>
                  <Text style={styles.photoIcon}>+</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.changePhotoButton} onPress={handlePhotoSelect}>
              <Text style={styles.changePhotoText}>
                {profilePhoto ? 'Change Photo' : 'Add Photo'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Inputs */}
          <View style={styles.formSection}>
            {/* Full Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                editable={!isLoading}
              />
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!isFormValid || isLoading) && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.background} size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Submit</Text>
            )}
          </TouchableOpacity>

          {/* Skip Button */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => {
              Alert.alert(
                'Skip Profile Setup',
                'You can complete your profile later from the account settings.',
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'Skip',
                    onPress: () => {
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'Main' }],
                      });
                    },
                  },
                ]
              );
            }}
          >
            <Text style={styles.skipButtonText}>Skip for Now</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 40,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  photoIcon: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: 'bold',
  },
  changePhotoButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  changePhotoText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  formSection: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.textPrimary,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledButton: {
    backgroundColor: colors.border,
  },
  submitButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  skipButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
});

export default ProfileSetupScreen;
