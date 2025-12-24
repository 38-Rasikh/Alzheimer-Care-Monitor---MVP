import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { colors, spacing } from '../../theme';
import { useAuth } from '../../state/AuthContext';

interface OrientationPreviewProps {
  navigation: any;
  route: any;
}

export default function OrientationPreviewScreen({ navigation, route }: OrientationPreviewProps) {
  const { login } = useAuth();
  const { patientId, caregiverId, caregiver } = route.params;

  const handleContinue = async () => {
    // Log in as caregiver after completing onboarding
    await login({
      id: caregiverId,
      displayName: `${caregiver.firstName} ${caregiver.lastName}`,
      email: caregiver.email,
      phone: caregiver.phone,
      role: 'caregiver',
      linkedPatientIds: [patientId],
      linkedCaregiverIds: [],
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>Setup Complete!</Text>
        <Text style={styles.subtitle}>
          Your account has been created successfully
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>What's Next?</Text>
          
          <View style={styles.stepList}>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>1</Text>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Caregiver Dashboard</Text>
                <Text style={styles.stepDescription}>
                  You'll access the caregiver dashboard to monitor, manage schedules, and customize settings
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <Text style={styles.stepNumber}>2</Text>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Patient Device Setup</Text>
                <Text style={styles.stepDescription}>
                  Log in to the patient's device using their credentials to activate the patient interface
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <Text style={styles.stepNumber}>3</Text>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Customize Experience</Text>
                <Text style={styles.stepDescription}>
                  Add photos, set medication reminders, and configure additional safety features
                </Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.infoCard}>
        <Card.Content>
          <Text style={styles.infoTitle}>📱 Patient Login Credentials</Text>
          <Text style={styles.infoText}>
            The patient can log in on their separate device. You'll find login instructions 
            in the caregiver dashboard under "Patient Settings".
          </Text>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleContinue}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        Go to Dashboard
      </Button>
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
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  stepList: {
    gap: spacing.lg,
  },
  step: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 32,
  },
  stepContent: {
    flex: 1,
    gap: spacing.xs,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  stepDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: colors.primaryLight,
    marginBottom: spacing.xl,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  button: {
    marginTop: spacing.md,
  },
  buttonContent: {
    height: 56,
  },
});
