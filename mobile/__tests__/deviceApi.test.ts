import MockAdapter from 'axios-mock-adapter';
import {
  getAllDevices,
  getDeviceDetails,
  assignDevice,
  updateDevice,
  accessGrantDevice,
  accessGrantDeviceGroup,
  openDoor,
} from '../src/api/deviceApi';
import { axiosInstance } from '../src/api/axiosInstance';
import { useServerStore } from '../src/stores/serverStore';

const mock = new MockAdapter(axiosInstance);

beforeAll(() => {
  // axiosInstance wymaga aktywnego serwera w serverStore
  useServerStore.setState({
    activeServer: { url: 'http://localhost:8080', name: 'Test' },
  } as any);
});

beforeEach(() => {
  mock.reset();
});

afterAll(() => {
  mock.restore();
});

describe('deviceApi', () => {

  describe('getAllDevices', () => {
    it('powinien zwrócić listę urządzeń', async () => {
      const mockDevices = [
        { id: 'uuid-1', name: 'Drzwi główne', isPublicInWorkspace: false },
        { id: 'uuid-2', name: 'Drzwi boczne', isPublicInWorkspace: true },
      ];
      mock.onGet('/api/device').reply(200, mockDevices);

      const result = await getAllDevices();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('uuid-1');
    });

    it('powinien rzucić błąd przy 401', async () => {
      mock.onGet('/api/device').reply(401, { message: 'Unauthorized' });

      await expect(getAllDevices()).rejects.toThrow();
    });
  });

  describe('getDeviceDetails', () => {
    it('powinien zwrócić szczegóły urządzenia', async () => {
      const mockDevice = {
        id: 'uuid-1',
        name: 'Drzwi główne',
        macAddress: 'AA:BB:CC:DD:EE:FF',
        isPublicInWorkspace: true,
        userAccesses: [],
        groupAccesses: [],
      };
      mock.onGet('/api/device/uuid-1').reply(200, mockDevice);

      const result = await getDeviceDetails('uuid-1');

      expect(result.id).toBe('uuid-1');
      expect(result.macAddress).toBe('AA:BB:CC:DD:EE:FF');
    });
  });

  describe('assignDevice', () => {
    it('powinien wysłać workspaceId jako obiekt w body', async () => {
      mock.onPost('/api/device/device-uuid/assign').reply(200);

      await assignDevice('workspace-uuid', 'device-uuid');

      expect(mock.history.post[0].data).toBe(JSON.stringify({ workspaceId: 'workspace-uuid' }));
    });

    it('powinien zwrócić status 200', async () => {
      mock.onPost('/api/device/device-uuid/assign').reply(200);

      const status = await assignDevice('workspace-uuid', 'device-uuid');

      expect(status).toBe(200);
    });
  });

  describe('updateDevice', () => {
    it('powinien wysłać poprawne dane', async () => {
      const updated = { id: 'uuid-1', name: 'Nowa nazwa', isPublicInWorkspace: true };
      mock.onPut('/api/device/uuid-1').reply(200, updated);

      const result = await updateDevice('uuid-1', {
        name: 'Nowa nazwa',
        isPublicInWorkspace: true,
      });

      expect(result.name).toBe('Nowa nazwa');
      expect(mock.history.put[0].data).toBe(
        JSON.stringify({ name: 'Nowa nazwa', isPublicInWorkspace: true })
      );
    });
  });

  describe('accessGrantDevice', () => {
    it('powinien wysłać userId jako obiekt w body', async () => {
      mock.onPost('/api/device/device-uuid/user-access').reply(200);

      await accessGrantDevice('device-uuid', 'user-uuid');

      expect(mock.history.post[0].data).toBe(JSON.stringify({ userId: 'user-uuid' }));
    });
  });

  describe('accessGrantDeviceGroup', () => {
    it('powinien wysłać userGroupId jako obiekt w body', async () => {
      mock.onPost('/api/device/device-uuid/group-access').reply(200);

      await accessGrantDeviceGroup('device-uuid', 'group-uuid');

      expect(mock.history.post[0].data).toBe(JSON.stringify({ userGroupId: 'group-uuid' }));
    });
  });

  describe('openDoor', () => {
    it('powinien wywołać endpoint aktywacji z czasem', async () => {
      mock.onPost(/activate/).reply(200);

      const status = await openDoor('device-uuid', 3);

      expect(status).toBe(200);
      expect(mock.history.post.some(r => r.url?.includes('/activate/3'))).toBe(true);
    });

    it('powinien rzucić błąd przy 403', async () => {
      mock.onAny().reply((config) => {
        if (config.url?.includes('/activate/3')) return [403, { message: 'Forbidden' }];
        return [200, {}];
      });

      await expect(openDoor('device-uuid', 3)).rejects.toThrow();
    });
  });

});