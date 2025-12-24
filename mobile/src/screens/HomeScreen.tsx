import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { Card, Text, ActivityIndicator, Button, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../state/AuthContext';
import { caregiverApi } from '../services/api';
import { usePolling } from '../hooks/usePolling';
import { PatientDetailScreen } from './PatientDetailScreen';
import { colors, spacing } from '../theme';

interface Patient {
  patientId: string;
  displayName: string;
  stage: string;
  activeAlerts: number;
  lastActivity: string;
  deviceStatus: 'online' | 'offline';
}

interface PatientsData {
  caregiverId: string;
  totalPatients: number;
  patients: Patient[];
}

export default function HomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [patientsData, setPatientsData] = useState<PatientsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if caregiver has only one patient - show detailed view
  const isSinglePatient = patientsData?.totalPatients === 1;

  const fetchPatients = useCallback(async () => {
    if (!user?.id) return;

    try {
      setError(null);
      const data = await caregiverApi.getPatients(user.id);
      setPatientsData(data);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Unable to load patient data');
      throw err; // Re-throw for polling hook
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Use polling hook for automatic updates
  const { retryCount, isOnline } = usePolling(
    fetchPatients,
    {
      interval: 30000, // 30 seconds
      enabled: !!user?.id,
      onError: (err) => {
        console.warn('Patient data polling error:', err.message);
      },
    }
  );

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchPatients();
    setIsRefreshing(false);
  };

  const handlePatientPress = (patient: Patient) => {
    // Navigate to patient detail screen (for multi-patient view)
    // For now, we'll implement this as a modal or new screen
    console.log('Navigate to patient detail:', patient.patientId);
  };

  const getStatusColor = (status: string) => {
    return status === 'online' ? colors.success : colors.textSecondary;
  };

  const getStageColor = (stage: string) => {
    switch (stage?.toLowerCase()) {
      case 'early':
        return colors.success;
      case 'moderate':
        return colors.warning;
      case 'severe':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const formatLastActivity = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading patients...</Text>
      </View>
    );
  }

  if (error && !patientsData) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={48} color={colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={fetchPatients}>
          Retry
        </Button>
      </View>
    );
  }

  // Single patient view - Show detailed status (enhanced old UI)
  if (isSinglePatient && patientsData?.patients[0]) {
    const patient = patientsData.patients[0];
    return (
      <View style={styles.container}>
        {/* Connection & Polling Status Banner */}
        <View style={styles.statusBanner}>
          <View style={styles.statusBannerContent}>
            <MaterialCommunityIcons 
              name={isOnline ? 'wifi' : 'wifi-off'} 
              size={16} 
              color={isOnline ? colors.success : colors.error} 
            />
            <Text variant="bodySmall" style={styles.statusBannerText}>
              {isOnline ? 'Live updates active' : 'Offline mode'}
            </Text>
            {retryCount > 0 && (
              <>
                <MaterialCommunityIcons name="alert-circle" size={16} color={colors.warning} />
                <Text variant="bodySmall" style={[styles.statusBannerText, { color: colors.warning }]}>
                  Retry {retryCount}/5
                </Text>
              </>
            )}
            <View style={styles.pollingIndicator}>
              <View style={[styles.pollingDot, { backgroundColor: isOnline ? colors.success : colors.textSecondary }]} />
              <Text variant="bodySmall" style={styles.statusBannerText}>
                Auto-refresh: 30s
              </Text>
            </View>
          </View>
        </View>
        
        <PatientDetailScreen 
          patientId={patient.patientId} 
          patientName={patient.displayName}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
    >
      {/* Summary Header */}
      <Card style={styles.summaryCard}>
        <Card.Content>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons name="account-group" size={32} color={colors.primary} />
              <Text variant="headlineMedium" style={styles.summaryValue}>
                {patientsData?.totalPatients || 0}
              </Text>
              <Text variant="bodySmall" style={styles.summaryLabel}>
                Patients
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <MaterialCommunityIcons 
                name="bell" 
                size={32} 
                color={colors.error} 
              />
              <Text variant="headlineMedium" style={[styles.summaryValue, { color: colors.error }]}>
                {patientsData?.patients.reduce((sum, p) => sum + p.activeAlerts, 0) || 0}
              </Text>
              <Text variant="bodySmall" style={styles.summaryLabel}>
                Active Alerts
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <MaterialCommunityIcons 
                name="wifi" 
                size={32} 
                color={colors.success} 
              />
              <Text variant="headlineMedium" style={[styles.summaryValue, { color: colors.success }]}>
                {patientsData?.patients.filter(p => p.deviceStatus === 'online').length || 0}
              </Text>
              <Text variant="bodySmall" style={styles.summaryLabel}>
                Online
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Patient List */}
      <View style={styles.sectionHeader}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Your Patients
        </Text>
      </View>

      {patientsData?.patients.map((patient) => (
        <TouchableOpacity 
          key={patient.patientId} 
          activeOpacity={0.7}
          onPress={() => handlePatientPress(patient)}
        >
          <Card style={styles.patientCard}>
            <Card.Content>
              <View style={styles.patientHeader}>
                <View style={styles.patientInfo}>
                  <Text variant="titleLarge" style={styles.patientName}>
                    {patient.displayName}
                  </Text>
                  <View style={styles.patientMeta}>
                    <Chip
                      mode="flat"
                      style={[styles.stageChip, { backgroundColor: getStageColor(patient.stage) + '20' }]}
                      textStyle={{ color: getStageColor(patient.stage), fontWeight: 'bold' }}
                    >
                      {patient.stage || 'Unknown'}
                    </Chip>
                  </View>
                </View>

                <View style={styles.patientStatus}>
                  <MaterialCommunityIcons
                    name="circle"
                    size={16}
                    color={getStatusColor(patient.deviceStatus)}
                  />
                  <Text variant="bodySmall" style={styles.statusText}>
                    {patient.deviceStatus}
                  </Text>
                </View>
              </View>

              <View style={styles.patientDetails}>
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons name="bell" size={20} color={colors.textSecondary} />
                  <Text variant="bodyMedium" style={styles.detailText}>
                    {patient.activeAlerts} active alert{patient.activeAlerts !== 1 ? 's' : ''}
                  </Text>
                </View>

                <View style={styles.detailItem}>
                  <MaterialCommunityIcons name="clock-outline" size={20} color={colors.textSecondary} />
                  <Text variant="bodyMedium" style={styles.detailText}>
                    Last activity: {formatLastActivity(patient.lastActivity)}
                  </Text>
                </View>
              </View>

              {patient.activeAlerts > 0 && (
                <Button
                  mode="contained"
                  icon="bell"
                  style={styles.viewAlertsButton}
                  buttonColor={colors.error}
                  compact
                >
                  View Alerts ({patient.activeAlerts})
                </Button>
              )}

              <View style={styles.tapHint}>
                <Text variant="bodySmall" style={styles.tapHintText}>
                  Tap to view details
                </Text>
                <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textSecondary} />
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      ))}

      {patientsData?.patients.length === 0 && (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="account-off" size={64} color={colors.textSecondary} />
          <Text variant="titleMedium" style={styles.emptyStateText}>
            No patients linked
          </Text>
          <Text variant="bodyMedium" style={styles.emptyStateSubtext}>
            Ask your patients to add you as their caregiver
          </Text>
        </View>
      )}

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
  summaryCard: {
    margin: spacing.md,
    backgroundColor: colors.surface,
    elevation: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontWeight: 'bold',
    marginTop: spacing.xs,
  },
  summaryLabel: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  sectionHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  sectionTitle: {
    fontWeight: 'bold',
  },
  patientCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    elevation: 2,
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  patientMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stageChip: {
    height: 24,
  },
  patientStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusText: {
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  patientDetails: {
    gap: spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailText: {
    color: colors.text,
  },
  viewAlertsButton: {
    marginTop: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyStateText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  emptyStateSubtext: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: spacing.lg,
  },
  statusBanner: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  statusBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  statusBannerText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  pollingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginLeft: 'auto',
  },
  pollingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  tapHintText: {
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});
