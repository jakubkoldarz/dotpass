import { Ndef } from 'react-native-nfc-manager';

// Wyciągamy czystą funkcję parsującą tag — testujemy logikę bez NFC managera
const DOTPASS_SCHEME = 'dotpass://door/';

function extractDeviceIdFromTag(tag: any): string | null {
  try {
    const ndefRecords = tag?.ndefMessage;
    if (!ndefRecords || ndefRecords.length === 0) return null;

    const record = ndefRecords[0];
    let uri: string | null = null;

    if (record.tnf === 1) {
      // TNF_WELL_KNOWN
      uri = Ndef.uri.decodePayload(record.payload);
    } else if (record.tnf === 3) {
      // TNF_ABSOLUTE_URI
      uri = String.fromCharCode(...record.payload);
    }

    if (!uri || !uri.startsWith(DOTPASS_SCHEME)) return null;
    return uri.slice(DOTPASS_SCHEME.length) || null;
  } catch {
    return null;
  }
}

describe('NFC tag parsing', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('extractDeviceIdFromTag', () => {
    it('powinien zwrócić deviceId z well-known URI record', () => {
      const testUuid = '019e5c83-3389-7128-82a7-a61d1d272f69';
      (Ndef.uri.decodePayload as jest.Mock).mockReturnValue(`dotpass://door/${testUuid}`);

      const tag = {
        ndefMessage: [{ tnf: 1, payload: [] }],
      };

      const result = extractDeviceIdFromTag(tag);
      expect(result).toBe(testUuid);
    });

    it('powinien zwrócić deviceId z absolute URI record', () => {
      const testUuid = '019e5c83-3389-7128-82a7-a61d1d272f69';
      const uri = `dotpass://door/${testUuid}`;
      const payload = Array.from(uri).map(c => c.charCodeAt(0));

      const tag = {
        ndefMessage: [{ tnf: 3, payload }],
      };

      const result = extractDeviceIdFromTag(tag);
      expect(result).toBe(testUuid);
    });

    it('powinien zwrócić null gdy tag ma inny schemat', () => {
      (Ndef.uri.decodePayload as jest.Mock).mockReturnValue('https://example.com');

      const tag = {
        ndefMessage: [{ tnf: 1, payload: [] }],
      };

      const result = extractDeviceIdFromTag(tag);
      expect(result).toBeNull();
    });

    it('powinien zwrócić null gdy tag jest pusty', () => {
      const result = extractDeviceIdFromTag({ ndefMessage: [] });
      expect(result).toBeNull();
    });

    it('powinien zwrócić null gdy tag jest null', () => {
      const result = extractDeviceIdFromTag(null);
      expect(result).toBeNull();
    });

    it('powinien zwrócić null gdy brak ndefMessage', () => {
      const result = extractDeviceIdFromTag({ something: 'else' });
      expect(result).toBeNull();
    });

    it('powinien zwrócić null gdy schemat jest poprawny ale UUID pusty', () => {
      (Ndef.uri.decodePayload as jest.Mock).mockReturnValue('dotpass://door/');

      const tag = {
        ndefMessage: [{ tnf: 1, payload: [] }],
      };

      const result = extractDeviceIdFromTag(tag);
      expect(result).toBeNull();
    });
  });

});
