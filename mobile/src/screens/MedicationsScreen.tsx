import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Card, Text, ActivityIndicator, Button, ProgressBar, Chip, FAB } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMedications, useLogMedication } from '../hooks/useMedications';
import { MedicationLogDialog } from '../components/common/MedicationLogDialog';
import { SkeletonCard } from '../components/common/SkeletonCard';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { Toast } from '../components/common/Toast';
import { colors, spacing } from '../theme';

const PATIENT_ID = 'p123';

export default function MedicationsScreen() {
  const { data: medsData, isLoading, error, refetch, isRefetching } = useMedications(PATIENT_ID);
  const logMedication = useLogMedication(PATIENT_ID);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({ visible: false, message: '', type: 'success' });

  if (isLoading) {
    return (
      <ScrollView style={styles.container}>
        <SkeletonCard lines={2} />
        <SkeletonCard lines={3} hasChips />
        <SkeletonCard lines={3} hasChips />
        <SkeletonCard lines={3} hasChips />
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

  const getAdherenceColor = (rate: number) => {
    if (rate >= 95) return colors.success;
    if (rate >= 85) return colors.warning;
    return colors.error;
  };

  const handleLogMedication = (data: any) => {
    logMedication.mutate({
      medicationId: data.medicationId,
      data: {
        status: data.status,
        notes: data.notes,
        timestamp: data.timestamp,
      },
    }, {
      onSuccess: () => {
        setToast({ visible: true, message: 'Medication logged successfully', type: 'success' });
        setDialogVisible(false);
      },
      onError: () => {
        setToast({ visible: true, message: 'Failed to log medication', type: 'error' });
      },
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
    >
      {/* Adherence Summary */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.summaryHeader}>
            <Text variant="titleLarge">Weekly Adherence</Text>
            <Text variant="headlineMedium" style={{ color: getAdherenceColor(medsData?.adherenceRate || 0) }}>
              {medsData?.adherenceRate.toFixed(1)}%
            </Text>
          </View>
          <ProgressBar
            progress={(medsData?.adherenceRate || 0) / 100}
            color={getAdherenceColor(medsData?.adherenceRate || 0)}
            style={styles.progressBar}
          />
          <Text variant="bodyMedium" style={styles.missedText}>
            {medsData?.missedDoses7Days || 0} missed doses in the last 7 days
          </Text>
        </Card.Content>
      </Card>

      {/* Today's Schedule */}
      <Card style={styles.card}>
        <Card.Title title="Today's Schedule" titleVariant="titleLarge" />
        <Card.Content>
          {medsData?.medications.map((med) =>
            med.scheduledTimes.map((time, index) => {
              const isPast = new Date().getHours() > parseInt(time.split(':')[0]);
              const isCurrent =
                new Date().getHours() === parseInt(time.split(':')[0]) &&
                new Date().getMinutes() < parseInt(time.split(':')[1]) + 30;

              return (
                <View key={`${med.medicationId}-${index}`} style={styles.scheduleItem}>
                  <View style={styles.timeColumn}>
                    <Text variant="titleMedium">{formatTime(time)}</Text>
                    {isPast && (
                      <MaterialCommunityIcons name="check-circle" size={20} color={colors.success} />
                    )}
                    {isCurrent && (
                      <MaterialCommunityIcons name="clock-alert" size={20} color={colors.warning} />
                    )}
                  </View>
                  <View style={styles.medColumn}>
                    <Text variant="titleMedium">{med.name}</Text>
                    <Text variant="bodyMedium" style={styles.dosageText}>
                      {med.dosage}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </Card.Content>
      </Card>

      {/* Medication List */}
      <Text variant="titleLarge" style={styles.sectionTitle}>
        All Medications
      </Text>

      {medsData?.medications && medsData.medications.length > 0 ? (
        medsData.medications.map((med) => (
        <Card key={med.medicationId} style={styles.medCard}>
          <Card.Content>
            <View style={styles.medHeader}>
              <View style={styles.medInfo}>
                <MaterialCommunityIcons name="pill" size={24} color={colors.primary} />
                <View style={styles.medDetails}>
                  <Text variant="titleMedium">{med.name}</Text>
                  <Text variant="bodyMedium" style={styles.subtitle}>
                    {med.dosage} • {med.frequency}
                  </Text>
                </View>
              </View>
              <Chip
                mode="flat"
                style={{ backgroundColor: getAdherenceColor(med.adherenceRate) + '20' }}
                textStyle={{ color: getAdherenceColor(med.adherenceRate) }}
              >
                {med.adherenceRate}%
              </Chip>
            </View>

            <View style={styles.scheduleInfo}>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="clock" size={16} color={colors.textSecondary} />
                <Text variant="bodySmall" style={styles.infoText}>
                  {med.scheduledTimes.map(formatTime).join(', ')}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="calendar-check" size={16} color={colors.textSecondary} />
                <Text variant="bodySmall" style={styles.infoText}>
                  Last taken: {med.lastTaken ? new Date(med.lastTaken).toLocaleString() : 'Never'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="calendar-clock" size={16} color={colors.textSecondary} />
                <Text variant="bodySmall" style={styles.infoText}>
                  Next dose: {new Date(med.nextDose).toLocaleString()}
                </Text>
              </View>
              {med.missedDoses > 0 && (
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="alert-circle" size={16} color={colors.error} />
                  <Text variant="bodySmall" style={[styles.infoText, { color: colors.error }]}>
                    {med.missedDoses} missed doses recently
                  </Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>
      ))
      ) : (
        <EmptyState
          icon="pill-off"
          title="No Medications"
          message="No medications have been scheduled for this patient yet."
        />
      )}

      <View style={styles.bottomSpacer} />
      
      <MedicationLogDialog
        visible={dialogVisible}
        onDismiss={() => setDialogVisible(false)}
        onSubmit={handleLogMedication}
        medications={medsData?.medications || []}
      />
      
      <FAB
        icon="plus"
        label="Log Medication"
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
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  missedText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
  },
  scheduleItem: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  timeColumn: {
    width: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  medColumn: {
    flex: 1,
  },
  dosageText: {
    color: colors.textSecondary,
  },
  sectionTitle: {
    marginTop: spacing.lg,
    marginLeft: spacing.md,
    marginBottom: spacing.sm,
  },
  medCard: {
    margin: spacing.md,
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
  },
  medHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  medInfo: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  medDetails: {
    flex: 1,
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  scheduleInfo: {
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoText: {
    color: colors.textSecondary,
    flex: 1,
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
