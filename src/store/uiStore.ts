// frontend/src/store/uiStore.ts
// Global Zustand store for UI state that must survive refresh:
// - theme (dark/light/system)
// - sidebar open/closed state on desktop
//
// Per Architecture rules: local UI state (modal open, form values) stays in useState.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setTheme as applyTheme, type Theme } from '../platform/theme';

type ThemePreference = Theme | 'system';

interface UIState {
  theme: Theme;
  themePreference: ThemePreference;
  sidebarOpen: boolean;
  setTheme: (theme: ThemePreference) => Promise<Theme>;
  toggleTheme: () => Promise<Theme>;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'light',
      themePreference: 'system',
      sidebarOpen: true,

      setTheme: async (theme) => {
        const resolved = await applyTheme(theme);
        set({ theme: resolved, themePreference: theme });
        return resolved;
      },
      toggleTheme: async () => {
        const current = document.documentElement.getAttribute('data-theme') as Theme | null;
        const next = current === 'dark' ? 'light' : 'dark';
        const resolved = await applyTheme(next);
        set({ theme: resolved, themePreference: next });
        return resolved;
      },
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    { name: 'ui-store' },
  ),
);