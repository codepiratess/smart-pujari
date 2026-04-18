import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/theme';

const PrivacyPolicyScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();

  const sections = [
    {
      heading: "Introduction",
      paragraphs: [
        "Smart Pujari (\"we,\" \"our,\" or \"us\") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.",
        "Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application."
      ]
    },
    {
      heading: "Information We Collect",
      paragraphs: [
        "We collect information that you provide directly to us when using Smart Pujari:"
      ],
      bulletPoints: [
        "Personal identification information (name, phone number, email address)",
        "Location data for finding nearby pandits",
        "Booking and payment information",
        "Profile preferences and settings",
        "Device information and usage data",
        "Photos and documents (if uploaded for ceremonies)",
        "Feedback, ratings, and reviews"
      ]
    },
    {
      heading: "How We Use Your Information",
      paragraphs: [
        "We use collected information for the following purposes:"
      ],
      numberedList: [
        "To facilitate bookings and connect you with pandits",
        "To process payments and manage transactions",
        "To send booking confirmations and notifications",
        "To improve our services and user experience",
        "To provide customer support",
        "To send promotional offers and updates (with your consent)",
        "To analyze usage patterns and optimize app performance",
        "To ensure security and prevent fraud"
      ]
    },
    {
      heading: "Information Sharing and Disclosure",
      paragraphs: [
        "We may share your information in the following circumstances:",
        "We do not sell your personal information to third parties for marketing purposes."
      ],
      bulletPoints: [
        "With pandits to facilitate your bookings",
        "With payment processors to complete transactions",
        "With service providers who assist in app operations",
        "When required by law or legal proceedings",
        "To protect our rights and prevent fraud",
        "With your consent for specific purposes"
      ]
    },
    {
      heading: "Data Security",
      paragraphs: [
        "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.",
        "While we strive to protect your data, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security of your information."
      ]
    },
    {
      heading: "Location Data",
      paragraphs: [
        "We collect and use location data to provide location-based services such as finding nearby pandits and estimating service availability in your area.",
        "You can control location permissions through your device settings. Disabling location services may limit certain features of the app."
      ]
    },
    {
      heading: "Cookies and Tracking Technologies",
      paragraphs: [
        "We use cookies and similar tracking technologies to track activity on our app and store certain information. You can instruct your device to refuse cookies or indicate when a cookie is being sent."
      ]
    },
    {
      heading: "Third-Party Services",
      paragraphs: [
        "Our app may contain links to third-party services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies."
      ]
    },
    {
      heading: "Children's Privacy",
      paragraphs: [
        "Smart Pujari is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately."
      ]
    },
    {
      heading: "Your Rights and Choices",
      paragraphs: [
        "You have the following rights regarding your personal information:"
      ],
      bulletPoints: [
        "Access and review your personal information",
        "Update or correct inaccurate information",
        "Delete your account and associated data",
        "Opt-out of promotional communications",
        "Withdraw consent for data processing",
        "Export your data in a portable format"
      ]
    },
    {
      heading: "Data Retention",
      paragraphs: [
        "We retain your personal information for as long as necessary to provide our services and comply with legal obligations. When you delete your account, we will remove your personal information, except where we are required to retain it by law."
      ]
    },
    {
      heading: "Changes to Privacy Policy",
      paragraphs: [
        "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the \"Last updated\" date.",
        "We encourage you to review this Privacy Policy periodically for any changes."
      ]
    },
    {
      heading: "Contact Us",
      paragraphs: [
        "If you have questions or concerns about this Privacy Policy or our data practices, please contact us:",
        "Email: privacy@smartpujari.com",
        "Phone: +91 1800-PUJARI",
        "Address: Smart Pujari Technologies Pvt. Ltd., Mumbai, Maharashtra, India"
      ]
    }
  ];

  const renderSection = (section: any, index: number) => {
    return (
      <View key={index} style={styles.section}>
        <Text style={styles.sectionHeading}>{section.heading}</Text>
        
        {section.paragraphs && section.paragraphs.map((paragraph: string, pIndex: number) => (
          <Text key={pIndex} style={styles.paragraph}>
            {paragraph}
          </Text>
        ))}
        
        {section.bulletPoints && section.bulletPoints.map((point: string, bIndex: number) => (
          <View key={bIndex} style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>{point}</Text>
          </View>
        ))}
        
        {section.numberedList && section.numberedList.map((point: string, nIndex: number) => (
          <View key={nIndex} style={styles.numberedPoint}>
            <Text style={styles.number}>{nIndex + 1}.</Text>
            <Text style={styles.numberedText}>{point}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {sections.map((section, index) => renderSection(section, index))}
        
        {/* Footer */}
        <Text style={styles.footerText}>
          Last updated: February 2026
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 8,
    marginRight: 12,
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  numberedPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  number: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginRight: 12,
    minWidth: 24,
  },
  numberedText: {
    flex: 1,
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 24,
    fontStyle: 'italic',
  },
});

export default PrivacyPolicyScreen;
