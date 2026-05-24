import { Platform } from 'react-native';
import { colors } from './colors';

export const typography = {
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.5,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.faint,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  body: {
    fontSize: 15,
    color: colors.white,
  },
  caption: {
    fontSize: 12,
    color: colors.dim,
  },
  mono: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
} as const;
