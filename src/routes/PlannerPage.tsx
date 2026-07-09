import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Circle, CheckCircle2 } from 'lucide-react';
import { useTasks, useUpdateTask } from '../features/tasks/hooks/useTasks';
import { LoadingScreen } from '../components/ui/Spinner';
import { PriorityBadge } from '../components/ui/Badge';
import { getWeekDays, getMonthDays, addDays, subDays, isSameDay, isToday, format } from '../lib/dateUtils';
import { PageHeader } from '../components/ui/PageHeader';
import { TabBar } from '../components/ui/TabBar';
import { Card } from '../components/ui/Card';
import type { TaskDTO } from '../types';

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

  const viewTabs = [
    { id: 'day', label: 'Day' },
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
  ];

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 sm:gap-8">
      {/* Header */}
      <PageHeader
        icon={<Calendar size={24} />}
        title="Planner"
        subtitle="Manage your schedule"
        action={
          <TabBar
            tabs={viewTabs}
            activeTab={view}
            onTabChange={(v) => setView(v as PlannerView)}
            variant="pill"
          />
        }
      />

      {/* Navigation Row */}
      <div 
        className="flex items-center justify-between p-2 rounded-2xl border"
        style={{
          background: 'var(--color-surface-raised)',
          borderColor: 'var(--color-border)',
        }}
      >
        <button 
          onClick={() => navigate(-1)} 
          className="p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-text-secondary hover:text-text-primary transition-colors tap-target"
        >
          <ChevronLeft size={20} />
        </button>
        <p className="text-sm sm:text-base font-extrabold text-text-primary">
          {view === 'day' ? format(reference, 'EEEE, MMMM d')
           : view === 'week' ? `Week of ${format(getWeekDays(reference)[0], 'MMMM d, yyyy')}`
           : format(reference, 'MMMM yyyy')}
        </p>
        <button 
          onClick={() => navigate(1)} 
          className="p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-text-secondary hover:text-text-primary transition-colors tap-target"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Day View */}
      {view === 'day' && (
        <DayColumn date={reference} tasks={tasksForDay(reference)} updateTask={updateTask} />
      )}

      {/* Week View */}
      {view === 'week' && (
        <div className="grid grid-cols-7 gap-3 overflow-x-auto no-scrollbar min-w-[640px] py-1">
          {getWeekDays(reference).map((day) => {
            const dayTasks = tasksForDay(day);
            const today = isToday(day);
            return (
              <div key={day.toISOString()} className="flex flex-col gap-3 min-w-0">
                <div 
                  className={[
                    'text-center py-3 rounded-2xl text-xs font-extrabold flex flex-col border',
                    today 
                      ? 'text-white border-transparent shadow-sm'
                      : 'text-text-secondary border-border',
                  ].join(' ')}
                  style={{
                    background: today ? 'var(--gradient-accent)' : 'var(--color-surface)',
                  }}
                >
                  <span className="uppercase tracking-wider opacity-75">{format(day, 'EEE')}</span>
                  <span className="text-xl font-black mt-0.5">{format(day, 'd')}</span>
                </div>
                <div className="flex flex-col gap-2 min-h-[140px] p-1 rounded-2xl bg-neutral-50/50 dark:bg-neutral-900/30 border border-dashed border-border">
                  {dayTasks.map((t) => (
                    <div 
                      key={t.id} 
                      className={[
                        'p-2.5 rounded-xl text-[11px] leading-snug font-bold border transition-all duration-200',
                        t.status === 'DONE'
                          ? 'bg-success/5 border-success/15 text-success line-through opacity-70'
                          : 'bg-accent-subtle border-accent-border text-accent',
                      ].join(' ')}
                    >
                      <p className="line-clamp-2">{t.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Month View */}
      {view === 'month' && (
        <div className="overflow-x-auto no-scrollbar min-w-[768px] py-1">
          <div className="grid grid-cols-7 gap-2 mb-3">
            {['M','T','W','T','F','S','S'].map((d, i) => (
              <div key={i} className="text-center text-[10px] uppercase font-bold text-text-muted py-1 tracking-wider">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {getMonthDays(reference).map((day) => {
              const dayTasks = tasksForDay(day);
              const today = isToday(day);
              return (
                <div 
                  key={day.toISOString()} 
                  className={[
                    'min-h-[110px] p-2.5 rounded-2xl border flex flex-col',
                    today 
                      ? 'border-accent shadow-sm'
                      : 'border-border',
                  ].join(' ')}
                  style={{
                    background: 'var(--color-surface)',
                  }}
                >
                  <p 
                    className={[
                      'text-xs font-bold self-start mb-2 rounded-full w-5 h-5 flex items-center justify-center',
                      today ? 'text-text-onaccent font-black' : 'text-text-secondary',
                    ].join(' ')}
                    style={{
                      background: today ? 'var(--gradient-accent)' : undefined,
                    }}
                  >
                    {format(day, 'd')}
                  </p>
                  <div className="flex-1 flex flex-col gap-1 overflow-y-auto no-scrollbar">
                    {dayTasks.slice(0, 3).map((t) => (
                      <div 
                        key={t.id} 
                        className={[
                          'text-[9px] font-bold rounded-lg px-1.5 py-0.5 truncate border',
                          t.status === 'DONE'
                            ? 'bg-success/5 border-success/10 text-success opacity-70 line-through'
                            : 'bg-accent-subtle border-accent-border text-accent',
                        ].join(' ')}
                      >
                        {t.title}
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="text-[9px] text-text-muted font-bold pl-1.5">+{dayTasks.length - 3} more</div>
                    )}
                  </div>
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
    <Card variant="default" className="p-6 sm:p-8 animate-scale-in">
      <p className="text-lg sm:text-xl font-extrabold text-text-primary mb-6">
        {format(date, 'EEEE, MMMM d')}
      </p>
      {tasks.length === 0 ? (
        <p className="text-sm text-text-muted py-10 text-center font-bold">No tasks scheduled for this day</p>
      ) : (
        <div className="flex flex-col gap-3.5">
          {tasks.map((t) => (
            <div 
              key={t.id} 
              className="flex items-center gap-3.5 p-4 rounded-xl border"
              style={{
                background: 'var(--color-surface)',
                borderColor: 'var(--color-border-subtle)',
              }}
            >
              <button
                onClick={() => updateTask.mutate({ id: t.id, data: { status: t.status === 'DONE' ? 'TODO' : 'DONE' } })}
                className="shrink-0 tap-target"
              >
                {t.status === 'DONE' ? (
                  <CheckCircle2 size={22} className="text-success" />
                ) : (
                  <Circle size={22} className="text-text-muted hover:text-accent transition-colors" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className={[
                  'text-sm font-bold truncate transition-all duration-200',
                  t.status === 'DONE' ? 'line-through text-text-muted' : 'text-text-primary',
                ].join(' ')}>
                  {t.title}
                </p>
              </div>
              <PriorityBadge priority={t.priority} />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

