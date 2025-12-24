import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, ProgressBar, IconButton } from 'react-native-paper';
import { colors, spacing } from '../../theme';

interface Contact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
}

interface EmergencyContactsProps {
  navigation: any;
  route: any;
}

export default function EmergencyContactsScreen({ navigation, route }: EmergencyContactsProps) {
  const { caregiver, patient } = route.params;
  const [contacts, setContacts] = useState<Contact[]>([
    { id: '1', name: '', relationship: '', phone: '' },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addContact = () => {
    if (contacts.length < 5) {
      setContacts([...contacts, {
        id: Date.now().toString(),
        name: '',
        relationship: '',
        phone: '',
      }]);
    }
  };

  const removeContact = (id: string) => {
    if (contacts.length > 1) {
      setContacts(contacts.filter(c => c.id !== id));
    }
  };

  const updateContact = (id: string, field: keyof Contact, value: string) => {
    setContacts(contacts.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const firstContact = contacts[0];
    
    if (!firstContact.name.trim()) newErrors['0_name'] = 'First contact name is required';
    if (!firstContact.phone.trim()) {
      newErrors['0_phone'] = 'First contact phone is required';
    } else if (!/^\+?[\d\s\-()]+$/.test(firstContact.phone)) {
      newErrors['0_phone'] = 'Invalid phone format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      const validContacts = contacts.filter(c => c.name.trim() && c.phone.trim());
      navigation.navigate('RoutineSettings', {
        caregiver,
        patient: {
          ...patient,
          emergencyContacts: validContacts,
        },
      });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <ProgressBar progress={0.56} color={colors.primary} style={styles.progress} />
      
      <Text style={styles.title}>Emergency Contacts</Text>
      <Text style={styles.subtitle}>
        Add at least one contact who can be reached in case of emergency
      </Text>

      <View style={styles.form}>
        {contacts.map((contact, index) => (
          <View key={contact.id} style={styles.contactCard}>
            <View style={styles.contactHeader}>
              <Text style={styles.contactTitle}>Contact {index + 1}</Text>
              {contacts.length > 1 && (
                <IconButton
                  icon="close"
                  size={20}
                  onPress={() => removeContact(contact.id)}
                />
              )}
            </View>

            <TextInput
              label="Full Name *"
              value={contact.name}
              onChangeText={(value) => updateContact(contact.id, 'name', value)}
              mode="outlined"
              style={styles.input}
              error={!!errors[`${index}_name`]}
            />
            {errors[`${index}_name`] && (
              <Text style={styles.errorText}>{errors[`${index}_name`]}</Text>
            )}

            <TextInput
              label="Relationship"
              value={contact.relationship}
              onChangeText={(value) => updateContact(contact.id, 'relationship', value)}
              mode="outlined"
              placeholder="e.g., Daughter, Son, Friend"
              style={styles.input}
            />

            <TextInput
              label="Phone Number *"
              value={contact.phone}
              onChangeText={(value) => updateContact(contact.id, 'phone', value)}
              mode="outlined"
              keyboardType="phone-pad"
              placeholder="+1-555-0123"
              style={styles.input}
              error={!!errors[`${index}_phone`]}
            />
            {errors[`${index}_phone`] && (
              <Text style={styles.errorText}>{errors[`${index}_phone`]}</Text>
            )}
          </View>
        ))}

        {contacts.length < 5 && (
          <Button
            mode="outlined"
            onPress={addContact}
            icon="plus"
            style={styles.addButton}
          >
            Add Another Contact
          </Button>
        )}
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
  contactCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.md,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    backgroundColor: colors.background,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: -spacing.sm,
  },
  addButton: {
    borderStyle: 'dashed',
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
