import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { fadeIn, fadeOut } from '../../utils/animations';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

/**
 * Full-screen loading overlay with fade animation
 * Used for mutation operations that require user to wait
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Loading...',
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isRendered = useRef(false);

  useEffect(() => {
    if (visible) {
      isRendered.current = true;
      fadeIn(fadeAnim, 200).start();
    } else {
      fadeOut(fadeAnim, 200).start(() => {
        isRendered.current = false;
      });
    }
  }, [visible, fadeAnim]);

  if (!visible && !isRendered.current) {
    return null;
  }

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} pointerEvents={visible ? 'auto' : 'none'}>
      <View style={styles.content}>
        <ActivityIndicator size="large" />
        {message && (
          <Text variant="bodyLarge" style={styles.message}>
            {message}
          </Text>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    minWidth: 200,
    elevation: 5,
  },
  message: {
    marginTop: 16,
    textAlign: 'center',
  },
});
