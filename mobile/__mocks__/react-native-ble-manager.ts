const BleManager = {
  start: jest.fn().mockResolvedValue(undefined),
  scan: jest.fn().mockResolvedValue(undefined),
  stopScan: jest.fn().mockResolvedValue(undefined),
  connect: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn().mockResolvedValue(undefined),
  retrieveServices: jest.fn().mockResolvedValue({ id: 'test', characteristics: [] }),
  write: jest.fn().mockResolvedValue(undefined),
  onDiscoverPeripheral: jest.fn().mockReturnValue({ remove: jest.fn() }),
  onStopScan: jest.fn().mockReturnValue({ remove: jest.fn() }),
  onConnectPeripheral: jest.fn().mockReturnValue({ remove: jest.fn() }),
  onDisconnectPeripheral: jest.fn().mockReturnValue({ remove: jest.fn() }),
  onDidUpdateValueForCharacteristic: jest.fn().mockReturnValue({ remove: jest.fn() }),
};

export default BleManager;
export const BleScanMatchMode = { Sticky: 1 };
export const BleScanMode = { LowLatency: 2 };
export const BleScanCallbackType = { AllMatches: 1 };
