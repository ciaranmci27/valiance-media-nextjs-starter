/**
 * Styles Index
 * 
 * Central export point for all style-related modules.
 * This makes imports cleaner and more maintainable.
 */

// Theme exports
export { ThemeProvider, useTheme } from './ThemeProvider';
export { lightTheme, darkTheme, themes } from './themes';
export type { ThemeColors, ThemeMode } from './themes';

// Typography exports
export { typography } from './typography';

// Spacing exports
export { spacing } from './spacing';

// Shadow exports
export { shadows } from './shadows';

// Note: globals.css is imported directly in layout.tsx as it needs to be loaded globally