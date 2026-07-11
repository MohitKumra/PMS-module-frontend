// frontend/src/lib/queryClient.ts
// TanStack Query client configuration.
// - staleTime: 60s (avoid hammering API for data that rarely changes)
// - retry: 1 (don't retry 401s infinitely — the interceptor handles token refresh)
// - networkMode: 'always' (works inside Capacitor WebView where navigator.onLine can be unreliable)

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
      networkMode: 'always',
      refetchOnWindowFocus: true,
    },
    mutations: {
      networkMode: 'always',
    },
  },
});
