// frontend/src/features/notes/api.ts
import apiClient from '../../lib/apiClient';
import type { NoteDTO, CreateNoteRequest, UpdateNoteRequest, ListResponse } from '../../types';

export const notesApi = {
  list: (isJournal?: boolean) =>
    apiClient.get<ListResponse<NoteDTO>>('/notes', { params: isJournal !== undefined ? { isJournal } : undefined }).then((r) => r.data),
  getOne: (id: string) => apiClient.get<NoteDTO>(`/notes/${id}`).then((r) => r.data),
  create: (data: CreateNoteRequest) => apiClient.post<NoteDTO>('/notes', data).then((r) => r.data),
  update: (id: string, data: UpdateNoteRequest) => apiClient.patch<NoteDTO>(`/notes/${id}`, data).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/notes/${id}`),
};
