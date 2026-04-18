import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/theme';
import { reviewApi, PointsInfo } from '../../api/reviewApi';

const MyPointsScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [pointsInfo, setPointsInfo] = useState<PointsInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPointsInfo();
  }, []);

  const loadPointsInfo = async () => {
    try {
      setLoading(true);
      const info = await reviewApi.getPointsInfo();
      setPointsInfo(info);
    } catch (error) {
      console.error('Error loading points info:', error);
      Alert.alert('Error', 'Unable to load points information');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPointsInfo();
    setRefreshing(false);
  };

  const renderPointsHistoryItem = ({ item }: { item: any }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyItemLeft}>
        <View style={[
          styles.historyIcon,
          { backgroundColor: item.type === 'earned' ? '#4CAF50' : '#FF6B35' }
        ]}>
          <Icon
            name={item.type === 'earned' ? 'add' : 'remove'}
            size={16}
            color="#FFFFFF"
          />
        </View>
        <View style={styles.historyItemInfo}>
          <Text style={styles.historyItemSource}>{item.source}</Text>
          <Text style={styles.historyItemDescription}>{item.description}</Text>
          <Text style={styles.historyItemDate}>{item.date}</Text>
        </View>
      </View>
      <View style={styles.historyItemRight}>
        <Text style={[
          styles.historyItemAmount,
          { color: item.type === 'earned' ? '#4CAF50' : '#FF6B35' }
        ]}>
          {item.type === 'earned' ? '+' : '-'}{item.amount}
        </Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="military-tech" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyText}>No points history yet</Text>
      <Text style={styles.emptySubtext}>
        Start booking services to earn points
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => navigation.navigate('PanditList')}
        activeOpacity={0.8}
      >
        <Text style={styles.browseButtonText}>Browse Services</Text>
      </TouchableOpacity>
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

  if (!pointsInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error" size={48} color={colors.error} />
          <Text style={styles.errorText}>Unable to load points information</Text>
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
        <Text style={styles.headerTitle}>My Points</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Points Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceTitle}>Total Points Balance</Text>
          <Text style={styles.balanceValue}>{pointsInfo.totalBalance}</Text>
          <View style={styles.balanceInfo}>
            <Icon name="info" size={16} color={colors.textSecondary} />
            <Text style={styles.balanceInfoText}>
              Use points for discounts on bookings
            </Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icon name="add-circle" size={24} color="#4CAF50" />
            <Text style={styles.statValue}>
              {pointsInfo.pointsHistory.filter(item => item.type === 'earned').reduce((sum, item) => sum + item.amount, 0)}
            </Text>
            <Text style={styles.statLabel}>Points Earned</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="remove-circle" size={24} color="#FF6B35" />
            <Text style={styles.statValue}>
              {pointsInfo.pointsHistory.filter(item => item.type === 'spent').reduce((sum, item) => sum + item.amount, 0)}
            </Text>
            <Text style={styles.statLabel}>Points Spent</Text>
          </View>
        </View>

        {/* Points History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Points History</Text>
          {pointsInfo.pointsHistory.length > 0 ? (
            <View style={styles.historyContainer}>
              <FlatList
                data={pointsInfo.pointsHistory}
                renderItem={renderPointsHistoryItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
              />
            </View>
          ) : (
            renderEmptyState()
          )}
        </View>

        {/* How to Earn Points */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Earn Points</Text>
          <View style={styles.tipsContainer}>
            <View style={styles.tip}>
              <Icon name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.tipText}>
                Earn 10 points for every booking
              </Text>
            </View>
            <View style={styles.tip}>
              <Icon name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.tipText}>
                Get 50 points for writing reviews
              </Text>
            </View>
            <View style={styles.tip}>
              <Icon name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.tipText}>
                Refer friends and earn 100 points
              </Text>
            </View>
            <View style={styles.tip}>
              <Icon name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.tipText}>
                Bonus points on special occasions
              </Text>
            </View>
          </View>
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
  balanceCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceTitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FF6B35',
    marginBottom: 12,
  },
  balanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceInfoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
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
  historyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyItemInfo: {
    flex: 1,
  },
  historyItemSource: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  historyItemDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  historyItemDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  historyItemRight: {
    alignItems: 'flex-end',
  },
  historyItemAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
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
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tipsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: 12,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 20,
  },
});

export default MyPointsScreen;
