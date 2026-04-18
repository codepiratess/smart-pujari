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

const AboutUsScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();

  const sections = [
    {
      heading: "Our Story",
      paragraphs: [
        "Smart Pujari was founded in 2024 with a simple yet profound mission: to preserve and promote Hindu religious traditions while making them accessible to everyone in the digital age.",
        "We recognized that in today's fast-paced world, many people struggle to find authentic, verified pandits for their religious ceremonies. Whether it's a wedding, housewarming, or any auspicious occasion, finding the right pandit at the right time was a challenge.",
        "Smart Pujari bridges this gap by creating a trusted platform that connects devotees with experienced, verified pandits across India."
      ]
    },
    {
      heading: "Our Mission",
      paragraphs: [
        "To make Hindu religious ceremonies and poojas accessible, convenient, and authentic for everyone, while empowering pandits with a platform to reach more devotees and grow their practice."
      ]
    },
    {
      heading: "Our Vision",
      paragraphs: [
        "To become India's most trusted platform for religious services, preserving ancient traditions while embracing modern technology to serve millions of devotees worldwide."
      ]
    },
    {
      heading: "What We Offer",
      bulletPoints: [
        "Verified and experienced pandits across all major cities",
        "Wide range of poojas and religious ceremonies",
        "Online and offline pooja options",
        "Transparent pricing with no hidden charges",
        "Easy booking and payment process",
        "24/7 customer support",
        "Authentic rituals performed according to Vedic traditions",
        "Multilingual pandits for your convenience"
      ]
    },
    {
      heading: "Our Values",
      paragraphs: [
        "At Smart Pujari, we are guided by core values that shape everything we do:"
      ],
      bulletPoints: [
        "Authenticity: We ensure all rituals are performed according to traditional Vedic practices",
        "Trust: Every pandit is thoroughly verified and background-checked",
        "Accessibility: Making religious services available to everyone, everywhere",
        "Respect: Honoring both ancient traditions and modern needs",
        "Innovation: Using technology to enhance, not replace, spiritual experiences",
        "Customer Focus: Your satisfaction and spiritual fulfillment are our priority"
      ]
    },
    {
      heading: "Our Pandits",
      paragraphs: [
        "All pandits on our platform undergo a rigorous verification process. We check their credentials, experience, knowledge of Vedic scriptures, and conduct background verification.",
        "Our pandits are skilled in various ceremonies including weddings, grihapravesh, namkaran, thread ceremonies, last rites, and many more. They come from diverse backgrounds and can perform ceremonies in multiple languages."
      ]
    },
    {
      heading: "Why Choose Smart Pujari",
      numberedList: [
        "Verified Pandits: All our pandits are thoroughly verified and experienced",
        "Easy Booking: Book a pandit in just a few clicks from your mobile",
        "Transparent Pricing: Know exactly what you're paying for, no surprises",
        "Flexible Options: Choose between online or in-person ceremonies",
        "Customer Support: Our dedicated support team is always here to help",
        "Secure Payments: Multiple payment options with secure processing",
        "Quality Assurance: We maintain high standards through ratings and reviews",
        "Cultural Preservation: We're committed to preserving and promoting our rich heritage"
      ]
    },
    {
      heading: "Our Impact",
      paragraphs: [
        "Since our launch, Smart Pujari has facilitated thousands of religious ceremonies across India. We've helped families celebrate important milestones, brought communities together, and ensured that traditional practices continue to thrive in modern times.",
        "We've also empowered pandits by providing them with a stable platform to connect with devotees, manage their bookings, and earn a dignified livelihood."
      ]
    },
    {
      heading: "Technology for Tradition",
      paragraphs: [
        "While we embrace technology, we never compromise on tradition. Our platform is designed to make the booking process seamless, but the ceremonies themselves remain rooted in authentic Vedic practices.",
        "We believe that technology should serve spirituality, not replace it. Smart Pujari is our attempt to honor the past while building for the future."
      ]
    },
    {
      heading: "Join Our Community",
      paragraphs: [
        "Whether you're planning a major ceremony or seeking guidance for daily poojas, Smart Pujari is here to serve you. Join thousands of satisfied users who trust us for their spiritual needs.",
        "For pandits looking to expand their reach and manage their practice more effectively, we invite you to join our platform and be part of this meaningful journey."
      ]
    },
    {
      heading: "Contact Us",
      paragraphs: [
        "We'd love to hear from you. Whether you have questions, feedback, or suggestions, please don't hesitate to reach out:",
        "Email: hello@smartpujari.com",
        "Phone: +91 1800-PUJARI (784274)",
        "Address: Smart Pujari Technologies Pvt. Ltd., Andheri West, Mumbai, Maharashtra 400053, India",
        "Follow us on social media for updates, spiritual content, and community stories."
      ]
    },
    {
      paragraphs: [
        "Thank you for choosing Smart Pujari. May your spiritual journey be blessed. 🙏"
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
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {sections.map((section, index) => renderSection(section, index))}
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
});

export default AboutUsScreen;
