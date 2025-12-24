import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export type ErrorType = 'network' | 'server' | 'timeout' | 'notfound' | 'generic';

interface ErrorStateProps {
  type?: ErrorType;
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

const errorConfig: Record<ErrorType, { icon: keyof typeof MaterialCommunityIcons.glyphMap; title: string; message: string }> = {
  network: {
    icon: 'wifi-off',
    title: 'Connection Problem',
    message: 'Unable to connect to the server. Please check your internet connection and try again.',
  },
  server: {
    icon: 'server-network-off',
    title: 'Server Error',
    message: 'Something went wrong on our end. Our team has been notified. Please try again later.',
  },
  timeout: {
    icon: 'clock-alert-outline',
    title: 'Request Timed Out',
    message: 'The request took too long to complete. Please check your connection and try again.',
  },
  notfound: {
    icon: 'alert-circle-outline',
    title: 'Not Found',
    message: 'The requested information could not be found.',
  },
  generic: {
    icon: 'alert-circle-outline',
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Please try again.',
  },
};

export const ErrorState: React.FC<ErrorStateProps> = ({
  type = 'generic',
  title,
  message,
  onRetry,
  retryLabel = 'Try Again',
}) => {
  const config = errorConfig[type];
  const displayTitle = title || config.title;
  const displayMessage = message || config.message;

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <MaterialCommunityIcons
            name={config.icon}
            size={56}
            color="#EF4444"
            style={styles.icon}
          />
          <Text variant="titleLarge" style={styles.title}>
            {displayTitle}
          </Text>
          <Text variant="bodyMedium" style={styles.message}>
            {displayMessage}
          </Text>
          {onRetry && (
            <Button
              mode="contained"
              onPress={onRetry}
              style={styles.button}
              icon="refresh"
            >
              {retryLabel}
            </Button>
          )}
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 400,
  },
  content: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1F2937',
  },
  message: {
    textAlign: 'center',
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});
