import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../state/AuthContext';
import { patientApi } from '../../services/api';
import { usePolling } from '../../hooks/usePolling';
import { colors, spacing } from '../../theme';

interface TimelineItem {
  id: string;
  time: string;
  label: string;
  category: string;
  duration: number;
  status: 'completed' | 'pending' | 'acknowledged' | 'missed';
  completed: boolean;
  acknowledged: boolean;
  timestamp: string;
}

interface TimelineData {
  patientId: string;
  date: string;
  timeline: TimelineItem[];
  totalTasks: number;
  completed: number;
  pending: number;
  missed: number;
}

export default function PatientTimelineScreen() {
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeline = useCallback(async () => {
    if (!user?.id) return;

    try {
      setError(null);
      const data = await patientApi.getTimeline(user.id);
      setTimelineData(data);
    } catch (err) {
      console.error('Error fetching timeline:', err);
      setError('Unable to load your schedule');
      throw err; // Re-throw for polling hook
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Use polling hook for automatic updates
  const { isPolling, retryCount, isOnline } = usePolling(
    fetchTimeline,
    {
      interval: 30000, // 30 seconds
      enabled: !!user?.id,
      onError: (err) => {
        console.warn('Timeline polling error:', err.message);
      },
    }
  );

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchTimeline();
    setIsRefreshing(false);
  };

  const handleAcknowledge = async (taskId: string) => {
    if (!user?.id) return;
    
    try {
      await patientApi.acknowledgeTask(user.id, taskId, false);
      await fetchTimeline(); // Refresh after acknowledging
    } catch (err) {
      console.error('Error acknowledging task:', err);
    }
  };

  const handleComplete = async (taskId: string) => {
    if (!user?.id) return;
    
    try {
      await patientApi.acknowledgeTask(user.id, taskId, true);
      await fetchTimeline(); // Refresh after completing
    } catch (err) {
      console.error('Error completing task:', err);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medication': return 'pill';
      case 'meal': return 'food';
      case 'activity': return 'walk';
      case 'therapy': return 'brain';
      case 'rest': return 'sleep';
      case 'personal': return 'account';
      default: return 'clock-outline';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'medication': return colors.error;
      case 'meal': return colors.success;
      case 'activity': return colors.secondary;
      case 'therapy': return colors.primary;
      case 'rest': return '#9C27B0';
      case 'personal': return '#FF9800';
      default: return colors.textSecondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'pending': return colors.secondary;
      case 'acknowledged': return colors.warning;
      case 'missed': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your schedule...</Text>
      </View>
    );
  }

  if (error && !timelineData) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <MaterialCommunityIcons name="alert-circle" size={64} color={colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={fetchTimeline} style={styles.retryButton}>
          Try Again
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Summary Header */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{timelineData?.completed || 0}</Text>
          <Text style={styles.summaryLabel}>Completed</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryValue, { color: colors.secondary }]}>
            {timelineData?.pending || 0}
          </Text>
          <Text style={styles.summaryLabel}>Pending</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryValue, { color: colors.error }]}>
            {timelineData?.missed || 0}
          </Text>
          <Text style={styles.summaryLabel}>Missed</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {timelineData?.timeline.map((item) => (
          <Card key={item.id} style={styles.taskCard}>
            <Card.Content>
              <View style={styles.taskHeader}>
                <View style={styles.taskTimeContainer}>
                  <MaterialCommunityIcons
                    name={getCategoryIcon(item.category) as any}
                    size={32}
                    color={getCategoryColor(item.category)}
                  />
                  <Text style={styles.taskTime}>{formatTime(item.time)}</Text>
                </View>
                <Chip
                  style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
                  textStyle={styles.statusChipText}
                >
                  {item.status}
                </Chip>
              </View>

              <Text style={styles.taskLabel}>{item.label}</Text>
              <Text style={styles.taskDuration}>{item.duration} minutes</Text>

              {/* Action Buttons for pending tasks */}
              {item.status === 'pending' && (
                <View style={styles.actionButtons}>
                  <Button
                    mode="outlined"
                    onPress={() => handleAcknowledge(item.id)}
                    style={styles.actionButton}
                    compact
                  >
                    I See This
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => handleComplete(item.id)}
                    style={styles.actionButton}
                    compact
                  >
                    Mark Done
                  </Button>
                </View>
              )}

              {/* Status icons */}
              {item.completed && (
                <View style={styles.statusIcon}>
                  <MaterialCommunityIcons name="check-circle" size={24} color={colors.success} />
                  <Text style={styles.statusText}>Completed</Text>
                </View>
              )}
              {item.acknowledged && !item.completed && (
                <View style={styles.statusIcon}>
                  <MaterialCommunityIcons name="eye-check" size={24} color={colors.warning} />
                  <Text style={styles.statusText}>Acknowledged</Text>
                </View>
              )}
            </Card.Content>
          </Card>
        ))}

        {timelineData?.timeline.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="calendar-blank" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>No tasks scheduled for today</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 18,
    color: colors.textSecondary,
  },
  errorText: {
    marginTop: spacing.md,
    fontSize: 18,
    color: colors.error,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.lg,
  },
  summaryContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: spacing.md,
    elevation: 2,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.success,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  taskCard: {
    elevation: 3,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  taskTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  taskTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  statusChip: {
    height: 28,
  },
  statusChipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  taskLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  taskDuration: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  statusIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  statusText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyStateText: {
    marginTop: spacing.md,
    fontSize: 18,
    color: colors.textSecondary,
  },
});
