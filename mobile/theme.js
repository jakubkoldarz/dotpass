

import { StyleSheet, Platform } from 'react-native';

export const C = {
  // Tła
  bg:         '#0D0D0D',
  surface:    '#161616',
  surfaceAlt: '#1A1A1A',

  // Obramowania
  border:     '#2A2A2A',
  borderSoft: '#1E1E1E',

  // Akcent zielony
  accent:     '#00E5A0',
  accentFill: '#00E5A015',
  accentRing: '#00E5A040',

  // Akcent niebieski (admin)
  blue:       '#0052FF',
  blueFill:   '#000C2A',
  blueRing:   '#0052FF40',

  // Stany
  error:      '#FF4444',
  errorBg:    '#1A0606',

  // Tekst
  white:  '#FFFFFF',
  muted:  '#888888',
  dim:    '#555555',
  faint:  '#444444',
  ghost:  '#333333',
};

/** Border-radius */
export const R = {
  xs:  6,
  sm:  8,
  md:  12,
  lg:  14,
  xl:  18,
  xxl: 24,
};

/** Typografia — stałe do spread-owania */
export const T = {
  screenTitle: { fontSize: 28, fontWeight: '700', color: C.white, letterSpacing: -0.5 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: C.faint, letterSpacing: 1, textTransform: 'uppercase' },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: C.muted, letterSpacing: 0.8, textTransform: 'uppercase' },
  body:    { fontSize: 15, color: C.white },
  caption: { fontSize: 12, color: C.dim },
  mono:    { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
};

/** Współdzielone style komponentów */
export const shared = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // Pasek górny (nagłówek ekranu)
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 56 : 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  topTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: C.white,
    letterSpacing: -0.3,
  },
  backBtn:  { padding: 4, marginRight: 12 },
  backIcon: { fontSize: 22, color: C.accent },

  // Karta / kafelek
  card: {
    backgroundColor: C.surface,
    borderRadius: R.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },

  // Pole tekstowe
  input: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: C.white,
  },
  inputError: {
    borderColor: C.error,
  },

  // Przyciski
  button: {
    backgroundColor: C.accent,
    borderRadius: R.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonAdmin: {
    backgroundColor: C.blue,
  },
  buttonCancel: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: C.error,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    color: C.bg,
    letterSpacing: 0.3,
  },

  // Boks informacyjny / ostrzeżenie
  infoBox: {
    backgroundColor: C.surface,
    borderRadius: R.md,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  errorBox: {
    backgroundColor: C.errorBg,
    borderRadius: R.md,
    padding: 14,
    borderWidth: 1,
    borderColor: C.error,
  },

  // Logo-box (ikonka na ekranach auth)
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: R.xl,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
});