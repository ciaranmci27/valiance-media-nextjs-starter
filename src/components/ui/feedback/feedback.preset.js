/**
 * Feedback Component Library - Tailwind Preset
 *
 * Registers CSS variable-based design tokens for Toast and ConfirmationDialog
 * components. Add this preset to your tailwind.config.js:
 *
 *   presets: [require('./src/components/ui/feedback/feedback.preset')],
 *
 * Then override any variable in your global CSS:
 *
 *   :root {
 *     --fb-accent: 91 138 138;
 *     --fb-radius: 0.75rem;
 *   }
 *   .dark {
 *     --fb-accent: 123 163 163;
 *   }
 *
 * Variables use space-separated RGB channels so Tailwind's opacity
 * modifier (e.g. bg-fb-accent/50) works out of the box.
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
        // Panel surfaces
        'fb-bg': {
          DEFAULT: rgb('--fb-bg'),
          hover: rgb('--fb-bg-hover'),
        },
        // Borders
        'fb-border': {
          DEFAULT: rgb('--fb-border'),
          divider: rgb('--fb-border-divider'),
        },
        // Text
        'fb-text': {
          DEFAULT: rgb('--fb-text'),
          subtle: rgb('--fb-text-subtle'),
          placeholder: rgb('--fb-text-placeholder'),
        },
        // Overlay
        'fb-overlay': rgb('--fb-overlay'),
        // Status colors
        'fb-success': {
          DEFAULT: rgb('--fb-success'),
          subtle: rgb('--fb-success-subtle'),
          border: rgb('--fb-success-border'),
        },
        'fb-error': {
          DEFAULT: rgb('--fb-error'),
          subtle: rgb('--fb-error-subtle'),
          border: rgb('--fb-error-border'),
        },
        'fb-warning': {
          DEFAULT: rgb('--fb-warning'),
          subtle: rgb('--fb-warning-subtle'),
          border: rgb('--fb-warning-border'),
        },
        'fb-info': {
          DEFAULT: rgb('--fb-info'),
          subtle: rgb('--fb-info-subtle'),
          border: rgb('--fb-info-border'),
        },
        // Dialog footer
        'fb-footer': rgb('--fb-footer'),
        // Action buttons
        'fb-accent': {
          DEFAULT: rgb('--fb-accent'),
          fg: rgb('--fb-accent-fg'),
        },
        'fb-danger': {
          DEFAULT: rgb('--fb-danger'),
          fg: rgb('--fb-danger-fg'),
        },
        // Focus ring
        'fb-ring': rgb('--fb-ring'),
      },
      borderRadius: {
        fb: raw('--fb-radius'),
        'fb-sm': raw('--fb-radius-sm'),
      },
    },
  },
  plugins: [
    plugin(function ({ addBase }) {
      addBase({
        ':root': {
          // Panel surfaces
          '--fb-bg': '255 255 255',                 // white
          '--fb-bg-hover': '250 251 252',            // --color-background #FAFBFC

          // Borders
          '--fb-border': '226 232 240',              // --color-border-medium #E2E8F0
          '--fb-border-divider': '241 245 249',      // --color-border-light #F1F5F9

          // Text
          '--fb-text': '15 23 42',                   // --color-text-primary #0F172A
          '--fb-text-subtle': '71 85 105',           // --color-text-secondary #475569
          '--fb-text-placeholder': '148 163 184',    // --color-text-tertiary #94A3B8

          // Overlay
          '--fb-overlay': '0 0 0',                   // black

          // Status - success
          '--fb-success': '16 185 129',              // emerald-500
          '--fb-success-subtle': '236 253 245',      // emerald-50
          '--fb-success-border': '186 235 208',      // hsl(145, 80%, 88%)

          // Status - error
          '--fb-error': '239 68 68',                 // red-500
          '--fb-error-subtle': '254 242 242',        // red-50
          '--fb-error-border': '253 214 214',        // hsl(359, 90%, 94%)

          // Status - warning
          '--fb-warning': '245 158 11',              // amber-500
          '--fb-warning-subtle': '255 251 235',      // amber-50
          '--fb-warning-border': '245 232 186',      // hsl(49, 85%, 85%)

          // Status - info
          '--fb-info': '91 138 138',                 // teal (--color-info)
          '--fb-info-subtle': '240 245 245',         // teal-50 equivalent
          '--fb-info-border': '209 225 225',         // teal-200 subtle border

          // Action buttons
          '--fb-accent': '91 138 138',               // --color-primary #5B8A8A
          '--fb-accent-fg': '255 255 255',           // white
          '--fb-danger': '220 38 38',                // red-600
          '--fb-danger-fg': '255 255 255',           // white

          // Focus ring
          '--fb-ring': '224 235 235',                // --color-primary-100 #E0EBEB

          // Dialog footer
          '--fb-footer': '250 251 252',              // --color-background #FAFBFC

          // Shape
          '--fb-radius': '0.75rem',
          '--fb-radius-sm': '0.5rem',
        },
        '.dark': {
          // Panel surfaces
          '--fb-bg': '10 10 10',                     // --color-surface #0A0A0A
          '--fb-bg-hover': '20 20 20',               // --color-surface-elevated #141414

          // Borders
          '--fb-border': '26 26 26',                 // ~rgba(255,255,255,0.1)
          '--fb-border-divider': '20 20 20',         // subtle divider

          // Text
          '--fb-text': '236 236 236',                // --color-text-primary #ECECEC
          '--fb-text-subtle': '139 139 139',         // --color-text-secondary #8B8B8B
          '--fb-text-placeholder': '85 85 85',       // --color-text-tertiary #555555

          // Overlay
          '--fb-overlay': '0 0 0',                   // black

          // Status - success
          '--fb-success': '52 211 153',              // emerald-400
          '--fb-success-subtle': '6 45 30',          // deep emerald
          '--fb-success-border': '23 69 48',         // hsl(150, 50%, 18%)

          // Status - error
          '--fb-error': '248 113 113',               // red-400
          '--fb-error-subtle': '69 10 10',           // deep red
          '--fb-error-border': '77 26 27',           // hsl(358, 50%, 20%)

          // Status - warning
          '--fb-warning': '251 191 36',              // amber-400
          '--fb-warning-subtle': '69 40 2',          // deep amber
          '--fb-warning-border': '57 49 19',         // hsl(45, 50%, 15%)

          // Status - info
          '--fb-info': '123 163 163',                // --color-primary #7BA3A3
          '--fb-info-subtle': '16 23 23',            // teal subtle
          '--fb-info-border': '27 41 41',            // teal subtle border

          // Action buttons
          '--fb-accent': '123 163 163',              // --color-primary #7BA3A3
          '--fb-accent-fg': '255 255 255',           // white
          '--fb-danger': '239 68 68',                // red-500
          '--fb-danger-fg': '255 255 255',           // white

          // Focus ring
          '--fb-ring': '27 41 41',                   // matches input preset

          // Dialog footer
          '--fb-footer': '10 10 10',                 // --color-surface #0A0A0A

          // Shape tokens inherited from :root (no override needed)
        },
      });
    }),
  ],
};
