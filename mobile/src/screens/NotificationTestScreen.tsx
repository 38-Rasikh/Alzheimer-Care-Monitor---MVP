/**
 * Notification Testing Screen
 * Test camera, microphone, and notification features
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Button, Text, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import {
  sendAlertNotification,
  sendMedicationReminder,
  sendRecognitionNotification,
  sendWanderingAlert,
  sendLowBatteryNotification,
  getBadgeCount,
  setBadgeCount,
  clearBadge,
} from '../services/notifications';
import { colors, spacing } from '../theme';

export function NotificationTestScreen() {
  const [badgeCount, setBadgeState] = useState(0);
  const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);

  const handleTestAlert = async () => {
    try {
      const id = await sendAlertNotification(
        'Critical Alert',
        'Patient wandering detected outside safe zone',
        'alert-001'
      );
      setLastNotificationId(id);
      Alert.alert('Success', 'Alert notification sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send notification');
    }
  };

  const handleTestMedication = async () => {
    try {
      const id = await sendMedicationReminder(
        'Aricept 10mg',
        '2:00 PM',
        'med-001'
      );
      setLastNotificationId(id);
      Alert.alert('Success', 'Medication reminder sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send notification');
    }
  };

  const handleTestFaceRecognition = async () => {
    try {
      const id = await sendRecognitionNotification(
        'face',
        'Sarah (Daughter)',
        true
      );
      setLastNotificationId(id);
      Alert.alert('Success', 'Face recognition notification sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send notification');
    }
  };

  const handleTestUnknownPerson = async () => {
    try {
      const id = await sendRecognitionNotification(
        'face',
        'Unknown',
        false
      );
      setLastNotificationId(id);
      Alert.alert('Success', 'Unknown person alert sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send notification');
    }
  };

  const handleTestWandering = async () => {
    try {
      const id = await sendWanderingAlert(
        'John Smith',
        '123 Main St, Springfield'
      );
      setLastNotificationId(id);
      Alert.alert('Success', 'Wandering alert sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send notification');
    }
  };

  const handleTestBattery = async () => {
    try {
      const id = await sendLowBatteryNotification(15);
      setLastNotificationId(id);
      Alert.alert('Success', 'Low battery notification sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send notification');
    }
  };

  const handleIncrementBadge = async () => {
    const newCount = badgeCount + 1;
    await setBadgeCount(newCount);
    setBadgeState(newCount);
  };

  const handleClearBadge = async () => {
    await clearBadge();
    setBadgeState(0);
  };

  const handleGetBadgeCount = async () => {
    const count = await getBadgeCount();
    setBadgeState(count);
    Alert.alert('Badge Count', `Current badge count: ${count}`);
  };

  const handleCancelLast = async () => {
    if (!lastNotificationId) {
      Alert.alert('No Notification', 'No notification to cancel');
      return;
    }

    try {
      await Notifications.cancelScheduledNotificationAsync(lastNotificationId);
      Alert.alert('Success', 'Last notification cancelled');
      setLastNotificationId(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel notification');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <MaterialCommunityIcons name="bell" size={32} color={colors.primary} />
            <Text variant="headlineSmall" style={styles.title}>
              Notification Testing
            </Text>
          </View>
          <Text variant="bodyMedium" style={styles.description}>
            Test different notification types and behaviors
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Alert Notifications
          </Text>
          <Button
            mode="contained"
            onPress={handleTestAlert}
            icon="alert"
            style={styles.button}
          >
            Send Critical Alert
          </Button>
          <Button
            mode="contained"
            onPress={handleTestWandering}
            icon="walk"
            style={styles.button}
          >
            Send Wandering Alert
          </Button>
          <Button
            mode="contained"
            onPress={handleTestBattery}
            icon="battery-alert"
            style={styles.button}
          >
            Send Low Battery Alert
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Recognition Notifications
          </Text>
          <Button
            mode="contained"
            onPress={handleTestFaceRecognition}
            icon="face-recognition"
            style={styles.button}
          >
            Face Recognized
          </Button>
          <Button
            mode="contained"
            onPress={handleTestUnknownPerson}
            icon="account-question"
            style={styles.button}
          >
            Unknown Person Detected
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Medication Reminders
          </Text>
          <Button
            mode="contained"
            onPress={handleTestMedication}
            icon="pill"
            style={styles.button}
          >
            Send Medication Reminder
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Badge Management
          </Text>
          <View style={styles.badgeRow}>
            <Text variant="bodyLarge">Badge Count: {badgeCount}</Text>
          </View>
          <View style={styles.buttonRow}>
            <Button
              mode="outlined"
              onPress={handleIncrementBadge}
              icon="plus"
              style={styles.smallButton}
            >
              +1
            </Button>
            <Button
              mode="outlined"
              onPress={handleGetBadgeCount}
              icon="refresh"
              style={styles.smallButton}
            >
              Get
            </Button>
            <Button
              mode="outlined"
              onPress={handleClearBadge}
              icon="close"
              style={styles.smallButton}
            >
              Clear
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Notification Management
          </Text>
          <Button
            mode="outlined"
            onPress={handleCancelLast}
            icon="cancel"
            style={styles.button}
            disabled={!lastNotificationId}
          >
            Cancel Last Notification
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.infoCard}>
        <Card.Content>
          <View style={styles.infoHeader}>
            <MaterialCommunityIcons name="information" size={20} color={colors.info} />
            <Text variant="bodySmall" style={styles.infoText}>
              Notifications appear in the device notification center. Tap them to test
              the app's response handling. Some notifications may be delayed or grouped
              by the OS.
            </Text>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    marginLeft: spacing.md,
    fontWeight: '600',
  },
  description: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  button: {
    marginBottom: spacing.sm,
  },
  badgeRow: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  infoCard: {
    backgroundColor: colors.primaryLight,
    marginBottom: spacing.lg,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    marginLeft: spacing.sm,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
});
