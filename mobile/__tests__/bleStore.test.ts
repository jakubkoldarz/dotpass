import { useBleStore } from '../src/stores/bleStore';

// Reset store przed każdym testem
beforeEach(() => {
  useBleStore.getState().reset();
});

describe('bleStore', () => {

  describe('stan początkowy', () => {
    it('powinien mieć status idle', () => {
      expect(useBleStore.getState().status).toBe('idle');
    });

    it('powinien mieć pustą listę urządzeń', () => {
      expect(useBleStore.getState().foundDevices).toHaveLength(0);
    });

    it('powinien mieć progress 0', () => {
      expect(useBleStore.getState().progress).toBe(0);
    });

    it('nie powinien mieć błędu', () => {
      expect(useBleStore.getState().error).toBeNull();
    });
  });

  describe('setStatus', () => {
    it('powinien ustawić status scanning', () => {
      useBleStore.getState().setStatus('scanning');
      expect(useBleStore.getState().status).toBe('scanning');
    });

    it('powinien ustawić status done', () => {
      useBleStore.getState().setStatus('done');
      expect(useBleStore.getState().status).toBe('done');
    });
  });

  describe('setError', () => {
    it('powinien ustawić błąd i status error', () => {
      useBleStore.getState().setError('Coś poszło nie tak');
      expect(useBleStore.getState().error).toBe('Coś poszło nie tak');
      expect(useBleStore.getState().status).toBe('error');
    });
  });

  describe('addDevice', () => {
    it('powinien dodać urządzenie do listy', () => {
      useBleStore.getState().addDevice({ id: 'AA:BB:CC', name: 'DotPass_Device', rssi: -60 });
      expect(useBleStore.getState().foundDevices).toHaveLength(1);
      expect(useBleStore.getState().foundDevices[0].id).toBe('AA:BB:CC');
    });

    it('nie powinien dodać duplikatu', () => {
      useBleStore.getState().addDevice({ id: 'AA:BB:CC', name: 'DotPass_Device' });
      useBleStore.getState().addDevice({ id: 'AA:BB:CC', name: 'DotPass_Device' });
      expect(useBleStore.getState().foundDevices).toHaveLength(1);
    });

    it('powinien dodać dwa różne urządzenia', () => {
      useBleStore.getState().addDevice({ id: 'AA:BB:CC', name: 'DotPass_Device' });
      useBleStore.getState().addDevice({ id: 'DD:EE:FF', name: 'DotPass_Device' });
      expect(useBleStore.getState().foundDevices).toHaveLength(2);
    });
  });

  describe('clearDevices', () => {
    it('powinien wyczyścić listę urządzeń', () => {
      useBleStore.getState().addDevice({ id: 'AA:BB:CC', name: 'DotPass_Device' });
      useBleStore.getState().clearDevices();
      expect(useBleStore.getState().foundDevices).toHaveLength(0);
    });
  });

  describe('setProgress', () => {
    it('powinien ustawić postęp', () => {
      useBleStore.getState().setProgress(50);
      expect(useBleStore.getState().progress).toBe(50);
    });

    it('powinien ustawić postęp 100', () => {
      useBleStore.getState().setProgress(100);
      expect(useBleStore.getState().progress).toBe(100);
    });
  });

  describe('reset', () => {
    it('powinien zresetować cały stan', () => {
      // Ustaw jakiś stan
      useBleStore.getState().setStatus('sending');
      useBleStore.getState().setProgress(75);
      useBleStore.getState().addDevice({ id: 'AA:BB:CC', name: 'DotPass_Device' });
      useBleStore.getState().setConnectedDevice({ id: 'AA:BB:CC', name: 'DotPass_Device' });

      // Reset
      useBleStore.getState().reset();

      // Sprawdź
      const state = useBleStore.getState();
      expect(state.status).toBe('idle');
      expect(state.progress).toBe(0);
      expect(state.foundDevices).toHaveLength(0);
      expect(state.connectedDevice).toBeNull();
      expect(state.error).toBeNull();
    });
  });

});