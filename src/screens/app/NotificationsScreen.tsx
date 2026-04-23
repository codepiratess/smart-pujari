import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
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
import { notificationApi, Notification } from '../../api/notificationApi';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso: string): string => {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
};

const getIconForType = (
  type: string,
): { icon: string; bg: string; color: string } => {
  switch (type) {
    case 'booking':
      return { icon: 'event', bg: '#e8eaf6', color: '#5c6bc0' };
    case 'payment':
      return { icon: 'payment', bg: '#e3f2fd', color: '#1e88e5' };
    case 'promo':
      return { icon: 'campaign', bg: '#fff3e0', color: '#fb8c00' };
    case 'system':
      return { icon: 'info', bg: '#f3f4f6', color: '#6b7280' };
    default:
      return { icon: 'notifications', bg: '#e8eaf6', color: '#5c6bc0' };
  }
};

// ─── Screen ───────────────────────────────────────────────────────────────────

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationApi.getAll();
      setNotifications(data);
    } catch (err) {
      console.error('fetchNotifications error:', err);
      Alert.alert('Error', 'Unable to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const handlePress = async (item: Notification) => {
    // Optimistic read
    if (!item.is_read) {
      setNotifications(prev =>
        prev.map(n => (n.id === item.id ? { ...n, is_read: true } : n)),
      );
      try {
        await notificationApi.markAsRead(item.id);
      } catch {}
    }
    // Navigate based on type
    if (item.type === 'booking' || item.type === 'payment') {
      navigation.navigate('MyBookings');
    }
  };

  const handleMarkAll = async () => {
    try {
      setMarkingAll(true);
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {
      Alert.alert('Error', 'Unable to mark all as read');
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // ── Render item ──
  const renderItem = useCallback(({ item }: { item: Notification }) => {
    const { icon, bg, color } = getIconForType(item.type);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handlePress(item)}
        activeOpacity={0.75}
      >
        {/* Icon circle */}
        <View style={[styles.iconCircle, { backgroundColor: bg }]}>
          <Icon name={icon} size={22} color={color} />
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardMessage} numberOfLines={2}>
            {item.message}
          </Text>

          {/* Meta row — pooja name + date if available */}
          {item.meta?.pooja_name && (
            <Text style={styles.cardMeta} numberOfLines={1}>
              {item.meta.pooja_name}
              {item.meta.date ? `  ·  ${item.meta.date}` : ''}
            </Text>
          )}

          <Text style={styles.cardTime}>{formatDate(item.created_at)}</Text>
        </View>

        {/* Unread dot */}
        {!item.is_read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  }, []);

  // ── Empty state ──
  const renderEmpty = () => (
    <View style={styles.emptyBox}>
      <Icon name="notifications-none" size={64} color="#d1d5db" />
      <Text style={styles.emptyTitle}>No notifications yet</Text>
      <Text style={styles.emptySub}>
        You're all caught up! Check back later.
      </Text>
    </View>
  );

  // ── Loading ──
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notifications</Text>

        {/* Mark-all-read double-tick icon (visible when unread exist) */}
        {unreadCount > 0 ? (
          <TouchableOpacity
            style={styles.markAllIconBtn}
            onPress={handleMarkAll}
            disabled={markingAll}
          >
            {markingAll ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Icon name="done-all" size={22} color={colors.primary} />
            )}
          </TouchableOpacity>
        ) : (
          <View style={{ width: 38 }} />
        )}
      </View>

      {/* ── List ── */}
      <FlatList
        data={notifications}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backBtn: { padding: 7, borderRadius: 20 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  markAllIconBtn: { padding: 7 },

  // List
  listContent: { padding: 16, paddingBottom: 32 },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    flexShrink: 0,
  },
  cardContent: { flex: 1 },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 3,
  },
  cardMessage: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 19,
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 11,
    fontWeight: '600',
    color: '#f97316',
    marginBottom: 4,
  },
  cardTime: {
    fontSize: 11,
    color: '#9ca3af',
  },

  // Unread dot
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#f97316',
    marginTop: 4,
    marginLeft: 8,
    flexShrink: 0,
  },

  // Empty
  emptyBox: {
    paddingTop: 80,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#374151' },
  emptySub: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default NotificationsScreen;
