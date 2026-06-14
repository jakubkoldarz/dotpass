const NfcManager = {
  start: jest.fn().mockResolvedValue(undefined),
  getLaunchTagEvent: jest.fn().mockResolvedValue(null),
  registerTagEvent: jest.fn().mockResolvedValue(undefined),
  unregisterTagEvent: jest.fn().mockResolvedValue(undefined),
  cancelTechnologyRequest: jest.fn().mockResolvedValue(undefined),
  requestTechnology: jest.fn().mockResolvedValue(undefined),
  setEventListener: jest.fn(),
  ndefHandler: {
    writeNdefMessage: jest.fn().mockResolvedValue(undefined),
  },
};

export default NfcManager;
export const NfcTech = { Ndef: 'Ndef' };
export const NfcEvents = { DiscoverTag: 'DiscoverTag' };
export const Ndef = {
  encodeMessage: jest.fn().mockReturnValue([]),
  uriRecord: jest.fn().mockReturnValue({}),
  uri: { decodePayload: jest.fn().mockReturnValue('dotpass://door/test-uuid') },
  TNF_WELL_KNOWN: 1,
  TNF_ABSOLUTE_URI: 3,
};
