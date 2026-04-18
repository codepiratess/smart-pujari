import messaging from '@react-native-firebase/messaging';
import notifee, { 
  AndroidImportance, 
  AndroidStyle, 
  TriggerType,
  Trigger 
} from '@notifee/react-native';
import { apiClient } from '../api/apiClient';

export class NotificationService {
  private static instance: NotificationService;
  private fcmToken: string | null = null;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermission(): Promise<boolean> {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      console.log('Permission status:', authStatus);
      return enabled;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  }

  async getFCMToken(): Promise<string | null> {
    try {
      if (!this.fcmToken) {
        this.fcmToken = await messaging().getToken();
        console.log('FCM Token:', this.fcmToken);
        
        // Send token to backend
        await this.sendTokenToBackend(this.fcmToken);
      }
      return this.fcmToken;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  private async sendTokenToBackend(token: string): Promise<void> {
    try {
      await apiClient.post('/api/device-token', { token });
      console.log('Token sent to backend successfully');
    } catch (error) {
      console.error('Error sending token to backend:', error);
    }
  }

  async initialize(): Promise<void> {
    try {
      // Request permission
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        console.log('User denied notification permission');
        return;
      }

      // Get FCM token
      await this.getFCMToken();

      // Set up foreground message handler
      this.setupForegroundMessageHandler();

      // Set up background message handler
      this.setupBackgroundMessageHandler();

      // Set up notification channels
      await this.createNotificationChannels();

      console.log('Notification service initialized successfully');
    } catch (error) {
      console.error('Error initializing notification service:', error);
    }
  }

  private setupForegroundMessageHandler(): void {
    messaging().onMessage(async remoteMessage => {
      console.log('Received foreground message:', remoteMessage);
      
      // Display notification using Notifee
      await this.displayNotification(remoteMessage);
    });
  }

  private setupBackgroundMessageHandler(): void {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Received background message:', remoteMessage);
      
      // Display notification using Notifee
      await this.displayNotification(remoteMessage);
    });
  }

  private async createNotificationChannels(): Promise<void> {
    // Create booking updates channel
    await notifee.createChannel({
      id: 'booking_updates',
      name: 'Booking Updates',
      description: 'Notifications about your booking status',
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });

    // Create payment notifications channel
    await notifee.createChannel({
      id: 'payment_notifications',
      name: 'Payment Notifications',
      description: 'Payment confirmations and updates',
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });

    // Create review reminders channel
    await notifee.createChannel({
      id: 'review_reminders',
      name: 'Review Reminders',
      description: 'Reminders to rate your experience',
      importance: AndroidImportance.DEFAULT,
      sound: 'default',
    });

    // Create admin announcements channel
    await notifee.createChannel({
      id: 'admin_announcements',
      name: 'Admin Announcements',
      description: 'Important announcements from SmartPujari',
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });
  }

  private async displayNotification(remoteMessage: any): Promise<void> {
    const { notification, data } = remoteMessage;
    
    if (!notification) return;

    const channelId = this.getChannelId(data?.type || 'booking_updates');
    
    await notifee.displayNotification({
      title: notification.title || 'SmartPujari',
      body: notification.body || 'You have a new notification',
      data: data || {},
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        autoCancel: true,
        largeIcon: notification.android?.imageUrl,
        style: {
          type: AndroidStyle.BIGTEXT,
          text: notification.body || '',
        },
        actions: this.getNotificationActions(data?.type),
      },
      ios: {
        categoryId: channelId,
        sound: 'default',
      },
    });
  }

  private getChannelId(type: string): string {
    switch (type) {
      case 'booking_update':
        return 'booking_updates';
      case 'payment_confirmation':
        return 'payment_notifications';
      case 'review_reminder':
        return 'review_reminders';
      case 'admin_announcement':
        return 'admin_announcements';
      default:
        return 'booking_updates';
    }
  }

  private getNotificationActions(type?: string): any[] {
    switch (type) {
      case 'booking_update':
        return [
          {
            title: 'View Booking',
            pressAction: {
              id: 'view_booking',
            },
          },
        ];
      case 'payment_confirmation':
        return [
          {
            title: 'View Details',
            pressAction: {
              id: 'view_payment',
            },
          },
        ];
      case 'review_reminder':
        return [
          {
            title: 'Rate Now',
            pressAction: {
              id: 'rate_now',
            },
          },
        ];
      default:
        return [];
    }
  }

  async scheduleNotification(
    title: string,
    body: string,
    scheduledTime: Date,
    data?: any
  ): Promise<string> {
    try {
      const channelId = this.getChannelId(data?.type);
      
      const trigger: Trigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: scheduledTime.getTime(),
        alarmManager: true,
      };

      const notificationId = await notifee.createTriggerNotification(
        {
          title,
          body,
          data: data || {},
          android: {
            channelId,
            importance: AndroidImportance.HIGH,
            autoCancel: true,
          },
        },
        trigger
      );

      console.log('Notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await notifee.cancelNotification(notificationId);
      console.log('Notification cancelled:', notificationId);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  async getBadgeCount(): Promise<number> {
    try {
      // In a real app, you'd get this from your backend
      return 0;
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  }

  async clearBadge(): Promise<void> {
    try {
      // Clear badge count
      await notifee.setBadgeCount(0);
    } catch (error) {
      console.error('Error clearing badge:', error);
    }
  }
}

export default NotificationService;
