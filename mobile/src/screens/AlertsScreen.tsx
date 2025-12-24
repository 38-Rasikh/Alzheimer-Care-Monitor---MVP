import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Card, Text, ActivityIndicator, Button, Chip, SegmentedButtons } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAlerts, useAcknowledgeAlert } from '../hooks/useAlerts';
import { AlertAcknowledgeDialog } from '../components/common/AlertAcknowledgeDialog';
import { SkeletonCard } from '../components/common/SkeletonCard';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { Toast } from '../components/common/Toast';
import { useHaptics } from '../hooks/useHaptics';
import { sendAlertNotification, setBadgeCount } from '../services/notifications';
import { colors, spacing } from '../theme';
import type { Alert } from '../types/alert';

const PATIENT_ID = 'p123';

export default function AlertsScreen() {
  const [filter, setFilter] = useState<'active' | 'acknowledged' | 'all'>('active');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({ visible: false, message: '', type: 'success' });
  const { data: alertsData, isLoading, error, refetch, isRefetching } = useAlerts(PATIENT_ID, filter);
  const acknowledgeMutation = useAcknowledgeAlert(PATIENT_ID);
  const haptics = useHaptics();
  const notifiedAlertsRef = useRef<Set<string>>(new Set());

  // Send notifications for new high-severity alerts
  useEffect(() => {
    if (!alertsData?.alerts) return;

    const activeAlerts = alertsData.alerts.filter(
      (alert) => alert.status === 'active' && (alert.severity === 'critical' || alert.severity === 'high')
    );

    activeAlerts.forEach((alert) => {
      if (!notifiedAlertsRef.current.has(alert.alertId)) {
        // Send notification for this new alert
        sendAlertNotification(
          alert.message,
          `Severity: ${alert.severity}`,
          alert.alertId
        );
        notifiedAlertsRef.current.add(alert.alertId);
      }
    });

    // Update badge count with active alerts
    const activeCount = alertsData.alerts.filter((a) => a.status === 'active').length;
    setBadgeCount(activeCount);
  }, [alertsData]);

  const handleAcknowledge = (alertId: string, notes: string) => {
    acknowledgeMutation.mutate({
      alertId,
      data: {
        acknowledgedBy: 'caregiver',
        actionTaken: notes || 'Acknowledged via mobile app',
      },
    }, {
      onSuccess: () => {
        haptics.trigger('success');
        setToast({ visible: true, message: 'Alert acknowledged successfully', type: 'success' });
      },
      onError: () => {
        haptics.trigger('error');
        setToast({ visible: true, message: 'Failed to acknowledge alert', type: 'error' });
      },
    });
  };

  const handleAcknowledgeClick = (alert: Alert) => {
    haptics.trigger('light');
    setSelectedAlert(alert);
    setDialogVisible(true);
  };

  const handleDialogSubmit = (data: { notes: string; timestamp: string }) => {
    if (selectedAlert) {
      handleAcknowledge(selectedAlert.alertId, data.notes);
      setDialogVisible(false);
      setSelectedAlert(null);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.filterContainer}>
          <SegmentedButtons
            value={filter}
            onValueChange={(value) => setFilter(value as 'active' | 'acknowledged' | 'all')}
            buttons={[
              { value: 'active', label: 'Active' },
              { value: 'acknowledged', label: 'Acknowledged' },
              { value: 'all', label: 'All' },
            ]}
          />
        </View>
        <ScrollView style={styles.scrollView}>
          <SkeletonCard lines={3} hasChips hasButton />
          <SkeletonCard lines={2} hasChips hasButton />
          <SkeletonCard lines={3} hasChips hasButton />
        </ScrollView>
      </View>
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

  const alerts = alertsData?.alerts || [];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return colors.critical;
      case 'high':
        return colors.high;
      case 'medium':
        return colors.medium;
      case 'low':
        return colors.low;
      default:
        return colors.textSecondary;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'alert-octagon';
      case 'high':
        return 'alert';
      case 'medium':
        return 'alert-circle';
      case 'low':
        return 'information';
      default:
        return 'bell';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'fall':
        return 'human-male-female-child';
      case 'wandering':
        return 'map-marker-alert';
      case 'medication':
        return 'pill';
      case 'vitals':
        return 'heart-pulse';
      case 'agitation':
        return 'emoticon-angry';
      case 'device':
        return 'cellphone-wireless';
      default:
        return 'bell';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const renderAlert = (alert: Alert) => {
    const severityColor = getSeverityColor(alert.severity);

    return (
      <Card key={alert.alertId} style={[styles.alertCard, { borderLeftColor: severityColor }]}>
        <Card.Content>
          <View style={styles.alertHeader}>
            <View style={styles.alertTitleRow}>
              <MaterialCommunityIcons name={getAlertIcon(alert.type)} size={24} color={severityColor} />
              <Text variant="titleMedium" style={styles.alertTitle}>
                {alert.message}
              </Text>
            </View>
            <Chip
              mode="flat"
              style={{ backgroundColor: severityColor + '20' }}
              textStyle={{ color: severityColor, fontSize: 12 }}
            >
              {alert.severity.toUpperCase()}
            </Chip>
          </View>

          <Text variant="bodySmall" style={styles.alertTime}>
            {formatTime(alert.timestamp)}
          </Text>

          {alert.details && Object.keys(alert.details).length > 0 && (
            <View style={styles.alertDetails}>
              {alert.type === 'wandering' && alert.details.location && (
                <Text variant="bodyMedium">
                  📍 {alert.details.distance}m {alert.details.direction}
                </Text>
              )}
              {alert.type === 'medication' && (
                <Text variant="bodyMedium">
                  💊 {alert.details.medicationName} {alert.details.dosage}
                </Text>
              )}
            </View>
          )}

          {!alert.acknowledged ? (
            <Button
              mode="contained"
              onPress={() => handleAcknowledgeClick(alert)}
              style={styles.acknowledgeButton}
              loading={acknowledgeMutation.isPending}
            >
              Acknowledge
            </Button>
          ) : (
            <View style={styles.acknowledgedSection}>
              <MaterialCommunityIcons name="check-circle" size={16} color={colors.success} />
              <Text variant="bodySmall" style={styles.acknowledgedText}>
                Acknowledged • {alert.actionTaken}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={filter}
          onValueChange={(value) => setFilter(value as any)}
          buttons={[
            { value: 'active', label: `Active (${alertsData?.activeCount || 0})` },
            { value: 'acknowledged', label: 'Acknowledged' },
            { value: 'all', label: `All (${alertsData?.totalCount || 0})` },
          ]}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        {alerts.length === 0 ? (
          <EmptyState
            icon="bell-off"
            title="No alerts"
            message={filter === 'active' ? 'All clear! No active alerts at the moment.' : 'No alerts found in this category.'}
          />
        ) : (
          alerts.map(renderAlert)
        )}
      </ScrollView>

      <AlertAcknowledgeDialog
        visible={dialogVisible}
        onDismiss={() => {
          setDialogVisible(false);
          setSelectedAlert(null);
        }}
        onSubmit={handleDialogSubmit}
        alertType={selectedAlert?.type || ''}
        alertMessage={selectedAlert?.message || ''}
      />

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast({ ...toast, visible: false })}
      />
    </View>
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
  filterContainer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  alertCard: {
    margin: spacing.md,
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderLeftWidth: 4,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  alertTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  alertTitle: {
    flex: 1,
  },
  alertTime: {
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  alertDetails: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  acknowledgeButton: {
    marginTop: spacing.sm,
  },
  acknowledgedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.success + '10',
    borderRadius: 8,
  },
  acknowledgedText: {
    color: colors.textSecondary,
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xxl,
  },
  emptyText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
  },
  emptySubtext: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
  },
});
