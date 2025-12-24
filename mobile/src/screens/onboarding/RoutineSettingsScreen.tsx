import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button, ProgressBar, Switch, TextInput } from 'react-native-paper';
import { colors, spacing } from '../../theme';

interface RoutineSettingsProps {
  navigation: any;
  route: any;
}

export default function RoutineSettingsScreen({ navigation, route }: RoutineSettingsProps) {
  const { caregiver, patient } = route.params;
  const [wakeTime, setWakeTime] = useState('08:00');
  const [bedTime, setBedTime] = useState('21:00');
  const [mealtimeReminders, setMealtimeReminders] = useState(true);
  const [medicationReminders, setMedicationReminders] = useState(true);
  const [breakfastTime, setBreakfastTime] = useState('08:30');
  const [lunchTime, setLunchTime] = useState('12:30');
  const [dinnerTime, setDinnerTime] = useState('18:30');

  const handleNext = () => {
    navigation.navigate('ConsentCollection', {
      caregiver,
      patient: {
        ...patient,
        routine: {
          wakeTime,
          bedTime,
          mealtimeReminders,
          medicationReminders,
          mealtimes: mealtimeReminders ? {
            breakfast: breakfastTime,
            lunch: lunchTime,
            dinner: dinnerTime,
          } : undefined,
        },
      },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <ProgressBar progress={0.70} color={colors.primary} style={styles.progress} />
      
      <Text style={styles.title}>Daily Routine</Text>
      <Text style={styles.subtitle}>
        Set up a daily schedule to help maintain consistency and send timely reminders
      </Text>

      <View style={styles.form}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sleep Schedule</Text>
          
          <View style={styles.timeRow}>
            <View style={styles.timeInput}>
              <Text style={styles.label}>Wake Time</Text>
              <TextInput
                value={wakeTime}
                onChangeText={setWakeTime}
                mode="outlined"
                placeholder="08:00"
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
            
            <View style={styles.timeInput}>
              <Text style={styles.label}>Bed Time</Text>
              <TextInput
                value={bedTime}
                onChangeText={setBedTime}
                mode="outlined"
                placeholder="21:00"
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Text style={styles.sectionTitle}>Mealtime Reminders</Text>
              <Text style={styles.helperText}>Get notifications for meals</Text>
            </View>
            <Switch
              value={mealtimeReminders}
              onValueChange={setMealtimeReminders}
              color={colors.primary}
            />
          </View>

          {mealtimeReminders && (
            <View style={styles.mealtimeInputs}>
              <TextInput
                label="Breakfast"
                value={breakfastTime}
                onChangeText={setBreakfastTime}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
              />
              <TextInput
                label="Lunch"
                value={lunchTime}
                onChangeText={setLunchTime}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
              />
              <TextInput
                label="Dinner"
                value={dinnerTime}
                onChangeText={setDinnerTime}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Text style={styles.sectionTitle}>Medication Reminders</Text>
              <Text style={styles.helperText}>You can set specific times later</Text>
            </View>
            <Switch
              value={medicationReminders}
              onValueChange={setMedicationReminders}
              color={colors.primary}
            />
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 You can customize these settings later in the app
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
    gap: spacing.xl,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  helperText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  timeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timeInput: {
    flex: 1,
  },
  input: {
    backgroundColor: colors.surface,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    flex: 1,
  },
  mealtimeInputs: {
    gap: spacing.md,
    paddingLeft: spacing.md,
  },
  infoBox: {
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: 8,
  },
  infoText: {
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
  nextButton: {
    flex: 2,
  },
});
