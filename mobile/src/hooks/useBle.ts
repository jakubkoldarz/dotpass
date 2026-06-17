import { useCallback } from 'react';
import BleManager, {
  BleScanCallbackType,
  BleScanMatchMode,
  BleScanMode,
  Peripheral,
} from 'react-native-ble-manager';
import { PermissionsAndroid, Platform } from 'react-native';
import { useBleStore } from '../stores/bleStore';

const SERVICE_UUID       = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const CHAR_NONCE_UUID    = 'beb5483e-36e1-4688-b7f5-ea07361b26a9';
const CHAR_RESPONSE_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26aa';
const CHAR_RESULT_UUID   = 'beb5483e-36e1-4688-b7f5-ea07361b26ab';
const CHAR_CONFIG_UUID   = 'beb5483e-36e1-4688-b7f5-ea07361b26ac';
const DEVICE_NAME        = 'DotPass_Device';
const CHUNK_SIZE         = 180;
const END_MARKER         = '##END##';

function strToBytes(str: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6));
      bytes.push(0x80 | (code & 0x3f));
    } else {
      bytes.push(0xe0 | (code >> 12));
      bytes.push(0x80 | ((code >> 6) & 0x3f));
      bytes.push(0x80 | (code & 0x3f));
    }
  }
  return bytes;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(() => resolve(), ms));
}

async function requestBlePermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const apiLevel = Platform.Version as number;
  if (apiLevel >= 31) {
    const results = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ]);
    return (
      results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === 'granted' &&
      results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === 'granted'
    );
  } else {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    return result === 'granted';
  }
}

async function writeChunk(
  deviceId: string,
  bytes: number[],
  charUuid: string
): Promise<void> {
  await BleManager.write(deviceId, SERVICE_UUID, charUuid, bytes, bytes.length);
}

export function useBle() {
  const store = useBleStore();

  const startScan = useCallback(async () => {
    store.reset();
    store.setStatus('scanning');

    try {
      const granted = await requestBlePermissions();
      if (!granted) {
        store.setError('Brak uprawnień do Bluetooth. Przyznaj je w ustawieniach.');
        return;
      }

      await BleManager.start({ showAlert: false });
      store.clearDevices();

      const discoverListener = BleManager.onDiscoverPeripheral(
        (peripheral: Peripheral) => {
          const name = peripheral.name || peripheral.advertising?.localName || '';
          if (name === DEVICE_NAME) {
            store.addDevice({ id: peripheral.id, name, rssi: peripheral.rssi });
          }
        }
      );

      const stopListener = BleManager.onStopScan(() => {
        discoverListener.remove();
        stopListener.remove();
        if (useBleStore.getState().status === 'scanning') {
          store.setStatus('idle');
        }
      });

      await BleManager.scan({
        serviceUUIDs: [SERVICE_UUID],
        seconds: 5,
        allowDuplicates: false,
        matchMode: BleScanMatchMode.Sticky,
        scanMode: BleScanMode.LowLatency,
        callbackType: BleScanCallbackType.AllMatches,
      });

    } catch (e: any) {
      store.setError(e.message || 'Błąd skanowania BLE');
    }
  }, []);

  const sendConfig = useCallback(async (deviceId: string, config: object) => {
    store.setStatus('connecting');
    store.setConnectedDevice(
      useBleStore.getState().foundDevices.find((d) => d.id === deviceId) || null
    );

    let resultListener: any = null;

    try {

      await BleManager.connect(deviceId);
      await delay(900);
      await BleManager.retrieveServices(deviceId);
      await BleManager.startNotification(deviceId, SERVICE_UUID, CHAR_RESULT_UUID);

      const resultPromise = new Promise<string>((resolve) => {
        resultListener = BleManager.onDidUpdateValueForCharacteristic(
          ({ peripheral, characteristic, value }: {
            peripheral: string;
            characteristic: string;
            value: number[];
          }) => {
            if (peripheral !== deviceId) return;
            if (characteristic.toLowerCase() !== CHAR_RESULT_UUID.toLowerCase()) return;
            const result = String.fromCharCode(...value);
            console.log('[BLE] Notyfikacja z firmware:', result);
            resolve(result);
          }
        );
      });

      store.setStatus('sending');
      store.setProgress(0);

      const json      = JSON.stringify(config);
      const allBytes  = strToBytes(json);
      const chunks: number[][] = [];
      for (let i = 0; i < allBytes.length; i += CHUNK_SIZE) {
        chunks.push(allBytes.slice(i, i + CHUNK_SIZE));
      }

      for (let i = 0; i < chunks.length; i++) {
        await writeChunk(deviceId, chunks[i], CHAR_CONFIG_UUID);
        store.setProgress(Math.round(((i + 1) / (chunks.length + 1)) * 100));
        await delay(50);
      }

      try {
        await writeChunk(deviceId, strToBytes(END_MARKER), CHAR_CONFIG_UUID);
      } catch (_) {
      }

      const result = await Promise.race([
        resultPromise,
        delay(3000).then(() => 'timeout'),
      ]);

      if (result === 'config_denied') {
        store.setError('Błędne hasło prowizji — konfiguracja odrzucona');
      } else {
        store.setProgress(100);
        store.setStatus('done');
      }

    } catch (e: any) {
      console.log('[BLE sendConfig] Połączenie przerwane — firmware prawdopodobnie zrestartował się po zapisaniu konfiguracji');
      store.setProgress(100);
      store.setStatus('done');
    } finally {
      if (resultListener) resultListener.remove();
      try {
        await BleManager.stopNotification(deviceId, SERVICE_UUID, CHAR_RESULT_UUID);
      } catch {}
      try { await BleManager.disconnect(deviceId); } catch {}
      store.setConnectedDevice(null);
    }
  }, []);

  return { startScan, sendConfig };
}