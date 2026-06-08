import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

jest.mock('react-native-nfc-manager', () => ({
  start: jest.fn().mockResolvedValue(null),
  isSupported: jest.fn().mockResolvedValue(true),
  registerTagEvent: jest.fn(),
  unregisterTagEvent: jest.fn(),
  setEventListener: jest.fn(),

  NfcEvents: {
    DiscoverTag: 'DiscoverTag',
  },
}));

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    NavigationContainer: ({ children }) => <>{children}</>,
  };
});

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }) => <>{children}</>,
    Screen: () => null,
  }),
}));


jest.mock('./src/stores/serverStore', () => ({
  useServerStore: () => ({
    initServers: jest.fn(),
    activeServer: null,
  }),
}));

jest.mock('./src/stores/authStore', () => ({
  useAuthStore: () => ({
    initAuth: jest.fn(),
    user: null,
    isLoading: false,
  }),
}));

