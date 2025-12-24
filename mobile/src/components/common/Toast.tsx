import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Snackbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
}

const toastConfig: Record<ToastType, { icon: keyof typeof MaterialCommunityIcons.glyphMap; color: string }> = {
  success: { icon: 'check-circle', color: '#10B981' },
  error: { icon: 'alert-circle', color: '#EF4444' },
  warning: { icon: 'alert', color: '#F59E0B' },
  info: { icon: 'information', color: '#3B82F6' },
};

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onDismiss,
  action,
}) => {
  const config = toastConfig[type];

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onDismiss();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onDismiss]);

  return (
    <Snackbar
      visible={visible}
      onDismiss={onDismiss}
      duration={duration}
      action={action}
      style={[
        styles.snackbar,
        { backgroundColor: config.color },
      ]}
    >
      {message}
    </Snackbar>
  );
};

const styles = StyleSheet.create({
  snackbar: {
    marginBottom: 16,
  },
});
