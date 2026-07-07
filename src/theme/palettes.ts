// Color palettes, shadow definitions, and gradient tokens for the Aurora design system.

export type ThemeColors = typeof COLORS_LIGHT;

interface ShadowStyle {
  boxShadow: string;
}

export type ThemeShadows = {
  small: ShadowStyle;
  medium: ShadowStyle;
  large: ShadowStyle;
  glow: ShadowStyle;
  glowSecondary: ShadowStyle;
  glowAccent: ShadowStyle;
};

// ── Gradient tokens ──────────────────────────────────────────────────────────
export const GRADIENTS = {
  // Primary violet-to-indigo — buttons, active states
  primary: ['#7C3AED', '#4F46E5'] as [string, string],
  // Aurora — hero backgrounds, onboarding
  aurora: ['#7C3AED', '#0EA5E9', '#10B981'] as [string, string, string],
  // Warm — alerts, trending badges
  warm: ['#F59E0B', '#EF4444'] as [string, string],
  // Nature — emerald accent areas
  nature: ['#10B981', '#0D9488'] as [string, string],
  // Dark card fill — subtle depth on dark surfaces
  darkCard: ['#1A1A2E', '#252547'] as [string, string],
  // Hero overlay — home screen header gradient
  hero: ['#0D0D1A', '#1A1A2E'] as [string, string],
  // User message bubble
  userBubble: ['#7C3AED', '#4F46E5'] as [string, string],
  // Info / cyan accent
  info: ['#0EA5E9', '#06B6D4'] as [string, string],
};

// ── Light palette ──────────────────────────────────────────────────────────
export const COLORS_LIGHT = {
  // Primary accent: violet
  primary: '#7C3AED',
  primaryDark: '#6D28D9',
  primaryLight: '#A78BFA',

  // Secondary accent: emerald (off-grid / nature)
  secondary: '#10B981',
  secondaryDark: '#059669',
  secondaryLight: '#34D399',

  // Tertiary accent: amber (energy / warmth)
  accent: '#F59E0B',
  accentLight: '#FCD34D',

  // Info accent: cyan (data / AI)
  info: '#0EA5E9',
  infoLight: '#38BDF8',

  // Backgrounds
  background: '#FAFBFF',
  surface: '#F1F5FF',
  surfaceLight: '#E8EEFF',
  surfaceHover: '#DDE5FF',

  // Text hierarchy
  text: '#0F0A1E',
  textSecondary: '#4B5480',
  textMuted: '#8892B0',
  textDisabled: '#C0C8E0',

  // Borders
  border: '#DDE5FF',
  borderLight: '#EBF0FF',
  borderFocus: '#7C3AED',

  // Semantic colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  trending: '#F59E0B',
  errorBackground: 'rgba(239, 68, 68, 0.10)',

  // Special
  overlay: 'rgba(15, 10, 30, 0.45)',
  divider: '#E8EEFF',
};

// ── Dark palette ───────────────────────────────────────────────────────────
export const COLORS_DARK = {
  // Primary accent: violet
  primary: '#A78BFA',
  primaryDark: '#7C3AED',
  primaryLight: '#C4B5FD',

  // Secondary accent: emerald
  secondary: '#34D399',
  secondaryDark: '#10B981',
  secondaryLight: '#6EE7B7',

  // Tertiary accent: amber
  accent: '#FBBF24',
  accentLight: '#FCD34D',

  // Info accent: cyan
  info: '#38BDF8',
  infoLight: '#7DD3FC',

  // Backgrounds: deep navy, not pure black
  background: '#0D0D1A',
  surface: '#1A1A2E',
  surfaceLight: '#252547',
  surfaceHover: '#2D2D5A',

  // Text hierarchy
  text: '#F1F5FF',
  textSecondary: '#C0C8E0',
  textMuted: '#6B7494',
  textDisabled: '#3A3F5C',

  // Borders
  border: '#252547',
  borderLight: '#2D2D5A',
  borderFocus: '#A78BFA',

  // Semantic colors
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  trending: '#FBBF24',
  errorBackground: 'rgba(248, 113, 113, 0.15)',

  // Special
  overlay: 'rgba(0, 0, 0, 0.72)',
  divider: '#252547',
};

// ── Light shadows ────────────────────────────────────────────────────────────
export const SHADOWS_LIGHT: ThemeShadows = {
  small: {
    boxShadow: '0px 2px 10px 0px rgba(124,58,237,0.10)',
  },
  medium: {
    boxShadow: '0px 4px 18px 0px rgba(124,58,237,0.15)',
  },
  large: {
    boxShadow: '0px 8px 32px 0px rgba(124,58,237,0.22)',
  },
  glow: {
    boxShadow: '0px 0px 20px 0px rgba(124,58,237,0.30)',
  },
  glowSecondary: {
    boxShadow: '0px 0px 20px 0px rgba(16,185,129,0.30)',
  },
  glowAccent: {
    boxShadow: '0px 0px 20px 0px rgba(245,158,11,0.30)',
  },
};

// ── Dark shadows (colored glows for depth) ───────────────────────────────────
export const SHADOWS_DARK: ThemeShadows = {
  small: {
    boxShadow: '0px 2px 10px 0px rgba(167,139,250,0.12)',
  },
  medium: {
    boxShadow: '0px 4px 18px 0px rgba(167,139,250,0.18)',
  },
  large: {
    boxShadow: '0px 8px 32px 0px rgba(167,139,250,0.25)',
  },
  glow: {
    boxShadow: '0px 0px 24px 0px rgba(167,139,250,0.40)',
  },
  glowSecondary: {
    boxShadow: '0px 0px 24px 0px rgba(52,211,153,0.35)',
  },
  glowAccent: {
    boxShadow: '0px 0px 24px 0px rgba(251,191,36,0.35)',
  },
};

// ── Elevation factory ──────────────────────────────────────────────
export function createElevation(colors: ThemeColors) {
  return {
    level0: {
      backgroundColor: colors.background,
      borderWidth: 0,
      borderColor: 'transparent',
    },
    level1: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    level2: {
      backgroundColor: colors.surfaceLight,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    level3: {
      backgroundColor: `${colors.surface}F2`,
      borderTopWidth: 1,
      borderColor: colors.borderLight,
      borderRadius: 20,
      blur: {
        ios: { blurAmount: 10, blurType: colors.background === '#0D0D1A' ? 'dark' : 'light' },
        android: { overlayColor: colors.overlay },
      },
    },
    level4: {
      backgroundColor: `${colors.surface}FA`,
      borderTopWidth: 1,
      borderColor: colors.primary,
      borderRadius: 20,
      blur: {
        ios: { blurAmount: 15, blurType: colors.background === '#0D0D1A' ? 'dark' : 'light' },
        android: { overlayColor: colors.overlay },
      },
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: colors.textMuted,
      borderRadius: 2,
      alignSelf: 'center' as const,
    },
  } as const;
}
