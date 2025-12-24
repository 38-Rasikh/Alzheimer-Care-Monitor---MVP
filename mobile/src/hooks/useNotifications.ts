/**
 * useNotifications Hook
 * Manages notification permissions and listeners with navigation support
 */

import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import {
  requestNotificationPermissions,
  addNotificationResponseListener,
  addNotificationReceivedListener,
} from '../services/notifications';

export function useNotifications() {
  const navigation = useNavigation();
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);

  useEffect(() => {
    // Request permissions on mount
    requestNotificationPermissions().then(setPermissionGranted);

    // Listen for notification taps (when app is closed/background)
    const responseSubscription = addNotificationResponseListener((response) => {
      console.log('Notification tapped:', response.notification.request.content.data);
      const data = response.notification.request.content.data;
      
      // Navigate based on notification type (only if navigation is available)
      if (data?.type && navigation) {
        try {
          switch (data.type) {
            case 'alert':
            case 'wandering':
              navigation.navigate('Alerts' as never);
              break;
            case 'medication':
              navigation.navigate('Medications' as never);
              break;
            case 'recognition':
            case 'unknown_person':
              // Navigate to alerts for recognition events
              navigation.navigate('Alerts' as never);
              break;
            case 'low_battery':
              navigation.navigate('Settings' as never);
              break;
            default:
              navigation.navigate('Home' as never);
          }
        } catch (error) {
          console.warn('Navigation failed from notification:', error);
        }
      }
    });

    // Listen for notifications when app is in foreground
    const receivedSubscription = addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
      setNotification(notification);
    });

    return () => {
      responseSubscription.remove();
      receivedSubscription.remove();
    };
  }, [navigation]);

  return {
    permissionGranted,
    notification,
  };
}
