// Typography styles for consistent text across the app
export const typography = {
  // Display styles (marketing hero text)
  display1: {
    fontSize: 72,
    lineHeight: 1.1,
    fontWeight: 700,
    letterSpacing: -0.02,
  },
  display2: {
    fontSize: 60,
    lineHeight: 1.2,
    fontWeight: 700,
    letterSpacing: -0.02,
  },
  
  // Headers
  h1: {
    fontSize: 48,
    lineHeight: 1.2,
    fontWeight: 700,
    letterSpacing: -0.01,
  },
  h2: {
    fontSize: 36,
    lineHeight: 1.3,
    fontWeight: 700,
    letterSpacing: -0.01,
  },
  h3: {
    fontSize: 30,
    lineHeight: 1.3,
    fontWeight: 600,
  },
  h4: {
    fontSize: 24,
    lineHeight: 1.4,
    fontWeight: 600,
  },
  h5: {
    fontSize: 20,
    lineHeight: 1.4,
    fontWeight: 600,
  },
  h6: {
    fontSize: 18,
    lineHeight: 1.5,
    fontWeight: 600,
  },
  
  // Body text
  body1: {
    fontSize: 16,
    lineHeight: 1.6,
    fontWeight: 400,
  },
  body2: {
    fontSize: 14,
    lineHeight: 1.5,
    fontWeight: 400,
  },
  body3: {
    fontSize: 12,
    lineHeight: 1.5,
    fontWeight: 400,
  },
  
  // Special text
  button: {
    fontSize: 16,
    lineHeight: 1.2,
    fontWeight: 600,
    letterSpacing: 0.5,
  },
  buttonLarge: {
    fontSize: 18,
    lineHeight: 1.2,
    fontWeight: 600,
    letterSpacing: 0.5,
  },
  caption1: {
    fontSize: 12,
    lineHeight: 1.4,
    fontWeight: 400,
  },
  caption2: {
    fontSize: 10,
    lineHeight: 1.4,
    fontWeight: 400,
  },
  overline: {
    fontSize: 10,
    lineHeight: 1.5,
    fontWeight: 600,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
  
  // Input and form text
  inputLabel: {
    fontSize: 14,
    lineHeight: 1.4,
    fontWeight: 500,
  },
  inputText: {
    fontSize: 16,
    lineHeight: 1.5,
    fontWeight: 400,
  },
  errorText: {
    fontSize: 12,
    lineHeight: 1.4,
    fontWeight: 400,
  },
  
  // Navigation
  navigationLabel: {
    fontSize: 11,
    lineHeight: 1.2,
    fontWeight: 500,
  },
  
  // Specific styles
  scoreDisplay: {
    fontSize: 48,
    lineHeight: 1,
    fontWeight: 700,
    letterSpacing: -1,
  },
  handicapDisplay: {
    fontSize: 32,
    lineHeight: 1.2,
    fontWeight: 600,
  },
  statValue: {
    fontSize: 24,
    lineHeight: 1.2,
    fontWeight: 600,
  },
  statLabel: {
    fontSize: 12,
    lineHeight: 1.4,
    fontWeight: 500,
    letterSpacing: 0.5,
  },
} as const;