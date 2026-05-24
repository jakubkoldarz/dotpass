import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import DeviceConfigScreen from '../src/views/DeviceConfigScreen'; // Dostosuj ścieżkę do swojego projektu

import DeviceInfoTab from '../src/components/devices/DeviceInfoTab';
import DeviceAccessTab from '../src/components/devices/DeviceAccessTab';

const mockGoBack = jest.fn();
const mockProps = {
  route: {
    params: {
      device: {
        id: 'device-123',
        name: 'Super Płytka NFC',
        macaddress: 'AA:BB:CC:DD:EE:FF',
      },
    },
  },
  navigation: {
    goBack: mockGoBack,
  },
};

const MockDeviceInfoTab = () => null;
const MockDeviceAccessTab = () => null;

jest.mock('../src/components/devices/DeviceInfoTab', () => 'DeviceInfoTab');
jest.mock('../src/components/devices/DeviceAccessTab', () => 'DeviceAccessTab');
jest.mock('../src/components/modals/SelectUserModal', () => 'SelectUserModal');
jest.mock('../src/components/modals/SelectGroupModal', () => 'SelectGroupModal');
jest.mock('../src/components/shared/Icon', () => 'Icon');

describe('DeviceConfigScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renderuje się poprawnie w domyślnej zakładce Informacje', () => {
    render(<DeviceConfigScreen {...(mockProps as any)} />);

    expect(screen.getByText('Super Płytka NFC')).toBeTruthy();

    expect(screen.UNSAFE_getByType(DeviceInfoTab)).toBeTruthy();
    
    expect(screen.UNSAFE_queryByType(DeviceAccessTab)).toBeNull();
  });

  test('poprawnie przełącza zakładki po kliknięciu', () => {
    render(<DeviceConfigScreen {...(mockProps as any)} />);

    const accessTabButton = screen.getByText('Dostęp');
    fireEvent.press(accessTabButton);

    expect(screen.UNSAFE_getByType(DeviceAccessTab)).toBeTruthy();
    expect(screen.UNSAFE_queryByType(DeviceInfoTab)).toBeNull();

    const logsTabButton = screen.getByText('Logi');
    fireEvent.press(logsTabButton);

    expect(screen.getByText('Zakładka Logi')).toBeTruthy();
  });

  test('wywołuje goBack po naciśnięciu strzałki wstecz', () => {
    render(<DeviceConfigScreen {...(mockProps as any)} />);

    const backButton = screen.getByTestId('back-button');
    fireEvent.press(backButton);

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });
});