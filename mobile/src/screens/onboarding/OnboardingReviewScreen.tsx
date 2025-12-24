import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, Button, ProgressBar, Card, ActivityIndicator } from 'react-native-paper';
import { colors, spacing } from '../../theme';
import { onboardingApi } from '../../services/api';

interface OnboardingReviewProps {
  navigation: any;
  route: any;
}

export default function OnboardingReviewScreen({ navigation, route }: OnboardingReviewProps) {
  const { caregiver, patient } = route.params;
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    
    try {
      // Generate IDs for caregiver and patient
      const caregiverId = `u-care-${Date.now()}`;
      const patientId = `p-${Date.now()}`;

      // Transform consent data to match API schema
      const consents = [];
      if (patient.consents?.locationTracking) {
        consents.push({ type: 'location' as const, granted: true });
      }
      if (patient.consents?.dataSharing) {
        consents.push({ type: 'biometrics' as const, granted: true });
      }
      if (patient.consents?.emergencyAccess) {
        consents.push({ type: 'ai_assistant' as const, granted: true });
      }

      // Transform routine data
      const routine = [];
      if (patient.routine?.wakeTime) {
        routine.push({
          id: `r-wake-${Date.now()}`,
          label: 'Wake up',
          time: patient.routine.wakeTime,
          category: 'orientation' as const,
        });
      }
      if (patient.routine?.bedTime) {
        routine.push({
          id: `r-bed-${Date.now()}`,
          label: 'Bedtime',
          time: patient.routine.bedTime,
          category: 'orientation' as const,
        });
      }
      if (patient.routine?.mealtimeReminders && patient.routine?.mealtimes) {
        routine.push({
          id: `r-breakfast-${Date.now()}`,
          label: 'Breakfast',
          time: patient.routine.mealtimes.breakfast,
          category: 'meal' as const,
        });
        routine.push({
          id: `r-lunch-${Date.now()}`,
          label: 'Lunch',
          time: patient.routine.mealtimes.lunch,
          category: 'meal' as const,
        });
        routine.push({
          id: `r-dinner-${Date.now()}`,
          label: 'Dinner',
          time: patient.routine.mealtimes.dinner,
          category: 'meal' as const,
        });
      }

      // Transform emergency contacts
      const emergencyContacts = patient.emergencyContacts?.map((contact: any, index: number) => ({
        name: contact.name,
        relation: contact.relationship || 'Emergency Contact',
        phone: contact.phone,
        priority: index + 1,
      })) || [];

      const response = await onboardingApi.submitOnboarding({
        patientId,
        displayName: `${patient.firstName} ${patient.lastName}`,
        stage: patient.stage,
        diagnosis: patient.diagnosis,
        diagnosisDate: patient.diagnosisDate,
        caregiverUserId: caregiverId,
        caregiverInfo: {
          displayName: `${caregiver.firstName} ${caregiver.lastName}`,
          email: caregiver.email,
          phone: caregiver.phone,
        },
        consents,
        emergencyContacts,
        routine,
      });

      if (!response.success) {
        throw new Error('Failed to submit onboarding data');
      }
      
      // Navigate to completion screen
      navigation.navigate('OrientationPreview', {
        patientId,
        caregiverId,
        caregiver,
        patient,
      });
    } catch (error) {
      Alert.alert(
        'Submission Error',
        `Failed to complete onboarding: ${error instanceof Error ? error.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
      console.error('Onboarding submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <ProgressBar progress={0.95} color={colors.primary} style={styles.progress} />
      
      <Text style={styles.title}>Review & Confirm</Text>
      <Text style={styles.subtitle}>
        Please review the information before completing setup
      </Text>

      <View style={styles.sections}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Caregiver Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{caregiver.firstName} {caregiver.lastName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{caregiver.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{caregiver.phone}</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Patient Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{patient.firstName} {patient.lastName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Preferred Name:</Text>
              <Text style={styles.value}>{patient.preferredName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Diagnosis:</Text>
              <Text style={styles.value}>{patient.diagnosis}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Stage:</Text>
              <Text style={styles.value}>{patient.stage}</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Emergency Contacts</Text>
            {patient.emergencyContacts?.map((contact: any, index: number) => (
              <View key={index} style={styles.contactItem}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactDetails}>
                  {contact.relationship && `${contact.relationship} • `}
                  {contact.phone}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Daily Routine</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Wake Time:</Text>
              <Text style={styles.value}>{patient.routine?.wakeTime}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Bed Time:</Text>
              <Text style={styles.value}>{patient.routine?.bedTime}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Mealtime Reminders:</Text>
              <Text style={styles.value}>{patient.routine?.mealtimeReminders ? 'Enabled' : 'Disabled'}</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Privacy & Safety</Text>
            <View style={styles.featureList}>
              <Text style={styles.feature}>
                {patient.consents?.dataSharing ? '✅' : '❌'} Data Sharing
              </Text>
              <Text style={styles.feature}>
                {patient.consents?.locationTracking ? '✅' : '❌'} Location Tracking
              </Text>
              <Text style={styles.feature}>
                {patient.consents?.emergencyAccess ? '✅' : '❌'} Emergency Access
              </Text>
              <Text style={styles.feature}>
                {patient.safetyFeatures?.wanderingAlerts ? '✅' : '❌'} Wandering Alerts
              </Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          disabled={submitting}
          style={styles.backButton}
        >
          Back
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={submitting}
          style={styles.submitButton}
        >
          {submitting ? <ActivityIndicator color="white" /> : 'Complete Setup'}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  progress: {
    marginBottom: spacing.lg,
    height: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  sections: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    width: 140,
  },
  value: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
    fontWeight: '500',
  },
  contactItem: {
    marginBottom: spacing.sm,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  contactDetails: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  featureList: {
    gap: spacing.xs,
  },
  feature: {
    fontSize: 14,
    color: colors.text,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  backButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});
