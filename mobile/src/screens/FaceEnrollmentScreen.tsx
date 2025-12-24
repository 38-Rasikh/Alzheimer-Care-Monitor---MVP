/**
 * Face Enrollment Screen
 * Allows caregivers to enroll family members' faces
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Pressable,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import {
  Text,
  Button,
  Card,
  TextInput,
  ActivityIndicator,
  Chip,
  Divider,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';
import { getApiBaseUrl } from '../services/api/env';
import type {
  ConsentRecord,
  FaceEnrollment,
  FaceEnrollmentRequest,
} from '../types/recognition';

interface FaceEnrollmentScreenProps {
  patientId: string;
  onBack: () => void;
  onEnrollmentComplete?: (enrollment: FaceEnrollment) => void;
}

export function FaceEnrollmentScreen({
  patientId,
  onBack,
  onEnrollmentComplete,
}: FaceEnrollmentScreenProps) {
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [enrollments, setEnrollments] = useState<FaceEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [personName, setPersonName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

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

      // Load existing enrollments
      const enrollmentsRes = await fetch(
        `${API_BASE}/patient/${patientId}/face/enrollments`
      );
      const enrollmentsData = await enrollmentsRes.json();
      setEnrollments(enrollmentsData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load face recognition data');
    } finally {
      setLoading(false);
    }
  };

  const hasConsent = () => {
    const faceConsent = consents.find(c => c.type === 'face_recognition');
    return faceConsent?.granted && !faceConsent.revokedAt;
  };

  const handleTakePicture = async () => {
    if (!cameraPermission) {
      return;
    }

    if (!cameraPermission.granted) {
      const { granted } = await requestCameraPermission();
      if (!granted) {
        Alert.alert(
          'Camera Permission Required',
          'Camera access is needed to capture face photos for recognition.'
        );
        return;
      }
    }

    setShowCamera(true);
  };

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });
      
      setSelectedImageUri(photo.uri);
      setShowCamera(false);
    } catch (error) {
      console.error('Error capturing photo:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    }
  };

  const handleCancelCamera = () => {
    setShowCamera(false);
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

    if (!selectedImageUri) {
      Alert.alert('Validation Error', 'Please capture a face photo first');
      return;
    }

    try {
      setEnrolling(true);

      const enrollmentData: FaceEnrollmentRequest = {
        patientId,
        label: `${relationship.trim()} ${personName.trim()}`,
        relationship: relationship.trim(),
        notes: notes.trim() || undefined,
        imageBase64: 'simulated-image-data', // In real app, convert image to base64
      };

      const response = await fetch(
        `${API_BASE}/patient/${patientId}/face/enroll`,
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

      const newEnrollment: FaceEnrollment = await response.json();

      Alert.alert('Success', `${personName} has been enrolled successfully!`, [
        {
          text: 'OK',
          onPress: () => {
            setShowForm(false);
            setPersonName('');
            setRelationship('');
            setNotes('');
            setSelectedImageUri(null);
            loadData();
            onEnrollmentComplete?.(newEnrollment);
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Enrollment Failed', error.message);
    } finally {
      setEnrolling(false);
    }
  };

  const handleToggleStatus = async (enrollmentId: string, currentIsActive: boolean) => {
    try {
      const response = await fetch(
        `${API_BASE}/patient/${patientId}/face/enrollments/${enrollmentId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: currentIsActive ? 'disabled' : 'active' }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update enrollment status');
      }

      loadData();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDelete = async (enrollmentId: string, personName: string) => {
    Alert.alert(
      'Delete Enrollment',
      `Are you sure you want to delete the face enrollment for ${personName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingId(enrollmentId);
              const response = await fetch(
                `${API_BASE}/patient/${patientId}/face/enrollments/${enrollmentId}`,
                { method: 'DELETE' }
              );

              if (!response.ok) {
                throw new Error('Failed to delete enrollment');
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
        <Text style={styles.loadingText}>Loading face recognition...</Text>
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
            Face Recognition
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
            Face recognition consent must be granted before enrolling family members.
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

  // Camera Modal
  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="front"
        >
          <View style={styles.cameraOverlay}>
            <View style={styles.cameraHeader}>
              <Pressable onPress={handleCancelCamera} style={styles.cameraBackButton}>
                <MaterialCommunityIcons name="close" size={28} color="#fff" />
              </Pressable>
              <Text style={styles.cameraTitle}>Position face in center</Text>
            </View>
            
            <View style={styles.cameraGuide}>
              <View style={styles.faceOutline} />
            </View>

            <View style={styles.cameraControls}>
              <Button
                mode="contained"
                onPress={handleCapture}
                icon="camera"
                style={styles.captureButton}
                labelStyle={styles.captureButtonLabel}
              >
                Capture
              </Button>
            </View>
          </View>
        </CameraView>
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
          Face Recognition
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
              • Face images are converted to secure embeddings{'\n'}
              • Original photos are not stored{'\n'}
              • Data is encrypted and stored locally{'\n'}
              • You can delete enrollments anytime
            </Text>
          </Card.Content>
        </Card>

        {/* Enrollment Form */}
        {showForm ? (
          <Card style={styles.formCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.formTitle}>
                Enroll New Person
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

              {/* Camera Preview Area */}
              <View style={styles.cameraArea}>
                {selectedImageUri ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: selectedImageUri }}
                      style={styles.capturedImage}
                      resizeMode="cover"
                    />
                    <View style={styles.imageOverlay}>
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={32}
                        color={colors.success}
                      />
                      <Text variant="bodyMedium" style={styles.imageCaptured}>
                        Face Photo Captured
                      </Text>
                    </View>
                    <Button
                      mode="text"
                      onPress={handleTakePicture}
                      style={styles.retakeButton}
                    >
                      Retake Photo
                    </Button>
                  </View>
                ) : (
                  <View style={styles.cameraPlaceholder}>
                    <MaterialCommunityIcons
                      name="camera"
                      size={48}
                      color={colors.textSecondary}
                    />
                    <Text variant="bodyMedium" style={styles.cameraText}>
                      No photo captured
                    </Text>
                    <Button
                      mode="contained"
                      onPress={handleTakePicture}
                      icon="camera"
                      style={styles.cameraButton}
                    >
                      Take Photo
                    </Button>
                  </View>
                )}
              </View>

              <View style={styles.formActions}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setShowForm(false);
                    setPersonName('');
                    setRelationship('');
                    setNotes('');
                    setSelectedImageUri(null);
                  }}
                  style={styles.cancelButton}
                  disabled={enrolling}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleEnroll}
                  loading={enrolling}
                  disabled={enrolling}
                  icon="account-plus"
                  style={styles.enrollButton}
                >
                  Enroll
                </Button>
              </View>
            </Card.Content>
          </Card>
        ) : (
          <Button
            mode="contained"
            onPress={() => setShowForm(true)}
            icon="account-plus"
            style={styles.addButton}
          >
            Enroll New Person
          </Button>
        )}

        {/* Enrolled People List */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Enrolled People ({enrollments.length})
        </Text>

        {enrollments.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <MaterialCommunityIcons
                name="account-multiple-outline"
                size={48}
                color={colors.textSecondary}
              />
              <Text variant="bodyLarge" style={styles.emptyText}>
                No people enrolled yet
              </Text>
              <Text variant="bodySmall" style={styles.emptySubtext}>
                Enroll family members and caregivers to help identify visitors
              </Text>
            </Card.Content>
          </Card>
        ) : (
          enrollments.map(enrollment => (
            <Card key={enrollment.enrollmentId} style={styles.enrollmentCard}>
              <Card.Content>
                <View style={styles.enrollmentHeader}>
                  <View style={styles.enrollmentInfo}>
                    <View style={styles.enrollmentTitle}>
                      <Text variant="titleMedium">{enrollment.label}</Text>
                      {enrollment.status === 'active' ? (
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
                      {enrollment.relationship}
                    </Text>
                    {enrollment.notes && (
                      <Text variant="bodySmall" style={styles.enrollmentNotes}>
                        {enrollment.notes}
                      </Text>
                    )}
                    <Text variant="bodySmall" style={styles.enrollmentDate}>
                      Enrolled on{' '}
                      {new Date(enrollment.enrolledAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>

                  <MaterialCommunityIcons
                    name="account-circle"
                    size={48}
                    color={colors.primary}
                  />
                </View>

                <Divider style={styles.divider} />

                <View style={styles.enrollmentActions}>
                  <Button
                    mode="outlined"
                    onPress={() =>
                      handleToggleStatus(enrollment.enrollmentId, enrollment.status === 'active')
                    }
                    icon={enrollment.status === 'active' ? 'pause' : 'play'}
                    style={styles.actionButton}
                  >
                    {enrollment.status === 'active' ? 'Disable' : 'Enable'}
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() =>
                      handleDelete(enrollment.enrollmentId, enrollment.label)
                    }
                    loading={deletingId === enrollment.enrollmentId}
                    disabled={deletingId === enrollment.enrollmentId}
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
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  cameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl + 20,
    paddingBottom: spacing.md,
  },
  cameraBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 44,
  },
  cameraGuide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceOutline: {
    width: 250,
    height: 320,
    borderRadius: 125,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.8)',
    borderStyle: 'dashed',
  },
  cameraControls: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl + 20,
  },
  captureButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
  },
  captureButtonLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    height: 280,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  capturedImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 8,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
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
  cameraArea: {
    marginBottom: spacing.md,
  },
  cameraPlaceholder: {
    height: 200,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraText: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    color: colors.textSecondary,
  },
  cameraButton: {
    marginTop: spacing.sm,
  },
  imagePreview: {
    height: 200,
    backgroundColor: colors.successLight,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCaptured: {
    marginTop: spacing.sm,
    color: colors.success,
    fontWeight: '600',
  },
  retakeButton: {
    marginTop: spacing.sm,
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
  enrollmentCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  enrollmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  enrollmentInfo: {
    flex: 1,
  },
  enrollmentTitle: {
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
  enrollmentNotes: {
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: spacing.xs,
  },
  enrollmentDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  divider: {
    marginVertical: spacing.md,
  },
  enrollmentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});
