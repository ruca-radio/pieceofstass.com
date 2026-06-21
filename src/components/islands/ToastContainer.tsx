import { useState, useEffect } from 'react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// Global toast store
const listeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];

export function showToast(message: string, type: Toast['type'] = 'success') {
  const id = Math.random().toString(36).slice(2);
  toasts = [...toasts, { id, message, type }];
  listeners.forEach((fn) => fn(toasts));
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    listeners.forEach((fn) => fn(toasts));
  }, 3500);
}

export default function ToastContainer() {
  const [items, setItems] = useState<Toast[]>([]);

  useEffect(() => {
    listeners.push(setItems);
    return () => {
      const idx = listeners.indexOf(setItems);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  const colors: Record<Toast['type'], string> = {
    success: 'var(--color-lime)',
    error: 'var(--color-error)',
    info: 'var(--color-violet)',
  };
  const textColors: Record<Toast['type'], string> = {
    success: 'var(--color-ink)',
    error: 'var(--color-paper)',
    info: 'var(--color-paper)',
  };

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      style={{ position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)', zIndex: 500, display: 'flex', flexDirection: 'column', gap: '8px', pointerEvents: 'none', width: '100%', maxWidth: '360px', padding: '0 16px' }}
    >
      {items.map((toast) => (
        <div
          key={toast.id}
          role="status"
          style={{
            background: colors[toast.type],
            color: textColors[toast.type],
            padding: '12px 16px',
            borderRadius: 'var(--radius-pill)',
            fontWeight: 600,
            fontSize: '14px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-lg)',
            animation: 'slideUp 200ms var(--ease-expo-out)',
          }}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
