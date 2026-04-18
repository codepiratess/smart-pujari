import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Share,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/theme';
import { reviewApi, ReferralInfo } from '../../api/reviewApi';

const ReferralScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadReferralInfo();
  }, []);

  const loadReferralInfo = async () => {
    try {
      setLoading(true);
      const info = await reviewApi.getReferralInfo();
      setReferralInfo(info);
    } catch (error) {
      console.error('Error loading referral info:', error);
      Alert.alert('Error', 'Unable to load referral information');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!referralInfo) return;
    
    try {
      // In a real app, you'd use Clipboard.setString
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      Alert.alert('Success', 'Referral code copied to clipboard!');
    } catch (error) {
      console.error('Error copying code:', error);
    }
  };

  const handleShare = async () => {
    if (!referralInfo) return;
    
    try {
      const shareMessage = `
        Join SmartPujari and get amazing pooja services!
        Use my referral code: ${referralInfo.referralCode}
        
        Download the app: ${referralInfo.referralLink}
      `.trim();

      await Share.share({
        message: shareMessage,
        title: 'SmartPujari Referral',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderReferralHistoryItem = (item: any, index: number) => (
    <View key={item.id} style={styles.historyItem}>
      <View style={styles.historyItemLeft}>
        <View style={[
          styles.statusDot,
          { backgroundColor: item.status === 'completed' ? '#4CAF50' : '#FF9800' }
        ]} />
        <View style={styles.historyItemInfo}>
          <Text style={styles.historyItemUser}>{item.referredUser}</Text>
          <Text style={styles.historyItemDate}>{item.date}</Text>
        </View>
      </View>
      <View style={styles.historyItemRight}>
        <Text style={[
          styles.historyItemStatus,
          { color: item.status === 'completed' ? '#4CAF50' : '#FF9800' }
        ]}>
          {item.status === 'completed' ? 'Completed' : 'Pending'}
        </Text>
        {item.earnings > 0 && (
          <Text style={styles.historyItemEarnings}>+${item.earnings}</Text>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!referralInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error" size={48} color={colors.error} />
          <Text style={styles.errorText}>Unable to load referral information</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Referral & Rewards</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Referral Code Card */}
        <View style={styles.referralCard}>
          <Text style={styles.referralTitle}>Your Referral Code</Text>
          <View style={styles.codeContainer}>
            <Text style={styles.referralCode}>{referralInfo.referralCode}</Text>
            <TouchableOpacity
              style={[styles.copyButton, copied && styles.copyButtonCopied]}
              onPress={handleCopyCode}
              activeOpacity={0.7}
            >
              <Icon
                name={copied ? 'check' : 'content-copy'}
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.copyButtonText}>
                {copied ? 'Copied!' : 'Copy'}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Icon name="share" size={20} color={colors.primary} />
            <Text style={styles.shareButtonText}>Share with Friends</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{referralInfo.totalReferrals}</Text>
            <Text style={styles.statLabel}>Total Referrals</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>${referralInfo.totalEarnings}</Text>
            <Text style={styles.statLabel}>Total Earnings</Text>
          </View>
        </View>

        {/* How It Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.stepsContainer}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>
                Share your referral code with friends
              </Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>
                Friend signs up using your code
              </Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>
                Earn rewards when they complete their first booking
              </Text>
            </View>
          </View>
        </View>

        {/* Referral History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Referral History</Text>
          {referralInfo.referralHistory.length > 0 ? (
            <View style={styles.historyContainer}>
              {referralInfo.referralHistory.map(renderReferralHistoryItem)}
            </View>
          ) : (
            <View style={styles.emptyHistoryContainer}>
              <Icon name="history" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyHistoryText}>No referrals yet</Text>
              <Text style={styles.emptyHistorySubtext}>
                Start sharing your code to earn rewards
              </Text>
            </View>
          )}
        </View>

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  referralCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  referralTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  referralCode: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    letterSpacing: 2,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 12,
  },
  copyButtonCopied: {
    backgroundColor: '#4CAF50',
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary + '15',
    borderRadius: 8,
    padding: 12,
  },
  shareButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  stepsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
    paddingTop: 4,
  },
  historyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  historyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  historyItemInfo: {
    flex: 1,
  },
  historyItemUser: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
    marginBottom: 2,
  },
  historyItemDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  historyItemRight: {
    alignItems: 'flex-end',
  },
  historyItemStatus: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  historyItemEarnings: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  emptyHistoryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyHistoryText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyHistorySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 20,
  },
});

export default ReferralScreen;
