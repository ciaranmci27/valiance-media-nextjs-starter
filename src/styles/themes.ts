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
  // Teal palette (Valiance Media Editorial brand)
  blue: {
    50: '#F0F5F5',
    100: '#E0EBEB',
    200: '#C2D6D6',
    300: '#A3C2C2',
    400: '#7BA3A3',
    500: '#5B8A8A', // Primary teal
    600: '#4A7272', // Valiance Media teal
    700: '#3A5A5A',
    800: '#2A4242',
    900: '#1A2A2A', // Deep teal
  },

  // Secondary/Accent palette (copper)
  gold: '#C5A68F', // Copper as secondary
  goldLight: '#D4BBA8',
  goldDark: '#A88B74',

  // Premium accent (teal for contrast)
  premium: {
    main: '#5B8A8A',
    light: '#7BA3A3',
    dark: '#4A7272',
  },

  // Semantic colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#5B8A8A',
  
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
  
  // Dark theme specific - Premium SaaS dark
  background: '#000000', // True black
  surface: '#0A0A0A', // Barely lifted
  surfaceElevated: '#141414', // Cards/modals

  text: {
    primary: '#ECECEC', // Crisp but not harsh
    secondary: '#8B8B8B', // Muted mid-gray
    tertiary: '#555555', // Subtle
    inverse: '#000000', // Dark text for light surfaces
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