import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/theme';

const { width } = Dimensions.get('window');

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const FAQScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const faqs: FAQ[] = [
    {
      id: "1",
      question: "How do I book a pandit?",
      answer: "You can book a pandit by browsing our verified pandits list, selecting your preferred pandit, choosing pooja type, and picking a convenient date and time slot. Add any additional requirements and proceed to payment to confirm your booking."
    },
    {
      id: "2",
      question: "Can I cancel my booking?",
      answer: "Yes, you can cancel your booking from the 'My Bookings' section. Cancellation charges may apply based on how far in advance you cancel. Check our refund policy for detailed information about cancellation terms."
    },
    {
      id: "3",
      question: "How do refunds work?",
      answer: "Refunds are processed based on our cancellation policy. If you cancel 24+ hours before the scheduled time, you'll receive a full refund. Cancellations within 24 hours may incur a 30% charge. Refunds are typically processed within 5-7 business days."
    },
    {
      id: "4",
      question: "When will the pandit contact me?",
      answer: "The assigned pandit will contact you within 2-4 hours of booking confirmation to discuss pooja requirements, verify the address, and confirm the schedule. You'll also receive their contact details via SMS and in-app notification."
    },
    {
      id: "5",
      question: "How do reward points work?",
      answer: "You earn reward points by referring friends, completing bookings, and participating in promotions. Points can be redeemed during payment to get discounts. Every successful referral earns you 50 points, and each booking earns you 20 points. 100 points = ₹100 discount."
    },
    {
      id: "6",
      question: "What payment methods are accepted?",
      answer: "We accept all major payment methods including UPI, Credit/Debit Cards, Net Banking, and popular wallets like Paytm, PhonePe, and Google Pay. You can also use your reward points to get discounts on your booking."
    },
    {
      id: "7",
      question: "Can I book a pandit for online pooja?",
      answer: "Yes! We offer online pooja services where the pandit will conduct the ceremony via video call. You can select multiple poojas, choose your preferred date and time, and the pandit will guide you through the entire process remotely."
    },
    {
      id: "8",
      question: "What if I need to reschedule my booking?",
      answer: "You can reschedule your booking from the 'My Bookings' section at least 12 hours before the scheduled time. Rescheduling is free of charge if done within the allowed timeframe. Contact support if you need urgent rescheduling."
    },
    {
      id: "9",
      question: "Are pandits verified?",
      answer: "Yes, all pandits on our platform are thoroughly verified. We check their credentials, experience, and conduct background verification. Each pandit profile shows their experience, specialization, ratings, and reviews from previous customers."
    },
    {
      id: "10",
      question: "How can I rate and review a pandit?",
      answer: "After your pooja is completed, you'll receive a notification to rate and review the pandit. You can also access this from the 'My Bookings' section. Your honest feedback helps other users make informed decisions and helps us maintain quality standards."
    }
  ];

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredFAQs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderFAQItem = ({ item }: { item: FAQ }) => {
    const isExpanded = expandedId === item.id;

    return (
      <TouchableOpacity
        style={styles.faqItem}
        onPress={() => toggleExpanded(item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.questionHeader}>
          <Text style={styles.question}>{item.question}</Text>
          <Icon
            name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
            size={20}
            color={isExpanded ? colors.primary : colors.textSecondary}
          />
        </View>
        {isExpanded && (
          <View style={styles.answerContainer}>
            <Text style={styles.answer}>{item.answer}</Text>
          </View>
        )}
      </TouchableOpacity>
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
        <Text style={styles.headerTitle}>FAQs</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search questions"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {/* FAQ List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      >
        {filteredFAQs.length > 0 ? (
          filteredFAQs.map((faq) => (
            <View key={faq.id} style={styles.faqWrapper}>
              {renderFAQItem({ item: faq })}
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="search-off" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>
              No questions found matching "{searchQuery}"
            </Text>
          </View>
        )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  faqWrapper: {
    marginBottom: 12,
  },
  faqItem: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 12,
    lineHeight: 22,
  },
  answerContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  answer: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default FAQScreen;
