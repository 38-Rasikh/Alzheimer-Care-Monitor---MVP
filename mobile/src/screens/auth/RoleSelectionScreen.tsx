import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth, User } from '../../state/AuthContext';
import { colors, spacing } from '../../theme';

interface RoleSelectionScreenProps {
  navigation: any;
}

export default function RoleSelectionScreen({ navigation }: RoleSelectionScreenProps) {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartOnboarding = () => {
    navigation.navigate('Onboarding');
  };

  const handleRoleSelect = async (role: 'patient' | 'caregiver') => {
    setIsLoading(true);
    try {
      // Mock user data - in production, this would come from actual auth
      const mockUser: User = {
        id: role === 'patient' ? 'p123' : 'u-care-001',
        role,
        displayName: role === 'patient' ? 'John Doe' : 'Jane Doe',
        email: role === 'caregiver' ? 'jane.doe@example.com' : undefined,
        phone: '+1-555-0123',
        linkedPatientIds: role === 'caregiver' ? ['p123'] : [],
        linkedCaregiverIds: role === 'patient' ? ['u-care-001'] : [],
      };
      
      await login(mockUser);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Select your role to continue</Text>
      </View>

      {/* <View style={{ height: 0 }} /> */}

      <View style={styles.cardsContainer}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleStartOnboarding}
          disabled={isLoading}
        >
          <Card style={[styles.card, styles.primaryCard]}>
            <Card.Content style={styles.cardContent}>
              <MaterialCommunityIcons
                name="account-plus"
                size={64}
                color={colors.primary}
                style={styles.icon}
              />
              <Text style={styles.cardTitle}>New Caregiver</Text>
              <Text style={styles.cardDescription}>
                Set up a new caregiver account and link to patient
              </Text>
            </Card.Content>
          </Card>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <Text style={styles.existingAccountText}>Existing Account Login</Text>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleRoleSelect('patient')}
          disabled={isLoading}
        >
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <MaterialCommunityIcons
                name="account"
                size={48}
                color={colors.primary}
                style={styles.iconSmall}
              />
              <Text style={styles.cardTitleSmall}>I am a Patient</Text>
              <Text style={styles.cardDescriptionSmall}>
                Access your daily schedule and reminders
              </Text>
            </Card.Content>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleRoleSelect('caregiver')}
          disabled={isLoading}
        >
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <MaterialCommunityIcons
                name="account-heart"
                size={48}
                color={colors.secondary}
                style={styles.iconSmall}
              />
              <Text style={styles.cardTitleSmall}>I am a Caregiver</Text>
              <Text style={styles.cardDescriptionSmall}>
                Monitor patient status and alerts
              </Text>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        This selection can be changed in settings
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  header: {
    marginTop: spacing.xl * 2,
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
  },
  card: {
    elevation: 4,
  },
  primaryCard: {
    backgroundColor: colors.primaryLight,
    elevation: 8,
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  icon: {
    marginBottom: spacing.md,
  },
  iconSmall: {
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  cardTitleSmall: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  cardDescriptionSmall: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  existingAccountText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  footer: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: spacing.lg,
  },
});
