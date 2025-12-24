/**
 * Reusable animation configurations for consistent UX across the app
 */

import { Animated, Easing } from 'react-native';

/**
 * Standard animation timing
 */
export const ANIMATION_DURATION = {
  fast: 200,
  normal: 300,
  slow: 500,
};

/**
 * Fade in animation
 */
export const fadeIn = (
  animatedValue: Animated.Value,
  duration: number = ANIMATION_DURATION.normal,
  toValue: number = 1
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  });
};

/**
 * Fade out animation
 */
export const fadeOut = (
  animatedValue: Animated.Value,
  duration: number = ANIMATION_DURATION.normal,
  toValue: number = 0
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    easing: Easing.in(Easing.ease),
    useNativeDriver: true,
  });
};

/**
 * Scale up animation (useful for buttons, cards)
 */
export const scaleUp = (
  animatedValue: Animated.Value,
  duration: number = ANIMATION_DURATION.fast,
  toValue: number = 1
): Animated.CompositeAnimation => {
  return Animated.spring(animatedValue, {
    toValue,
    friction: 4,
    tension: 100,
    useNativeDriver: true,
  });
};

/**
 * Scale down animation
 */
export const scaleDown = (
  animatedValue: Animated.Value,
  duration: number = ANIMATION_DURATION.fast,
  toValue: number = 0.95
): Animated.CompositeAnimation => {
  return Animated.spring(animatedValue, {
    toValue,
    friction: 4,
    tension: 100,
    useNativeDriver: true,
  });
};

/**
 * Slide in from right animation
 */
export const slideInRight = (
  animatedValue: Animated.Value,
  duration: number = ANIMATION_DURATION.normal
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  });
};

/**
 * Slide out to left animation
 */
export const slideOutLeft = (
  animatedValue: Animated.Value,
  duration: number = ANIMATION_DURATION.normal
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: -100,
    duration,
    easing: Easing.in(Easing.cubic),
    useNativeDriver: true,
  });
};

/**
 * Pulse animation (for notifications, alerts)
 */
export const pulse = (
  animatedValue: Animated.Value,
  minScale: number = 0.95,
  maxScale: number = 1.05,
  duration: number = 1000
): Animated.CompositeAnimation => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: maxScale,
        duration: duration / 2,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: minScale,
        duration: duration / 2,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ])
  );
};

/**
 * Shake animation (for errors)
 */
export const shake = (
  animatedValue: Animated.Value,
  intensity: number = 10,
  duration: number = 400
): Animated.CompositeAnimation => {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: intensity,
      duration: duration / 4,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: -intensity,
      duration: duration / 4,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: intensity / 2,
      duration: duration / 4,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: duration / 4,
      useNativeDriver: true,
    }),
  ]);
};

/**
 * Stagger children animation
 */
export const staggerAnimation = (
  animatedValues: Animated.Value[],
  staggerDelay: number = 100,
  animation: (value: Animated.Value) => Animated.CompositeAnimation = fadeIn
): Animated.CompositeAnimation => {
  return Animated.stagger(
    staggerDelay,
    animatedValues.map((value) => animation(value))
  );
};

/**
 * Combine parallel animations
 */
export const parallel = (
  animations: Animated.CompositeAnimation[]
): Animated.CompositeAnimation => {
  return Animated.parallel(animations);
};

/**
 * Combine sequential animations
 */
export const sequence = (
  animations: Animated.CompositeAnimation[]
): Animated.CompositeAnimation => {
  return Animated.sequence(animations);
};

/**
 * Create an animated value with initial value
 */
export const createAnimatedValue = (initialValue: number = 0): Animated.Value => {
  return new Animated.Value(initialValue);
};

/**
 * Reset animated value to initial state
 */
export const resetAnimation = (
  animatedValue: Animated.Value,
  initialValue: number = 0
): void => {
  animatedValue.setValue(initialValue);
};

/**
 * Interpolate for rotation animation
 */
export const createRotationInterpolation = (
  animatedValue: Animated.Value,
  inputRange: number[] = [0, 1],
  outputRange: string[] = ['0deg', '360deg']
) => {
  return animatedValue.interpolate({
    inputRange,
    outputRange,
  });
};

/**
 * Interpolate for opacity animation
 */
export const createOpacityInterpolation = (
  animatedValue: Animated.Value,
  inputRange: number[] = [0, 1],
  outputRange: number[] = [0, 1]
) => {
  return animatedValue.interpolate({
    inputRange,
    outputRange,
  });
};

/**
 * Interpolate for scale animation
 */
export const createScaleInterpolation = (
  animatedValue: Animated.Value,
  inputRange: number[] = [0, 1],
  outputRange: number[] = [0, 1]
) => {
  return animatedValue.interpolate({
    inputRange,
    outputRange,
  });
};
