import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, ProgressBar } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';
import { colors, spacing } from '../../theme';

interface PatientBasicInfoProps {
  navigation: any;
  route: any;
}

export default function PatientBasicInfoScreen({ navigation, route }: PatientBasicInfoProps) {
  const { caregiver } = route.params;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    else if (dateOfBirth > new Date()) newErrors.dateOfBirth = 'Date must be in the past';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      navigation.navigate('DiagnosisStage', {
        caregiver,
        patient: {
          firstName,
          lastName,
          preferredName: preferredName || firstName,
          dateOfBirth: dateOfBirth?.toISOString(),
        },
      });
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Select date';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ProgressBar progress={0.28} color={colors.primary} style={styles.progress} />
        
        <Text style={styles.title}>Patient Information</Text>
        <Text style={styles.subtitle}>
          Tell us about the person you'll be caring for
        </Text>

        <View style={styles.form}>
          <TextInput
            label="First Name *"
            value={firstName}
            onChangeText={setFirstName}
            mode="outlined"
            style={styles.input}
            error={!!errors.firstName}
          />
          {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}

          <TextInput
            label="Last Name *"
            value={lastName}
            onChangeText={setLastName}
            mode="outlined"
            style={styles.input}
            error={!!errors.lastName}
          />
          {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}

          <TextInput
            label="Preferred Name (Optional)"
            value={preferredName}
            onChangeText={setPreferredName}
            mode="outlined"
            placeholder="What they like to be called"
            style={styles.input}
          />

          <Button
            mode="outlined"
            onPress={() => setShowDatePicker(true)}
            style={[styles.dateButton, errors.dateOfBirth && styles.errorBorder]}
            contentStyle={styles.dateButtonContent}
          >
            {formatDate(dateOfBirth)}
          </Button>
          {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth}</Text>}
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

      <DatePickerModal
        locale="en"
        mode="single"
        visible={showDatePicker}
        onDismiss={() => setShowDatePicker(false)}
        date={dateOfBirth}
        onConfirm={(params: { date: Date | undefined }) => {
          setShowDatePicker(false);
          setDateOfBirth(params.date);
        }}
        validRange={{ endDate: new Date() }}
      />
    </KeyboardAvoidingView>
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
  input: {
    backgroundColor: colors.surface,
  },
  dateButton: {
    justifyContent: 'flex-start',
  },
  dateButtonContent: {
    height: 56,
    justifyContent: 'flex-start',
  },
  errorBorder: {
    borderColor: colors.error,
    borderWidth: 1,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: -spacing.sm,
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
