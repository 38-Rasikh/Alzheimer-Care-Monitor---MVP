import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Card as PaperCard } from 'react-native-paper';
import { fadeIn, scaleDown, scaleUp } from '../../utils/animations';

interface AnimatedCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  delay?: number;
  elevated?: boolean;
}

/**
 * Animated card component with fade-in animation and press feedback
 */
export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  onPress,
  style,
  delay = 0,
  elevated = true,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade in animation on mount
    Animated.sequence([
      Animated.delay(delay),
      fadeIn(fadeAnim),
    ]).start();
  }, [delay, fadeAnim]);

  const handlePressIn = () => {
    if (onPress) {
      scaleDown(scaleAnim, 100, 0.97).start();
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scaleUp(scaleAnim, 100, 1).start();
    }
  };

  const animatedStyle = {
    opacity: fadeAnim,
    transform: [{ scale: scaleAnim }],
  };

  const content = (
    <Animated.View style={[animatedStyle, style]}>
      <PaperCard
        style={[elevated && styles.elevated]}
        mode={elevated ? 'elevated' : 'outlined'}
      >
        {children}
      </PaperCard>
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {content}
      </Pressable>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  elevated: {
    elevation: 2,
  },
});
