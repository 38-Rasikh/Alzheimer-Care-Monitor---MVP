/**
 * Consent Card Component
 * Displays consent type with description, status, and toggle
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Switch, Chip, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';
import type { ConsentType, ConsentRecord } from '../../types/recognition';

interface ConsentCardProps {
  type: ConsentType;
  title: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  consent?: ConsentRecord;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  onInfo?: () => void;
  required?: boolean;
}

const CONSENT_COLORS: Record<ConsentType, string> = {
  face_recognition: colors.primary,
  voice_recognition: colors.primary,
  location_tracking: colors.warning,
  biometrics: colors.success,
  ai_assistant: colors.primary,
  data_sharing: colors.textSecondary,
  emergency_contact: colors.error,
};

export function ConsentCard({
  type,
  title,
  description,
  icon,
  consent,
  enabled,
  onToggle,
  onInfo,
  required = false,
}: ConsentCardProps) {
  const iconColor = CONSENT_COLORS[type];

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name={icon} size={32} color={iconColor} />
          </View>
          <View style={styles.headerText}>
            <View style={styles.titleRow}>
              <Text variant="titleMedium" style={styles.title}>
                {title}
              </Text>
              {required && (
                <Chip
                  mode="flat"
                  compact
                  style={[styles.chip, { backgroundColor: colors.error + '20' }]}
                  textStyle={{ color: colors.error, fontSize: 11 }}
                >
                  Required
                </Chip>
              )}
            </View>
            <Text variant="bodySmall" style={styles.description}>
              {description}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.statusRow}>
            <MaterialCommunityIcons
              name={enabled ? 'check-circle' : 'close-circle'}
              size={16}
              color={enabled ? colors.success : colors.textSecondary}
            />
            <Text
              variant="bodySmall"
              style={[
                styles.statusText,
                { color: enabled ? colors.success : colors.textSecondary },
              ]}
            >
              {enabled ? 'Active' : 'Disabled'}
            </Text>
            {consent && (
              <Text variant="bodySmall" style={styles.dateText}>
                • Last updated {new Date(consent.timestamp).toLocaleDateString()}
              </Text>
            )}
          </View>

          <View style={styles.actions}>
            {onInfo && (
              <IconButton
                icon="information-outline"
                size={20}
                onPress={onInfo}
                style={styles.infoButton}
              />
            )}
            <Switch
              value={enabled}
              onValueChange={onToggle}
              disabled={required}
              color={colors.primary}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  iconContainer: {
    marginRight: spacing.md,
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  headerText: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  chip: {
    height: 20,
  },
  description: {
    color: colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusText: {
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  dateText: {
    marginLeft: spacing.xs,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoButton: {
    margin: 0,
  },
});
