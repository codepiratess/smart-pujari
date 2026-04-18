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
import { bookingApi, Notification } from '../../api/bookingApi';

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const notificationsData = await bookingApi.getNotifications();
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('Error', 'Unable to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await bookingApi.markNotificationAsRead(notification.id);
        setNotifications(prev =>
          prev.map(n =>
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Handle navigation based on notification type
    switch (notification.type) {
      case 'booking':
        navigation.navigate('MyBookings');
        break;
      case 'payment':
        navigation.navigate('MyBookings');
        break;
      case 'promotion':
        navigation.navigate('PanditList');
        break;
      default:
        break;
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true);
      await bookingApi.markAllNotificationsAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      Alert.alert('Error', 'Unable to mark all as read');
    } finally {
      setMarkingAll(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return 'event';
      case 'payment':
        return 'payment';
      case 'promotion':
        return 'campaign';
      case 'system':
        return 'info';
      default:
        return 'notifications';
    }
  };

  const getNotificationIconColor = (type: string) => {
    switch (type) {
      case 'booking':
        return '#4CAF50';
      case 'payment':
        return '#2196F3';
      case 'promotion':
        return '#FF9800';
      case 'system':
        return '#9E9E9E';
      default:
        return colors.primary;
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.isRead && styles.unreadNotification,
      ]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={[
        styles.notificationIcon,
        { backgroundColor: getNotificationIconColor(item.type) + '15' }
      ]}>
        <Icon
          name={getNotificationIcon(item.type)}
          size={20}
          color={getNotificationIconColor(item.type)}
        />
      </View>
      
      <View style={styles.notificationContent}>
        <Text style={[
          styles.notificationTitle,
          !item.isRead && styles.unreadTitle,
        ]}>
          {item.title}
        </Text>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={styles.notificationTime}>{item.time}</Text>
      </View>
      
      {!item.isRead && (
        <View style={styles.unreadDot} />
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="notifications-none" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyText}>No notifications</Text>
      <Text style={styles.emptySubtext}>
        You're all caught up! Check back later for updates.
      </Text>
    </View>
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
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
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.unreadCountBadge}>
            <Text style={styles.unreadCountText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {/* Mark All as Read Button */}
      {unreadCount > 0 && (
        <View style={styles.markAllContainer}>
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={handleMarkAllAsRead}
            disabled={markingAll}
            activeOpacity={0.8}
          >
            {markingAll ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={styles.markAllButtonText}>Mark All as Read</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
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
  unreadCountBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  unreadCountText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  markAllContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  markAllButton: {
    alignSelf: 'flex-end',
  },
  markAllButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadNotification: {
    backgroundColor: '#FFF8F3',
    borderWidth: 1,
    borderColor: '#FF6B3530',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  unreadTitle: {
    color: '#FF6B35',
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B35',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default NotificationsScreen;
