import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Dialog, Portal, Text, Button, TextInput, RadioButton, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';

interface BehaviorLogDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (data: {
    type: string;
    severity: number;
    duration?: number;
    triggers?: string;
    response?: string;
    notes?: string;
    timestamp: string;
  }) => void;
}

const BEHAVIOR_TYPES = [
  { value: 'agitation', label: 'Agitation', icon: 'emoticon-angry', color: colors.error },
  { value: 'confusion', label: 'Confusion', icon: 'head-question', color: colors.warning },
  { value: 'wandering', label: 'Wandering', icon: 'walk', color: colors.high },
  { value: 'sleep-disruption', label: 'Sleep Disruption', icon: 'sleep-off', color: colors.info },
  { value: 'repetitive', label: 'Repetitive Behavior', icon: 'repeat', color: colors.medium },
];

export function BehaviorLogDialog({ visible, onDismiss, onSubmit }: BehaviorLogDialogProps) {
  const [type, setType] = useState('agitation');
  const [severity, setSeverity] = useState(3);
  const [duration, setDuration] = useState('');
  const [triggers, setTriggers] = useState('');
  const [response, setResponse] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    onSubmit({
      type,
      severity,
      duration: duration ? parseInt(duration) : undefined,
      triggers: triggers.trim() || undefined,
      response: response.trim() || undefined,
      notes: notes.trim() || undefined,
      timestamp: new Date().toISOString(),
    });
    // Reset form
    setType('agitation');
    setSeverity(3);
    setDuration('');
    setTriggers('');
    setResponse('');
    setNotes('');
    onDismiss();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title>Log Behavior Event</Dialog.Title>
        <Dialog.ScrollArea>
          <ScrollView>
            <View style={styles.content}>
              {/* Behavior Type */}
              <Text variant="bodyMedium" style={styles.label}>
                Behavior Type
              </Text>
              <View style={styles.typeGrid}>
                {BEHAVIOR_TYPES.map((behavior) => (
                  <Chip
                    key={behavior.value}
                    selected={type === behavior.value}
                    onPress={() => setType(behavior.value)}
                    icon={() => (
                      <MaterialCommunityIcons
                        name={behavior.icon as any}
                        size={18}
                        color={type === behavior.value ? colors.surface : behavior.color}
                      />
                    )}
                    style={[
                      styles.typeChip,
                      type === behavior.value && { backgroundColor: behavior.color },
                    ]}
                    textStyle={{ color: type === behavior.value ? colors.surface : colors.text }}
                  >
                    {behavior.label}
                  </Chip>
                ))}
              </View>

              {/* Severity */}
              <Text variant="bodyMedium" style={styles.label}>
                Severity (1-5)
              </Text>
              <View style={styles.severityRow}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <Chip
                    key={level}
                    selected={severity === level}
                    onPress={() => setSeverity(level)}
                    style={[styles.severityChip, severity === level && styles.selectedChip]}
                  >
                    {level}
                  </Chip>
                ))}
              </View>

              {/* Duration */}
              <Text variant="bodyMedium" style={styles.label}>
                Duration (minutes)
              </Text>
              <TextInput
                mode="outlined"
                value={duration}
                onChangeText={setDuration}
                placeholder="e.g., 15"
                keyboardType="numeric"
              />

              {/* Triggers */}
              <Text variant="bodyMedium" style={styles.label}>
                Triggers (Optional)
              </Text>
              <TextInput
                mode="outlined"
                value={triggers}
                onChangeText={setTriggers}
                placeholder="What seemed to trigger the behavior?"
                multiline
                numberOfLines={2}
              />

              {/* Response */}
              <Text variant="bodyMedium" style={styles.label}>
                Response Taken (Optional)
              </Text>
              <TextInput
                mode="outlined"
                value={response}
                onChangeText={setResponse}
                placeholder="How did you respond?"
                multiline
                numberOfLines={2}
              />

              {/* Notes */}
              <Text variant="bodyMedium" style={styles.label}>
                Additional Notes (Optional)
              </Text>
              <TextInput
                mode="outlined"
                value={notes}
                onChangeText={setNotes}
                placeholder="Any other observations..."
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
    maxHeight: '85%',
  },
  content: {
    paddingHorizontal: spacing.md,
  },
  label: {
    fontWeight: '600',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  typeChip: {
    marginBottom: spacing.xs,
  },
  severityRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  severityChip: {
    minWidth: 50,
  },
  selectedChip: {
    backgroundColor: colors.primary,
  },
  notesInput: {
    marginBottom: spacing.md,
  },
});
