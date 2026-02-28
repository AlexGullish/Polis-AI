'use client';

import { useEffect, useState } from 'react';
import { Monitor, Sun, Moon } from 'lucide-react';

type ThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'polis-theme';

const MODES: { value: ThemeMode; icon: React.ReactNode; label: string }[] = [
  { value: 'system', icon: <Monitor size={13} />, label: 'Auto' },
  { value: 'light', icon: <Sun size={13} />, label: 'Light' },
  { value: 'dark', icon: <Moon size={13} />, label: 'Dark' },
];

function applyTheme(mode: ThemeMode) {
  const html = document.documentElement;
  if (mode === 'system') {
    html.removeAttribute('data-theme');
  } else {
    html.setAttribute('data-theme', mode);
  }
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    const initial = saved ?? 'system';
    setMode(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  function select(next: ThemeMode) {
    setMode(next);
    applyTheme(next);
    if (next === 'system') {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, next);
    }
  }

  if (!mounted) return null;

  return (
    <div
      className="flex items-center rounded-lg p-0.5 gap-0.5"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
      }}
    >
      {MODES.map(({ value, icon, label }) => {
        const active = mode === value;
        return (
          <button
            key={value}
            onClick={() => select(value)}
            title={label}
            className="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs transition-all"
            style={{
              background: active ? 'var(--bg-base)' : 'transparent',
              color: active ? 'var(--text-primary)' : 'var(--text-muted)',
              border: active ? '1px solid var(--border)' : '1px solid transparent',
            }}
          >
            {icon}
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
