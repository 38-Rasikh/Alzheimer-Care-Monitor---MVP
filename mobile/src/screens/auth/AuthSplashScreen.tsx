import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { colors, spacing } from '../../theme';

export default function AuthSplashScreen({ navigation }: any) {
  useEffect(() => {
    // Auto-navigate after 2 seconds
    const timer = setTimeout(() => {
      navigation.replace('RoleSelection');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>CareConnect</Text>
        <Text style={styles.subtitle}>Dementia Care Support</Text>
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.loader}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
    marginBottom: spacing.xl,
  },
  loader: {
    marginTop: spacing.xl,
  },
});
