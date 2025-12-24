import React from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Card, Text, List, Switch, Divider, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../state/AuthContext';
import { colors, spacing } from '../theme';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [pushNotifications, setPushNotifications] = React.useState(true);
  const [emailAlerts, setEmailAlerts] = React.useState(true);
  const [smsAlerts, setSmsAlerts] = React.useState(false);

  const handleEditProfile = () => {
    Alert.alert(
      'Edit Profile',
      'Profile editing will be available in a future update. Would you like to view the current profile details?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'View Details',
          onPress: () => {
            console.log('Navigate to profile details');
            // TODO: Navigation to profile screen when implemented
          },
        },
      ]
    );
  };

  const handleDeviceSettings = () => {
    Alert.alert(
      'Device Settings',
      'Device configuration options:\n\n• Sync frequency\n• Connection mode\n• Battery optimization\n• Firmware updates',
      [
        { text: 'OK' },
      ]
    );
  };

  const handleConfigureAlertTypes = () => {
    Alert.alert(
      'Configure Alert Types',
      'Select which types of alerts you want to receive:\n\n• Fall detection\n• Medication reminders\n• Behavior alerts\n• Location alerts\n• Health vitals',
      [
        { text: 'OK' },
      ]
    );
  };

  const handleManageContacts = () => {
    Alert.alert(
      'Manage Emergency Contacts',
      'Emergency contact management will allow you to:\n\n• Add new contacts\n• Edit existing contacts\n• Set priority order\n• Configure notification preferences',
      [
        { text: 'OK' },
      ]
    );
  };

  const handleLanguage = () => {
    Alert.alert(
      'Language Settings',
      'Select your preferred language:',
      [
        { text: 'English (Current)', style: 'default' },
        { text: 'Spanish', onPress: () => console.log('Spanish selected') },
        { text: 'French', onPress: () => console.log('French selected') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handlePrivacySecurity = () => {
    Alert.alert(
      'Privacy & Security',
      'Privacy settings:\n\n• Data sharing preferences\n• HIPAA compliance info\n• Consent management\n• Data retention policy\n• Security settings',
      [
        { text: 'OK' },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About AlzCare',
      'Version: 0.1.0\n\nAlzCare Mobile App\nDeveloped for Alzheimer\'s patient monitoring and care coordination.\n\n© 2025 AlzCare',
      [
        { text: 'OK' },
      ]
    );
  };

  const handleSwitchToPatient = () => {
    Alert.alert(
      'Switch to Patient Mode',
      'Would you like to switch to patient view?',
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

  // Persist notification settings when they change
  const handlePushNotificationsChange = (value: boolean) => {
    setPushNotifications(value);
    console.log('Push notifications:', value);
    // TODO: Save to AsyncStorage or API
  };

  const handleEmailAlertsChange = (value: boolean) => {
    setEmailAlerts(value);
    console.log('Email alerts:', value);
    // TODO: Save to AsyncStorage or API
  };

  const handleSmsAlertsChange = (value: boolean) => {
    setSmsAlerts(value);
    console.log('SMS alerts:', value);
    // TODO: Save to AsyncStorage or API
  };

  return (
    <ScrollView style={styles.container}>
      {/* Patient Profile Card */}
      <Card style={styles.card}>
        <Card.Title title="Patient Profile" titleVariant="titleLarge" />
        <Card.Content>
          <View style={styles.profileInfo}>
            <MaterialCommunityIcons name="account-circle" size={64} color={colors.primary} />
            <View style={styles.profileDetails}>
              <Text variant="titleLarge">John Doe</Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                78 years old
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                Stage: Moderate
              </Text>
            </View>
          </View>
          <Button mode="outlined" style={styles.editButton} onPress={handleEditProfile}>
            Edit Profile
          </Button>
        </Card.Content>
      </Card>

      {/* Device Status Card */}
      <Card style={styles.card}>
        <Card.Title title="Device Status" titleVariant="titleLarge" />
        <Card.Content>
          <List.Item
            title="Wristband Monitor"
            description="Connected"
            left={() => <MaterialCommunityIcons name="watch" size={24} color={colors.success} />}
            right={() => (
              <View style={styles.statusIndicator}>
                <MaterialCommunityIcons name="circle" size={12} color={colors.success} />
              </View>
            )}
          />
          <Divider />
          <List.Item
            title="Battery Level"
            description="75% • ~2 days remaining"
            left={() => <MaterialCommunityIcons name="battery-70" size={24} color={colors.success} />}
          />
          <Divider />
          <List.Item
            title="Firmware Version"
            description="v2.1.3"
            left={() => <MaterialCommunityIcons name="information" size={24} color={colors.textSecondary} />}
          />
          <Divider />
          <List.Item
            title="Last Sync"
            description="2 minutes ago"
            left={() => <MaterialCommunityIcons name="sync" size={24} color={colors.textSecondary} />}
          />
          <Button mode="contained" style={styles.deviceButton} onPress={handleDeviceSettings}>
            Device Settings
          </Button>
        </Card.Content>
      </Card>

      {/* Notifications Card */}
      <Card style={styles.card}>
        <Card.Title title="Notifications" titleVariant="titleLarge" />
        <Card.Content>
          <List.Item
            title="Push Notifications"
            description="Receive alerts on this device"
            left={() => <MaterialCommunityIcons name="bell" size={24} color={colors.primary} />}
            right={() => <Switch value={pushNotifications} onValueChange={handlePushNotificationsChange} />}
          />
          <Divider />
          <List.Item
            title="Email Alerts"
            description="Send important alerts via email"
            left={() => <MaterialCommunityIcons name="email" size={24} color={colors.primary} />}
            right={() => <Switch value={emailAlerts} onValueChange={handleEmailAlertsChange} />}
          />
          <Divider />
          <List.Item
            title="SMS Alerts"
            description="Send critical alerts via text"
            left={() => <MaterialCommunityIcons name="message" size={24} color={colors.primary} />}
            right={() => <Switch value={smsAlerts} onValueChange={handleSmsAlertsChange} />}
          />
          <Button mode="outlined" style={styles.configButton} onPress={handleConfigureAlertTypes}>
            Configure Alert Types
          </Button>
        </Card.Content>
      </Card>

      {/* Emergency Contacts Card */}
      <Card style={styles.card}>
        <Card.Title title="Emergency Contacts" titleVariant="titleLarge" />
        <Card.Content>
          <List.Item
            title="Jane Doe"
            description="Daughter • Primary Contact"
            left={() => <MaterialCommunityIcons name="account" size={24} color={colors.primary} />}
            right={() => <MaterialCommunityIcons name="phone" size={24} color={colors.primary} />}
          />
          <Divider />
          <List.Item
            title="Tom Doe"
            description="Son • Secondary Contact"
            left={() => <MaterialCommunityIcons name="account" size={24} color={colors.primary} />}
            right={() => <MaterialCommunityIcons name="phone" size={24} color={colors.primary} />}
          />
          <Button mode="outlined" style={styles.configButton} onPress={handleManageContacts}>
            Manage Contacts
          </Button>
        </Card.Content>
      </Card>

      {/* App Settings */}
      <Card style={styles.card}>
        <Card.Title title="App Settings" titleVariant="titleLarge" />
        <Card.Content>
          <List.Item
            title="Language"
            description="English"
            left={() => <MaterialCommunityIcons name="translate" size={24} color={colors.textSecondary} />}
            right={() => <MaterialCommunityIcons name="chevron-right" size={24} />}
            onPress={handleLanguage}
          />
          <Divider />
          <List.Item
            title="Privacy & Security"
            left={() => <MaterialCommunityIcons name="shield-lock" size={24} color={colors.textSecondary} />}
            right={() => <MaterialCommunityIcons name="chevron-right" size={24} />}
            onPress={handlePrivacySecurity}
          />
          <Divider />
          <List.Item
            title="About"
            description="Version 0.1.0"
            left={() => <MaterialCommunityIcons name="information" size={24} color={colors.textSecondary} />}
            right={() => <MaterialCommunityIcons name="chevron-right" size={24} />}
            onPress={handleAbout}
          />
        </Card.Content>
      </Card>

      {/* Role Switch */}
      <Card style={styles.card}>
        <Card.Content>
          <Button
            mode="outlined"
            icon="swap-horizontal"
            onPress={handleSwitchToPatient}
            style={styles.switchButton}
          >
            Switch to Patient Mode
          </Button>
        </Card.Content>
      </Card>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    margin: spacing.md,
    backgroundColor: colors.surface,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  profileDetails: {
    flex: 1,
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  editButton: {
    marginTop: spacing.sm,
  },
  deviceButton: {
    marginTop: spacing.md,
  },
  configButton: {
    marginTop: spacing.md,
  },
  statusIndicator: {
    justifyContent: 'center',
  },
  switchButton: {
    marginVertical: spacing.sm,
  },
  bottomSpacer: {
    height: spacing.lg,
  },
});
