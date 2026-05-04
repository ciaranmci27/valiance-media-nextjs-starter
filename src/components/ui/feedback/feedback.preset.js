/**
 * Feedback Component Library — Tailwind Preset
 *
 * Self-contained design system for the feedback/ component bank
 * (toasts, dialogs). Drop into any React codebase: copy
 * src/components/ui/feedback/, add this preset to tailwind.config.js,
 * components style themselves.
 *
 * Token resolution (3-tier cascade):
 *   1. Per-component override:  --fb-accent: red
 *   2. Brand cascade:            --color-primary, --color-text-primary, etc.
 *      defined in your design system → feedback tokens auto-pick up
 *   3. Hardcoded default:        used if neither of the above exist
 *
 * To rebrand: define --color-primary (and friends) in your global CSS.
 * To fine-tune one feedback token: define --fb-accent (etc.) directly.
 */

const plugin = require('tailwindcss/plugin');

module.exports = {
  theme: {
    extend: {
      colors: {
        'fb-bg': {
          DEFAULT: 'var(--fb-bg)',
          hover: 'var(--fb-bg-hover)',
        },
        'fb-border': {
          DEFAULT: 'var(--fb-border)',
          divider: 'var(--fb-border-divider)',
        },
        'fb-text': {
          DEFAULT: 'var(--fb-text)',
          subtle: 'var(--fb-text-subtle)',
          placeholder: 'var(--fb-text-placeholder)',
        },
        'fb-overlay': 'var(--fb-overlay)',
        'fb-success': {
          DEFAULT: 'var(--fb-success)',
          subtle: 'var(--fb-success-subtle)',
          border: 'var(--fb-success-border)',
        },
        'fb-error': {
          DEFAULT: 'var(--fb-error)',
          subtle: 'var(--fb-error-subtle)',
          border: 'var(--fb-error-border)',
        },
        'fb-warning': {
          DEFAULT: 'var(--fb-warning)',
          subtle: 'var(--fb-warning-subtle)',
          border: 'var(--fb-warning-border)',
        },
        'fb-info': {
          DEFAULT: 'var(--fb-info)',
          subtle: 'var(--fb-info-subtle)',
          border: 'var(--fb-info-border)',
        },
        'fb-footer': 'var(--fb-footer)',
        'fb-accent': {
          DEFAULT: 'var(--fb-accent)',
          fg: 'var(--fb-accent-fg)',
        },
        'fb-danger': {
          DEFAULT: 'var(--fb-danger)',
          fg: 'var(--fb-danger-fg)',
        },
        'fb-ring': 'var(--fb-ring)',
      },
      borderRadius: {
        fb: 'var(--fb-radius)',
        'fb-sm': 'var(--fb-radius-sm)',
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
          '--fb-bg': 'var(--color-surface, #FFFFFF)',
          '--fb-bg-hover': 'var(--color-background, #F8FAFC)',

          '--fb-border': 'var(--color-border-medium, #E2E8F0)',
          '--fb-border-divider': 'var(--color-border-light, #F1F5F9)',

          '--fb-text': 'var(--color-text-primary, #0F172A)',
          '--fb-text-subtle': 'var(--color-text-secondary, #475569)',
          '--fb-text-placeholder': 'var(--color-text-tertiary, #94A3B8)',

          '--fb-overlay': '#000000',

          '--fb-success': 'var(--color-success, #10B981)',
          '--fb-success-subtle': 'color-mix(in srgb, var(--color-success, #10B981) 12%, var(--color-surface, #FFFFFF))',
          '--fb-success-border': 'color-mix(in srgb, var(--color-success, #10B981) 30%, var(--color-border-light, #F1F5F9))',

          '--fb-error': 'var(--color-error, #EF4444)',
          '--fb-error-subtle': 'color-mix(in srgb, var(--color-error, #EF4444) 12%, var(--color-surface, #FFFFFF))',
          '--fb-error-border': 'color-mix(in srgb, var(--color-error, #EF4444) 30%, var(--color-border-light, #F1F5F9))',

          '--fb-warning': 'var(--color-warning, #F59E0B)',
          '--fb-warning-subtle': 'color-mix(in srgb, var(--color-warning, #F59E0B) 12%, var(--color-surface, #FFFFFF))',
          '--fb-warning-border': 'color-mix(in srgb, var(--color-warning, #F59E0B) 30%, var(--color-border-light, #F1F5F9))',

          '--fb-info': 'var(--color-info, #3B82F6)',
          '--fb-info-subtle': 'color-mix(in srgb, var(--color-info, #3B82F6) 12%, var(--color-surface, #FFFFFF))',
          '--fb-info-border': 'color-mix(in srgb, var(--color-info, #3B82F6) 30%, var(--color-border-light, #F1F5F9))',

          '--fb-accent': 'var(--color-primary, #3B82F6)',
          '--fb-accent-fg': 'var(--color-text-on-primary, #FFFFFF)',
          '--fb-danger': 'var(--color-error, #EF4444)',
          '--fb-danger-fg': '#FFFFFF',

          '--fb-ring': 'var(--color-primary-100, #DBEAFE)',
          '--fb-footer': 'var(--color-background, #F8FAFC)',

          '--fb-radius': 'var(--radius-lg, 0.75rem)',
          '--fb-radius-sm': 'var(--radius-md, 0.5rem)',
        },
        '[data-theme="dark"], .dark': {
          // Slightly lighter status hues read better on deep backgrounds
          '--fb-success': '#34D399',
          '--fb-error': '#F87171',
          '--fb-warning': '#FBBF24',
        },
      });
    }),
  ],
};
