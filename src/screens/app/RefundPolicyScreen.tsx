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

const RefundPolicyScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();

  const refundRules = [
    "Auto refund will be processed if booking fails or is cancelled by the admin",
    "Refund will be credited to the original payment method used during booking",
    "Refund processing time: 3-7 working days from cancellation approval",
    "Admin may trigger manual refund if required for exceptional cases",
    "Partial refunds may apply based on cancellation timing"
  ];

  const cancellationRules = [
    "Free cancellation available up to 24 hours before the scheduled booking time",
    "Cancellation between 12-24 hours: 50% refund of the total amount",
    "Cancellation between 6-12 hours: 25% refund of the total amount",
    "No refund if cancelled within 6 hours of the service start time",
    "No refund after the pandit has reached the service location"
  ];

  const renderRule = (rule: string, index: number) => (
    <View key={index} style={styles.ruleItem}>
      <View style={styles.bullet} />
      <Text style={styles.ruleText}>{rule}</Text>
    </View>
  );

  const renderTimelineCard = (timeFrame: string, refund: string, bgColor: string, borderColor: string, textColor: string) => (
    <View style={[styles.timelineCard, { backgroundColor: bgColor, borderColor }]}>
      <View style={styles.timelineHeader}>
        <Text style={styles.timeFrame}>{timeFrame}</Text>
        <View style={[styles.refundBadge, { backgroundColor: textColor }]}>
          <Text style={styles.refundText}>{refund}</Text>
        </View>
      </View>
      <Text style={styles.timelineDescription}>
        {timeFrame.includes('24+') ? 'Free cancellation with full refund' : 
         timeFrame.includes('12-24') ? 'Partial refund applicable' :
         timeFrame.includes('6-12') ? 'Limited refund applicable' :
         'Cancellation not eligible for refund'}
      </Text>
    </View>
  );

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
        <Text style={styles.headerTitle}>Refund Policy</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Intro Text */}
        <View style={styles.card}>
          <Text style={styles.introText}>
            At Smart Pujari, we strive to provide a seamless booking experience. This refund and cancellation policy outlines the terms and conditions for cancelling your booking and processing refunds. Please read carefully before confirming your booking.
          </Text>
        </View>

        {/* Refund Rules */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: colors.success + '20' }]}>
              <Icon name="check-circle" size={20} color={colors.success} />
            </View>
            <Text style={styles.cardTitle}>Refund Rules</Text>
          </View>
          <View style={styles.rulesContainer}>
            {refundRules.map((rule, index) => renderRule(rule, index))}
          </View>
        </View>

        {/* Cancellation Rules */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: colors.error + '20' }]}>
              <Icon name="cancel" size={20} color={colors.error} />
            </View>
            <Text style={styles.cardTitle}>Cancellation Policy</Text>
          </View>
          <View style={styles.rulesContainer}>
            {cancellationRules.map((rule, index) => renderRule(rule, index))}
          </View>
        </View>

        {/* Cancellation Timeline */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Icon name="schedule" size={20} color={colors.primary} />
            </View>
            <Text style={styles.cardTitle}>Refund Timeline</Text>
          </View>
          
          <View style={styles.timelineContainer}>
            {renderTimelineCard('24+ hours before', '100% Refund', colors.success + '20', colors.success, colors.success)}
            {renderTimelineCard('12-24 hours before', '50% Refund', colors.secondary + '20', colors.secondary, colors.secondary)}
            {renderTimelineCard('6-12 hours before', '25% Refund', colors.secondary + '20', colors.secondary, colors.secondary)}
            {renderTimelineCard('Less than 6 hours', 'No Refund', colors.error + '20', colors.error, colors.error)}
          </View>
        </View>

        {/* Info Banner */}
        <View style={[styles.card, styles.infoBanner]}>
          <View style={styles.infoContent}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Icon name="info" size={20} color={colors.primary} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Important Notice</Text>
              <Text style={styles.infoText}>
                Refund timelines depend on your bank's processing time. While we process refunds within 24 hours of approval, it may take 3-7 working days to reflect in your account.
              </Text>
            </View>
          </View>
        </View>

        {/* Additional Terms */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Additional Terms</Text>
          <View style={styles.rulesContainer}>
            {renderRule("Refunds for online payments will be processed to the original payment source", 0)}
            {renderRule("Cash payments will be refunded via bank transfer to your registered account", 1)}
            {renderRule("Platform fees and taxes are refundable as per the cancellation timeline", 2)}
            {renderRule("Smart Pujari reserves the right to modify this policy with prior notice", 3)}
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Icon name="help" size={20} color={colors.primary} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Need Help?</Text>
              <Text style={styles.infoText}>
                Have questions about refunds or cancellations? Our support team is here to help.
              </Text>
            </View>
          </View>
          
          <View style={styles.contactRow}>
            <Icon name="email" size={16} color={colors.textSecondary} />
            <Text style={styles.contactEmail}>refunds@smartpujari.com</Text>
          </View>
          
          <TouchableOpacity
            style={styles.supportButton}
            onPress={() => console.log('Navigate to support')}
          >
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Note */}
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  rulesContainer: {
    gap: 12,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 8,
  },
  ruleText: {
    flex: 1,
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  introText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  timelineContainer: {
    gap: 12,
  },
  timelineCard: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeFrame: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  refundBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  refundText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.background,
  },
  timelineDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  textAlign: 'center',
  },
  infoBanner: {
    backgroundColor: colors.primary + '10',
    borderColor: colors.primary + '30',
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  contactEmail: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  supportButton: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  supportButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default RefundPolicyScreen;
