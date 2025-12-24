import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../state/AuthContext';
import { colors } from '../theme';

// Navigation stacks
import { PatientNavigator } from './PatientNavigator';
import { CaregiverNavigator } from './CaregiverNavigator';
import OnboardingNavigator from './OnboardingNavigator';

// Onboarding screens
import AuthSplashScreen from '../screens/auth/AuthSplashScreen';
import RoleSelectionScreen from '../screens/auth/RoleSelectionScreen';

const Stack = createStackNavigator();

export function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="AuthSplash" component={AuthSplashScreen} />
          <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        </>
      ) : user.role === 'patient' ? (
        <Stack.Screen name="PatientApp" component={PatientNavigator} />
      ) : (
        <Stack.Screen name="CaregiverApp" component={CaregiverNavigator} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
