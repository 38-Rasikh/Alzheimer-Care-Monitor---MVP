import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Dialog, Portal, Text, Button, TextInput, RadioButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';

interface MedicationLogDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (data: { medicationId: string; status: 'taken' | 'missed'; notes?: string; timestamp: string }) => void;
  medications: Array<{
    medicationId: string;
    name: string;
    dosage: string;
  }>;
}

export function MedicationLogDialog({ visible, onDismiss, onSubmit, medications }: MedicationLogDialogProps) {
  const [selectedMed, setSelectedMed] = useState(medications[0]?.medicationId || '');
  const [status, setStatus] = useState<'taken' | 'missed'>('taken');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    onSubmit({
      medicationId: selectedMed,
      status,
      notes: notes.trim() || undefined,
      timestamp: new Date().toISOString(),
    });
    // Reset form
    setStatus('taken');
    setNotes('');
    onDismiss();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title>Log Medication</Dialog.Title>
        <Dialog.ScrollArea>
          <ScrollView>
            <View style={styles.content}>
              {/* Medication Selection */}
              <Text variant="bodyMedium" style={styles.label}>
                Select Medication
              </Text>
              <RadioButton.Group onValueChange={setSelectedMed} value={selectedMed}>
                {medications.map((med) => (
                  <RadioButton.Item
                    key={med.medicationId}
                    label={`${med.name} - ${med.dosage}`}
                    value={med.medicationId}
                  />
                ))}
              </RadioButton.Group>

              {/* Status Selection */}
              <Text variant="bodyMedium" style={styles.label}>
                Status
              </Text>
              <RadioButton.Group onValueChange={(value) => setStatus(value as 'taken' | 'missed')} value={status}>
                <View style={styles.statusRow}>
                  <View style={styles.statusOption}>
                    <MaterialCommunityIcons name="check-circle" size={24} color={colors.success} />
                    <RadioButton.Item label="Taken" value="taken" />
                  </View>
                  <View style={styles.statusOption}>
                    <MaterialCommunityIcons name="close-circle" size={24} color={colors.error} />
                    <RadioButton.Item label="Missed" value="missed" />
                  </View>
                </View>
              </RadioButton.Group>

              {/* Notes */}
              <Text variant="bodyMedium" style={styles.label}>
                Notes (Optional)
              </Text>
              <TextInput
                mode="outlined"
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any relevant notes..."
                multiline
                numberOfLines={3}
                style={styles.notesInput}
              />
            </View>
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button mode="contained" onPress={handleSubmit}>
            Submit
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    maxHeight: '80%',
  },
  content: {
    paddingHorizontal: spacing.md,
  },
  label: {
    fontWeight: '600',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  notesInput: {
    marginBottom: spacing.md,
  },
});
