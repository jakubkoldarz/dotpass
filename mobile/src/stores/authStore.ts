import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { axiosInstance } from '../api/axiosInstance';

export enum userRole {
    user      = 'Member',
    moderator = 'Moderator',
}

export enum UnlockMode {
    NfcOnly   = 0,
    Proximity = 1,
    LongRange = 2,
}

export const RSSI_THRESHOLD = {
    [UnlockMode.Proximity]: -50,
    [UnlockMode.LongRange]: -75,
};

export interface DeviceAccess {
    id: string;
    name?: string;
    macAddress: string;
    unlockMode: UnlockMode;
}

interface deviceGroup { id: string; name: string; workspaceId: string; }
interface workspace   { id: string; name: string; role: userRole; }

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isAdmin: boolean;
    offlineSecret?: string;
    deviceAccesses?: DeviceAccess[];
    userGroups?: deviceGroup[];
    workspaces?: workspace[];
}

interface LoginCredentials { email: string; password: string; }
interface RegisterData {
    email: string;
    firstname: string;
    lastname: string;
    password: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    offlineSecret: string | null;
    allDevices: DeviceAccess[];
    proximityDevices: DeviceAccess[];
    isLoading: boolean;
    error: string | null;

    setToken: (token: string | null) => Promise<void>;
    setAuthError: (error: string) => void;
    clearError: () => void;
    login: (credentials: LoginCredentials) => Promise<boolean>;
    register: (data: RegisterData) => Promise<boolean>;
    fetchProfile: () => Promise<void>;
    logout: () => Promise<void>;
    initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user:             null,
    accessToken:      null,
    offlineSecret:    null,
    allDevices:        [],
    proximityDevices: [],
    isLoading:        false,
    error:            null,

    setToken: async (token) => {
        if (token) {
            await AsyncStorage.setItem('accessToken', token);
        } else {
            await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('cachedUser');
        }
        set({ accessToken: token });
    },

    setAuthError: (error) => set({ error }),
    clearError:   () => set({ error: null }),

    login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.post('/api/auth/login', credentials);
            const { token } = response.data;
            await get().setToken(token);
            await get().fetchProfile();
            set({ isLoading: false });
            return true;
        } catch (err: any) {
            const errMsg = err.response?.data?.message || 'Błąd logowania. Sprawdź dane.';
            set({ error: errMsg, isLoading: false });
            return false;
        }
    },

    register: async (data) => {
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.post('/api/auth/register', data);
            const loginSuccess = await get().login({
                email: data.email,
                password: data.password,
            });
            return loginSuccess;
        } catch (err: any) {
            const errMsg = err.response?.data?.message || 'Błąd rejestracji. Spróbuj ponownie.';
            set({ error: errMsg, isLoading: false });
            return false;
        }
    },

    fetchProfile: async () => {
        try {
            const response = await axiosInstance.get('/api/auth/me');
            const userData: User = response.data;
            set({ user: userData });

            await AsyncStorage.setItem('cachedUser', JSON.stringify(userData));
            await AsyncStorage.setItem('cachedUser', JSON.stringify(userData));

            if (userData.offlineSecret) {
                await AsyncStorage.setItem('offlineSecret', userData.offlineSecret);
                set({ offlineSecret: userData.offlineSecret });
            }

            const allDevices = userData.deviceAccesses || [];
            await AsyncStorage.setItem('allDevices', JSON.stringify(allDevices));
            set({ allDevices });

            const proximityDevices = allDevices.filter(
                d => d.unlockMode === UnlockMode.Proximity ||
                     d.unlockMode === UnlockMode.LongRange
            );
            await AsyncStorage.setItem('proximityDevices', JSON.stringify(proximityDevices));
            set({ proximityDevices });

        } catch (err: any) {
            const isNetworkError = !err.response ||
                err.code === 'ECONNABORTED' ||
                err.message?.includes('Network Error');

            if (isNetworkError) {
                console.warn('[Auth] Brak internetu — zostawiam cache, nie wylogowuję');
                return;
            }

            if (err.response?.status === 401) {
                console.warn('[Auth] Token wygasł — wylogowuję');
                await get().logout();
            }
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post('/api/auth/logout');
        } catch (e) {
            console.log('Backend nie mógł przetworzyć wylogowania.');
        }
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('cachedUser');
        await AsyncStorage.removeItem('cachedUser');
        set({ user: null, accessToken: null, error: null });
    },

    initAuth: async () => {
        set({ isLoading: true });
        try {
            const [token, secret, proximityRaw, allDevicesRaw, cachedUserRaw] = await Promise.all([
                AsyncStorage.getItem('accessToken'),
                AsyncStorage.getItem('offlineSecret'),
                AsyncStorage.getItem('proximityDevices'),
                AsyncStorage.getItem('allDevices'),
                AsyncStorage.getItem('cachedUser'),
            ]);

            if (secret)        set({ offlineSecret: secret });
            if (proximityRaw)  set({ proximityDevices: JSON.parse(proximityRaw) });
            if (allDevicesRaw) set({ allDevices: JSON.parse(allDevicesRaw) });
            if (cachedUserRaw) set({ user: JSON.parse(cachedUserRaw) });
            if (token) {
                set({ accessToken: token });
                await get().fetchProfile();
            }
        } catch (e) {
            console.error('Błąd inicjalizacji auth', e);
        } finally {
            set({ isLoading: false });
        }
    },
}));