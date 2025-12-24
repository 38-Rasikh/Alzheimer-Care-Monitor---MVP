import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../theme';

// Import onboarding screens
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import CaregiverDetailsScreen from '../screens/onboarding/CaregiverDetailsScreen';
import PatientBasicInfoScreen from '../screens/onboarding/PatientBasicInfoScreen';
import DiagnosisStageScreen from '../screens/onboarding/DiagnosisStageScreen';
import EmergencyContactsScreen from '../screens/onboarding/EmergencyContactsScreen';
import RoutineSettingsScreen from '../screens/onboarding/RoutineSettingsScreen';
import ConsentCollectionScreen from '../screens/onboarding/ConsentCollectionScreen';
import SafetyFeaturesScreen from '../screens/onboarding/SafetyFeaturesScreen';
import OnboardingReviewScreen from '../screens/onboarding/OnboardingReviewScreen';
import OrientationPreviewScreen from '../screens/onboarding/OrientationPreviewScreen';

const Stack = createStackNavigator();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CaregiverDetails"
        component={CaregiverDetailsScreen}
        options={{ title: 'Caregiver Information' }}
      />
      <Stack.Screen
        name="PatientBasicInfo"
        component={PatientBasicInfoScreen}
        options={{ title: 'Patient Information' }}
      />
      <Stack.Screen
        name="DiagnosisStage"
        component={DiagnosisStageScreen}
        options={{ title: 'Diagnosis & Stage' }}
      />
      <Stack.Screen
        name="EmergencyContacts"
        component={EmergencyContactsScreen}
        options={{ title: 'Emergency Contacts' }}
      />
      <Stack.Screen
        name="RoutineSettings"
        component={RoutineSettingsScreen}
        options={{ title: 'Daily Routine' }}
      />
      <Stack.Screen
        name="ConsentCollection"
        component={ConsentCollectionScreen}
        options={{ title: 'Privacy & Consent' }}
      />
      <Stack.Screen
        name="SafetyFeatures"
        component={SafetyFeaturesScreen}
        options={{ title: 'Safety Features' }}
      />
      <Stack.Screen
        name="OnboardingReview"
        component={OnboardingReviewScreen}
        options={{ title: 'Review Setup' }}
      />
      <Stack.Screen
        name="OrientationPreview"
        component={OrientationPreviewScreen}
        options={{ 
          headerShown: false,
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}
