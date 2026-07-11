// frontend/src/features/dashboard/api.ts
import apiClient from '../../lib/apiClient';
import type { AnalyticsSummaryDTO, EnhancedDashboardDTO } from '../../types';

export const dashboardApi = {
  getSummary: () =>
    apiClient.get<AnalyticsSummaryDTO>('/dashboard/summary').then((r) => r.data),

  getToday: () =>
    apiClient.get<{ pendingTasks: number; habitsToComplete: number }>('/dashboard/today').then((r) => r.data),

  getEnhanced: () =>
    apiClient.get<EnhancedDashboardDTO>('/dashboard/enhanced').then((r) => r.data),
};