import { create } from 'zustand'

type ToastType = 'success' | 'error' | 'info'

interface ToastState {
    visible: boolean;
    message: string;
    type: ToastType;
    show: (msg: string, type?: ToastType) => void;
    hide: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
    visible: false,
    message: '',
    type: 'info',

    show: (message, type = 'info') =>
        set({ visible: true, message, type}),

    hide: () =>
        set({visible: false, message: ''})
}))