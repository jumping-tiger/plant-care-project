import {
  MD3DarkTheme,
  adaptNavigationTheme,
} from 'react-native-paper';
import {
  DarkTheme as NavigationDarkTheme,
} from '@react-navigation/native';
import { Colors } from './colors';

const customDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: Colors.primaryLight,
    primaryContainer: Colors.primaryDark,
    secondary: Colors.secondary,
    secondaryContainer: Colors.primaryDark,
    background: 'transparent',
    surface: Colors.surface,
    surfaceVariant: Colors.surfaceLight,
    error: Colors.error,
    onPrimary: Colors.black,
    onSecondary: Colors.black,
    onBackground: Colors.text,
    onSurface: Colors.text,
    onSurfaceVariant: Colors.textSecondary,
    outline: Colors.border,
  },
};

const { DarkTheme: navDark } = adaptNavigationTheme({
  reactNavigationDark: NavigationDarkTheme,
  materialDark: customDarkTheme,
});

export const DarkTheme = {
  ...navDark,
  ...customDarkTheme,
  colors: {
    ...navDark.colors,
    ...customDarkTheme.colors,
  },
};
