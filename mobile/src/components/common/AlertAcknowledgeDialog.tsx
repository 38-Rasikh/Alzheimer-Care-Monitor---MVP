import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Dialog, Portal, Text, TextInput, Button } from 'react-native-paper';
import { spacing } from '../../theme';

interface AlertAcknowledgeDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (data: { notes: string; timestamp: string }) => void;
  alertType: string;
  alertMessage: string;
}

export const AlertAcknowledgeDialog: React.FC<AlertAcknowledgeDialogProps> = ({
  visible,
  onDismiss,
  onSubmit,
  alertType,
  alertMessage,
}) => {
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    onSubmit({
      notes: notes.trim(),
      timestamp: new Date().toISOString(),
    });
    setNotes('');
    onDismiss();
  };

  const handleDismiss = () => {
    setNotes('');
    onDismiss();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleDismiss} style={styles.dialog}>
        <Dialog.Title>Acknowledge Alert</Dialog.Title>
        <Dialog.ScrollArea style={styles.scrollArea}>
          <ScrollView>
            <Text variant="bodyMedium" style={styles.alertType}>
              Type: {alertType}
            </Text>
            <Text variant="bodySmall" style={styles.alertMessage}>
              {alertMessage}
            </Text>

            <TextInput
              label="Notes (optional)"
              value={notes}
              onChangeText={setNotes}
              mode="outlined"
              multiline
              numberOfLines={4}
              placeholder="Add any notes about this alert or actions taken..."
              style={styles.input}
            />
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={handleDismiss}>Cancel</Button>
          <Button onPress={handleSubmit} mode="contained">
            Acknowledge
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    maxHeight: '80%',
  },
  scrollArea: {
    paddingHorizontal: 0,
  },
  alertType: {
    marginTop: spacing.sm,
    marginHorizontal: spacing.lg,
    fontWeight: '600',
  },
  alertMessage: {
    marginTop: spacing.xs,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  input: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
});
