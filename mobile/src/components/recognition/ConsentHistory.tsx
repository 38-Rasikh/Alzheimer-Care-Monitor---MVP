/**
 * Consent History Component
 * Shows timeline of consent changes
 */

import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';
import type { ConsentRecord } from '../../types/recognition';

interface ConsentHistoryProps {
  consents: ConsentRecord[];
  emptyMessage?: string;
}

export function ConsentHistory({
  consents,
  emptyMessage = 'No consent history available',
}: ConsentHistoryProps) {
  // Sort by timestamp descending
  const sortedConsents = [...consents].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getConsentLabel = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const renderItem = ({ item }: { item: ConsentRecord }) => (
    <View style={styles.item}>
      <View style={styles.timeline}>
        <View
          style={[
            styles.dot,
            {
              backgroundColor: item.granted
                ? colors.success
                : item.revokedAt
                ? colors.error
                : colors.textSecondary,
            },
          ]}
        />
        <View style={styles.line} />
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <MaterialCommunityIcons
              name={item.granted ? 'check-circle' : 'close-circle'}
              size={20}
              color={item.granted ? colors.success : colors.error}
            />
            <Text variant="titleSmall" style={styles.title}>
              {getConsentLabel(item.type)}
            </Text>
          </View>

          <Text variant="bodySmall" style={styles.status}>
            {item.granted ? 'Consent Granted' : 'Consent Revoked'}
          </Text>

          <Text variant="bodySmall" style={styles.date}>
            {formatDate(item.timestamp)}
          </Text>

          {item.notes && (
            <Text variant="bodySmall" style={styles.notes}>
              Note: {item.notes}
            </Text>
          )}

          {item.revokedAt && (
            <Text variant="bodySmall" style={styles.revoked}>
              Revoked on {formatDate(item.revokedAt)}
            </Text>
          )}

          <View style={styles.metadata}>
            <Text variant="bodySmall" style={styles.metadataText}>
              Version {item.version}
            </Text>
            {item.grantedBy && (
              <Text variant="bodySmall" style={styles.metadataText}>
                • By {item.grantedBy}
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  if (sortedConsents.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons
          name="clipboard-text-outline"
          size={48}
          color={colors.textSecondary}
        />
        <Text variant="bodyLarge" style={styles.emptyText}>
          {emptyMessage}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={sortedConsents}
      renderItem={renderItem}
      keyExtractor={item => item.consentId}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingVertical: spacing.md,
  },
  item: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  timeline: {
    width: 32,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginTop: spacing.xs,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  status: {
    color: colors.text,
    marginBottom: spacing.xs,
  },
  date: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  notes: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  revoked: {
    marginTop: spacing.xs,
    color: colors.error,
    fontSize: 12,
  },
  metadata: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  metadataText: {
    color: colors.textSecondary,
    fontSize: 11,
    marginRight: spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
