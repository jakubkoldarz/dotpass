// Mock App.tsx - blokuje import React Navigation w testach
export const navigationRef = { current: null };
export type RootStackParamList = Record<string, undefined>;