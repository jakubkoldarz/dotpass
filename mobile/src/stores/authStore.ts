import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { axiosInstance } from '../api/axiosInstance';

export enum userRole {
    'user',
    'moderator'
}

interface deviceAccess {
    id: string;
    isPublic: boolean | null;
    name: string | null;
}

interface userGroup {
    id: string;
    name: string;
    workspaceId: string;
}

interface workspace {
    id: string;
    name: string;
    role: userRole;
}

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isAdmin: boolean;

    deviceAccesses?: deviceAccess[];
    userGroups?: userGroup[];
    workspaces?: workspace[];
}

interface LoginCredentials {
    email: string;
    password: string;
}

interface RegisterData {
    email: string;
    firstname: string;
    lastname: string;
    password: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isLoading: boolean;
    error: string | null;

    setToken: (token: string | null) => Promise<void>;
    setAuthError: (error: string | null) => void;
    clearError: () => void;

    login: (credentials: LoginCredentials) => Promise<boolean>;
    register: (data: RegisterData) => Promise<boolean>;
    fetchProfile: () => Promise<void>;
    logout: () => Promise<void>;
    initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    accessToken: null,
    isLoading: false,
    error: null,

    setToken: async (token) => {
        if (token) {
            await AsyncStorage.setItem('accessToken', token);
        }
        else {
            await AsyncStorage.removeItem('accessToken');
        }
        set({ accessToken: token });
    },

    setAuthError: (error) => set({error}),
    clearError: () => set({error: null}),

    login: async (creditentials) => {
        set({isLoading: true, error: null});
        try {
            console.log("Logowanie");
            const response = await axiosInstance.post('/api/auth/login', creditentials);
            const { token } = response.data;

            console.log(`Token: ${token}`);

            await get().setToken(token);

            console.log("Bierzemy profil.");

            await get().fetchProfile();

            set({ isLoading: false });
            return true;
        } catch (err: any) {
            const errMsg = err.response?.data?.message || 'Błąd logowanie. Sprawdź dane';
            set({error: errMsg, isLoading: false});
            return false;
        }
    },

    register: async (data) => {
    set({isLoading: true, error: null});

    try {

        await axiosInstance.post('/api/auth/register', data);
        console.log("Konto utworzone");
        const loginSuccess = await get().login({
                email: data.email,
                password: data.password
            });
        return loginSuccess;

    } catch (err: any) {
        const errMsg = err.response?.data?.message || 'Błąd rejestracji. Spróbuj ponownie';
        set({
            error: errMsg,
            isLoading: false
        });

        return false;
    }
},

    fetchProfile: async () => {
        try {
            const response = await axiosInstance.get('/api/auth/me');
            set({user: response.data});
        } catch (err) {
            console.error('Nie udało się pobrać danych profilu', err);
            await get().logout();
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post('/api/auth/logout');
        } catch (e) {
            console.log('Backend nie mógł przetworzyć wylogowania. State wyczyszczony lokalnie.');
        }
        await AsyncStorage.removeItem('accessToken');
        set({user: null, accessToken: null, error: null});
    },

    initAuth: async () => {
        set({isLoading: true});
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (token) {
                set({accessToken: token});
            }
            else {
                throw new Error("No token at start");
            }

            const response = await axiosInstance.get('/api/auth/me');
            set({user: response.data});

        }
        catch (e) {
            console.log('InitAuth failed: ', e);
            set({ user: null });
        }
        finally {
            set({ isLoading: false })
        }
    }
}))