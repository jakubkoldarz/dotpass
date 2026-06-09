import { create } from 'zustand';

export type BleStatus =
  | 'idle'
  | 'scanning'
  | 'connecting'
  | 'sending'
  | 'done'
  | 'error';

export interface BleDevice {
  id: string;     
  name: string;    
  rssi?: number;
}

interface BleState {
  status: BleStatus;
  error: string | null;
  foundDevices: BleDevice[];
  connectedDevice: BleDevice | null;
  progress: number;

  setStatus: (s: BleStatus) => void;
  setError: (e: string | null) => void;
  addDevice: (d: BleDevice) => void;
  clearDevices: () => void;
  setConnectedDevice: (d: BleDevice | null) => void;
  setProgress: (p: number) => void;
  reset: () => void;
}

export const useBleStore = create<BleState>((set) => ({
  status: 'idle',
  error: null,
  foundDevices: [],
  connectedDevice: null,
  progress: 0,

  setStatus: (status) => set({ status }),
  setError: (error) => set({ error, status: 'error' }),
  addDevice: (d) =>
    set((state) => {
      if (state.foundDevices.some((x) => x.id === d.id)) return state;
      return { foundDevices: [...state.foundDevices, d] };
    }),
  clearDevices: () => set({ foundDevices: [] }),
  setConnectedDevice: (connectedDevice) => set({ connectedDevice }),
  setProgress: (progress) => set({ progress }),
  reset: () =>
    set({
      status: 'idle',
      error: null,
      foundDevices: [],
      connectedDevice: null,
      progress: 0,
    }),
}));