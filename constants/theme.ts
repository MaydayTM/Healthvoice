// HealthVoice Design System
// Inspired by elegant, Renaissance-era aesthetics with warm paper tones

export const colors = {
  // Warm paper backgrounds
  paper: {
    DEFAULT: '#FDFCF8',
    50: '#FEFDFB',
    100: '#FDFCF8',
    200: '#F9F7F1',
    300: '#F5F2EA',
  },
  // Rich ink colors
  ink: {
    DEFAULT: '#1C1917',
    50: '#F5F5F4',
    100: '#E7E5E4',
    200: '#D6D3D1',
    300: '#A8A29E',
    400: '#78716C',
    500: '#57534E',
    600: '#44403C',
    700: '#292524',
    800: '#1C1917',
    900: '#0C0A09',
  },
  // Warm amber accent
  amber: {
    DEFAULT: '#78350F',
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  // Terracotta accent
  terra: {
    DEFAULT: '#9A3412',
    light: '#C2410C',
    dark: '#7C2D12',
  },
  // Status colors (muted)
  success: '#4D7C0F',
  warning: '#B45309',
  error: '#B91C1C',
  // Category colors
  category: {
    voeding: '#4D7C0F',      // Olive green
    supplement: '#7E22CE',   // Deep purple
    beweging: '#B45309',     // Warm amber
    slaap: '#1E40AF',        // Deep blue
    welzijn: '#BE185D',      // Rose
    overig: '#57534E',       // Stone
  },
};

export const shadows = {
  glass: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 15,
    elevation: 2,
  },
  soft: {
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  elevated: {
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
};

export const typography = {
  // Display - Large headlines
  display: {
    fontSize: 48,
    lineHeight: 44,
    letterSpacing: -0.96,
    fontWeight: '300' as const,
  },
  // Headline - Section headers
  headline: {
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.32,
    fontWeight: '300' as const,
  },
  // Title - Card titles
  title: {
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: -0.2,
    fontWeight: '400' as const,
  },
  // Body - Main content
  body: {
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '400' as const,
  },
  // Caption - Labels, meta text
  caption: {
    fontSize: 12,
    lineHeight: 17,
    letterSpacing: 0.6,
    fontWeight: '500' as const,
    textTransform: 'uppercase' as const,
  },
  // Micro - Very small labels
  micro: {
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1,
    fontWeight: '500' as const,
    textTransform: 'uppercase' as const,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};
