import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Button, SegmentedButtons, Switch, ActivityIndicator, Snackbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { colors, spacing } from '../theme';
import { useAuth } from '../state/AuthContext';
import { apiClient } from '../services/api/client';

type TextSize = 'small' | 'medium' | 'large' | 'xlarge';
type ContrastMode = 'standard' | 'high';

interface AccessibilitySettings {
  userId: string;
  textSize: TextSize;
  contrastMode: ContrastMode;
  simplifiedMode: boolean;
  reducedMotion: boolean;
  updatedAt: string;
}

export default function AccessibilitySettingsScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Fetch current settings
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['accessibilitySettings', user?.id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/users/${user?.id}/accessibility`);
      return response.data.settings as AccessibilitySettings;
    },
    enabled: !!user?.id,
  });

  const [localSettings, setLocalSettings] = useState<AccessibilitySettings | null>(null);
  const currentSettings = localSettings || settingsData;

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<AccessibilitySettings>) => {
      const response = await apiClient.put(`/api/users/${user?.id}/accessibility`, updates);
      return response.data.settings;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['accessibilitySettings', user?.id], data);
      setLocalSettings(null);
      setSnackbarMessage('Settings saved successfully');
      setSnackbarVisible(true);
    },
    onError: () => {
      setSnackbarMessage('Failed to save settings');
      setSnackbarVisible(true);
    },
  });

  // Reset settings mutation
  const resetMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(`/api/users/${user?.id}/accessibility/reset`);
      return response.data.settings;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['accessibilitySettings', user?.id], data);
      setLocalSettings(null);
      setSnackbarMessage('Settings reset to defaults');
      setSnackbarVisible(true);
    },
  });

  const handleTextSizeChange = (value: string) => {
    const updated = { ...currentSettings!, textSize: value as TextSize };
    setLocalSettings(updated);
  };

  const handleContrastModeChange = (value: string) => {
    const updated = { ...currentSettings!, contrastMode: value as ContrastMode };
    setLocalSettings(updated);
  };

  const handleSimplifiedModeToggle = () => {
    const updated = { ...currentSettings!, simplifiedMode: !currentSettings!.simplifiedMode };
    setLocalSettings(updated);
  };

  const handleReducedMotionToggle = () => {
    const updated = { ...currentSettings!, reducedMotion: !currentSettings!.reducedMotion };
    setLocalSettings(updated);
  };

  const handleSave = () => {
    if (localSettings) {
      const { userId, updatedAt, ...updates } = localSettings;
      updateMutation.mutate(updates);
    }
  };

  const handleReset = () => {
    resetMutation.mutate();
  };

  const hasChanges = localSettings !== null;

  if (isLoading || !currentSettings) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  // Text size examples
  const textSizeExamples = {
    small: { fontSize: 14, label: 'Small (87.5%)' },
    medium: { fontSize: 16, label: 'Medium (100%)' },
    large: { fontSize: 20, label: 'Large (125%)' },
    xlarge: { fontSize: 24, label: 'Extra Large (150%)' },
  };

  const previewFontSize = textSizeExamples[currentSettings.textSize].fontSize;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="eye-settings" size={48} color={colors.primary} />
          <Text style={styles.headerTitle}>Accessibility Settings</Text>
          <Text style={styles.headerSubtitle}>
            Customize your viewing experience
          </Text>
        </View>

        {/* Text Size */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="format-size" size={24} color={colors.primary} />
              <Text style={styles.sectionTitle}>Text Size</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Choose a comfortable reading size
            </Text>

            <SegmentedButtons
              value={currentSettings.textSize}
              onValueChange={handleTextSizeChange}
              buttons={[
                { value: 'small', label: 'S' },
                { value: 'medium', label: 'M' },
                { value: 'large', label: 'L' },
                { value: 'xlarge', label: 'XL' },
              ]}
              style={styles.segmentedButtons}
            />

            {/* Preview */}
            <View style={styles.previewContainer}>
              <Text style={styles.previewLabel}>Preview:</Text>
              <Text style={[styles.previewText, { fontSize: previewFontSize }]}>
                The quick brown fox jumps over the lazy dog
              </Text>
              <Text style={styles.previewSize}>
                {textSizeExamples[currentSettings.textSize].label}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Contrast Mode */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="contrast-box" size={24} color={colors.primary} />
              <Text style={styles.sectionTitle}>Contrast Mode</Text>
            </View>
            <Text style={styles.sectionDescription}>
              High contrast improves visibility
            </Text>

            <SegmentedButtons
              value={currentSettings.contrastMode}
              onValueChange={handleContrastModeChange}
              buttons={[
                { value: 'standard', label: 'Standard', icon: 'white-balance-sunny' },
                { value: 'high', label: 'High Contrast', icon: 'brightness-7' },
              ]}
              style={styles.segmentedButtons}
            />

            {currentSettings.contrastMode === 'high' && (
              <View style={styles.infoBox}>
                <MaterialCommunityIcons name="information" size={20} color={colors.info} />
                <Text style={styles.infoText}>
                  High contrast uses bold colors and increased contrast for better visibility
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Simplified Mode */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.switchRow}>
              <View style={styles.switchLeft}>
                <MaterialCommunityIcons name="gesture-tap" size={24} color={colors.primary} />
                <View style={styles.switchText}>
                  <Text style={styles.switchTitle}>Simplified Mode</Text>
                  <Text style={styles.switchDescription}>
                    Reduces UI complexity for easier navigation
                  </Text>
                </View>
              </View>
              <Switch
                value={currentSettings.simplifiedMode}
                onValueChange={handleSimplifiedModeToggle}
                color={colors.primary}
              />
            </View>

            {currentSettings.simplifiedMode && (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  • Larger tap targets{'\n'}
                  • Fewer on-screen options{'\n'}
                  • Clearer visual hierarchy
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Reduced Motion */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.switchRow}>
              <View style={styles.switchLeft}>
                <MaterialCommunityIcons name="motion-pause" size={24} color={colors.primary} />
                <View style={styles.switchText}>
                  <Text style={styles.switchTitle}>Reduce Motion</Text>
                  <Text style={styles.switchDescription}>
                    Minimizes animations and transitions
                  </Text>
                </View>
              </View>
              <Switch
                value={currentSettings.reducedMotion}
                onValueChange={handleReducedMotionToggle}
                color={colors.primary}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode="contained"
            onPress={handleSave}
            disabled={!hasChanges || updateMutation.isPending}
            loading={updateMutation.isPending}
            style={styles.saveButton}
            icon="content-save"
          >
            Save Changes
          </Button>

          <Button
            mode="outlined"
            onPress={handleReset}
            disabled={resetMutation.isPending}
            loading={resetMutation.isPending}
            style={styles.resetButton}
            icon="restore"
          >
            Reset to Defaults
          </Button>
        </View>

        {/* Information */}
        <Card style={[styles.card, styles.infoCard]}>
          <Card.Content>
            <MaterialCommunityIcons name="information-outline" size={32} color={colors.info} />
            <Text style={styles.infoCardTitle}>About Accessibility</Text>
            <Text style={styles.infoCardText}>
              These settings are designed to make the app more comfortable and accessible for everyone.
              Changes apply immediately when saved and persist across all your devices.
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Snackbar for feedback */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
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
  contentContainer: {
    padding: spacing.md,
    gap: spacing.md,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.sm,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  segmentedButtons: {
    marginBottom: spacing.md,
  },
  previewContainer: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 8,
    gap: spacing.sm,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  previewText: {
    color: colors.text,
    lineHeight: 28,
  },
  previewSize: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  switchText: {
    flex: 1,
  },
  switchTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  switchDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoBox: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  actionButtons: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  resetButton: {
    borderColor: colors.border,
  },
  infoCard: {
    backgroundColor: colors.primaryLight,
    marginTop: spacing.md,
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  infoCardText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});
