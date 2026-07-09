import { useState } from 'react';
import { CheckSquare, Plus, Trash2, Edit3, Circle, CheckCircle2, Clock } from 'lucide-react';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../features/tasks/hooks/useTasks';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { PriorityBadge, StatusBadge } from '../components/ui/Badge';
import { LoadingScreen } from '../components/ui/Spinner';
import { formatDate } from '../lib/dateUtils';
import type { TaskDTO, Priority } from '../../../shared/types';

function TaskCard({ task }: { task: TaskDTO }) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [showEdit, setShowEdit] = useState(false);

  const toggleStatus = () => {
    const next = task.status === 'DONE' ? 'TODO' : 'DONE';
    updateTask.mutate({ id: task.id, data: { status: next } });
  };

  return (
    <>
      <div className="glass rounded-xl p-4 flex items-start gap-3 group animate-fade-in hover:border-accent/30 transition-all">
        <button
          onClick={toggleStatus}
          className="tap-target shrink-0 flex items-center pt-0.5"
          aria-label={task.status === 'DONE' ? 'Mark incomplete' : 'Mark complete'}
        >
          {task.status === 'DONE'
            ? <CheckCircle2 size={20} className="text-success animate-tick" />
            : <Circle size={20} className="text-text-muted group-hover:text-accent" />
          }
        </button>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${task.status === 'DONE' ? 'line-through text-text-muted' : 'text-text-primary'}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{task.description}</p>
          )}
          <div className="flex items-center flex-wrap gap-2 mt-2">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
            {task.dueDate && (
              <span className="flex items-center gap-1 text-xs text-text-muted">
                <Clock size={11} /> {formatDate(task.dueDate)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setShowEdit(true)}
            className="tap-target p-1.5 rounded-lg hover:bg-surface text-text-muted"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={() => deleteTask.mutate(task.id)}
            className="tap-target p-1.5 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Task">
        <TaskForm
          initialValues={{ title: task.title, description: task.description ?? '', priority: task.priority, dueDate: task.dueDate?.split('T')[0] ?? '' }}
          onSubmit={(values) => {
            // Convert date string to ISO datetime string for backend validation
            const dueDate = values.dueDate ? new Date(values.dueDate).toISOString() : undefined;
            updateTask.mutate({ id: task.id, data: { ...values, dueDate } }, { onSuccess: () => setShowEdit(false) });
          }}
          loading={updateTask.isPending}
        />
      </Modal>
    </>
  );
}

interface TaskFormValues {
  title: string;
  description: string;
  priority: Priority;
  dueDate: string;
}

function TaskForm({
  initialValues,
  onSubmit,
  loading,
}: {
  initialValues?: Partial<TaskFormValues>;
  onSubmit: (v: TaskFormValues) => void;
  loading?: boolean;
}) {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [priority, setPriority] = useState<Priority>(initialValues?.priority ?? 'MEDIUM');
  const [dueDate, setDueDate] = useState(initialValues?.dueDate ?? '');

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit({ title, description, priority, dueDate }); }}
      className="flex flex-col gap-4 pt-2"
    >
      <Input id="task-title" label="Task title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="What needs to be done?" />
      <Textarea id="task-desc" label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Add details…" />
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-muted">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="bg-surface border border-border rounded-md text-text-primary text-sm px-3 py-2.5 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
        <Input id="task-due" label="Due date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </div>
      <Button type="submit" fullWidth loading={loading}>Save Task</Button>
    </form>
  );
}

export function TasksPage() {
  const { data, isLoading } = useTasks();
  const createTask = useCreateTask();
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<string>('ALL');

  const tasks = data?.data ?? [];
  const filtered = filter === 'ALL' ? tasks : tasks.filter((t) => t.status === filter);

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <CheckSquare className="text-accent" size={24} /> Tasks
          </h1>
          <p className="text-sm text-text-muted mt-0.5">{tasks.length} total</p>
        </div>
        <Button onClick={() => setShowCreate(true)} leftIcon={<Plus size={16} />} id="create-task-btn">
          New Task
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {['ALL', 'TODO', 'IN_PROGRESS', 'DONE'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === s
                ? 'bg-accent text-text-onaccent'
                : 'bg-surface text-text-muted hover:text-text-primary'
            }`}
          >
            {s === 'IN_PROGRESS' ? 'In Progress' : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <CheckSquare size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No tasks here</p>
          <p className="text-sm mt-1">Create your first task to get started</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 stagger">
          {filtered.map((task) => <TaskCard key={task.id} task={task} />)}
        </div>
      )}

      {/* Create modal */}
       <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Task">
         <TaskForm
           onSubmit={(values) => {
             // Convert date string to ISO datetime string for backend validation
             const dueDate = values.dueDate ? new Date(values.dueDate).toISOString() : undefined;
             createTask.mutate(
               { title: values.title, description: values.description || undefined, priority: values.priority, dueDate },
               { onSuccess: () => setShowCreate(false) }
             );
           }}
           loading={createTask.isPending}
         />
       </Modal>
    </div>
  );
}