import React, { useState } from 'react';
import { Calendar, Flag } from 'lucide-react';
import { useUpdateTask } from '../../features/tasks/hooks/useTasks';
import type { TaskDTO, UpdateTaskRequest, Priority, TaskStatus } from '../../types';
import { Modal } from '../ui/Modal';

interface EditTaskModalProps {
  isOpen: boolean;
  task: TaskDTO;
  onClose: () => void;
}

export function EditTaskModal({ isOpen, task, onClose }: EditTaskModalProps) {
  const updateTask = useUpdateTask();
  const [formData, setFormData] = useState<UpdateTaskRequest>({
    title: task.title,
    description: task.description ?? '',
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate?.split('T')[0] ?? '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateTask.mutateAsync({ id: task.id, data: formData });
      onClose();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="Edit Task">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Task Title */}
        <div>
          <label className="block text-xs font-bold text-text-primary mb-2">
            Task Title <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter task title"
            required
            className="w-full px-4 py-2.5 rounded-xl text-sm font-bold border focus:outline-none focus:ring-2 focus:ring-accent transition-all"
            style={{
              background: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-text-primary mb-2">Description</label>
          <textarea
            value={formData.description ?? ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter task description (optional)"
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl text-sm font-bold border focus:outline-none focus:ring-2 focus:ring-accent transition-all resize-none"
            style={{
              background: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-bold text-text-primary mb-2">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
            className="w-full px-4 py-2.5 rounded-xl text-sm font-bold border focus:outline-none focus:ring-2 focus:ring-accent transition-all"
            style={{
              background: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-xs font-bold text-text-primary mb-2">
            <Flag size={14} className="inline mr-1" />
            Priority
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['LOW', 'MEDIUM', 'HIGH'] as Priority[]).map((priority) => (
              <button
                key={priority}
                type="button"
                onClick={() => setFormData({ ...formData, priority })}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  formData.priority === priority
                    ? 'text-white shadow-sm'
                    : 'text-text-muted border hover:border-accent'
                }`}
                style={
                  formData.priority === priority
                    ? {
                        background:
                          priority === 'LOW'
                            ? 'var(--color-info)'
                            : priority === 'MEDIUM'
                            ? 'var(--color-warning)'
                            : 'var(--color-danger)',
                      }
                    : {
                        background: 'var(--color-surface)',
                        borderColor: 'var(--color-border)',
                      }
                }
              >
                {priority}
              </button>
            ))}
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-xs font-bold text-text-primary mb-2">
            <Calendar size={14} className="inline mr-1" />
            Due Date
          </label>
          <input
            type="date"
            value={formData.dueDate ?? ''}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl text-sm font-bold border focus:outline-none focus:ring-2 focus:ring-accent transition-all"
            style={{
              background: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!formData.title || updateTask.isPending}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--gradient-accent)' }}
          >
            {updateTask.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
