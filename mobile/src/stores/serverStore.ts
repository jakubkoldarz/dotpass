import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { axiosInstance } from '../api/axiosInstance';

export interface ServerInfo {
    id: string;
    name: string;
    url: string;
}

interface ServerState {
    servers: ServerInfo[];
    activeServer: ServerInfo | null;
    isLoading: boolean;
    error: string | null;

    initServers: () => Promise<void>;
    setActiveServer: (serverId: string) => Promise<void>;
    checkAndAddServer: (serverId: string, url: string) => Promise<boolean>;
    removeServer: (serverId: string) => Promise<void>;
    clearError: () => void;
}

export const useServerStore = create<ServerState>((set, get) => ({
    servers: [],
    activeServer: null,
    isLoading: false,
    error: null,

    clearError: () => set({error: null}),


    initServers: async () => {
        try {
            const storedServers = await AsyncStorage.getItem('@saved_servers');
            const storedActiveId = await AsyncStorage.getItem('@active_server_id');

            const servers: ServerInfo[] = storedServers ? JSON.parse(storedServers) : [];
            let activeServer: ServerInfo | null = null;

            if (storedActiveId && servers.length > 0) {
                activeServer = servers.find(s => s.id === storedActiveId) || servers[0];
            }
            else if (servers.length > 0) {
                activeServer = servers[0];
            }

            set({servers, activeServer});
        }
        catch (e) {
            console.error('Błąd ładowania serwerów z pamięci: ', e);
        }
    },

    setActiveServer: async (serverId) => {
        const {servers} = get();
        const selected = servers.find(s => s.id === serverId) || null;
        if (selected) {
            await AsyncStorage.setItem('@active_server_id', serverId);
            set({activeServer: selected});
        }
    },

    checkAndAddServer: async (name, url) => {
        set({isLoading: true, error: null});

        let formattedUrl = url.trim().replace(/\/$/, "");
        if (!/^https?:\/\//i.test(formattedUrl)) {
            formattedUrl = `https://${formattedUrl}`;
        }

        try {
            const response = await axiosInstance.get(`${formattedUrl}/api/check`, {timeout: 5000});
            
            if (response.status == 200) {
                const newServer: ServerInfo = {
                    id: Date.now().toString(),
                    name: name.trim(),
                    url: formattedUrl
                };

                const updatedServers = [...get().servers, newServer];

                await AsyncStorage.setItem('@saved_servers', JSON.stringify(updatedServers));

                if (!get().activeServer) {
                    await AsyncStorage.setItem('@active_server_id', newServer.id);
                    set({servers: updatedServers, activeServer: newServer});
                }
                else {
                    set({servers: updatedServers});
                }

                set({isLoading: false});
                return true;
            }
            throw new Error('Serwer odpowiedział nieprawidłowym statusem');
        }
        catch (err: any) {
            let message = 'Nie udało połączyć się z serwerem'
            if (err.response) {
                message = `Serwer zwrócił błąd: ${err.response.status}`;
            }
            else if (err.code == 'ECONNABORTED') {
                message = 'Przekroczono czas połączenia (Timeout)';
            }

            set({error: message, isLoading: false});
            return false;
        }
    },

    removeServer: async (serverId) => {
        const updatedServers = get().servers.filter(s => s.id !== serverId);
        await AsyncStorage.setItem('@saved_servers', JSON.stringify(updatedServers));

        let activeServer = get().activeServer;
        if (activeServer?.id === serverId) {
            activeServer = updatedServers.length > 0 ? updatedServers[0] : null;
            if (activeServer) {
                await AsyncStorage.setItem('@active_server_id', activeServer.id);
            }
            else {
                await AsyncStorage.removeItem('@active_server_id')
            }
        }
        set({servers: updatedServers, activeServer})
    }
}))