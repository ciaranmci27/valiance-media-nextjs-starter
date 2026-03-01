/**
 * Input Component Library - Tailwind Preset
 *
 * Registers CSS variable-based design tokens so every input component
 * can be themed in one place. Add this preset to your tailwind.config.js:
 *
 *   presets: [require('./src/components/ui/inputs/inputs.preset')],
 *
 * Then override any variable in your global CSS:
 *
 *   :root {
 *     --input-accent: 91 138 138;    // teal brand
 *     --input-radius: 0.75rem;       // rounder corners
 *   }
 *   .dark {
 *     --input-accent: 123 163 163;
 *   }
 *
 * Variables use space-separated RGB channels so Tailwind's opacity
 * modifier (e.g. bg-input-accent/50) works out of the box.
 */

const plugin = require('tailwindcss/plugin');

/** Helper: wrap a CSS variable in rgb() with alpha support */
const rgb = (name) => `rgb(var(${name}) / <alpha-value>)`;

/** Helper: raw variable reference (for non-color tokens) */
const raw = (name) => `var(${name})`;

module.exports = {
  theme: {
    extend: {
      colors: {
        // Surfaces
        'input-bg': {
          DEFAULT: rgb('--input-bg'),
          hover: rgb('--input-bg-hover'),
          active: rgb('--input-bg-active'),
          disabled: rgb('--input-bg-disabled'),
          inset: rgb('--input-bg-inset'),
        },
        // Borders
        'input-border': {
          DEFAULT: rgb('--input-border'),
          hover: rgb('--input-border-hover'),
          focus: rgb('--input-border-focus'),
          error: rgb('--input-border-error'),
          divider: rgb('--input-border-divider'),
        },
        // Text
        'input-text': {
          DEFAULT: rgb('--input-text'),
          label: rgb('--input-text-label'),
          placeholder: rgb('--input-text-placeholder'),
          subtle: rgb('--input-text-subtle'),
          disabled: rgb('--input-text-disabled'),
        },
        // Accent (brand)
        'input-accent': {
          DEFAULT: rgb('--input-accent'),
          fg: rgb('--input-accent-fg'),
          subtle: rgb('--input-accent-subtle'),
          'subtle-fg': rgb('--input-accent-subtle-fg'),
        },
        // Focus rings
        'input-ring': {
          DEFAULT: rgb('--input-ring'),
          error: rgb('--input-ring-error'),
        },
        // Feedback
        'input-error': rgb('--input-error'),
        'input-warning': rgb('--input-warning'),
      },
      borderRadius: {
        input: raw('--input-radius'),
        'input-sm': raw('--input-radius-sm'),
      },
    },
  },
  plugins: [
    plugin(function ({ addBase }) {
      addBase({
        ':root': {
          // Surfaces
          '--input-bg': '255 255 255',               // --color-surface #FFFFFF
          '--input-bg-hover': '250 251 252',          // --color-background #FAFBFC
          '--input-bg-active': '241 245 249',         // --color-border-light #F1F5F9
          '--input-bg-disabled': '241 245 249',       // --color-surface-disabled #F1F5F9
          '--input-bg-inset': '203 213 225',          // --color-border-heavy #CBD5E1

          // Borders
          '--input-border': '226 232 240',            // --color-border-medium #E2E8F0
          '--input-border-hover': '203 213 225',      // --color-border-heavy #CBD5E1
          '--input-border-focus': '91 138 138',       // --color-primary #5B8A8A
          '--input-border-error': '248 113 113',      // red-400
          '--input-border-divider': '241 245 249',    // --color-border-light #F1F5F9

          // Text
          '--input-text': '15 23 42',                 // --color-text-primary #0F172A
          '--input-text-label': '71 85 105',          // --color-text-secondary #475569
          '--input-text-placeholder': '148 163 184',  // --color-text-tertiary #94A3B8
          '--input-text-subtle': '100 116 139',       // slate-500 #64748B
          '--input-text-disabled': '203 213 225',     // --color-text-disabled #CBD5E1

          // Accent
          '--input-accent': '91 138 138',             // --color-primary #5B8A8A
          '--input-accent-fg': '255 255 255',         // white
          '--input-accent-subtle': '240 245 245',     // --color-primary-50 #F0F5F5
          '--input-accent-subtle-fg': '58 90 90',     // --color-primary-700 #3A5A5A

          // Focus rings
          '--input-ring': '224 235 235',              // --color-primary-100 #E0EBEB
          '--input-ring-error': '254 226 226',        // red-100

          // Feedback
          '--input-error': '239 68 68',               // red-500
          '--input-warning': '245 158 11',            // amber-500

          // Shape
          '--input-radius': '0.5rem',                 // --radius-md 8px
          '--input-radius-sm': '0.25rem',             // --radius-sm 4px
        },
        '.dark': {
          // Surfaces
          '--input-bg': '10 10 10',                   // --color-surface #0A0A0A
          '--input-bg-hover': '20 20 20',             // --color-surface-elevated #141414
          '--input-bg-active': '30 30 30',            // step above elevated
          '--input-bg-disabled': '20 20 20',          // --color-surface-elevated
          '--input-bg-inset': '51 51 51',             // --color-text-disabled #333333

          // Borders
          '--input-border': '26 26 26',               // ~rgba(255,255,255,0.1) on black
          '--input-border-hover': '51 51 51',         // ~rgba(255,255,255,0.2) on black
          '--input-border-focus': '123 163 163',      // --color-primary dark #7BA3A3
          '--input-border-error': '248 113 113',      // red-400
          '--input-border-divider': '20 20 20',       // subtle divider

          // Text
          '--input-text': '236 236 236',              // --color-text-primary #ECECEC
          '--input-text-label': '236 236 236',        // --color-text-primary #ECECEC
          '--input-text-placeholder': '85 85 85',     // --color-text-tertiary #555555
          '--input-text-subtle': '139 139 139',       // --color-text-secondary #8B8B8B
          '--input-text-disabled': '51 51 51',        // --color-text-disabled #333333

          // Accent
          '--input-accent': '123 163 163',            // --color-primary dark #7BA3A3
          '--input-accent-fg': '255 255 255',         // white
          '--input-accent-subtle': '16 23 23',        // ~rgba(91,138,138,0.15) on black
          '--input-accent-subtle-fg': '163 194 194',  // --color-primary-300 #A3C2C2

          // Focus rings
          '--input-ring': '27 41 41',                 // ~rgba(91,138,138,0.3) on black
          '--input-ring-error': '127 29 29',          // deep red ring

          // Feedback
          '--input-error': '239 68 68',               // red-500
          '--input-warning': '245 158 11',            // amber-500
        },
      });
    }),
  ],
};
