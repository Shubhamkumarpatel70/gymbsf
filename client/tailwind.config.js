/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Accent: Rich Crimson Red - Power, passion, intensity (for primary actions, warnings, CTAs)
        primary: {
          DEFAULT: '#C41E3A', // Rich Crimson Red
          light: '#E63950',
          dark: '#A01A2E',
        },
        // Dark Neutral: Pure Charcoal - Sophistication, strength (dominant background)
        secondary: {
          DEFAULT: '#1A1A1A', // Pure Charcoal
          light: '#2D2D2D',
          dark: '#0D0D0D',
        },
        // Light Neutral: Light Gray - Balance, precision (for cards, sections)
        neutral: {
          DEFAULT: '#E5E5E5', // Light Gray
          light: '#FFFFFF',
          dark: '#CCCCCC',
        },
        // Secondary Accent: Metallic Gold - Premium quality, achievement, victory (for headers, highlights)
        accent: {
          DEFAULT: '#FFD700', // Metallic Gold
          light: '#FFE44D',
          dark: '#CCAA00',
        },
        // Highlight: Cool Steel Blue - Cool-down, focus, equipment (for secondary elements)
        highlight: {
          DEFAULT: '#8B9EB7', // Cool Steel Blue
          light: '#A8B8CC',
          dark: '#6B7A8F',
        },
        // Text colors for contrast
        text: {
          DEFAULT: '#1A1A1A', // Charcoal text on light backgrounds
          light: '#4A4A4A',
          dark: '#0D0D0D',
          onDark: '#E5E5E5', // Light gray text on dark backgrounds
          gold: '#FFD700', // Gold text for headers on charcoal
        },
        // CTA: Use crimson for call-to-action buttons
        cta: {
          DEFAULT: '#C41E3A', // Rich Crimson Red
          light: '#E63950',
          dark: '#A01A2E',
        },
        // Health/Success - Use gold for success states
        health: {
          DEFAULT: '#FFD700',
          light: '#FFE44D',
          dark: '#CCAA00',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

