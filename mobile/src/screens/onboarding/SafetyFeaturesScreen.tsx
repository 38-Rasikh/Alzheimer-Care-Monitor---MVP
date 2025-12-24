import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button, ProgressBar, Switch, Card } from 'react-native-paper';
import { colors, spacing } from '../../theme';

interface SafetyFeaturesProps {
  navigation: any;
  route: any;
}

export default function SafetyFeaturesScreen({ navigation, route }: SafetyFeaturesProps) {
  const { caregiver, patient } = route.params;
  const [wanderingAlerts, setWanderingAlerts] = useState(true);
  const [inactivityAlerts, setInactivityAlerts] = useState(true);
  const [medicationAlerts, setMedicationAlerts] = useState(true);
  const [emergencyButton, setEmergencyButton] = useState(true);

  const handleNext = () => {
    navigation.navigate('OnboardingReview', {
      caregiver,
      patient: {
        ...patient,
        safetyFeatures: {
          wanderingAlerts,
          inactivityAlerts,
          medicationAlerts,
          emergencyButton,
        },
      },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <ProgressBar progress={0.90} color={colors.primary} style={styles.progress} />
      
      <Text style={styles.title}>Safety Features</Text>
      <Text style={styles.subtitle}>
        Configure safety alerts and monitoring preferences
      </Text>

      <View style={styles.form}>
        <Card style={styles.featureCard}>
          <Card.Content>
            <View style={styles.featureHeader}>
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>🚨 Wandering Alerts</Text>
                <Text style={styles.featureDescription}>
                  Get notified if the patient leaves a designated safe zone
                </Text>
              </View>
              <Switch
                value={wanderingAlerts}
                onValueChange={setWanderingAlerts}
                color={colors.primary}
              />
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.featureCard}>
          <Card.Content>
            <View style={styles.featureHeader}>
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>⏰ Inactivity Alerts</Text>
                <Text style={styles.featureDescription}>
                  Receive alerts if there's no app activity for extended periods
                </Text>
              </View>
              <Switch
                value={inactivityAlerts}
                onValueChange={setInactivityAlerts}
                color={colors.primary}
              />
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.featureCard}>
          <Card.Content>
            <View style={styles.featureHeader}>
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>💊 Medication Alerts</Text>
                <Text style={styles.featureDescription}>
                  Get reminders when medications are due or missed
                </Text>
              </View>
              <Switch
                value={medicationAlerts}
                onValueChange={setMedicationAlerts}
                color={colors.primary}
              />
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.featureCard}>
          <Card.Content>
            <View style={styles.featureHeader}>
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>🆘 Emergency Button</Text>
                <Text style={styles.featureDescription}>
                  Enable quick access emergency button on patient screens
                </Text>
              </View>
              <Switch
                value={emergencyButton}
                onValueChange={setEmergencyButton}
                color={colors.primary}
              />
            </View>
          </Card.Content>
        </Card>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>✅ Recommended Setup</Text>
          <Text style={styles.infoText}>
            We recommend keeping all safety features enabled for comprehensive monitoring. 
            You can adjust these settings later based on your specific needs.
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
          Review Setup
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
    gap: spacing.md,
  },
  featureCard: {
    backgroundColor: colors.surface,
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  infoBox: {
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: 8,
    gap: spacing.sm,
    marginTop: spacing.md,
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
