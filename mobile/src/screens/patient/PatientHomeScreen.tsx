import React, { useState, useCallback, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Text, Card, Button, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../state/AuthContext';
import { patientApi } from '../../services/api';
import { usePolling } from '../../hooks/usePolling';
// import { 
//   startContinuousMonitoring, 
//   stopContinuousMonitoring,
//   isMonitoringActive,
//   getQueueStatus,
// } from '../../services/continuousMonitoring';
import { colors, spacing } from '../../theme';

interface OrientationData {
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  dayOfWeek: string;
  location: string;
  weather: {
    condition: string;
    temperature: number;
    icon: string;
  };
  nextTask: {
    time: string;
    label: string;
    category: string;
    minutesUntil: number;
  } | null;
  isNightTime: boolean;
  isSundowning: boolean;
  recentActivity: string[];
}

export default function PatientHomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [orientation, setOrientation] = useState<OrientationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [monitoringStatus, setMonitoringStatus] = useState({ isActive: false, queueLength: 0 });

  // Initialize continuous monitoring when screen mounts
  useEffect(() => {
    if (!user?.id) return;

    // const initMonitoring = async () => {
    //   try {
    //     console.log('🎥 Initializing continuous monitoring for patient:', user.id);
    //     const started = await startContinuousMonitoring(user.id);
        
    //     if (started) {
    //       Alert.alert(
    //         'Monitoring Active',
    //         'Continuous safety monitoring is now active. Camera and microphone recordings will be securely stored.',
    //         [{ text: 'OK' }]
    //       );
    //       updateMonitoringStatus();
    //     } else {
    //       Alert.alert(
    //         'Permission Required',
    //         'Camera and microphone permissions are required for safety monitoring.',
    //         [{ text: 'OK' }]
    //       );
    //     }
    //   } catch (error) {
    //     console.error('Failed to start monitoring:', error);
    //   }
    // };

    // initMonitoring();

    // Update status every 10 seconds
    // const statusInterval = setInterval(updateMonitoringStatus, 10000);

    // Cleanup on unmount
    return () => {
      // clearInterval(statusInterval);
      // Note: Don't stop monitoring on unmount, it should continue in background
    };
  }, [user?.id]);

  // const updateMonitoringStatus = () => {
  //   const status = getQueueStatus();
  //   setMonitoringStatus({
  //     isActive: status.isMonitoring,
  //     queueLength: status.queueLength,
  //   });
  // };

  const fetchOrientation = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setError(null);
      const data = await patientApi.getOrientation(user.id);
      setOrientation(data);
    } catch (err) {
      console.error('Error fetching orientation:', err);
      setError('Unable to load orientation data');
      throw err; // Re-throw for polling hook to handle
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Use polling hook for automatic updates
  const { isPolling, error: pollingError, retryCount, isOnline } = usePolling(
    fetchOrientation,
    {
      interval: 30000, // 30 seconds
      enabled: !!user?.id,
      onError: (err) => {
        console.warn('Polling error:', err.message);
      },
    }
  );

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrientation();
    setIsRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medication': return 'pill';
      case 'meal': return 'food';
      case 'activity': return 'walk';
      case 'therapy': return 'brain';
      case 'rest': return 'sleep';
      case 'personal': return 'account';
      default: return 'bell';
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error && !orientation) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <MaterialCommunityIcons name="alert-circle" size={64} color={colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={fetchOrientation} style={styles.retryButton}>
          Try Again
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      {/* Offline Banner */}
      {!isOnline && (
        <Card style={styles.offlineBanner}>
          <Card.Content>
            <View style={styles.bannerContent}>
              <MaterialCommunityIcons name="wifi-off" size={24} color="#fff" />
              <Text style={styles.bannerText}>You're offline. Showing last known data.</Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Retry Banner */}
      {retryCount > 0 && isOnline && (
        <Card style={styles.retryBanner}>
          <Card.Content>
            <View style={styles.bannerContent}>
              <MaterialCommunityIcons name="alert" size={24} color="#fff" />
              <Text style={styles.bannerText}>
                Connection issues. Retrying... ({retryCount}/5)
              </Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Greeting Card */}
      <Card style={styles.greetingCard}>
        <Card.Content>
          <Text style={styles.greeting}>
            {getGreeting()}, {orientation?.patientName || user?.displayName || 'Friend'}!
          </Text>
        </Card.Content>
      </Card>

      {/* Monitoring Status Indicator */}
      {/* {monitoringStatus.isActive && (
        <Card style={styles.monitoringCard}>
          <Card.Content>
            <View style={styles.monitoringHeader}>
              <View style={styles.recordingIndicator}>
                <MaterialCommunityIcons name="record-circle" size={16} color={colors.error} />
                <Text variant="bodySmall" style={styles.recordingText}>
                  Monitoring Active
                </Text>
              </View>
              {monitoringStatus.queueLength > 0 && (
                <Text variant="bodySmall" style={styles.queueText}>
                  {monitoringStatus.queueLength} pending uploads
                </Text>
              )}
            </View>
            <Text variant="bodySmall" style={styles.monitoringDescription}>
              Your safety is being monitored with your consent. All recordings are securely stored.
            </Text>
          </Card.Content>
        </Card>
      )} */}

      {/* Orientation Card - Date & Time */}
      <Card style={styles.orientationCard}>
        <Card.Content style={styles.orientationContent}>
          <MaterialCommunityIcons name="calendar-today" size={48} color={colors.primary} />
          <View style={styles.orientationTextContainer}>
            <Text style={styles.orientationLabel}>Today is</Text>
            <Text style={styles.orientationValue}>{orientation?.date || 'Loading...'}</Text>
            <Text style={styles.orientationTime}>{orientation?.time || '--:--'}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Location & Weather Card */}
      <Card style={styles.orientationCard}>
        <Card.Content style={styles.orientationContent}>
          <MaterialCommunityIcons name="home-map-marker" size={48} color={colors.success} />
          <View style={styles.orientationTextContainer}>
            <Text style={styles.orientationLabel}>You are at</Text>
            <Text style={styles.orientationValue}>{orientation?.location || 'Home'}</Text>
            {orientation?.weather && (
              <Text style={styles.orientationSubtext}>
                {orientation.weather.icon} {orientation.weather.condition}, {orientation.weather.temperature}°F
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Next Task Card */}
      {orientation?.nextTask && (
        <Card style={styles.nextTaskCard}>
          <Card.Content>
            <View style={styles.nextTaskHeader}>
              <MaterialCommunityIcons 
                name={getCategoryIcon(orientation.nextTask.category) as any} 
                size={40} 
                color={colors.secondary} 
              />
              <View style={styles.nextTaskTextContainer}>
                <Text style={styles.nextTaskLabel}>Next Activity</Text>
                <Text style={styles.nextTaskValue}>{orientation.nextTask.label}</Text>
                <Text style={styles.nextTaskTime}>
                  {orientation.nextTask.time} 
                  {orientation.nextTask.minutesUntil > 0 && 
                    ` (in ${orientation.nextTask.minutesUntil} minutes)`}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Sundowning Alert */}
      {orientation?.isSundowning && (
        <Card style={styles.alertCard}>
          <Card.Content>
            <View style={styles.alertContent}>
              <MaterialCommunityIcons name="weather-sunset" size={32} color={colors.warning} />
              <Text style={styles.alertText}>
                Evening time - it's normal to feel a bit confused. Your caregiver is nearby.
              </Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Recent Activity */}
      {orientation?.recentActivity && orientation.recentActivity.length > 0 && (
        <Card style={styles.recentActivityCard}>
          <Card.Content>
            <Text style={styles.recentActivityTitle}>What you've done today:</Text>
            {orientation.recentActivity.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <MaterialCommunityIcons name="check-circle" size={20} color={colors.success} />
                <Text style={styles.activityText}>{activity}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Timeline')}
        >
          <MaterialCommunityIcons name="calendar-check" size={40} color={colors.primary} />
          <Text style={styles.actionButtonText}>My Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('MemoryAids')}
        >
          <MaterialCommunityIcons name="account-group" size={40} color={colors.primary} />
          <Text style={styles.actionButtonText}>Family & Friends</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Assistant')}
        >
          <MaterialCommunityIcons name="chat" size={40} color={colors.primary} />
          <Text style={styles.actionButtonText}>Ask Assistant</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Reminders')}
        >
          <MaterialCommunityIcons name="bell-ring" size={40} color={colors.primary} />
          <Text style={styles.actionButtonText}>Reminders</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('PatientSettings')}
        >
          <MaterialCommunityIcons name="cog" size={40} color={colors.primary} />
          <Text style={styles.actionButtonText}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Emergency Button */}
      <Button
        mode="contained"
        icon="phone"
        onPress={() => {
          Alert.alert(
            'Call for Help',
            'This will call your primary caregiver',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Call', onPress: () => console.log('Emergency call initiated') }
            ]
          );
        }}
        style={styles.emergencyButton}
        buttonColor={colors.error}
        contentStyle={styles.emergencyButtonContent}
        labelStyle={styles.emergencyButtonLabel}
      >
        Call for Help
      </Button>
    </ScrollView>
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
  contentContainer: {
    padding: spacing.lg,
    gap: spacing.lg,
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
  offlineBanner: {
    backgroundColor: colors.textSecondary,
    marginBottom: spacing.md,
  },
  retryBanner: {
    backgroundColor: colors.warning,
    marginBottom: spacing.md,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  bannerText: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  greetingCard: {
    backgroundColor: colors.primary,
    elevation: 4,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  monitoringCard: {
    backgroundColor: '#FFF9E6',
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  monitoringHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  recordingText: {
    color: colors.error,
    fontWeight: '600',
  },
  queueText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  monitoringDescription: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  orientationCard: {
    elevation: 4,
    backgroundColor: colors.surface,
  },
  orientationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  orientationTextContainer: {
    flex: 1,
  },
  orientationLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  orientationValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  orientationTime: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  orientationSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  nextTaskCard: {
    elevation: 4,
    backgroundColor: colors.surface,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  nextTaskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  nextTaskTextContainer: {
    flex: 1,
  },
  nextTaskLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  nextTaskValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  nextTaskTime: {
    fontSize: 18,
    color: colors.secondary,
    fontWeight: '600',
  },
  alertCard: {
    backgroundColor: colors.surface,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    elevation: 4,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  alertText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  recentActivityCard: {
    elevation: 4,
    backgroundColor: colors.surface,
  },
  recentActivityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  activityText: {
    fontSize: 16,
    color: colors.text,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    minHeight: 120,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  emergencyButton: {
    marginTop: spacing.lg,
    elevation: 4,
  },
  emergencyButtonContent: {
    height: 64,
  },
  emergencyButtonLabel: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
