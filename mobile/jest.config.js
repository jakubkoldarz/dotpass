module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['./jest.setup.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-ble-manager|react-native-nfc-manager|zustand)/)',
  ],
  moduleNameMapper: {
    // Blokuje import App.tsx który ciągnie React Navigation
    '^../../App$': '<rootDir>/__mocks__/App.ts',
    '^../../../App$': '<rootDir>/__mocks__/App.ts',
    'react-native-ble-manager': '<rootDir>/__mocks__/react-native-ble-manager.ts',
    'react-native-nfc-manager': '<rootDir>/__mocks__/react-native-nfc-manager.ts',
    '@react-native-async-storage/async-storage': '<rootDir>/__mocks__/async-storage.ts',
  },
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
};