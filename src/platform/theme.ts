// Theme switching logic - from theme.md Section 4.3
import { storageGet, storageSet } from './storage';

export type Theme = 'light' | 'dark';
const STORAGE_KEY = 'theme-preference'; // 'light' | 'dark' | 'system'
type ThemePreference = Theme | 'system';

function resolveSystemTheme(): Theme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyThemeToDocument(theme: Theme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
}

// Call once in main.tsx before first paint to avoid a flash of the wrong theme.
export async function initTheme(): Promise<Theme> {
  const stored = (await storageGet(STORAGE_KEY)) as ThemePreference | null;
  const preference: ThemePreference = stored ?? 'system';
  const resolved = preference === 'system' ? resolveSystemTheme() : preference;
  applyThemeToDocument(resolved);
  return resolved;
}

export async function setTheme(theme: ThemePreference): Promise<Theme> {
  await storageSet(STORAGE_KEY, theme);
  const resolved = theme === 'system' ? resolveSystemTheme() : theme;
  applyThemeToDocument(resolved);
  return resolved;
}

export async function toggleTheme(): Promise<Theme> {
  const current = document.documentElement.getAttribute('data-theme') as Theme | null;
  return setTheme(current === 'dark' ? 'light' : 'dark');
}