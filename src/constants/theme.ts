export const Colors = {
  // Core palette from design reference
  primary: '#F2EAD3',
  secondary: '#000000',
  accent: '#F2EAD3',
  background: '#000000',
  surface: '#0A0A0A',
  surfaceLight: '#111111',
  surfaceElevated: '#141414',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.65)',
  textTertiary: 'rgba(255, 255, 255, 0.4)',
  textAccent: '#F2EAD3',

  // Borders
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.12)',
  borderAccent: 'rgba(242, 234, 211, 0.3)',

  // States
  success: '#4CAF50',
  error: '#EF4444',
  warning: '#F59E0B',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  glassBackground: 'rgba(10, 10, 10, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.06)',

  // Glow effects
  glowAccent: 'rgba(242, 234, 211, 0.15)',
  glowAccentStrong: 'rgba(242, 234, 211, 0.3)',
};

export const Fonts = {
  // Display - Inter (large headings)
  displayLg: {
    fontFamily: 'Inter_500Medium',
    fontSize: 48,
    lineHeight: 56,
  },
  displayMd: {
    fontFamily: 'Inter_500Medium',
    fontSize: 36,
    lineHeight: 44,
  },
  displaySm: {
    fontFamily: 'Inter_500Medium',
    fontSize: 28,
    lineHeight: 36,
  },

  // Headings - Playfair Display
  headingLg: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 32,
    lineHeight: 40,
  },
  headingMd: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 24,
    lineHeight: 32,
  },
  headingSm: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 20,
    lineHeight: 28,
  },

  // Body - Inter
  bodyLg: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  bodyMd: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 22,
  },
  bodySm: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
  },

  // Labels - JetBrains Mono
  labelLg: {
    fontFamily: 'JetBrainsMono_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 1,
  },
  labelMd: {
    fontFamily: 'JetBrainsMono_600SemiBold',
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 1,
  },
  labelSm: {
    fontFamily: 'JetBrainsMono_600SemiBold',
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1.5,
  },
};

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  massive: 64,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: '#F2EAD3',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
};
