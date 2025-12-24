/**
 * Notification Service
 * Handles push notifications for alerts, reminders, and recognition events
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationConfig {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: boolean;
  badge?: number;
  categoryIdentifier?: string;
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Notification permissions not granted');
      return false;
    }

    // For Android, create notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('alerts', {
        name: 'Patient Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF0000',
      });

      await Notifications.setNotificationChannelAsync('reminders', {
        name: 'Medication Reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('recognition', {
        name: 'Recognition Events',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Schedule a local notification
 */
export async function scheduleNotification(
  config: NotificationConfig,
  trigger?: Notifications.NotificationTriggerInput
): Promise<string> {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: config.title,
        body: config.body,
        data: config.data || {},
        sound: config.sound !== false,
        badge: config.badge,
        categoryIdentifier: config.categoryIdentifier,
      },
      trigger: trigger || null, // null = immediate
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    throw error;
  }
}

/**
 * Send immediate notification
 */
export async function sendNotification(config: NotificationConfig): Promise<string> {
  return scheduleNotification(config, null);
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

/**
 * Cancel all notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get badge count
 */
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

/**
 * Set badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Clear badge
 */
export async function clearBadge(): Promise<void> {
  await Notifications.setBadgeCountAsync(0);
}

/**
 * Alert notification (high priority)
 */
export async function sendAlertNotification(
  title: string,
  body: string,
  alertId?: string
): Promise<string> {
  return sendNotification({
    title,
    body,
    data: { type: 'alert', alertId },
    sound: true,
    categoryIdentifier: 'alerts',
  });
}

/**
 * Medication reminder notification
 */
export async function sendMedicationReminder(
  medicationName: string,
  time: string,
  medicationId?: string
): Promise<string> {
  return sendNotification({
    title: 'Medication Reminder',
    body: `Time to take ${medicationName} at ${time}`,
    data: { type: 'medication', medicationId, medicationName },
    sound: true,
    categoryIdentifier: 'reminders',
  });
}

/**
 * Recognition event notification
 */
export async function sendRecognitionNotification(
  type: 'face' | 'voice',
  personName: string,
  matched: boolean
): Promise<string> {
  const title = matched ? `${type === 'face' ? 'Face' : 'Voice'} Recognized` : 'Unknown Person Detected';
  const body = matched 
    ? `${personName} has been detected`
    : `An unknown person has been detected`;

  return sendNotification({
    title,
    body,
    data: { type: 'recognition', recognitionType: type, personName, matched },
    sound: !matched, // Only sound for unknown people
    categoryIdentifier: 'recognition',
  });
}

/**
 * Wandering alert notification
 */
export async function sendWanderingAlert(
  patientName: string,
  location: string
): Promise<string> {
  return sendNotification({
    title: '⚠️ Wandering Alert',
    body: `${patientName} has left the safe zone. Last seen: ${location}`,
    data: { type: 'wandering', location },
    sound: true,
    categoryIdentifier: 'alerts',
  });
}

/**
 * Low battery notification
 */
export async function sendLowBatteryNotification(batteryLevel: number): Promise<string> {
  return sendNotification({
    title: '🔋 Low Battery',
    body: `Device battery is at ${batteryLevel}%. Please charge soon.`,
    data: { type: 'battery', level: batteryLevel },
    sound: false,
    categoryIdentifier: 'alerts',
  });
}

/**
 * Add notification response listener
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Add notification received listener (when app is in foreground)
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}
