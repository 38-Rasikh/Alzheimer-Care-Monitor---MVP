import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme';

// Patient screens
import PatientHomeScreen from '../screens/patient/PatientHomeScreen';
import PatientTimelineScreen from '../screens/patient/PatientTimelineScreen';
import MemoryAidsScreen from '../screens/patient/MemoryAidsScreen';
import AssistantScreen from '../screens/patient/AssistantScreen';
import RemindersScreen from '../screens/patient/RemindersScreen';
import PatientSettingsScreen from '../screens/patient/PatientSettingsScreen';

const Stack = createStackNavigator();

export function PatientNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 20,
        },
      }}
    >
      <Stack.Screen
        name="PatientHome"
        component={PatientHomeScreen}
        options={{
          title: 'Home',
          headerLeft: () => null, // No back button on home
        }}
      />
      <Stack.Screen
        name="Timeline"
        component={PatientTimelineScreen}
        options={{ 
          title: 'My Schedule',
          headerRight: () => <MaterialCommunityIcons name="calendar-today" size={24} color="#fff" style={{ marginRight: 16 }} />
        }}
      />
      <Stack.Screen
        name="MemoryAids"
        component={MemoryAidsScreen}
        options={{ title: 'Family & Friends' }}
      />
      <Stack.Screen
        name="Assistant"
        component={AssistantScreen}
        options={{ title: 'Assistant' }}
      />
      <Stack.Screen
        name="Reminders"
        component={RemindersScreen}
        options={{ 
          title: 'Reminders',
          headerRight: () => <MaterialCommunityIcons name="bell-ring" size={24} color="#fff" style={{ marginRight: 16 }} />
        }}
      />
      <Stack.Screen
        name="PatientSettings"
        component={PatientSettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Stack.Navigator>
  );
}
