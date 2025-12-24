import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Card, Text, ActivityIndicator, Button, Chip, FAB } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useBehaviors, useLogBehavior } from '../hooks/useBehaviors';
import { BehaviorLogDialog } from '../components/common/BehaviorLogDialog';
import { SkeletonCard } from '../components/common/SkeletonCard';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { Toast } from '../components/common/Toast';
import { colors, spacing } from '../theme';

const PATIENT_ID = 'p123';

export default function BehaviorLogsScreen() {
  const { data: behaviorsData, isLoading, error, refetch, isRefetching } = useBehaviors(PATIENT_ID);
  const logBehavior = useLogBehavior(PATIENT_ID);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({ visible: false, message: '', type: 'success' });

  if (isLoading) {
    return (
      <ScrollView style={styles.container}>
        <SkeletonCard lines={2} hasChips />
        <SkeletonCard lines={4} hasChips />
        <SkeletonCard lines={3} hasChips />
        <SkeletonCard lines={4} hasChips />
      </ScrollView>
    );
  }

  if (error) {
    return (
      <ErrorState
        type="network"
        onRetry={() => refetch()}
      />
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'agitation':
        return 'emoticon-angry';
      case 'confusion':
        return 'head-question';
      case 'wandering':
        return 'walk';
      case 'sleep-disruption':
        return 'sleep-off';
      case 'repetitive':
        return 'repeat';
      default:
        return 'note';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'agitation':
        return colors.error;
      case 'confusion':
        return colors.warning;
      case 'wandering':
        return colors.high;
      case 'sleep-disruption':
        return colors.info;
      default:
        return colors.textSecondary;
    }
  };

  const handleLogBehavior = (data: any) => {
    logBehavior.mutate(data, {
      onSuccess: () => {
        setToast({ visible: true, message: 'Behavior logged successfully', type: 'success' });
        setDialogVisible(false);
      },
      onError: () => {
        setToast({ visible: true, message: 'Failed to log behavior', type: 'error' });
      },
    });
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
    >
      {/* Summary Card */}
      <Card style={styles.card}>
        <Card.Title title="Weekly Summary" titleVariant="titleLarge" />
        <Card.Content>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text variant="headlineMedium">{behaviorsData?.totalEvents || 0}</Text>
              <Text variant="bodyMedium" style={styles.summaryLabel}>
                Total Events
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text variant="headlineMedium">2.1</Text>
              <Text variant="bodyMedium" style={styles.summaryLabel}>
                Avg/Day
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text variant="headlineMedium">6-8 PM</Text>
              <Text variant="bodyMedium" style={styles.summaryLabel}>
                Peak Time
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Empty State */}
      {(!behaviorsData?.events || behaviorsData.events.length === 0) ? (
        <EmptyState
          icon="notebook-outline"
          title="No Behavior Events"
          message="Behavior events will appear here once logged. Use the button below to log a new event."
          actionLabel="Log New Event"
          onAction={() => setDialogVisible(true)}
        />
      ) : (
        <>
          {/* Event List */}
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Recent Events
          </Text>

      {/* Sample event cards */}
      <Card style={styles.eventCard}>
        <Card.Content>
          <View style={styles.eventHeader}>
            <View style={styles.eventTitleRow}>
              <MaterialCommunityIcons
                name={getTypeIcon('agitation')}
                size={24}
                color={getTypeColor('agitation')}
              />
              <Text variant="titleMedium">Agitation Episode</Text>
            </View>
            <Chip mode="flat" style={styles.severityChip}>
              Moderate
            </Chip>
          </View>

          <Text variant="bodySmall" style={styles.eventTime}>
            Today at 2:30 PM • 15 minutes
          </Text>

          <View style={styles.eventDetails}>
            <View style={styles.detailRow}>
              <Text variant="bodySmall" style={styles.detailLabel}>
                Triggers:
              </Text>
              <Text variant="bodySmall">Noise, visitor</Text>
            </View>
            <View style={styles.detailRow}>
              <Text variant="bodySmall" style={styles.detailLabel}>
                Response:
              </Text>
              <Text variant="bodySmall">Redirected to quiet room</Text>
            </View>
          </View>

          <Text variant="bodySmall" style={styles.notes}>
            Note: Patient calmed down after 15 minutes in quiet environment. Consider limiting visitors
            during afternoon hours.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.eventCard}>
        <Card.Content>
          <View style={styles.eventHeader}>
            <View style={styles.eventTitleRow}>
              <MaterialCommunityIcons
                name={getTypeIcon('wandering')}
                size={24}
                color={getTypeColor('wandering')}
              />
              <Text variant="titleMedium">Wandering Episode</Text>
            </View>
            <Chip mode="flat" style={styles.severityChip}>
              Mild
            </Chip>
          </View>

          <Text variant="bodySmall" style={styles.eventTime}>
            Today at 10:30 AM • 10 minutes
          </Text>

          <View style={styles.eventDetails}>
            <View style={styles.detailRow}>
              <Text variant="bodySmall" style={styles.detailLabel}>
                Location:
              </Text>
              <Text variant="bodySmall">Near front door</Text>
            </View>
            <View style={styles.detailRow}>
              <Text variant="bodySmall" style={styles.detailLabel}>
                Response:
              </Text>
              <Text variant="bodySmall">Guided back to living room</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
        </>
      )}

      <View style={styles.bottomSpacer} />
      
      <BehaviorLogDialog
        visible={dialogVisible}
        onDismiss={() => setDialogVisible(false)}
        onSubmit={handleLogBehavior}
      />
      
      <FAB
        icon="plus"
        label="Log Event"
        style={styles.fab}
        onPress={() => setDialogVisible(true)}
      />

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast({ ...toast, visible: false })}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  errorText: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    color: colors.error,
    fontSize: 16,
  },
  card: {
    margin: spacing.md,
    backgroundColor: colors.surface,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  emptyText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
  },
  emptySubtext: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  addButton: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    marginTop: spacing.lg,
    marginLeft: spacing.md,
    marginBottom: spacing.sm,
  },
  eventCard: {
    margin: spacing.md,
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  eventTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  severityChip: {
    height: 28,
  },
  eventTime: {
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  eventDetails: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: spacing.xs,
  },
  detailLabel: {
    fontWeight: '600',
    marginRight: spacing.xs,
    width: 80,
  },
  notes: {
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  bottomSpacer: {
    height: spacing.lg,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
  },
});
