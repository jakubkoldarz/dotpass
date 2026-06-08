import { useToastStore } from '../stores/toastStore';

export function useToast() {
  const show = useToastStore((s) => s.show);
  return {
    success: (msg: string) => show(msg, 'success'),
    error: (msg: string) => show(msg, 'error'),
    info: (msg: string) => show(msg, 'info'),
  };
}
