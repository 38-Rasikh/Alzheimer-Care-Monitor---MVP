import React from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Card, Text, ActivityIndicator, Button, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePatientStatus } from '../hooks/usePatientStatus';
import { useWebSocket } from '../hooks/useWebSocket';
import { SkeletonCard } from '../components/common/SkeletonCard';
import { colors, spacing } from '../theme';

const PATIENT_ID = 'p123'; // Hardcoded for MVP

export default function HomeScreen() {
  const { data: status, isLoading, error, refetch, isRefetching } = usePatientStatus(PATIENT_ID);
  const { isConnected } = useWebSocket(PATIENT_ID);

  if (isLoading) {
    return (
      <ScrollView style={styles.container}>
        <SkeletonCard lines={4} hasChips />
        <SkeletonCard lines={5} />
        <SkeletonCard lines={3} hasChips />
        <SkeletonCard lines={2} />
      </ScrollView>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={48} color={colors.error} />
        <Text style={styles.errorText}>Failed to load patient data</Text>
        <Button mode="contained" onPress={() => refetch()}>
          Retry
        </Button>
      </View>
    );
  }

  if (!status) return null;

  const getConnectionColor = () => {
    if (status.patient.connectionStatus === 'connected') return colors.success;
    if (status.patient.connectionStatus === 'weak') return colors.warning;
    return colors.error;
  };

  const getHeartRateColor = () => {
    if (status.vitals.heartRate.status === 'normal') return colors.success;
    if (status.vitals.heartRate.status === 'elevated') return colors.warning;
    return colors.error;
  };

  const getAgitationColor = () => {
    if (status.riskFlags.agitationLevel === 'none') return colors.success;
    if (status.riskFlags.agitationLevel === 'mild') return colors.warning;
    if (status.riskFlags.agitationLevel === 'moderate') return colors.error;
    return colors.critical;
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
    >
      {/* Patient Header */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.headerRow}>
            <View style={styles.patientInfo}>
              <Text variant="headlineSmall">{status.patient.patientName}</Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                {status.patient.age} years old • {status.patient.diseaseStage}
              </Text>
            </View>
            <View style={styles.statusIndicators}>
              <Chip
                mode="flat"
                icon={() => <MaterialCommunityIcons name="circle" size={12} color={getConnectionColor()} />}
                style={styles.chip}
              >
                {status.patient.connectionStatus}
              </Chip>
              {isConnected && (
                <Chip
                  mode="flat"
                  icon={() => <MaterialCommunityIcons name="wifi" size={12} color={colors.success} />}
                  style={[styles.chip, { marginLeft: spacing.xs }]}
                >
                  Live
                </Chip>
              )}
            </View>
          </View>

          <View style={styles.headerRow}>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="battery" size={20} color={colors.textSecondary} />
              <Text variant="bodyMedium"> {status.patient.batteryLevel}%</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="map-marker" size={20} color={colors.textSecondary} />
              <Text variant="bodyMedium"> {status.location.room || 'Unknown'}</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons
                name={status.location.isInSafeZone ? 'check-circle' : 'alert-circle'}
                size={20}
                color={status.location.isInSafeZone ? colors.success : colors.error}
              />
              <Text variant="bodyMedium"> {status.location.isInSafeZone ? 'Safe Zone' : 'Outside Zone'}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Vitals Section */}
      <Card style={styles.card}>
        <Card.Title title="Vitals" titleVariant="titleLarge" />
        <Card.Content>
          <View style={styles.vitalsGrid}>
            <View style={styles.vitalCard}>
              <MaterialCommunityIcons name="heart-pulse" size={32} color={getHeartRateColor()} />
              <Text variant="titleLarge" style={styles.vitalValue}>
                {status.vitals.heartRate.current}
              </Text>
              <Text variant="bodySmall" style={styles.vitalLabel}>
                bpm
              </Text>
              <Chip
                mode="flat"
                style={[styles.statusChip, { backgroundColor: getHeartRateColor() + '20' }]}
                textStyle={{ color: getHeartRateColor() }}
              >
                {status.vitals.heartRate.status}
              </Chip>
            </View>

            <View style={styles.vitalCard}>
              <MaterialCommunityIcons name="walk" size={32} color={colors.primary} />
              <Text variant="titleLarge" style={styles.vitalValue}>
                {status.vitals.stepsToday}
              </Text>
              <Text variant="bodySmall" style={styles.vitalLabel}>
                steps today
              </Text>
              <Chip mode="flat" style={styles.statusChip}>
                {status.vitals.activityLevel}
              </Chip>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Risk Flags Section */}
      <Card style={styles.card}>
        <Card.Title title="Risk Flags" titleVariant="titleLarge" />
        <Card.Content>
          <View style={styles.riskItem}>
            <MaterialCommunityIcons
              name={status.riskFlags.fallRisk ? 'alert' : 'check'}
              size={24}
              color={status.riskFlags.fallRisk ? colors.warning : colors.success}
            />
            <Text variant="bodyLarge" style={styles.riskText}>
              {status.riskFlags.fallRisk ? 'Fall Risk Detected' : 'No Fall Risk'}
            </Text>
          </View>

          <View style={styles.riskItem}>
            <MaterialCommunityIcons
              name={status.riskFlags.wanderingDetected ? 'alert' : 'check'}
              size={24}
              color={status.riskFlags.wanderingDetected ? colors.error : colors.success}
            />
            <Text variant="bodyLarge" style={styles.riskText}>
              {status.riskFlags.wanderingDetected ? 'Wandering Detected' : 'In Safe Zone'}
            </Text>
          </View>

          <View style={styles.riskItem}>
            <MaterialCommunityIcons
              name={status.riskFlags.agitationLevel !== 'none' ? 'alert' : 'check'}
              size={24}
              color={getAgitationColor()}
            />
            <Text variant="bodyLarge" style={styles.riskText}>
              Agitation: {status.riskFlags.agitationLevel}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.bottomSpacer} />
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  patientInfo: {
    flex: 1,
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statusIndicators: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    height: 28,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vitalsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: spacing.md,
  },
  vitalCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  vitalValue: {
    marginTop: spacing.sm,
    fontWeight: 'bold',
  },
  vitalLabel: {
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  statusChip: {
    marginTop: spacing.xs,
  },
  riskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  riskText: {
    flex: 1,
  },
  bottomSpacer: {
    height: spacing.lg,
  },
});
