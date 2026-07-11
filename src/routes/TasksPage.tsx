import React, { useState, useMemo, useRef, useLayoutEffect, useCallback } from 'react';
import {
  CheckSquare,
  Plus,
  Trash2,
  Edit3,
  AlertCircle,
  Calendar,
  MoreVertical,
} from 'lucide-react';
import { useTasks, useUpdateTask, useDeleteTask } from '../features/tasks/hooks/useTasks';
import { LoadingScreen } from '../components/ui/Spinner';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { CreateTaskModal } from '../components/tasks/CreateTaskModal';
import { EditTaskModal } from '../components/tasks/EditTaskModal';
import { TaskCheckbox } from '../components/tasks/TaskCheckbox';
import type { TaskDTO } from '../types';

type TaskFilter = 'all' | 'today' | 'upcoming' | 'completed' | 'overdue';

const priorityConfig = {
  LOW: { color: 'info', label: 'Low' },
  MEDIUM: { color: 'warning', label: 'Medium' },
  HIGH: { color: 'danger', label: 'High' },
} as const;

const statusConfig = {
  TODO: { color: 'info', label: 'To Do' },
  IN_PROGRESS: { color: 'warning', label: 'In Progress' },
  DONE: { color: 'success', label: 'Done' },
} as const;

interface PillRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function TasksPage() {
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskDTO | null>(null);
  const [taskMenuOpen, setTaskMenuOpen] = useState<string | null>(null);

  // Sliding pill background for filter tabs
  const filterContainerRef = useRef<HTMLDivElement>(null);
  const filterRefs = useRef<Record<TaskFilter, HTMLButtonElement | null>>({
    all: null,
    today: null,
    upcoming: null,
    completed: null,
    overdue: null,
  });
  const [pillRect, setPillRect] = useState<PillRect | null>(null);
  const [pillReady, setPillReady] = useState(false);

  const { data: tasksData, isLoading } = useTasks();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const tasks = tasksData?.data ?? [];

  // Helper functions
  const isToday = (date: string | null) => {
    if (!date) return false;
    const today = new Date();
    const taskDate = new Date(date);
    return (
      taskDate.getDate() === today.getDate() &&
      taskDate.getMonth() === today.getMonth() &&
      taskDate.getFullYear() === today.getFullYear()
    );
  };

  const isOverdue = (date: string | null, status: string) => {
    if (!date || status === 'DONE') return false;
    return new Date(date) < new Date();
  };

  const isUpcoming = (date: string | null) => {
    if (!date) return false;
    const taskDate = new Date(date);
    const today = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(today.getDate() + 7);
    return taskDate > today && taskDate <= weekFromNow;
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      switch (filter) {
        case 'today':
          return isToday(task.dueDate) && task.status !== 'DONE';
        case 'upcoming':
          return isUpcoming(task.dueDate) && task.status !== 'DONE';
        case 'completed':
          return task.status === 'DONE';
        case 'overdue':
          return isOverdue(task.dueDate, task.status);
        default:
          return true;
      }
    });
  }, [tasks, filter]);

  // Count by filter
  const counts = {
    all: tasks.length,
    today: tasks.filter((t) => isToday(t.dueDate) && t.status !== 'DONE').length,
    upcoming: tasks.filter((t) => isUpcoming(t.dueDate) && t.status !== 'DONE').length,
    completed: tasks.filter((t) => t.status === 'DONE').length,
    overdue: tasks.filter((t) => isOverdue(t.dueDate, t.status)).length,
  };

  // Measure the active filter button and position the pill on top of it.
  // Uses offsetLeft/offsetTop (relative to the positioned container) so it
  // works regardless of horizontal scroll position.
  const measurePill = useCallback((f: TaskFilter) => {
    const btn = filterRefs.current[f];
    if (!btn) return;
    setPillRect({
      left: btn.offsetLeft,
      top: btn.offsetTop,
      width: btn.offsetWidth,
      height: btn.offsetHeight,
    });
    setPillReady(true);
  }, []);

  // Reposition the pill whenever the active filter changes. useLayoutEffect
  // avoids a visible flash before the first paint.
  useLayoutEffect(() => {
    measurePill(filter);
  }, [filter, measurePill]);

  // Keep the pill aligned on window resize (button widths can change,
  // e.g. text reflow at different breakpoints).
  useLayoutEffect(() => {
    const handleResize = () => measurePill(filter);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [filter, measurePill]);

  const toggleTaskStatus = (task: TaskDTO) => {
    const nextStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    updateTask.mutate({ id: task.id, data: { status: nextStatus } });
  };

  const handleDeleteTask = (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask.mutate(id);
      setTaskMenuOpen(null);
    }
  };

  const formatDueDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (isToday(dateStr)) return 'Today';
    if (
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear()
    ) {
      return 'Tomorrow';
    }

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  const isPillDanger = filter === 'overdue';

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-[1400px] mx-auto">
      {/* Premium Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="pb-6">
          <PageHeader
            icon={<CheckSquare size={28} />}
            title="Tasks"
            subtitle={`${filteredTasks.length} ${filter === 'all' ? 'total' : filter} tasks`}
          />
          <p className="text-xs mt-3" style={{ color: 'var(--color-text-secondary)' }}>
            Manage and track all your work in one place
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
          style={{ background: 'var(--gradient-accent)' }}
        >
          <Plus size={18} />
          New Task
        </button>
      </div>

      {/* Overdue Alert Banner */}
      {counts.overdue > 0 && filter !== 'overdue' && (
        <div
          className="border rounded-2xl p-5 sm:p-6 shadow-sm animate-fade-in backdrop-blur-sm"
          style={{
            background: 'color-mix(in srgb, var(--color-danger) 5%, var(--color-surface))',
            borderColor: 'var(--color-danger)',
            borderWidth: '1.5px',
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: 'var(--icon-bg-danger)',
                color: 'var(--icon-text-danger)',
              }}
            >
              <AlertCircle size={24} />
            </div>
            <div className="flex-1 pt-0.5">
              <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--color-danger)' }}>
                Overdue Tasks Alert
              </h3>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                You have{' '}
                <span className="font-bold" style={{ color: 'var(--color-danger)' }}>
                  {counts.overdue} overdue {counts.overdue === 1 ? 'task' : 'tasks'}
                </span>{' '}
                that need your attention. Address them to stay on track.
              </p>
            </div>
            <button
              onClick={() => setFilter('overdue')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:shadow-lg hover:-translate-y-0.5 shrink-0 whitespace-nowrap"
              style={{ background: 'var(--color-danger)' }}
            >
              View Tasks
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs — sliding pill background */}
      <div
        ref={filterContainerRef}
        className="relative flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1"
      >
        {/* The traveling pill. It sits behind the buttons and animates its
            left/top/width/height to match whichever tab is active, so it
            visually "slides" from the old tab and becomes the new tab's
            background. */}
        {pillRect && (
          <div
            className="absolute rounded-xl shadow-md pointer-events-none"
            style={{
              left: pillRect.left,
              top: pillRect.top,
              width: pillRect.width,
              height: pillRect.height,
              background: isPillDanger ? 'var(--color-danger)' : 'var(--gradient-accent)',
              opacity: pillReady ? 1 : 0,
              transition:
                'left 300ms cubic-bezier(0.16, 1, 0.3, 1), top 300ms cubic-bezier(0.16, 1, 0.3, 1), width 300ms cubic-bezier(0.16, 1, 0.3, 1), height 300ms cubic-bezier(0.16, 1, 0.3, 1), background-color 200ms ease, opacity 150ms ease',
              zIndex: 0,
            }}
          />
        )}

        {(['all', 'today', 'upcoming', 'completed', 'overdue'] as TaskFilter[]).map((f) => {
          const count = counts[f];
          const isActive = filter === f;

          return (
            <button
              key={f}
              ref={(el) => { filterRefs.current[f] = el; }}
              onClick={() => setFilter(f)}
              className={`relative z-10 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors duration-200 ${
                isActive ? 'text-white' : 'text-text-muted hover:text-text-secondary'
              }`}
              style={
                isActive
                  ? undefined
                  : { background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)' }
              }
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {count > 0 && (
                <span className="ml-2 opacity-80 font-semibold">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <Card variant="default" className="p-16 text-center border-2" style={{ borderColor: 'var(--color-border)' }}>
          <div
            className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'var(--icon-bg-accent)', color: 'var(--icon-text-accent)' }}
          >
            <CheckSquare size={40} />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-3">No tasks found</h3>
          <p className="text-sm text-text-muted mb-8">
            {filter === 'all' ? 'Get started by creating your first task' : `No ${filter} tasks at the moment`}
          </p>
          {filter === 'all' && (
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:shadow-lg hover:-translate-y-0.5 inline-flex items-center gap-2"
              style={{ background: 'var(--gradient-accent)' }}
            >
              <Plus size={18} />
              Create Task
            </button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task, index) => {
            const dueDate = formatDueDate(task.dueDate);
            const overdue = isOverdue(task.dueDate, task.status);
            const today = isToday(task.dueDate);
            const done = task.status === 'DONE';

            return (
              <Card
                key={task.id}
                variant="default"
                className="p-5 hover:shadow-md transition-all duration-300 group border"
                style={{
                  borderColor: done ? 'var(--color-border)' : 'var(--color-border)',
                  borderLeft: done ? '3px solid var(--color-success)' : '3px solid transparent',
                  background: done
                    ? 'color-mix(in srgb, var(--color-success) 4%, var(--color-surface))'
                    : 'var(--color-surface)',
                  animation: `fade-in 0.3s ease-out both`,
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <div className="flex items-start gap-4">
                  {/* Completion control */}
                  <div className="pt-0.5">
                    <TaskCheckbox checked={done} onToggle={() => toggleTaskStatus(task)} />
                  </div>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3
                        className="text-sm font-bold leading-tight transition-colors duration-300"
                        style={{
                          color: done ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                          textDecorationLine: done ? 'line-through' : 'none',
                          textDecorationColor: 'var(--color-success)',
                          textDecorationThickness: '1.5px',
                        }}
                      >
                        {task.title}
                      </h3>
                    </div>

                    {task.description && (
                      <p
                        className="text-xs mb-3 line-clamp-2 leading-relaxed transition-colors duration-300"
                        style={{ color: done ? 'var(--color-text-muted)' : 'var(--color-text-secondary)' }}
                      >
                        {task.description}
                      </p>
                    )}

                    {/* Task Metadata */}
                    <div className="flex items-center flex-wrap gap-2.5">
                      {/* Priority Badge */}
                      <Badge
                        variant={priorityConfig[task.priority].color}
                        size="sm"
                        className="inline-flex items-center gap-1 font-semibold text-xs"
                      >
                        {priorityConfig[task.priority].label}
                      </Badge>

                      {/* Status Badge */}
                      {task.status !== 'TODO' && (
                        <Badge
                          variant={statusConfig[task.status].color}
                          size="sm"
                          className="inline-flex items-center gap-1 font-semibold text-xs"
                        >
                          {statusConfig[task.status].label}
                        </Badge>
                      )}

                      {/* Due Date */}
                      {task.dueDate && (
                        <div
                          className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all"
                          style={{
                            color: overdue
                              ? 'var(--color-danger)'
                              : today
                              ? 'var(--color-warning)'
                              : 'var(--color-text-muted)',
                            background: overdue
                              ? 'color-mix(in srgb, var(--color-danger) 10%, transparent)'
                              : today
                              ? 'color-mix(in srgb, var(--color-warning) 10%, transparent)'
                              : 'color-mix(in srgb, var(--color-text-muted) 8%, transparent)'
                          }}
                        >
                          <Calendar size={12} />
                          <span>{dueDate}</span>
                          {overdue && <span className="opacity-75">• Overdue</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Menu */}
                  <div className="relative shrink-0">
                    <button
                      onClick={() => setTaskMenuOpen(taskMenuOpen === task.id ? null : task.id)}
                      className="p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      style={{
                        color: 'var(--color-text-muted)',
                        background: 'transparent'
                      }}
                    >
                      <MoreVertical size={18} />
                    </button>

                    {taskMenuOpen === task.id && (
                      <div
                        className="absolute right-0 top-full mt-2 w-44 rounded-xl shadow-lg z-10 py-2 animate-scale-in"
                        style={{
                          background: 'var(--color-surface-raised)',
                          border: '1px solid var(--color-border)',
                        }}
                      >
                        <button
                          onClick={() => {
                            setEditingTask(task);
                            setTaskMenuOpen(null);
                          }}
                          className="w-full px-4 py-2.5 text-left text-xs font-semibold transition-all flex items-center gap-3 hover:pl-5"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          <Edit3 size={14} />
                          Edit Task
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="w-full px-4 py-2.5 text-left text-xs font-semibold transition-all flex items-center gap-3 hover:pl-5"
                          style={{ color: 'var(--color-danger)' }}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {createModalOpen && (
        <CreateTaskModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
        />
      )}

      {editingTask && (
        <EditTaskModal
          isOpen={!!editingTask}
          task={editingTask}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}

export default TasksPage;