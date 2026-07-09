// frontend/src/features/dashboard/hooks/useDashboard.ts
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api';

const DASHBOARD_KEY = ['dashboard'] as const;

export function useDashboardSummary() {
  return useQuery({
    queryKey: [...DASHBOARD_KEY, 'summary'],
    queryFn: dashboardApi.getSummary,
  });
}

export function useDashboardToday() {
  return useQuery({
    queryKey: [...DASHBOARD_KEY, 'today'],
    queryFn: dashboardApi.getToday,
  });
}