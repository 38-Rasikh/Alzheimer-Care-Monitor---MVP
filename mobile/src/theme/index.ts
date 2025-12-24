import { MD3LightTheme } from 'react-native-paper';
import { colors } from './tokens';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    error: colors.error,
    background: colors.background,
    surface: colors.surface,
    onSurface: colors.text,
  },
};

export * from './tokens';
