import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button, ProgressBar, SegmentedButtons, TextInput } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';
import { colors, spacing } from '../../theme';

interface DiagnosisStageProps {
  navigation: any;
  route: any;
}

export default function DiagnosisStageScreen({ navigation, route }: DiagnosisStageProps) {
  const { caregiver, patient } = route.params;
  const [diagnosis, setDiagnosis] = useState("Alzheimer's Disease");
  const [stage, setStage] = useState<'mild' | 'moderate' | 'severe' | ''>('');
  const [diagnosisDate, setDiagnosisDate] = useState<Date | undefined>();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!stage) newErrors.stage = 'Please select a stage';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      navigation.navigate('EmergencyContacts', {
        caregiver,
        patient: {
          ...patient,
          diagnosis,
          stage,
          diagnosisDate: diagnosisDate?.toISOString(),
        },
      });
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Optional';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <ProgressBar progress={0.42} color={colors.primary} style={styles.progress} />
      
      <Text style={styles.title}>Diagnosis & Stage</Text>
      <Text style={styles.subtitle}>
        This helps us customize the experience and provide appropriate support
      </Text>

      <View style={styles.form}>
        <TextInput
          label="Diagnosis"
          value={diagnosis}
          onChangeText={setDiagnosis}
          mode="outlined"
          style={styles.input}
        />

        <View style={styles.section}>
          <Text style={styles.label}>Disease Stage *</Text>
          <Text style={styles.helperText}>
            This guides the UI complexity and reminder frequency
          </Text>
          <SegmentedButtons
            value={stage}
            onValueChange={(value) => setStage(value as any)}
            buttons={[
              { value: 'mild', label: 'Mild' },
              { value: 'moderate', label: 'Moderate' },
              { value: 'severe', label: 'Severe' },
            ]}
            style={styles.segmented}
          />
          {errors.stage && <Text style={styles.errorText}>{errors.stage}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Diagnosis Date (Optional)</Text>
          <Button
            mode="outlined"
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}
            contentStyle={styles.dateButtonContent}
          >
            {formatDate(diagnosisDate)}
          </Button>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Stage Guidelines:</Text>
          <Text style={styles.infoText}>
            • <Text style={styles.bold}>Mild:</Text> Some memory loss, can manage daily activities{'\n'}
            • <Text style={styles.bold}>Moderate:</Text> Needs help with daily tasks, confusion increases{'\n'}
            • <Text style={styles.bold}>Severe:</Text> Requires full-time care, significant memory loss
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

      <DatePickerModal
        locale="en"
        mode="single"
        visible={showDatePicker}
        onDismiss={() => setShowDatePicker(false)}
        date={diagnosisDate}
        onConfirm={(params: { date: Date | undefined }) => {
          setShowDatePicker(false);
          setDiagnosisDate(params.date);
        }}
        validRange={{ endDate: new Date() }}
      />
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
  input: {
    backgroundColor: colors.surface,
  },
  section: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  helperText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  segmented: {
    marginTop: spacing.sm,
  },
  dateButton: {
    justifyContent: 'flex-start',
  },
  dateButtonContent: {
    height: 48,
    justifyContent: 'flex-start',
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
  },
  infoBox: {
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  bold: {
    fontWeight: '600',
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
