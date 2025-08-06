// Spacing tokens for consistent layout
export const spacing = {
  // Base spacing scale
  xs: 4,    // 4px
  sm: 8,    // 8px
  md: 16,   // 16px
  lg: 24,   // 24px
  xl: 32,   // 32px
  xxl: 48,  // 48px
  xxxl: 64, // 64px
  
  // Component-specific spacing
  component: {
    screenPadding: 20,
    cardPadding: 16,
    cardMargin: 16,
    inputPadding: 14,
    buttonPadding: 14,
    modalPadding: 24,
    sectionGap: 32,
    
    // Border radius
    cardRadius: 12,
    buttonRadius: 8,
    inputRadius: 8,
    modalRadius: 16,
    chipRadius: 16,
  },
  
  // Layout spacing
  layout: {
    navHeight: 64,
    tabBarHeight: 80,
    headerHeight: 56,
    maxWidth: 1280,
  }
} as const;