export const colors = {
  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Severity
  critical: '#DC2626',
  high: '#F59E0B',
  medium: '#FBBF24',
  low: '#10B981',
  
  // UI
  primary: '#6366F1',
  primaryLight: '#E0E7FF',
  secondary: '#8B5CF6',
  successLight: '#D1FAE5',
  background: '#F9FAFB',
  backgroundAlt: '#F3F4F6',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  text: '#111827',
  textSecondary: '#6B7280',
  
  // Vitals
  heartRateNormal: '#10B981',
  heartRateElevated: '#F59E0B',
  heartRateLow: '#3B82F6',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: 'bold' as const },
  h2: { fontSize: 24, fontWeight: '600' as const },
  h3: { fontSize: 20, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: 'normal' as const },
  caption: { fontSize: 14, fontWeight: 'normal' as const },
  small: { fontSize: 12, fontWeight: 'normal' as const },
};
