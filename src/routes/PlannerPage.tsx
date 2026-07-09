import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Circle, CheckCircle2 } from 'lucide-react';
import { useTasks, useUpdateTask } from '../features/tasks/hooks/useTasks';
import { LoadingScreen } from '../components/ui/Spinner';
import { PriorityBadge } from '../components/ui/Badge';
import { getWeekDays, getMonthDays, addDays, subDays, isSameDay, isToday, format } from '../lib/dateUtils';
import type { TaskDTO } from '../../../shared/types';

type PlannerView = 'day' | 'week' | 'month';

export function PlannerPage() {
  const [view, setView] = useState<PlannerView>('week');
  const [reference, setReference] = useState(new Date());
  const { data, isLoading } = useTasks();
  const updateTask = useUpdateTask();

  const tasks = (data?.data ?? []).filter((t) => t.dueDate);

  const navigate = (dir: 1 | -1) => {
    setReference((d) => {
      const delta = view === 'day' ? 1 : view === 'week' ? 7 : 30;
      return dir === 1 ? addDays(d, delta) : subDays(d, delta);
    });
  };

  const tasksForDay = (date: Date): TaskDTO[] =>
    tasks.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), date));

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Calendar className="text-accent" size={24} /> Planner
        </h1>
        <div className="flex gap-1">
          {(['day', 'week', 'month'] as PlannerView[]).map((v) => (
            <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              view === v ? 'bg-accent text-text-onaccent' : 'bg-surface text-text-muted'
            }`}>{v}</button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="tap-target p-2 rounded-lg hover:bg-surface text-text-muted">
          <ChevronLeft size={18} />
        </button>
        <p className="text-sm font-medium text-text-primary">
          {view === 'day' ? format(reference, 'EEEE, MMM d')
           : view === 'week' ? `Week of ${format(getWeekDays(reference)[0], 'MMM d')}`
           : format(reference, 'MMMM yyyy')}
        </p>
        <button onClick={() => navigate(1)} className="tap-target p-2 rounded-lg hover:bg-surface text-text-muted">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day View */}
      {view === 'day' && (
        <DayColumn date={reference} tasks={tasksForDay(reference)} updateTask={updateTask} />
      )}

      {/* Week View */}
      {view === 'week' && (
        <div className="grid grid-cols-7 gap-1.5">
          {getWeekDays(reference).map((day) => (
            <div key={day.toISOString()} className="flex flex-col gap-1">
              <div className={`text-center py-1.5 rounded-lg text-xs font-medium ${
                isToday(day) ? 'bg-accent text-text-onaccent' : 'text-text-muted'
              }`}>
                <div>{format(day, 'EEE')}</div>
                <div className="text-lg font-bold">{format(day, 'd')}</div>
              </div>
              <div className="flex flex-col gap-1 min-h-[80px]">
                {tasksForDay(day).map((t) => (
                  <div key={t.id} className={`p-1.5 rounded text-[10px] leading-tight ${
                    t.status === 'DONE'
                      ? 'bg-success/10 text-success line-through'
                      : 'bg-accent/15 text-accent'
                  }`}>
                    {t.title}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Month View */}
      {view === 'month' && (
        <div>
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {['M','T','W','T','F','S','S'].map((d, i) => (
              <div key={i} className="text-center text-xs text-text-muted py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {getMonthDays(reference).map((day) => {
              const dayTasks = tasksForDay(day);
              return (
                <div key={day.toISOString()} className={`min-h-[60px] p-1 rounded-lg border ${
                  isToday(day) ? 'border-accent/50 bg-accent/5' : 'border-transparent'
                }`}>
                  <p className={`text-xs mb-0.5 font-medium ${isToday(day) ? 'text-accent' : 'text-text-muted'}`}>
                    {format(day, 'd')}
                  </p>
                  {dayTasks.slice(0, 2).map((t) => (
                    <div key={t.id} className="text-[9px] bg-accent/15 text-accent rounded px-1 py-0.5 mb-0.5 truncate">
                      {t.title}
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <div className="text-[9px] text-text-muted">+{dayTasks.length - 2} more</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function DayColumn({ date, tasks, updateTask }: {
  date: Date;
  tasks: TaskDTO[];
  updateTask: ReturnType<typeof useUpdateTask>;
}) {
  return (
    <div className="glass rounded-xl p-4">
      <p className="text-sm font-semibold text-text-primary mb-3">
        {format(date, 'EEEE, MMMM d')}
      </p>
      {tasks.length === 0 ? (
        <p className="text-sm text-text-muted py-4 text-center">No tasks scheduled</p>
      ) : (
        <div className="flex flex-col gap-2">
          {tasks.map((t) => (
            <div key={t.id} className="flex items-center gap-3 p-3 bg-surface rounded-xl">
              <button
                onClick={() => updateTask.mutate({ id: t.id, data: { status: t.status === 'DONE' ? 'TODO' : 'DONE' } })}
                className="tap-target shrink-0"
              >
                {t.status === 'DONE'
                  ? <CheckCircle2 size={18} className="text-success" />
                  : <Circle size={18} className="text-text-muted" />
                }
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${t.status === 'DONE' ? 'line-through text-text-muted' : 'text-text-primary'}`}>{t.title}</p>
              </div>
              <PriorityBadge priority={t.priority} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}