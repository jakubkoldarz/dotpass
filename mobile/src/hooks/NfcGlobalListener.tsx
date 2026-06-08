import { useEffect } from 'react';
import NfcManager, { NfcTech, Ndef, NfcEvents } from 'react-native-nfc-manager';
import { openDoor } from '../api/deviceApi';
import { useToast } from '../hooks/useToast';

export default function NfcGlobalListener() {
  const toast = useToast();

  useEffect(() => {
    async function startNfc() {
      await NfcManager.start();
      
      NfcManager.setEventListener(NfcEvents.DiscoverTag, async (tag: { ndefMessage: any; }) => {
        try {
          const ndefRecords = tag.ndefMessage;
          const bytes = ndefRecords[0].payload;
          const deviceId = Ndef.text.decodePayload(bytes);

          await openDoor(deviceId, 3);
          
          toast.success('Drzwi otwarte!');
        } catch (e) {
          toast.error('Brak dostępu lub błąd połączenia z drzwiami');
        }
      });
      
      await NfcManager.registerTagEvent();
    }

    startNfc();
    return () => {
      NfcManager.unregisterTagEvent();
    };
  }, []);

  return null;
}