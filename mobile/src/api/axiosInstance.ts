import axios, { AxiosError } from 'axios';
import { useServerStore } from '../stores/serverStore';
import { useAuthStore } from '../stores/authStore';
import { navigationRef } from '../../App';

export const axiosInstance = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const refreshAxios = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: AxiosError) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  (config) => {
    const activeServer = useServerStore.getState().activeServer;
    if (!activeServer) {
      return Promise.reject(new Error('Brak skonfigurowanego aktywnego serwera.'));
    }

    config.baseURL = activeServer.url;

    const token = useAuthStore.getState().accessToken;

    console.log(`Axios wita swoim tokenem: ${token}`)

    if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      originalRequest.url !== '/api/auth/refresh' &&
      originalRequest.url !== '/api/auth/logout'
    ) {
      
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.set('Authorization', `Bearer ${token}`);
              resolve(axiosInstance(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const activeServer = useServerStore.getState().activeServer;
      if (!activeServer) return Promise.reject(error);
      refreshAxios.defaults.baseURL = activeServer.url;

      try {
        const response = await refreshAxios.post('/api/auth/refresh'); 
        
        const token = response.data.token;

        if (!token) {
          throw new Error('Serwer nie zwrócił klucza token w żądaniu odświeżenia.');
        }

        await useAuthStore.getState().setToken(token);

        processQueue(null, token);

        originalRequest.headers.set('Authorization', `Bearer ${token}`);
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError as AxiosError);

        await useAuthStore.getState().logout();

        if (navigationRef.isReady()) {
          navigationRef.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);