import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { OfflineBanner } from '../components/common/OfflineBanner';
import { colors } from '../theme';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import AlertsScreen from '../screens/AlertsScreen';
import MedicationsScreen from '../screens/MedicationsScreen';
import BehaviorLogsScreen from '../screens/BehaviorLogsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const ScreenWrapper = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.screenWrapper}>
    <OfflineBanner />
    {children}
  </View>
);

export function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: true,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
          headerTitle: 'Patient Status',
        }}
      >
        {() => (
          <ScreenWrapper>
            <HomeScreen />
          </ScreenWrapper>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Alerts"
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bell" size={size} color={color} />
          ),
          tabBarBadge: undefined, // Will be updated with active alert count
        }}
      >
        {() => (
          <ScreenWrapper>
            <AlertsScreen />
          </ScreenWrapper>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Medications"
        options={{
          tabBarLabel: 'Meds',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="pill" size={size} color={color} />
          ),
        }}
      >
        {() => (
          <ScreenWrapper>
            <MedicationsScreen />
          </ScreenWrapper>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Logs"
        options={{
          tabBarLabel: 'Logs',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="notebook" size={size} color={color} />
          ),
        }}
      >
        {() => (
          <ScreenWrapper>
            <BehaviorLogsScreen />
          </ScreenWrapper>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Settings"
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" size={size} color={color} />
          ),
        }}
      >
        {() => (
          <ScreenWrapper>
            <SettingsScreen />
          </ScreenWrapper>
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
  },
});

export default BottomTabNavigator;
