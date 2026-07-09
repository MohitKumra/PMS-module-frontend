import { useState } from 'react';
import { CheckSquare, Plus, Trash2, Edit3, Circle, CheckCircle2, Clock } from 'lucide-react';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../features/tasks/hooks/useTasks';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { PriorityBadge, StatusBadge } from '../components/ui/Badge';
import { LoadingScreen } from '../components/ui/Spinner';
import { formatDate } from '../lib/dateUtils';
import { PageHeader } from '../components/ui/PageHeader';
import { TabBar } from '../components/ui/TabBar';
import { EmptyState } from '../components/ui/EmptyState';
import { Card } from '../components/ui/Card';
import type { TaskDTO, Priority } from '../types';

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
      <Card
        variant="default"
        hoverable
        className="p-5 sm:p-6 flex items-start gap-4 group"
      >
        <button
          onClick={toggleStatus}
          className="shrink-0 flex items-center pt-1 tap-target"
          aria-label={task.status === 'DONE' ? 'Mark incomplete' : 'Mark complete'}
        >
          {task.status === 'DONE' ? (
            <CheckCircle2 size={24} className="text-success" />
          ) : (
            <Circle size={24} className="text-text-muted hover:text-accent transition-colors" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p className={[
            'text-base sm:text-lg font-bold transition-all duration-200',
            task.status === 'DONE' 
              ? 'line-through text-text-muted' 
              : 'text-text-primary',
          ].join(' ')}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs sm:text-sm text-text-secondary mt-2 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}
          <div className="flex items-center flex-wrap gap-2.5 mt-4">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
            {task.dueDate && (
              <span className="flex items-center gap-1.5 text-xs text-text-muted font-bold">
                <Clock size={14} /> {formatDate(task.dueDate)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setShowEdit(true)}
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-text-secondary hover:text-text-primary transition-all tap-target"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={() => deleteTask.mutate(task.id)}
            className="p-2 rounded-xl hover:bg-red-500/10 text-red-500 hover:text-red-600 transition-all tap-target"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </Card>

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Task">
        <TaskForm
          initialValues={{ title: task.title, description: task.description ?? '', priority: task.priority, dueDate: task.dueDate?.split('T')[0] ?? '' }}
          onSubmit={(values) => {
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
      className="flex flex-col gap-5 pt-2"
    >
      <Input 
        id="task-title" 
        label="Task title" 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
        required 
        placeholder="What needs to be done?" 
      />
      <Textarea 
        id="task-desc" 
        label="Description (optional)" 
        value={description} 
        onChange={(e) => setDescription(e.target.value)} 
        rows={3} 
        placeholder="Add details…" 
      />
      <div className="grid grid-cols-2 gap-3.5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="w-full bg-surface border border-border rounded-xl text-text-primary text-xs font-bold px-3 py-2.5 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
        <Input id="task-due" label="Due date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </div>
      <Button type="submit" fullWidth loading={loading} className="mt-2">Save Task</Button>
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

  const tabOptions = [
    { id: 'ALL', label: 'All' },
    { id: 'TODO', label: 'To Do' },
    { id: 'IN_PROGRESS', label: 'In Progress' },
    { id: 'DONE', label: 'Completed' },
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 sm:gap-8">
      {/* Header */}
      <PageHeader
        icon={<CheckSquare size={24} />}
        title="Tasks"
        subtitle={`${tasks.length} total tasks`}
        action={
          <Button onClick={() => setShowCreate(true)} leftIcon={<Plus size={16} />} id="create-task-btn">
            New Task
          </Button>
        }
      />

      {/* Filter TabBar */}
      <TabBar
        tabs={tabOptions}
        activeTab={filter}
        onTabChange={setFilter}
        variant="pill"
      />

      {/* Task list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<CheckSquare size={32} />}
          title="No tasks found"
          description={
            filter === 'ALL' 
              ? 'Get started by creating your very first task above.' 
              : `You have no tasks marked as "${tabOptions.find(t => t.id === filter)?.label}".`
          }
          action={
            filter === 'ALL' ? (
              <Button onClick={() => setShowCreate(true)} leftIcon={<Plus size={16} />}>
                Create Task
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="flex flex-col gap-4.5 stagger animate-fade-in">
          {filtered.map((task) => <TaskCard key={task.id} task={task} />)}
        </div>
      )}

      {/* Create modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Task">
        <TaskForm
          onSubmit={(values) => {
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