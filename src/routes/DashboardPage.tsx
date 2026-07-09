import { CheckSquare, Target, Timer, Flame, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';
import { useAuthStore } from '../store/authStore';
import { useTasks } from '../features/tasks/hooks/useTasks';
import { useHabits } from '../features/habits/hooks/useHabits';
import { LoadingScreen } from '../components/ui/Spinner';
import { formatDate } from '../lib/dateUtils';
import type { AnalyticsSummaryDTO } from '../../../shared/types';

function QuickStat({ icon, label, value, to, color = 'text-accent' }: {
  icon: React.ReactNode; label: string; value: string | number; to: string; color?: string;
}) {
  return (
    <Link to={to} className="glass rounded-xl p-4 flex items-center gap-4 hover:border-accent/40 transition-all group animate-fade-in">
      <div className={`${color} text-2xl font-bold w-10 flex items-center justify-center shrink-0`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-2xl font-bold text-text-primary">{value}</p>
      </div>
      <ArrowRight size={16} className="text-text-muted group-hover:text-accent transition-colors" />
    </Link>
  );
}

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: habits, isLoading: habitsLoading } = useHabits();
  const { data: summary } = useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: () => apiClient.get<AnalyticsSummaryDTO>('/analytics/summary').then((r) => r.data),
  });

  const todayTasks = tasks?.data.filter((t) => {
    if (!t.dueDate) return false;
    return formatDate(t.dueDate) === 'Today';
  }) ?? [];

  const pendingToday = todayTasks.filter((t) => t.status !== 'DONE').length;
  const habitsToday = habits?.data.filter((h) => !h.completedToday).length ?? 0;
  const longestStreak = Math.max(0, ...(habits?.data.map((h) => h.currentStreak) ?? [0]));

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (tasksLoading || habitsLoading) return <LoadingScreen />;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      {/* Greeting */}
      <div className="mb-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
            <Zap size={20} className="text-text-onaccent" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">
              {greeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋
            </h1>
            <p className="text-sm text-text-muted">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Today's focus banner */}
      {(pendingToday > 0 || habitsToday > 0) && (
        <div className="glass rounded-xl p-4 mb-6 border-l-4 border-accent animate-fade-in">
          <p className="text-sm font-semibold text-text-primary mb-1">Today's focus</p>
          <p className="text-sm text-text-muted">
            {pendingToday > 0 && <span>{pendingToday} task{pendingToday !== 1 ? 's' : ''} due today</span>}
            {pendingToday > 0 && habitsToday > 0 && ' · '}
            {habitsToday > 0 && <span>{habitsToday} habit{habitsToday !== 1 ? 's' : ''} remaining</span>}
          </p>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 stagger">
        <QuickStat
          icon={<CheckSquare size={22} />}
          label="Tasks this week"
          value={`${summary?.tasksCompleted ?? 0}/${summary?.tasksTotal ?? 0}`}
          to="/tasks"
        />
        <QuickStat
          icon={<Target size={22} />}
          label="Habits today"
          value={`${summary?.habitsCompletedToday ?? 0}/${summary?.habitsTotal ?? 0}`}
          to="/habits"
          color="text-success"
        />
        <QuickStat
          icon={<Flame size={22} />}
          label="Best streak"
          value={`${longestStreak}d`}
          to="/habits"
          color="text-warning"
        />
        <QuickStat
          icon={<Timer size={22} />}
          label="Focus minutes"
          value={summary?.focusMinutesTotal ?? 0}
          to="/focus"
          color="text-accent"
        />
      </div>

      {/* Today's tasks */}
      {todayTasks.length > 0 && (
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-text-primary">Due Today</p>
            <Link to="/tasks" className="text-xs text-accent hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {todayTasks.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center gap-2 text-sm">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  t.status === 'DONE' ? 'bg-success' : 'bg-accent'
                }`} />
                <span className={t.status === 'DONE' ? 'line-through text-text-muted' : 'text-text-primary'}>
                  {t.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}