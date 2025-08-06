export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  
  // Theme colors
  blue: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  
  gold: string;
  goldLight: string;
  goldDark: string;
  
  // Premium colors
  premium: {
    main: string;
    light: string;
    dark: string;
  };
  
  // Base colors
  background: string;
  surface: string;
  surfaceElevated: string;
  
  // Text colors
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  
  // UI colors
  border: {
    light: string;
    medium: string;
    heavy: string;
    accent: string;
  };
  
  // Semantic colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Gray scale
  gray: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  
  // Neutral
  neutral: string;
  
  // Shadow colors for CSS
  shadow: {
    light: string;
    medium: string;
    dark: string;
  };
  
  // Gradients
  gradients: {
    primary: string[];
    premium: string[];
    success: string[];
  };
}

const baseColors = {
  // Blue palette (Valiance Media brand)
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6', // Primary blue
    600: '#2563EB', // Valiance Media blue
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A', // Deep blue
  },
  
  // Secondary/Accent palette (lighter blues)
  gold: '#60A5FA', // Using light blue as secondary
  goldLight: '#93C5FD',
  goldDark: '#3B82F6',
  
  // Premium accent (cyan for contrast)
  premium: {
    main: '#06B6D4',
    light: '#67E8F9',
    dark: '#0891B2',
  },
  
  // Semantic colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Gray scale
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
};

export const lightTheme: ThemeColors = {
  // Primary colors
  primary: baseColors.blue[600], // Valiance Media blue
  primaryLight: baseColors.blue[400], // Light blue
  primaryDark: baseColors.blue[800],
  secondary: baseColors.gold,
  
  // Use base colors
  ...baseColors,
  
  // Light theme specific - Modern background system
  background: '#FAFBFC', // Ultra-light with hint of blue
  surface: '#FFFFFF', // Pure white for cards/components
  surfaceElevated: '#FFFFFF', // Same as surface in light mode
  
  text: {
    primary: '#0F172A', // Deep slate
    secondary: '#475569', // Medium slate
    tertiary: '#94A3B8', // Light slate
    inverse: '#FFFFFF',
  },
  
  border: {
    light: '#F1F5F9', // gray-100
    medium: '#E2E8F0', // gray-200
    heavy: '#CBD5E1', // gray-300
    accent: baseColors.blue[500],
  },
  
  neutral: baseColors.gray[500],
  
  shadow: {
    light: 'rgba(0, 0, 0, 0.05)',
    medium: 'rgba(0, 0, 0, 0.1)',
    dark: 'rgba(0, 0, 0, 0.2)',
  },
  
  gradients: {
    primary: [baseColors.blue[600], baseColors.blue[400]],
    premium: [baseColors.premium.main, baseColors.premium.dark],
    success: [baseColors.success, '#34D399'],
  },
};

export const darkTheme: ThemeColors = {
  // Primary colors remain vibrant in dark mode
  primary: baseColors.blue[500], // Brighter blue for dark mode
  primaryLight: baseColors.blue[400],
  primaryDark: baseColors.blue[700],
  secondary: baseColors.gold,
  
  // Use base colors
  ...baseColors,
  
  // Dark theme specific - Modern background system
  background: '#0F172A', // Deep dark slate
  surface: '#1E293B', // Elevated dark surface
  surfaceElevated: '#334155', // Higher elevation (lighter slate)
  
  text: {
    primary: '#F8FAFC', // Light text for dark background
    secondary: '#CBD5E1', // Medium light text
    tertiary: '#64748B', // Muted text
    inverse: '#0F172A', // Dark text for light surfaces
  },
  
  border: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.2)',
    heavy: 'rgba(255, 255, 255, 0.3)',
    accent: baseColors.blue[400],
  },
  
  neutral: baseColors.gray[400],
  
  shadow: {
    light: 'rgba(0, 0, 0, 0.2)',
    medium: 'rgba(0, 0, 0, 0.4)',
    dark: 'rgba(0, 0, 0, 0.6)',
  },
  
  gradients: {
    primary: [baseColors.blue[500], baseColors.blue[700]],
    premium: [baseColors.premium.main, baseColors.premium.dark],
    success: [baseColors.success, '#10B981'],
  },
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;