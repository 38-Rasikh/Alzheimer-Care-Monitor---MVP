import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Chip, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { colors, spacing } from '../../theme';
import { useAuth } from '../../state/AuthContext';
import { apiClient } from '../../services/api/client';

type ReminderType = 'medication' | 'hydration' | 'meal' | 'activity' | 'orientation' | 'appointment';
type ReminderStatus = 'pending' | 'acknowledged' | 'snoozed' | 'missed' | 'completed';

interface Reminder {
  id: string;
  patientId: string;
  type: ReminderType;
  title: string;
  message: string;
  scheduledTime: string;
  status: ReminderStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  snoozedUntil?: string;
  acknowledgedAt?: string;
  completedAt?: string;
}

const reminderIcons: Record<ReminderType, string> = {
  medication: 'pill',
  hydration: 'water',
  meal: 'silverware-fork-knife',
  activity: 'walk',
  orientation: 'compass',
  appointment: 'calendar-clock',
};

const reminderColors: Record<string, string> = {
  critical: colors.error,
  high: colors.warning,
  medium: colors.primary,
  low: colors.info,
};

export default function RemindersScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data: remindersData, isLoading, refetch } = useQuery({
    queryKey: ['reminders', user?.id],
    queryFn: async () => {
      const response = await apiClient.get(
        `/api/patient/${user?.id}/reminders?upcoming=true&hours=24`
      );
      return response.data;
    },
    enabled: !!user?.id && user?.role === 'patient',
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      const response = await apiClient.post(
        `/api/patient/${user?.id}/reminders/${reminderId}/acknowledge`,
        { acknowledgedBy: user?.id }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', user?.id] });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      const response = await apiClient.post(
        `/api/patient/${user?.id}/reminders/${reminderId}/complete`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', user?.id] });
    },
  });

  const snoozeMutation = useMutation({
    mutationFn: async ({ reminderId, minutes }: { reminderId: string; minutes: number }) => {
      const response = await apiClient.post(
        `/api/patient/${user?.id}/reminders/${reminderId}/snooze`,
        { minutes }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', user?.id] });
    },
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const formatTime = (isoTime: string) => {
    const date = new Date(isoTime);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getTimeUntil = (isoTime: string) => {
    const now = new Date();
    const scheduled = new Date(isoTime);
    const diffMs = scheduled.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);

    if (diffMins < 0) return 'Overdue';
    if (diffMins === 0) return 'Now';
    if (diffMins < 60) return `in ${diffMins} min`;
    const hours = Math.floor(diffMins / 60);
    return `in ${hours} hour${hours !== 1 ? 's' : ''}`;
  };

  const reminders: Reminder[] = remindersData?.reminders || [];
  const pendingReminders = reminders.filter(r => r.status === 'pending' || r.status === 'snoozed');
  const acknowledgedReminders = reminders.filter(r => r.status === 'acknowledged');

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading reminders...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="bell-ring" size={48} color={colors.primary} />
        <Text style={styles.headerTitle}>Your Reminders</Text>
        <Text style={styles.headerSubtitle}>
          {pendingReminders.length > 0
            ? `You have ${pendingReminders.length} reminder${pendingReminders.length !== 1 ? 's' : ''}`
            : 'All caught up! ✓'}
        </Text>
      </View>

      {/* Pending Reminders */}
      {pendingReminders.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming</Text>
          {pendingReminders.map((reminder) => (
            <Card key={reminder.id} style={styles.reminderCard} elevation={3}>
              <Card.Content style={styles.cardContent}>
                {/* Icon and Priority */}
                <View style={styles.iconSection}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: reminderColors[reminder.priority] + '20' },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={reminderIcons[reminder.type] as any}
                      size={40}
                      color={reminderColors[reminder.priority]}
                    />
                  </View>
                </View>

                {/* Content */}
                <View style={styles.contentSection}>
                  <View style={styles.titleRow}>
                    <Text style={styles.reminderTitle}>{reminder.title}</Text>
                    {reminder.status === 'snoozed' && (
                      <Chip mode="outlined" compact textStyle={styles.chipText}>
                        Snoozed
                      </Chip>
                    )}
                  </View>

                  <Text style={styles.reminderMessage}>{reminder.message}</Text>

                  <View style={styles.timeRow}>
                    <MaterialCommunityIcons name="clock-outline" size={18} color={colors.textSecondary} />
                    <Text style={styles.timeText}>
                      {formatTime(reminder.snoozedUntil || reminder.scheduledTime)} •{' '}
                      {getTimeUntil(reminder.snoozedUntil || reminder.scheduledTime)}
                    </Text>
                  </View>

                  {/* Actions */}
                  <View style={styles.actionsRow}>
                    <Button
                      mode="contained"
                      onPress={() => completeMutation.mutate(reminder.id)}
                      style={styles.actionButton}
                      labelStyle={styles.actionButtonLabel}
                      disabled={completeMutation.isPending}
                    >
                      ✓ Done
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={() => acknowledgeMutation.mutate(reminder.id)}
                      style={styles.actionButton}
                      labelStyle={styles.actionButtonLabel}
                      disabled={acknowledgeMutation.isPending}
                    >
                      OK
                    </Button>
                    <IconButton
                      icon="clock-plus"
                      size={24}
                      onPress={() => snoozeMutation.mutate({ reminderId: reminder.id, minutes: 15 })}
                      disabled={snoozeMutation.isPending}
                      style={styles.snoozeButton}
                    />
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      )}

      {/* Acknowledged Reminders */}
      {acknowledgedReminders.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acknowledged</Text>
          {acknowledgedReminders.map((reminder) => (
            <Card key={reminder.id} style={styles.acknowledgedCard} elevation={1}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.iconSection}>
                  <View style={[styles.iconContainer, styles.acknowledgedIcon]}>
                    <MaterialCommunityIcons
                      name={reminderIcons[reminder.type] as any}
                      size={32}
                      color={colors.textSecondary}
                    />
                  </View>
                </View>

                <View style={styles.contentSection}>
                  <Text style={styles.acknowledgedTitle}>{reminder.title}</Text>
                  <Text style={styles.acknowledgedTime}>
                    {formatTime(reminder.scheduledTime)}
                  </Text>
                  <Button
                    mode="text"
                    onPress={() => completeMutation.mutate(reminder.id)}
                    compact
                    labelStyle={styles.completeLabel}
                  >
                    Mark as Done
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      )}

      {/* Empty State */}
      {reminders.length === 0 && (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="bell-off" size={80} color={colors.textSecondary} />
          <Text style={styles.emptyText}>No reminders for the next 24 hours</Text>
          <Text style={styles.emptySubtext}>Enjoy your day!</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.lg,
    gap: spacing.xl,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  loadingText: {
    fontSize: 18,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  header: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  reminderCard: {
    backgroundColor: colors.surface,
  },
  acknowledgedCard: {
    backgroundColor: colors.surface,
    opacity: 0.8,
  },
  cardContent: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  iconSection: {
    justifyContent: 'flex-start',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acknowledgedIcon: {
    backgroundColor: colors.border,
  },
  contentSection: {
    flex: 1,
    gap: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  chipText: {
    fontSize: 12,
  },
  reminderMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  timeText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonLabel: {
    fontSize: 16,
  },
  snoozeButton: {
    margin: 0,
  },
  acknowledgedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  acknowledgedTime: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  completeLabel: {
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
