import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button, ProgressBar, Checkbox } from 'react-native-paper';
import { colors, spacing } from '../../theme';

interface ConsentCollectionProps {
  navigation: any;
  route: any;
}

export default function ConsentCollectionScreen({ navigation, route }: ConsentCollectionProps) {
  const { caregiver, patient } = route.params;
  const [dataSharing, setDataSharing] = useState(false);
  const [locationTracking, setLocationTracking] = useState(false);
  const [emergencyAccess, setEmergencyAccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!emergencyAccess) {
      newErrors.emergencyAccess = 'Emergency access consent is required for safety';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      navigation.navigate('SafetyFeatures', {
        caregiver,
        patient: {
          ...patient,
          consents: {
            dataSharing,
            locationTracking,
            emergencyAccess,
            timestamp: new Date().toISOString(),
          },
        },
      });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <ProgressBar progress={0.84} color={colors.primary} style={styles.progress} />
      
      <Text style={styles.title}>Privacy & Consent</Text>
      <Text style={styles.subtitle}>
        Review and provide consent for the following permissions
      </Text>

      <View style={styles.form}>
        <View style={styles.consentCard}>
          <View style={styles.consentHeader}>
            <Checkbox
              status={dataSharing ? 'checked' : 'unchecked'}
              onPress={() => setDataSharing(!dataSharing)}
              color={colors.primary}
            />
            <Text style={styles.consentTitle}>Data Sharing</Text>
          </View>
          <Text style={styles.consentDescription}>
            Allow sharing anonymized data with healthcare providers to improve care recommendations
          </Text>
          <Text style={styles.optional}>Optional</Text>
        </View>

        <View style={styles.consentCard}>
          <View style={styles.consentHeader}>
            <Checkbox
              status={locationTracking ? 'checked' : 'unchecked'}
              onPress={() => setLocationTracking(!locationTracking)}
              color={colors.primary}
            />
            <Text style={styles.consentTitle}>Location Tracking</Text>
          </View>
          <Text style={styles.consentDescription}>
            Enable real-time location tracking to help locate the patient if they wander
          </Text>
          <Text style={styles.optional}>Optional (Recommended)</Text>
        </View>

        <View style={[styles.consentCard, errors.emergencyAccess && styles.errorCard]}>
          <View style={styles.consentHeader}>
            <Checkbox
              status={emergencyAccess ? 'checked' : 'unchecked'}
              onPress={() => setEmergencyAccess(!emergencyAccess)}
              color={colors.primary}
            />
            <Text style={styles.consentTitle}>Emergency Access *</Text>
          </View>
          <Text style={styles.consentDescription}>
            Allow emergency contacts to access patient location and health information in urgent situations
          </Text>
          <Text style={styles.required}>Required for Safety</Text>
          {errors.emergencyAccess && (
            <Text style={styles.errorText}>{errors.emergencyAccess}</Text>
          )}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>🔒 Your Privacy Matters</Text>
          <Text style={styles.infoText}>
            All data is encrypted and stored securely. You can update these preferences anytime in settings.
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          Back
        </Button>
        <Button
          mode="contained"
          onPress={handleNext}
          style={styles.nextButton}
        >
          Next
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
  form: {
    gap: spacing.lg,
  },
  consentCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  errorCard: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  consentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  consentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  consentDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginLeft: 40,
  },
  optional: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginLeft: 40,
  },
  required: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 40,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginLeft: 40,
  },
  infoBox: {
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: 8,
    gap: spacing.sm,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
});
