// frontend/src/features/tasks/api.ts
import apiClient from '../../lib/apiClient';
import type { TaskDTO, CreateTaskRequest, UpdateTaskRequest, ListResponse } from '../../../../shared/types';

export const tasksApi = {
  list: (params?: Record<string, string>) =>
    apiClient.get<ListResponse<TaskDTO>>('/tasks', { params }).then((r) => r.data),

  getOne: (id: string) =>
    apiClient.get<TaskDTO>(`/tasks/${id}`).then((r) => r.data),

  create: (data: CreateTaskRequest) =>
    apiClient.post<TaskDTO>('/tasks', data).then((r) => r.data),

  update: (id: string, data: UpdateTaskRequest) =>
    apiClient.patch<TaskDTO>(`/tasks/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/tasks/${id}`),
};
