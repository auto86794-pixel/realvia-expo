import { Platform } from 'react-native'

export const Colors = {
  light: {
    background: '#F7F7F8',
    surface: '#FFFFFF',

    text: '#111111',
    muted: '#6E6E73',

    border: 'rgba(0,0,0,0.06)',

    primary: '#D6B07B',
    secondary: '#C6A46E',

    success: '#22C55E',
    danger: '#EF4444',

    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#D6B07B',
  },

  dark: {
    background: '#05060A',

    surface: 'rgba(255,255,255,0.05)',

    elevated: 'rgba(255,255,255,0.08)',

    text: '#FFFFFF',

    muted: '#8A8A93',

    border: 'rgba(255,255,255,0.08)',

    primary: '#D6B07B',

    secondary: '#E7C79A',

    goldGlow: 'rgba(214,176,123,0.18)',

    success: '#22C55E',

    danger: '#FF6B6B',

    overlay: 'rgba(0,0,0,0.45)',

    tabIconDefault: '#71717A',

    tabIconSelected: '#D6B07B',
  },
}

export const Spacing = {
  xs: 6,
  sm: 12,
  md: 20,
  lg: 32,
  xl: 48,
  xxl: 72,
}

export const Radius = {
  sm: 14,
  md: 22,
  lg: 32,
  xl: 42,
  full: 999,
}

export const Shadows = {
  luxury: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.35,
    shadowRadius: 24,

    elevation: 18,
  },

  glow: {
    shadowColor: '#D6B07B',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.28,
    shadowRadius: 22,

    elevation: 12,
  },
}

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    display: 'Georgia',
    mono: 'Menlo',
  },

  android: {
    sans: 'sans-serif',
    serif: 'serif',
    display: 'serif',
    mono: 'monospace',
  },

  web: {
    sans: `
      Inter,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      sans-serif
    `,

    serif: `
      'Cormorant Garamond',
      Georgia,
      serif
    `,

    display: `
      'Cormorant Garamond',
      serif
    `,

    mono: `
      SFMono-Regular,
      Menlo,
      Monaco,
      Consolas,
      monospace
    `,
  },

  default: {
    sans: 'sans-serif',
    serif: 'serif',
    display: 'serif',
    mono: 'monospace',
  },
})

export const Typography = {
  hero: {
    fontSize: 82,
    lineHeight: 88,
    letterSpacing: -4,
    fontWeight: '900' as const,
  },

  h1: {
    fontSize: 52,
    lineHeight: 58,
    letterSpacing: -2,
    fontWeight: '800' as const,
  },

  h2: {
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -1,
    fontWeight: '800' as const,
  },

  h3: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
  },

  body: {
    fontSize: 17,
    lineHeight: 28,
    fontWeight: '400' as const,
  },

  caption: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
  },
}