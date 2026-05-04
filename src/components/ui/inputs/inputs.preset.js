/**
 * Input Component Library — Tailwind Preset
 *
 * Self-contained design system for the inputs/ component bank.
 * Drop into any React codebase: copy src/components/ui/inputs/, add
 * this preset to tailwind.config.js, and components style themselves.
 *
 * Token resolution (3-tier cascade):
 *   1. Per-component override:  --input-accent: red
 *   2. Brand cascade:            --color-primary, --color-text-primary, etc.
 *      defined in your design system → input tokens auto-pick up
 *   3. Hardcoded default:        used if neither of the above exist
 *
 * To rebrand: define --color-primary (and friends) in your global CSS.
 * To fine-tune one input token: define --input-accent (etc.) directly.
 */

const plugin = require('tailwindcss/plugin');

module.exports = {
  theme: {
    extend: {
      colors: {
        'input-bg': {
          DEFAULT: 'var(--input-bg)',
          hover: 'var(--input-bg-hover)',
          active: 'var(--input-bg-active)',
          disabled: 'var(--input-bg-disabled)',
          inset: 'var(--input-bg-inset)',
        },
        'input-border': {
          DEFAULT: 'var(--input-border)',
          hover: 'var(--input-border-hover)',
          focus: 'var(--input-border-focus)',
          error: 'var(--input-border-error)',
          divider: 'var(--input-border-divider)',
        },
        'input-text': {
          DEFAULT: 'var(--input-text)',
          label: 'var(--input-text-label)',
          placeholder: 'var(--input-text-placeholder)',
          subtle: 'var(--input-text-subtle)',
          disabled: 'var(--input-text-disabled)',
        },
        'input-accent': {
          DEFAULT: 'var(--input-accent)',
          fg: 'var(--input-accent-fg)',
          subtle: 'var(--input-accent-subtle)',
          'subtle-fg': 'var(--input-accent-subtle-fg)',
        },
        'input-ring': {
          DEFAULT: 'var(--input-ring)',
          error: 'var(--input-ring-error)',
        },
        'input-error': 'var(--input-error)',
        'input-warning': 'var(--input-warning)',
      },
      borderRadius: {
        input: 'var(--input-radius)',
        'input-sm': 'var(--input-radius-sm)',
      },
    },
  },
  plugins: [
    plugin(function ({ addBase }) {
      addBase({
        // Hardcoded fallbacks use Tailwind's slate + blue scales — universal
        // "untheme'd default" colors. They communicate "you haven't branded
        // yet" rather than competing with a real brand identity.
        ':root': {
          '--input-bg': 'var(--color-surface, #FFFFFF)',
          '--input-bg-hover': 'var(--color-background, #F8FAFC)',
          '--input-bg-active': 'var(--color-border-light, #F1F5F9)',
          '--input-bg-disabled': 'var(--color-border-light, #F1F5F9)',
          '--input-bg-inset': 'var(--color-border-heavy, #CBD5E1)',

          '--input-border': 'var(--color-border-medium, #E2E8F0)',
          '--input-border-hover': 'var(--color-border-heavy, #CBD5E1)',
          '--input-border-focus': 'var(--color-primary, #3B82F6)',
          '--input-border-error': 'var(--color-error, #EF4444)',
          '--input-border-divider': 'var(--color-border-light, #F1F5F9)',

          '--input-text': 'var(--color-text-primary, #0F172A)',
          '--input-text-label': 'var(--color-text-secondary, #475569)',
          '--input-text-placeholder': 'var(--color-text-tertiary, #94A3B8)',
          '--input-text-subtle': 'var(--color-text-secondary, #475569)',
          '--input-text-disabled': 'var(--color-text-disabled, #CBD5E1)',

          '--input-accent': 'var(--color-primary, #3B82F6)',
          '--input-accent-fg': 'var(--color-text-on-primary, #FFFFFF)',
          '--input-accent-subtle': 'var(--color-primary-50, #EFF6FF)',
          '--input-accent-subtle-fg': 'var(--color-primary-700, #1D4ED8)',

          '--input-ring': 'var(--color-primary-100, #DBEAFE)',
          '--input-ring-error': 'color-mix(in srgb, var(--color-error, #EF4444) 20%, transparent)',

          '--input-error': 'var(--color-error, #EF4444)',
          '--input-warning': 'var(--color-warning, #F59E0B)',

          '--input-radius': 'var(--radius-md, 0.5rem)',
          '--input-radius-sm': 'var(--radius-sm, 0.25rem)',
        },
        '[data-theme="dark"], .dark': {
          // Bump label + subtle text up one tier in dark mode for readability
          '--input-text-label': 'var(--color-text-primary, #ECECEC)',
          '--input-text-subtle': 'var(--color-text-secondary, #8B8B8B)',
          '--input-bg-hover': 'var(--color-surface-elevated, #141414)',
        },
      });
    }),
  ],
};
