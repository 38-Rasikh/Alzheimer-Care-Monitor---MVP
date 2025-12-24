import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Card } from 'react-native-paper';
import { colors, spacing } from '../../theme';

interface SkeletonCardProps {
  lines?: number;
  hasChips?: boolean;
  hasButton?: boolean;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  lines = 3,
  hasChips = false,
  hasButton = false,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Card style={styles.card}>
      <Card.Content>
        {/* Title */}
        <Animated.View style={[styles.skeleton, styles.title, { opacity }]} />
        
        {/* Lines */}
        {Array.from({ length: lines }).map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.skeleton,
              styles.line,
              index === lines - 1 && styles.lastLine,
              { opacity },
            ]}
          />
        ))}

        {/* Chips */}
        {hasChips && (
          <View style={styles.chipsContainer}>
            <Animated.View style={[styles.skeleton, styles.chip, { opacity }]} />
            <Animated.View style={[styles.skeleton, styles.chip, { opacity }]} />
          </View>
        )}

        {/* Button */}
        {hasButton && (
          <Animated.View style={[styles.skeleton, styles.button, { opacity }]} />
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  skeleton: {
    backgroundColor: colors.border,
    borderRadius: 4,
  },
  title: {
    height: 24,
    width: '70%',
    marginBottom: spacing.sm,
  },
  line: {
    height: 16,
    width: '100%',
    marginBottom: spacing.xs,
  },
  lastLine: {
    width: '60%',
  },
  chipsContainer: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  chip: {
    height: 32,
    width: 80,
    borderRadius: 16,
  },
  button: {
    height: 40,
    width: '100%',
    marginTop: spacing.md,
    borderRadius: 20,
  },
});
