import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import { apiClient } from '../services/api/client';
import { colors as standardColors } from '../theme/tokens';

type TextSize = 'small' | 'medium' | 'large' | 'xlarge';
type ContrastMode = 'standard' | 'high';

export interface AccessibilitySettings {
  userId: string;
  textSize: TextSize;
  contrastMode: ContrastMode;
  simplifiedMode: boolean;
  reducedMotion: boolean;
  updatedAt: string;
}

// Text size multipliers
const TEXT_SIZE_MULTIPLIERS: Record<TextSize, number> = {
  small: 0.875,
  medium: 1.0,
  large: 1.25,
  xlarge: 1.5,
};

// High contrast colors
const HIGH_CONTRAST_COLORS = {
  success: '#00FF00',
  warning: '#FFA500',
  error: '#FF0000',
  info: '#00BFFF',
  critical: '#FF0000',
  high: '#FFA500',
  medium: '#FFFF00',
  low: '#00FF00',
  primary: '#FFD700',
  primaryLight: '#2A2A2A',
  secondary: '#FFFFFF',
  successLight: '#1A3A1A',
  background: '#000000',
  backgroundAlt: '#1A1A1A',
  surface: '#1A1A1A',
  border: '#FFFFFF',
  text: '#FFFFFF',
  textSecondary: '#E0E0E0',
  heartRateNormal: '#00FF00',
  heartRateElevated: '#FFA500',
  heartRateLow: '#00BFFF',
};

interface AccessibilityContextValue {
  settings: AccessibilitySettings | null;
  isLoading: boolean;
  textSizeMultiplier: number;
  colors: typeof standardColors;
  scaleFontSize: (baseFontSize: number) => number;
  isSimplifiedMode: boolean;
  isReducedMotion: boolean;
  isHighContrast: boolean;
  refreshSettings: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const { user } = useAuth();
  
  // Fetch accessibility settings
  const { data: settingsData, isLoading, refetch } = useQuery({
    queryKey: ['accessibilitySettings', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await apiClient.get(`/api/users/${user.id}/accessibility`);
      return response.data.settings as AccessibilitySettings;
    },
    enabled: !!user?.id,
  });

  const settings = settingsData || null;
  
  // Compute derived values
  const textSizeMultiplier = settings 
    ? TEXT_SIZE_MULTIPLIERS[settings.textSize] 
    : 1.0;
    
  const isHighContrast = settings?.contrastMode === 'high';
  const isSimplifiedMode = settings?.simplifiedMode || false;
  const isReducedMotion = settings?.reducedMotion || false;
  
  // Choose color palette based on contrast mode
  const colors = isHighContrast ? HIGH_CONTRAST_COLORS : standardColors;
  
  // Scale font size based on text size setting
  const scaleFontSize = (baseFontSize: number): number => {
    return Math.round(baseFontSize * textSizeMultiplier);
  };

  const value: AccessibilityContextValue = {
    settings,
    isLoading,
    textSizeMultiplier,
    colors,
    scaleFontSize,
    isSimplifiedMode,
    isReducedMotion,
    isHighContrast,
    refreshSettings: refetch,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility(): AccessibilityContextValue {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}

/**
 * Hook to get scaled typography styles
 * Usage: const text = useScaledText();
 *        <Text style={{ fontSize: text.h1 }}>Heading</Text>
 */
export function useScaledText() {
  const { scaleFontSize } = useAccessibility();
  
  return {
    h1: scaleFontSize(28),
    h2: scaleFontSize(24),
    h3: scaleFontSize(20),
    body: scaleFontSize(16),
    caption: scaleFontSize(14),
    small: scaleFontSize(12),
  };
}

/**
 * Hook to get themed colors (respects contrast mode)
 * Usage: const colors = useThemedColors();
 *        <View style={{ backgroundColor: colors.surface }}>
 */
export function useThemedColors() {
  const { colors } = useAccessibility();
  return colors;
}
