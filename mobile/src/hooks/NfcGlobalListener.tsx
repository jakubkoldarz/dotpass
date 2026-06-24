import { useEffect } from 'react';
import NfcManager, { NfcEvents, Ndef } from 'react-native-nfc-manager';
import NetInfo from '@react-native-community/netinfo';
import { openDoor } from '../api/deviceApi';
import { useOfflineAuth } from '../hooks/useOfflineAuth';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';

const DOTPASS_SCHEME = 'dotpass://door/';

function extractDeviceId(tag: any): string | null {
  try {
    const records = tag?.ndefMessage;
    if (!records || records.length === 0) return null;
    const record = records[0];
    let uri: string | null = null;
    if (record.tnf === Ndef.TNF_WELL_KNOWN) {
      uri = Ndef.uri.decodePayload(record.payload);
    } else if (record.tnf === Ndef.TNF_ABSOLUTE_URI) {
      uri = String.fromCharCode(...record.payload);
    }
    if (!uri || !uri.startsWith(DOTPASS_SCHEME)) return null;
    return uri.slice(DOTPASS_SCHEME.length) || null;
  } catch {
    return null;
  }
}

export default function NfcGlobalListener() {
  const { openDoorOffline } = useOfflineAuth();
  const { allDevices }      = useAuthStore();
  const toast               = useToastStore.getState();

  useEffect(() => {
    async function startNfc() {
      try {
        await NfcManager.start();
      } catch {
        return;
      }

      NfcManager.setEventListener(NfcEvents.DiscoverTag, async (tag: any) => {
        const deviceId = extractDeviceId(tag);
        if (!deviceId) return;

        const netState    = await NetInfo.fetch();
        const hasInternet = netState.isConnected && netState.isInternetReachable;

        if (hasInternet) {
          // ── Online — przez API ────────────────────────────────────────
          try {
            await openDoor(deviceId, 3);
            toast.show('Drzwi otwarte!', 'success');
          } catch (e: any) {
            toast.show(
              e.response?.data?.message || 'Brak dostępu lub błąd połączenia',
              'error'
            );
          }
        } else {
          // ── Offline — przez BLE challenge-response ────────────────────
          // Znajdź macAddress dla tego deviceId z lokalnego cache
          const deviceInfo = allDevices.find(d => d.id === deviceId);

          if (!deviceInfo?.macAddress) {
            toast.show(
              'Tryb offline — brak danych o tym urządzeniu. Zaloguj się gdy będziesz mieć internet.',
              'error'
            );
            return;
          }

          toast.show('Tryb offline — łączę przez BLE...', 'info');
          await openDoorOffline(deviceInfo.macAddress, deviceId);
        }
      });

      await NfcManager.registerTagEvent();
    }

    startNfc();
    return () => { NfcManager.unregisterTagEvent().catch(() => null); };
  }, [openDoorOffline, allDevices]);

  return null;
}