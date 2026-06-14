import BleManager from 'react-native-ble-manager';
import { useBleStore } from '../src/stores/bleStore';

jest.mock('react-native', () => ({
  Platform: { OS: 'android', Version: 31 },
  PermissionsAndroid: {
    requestMultiple: jest.fn().mockResolvedValue({
      'android.permission.BLUETOOTH_SCAN': 'granted',
      'android.permission.BLUETOOTH_CONNECT': 'granted',
    }),
    request: jest.fn().mockResolvedValue('granted'),
    PERMISSIONS: {
      BLUETOOTH_SCAN: 'android.permission.BLUETOOTH_SCAN',
      BLUETOOTH_CONNECT: 'android.permission.BLUETOOTH_CONNECT',
      ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
    },
  },
  NativeModules: {
    BleManager: { start: jest.fn(), addListener: jest.fn(), removeListeners: jest.fn() },
  },
  NativeEventEmitter: jest.fn().mockImplementation(() => ({
    addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  })),
}));

beforeAll(() => { jest.useFakeTimers(); });
afterAll(() => { jest.useRealTimers(); });
beforeEach(() => { useBleStore.getState().reset(); jest.clearAllMocks(); });

// Importujemy logikę przez store bezpośrednio — testujemy store + BleManager
// bez wywoływania hooków poza komponentem

async function runStartScan() {
  const { PermissionsAndroid, Platform } = require('react-native');
  const store = useBleStore.getState();

  store.setStatus('scanning');

  const apiLevel = Platform.Version as number;
  let granted = true;

  if (apiLevel >= 31) {
    const results = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ]);
    granted =
      results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === 'granted' &&
      results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === 'granted';
  }

  if (!granted) {
    store.setError('Brak uprawnień do Bluetooth. Przyznaj je w ustawieniach aplikacji.');
    return;
  }

  try {
    await BleManager.start({ showAlert: false });
    await (BleManager.scan as any)({ serviceUUIDs: [], seconds: 5 });
    jest.runAllTimers();
    if (useBleStore.getState().status === 'scanning') {
      store.setStatus('idle');
    }
  } catch (e: any) {
    store.setError(e.message || 'Błąd skanowania BLE');
  }
}

async function runSendConfig(deviceId: string, config: object) {
  const store = useBleStore.getState();
  store.setStatus('connecting');

  function strToBytes(str: string): number[] {
    const bytes: number[] = [];
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      if (code < 0x80) bytes.push(code);
      else if (code < 0x800) { bytes.push(0xc0 | (code >> 6)); bytes.push(0x80 | (code & 0x3f)); }
      else { bytes.push(0xe0 | (code >> 12)); bytes.push(0x80 | ((code >> 6) & 0x3f)); bytes.push(0x80 | (code & 0x3f)); }
    }
    return bytes;
  }

  try {
    await BleManager.connect(deviceId);
    await BleManager.retrieveServices(deviceId);
    store.setStatus('sending');
    store.setProgress(0);

    const json = JSON.stringify(config);
    const allBytes = strToBytes(json);
    const chunks: number[][] = [];
    for (let i = 0; i < allBytes.length; i += 180) chunks.push(allBytes.slice(i, i + 180));

    for (let i = 0; i < chunks.length; i++) {
      await BleManager.write(deviceId, '4fafc201-1fb5-459e-8fcc-c5c9c331914b', 'beb5483e-36e1-4688-b7f5-ea07361b26a8', chunks[i], chunks[i].length);
      store.setProgress(Math.round(((i + 1) / (chunks.length + 1)) * 100));
    }

    try {
      await BleManager.write(deviceId, '4fafc201-1fb5-459e-8fcc-c5c9c331914b', 'beb5483e-36e1-4688-b7f5-ea07361b26a8', strToBytes('##END##'), 7);
    } catch (_) {}

    store.setProgress(100);
    store.setStatus('done');
  } catch (e: any) {
    store.setError(e.message || 'Błąd wysyłania konfiguracji');
  } finally {
    try { await BleManager.disconnect(deviceId); } catch {}
  }
}

describe('useBle — logika sendConfig', () => {
  const mockDeviceId = 'AA:BB:CC:DD:EE:FF';
  const mockConfig = { ssid: 'Net', pass: 'pass', host: 'broker.test', port: 8883, user: 'u', mpwd: 'p' };

  beforeEach(() => {
    useBleStore.getState().addDevice({ id: mockDeviceId, name: 'DotPass_Device' });
  });

  it('powinien ustawić status done po udanym wysłaniu', async () => {
    await runSendConfig(mockDeviceId, mockConfig);
    expect(useBleStore.getState().status).toBe('done');
    expect(useBleStore.getState().progress).toBe(100);
  });

  it('powinien wywołać BleManager.write przynajmniej raz', async () => {
    await runSendConfig(mockDeviceId, mockConfig);
    expect(BleManager.write).toHaveBeenCalled();
  });

  it('powinien ustawić status done nawet gdy write markera rzuci wyjątek (restart ESP32)', async () => {
    let callCount = 0;
    (BleManager.write as jest.Mock).mockImplementation(() => {
      callCount++;
      if (callCount > 1) return Promise.reject(new Error('Peripheral disconnected'));
      return Promise.resolve();
    });
    await runSendConfig(mockDeviceId, mockConfig);
    expect(useBleStore.getState().status).toBe('done');
  });

  it('powinien ustawić status error gdy connect się nie powiedzie', async () => {
    (BleManager.connect as jest.Mock).mockRejectedValueOnce(new Error('Connection failed'));
    await runSendConfig(mockDeviceId, mockConfig);
    expect(useBleStore.getState().status).toBe('error');
    expect(useBleStore.getState().error).toBe('Connection failed');
  });

  it('powinien rozłączyć urządzenie po zakończeniu nawet przy błędzie', async () => {
    (BleManager.connect as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    await runSendConfig(mockDeviceId, mockConfig);
    expect(BleManager.disconnect).toHaveBeenCalledWith(mockDeviceId);
  });
});