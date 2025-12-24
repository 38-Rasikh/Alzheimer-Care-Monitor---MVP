import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text, Card, ActivityIndicator, Chip, SegmentedButtons, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { colors, spacing } from '../theme';
import { useAuth } from '../state/AuthContext';
import { apiClient } from '../services/api/client';

type AuditEventType =
  | 'auth.login'
  | 'auth.logout'
  | 'consent.granted'
  | 'consent.revoked'
  | 'reminder.acknowledged'
  | 'reminder.completed'
  | 'reminder.snoozed'
  | 'recognition.face_detected'
  | 'recognition.access_granted'
  | 'alert.triggered'
  | 'alert.acknowledged'
  | 'assistant.query'
  | 'assistant.escalation'
  | 'memory_aid.viewed';

interface AuditEvent {
  eventId: string;
  actorId: string;
  actorRole: 'patient' | 'caregiver' | 'system';
  patientId?: string;
  type: AuditEventType;
  timestamp: string;
  metadata: Record<string, any>;
  ipAddress?: string;
  success: boolean;
}

interface AuditLogScreenProps {
  route: {
    params: {
      patientId: string;
      patientName: string;
    };
  };
}

const eventIcons: Record<string, string> = {
  auth: 'login',
  consent: 'shield-check',
  reminder: 'bell',
  recognition: 'face-recognition',
  alert: 'alert',
  assistant: 'robot',
  memory_aid: 'image-multiple',
  monitoring: 'eye',
};

const eventColors: Record<string, string> = {
  auth: colors.info,
  consent: colors.primary,
  reminder: colors.success,
  recognition: colors.warning,
  alert: colors.error,
  assistant: colors.info,
  memory_aid: colors.primary,
};

export default function AuditLogScreen({ route }: AuditLogScreenProps) {
  const { patientId, patientName } = route.params;
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'auth' | 'consent' | 'reminder' | 'alert'>('all');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  // Calculate date range
  const getStartDate = () => {
    const now = new Date();
    switch (timeRange) {
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }
  };

  const { data: auditData, isLoading, refetch } = useQuery({
    queryKey: ['auditEvents', patientId, filterType, timeRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        patientId,
        startDate: getStartDate(),
        limit: '50',
      });

      if (filterType !== 'all') {
        // Filter by type prefix (e.g., 'auth' matches 'auth.login', 'auth.logout')
        params.append('type', filterType);
      }

      const response = await apiClient.get(`/api/audit/events?${params.toString()}`);
      return response.data;
    },
    enabled: !!user?.id && user?.role === 'caregiver',
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const formatTimestamp = (isoTimestamp: string) => {
    const date = new Date(isoTimestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getEventCategory = (type: AuditEventType): string => {
    return type.split('.')[0];
  };

  const getEventIcon = (type: AuditEventType): string => {
    const category = getEventCategory(type);
    return eventIcons[category] || 'information';
  };

  const getEventColor = (type: AuditEventType): string => {
    const category = getEventCategory(type);
    return eventColors[category] || colors.info;
  };

  const getEventDescription = (event: AuditEvent): string => {
    const { type, metadata, actorRole } = event;

    switch (type) {
      case 'auth.login':
        return `${actorRole === 'patient' ? 'Patient' : 'Caregiver'} logged in`;
      case 'consent.granted':
        return `Consent granted: ${metadata.consentType}`;
      case 'consent.revoked':
        return `Consent revoked: ${metadata.consentType}`;
      case 'reminder.acknowledged':
        return `Acknowledged reminder: ${metadata.reminderTitle || metadata.reminderType}`;
      case 'reminder.completed':
        return `Completed reminder: ${metadata.reminderTitle || metadata.reminderType}`;
      case 'reminder.snoozed':
        return `Snoozed reminder for ${metadata.snoozedMinutes} min`;
      case 'recognition.face_detected':
        return `Face detected (${Math.round(metadata.confidence * 100)}% confidence)`;
      case 'alert.triggered':
        return `Alert triggered: ${metadata.alertType}`;
      case 'alert.acknowledged':
        return `Alert acknowledged: ${metadata.response || 'No response'}`;
      case 'assistant.query':
        return `Asked: "${metadata.query}"`;
      case 'assistant.escalation':
        return `⚠️ Medical question escalated`;
      case 'memory_aid.viewed':
        return `Viewed family member: ${metadata.familyMemberName}`;
      default:
        return type.replace(/\./g, ' ').replace(/_/g, ' ');
    }
  };

  const events: AuditEvent[] = auditData?.events || [];

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading audit log...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="file-document-outline" size={48} color={colors.primary} />
        <Text style={styles.headerTitle}>Activity Log</Text>
        <Text style={styles.headerSubtitle}>{patientName}</Text>
        <Text style={styles.headerStats}>
          {auditData?.total || 0} events • Last {timeRange}
        </Text>
      </View>

      {/* Time Range Filter */}
      <View style={styles.filterSection}>
        <SegmentedButtons
          value={timeRange}
          onValueChange={(value) => setTimeRange(value as any)}
          buttons={[
            { value: '24h', label: '24h' },
            { value: '7d', label: '7 days' },
            { value: '30d', label: '30 days' },
          ]}
          density="small"
        />
      </View>

      {/* Event Type Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.chipContainer}
      >
        <Chip
          selected={filterType === 'all'}
          onPress={() => setFilterType('all')}
          style={styles.chip}
        >
          All
        </Chip>
        <Chip
          selected={filterType === 'auth'}
          onPress={() => setFilterType('auth')}
          icon="login"
          style={styles.chip}
        >
          Auth
        </Chip>
        <Chip
          selected={filterType === 'consent'}
          onPress={() => setFilterType('consent')}
          icon="shield-check"
          style={styles.chip}
        >
          Consent
        </Chip>
        <Chip
          selected={filterType === 'reminder'}
          onPress={() => setFilterType('reminder')}
          icon="bell"
          style={styles.chip}
        >
          Reminders
        </Chip>
        <Chip
          selected={filterType === 'alert'}
          onPress={() => setFilterType('alert')}
          icon="alert"
          style={styles.chip}
        >
          Alerts
        </Chip>
      </ScrollView>

      {/* Events List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {events.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name="file-document-outline"
                  size={64}
                  color={colors.textSecondary}
                />
                <Text style={styles.emptyText}>No activity in this time range</Text>
                <Text style={styles.emptySubtext}>
                  Try selecting a different time range or filter
                </Text>
              </View>
            </Card.Content>
          </Card>
        ) : (
          events.map((event) => (
            <Card key={event.eventId} style={styles.eventCard}>
              <Card.Content style={styles.eventContent}>
                <View style={styles.eventHeader}>
                  <View style={styles.eventIconContainer}>
                    <MaterialCommunityIcons
                      name={getEventIcon(event.type) as any}
                      size={24}
                      color={getEventColor(event.type)}
                    />
                  </View>
                  <View style={styles.eventDetails}>
                    <Text style={styles.eventDescription}>
                      {getEventDescription(event)}
                    </Text>
                    <View style={styles.eventMeta}>
                      <Text style={styles.eventTime}>
                        {formatTimestamp(event.timestamp)}
                      </Text>
                      <Text style={styles.eventDot}>•</Text>
                      <Chip
                        mode="outlined"
                        compact
                        style={styles.roleChip}
                        textStyle={styles.roleChipText}
                      >
                        {event.actorRole}
                      </Chip>
                      {!event.success && (
                        <>
                          <Text style={styles.eventDot}>•</Text>
                          <MaterialCommunityIcons
                            name="alert-circle"
                            size={14}
                            color={colors.error}
                          />
                        </>
                      )}
                    </View>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))
        )}

        {auditData?.hasMore && (
          <View style={styles.hasMoreContainer}>
            <Text style={styles.hasMoreText}>
              Showing first 50 events • {auditData.total} total
            </Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.sm,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  headerStats: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  filterSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  chipScroll: {
    maxHeight: 60,
    backgroundColor: colors.surface,
  },
  chipContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    marginRight: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  eventCard: {
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  eventContent: {
    paddingVertical: spacing.sm,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  eventIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  eventDetails: {
    flex: 1,
  },
  eventDescription: {
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  eventTime: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  eventDot: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  roleChip: {
    height: 22,
    borderWidth: 0,
    backgroundColor: colors.backgroundAlt,
  },
  roleChipText: {
    fontSize: 11,
    marginVertical: 0,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    marginVertical: spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  hasMoreContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  hasMoreText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
