import { useCallback, useRef } from 'react';
import CryptoJS from 'crypto-js';
import BleManager from 'react-native-ble-manager';
import { useAuthStore } from '../stores/authStore';
import { useToast } from './useToast';

const SERVICE_UUID       = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const CHAR_NONCE_UUID    = 'beb5483e-36e1-4688-b7f5-ea07361b26a9';
const CHAR_RESPONSE_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26aa';
const CHAR_RESULT_UUID   = 'beb5483e-36e1-4688-b7f5-ea07361b26ab';

const OPEN_TIMEOUT_MS = 12000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(() => resolve(), ms));
}

async function computeHmac(secret: string, message: string): Promise<string> {
  const hash = CryptoJS.HmacSHA256(message, secret);
  return hash.toString(CryptoJS.enc.Hex);
}

function strToBytes(str: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code < 0x80) bytes.push(code);
    else if (code < 0x800) {
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

export function useOfflineAuth() {
  const { user, offlineSecret } = useAuthStore();
  const toast = useToast();
  const resultListenerRef = useRef<any>(null);

  const openDoorOffline = useCallback(async (bleAddress: string, deviceId?: string): Promise<boolean> => {
    const authDeviceId = deviceId ?? bleAddress;
    if (!user?.id) {
      toast.error('Brak danych użytkownika — zaloguj się ponownie');
      return false;
    }

    if (!offlineSecret) {
      toast.error('Brak klucza offline — zaloguj się ponownie gdy będziesz mieć internet');
      return false;
    }

    const normalizedAddress = bleAddress.toUpperCase().replace(/[.\-]/g, ':');

    try {
      await BleManager.connect(normalizedAddress);
      await delay(900);
      await BleManager.retrieveServices(normalizedAddress);
      await BleManager.startNotification(normalizedAddress, SERVICE_UUID, CHAR_RESULT_UUID);

      const resultPromise = new Promise<string>((resolve) => {
        resultListenerRef.current = BleManager.onDidUpdateValueForCharacteristic(
          ({ value }: { value: number[] }) => {
            const result = String.fromCharCode(...value);
            resolve(result);
          }
        );
      });

      const nonceData = await BleManager.read(normalizedAddress, SERVICE_UUID, CHAR_NONCE_UUID);
      const nonce = String.fromCharCode(...nonceData);

      if (!nonce || nonce.length < 10) {
        toast.error('Błąd odczytu nonce z płytki');
        return false;
      }

      const hash = await computeHmac(offlineSecret, nonce);
      const payload = JSON.stringify({ userId: user.id, hash });
      const bytes   = strToBytes(payload);

      await BleManager.write(
        normalizedAddress, SERVICE_UUID, CHAR_RESPONSE_UUID, bytes, bytes.length
      );

      const result = await Promise.race([
        resultPromise,
        delay(OPEN_TIMEOUT_MS).then(() => 'timeout'),
      ]);

      if (result === 'granted') {
        toast.success('Drzwi otwarte!');
        return true;
      } else if (result === 'timeout') {
        toast.error('Brak odpowiedzi od serwera — spróbuj ponownie');
        return false;
      } else {
        toast.error('Brak dostępu');
        return false;
      }

    } catch (e: any) {
      console.error('[OfflineAuth] Błąd:', e);
      toast.error(e.message || 'Błąd połączenia BLE');
      return false;
    } finally {
      if (resultListenerRef.current) {
        resultListenerRef.current.remove();
        resultListenerRef.current = null;
      }
      try {
        await BleManager.stopNotification(normalizedAddress, SERVICE_UUID, CHAR_RESULT_UUID);
        await BleManager.disconnect(normalizedAddress);
      } catch {}
    }
  }, [user, offlineSecret]);

  return { openDoorOffline };
}