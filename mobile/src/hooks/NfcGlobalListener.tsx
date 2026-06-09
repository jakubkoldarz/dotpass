import { useEffect } from 'react';
import NfcManager, { NfcEvents, Ndef } from 'react-native-nfc-manager';
import { openDoor } from '../api/deviceApi';
import { useToast } from '../hooks/useToast';

const DOTPASS_SCHEME = 'dotpass://door/';

function extractDeviceId(tag: any): string | null {
  try {
    const ndefRecords = tag.ndefMessage;
    if (!ndefRecords || ndefRecords.length === 0) return null;

    const record = ndefRecords[0];
    const tnf = record.tnf;
    const type = record.type;

    let uri: string | null = null;

    if (tnf === Ndef.TNF_WELL_KNOWN) {
      uri = Ndef.uri.decodePayload(record.payload);
    } else if (tnf === Ndef.TNF_ABSOLUTE_URI) {
      uri = String.fromCharCode(...record.payload);
    }

    if (!uri) return null;
    if (!uri.startsWith(DOTPASS_SCHEME)) return null;

    const deviceId = uri.slice(DOTPASS_SCHEME.length);
    return deviceId || null;
  } catch (e) {
    console.warn('NFC decode error:', e);
    return null;
  }
}

export default function NfcGlobalListener() {
  const toast = useToast();

  useEffect(() => {
    async function startNfc() {
      try {
        await NfcManager.start();
      } catch (e) {
        return;
      }

      NfcManager.setEventListener(NfcEvents.DiscoverTag, async (tag: any) => {
        const deviceId = extractDeviceId(tag);

        if (!deviceId) {
          return;
        }

        try {
          await openDoor(deviceId, 3);
          toast.success('Drzwi otwarte!');
        } catch (e: any) {
          const msg = e.response?.data?.message || 'Brak dostępu lub błąd połączenia';
          toast.error(msg);
        }
      });

      await NfcManager.registerTagEvent();
    }

    startNfc();

    return () => {
      NfcManager.unregisterTagEvent().catch(() => null);
    };
  }, []);

  return null;
}