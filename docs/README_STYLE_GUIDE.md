# Next.js Marketing Boilerplate Style Guide

## Overview
This guide outlines the design system and styling conventions for the Next.js marketing boilerplate. The design system provides a modern, professional foundation for building marketing websites with a focus on accessibility, performance, and developer experience.

## Design System Philosophy
- **Consistency**: Unified design tokens across all components
- **Accessibility**: WCAG 2.1 AA compliant
- **Performance**: Optimized for fast loading and smooth transitions
- **Responsive**: Mobile-first design that scales beautifully
- **Developer-Friendly**: Easy to customize and extend

## Theme System

### Using the Theme
The site supports automatic light/dark mode switching based on user preference:

```tsx
import { useTheme } from '@/theme/ThemeProvider';

export function MyComponent() {
  const { colors, mode, toggleTheme } = useTheme();
  
  return (
    <div style={{ backgroundColor: colors.background }}>
      <h1 style={{ color: colors.text.primary }}>Hello World</h1>
      <button onClick={toggleTheme}>
        Switch to {mode === 'light' ? 'dark' : 'light'} mode
      </button>
    </div>
  );
}
```

### Using CSS Variables
For simpler use cases, you can use CSS variables directly:

```css
.my-component {
  background-color: var(--color-background);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-light);
}
```

### Color Palette

#### Primary Colors (Blue Theme)
- `primary`: Bright blue (#2563EB)
- `primaryLight`: Light blue (#60A5FA)
- `primaryDark`: Dark blue (#1E40AF)
- `secondary`: Sky blue (#60A5FA)

#### Blue Color Scale
- `blue-50`: #EFF6FF (Lightest)
- `blue-100`: #DBEAFE
- `blue-200`: #BFDBFE
- `blue-300`: #93C5FD
- `blue-400`: #60A5FA
- `blue-500`: #3B82F6 (Base)
- `blue-600`: #2563EB (Primary)
- `blue-700`: #1D4ED8
- `blue-800`: #1E40AF
- `blue-900`: #1E3A8A (Darkest)

#### Accent Colors
- `premium`: Cyan accent (#06B6D4)
- `premiumLight`: Light cyan (#67E8F9)
- `premiumDark`: Dark cyan (#0891B2)

#### Text Colors
- `text.primary`: Deep slate (#0F172A)
- `text.secondary`: Medium slate (#475569)
- `text.tertiary`: Light slate (#94A3B8)
- `text.inverse`: White (#FFFFFF)

#### Semantic Colors
- `success`: Green (#22C55E)
- `warning`: Amber (#F59E0B)
- `danger`: Red (#DC2626)
- `info`: Blue (#3B82F6)

## Typography

### Using Typography Classes
```html
<!-- Headlines -->
<h1 class="text-display1">Hero Title</h1>
<h2 class="text-h1">Page Title</h2>
<h3 class="text-h2">Section Title</h3>

<!-- Body Text -->
<p class="text-body1">Regular paragraph text</p>
<p class="text-body2">Secondary text</p>
<span class="text-body3">Small text</span>

<!-- Special -->
<div class="text-feature">Feature Text</div>
<div class="text-metric">99.9%</div>
```

### Typography with useStyles Hook
```tsx
import { useStyles } from '@/hooks/useStyles';
import { typography } from '@/styles/typography';

export function MyComponent() {
  const styles = useStyles((theme) => ({
    title: {
      ...typography.h2,
      color: theme.text.primary,
      marginBottom: theme.spacing.lg,
    },
  }));
  
  return <h2 style={styles.title}>Section Title</h2>;
}
```

## Spacing System

### Spacing Scale
- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px
- `xxl`: 48px
- `xxxl`: 64px

### Using Spacing
```tsx
import { spacing } from '@/styles/spacing';

const styles = {
  container: {
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  card: {
    padding: spacing.component.cardPadding,
    borderRadius: spacing.component.cardRadius,
  },
};
```

## Components

### Buttons
```html
<!-- Primary Button -->
<button class="btn btn-primary">Get Started</button>

<!-- Secondary Button -->
<button class="btn btn-secondary">Learn More</button>

<!-- Custom styled button -->
<button style={{
  backgroundColor: 'var(--color-premium)',
  color: 'white',
  padding: 'var(--spacing-md) var(--spacing-lg)',
  borderRadius: 'var(--radius-full)',
}}>
  Get Started
</button>
```

### Cards
```html
<div class="card shadow-md">
  <h3 class="text-h4">Card Title</h3>
  <p class="text-body1">Card content goes here</p>
</div>
```

### Container
```html
<div class="container">
  <!-- Content is centered with max-width: 1280px -->
</div>
```

## Shadows
```html
<div class="shadow-sm">Subtle shadow</div>
<div class="shadow-md">Medium shadow</div>
<div class="shadow-lg">Large shadow</div>
<div class="shadow-xl">Extra large shadow</div>
```

## Gradients
```html
<div class="gradient-primary">Primary blue gradient background</div>
<div class="gradient-premium">Premium cyan gradient background</div>
```

## Responsive Design

### Mobile-First Approach
Always design for mobile first, then enhance for larger screens:

```css
/* Mobile styles (default) */
.hero-title {
  font-size: 36px;
}

/* Tablet and up */
@media (min-width: 768px) {
  .hero-title {
    font-size: 48px;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .hero-title {
    font-size: 60px;
  }
}
```

## Dark Mode

### Automatic Dark Mode Support
Components automatically adapt to dark mode when using theme colors:

```tsx
const styles = useStyles((theme) => ({
  card: {
    backgroundColor: theme.surface, // White in light, dark gray in dark
    color: theme.text.primary,      // Dark in light, white in dark
    border: `1px solid ${theme.border.light}`,
  },
}));
```

### Manual Dark Mode Styling
For custom dark mode styles:

```css
/* Light mode (default) */
.my-component {
  background-color: white;
}

/* Dark mode */
.dark .my-component {
  background-color: var(--color-surface);
}
```

## Animation Guidelines

### Transitions
Use consistent transitions for smooth interactions:

```css
.interactive-element {
  transition: all var(--transition-base); /* 200ms ease */
}

.fast-transition {
  transition: opacity var(--transition-fast); /* 150ms ease */
}

.slow-transition {
  transition: transform var(--transition-slow); /* 300ms ease */
}
```

## Best Practices

### Do's ✅
- Use the blue color palette for primary actions
- Use CSS variables for all color values
- Use spacing tokens for consistent layout
- Use typography classes for text styling
- Support both light and dark modes
- Test on mobile devices first
- Use semantic HTML elements
- Ensure keyboard navigation works
- Add hover states to interactive elements
- Use the gradient utilities for hero sections

### Don'ts ❌
- Don't hardcode hex color values directly
- Don't use arbitrary spacing values
- Don't forget dark mode support
- Don't use px units for typography (use rem/em)
- Don't forget focus states for interactive elements
- Don't mix different color schemes (stick to blue theme)
- Don't create new color variables without updating the guide

## Example Component

```tsx
'use client';

import { useStyles } from '@/hooks/useStyles';
import { typography } from '@/styles/typography';
import { spacing } from '@/styles/spacing';
import { shadows } from '@/styles/shadows';

export function FeatureCard({ title, description, icon }) {
  const styles = useStyles((theme) => ({
    card: {
      backgroundColor: theme.surface,
      border: `1px solid ${theme.border.light}`,
      borderRadius: spacing.component.cardRadius,
      padding: spacing.component.cardPadding,
      ...shadows.md,
      transition: 'all 200ms ease',
      '&:hover': {
        ...shadows.lg,
        transform: 'translateY(-4px)',
        borderColor: 'var(--color-primary)',
      },
    },
    iconWrapper: {
      width: 64,
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: spacing.md,
      backgroundColor: 'var(--color-blue-100)',
      marginBottom: spacing.md,
    },
    icon: {
      fontSize: 32,
      color: 'var(--color-primary)',
    },
    title: {
      ...typography.h4,
      color: theme.text.primary,
      marginBottom: spacing.sm,
    },
    description: {
      ...typography.body1,
      color: theme.text.secondary,
      lineHeight: 1.6,
    },
  }));
  
  return (
    <div style={styles.card}>
      <div style={styles.iconWrapper}>
        <div style={styles.icon}>{icon}</div>
      </div>
      <h3 style={styles.title}>{title}</h3>
      <p style={styles.description}>{description}</p>
    </div>
  );
}
```

## Resources

- **Theme Configuration**: `src/theme/themes.ts`
- **Typography**: `src/styles/typography.ts`
- **Spacing**: `src/styles/spacing.ts`
- **Shadows**: `src/styles/shadows.ts`
- **Global Styles**: `src/app/globals.css`
- **Theme Provider**: `src/theme/ThemeProvider.tsx`
- **useStyles Hook**: `src/hooks/useStyles.ts`