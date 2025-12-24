/**
 * Safety Settings Screen
 * Main hub for all recognition and privacy settings
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
} from 'react-native';
import {
  Text,
  Button,
  Card,
  Divider,
  ActivityIndicator,
  Switch,
  Chip,
} from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';
import { getApiBaseUrl } from '../services/api/env';
import { ConsentCard, ConsentHistory } from '../components/recognition';
import type { ConsentRecord, RecognitionSettings } from '../types/recognition';

interface SafetySettingsScreenProps {
  patientId: string;
  onBack: () => void;
  onOpenFaceEnrollment?: () => void;
  onOpenVoiceEnrollment?: () => void;
}

const CONSENT_INFO = {
  face_recognition: {
    title: 'Face Recognition',
    description: 'Identify familiar faces using camera when visitors arrive',
    icon: 'face-recognition' as const,
    required: false,
  },
  voice_recognition: {
    title: 'Voice Recognition',
    description: 'Identify familiar voices during conversations',
    icon: 'account-voice' as const,
    required: false,
  },
  location_tracking: {
    title: 'Location Tracking',
    description: 'Track location to detect wandering and provide location-based alerts',
    icon: 'map-marker' as const,
    required: true,
  },
  biometrics: {
    title: 'Biometric Monitoring',
    description: 'Monitor vital signs like heart rate and activity patterns',
    icon: 'heart-pulse' as const,
    required: true,
  },
  ai_assistant: {
    title: 'AI Assistant',
    description: 'Use AI to provide personalized reminders and assistance',
    icon: 'robot' as const,
    required: false,
  },
  data_sharing: {
    title: 'Data Sharing',
    description: 'Share data with healthcare providers for better care coordination',
    icon: 'share-variant' as const,
    required: false,
  },
  emergency_contact: {
    title: 'Emergency Contact',
    description: 'Allow system to contact emergency services in critical situations',
    icon: 'phone-alert' as const,
    required: true,
  },
};

export function SafetySettingsScreen({
  patientId,
  onBack,
  onOpenFaceEnrollment,
  onOpenVoiceEnrollment,
}: SafetySettingsScreenProps) {
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [settings, setSettings] = useState<RecognitionSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const API_BASE = `${getApiBaseUrl()}/api`;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load consents
      const consentsRes = await fetch(`${API_BASE}/patient/${patientId}/consents`);
      const consentsData = await consentsRes.json();
      setConsents(consentsData);

      // Load recognition settings
      const settingsRes = await fetch(
        `${API_BASE}/patient/${patientId}/recognition/settings`
      );
      const settingsData = await settingsRes.json();
      setSettings(settingsData);
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load safety settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleConsent = async (
    type: string,
    currentGranted: boolean,
    isRequired: boolean
  ) => {
    if (isRequired && currentGranted) {
      Alert.alert(
        'Required Consent',
        'This consent is required for the system to function properly and cannot be disabled.'
      );
      return;
    }

    try {
      setUpdating(type);

      if (currentGranted) {
        // Revoke consent
        const response = await fetch(
          `${API_BASE}/patient/${patientId}/consents/${type}`,
          { method: 'DELETE' }
        );

        if (!response.ok) {
          throw new Error('Failed to revoke consent');
        }
      } else {
        // Grant consent
        const response = await fetch(`${API_BASE}/patient/${patientId}/consents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type,
            granted: true,
            notes: `Enabled via Safety Settings`,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to grant consent');
        }
      }

      loadData();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setUpdating(null);
    }
  };

  const handleToggleRecognition = async (
    field: 'face.enabled' | 'voice.enabled',
    currentValue: boolean
  ) => {
    try {
      setUpdating(field);

      const [category, property] = field.split('.');
      const response = await fetch(
        `${API_BASE}/patient/${patientId}/recognition/settings`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            [category]: {
              ...settings![category as 'face' | 'voice'],
              [property]: !currentValue,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update recognition settings');
      }

      loadData();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setUpdating(null);
    }
  };

  const handleThresholdChange = async (
    category: 'face' | 'voice',
    field: 'threshold' | 'minConfidence',
    value: number
  ) => {
    try {
      // Update local state immediately for smooth slider movement
      setSettings(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          [category]: {
            ...prev[category],
            [field]: value,
          },
        };
      });

      // Debounce API call - wait 500ms after user stops sliding
      if ((window as any).thresholdTimeout) {
        clearTimeout((window as any).thresholdTimeout);
      }

      (window as any).thresholdTimeout = setTimeout(async () => {
        try {
          const response = await fetch(
            `${API_BASE}/patient/${patientId}/recognition/settings`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                [category]: {
                  ...settings![category],
                  [field]: value,
                },
              }),
            }
          );

          if (!response.ok) {
            throw new Error('Failed to update threshold');
          }
        } catch (error) {
          console.error('Error updating threshold:', error);
          // Reload to revert to server value
          loadData();
        }
      }, 500);
    } catch (error: any) {
      console.error('Error handling threshold change:', error);
    }
  };

  const handleDownloadPrivacyReport = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/patient/${patientId}/privacy-report`
      );
      const report = await response.json();

      Alert.alert(
        'Privacy Report',
        `Consents: ${report.consents.length}\nFace Enrollments: ${report.faceEnrollments.length}\nVoice Profiles: ${report.voiceProfiles.length}\n\nIn production, this would download a PDF report.`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to generate privacy report');
    }
  };

  const getConsentByType = (type: string) => {
    return consents.find(c => c.type === type);
  };

  const isConsentGranted = (type: string) => {
    const consent = getConsentByType(type);
    return consent?.granted && !consent.revokedAt;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading safety settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </Pressable>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Safety Settings
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Recognition Status */}
        <Card style={styles.statusCard}>
          <Card.Content>
            <View style={styles.statusHeader}>
              <MaterialCommunityIcons
                name="shield-check"
                size={32}
                color={colors.success}
              />
              <View style={styles.statusInfo}>
                <Text variant="titleLarge" style={styles.statusTitle}>
                  Privacy-First Recognition
                </Text>
                <Text variant="bodySmall" style={styles.statusSubtitle}>
                  All features require explicit consent
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Recognition Toggles */}
        {settings && (
          <Card style={styles.recognitionCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Recognition Features
              </Text>

              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <MaterialCommunityIcons
                    name="face-recognition"
                    size={24}
                    color={colors.primary}
                  />
                  <View style={styles.toggleText}>
                    <Text variant="titleSmall">Face Recognition</Text>
                    <Text variant="bodySmall" style={styles.toggleSubtext}>
                      {isConsentGranted('face_recognition')
                        ? 'Consent granted'
                        : 'Requires consent'}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.face.enabled}
                  onValueChange={() =>
                    handleToggleRecognition(
                      'face.enabled',
                      settings.face.enabled
                    )
                  }
                  disabled={
                    !isConsentGranted('face_recognition') ||
                    updating === 'face.enabled'
                  }
                />
              </View>

              {onOpenFaceEnrollment && (
                <Button
                  mode="outlined"
                  onPress={onOpenFaceEnrollment}
                  icon="account-multiple"
                  style={styles.manageButton}
                  disabled={!isConsentGranted('face_recognition')}
                >
                  Manage Face Enrollments
                </Button>
              )}

              {/* Face Recognition Thresholds */}
              {settings.face.enabled && (
                <View style={styles.thresholdSection}>
                  <Text variant="titleSmall" style={styles.thresholdTitle}>
                    Face Recognition Sensitivity
                  </Text>
                  <Text variant="bodySmall" style={styles.thresholdDescription}>
                    Adjust how similar a face must be to be recognized
                  </Text>

                  <View style={styles.sliderContainer}>
                    <View style={styles.sliderHeader}>
                      <Text variant="bodySmall">Match Threshold</Text>
                      <Chip mode="flat" compact>
                        {Math.round(settings.face.threshold * 100)}%
                      </Chip>
                    </View>
                    <Slider
                      style={styles.slider}
                      minimumValue={0.5}
                      maximumValue={0.95}
                      step={0.05}
                      value={settings.face.threshold}
                      onValueChange={(value) =>
                        handleThresholdChange('face', 'threshold', value)
                      }
                      minimumTrackTintColor={colors.primary}
                      maximumTrackTintColor={colors.border}
                      thumbTintColor={colors.primary}
                    />
                    <View style={styles.sliderLabels}>
                      <Text variant="bodySmall" style={styles.sliderLabel}>
                        More Matches
                      </Text>
                      <Text variant="bodySmall" style={styles.sliderLabel}>
                        Fewer Errors
                      </Text>
                    </View>
                  </View>

                  <View style={styles.sliderContainer}>
                    <View style={styles.sliderHeader}>
                      <Text variant="bodySmall">Minimum Confidence</Text>
                      <Chip mode="flat" compact>
                        {Math.round(settings.face.minConfidence * 100)}%
                      </Chip>
                    </View>
                    <Slider
                      style={styles.slider}
                      minimumValue={0.5}
                      maximumValue={0.95}
                      step={0.05}
                      value={settings.face.minConfidence}
                      onValueChange={(value) =>
                        handleThresholdChange('face', 'minConfidence', value)
                      }
                      minimumTrackTintColor={colors.primary}
                      maximumTrackTintColor={colors.border}
                      thumbTintColor={colors.primary}
                    />
                    <View style={styles.sliderLabels}>
                      <Text variant="bodySmall" style={styles.sliderLabel}>
                        Less Strict
                      </Text>
                      <Text variant="bodySmall" style={styles.sliderLabel}>
                        More Strict
                      </Text>
                    </View>
                  </View>

                  <Card style={styles.thresholdInfoCard}>
                    <Card.Content>
                      <Text variant="bodySmall" style={styles.thresholdInfo}>
                        <Text style={styles.bold}>Lower thresholds</Text> = More
                        matches but more false positives
                        {'\n'}
                        <Text style={styles.bold}>Higher thresholds</Text> = Fewer
                        matches but higher accuracy
                      </Text>
                    </Card.Content>
                  </Card>
                </View>
              )}

              <Divider style={styles.divider} />

              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <MaterialCommunityIcons
                    name="account-voice"
                    size={24}
                    color={colors.primary}
                  />
                  <View style={styles.toggleText}>
                    <Text variant="titleSmall">Voice Recognition</Text>
                    <Text variant="bodySmall" style={styles.toggleSubtext}>
                      {isConsentGranted('voice_recognition')
                        ? 'Consent granted'
                        : 'Requires consent'}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.voice.enabled}
                  onValueChange={() =>
                    handleToggleRecognition(
                      'voice.enabled',
                      settings.voice.enabled
                    )
                  }
                  disabled={
                    !isConsentGranted('voice_recognition') ||
                    updating === 'voice.enabled'
                  }
                />
              </View>

              {onOpenVoiceEnrollment && (
                <Button
                  mode="outlined"
                  onPress={onOpenVoiceEnrollment}
                  icon="waveform"
                  style={styles.manageButton}
                  disabled={!isConsentGranted('voice_recognition')}
                >
                  Manage Voice Profiles
                </Button>
              )}

              {/* Voice Recognition Thresholds */}
              {settings.voice.enabled && (
                <View style={styles.thresholdSection}>
                  <Text variant="titleSmall" style={styles.thresholdTitle}>
                    Voice Recognition Sensitivity
                  </Text>
                  <Text variant="bodySmall" style={styles.thresholdDescription}>
                    Adjust how similar a voice must be to be recognized
                  </Text>

                  <View style={styles.sliderContainer}>
                    <View style={styles.sliderHeader}>
                      <Text variant="bodySmall">Match Threshold</Text>
                      <Chip mode="flat" compact>
                        {Math.round(settings.voice.threshold * 100)}%
                      </Chip>
                    </View>
                    <Slider
                      style={styles.slider}
                      minimumValue={0.5}
                      maximumValue={0.95}
                      step={0.05}
                      value={settings.voice.threshold}
                      onValueChange={(value) =>
                        handleThresholdChange('voice', 'threshold', value)
                      }
                      minimumTrackTintColor={colors.primary}
                      maximumTrackTintColor={colors.border}
                      thumbTintColor={colors.primary}
                    />
                    <View style={styles.sliderLabels}>
                      <Text variant="bodySmall" style={styles.sliderLabel}>
                        More Matches
                      </Text>
                      <Text variant="bodySmall" style={styles.sliderLabel}>
                        Fewer Errors
                      </Text>
                    </View>
                  </View>

                  <View style={styles.sliderContainer}>
                    <View style={styles.sliderHeader}>
                      <Text variant="bodySmall">Minimum Confidence</Text>
                      <Chip mode="flat" compact>
                        {Math.round(settings.voice.minConfidence * 100)}%
                      </Chip>
                    </View>
                    <Slider
                      style={styles.slider}
                      minimumValue={0.5}
                      maximumValue={0.95}
                      step={0.05}
                      value={settings.voice.minConfidence}
                      onValueChange={(value) =>
                        handleThresholdChange('voice', 'minConfidence', value)
                      }
                      minimumTrackTintColor={colors.primary}
                      maximumTrackTintColor={colors.border}
                      thumbTintColor={colors.primary}
                    />
                    <View style={styles.sliderLabels}>
                      <Text variant="bodySmall" style={styles.sliderLabel}>
                        Less Strict
                      </Text>
                      <Text variant="bodySmall" style={styles.sliderLabel}>
                        More Strict
                      </Text>
                    </View>
                  </View>

                  <Card style={styles.thresholdInfoCard}>
                    <Card.Content>
                      <Text variant="bodySmall" style={styles.thresholdInfo}>
                        <Text style={styles.bold}>Lower thresholds</Text> = More
                        matches but more false positives
                        {'\n'}
                        <Text style={styles.bold}>Higher thresholds</Text> = Fewer
                        matches but higher accuracy
                      </Text>
                    </Card.Content>
                  </Card>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Consent Management */}
        <View style={styles.consentSection}>
          <View style={styles.consentHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Privacy Consents
            </Text>
            <Button
              mode="text"
              onPress={() => setShowHistory(!showHistory)}
              icon={showHistory ? 'chevron-up' : 'history'}
              compact
            >
              {showHistory ? 'Hide History' : 'View History'}
            </Button>
          </View>

          {showHistory ? (
            <ConsentHistory
              consents={consents}
              emptyMessage="No consent changes recorded"
            />
          ) : (
            <>
              {Object.entries(CONSENT_INFO).map(([type, info]) => {
                const consent = getConsentByType(type);
                const granted = isConsentGranted(type) ?? false;
                return (
                  <ConsentCard
                    key={type}
                    type={type as any}
                    title={info.title}
                    description={info.description}
                    icon={info.icon}
                    consent={consent}
                    enabled={granted}
                    required={info.required}
                    onToggle={() =>
                      handleToggleConsent(type, granted, info.required)
                    }
                  />
                );
              })}
            </>
          )}
        </View>

        {/* Privacy Report */}
        <Card style={styles.reportCard}>
          <Card.Content>
            <View style={styles.reportHeader}>
              <MaterialCommunityIcons
                name="file-document"
                size={24}
                color={colors.info}
              />
              <View style={styles.reportInfo}>
                <Text variant="titleSmall">Privacy Report</Text>
                <Text variant="bodySmall" style={styles.reportSubtext}>
                  Download a comprehensive report of all privacy settings and data
                </Text>
              </View>
            </View>
            <Button
              mode="contained"
              onPress={handleDownloadPrivacyReport}
              icon="download"
              style={styles.downloadButton}
            >
              Download Report
            </Button>
          </Card.Content>
        </Card>

        {/* Info Footer */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoHeader}>
              <MaterialCommunityIcons
                name="information"
                size={20}
                color={colors.textSecondary}
              />
              <Text variant="bodySmall" style={styles.infoText}>
                All recognition data is encrypted and stored locally. You can revoke
                consents or delete enrollments at any time. Required consents are
                necessary for core safety features.
              </Text>
            </View>
          </Card.Content>
        </Card>
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
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: spacing.sm,
    padding: spacing.xs,
  },
  headerTitle: {
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  statusCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  statusTitle: {
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  statusSubtitle: {
    color: colors.textSecondary,
  },
  recognitionCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  toggleSubtext: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  manageButton: {
    marginBottom: spacing.sm,
  },
  divider: {
    marginVertical: spacing.md,
  },
  consentSection: {
    marginBottom: spacing.md,
  },
  consentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  reportCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  reportInfo: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  reportSubtext: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  downloadButton: {
    marginTop: spacing.sm,
  },
  infoCard: {
    backgroundColor: colors.primaryLight,
    marginBottom: spacing.lg,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    marginLeft: spacing.sm,
    color: colors.textSecondary,
    lineHeight: 18,
    flex: 1,
  },
  thresholdSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  thresholdTitle: {
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  thresholdDescription: {
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  sliderContainer: {
    marginBottom: spacing.lg,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  sliderLabel: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  thresholdInfoCard: {
    backgroundColor: colors.primaryLight,
    marginTop: spacing.sm,
  },
  thresholdInfo: {
    color: colors.textSecondary,
    lineHeight: 18,
  },
  bold: {
    fontWeight: '600',
    color: colors.text,
  },
});
