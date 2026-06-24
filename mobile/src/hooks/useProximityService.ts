import { useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import BleManager, { Peripheral } from 'react-native-ble-manager';
import VIForegroundService from '@supersami/rn-foreground-service';
import { useAuthStore, UnlockMode, RSSI_THRESHOLD, DeviceAccess } from '../stores/authStore';
import { useOfflineAuth } from './useOfflineAuth';
import NetInfo from '@react-native-community/netinfo';
import { openDoor } from '../api/deviceApi';
import { useToastStore } from '../stores/toastStore';

const SERVICE_UUID     = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const SCAN_DURATION_S  = 3;
const SCAN_PAUSE_MS    = 1000;
const RSSI_SAMPLES     = 5;
const COOLDOWN_MS      = 10000; 
const RSSI_RESET_LEVEL = -100; 

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(() => resolve(), ms));
}

interface DeviceState {
  lastOpenAt:  number;  
  lastAvgRssi: number;   
  rssiBuffer:  number[]; 
}

function makeState(): DeviceState {
  return { lastOpenAt: 0, lastAvgRssi: -999, rssiBuffer: [] };
}

export function useProximityService() {
  const { proximityDevices } = useAuthStore();
  const { openDoorOffline }  = useOfflineAuth();
  const toast                = useToastStore.getState();

  const states = useRef<Record<string, DeviceState>>({});

  const activeRef       = useRef(false);
  const scanningRef     = useRef(false);
  const isOpeningRef    = useRef<Record<string, boolean>>({});
  const discoverListRef = useRef<any>(null);
  const stopListRef     = useRef<any>(null);
  const deviceMap       = useRef<Record<string, DeviceAccess>>({});

  useEffect(() => {
    deviceMap.current = {};
    states.current    = {};
    isOpeningRef.current = {};
    proximityDevices.forEach(d => {
      const mac = d.macAddress.toUpperCase().replace(/[.\-]/g, ':');
      deviceMap.current[mac] = d;
      states.current[mac]    = makeState();
    });
  }, [proximityDevices]);

  const canOpen = useCallback((mac: string): boolean => {
    const s = states.current[mac];
    if (!s) return false;

    if (s.lastOpenAt === 0) return true;

    const cooldownOk = Date.now() - s.lastOpenAt >= COOLDOWN_MS;

    const leftZone = s.lastAvgRssi <= RSSI_RESET_LEVEL;

    return cooldownOk && leftZone;
  }, []);

  const handleOpen = useCallback(async (mac: string, device: DeviceAccess) => {
    if (isOpeningRef.current[mac]) return;
    isOpeningRef.current[mac] = true;

    states.current[mac].lastOpenAt = Date.now();

    console.log(`[Proximity] Otwieram ${mac}`);

    try {
      const net         = await NetInfo.fetch();
      const hasInternet = net.isConnected && net.isInternetReachable;

      if (hasInternet) {
        try {
          await openDoor(device.id, 3000);
          toast.show('Drzwi otwarte!', 'success');
        } catch (e: any) {
          toast.show(e.response?.data?.message || 'Brak dostępu', 'error');
          states.current[mac].lastOpenAt = 0;
        }
      } else {
        toast.show('Tryb offline — łączę przez BLE...', 'info');
        activeRef.current   = false;
        scanningRef.current = false;
        await BleManager.stopScan().catch(() => null);
        await delay(500);

        const ok = await openDoorOffline(mac, device.id);

        activeRef.current = true;
        doSingleScan();
      }
    } finally {
      isOpeningRef.current[mac] = false;
    }
  }, [openDoorOffline]);

  const doSingleScan = useCallback(async () => {
    if (!activeRef.current)   return;
    if (scanningRef.current)  return;

    scanningRef.current = true;
    console.log('[Proximity] Uruchamiam skan...');

    try {
      await (BleManager.scan as Function)({
        serviceUUIDs:    [SERVICE_UUID],
        seconds:         SCAN_DURATION_S,
        allowDuplicates: true,
      });
      console.log('[Proximity] Skan aktywny');
    } catch (e: any) {
      console.warn('[Proximity] Błąd skanu:', e?.message);
      scanningRef.current = false;
      if (activeRef.current) setTimeout(doSingleScan, SCAN_PAUSE_MS * 2);
    }
  }, []);

  const startScanning = useCallback(async () => {
    if (proximityDevices.length === 0) return;
    if (activeRef.current) return;

    console.log(`[Proximity] Start scanu dla ${proximityDevices.length} płytek`);
    activeRef.current = true;

    try { await BleManager.start({ showAlert: false }); } catch {}

    if (discoverListRef.current) discoverListRef.current.remove();
    discoverListRef.current = BleManager.onDiscoverPeripheral((p: Peripheral) => {
      const mac  = p.id.toUpperCase();
      const rssi = p.rssi;

      const device = deviceMap.current[mac];
      if (!device) return;

      const s = states.current[mac];
      if (!s) return;

      s.rssiBuffer.push(rssi);
      if (s.rssiBuffer.length > RSSI_SAMPLES) s.rssiBuffer.shift();
      if (s.rssiBuffer.length < RSSI_SAMPLES) return;

      const avg = s.rssiBuffer.reduce((a, b) => a + b, 0) / s.rssiBuffer.length;

      s.lastAvgRssi = avg;

      const threshold = RSSI_THRESHOLD[
        device.unlockMode as UnlockMode.Proximity | UnlockMode.LongRange
      ];

      console.log(
        `[Scan] ${mac} avg=${avg.toFixed(1)} próg=${threshold} ` +
        `cooldownOk=${Date.now()-s.lastOpenAt >= COOLDOWN_MS} ` +
        `leftZone=${s.lastOpenAt===0 || s.lastAvgRssi <= RSSI_RESET_LEVEL}`
      );

      if (avg < threshold) return;
      if (!canOpen(mac))   return;

      handleOpen(mac, device);
    });

    if (stopListRef.current) stopListRef.current.remove();
    stopListRef.current = BleManager.onStopScan(() => {
      scanningRef.current = false;
      if (activeRef.current) setTimeout(doSingleScan, SCAN_PAUSE_MS);
    });

    doSingleScan();
  }, [proximityDevices, doSingleScan, canOpen, handleOpen]);

  const stopScanning = useCallback(() => {
    activeRef.current   = false;
    scanningRef.current = false;
    if (discoverListRef.current) { discoverListRef.current.remove(); discoverListRef.current = null; }
    if (stopListRef.current)     { stopListRef.current.remove();     stopListRef.current     = null; }
    BleManager.stopScan().catch(() => null);
    console.log('[Proximity] Zatrzymano');
  }, []);

  const startForegroundService = useCallback(async () => {
    if (Platform.OS !== 'android' || proximityDevices.length === 0) return;
    try {
      const cfg: any = {
        id: 1, title: 'DotPass aktywny',
        message: 'Automatyczne otwieranie drzwi w tle',
        icon: 'ic_launcher', importance: 'low',
        vibration: false, ServiceType: 'connectedDevice',
      };
      await VIForegroundService.start(cfg);
      console.log('[Proximity] Foreground Service uruchomiony');
    } catch (e) {
      console.warn('[Proximity] Błąd Foreground Service:', e);
    }
  }, [proximityDevices]);

  const stopForegroundService = useCallback(async () => {
    if (Platform.OS !== 'android') return;
    try { VIForegroundService.stop(); } catch {}
  }, []);

  useEffect(() => {
    if (proximityDevices.length === 0) {
      stopScanning();
      stopForegroundService();
      return;
    }
    startForegroundService();
    startScanning();
    return () => { stopScanning(); stopForegroundService(); };
  }, [proximityDevices.length]);
}