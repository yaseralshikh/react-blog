import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

type ToastAction = {
  label: string;
  onClick?: () => void | Promise<void>;
  variant?: 'primary' | 'ghost' | 'danger';
};

type ToastMessage = {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  actions?: ToastAction[];
  closeOnClick?: boolean;
};

type ToastOptions = {
  id?: string;
  duration?: number;
  actions?: ToastAction[];
  closeOnClick?: boolean;
};

type ConfirmOptions = {
  confirmLabel?: string;
  cancelLabel?: string;
  duration?: number;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
};

const listeners = new Set<(toast: ToastMessage) => void>();
const dismissers = new Set<(id: string) => void>();

const emit = (toast: ToastMessage) => {
  listeners.forEach((listener) => listener(toast));
};

const createToast = (type: ToastType, message: string, options?: ToastOptions) => {
  const id = options?.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  emit({
    id,
    message,
    type,
    duration: options?.duration ?? 3200,
    actions: options?.actions,
    closeOnClick: options?.closeOnClick ?? true,
  });
  return id;
};

const dismissToast = (id: string) => {
  dismissers.forEach((fn) => fn(id));
};

export const toast = {
  success: (message: string, options?: ToastOptions) => createToast('success', message, options),
  error: (message: string, options?: ToastOptions) => createToast('error', message, options),
  info: (message: string, options?: ToastOptions) => createToast('info', message, options),
  warn: (message: string, options?: ToastOptions) => createToast('warning', message, options),
  confirm: (message: string, options?: ConfirmOptions) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const confirmLabel = options?.confirmLabel || 'Confirm';
    const cancelLabel = options?.cancelLabel || 'Cancel';

    const actions: ToastAction[] = [
      {
        label: cancelLabel,
        variant: 'ghost',
        onClick: () => {
          options?.onCancel?.();
          dismissToast(id);
        },
      },
      {
        label: confirmLabel,
        variant: 'danger',
        onClick: async () => {
          await options?.onConfirm?.();
          dismissToast(id);
        },
      },
    ];

    return createToast('warning', message, { id, duration: options?.duration ?? 7000, actions, closeOnClick: false });
  },
  dismiss: dismissToast,
};

const typeStyles: Record<ToastType, string> = {
  success: 'bg-emerald-500/90 text-white border-emerald-400/50',
  error: 'bg-red-500/90 text-white border-red-400/50',
  info: 'bg-sky-500/90 text-white border-sky-400/50',
  warning: 'bg-amber-500/90 text-slate-900 border-amber-300/70',
};

const typeIcons: Record<ToastType, string> = {
  success: '✓',
  error: '!',
  info: 'ℹ',
  warning: '⚠',
};

type ToastContainerProps = {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  newestOnTop?: boolean;
  pauseOnHover?: boolean;
  closeOnClick?: boolean;
  theme?: 'light' | 'dark' | 'colored';
};

export const ToastContainer: React.FC<ToastContainerProps> = ({
  position = 'top-right',
  newestOnTop = true,
}) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timers = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const handleToast = (toast: ToastMessage) => {
      setToasts((prev) => {
        const filtered = prev.filter((t) => t.id !== toast.id);
        return newestOnTop ? [toast, ...filtered] : [...filtered, toast];
      });
      const timer = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
        timers.current.delete(toast.id);
      }, toast.duration);
      timers.current.set(toast.id, timer);
    };

    listeners.add(handleToast);
    dismissers.add((id: string) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      const timer = timers.current.get(id);
      if (timer) clearTimeout(timer);
      timers.current.delete(id);
    });

    return () => {
      listeners.delete(handleToast);
      dismissers.clear();
      timers.current.forEach((timer) => clearTimeout(timer));
      timers.current.clear();
    };
  }, [newestOnTop]);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
  };

  const positionClass = (() => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4 items-start';
      case 'top-center':
        return 'top-4 left-1/2 -translate-x-1/2 items-center';
      case 'bottom-right':
        return 'bottom-4 right-4 items-end';
      case 'bottom-left':
        return 'bottom-4 left-4 items-start';
      case 'bottom-center':
        return 'bottom-4 left-1/2 -translate-x-1/2 items-center';
      default:
        return 'top-4 right-4 items-end';
    }
  })();

  return (
    <div className={`pointer-events-none fixed z-[9999] flex flex-col gap-3 w-full max-w-xs sm:max-w-sm ${positionClass}`}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto relative overflow-hidden rounded-xl border shadow-xl backdrop-blur-sm px-4 py-3 flex items-start gap-3 animate-[fadeIn_150ms_ease] ${typeStyles[toast.type]}`}
          onClick={() => toast.closeOnClick !== false && dismiss(toast.id)}
        >
          <span className="mt-0.5 text-lg leading-none">{typeIcons[toast.type]}</span>
          <div className="flex-1">
            <p className="text-sm font-medium leading-snug">{toast.message}</p>
            {toast.actions && (
              <div className="mt-3 flex gap-2 flex-wrap">
                {toast.actions.map((action, idx) => (
                  <button
                    key={`${toast.id}-action-${idx}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick?.();
                    }}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                      action.variant === 'danger'
                        ? 'bg-white/20 text-white hover:bg-white/30'
                        : action.variant === 'ghost'
                          ? 'bg-white/10 text-white hover:bg-white/20'
                          : 'bg-white text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            aria-label="Close"
            onClick={(e) => {
              e.stopPropagation();
              dismiss(toast.id);
            }}
            className="text-sm opacity-70 hover:opacity-100 transition-opacity"
          >
            <X size={16} />
          </button>
          <span
            className="absolute inset-x-0 bottom-0 h-0.5 bg-white/30"
            style={{ animation: `shrink ${toast.duration}ms linear forwards` }}
          />
        </div>
      ))}
    </div>
  );
};
