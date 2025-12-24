import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { colors, spacing } from '../../theme';

interface WelcomeScreenProps {
  navigation: any;
}

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const handleGetStarted = () => {
    navigation.navigate('CaregiverDetails');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🧠</Text>
        <Text style={styles.title}>Welcome to Care Connect</Text>
        <Text style={styles.subtitle}>
          Your companion for dementia and Alzheimer's care
        </Text>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📅</Text>
            <Text style={styles.featureText}>Daily orientation and reminders</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>👨‍👩‍👧‍👦</Text>
            <Text style={styles.featureText}>Memory aids with family photos</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🔒</Text>
            <Text style={styles.featureText}>Privacy-first, secure data handling</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🆘</Text>
            <Text style={styles.featureText}>Emergency access and safety alerts</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Let's set up your account in a few simple steps
        </Text>
        <Button
          mode="contained"
          onPress={handleGetStarted}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Get Started
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl * 2,
  },
  features: {
    gap: spacing.lg,
    width: '100%',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureIcon: {
    fontSize: 32,
  },
  featureText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  footer: {
    gap: spacing.md,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.md,
  },
  buttonContent: {
    height: 56,
  },
});
