/**
 * Voice Enrollment Screen
 * Allows caregivers to enroll voice profiles
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
} from 'react-native';
import { Audio } from 'expo-av';
import {
  Text,
  Button,
  Card,
  TextInput,
  ActivityIndicator,
  Chip,
  Divider,
  ProgressBar,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';
import { getApiBaseUrl } from '../services/api/env';
import type {
  ConsentRecord,
  VoiceProfile,
  VoiceEnrollmentRequest,
} from '../types/recognition';

interface VoiceEnrollmentScreenProps {
  patientId: string;
  onBack: () => void;
  onEnrollmentComplete?: (profile: VoiceProfile) => void;
}

export function VoiceEnrollmentScreen({
  patientId,
  onBack,
  onEnrollmentComplete,
}: VoiceEnrollmentScreenProps) {
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [profiles, setProfiles] = useState<VoiceProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [recording, setRecording] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [personName, setPersonName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [notes, setNotes] = useState('');
  const [recordedSamples, setRecordedSamples] = useState<number>(0);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [audioRecording, setAudioRecording] = useState<Audio.Recording | null>(null);
  const [recordedUris, setRecordedUris] = useState<string[]>([]);

  const API_BASE = `${getApiBaseUrl()}/api`;
  const REQUIRED_SAMPLES = 3;

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

      // Load existing profiles
      const profilesRes = await fetch(
        `${API_BASE}/patient/${patientId}/voice/profiles`
      );
      const profilesData = await profilesRes.json();
      setProfiles(profilesData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load voice recognition data');
    } finally {
      setLoading(false);
    }
  };

  const hasConsent = () => {
    const voiceConsent = consents.find(c => c.type === 'voice_recognition');
    return voiceConsent?.granted && !voiceConsent.revokedAt;
  };

  const handleStartRecording = async () => {
    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Microphone Permission Required',
          'Microphone access is needed to record voice samples for recognition.'
        );
        return;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      
      setAudioRecording(recording);
      setRecording(true);
      setRecordingProgress(0);

      // Auto-stop after 5 seconds
      const duration = 5000;
      const interval = 100;
      let elapsed = 0;

      const timer = setInterval(() => {
        elapsed += interval;
        setRecordingProgress(elapsed / duration);

        if (elapsed >= duration) {
          clearInterval(timer);
          handleStopRecording();
        }
      }, interval);
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
      setRecording(false);
    }
  };

  const handleStopRecording = async () => {
    if (!audioRecording) return;

    try {
      await audioRecording.stopAndUnloadAsync();
      const uri = audioRecording.getURI();
      
      if (uri) {
        setRecordedUris(prev => [...prev, uri]);
        setRecordedSamples(prev => prev + 1);
      }
      
      setAudioRecording(null);
      setRecording(false);
      setRecordingProgress(0);
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to save recording.');
    }
  };

  const handleEnroll = async () => {
    if (!personName.trim()) {
      Alert.alert('Validation Error', 'Please enter the person\'s name');
      return;
    }

    if (!relationship.trim()) {
      Alert.alert('Validation Error', 'Please enter the relationship');
      return;
    }

    if (recordedSamples < REQUIRED_SAMPLES) {
      Alert.alert(
        'Validation Error',
        `Please record at least ${REQUIRED_SAMPLES} voice samples`
      );
      return;
    }

    try {
      setEnrolling(true);

      // Create initial profile with first sample
      const enrollmentData = {
        audioBase64: 'simulated-audio-base64',
        label: `${relationship.trim()} ${personName.trim()}`,
        relationship: relationship.trim(),
        duration: 3,
        sampleQuality: 'medium' as const,
        notes: notes.trim() || undefined,
      };

      const response = await fetch(
        `${API_BASE}/patient/${patientId}/voice/enroll`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(enrollmentData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Enrollment failed');
      }

      const newProfile: VoiceProfile = await response.json();

      Alert.alert('Success', `Voice profile for ${personName} has been created!`, [
        {
          text: 'OK',
          onPress: () => {
            setShowForm(false);
            setPersonName('');
            setRelationship('');
            setNotes('');
            setRecordedSamples(0);
            loadData();
            onEnrollmentComplete?.(newProfile);
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Enrollment Failed', error.message);
    } finally {
      setEnrolling(false);
    }
  };

  const handleToggleStatus = async (profileId: string, currentIsActive: boolean) => {
    try {
      const response = await fetch(
        `${API_BASE}/patient/${patientId}/voice/profiles/${profileId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: currentIsActive ? 'disabled' : 'active' }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update profile status');
      }

      loadData();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDelete = async (profileId: string, personName: string) => {
    Alert.alert(
      'Delete Voice Profile',
      `Are you sure you want to delete the voice profile for ${personName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingId(profileId);
              const response = await fetch(
                `${API_BASE}/patient/${patientId}/voice/profiles/${profileId}`,
                { method: 'DELETE' }
              );

              if (!response.ok) {
                throw new Error('Failed to delete profile');
              }

              loadData();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading voice recognition...</Text>
      </View>
    );
  }

  if (!hasConsent()) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </Pressable>
          <Text variant="headlineSmall" style={styles.headerTitle}>
            Voice Recognition
          </Text>
        </View>

        <View style={styles.consentRequired}>
          <MaterialCommunityIcons
            name="shield-alert"
            size={64}
            color={colors.warning}
          />
          <Text variant="titleLarge" style={styles.consentTitle}>
            Consent Required
          </Text>
          <Text variant="bodyMedium" style={styles.consentMessage}>
            Voice recognition consent must be granted before enrolling voice profiles.
            Please enable this feature in Safety Settings.
          </Text>
          <Button
            mode="contained"
            onPress={onBack}
            style={styles.consentButton}
            icon="cog"
          >
            Go to Settings
          </Button>
        </View>
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
          Voice Recognition
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Info Card */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoHeader}>
              <MaterialCommunityIcons
                name="information"
                size={24}
                color={colors.primary}
              />
              <Text variant="titleMedium" style={styles.infoTitle}>
                Privacy & Security
              </Text>
            </View>
            <Text variant="bodySmall" style={styles.infoText}>
              • Voice recordings are converted to secure voiceprints{'\n'}
              • Original audio files are not stored{'\n'}
              • Data is encrypted and stored locally{'\n'}
              • You can delete profiles anytime
            </Text>
          </Card.Content>
        </Card>

        {/* Enrollment Form */}
        {showForm ? (
          <Card style={styles.formCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.formTitle}>
                Create Voice Profile
              </Text>

              <TextInput
                label="Person's Name *"
                value={personName}
                onChangeText={setPersonName}
                mode="outlined"
                style={styles.input}
                placeholder="e.g., Sarah (Daughter)"
              />

              <TextInput
                label="Relationship *"
                value={relationship}
                onChangeText={setRelationship}
                mode="outlined"
                style={styles.input}
                placeholder="e.g., Daughter, Son, Caregiver"
              />

              <TextInput
                label="Notes (Optional)"
                value={notes}
                onChangeText={setNotes}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
                placeholder="Additional information..."
              />

              {/* Recording Area */}
              <Card style={styles.recordingCard}>
                <Card.Content>
                  <View style={styles.recordingHeader}>
                    <Text variant="titleSmall">Voice Samples</Text>
                    <Chip
                      icon={
                        recordedSamples >= REQUIRED_SAMPLES
                          ? 'check-circle'
                          : 'circle-outline'
                      }
                      style={
                        recordedSamples >= REQUIRED_SAMPLES
                          ? styles.completeChip
                          : styles.incompleteChip
                      }
                      textStyle={
                        recordedSamples >= REQUIRED_SAMPLES
                          ? styles.completeChipText
                          : styles.incompleteChipText
                      }
                    >
                      {recordedSamples}/{REQUIRED_SAMPLES}
                    </Chip>
                  </View>

                  <Text variant="bodySmall" style={styles.recordingInstructions}>
                    Record at least {REQUIRED_SAMPLES} samples in a quiet environment.
                    Each sample will be 5 seconds. Speak naturally and clearly.
                  </Text>

                  {recording ? (
                    <View style={styles.recordingActive}>
                      <MaterialCommunityIcons
                        name="microphone"
                        size={48}
                        color={colors.error}
                      />
                      <Text variant="bodyLarge" style={styles.recordingText}>
                        Recording...
                      </Text>
                      <ProgressBar
                        progress={recordingProgress}
                        color={colors.error}
                        style={styles.progressBar}
                      />
                    </View>
                  ) : (
                    <View style={styles.recordingIdle}>
                      {recordedSamples > 0 ? (
                        <>
                          <MaterialCommunityIcons
                            name="waveform"
                            size={48}
                            color={colors.success}
                          />
                          <Text variant="bodyMedium" style={styles.samplesRecorded}>
                            {recordedSamples} sample(s) recorded
                          </Text>
                        </>
                      ) : (
                        <>
                          <MaterialCommunityIcons
                            name="microphone-outline"
                            size={48}
                            color={colors.textSecondary}
                          />
                          <Text variant="bodyMedium" style={styles.noSamples}>
                            No samples recorded yet
                          </Text>
                        </>
                      )}
                      <Button
                        mode="contained"
                        onPress={handleStartRecording}
                        icon="microphone"
                        style={styles.recordButton}
                      >
                        {recordedSamples > 0 ? 'Record Another' : 'Start Recording'}
                      </Button>
                      {recordedSamples > 0 && (
                        <Button
                          mode="text"
                          onPress={() => {
                            setRecordedSamples(0);
                            setRecordedUris([]);
                          }}
                          icon="refresh"
                          style={styles.clearButton}
                        >
                          Clear All Samples
                        </Button>
                      )}
                    </View>
                  )}
                </Card.Content>
              </Card>

              <View style={styles.formActions}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setShowForm(false);
                    setPersonName('');
                    setRelationship('');
                    setNotes('');
                    setRecordedSamples(0);
                    setRecordedUris([]);
                  }}
                  style={styles.cancelButton}
                  disabled={enrolling || recording}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleEnroll}
                  loading={enrolling}
                  disabled={
                    enrolling || recording || recordedSamples < REQUIRED_SAMPLES
                  }
                  icon="account-voice"
                  style={styles.enrollButton}
                >
                  Create Profile
                </Button>
              </View>
            </Card.Content>
          </Card>
        ) : (
          <Button
            mode="contained"
            onPress={() => setShowForm(true)}
            icon="account-voice"
            style={styles.addButton}
          >
            Create Voice Profile
          </Button>
        )}

        {/* Voice Profiles List */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Voice Profiles ({profiles.length})
        </Text>

        {profiles.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <MaterialCommunityIcons
                name="account-voice"
                size={48}
                color={colors.textSecondary}
              />
              <Text variant="bodyLarge" style={styles.emptyText}>
                No voice profiles yet
              </Text>
              <Text variant="bodySmall" style={styles.emptySubtext}>
                Create voice profiles to help identify familiar voices
              </Text>
            </Card.Content>
          </Card>
        ) : (
          profiles.map(profile => (
            <Card key={profile.profileId} style={styles.profileCard}>
              <Card.Content>
                <View style={styles.profileHeader}>
                  <View style={styles.profileInfo}>
                    <View style={styles.profileTitle}>
                      <Text variant="titleMedium">{profile.label}</Text>
                      {profile.status === 'active' ? (
                        <Chip
                          icon="check-circle"
                          mode="flat"
                          style={styles.activeChip}
                          textStyle={styles.activeChipText}
                        >
                          Active
                        </Chip>
                      ) : (
                        <Chip
                          icon="close-circle"
                          mode="flat"
                          style={styles.inactiveChip}
                          textStyle={styles.inactiveChipText}
                        >
                          Disabled
                        </Chip>
                      )}
                    </View>
                    <Text variant="bodyMedium" style={styles.relationship}>
                      {profile.relationship}
                    </Text>
                    {profile.notes && (
                      <Text variant="bodySmall" style={styles.profileNotes}>
                        {profile.notes}
                      </Text>
                    )}
                    <Text variant="bodySmall" style={styles.profileSamples}>
                      {profile.sampleCount} voice sample(s)
                    </Text>
                    <Text variant="bodySmall" style={styles.profileDate}>
                      Created on{' '}
                      {new Date(profile.enrolledAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>

                  <MaterialCommunityIcons
                    name="waveform"
                    size={48}
                    color={colors.primary}
                  />
                </View>

                <Divider style={styles.divider} />

                <View style={styles.profileActions}>
                  <Button
                    mode="outlined"
                    onPress={() => handleToggleStatus(profile.profileId, profile.status === 'active')}
                    icon={profile.status === 'active' ? 'pause' : 'play'}
                    style={styles.actionButton}
                  >
                    {profile.status === 'active' ? 'Disable' : 'Enable'}
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => handleDelete(profile.profileId, profile.label)}
                    loading={deletingId === profile.profileId}
                    disabled={deletingId === profile.profileId}
                    icon="delete"
                    textColor={colors.error}
                    style={styles.actionButton}
                  >
                    Delete
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))
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
  consentRequired: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  consentTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  consentMessage: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  consentButton: {
    marginTop: spacing.md,
  },
  infoCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoTitle: {
    marginLeft: spacing.sm,
    fontWeight: '600',
  },
  infoText: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
  formCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  formTitle: {
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  input: {
    marginBottom: spacing.md,
  },
  recordingCard: {
    backgroundColor: colors.background,
    marginBottom: spacing.md,
  },
  recordingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  completeChip: {
    backgroundColor: colors.successLight,
  },
  completeChipText: {
    color: colors.success,
  },
  incompleteChip: {
    backgroundColor: colors.border,
  },
  incompleteChipText: {
    color: colors.textSecondary,
  },
  recordingInstructions: {
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  recordingActive: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  recordingText: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    color: colors.error,
    fontWeight: '600',
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
  },
  recordingIdle: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  samplesRecorded: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    color: colors.success,
    fontWeight: '600',
  },
  noSamples: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    color: colors.textSecondary,
  },
  recordButton: {
    marginTop: spacing.sm,
  },
  clearButton: {
    marginTop: spacing.xs,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  cancelButton: {
    flex: 1,
    marginRight: spacing.sm,
  },
  enrollButton: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  addButton: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: colors.surface,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  profileCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    flexWrap: 'wrap',
  },
  activeChip: {
    marginLeft: spacing.sm,
    backgroundColor: colors.successLight,
  },
  activeChipText: {
    color: colors.success,
    fontSize: 11,
  },
  inactiveChip: {
    marginLeft: spacing.sm,
    backgroundColor: colors.border,
  },
  inactiveChipText: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  relationship: {
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  profileNotes: {
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: spacing.xs,
  },
  profileSamples: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  profileDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  divider: {
    marginVertical: spacing.md,
  },
  profileActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});
