import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, Card, Switch, Button, Divider, SegmentedButtons } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../state/AuthContext';
import { colors, spacing } from '../../theme';

interface AccessibilitySettings {
  textSize: 'normal' | 'large' | 'extra-large';
  highContrast: boolean;
  reduceMotion: boolean;
  simplifiedUI: boolean;
}

const SETTINGS_KEY = '@patient_accessibility_settings';

export default function PatientSettingsScreen() {
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState<AccessibilitySettings>({
    textSize: 'large',
    highContrast: false,
    reduceMotion: false,
    simplifiedUI: true,
  });
  const [loading, setLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: AccessibilitySettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
      Alert.alert('Error', 'Could not save your settings. Please try again.');
    }
  };

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const handleLogout = () => {
    Alert.alert(
      'Switch Mode',
      'Would you like to switch to caregiver mode?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.profileSection}>
            <MaterialCommunityIcons name="account-circle" size={80} color={colors.primary} />
            <Text style={styles.name}>{user?.displayName}</Text>
            <Text style={styles.role}>Patient Account</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Display Settings</Text>
          
          <View style={styles.settingGroup}>
            <Text style={styles.settingLabel}>Text Size</Text>
            <Text style={styles.settingDescription}>Choose the size that's easiest to read</Text>
            <SegmentedButtons
              value={settings.textSize}
              onValueChange={(value) => updateSetting('textSize', value as any)}
              buttons={[
                { value: 'normal', label: 'Normal' },
                { value: 'large', label: 'Large' },
                { value: 'extra-large', label: 'Extra Large' },
              ]}
              style={styles.segmentedButtons}
            />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>High Contrast Mode</Text>
              <Text style={styles.settingDescription}>Increases contrast for better visibility</Text>
            </View>
            <Switch
              value={settings.highContrast}
              onValueChange={(value) => updateSetting('highContrast', value)}
            />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Reduce Motion</Text>
              <Text style={styles.settingDescription}>Minimizes animations and transitions</Text>
            </View>
            <Switch
              value={settings.reduceMotion}
              onValueChange={(value) => updateSetting('reduceMotion', value)}
            />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Simplified Interface</Text>
              <Text style={styles.settingDescription}>Shows only essential information</Text>
            </View>
            <Switch
              value={settings.simplifiedUI}
              onValueChange={(value) => updateSetting('simplifiedUI', value)}
            />
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Emergency Contact</Text>
          <View style={styles.contactRow}>
            <MaterialCommunityIcons name="phone" size={32} color={colors.success} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>Jane Doe</Text>
              <Text style={styles.contactRelation}>Your Daughter</Text>
              <Text style={styles.contactPhone}>+1-555-0123</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Button
        mode="outlined"
        onPress={handleLogout}
        style={styles.switchButton}
        icon="swap-horizontal"
      >
        Switch to Caregiver Mode
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    elevation: 2,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.sm,
  },
  role: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  settingGroup: {
    marginBottom: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  settingInfo: {
    flex: 1,
    paddingRight: spacing.md,
  },
  settingLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  segmentedButtons: {
    marginTop: spacing.md,
  },
  divider: {
    marginVertical: spacing.md,
  },
  contactRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  contactRelation: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  contactPhone: {
    fontSize: 16,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  switchButton: {
    marginTop: spacing.lg,
  },
});
