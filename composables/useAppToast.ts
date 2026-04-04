type ToastType = 'success' | 'error';

let nextId = 0;

export const useAppToast = () => {
  const toasts = useState<{ id: number; message: string; type: ToastType }[]>('app-toasts', () => []);

  const add = (message: string, type: ToastType, duration = 3000) => {
    const id = nextId++;
    toasts.value.push({ id, message, type });
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id);
    }, duration);
  };

  return {
    success: (message: string, duration?: number) => add(message, 'success', duration),
    error: (message: string, duration?: number) => add(message, 'error', duration ?? 5000),
  };
};
