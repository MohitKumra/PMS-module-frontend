import React from 'react';
import {
  CheckSquare,
  Target,
  Timer,
  Flame,
  Sparkles,
  Settings,
  Activity,
  Award,
  MoreVertical,
  Zap,
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Card } from '../components/ui/Card';
import { LoadingScreen } from '../components/ui/Spinner';
import { useAuthStore } from '../store/authStore';
import { useTasks } from '../features/tasks/hooks/useTasks';
import { useHabits } from '../features/habits/hooks/useHabits';
import { useDashboardSummary, useDashboardToday } from '../features/dashboard/hooks/useDashboard';

interface ActivityItem {
  id: string;
  type: 'task' | 'habit' | 'streak' | 'achievement';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
  color: 'accent' | 'success' | 'warning' | 'danger' | 'info';
}

// ============================================================================
// ACTIVITY FEED
// ============================================================================

interface ActivityFeedProps {
  activities: ActivityItem[];
}

function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card variant="default" className="overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div 
        className="px-6 py-5 border-b flex items-center justify-between"
        style={{ borderColor: 'var(--color-border-subtle)' }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: 'var(--icon-bg-accent)',
              color: 'var(--icon-text-accent)',
            }}
          >
            <Activity size={18} />
          </div>
          <h3 className="text-base font-bold text-text-primary">Recent Activity</h3>
        </div>
        <button className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-text-muted transition-colors">
          <MoreVertical size={16} />
        </button>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto no-scrollbar max-h-[360px] flex-1">
        {activities.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-xs text-text-muted">No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="px-6 py-4.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
              <div className="flex gap-4">
                {/* Icon */}
                <div 
                  className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: `var(--icon-bg-${activity.color})`,
                    color: `var(--icon-text-${activity.color})`,
                  }}
                >
                  {activity.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className="text-sm font-bold text-text-primary truncate">{activity.title}</h4>
                    <span className="text-[10px] font-bold text-text-muted flex-shrink-0">{activity.timestamp}</span>
                  </div>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">{activity.description}</p>

                  {/* Type badge */}
                  <div className="mt-2.5">
                    <span 
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        background: `var(--icon-bg-${activity.color})`,
                        color: `var(--icon-text-${activity.color})`,
                      }}
                    >
                      {activity.type}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div 
        className="px-6 py-4.5 border-t text-center shrink-0"
        style={{ 
          background: 'var(--color-surface-raised)',
          borderColor: 'var(--color-border-subtle)',
        }}
      >
        <button className="text-xs font-bold text-accent hover:text-accent-hover transition-colors">
          View All Activity →
        </button>
      </div>
    </Card>
  );
}

// ============================================================================
// QUICK ACTIONS
// ============================================================================

function QuickActions() {
  const actions = [
    { label: 'New Task', icon: <CheckSquare size={16} />, color: 'accent' },
    { label: 'Log Habit', icon: <Target size={16} />, color: 'success' },
    { label: 'Start Focus', icon: <Zap size={16} />, color: 'danger' },
    { label: 'Settings', icon: <Settings size={16} />, color: 'info' },
  ];

  return (
    <Card variant="default" className="p-6">
      <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, idx) => (
          <button
            key={idx}
            className={[
              'flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-bold text-sm hover:shadow-md transition-all duration-200 active:scale-95 border border-transparent tap-target',
            ].join(' ')}
            style={{
              background: `var(--gradient-${action.color})`,
            }}
          >
            {action.icon}
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}

// ============================================================================
// MAIN DASHBOARD
// ============================================================================

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

export function DashboardPage() {
  const { user } = useAuthStore();
  const { data: summary, isLoading: loadingSummary } = useDashboardSummary();
  const { data: today, isLoading: loadingToday } = useDashboardToday();
  const { data: tasksData } = useTasks();
  const { data: habitsData } = useHabits();

  // Build activity feed from recent tasks and habits
  const activities: ActivityItem[] = React.useMemo(() => {
    // Add recent completed tasks
    const tasks = tasksData?.data ?? [];
    const completedTasks = tasks
      .filter((t) => t.status === 'DONE')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3)
      .map((task) => ({
        id: `task-${task.id}`,
        type: 'task' as const,
        title: `Completed: ${task.title}`,
        description: task.description ?? 'Task marked as done',
        timestamp: formatTimeAgo(new Date(task.updatedAt)),
        icon: <CheckSquare size={16} />,
        color: 'accent' as const,
      }));
    
    // Add recent habit streaks
    const habits = habitsData?.data ?? [];
    const streakHabits = habits
      .filter((h) => h.currentStreak > 0)
      .sort((a, b) => b.currentStreak - a.currentStreak)
      .slice(0, 2)
      .map((habit) => ({
        id: `streak-${habit.id}`,
        type: 'streak' as const,
        title: `Streak: ${habit.currentStreak} days`,
        description: `${habit.title} habit streak`,
        timestamp: 'Today',
        icon: <Flame size={16} />,
        color: 'warning' as const,
      }));

    return [...completedTasks, ...streakHabits];
  }, [tasksData?.data, habitsData?.data]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loadingSummary || loadingToday) {
    return <LoadingScreen />;
  }

  // Calculate stats from real data
  const taskCompletionRate = summary?.taskCompletionRate ?? 0;
  const focusTimePercent = Math.min(100, (summary?.focusMinutesTotal ?? 0) / 300 * 100); // Assuming 300 min = 100%
  const habitStreakPercent = summary?.habitsTotal ? (summary.longestHabitStreak / (summary.habitsTotal * 7)) * 100 : 0;

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-6xl mx-auto">
      {/* Welcome Section */}
      <PageHeader
        icon={<Sparkles size={24} />}
        title={`${greeting()}, ${user?.name ? user.name.split(' ')[0] : 'User'}`}
        subtitle={new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })}
      />

      {/* Status Banner */}
      <div 
        className="border rounded-2xl p-5 sm:p-6 shadow-sm overflow-hidden relative"
        style={{
          background: 'var(--color-accent-subtle)',
          borderColor: 'var(--color-accent-border)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <h3 className="font-bold text-base text-accent mb-1 leading-tight">Today's Overview</h3>
            <p className="text-sm text-text-secondary">
              You have <span className="font-extrabold text-text-primary">{today?.pendingTasks ?? 0} pending tasks</span> and{' '}
              <span className="font-extrabold text-text-primary">{today?.habitsToComplete ?? 0} habits to complete</span> today
            </p>
          </div>
          <button className="px-5 py-2.5 rounded-xl font-bold text-xs text-text-onaccent transition-all shrink-0 hover:shadow-md tap-target" style={{ background: 'var(--gradient-accent)' }}>
            View Details
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5 stagger">
        <StatCard
          icon={<CheckSquare size={20} />}
          label="Tasks This Week"
          value={`${summary?.tasksCompleted ?? 0}/${summary?.tasksTotal ?? 0}`}
          change={summary?.taskCompletionRate ?? 0}
          color="accent"
          isLive
        />
        <StatCard
          icon={<Target size={20} />}
          label="Habits Today"
          value={`${summary?.habitsCompletedToday ?? 0}/${summary?.habitsTotal ?? 0}`}
          change={summary?.habitsTotal ? Math.round((summary.habitsCompletedToday / summary.habitsTotal) * 100) : 0}
          color="success"
          isLive
        />
        <StatCard
          icon={<Flame size={20} />}
          label="Best Streak"
          value={`${summary?.longestHabitStreak ?? 0}d`}
          change={0}
          color="warning"
        />
        <StatCard
          icon={<Timer size={20} />}
          label="Focus Time"
          value={`${summary?.focusMinutesTotal ?? 0}m`}
          change={summary?.focusSessionsTotal ?? 0}
          color="info"
          isLive
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Activity Feed - Takes 2 columns */}
        <div className="lg:col-span-2">
          <ActivityFeed activities={activities} />
        </div>

        {/* Sidebar Widgets */}
        <div className="flex flex-col gap-6 sm:gap-8">
          {/* Quick Actions */}
          <QuickActions />

          {/* Weekly Summary */}
          <Card variant="default" className="p-6">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-5">Weekly Summary</h3>
            <div className="flex flex-col gap-4">
              <ProgressBar value={taskCompletionRate} color="accent" size="sm" showLabel label="Completion Rate" />
              <ProgressBar value={Math.min(100, habitStreakPercent)} color="success" size="sm" showLabel label="Habit Streak" />
              <ProgressBar value={Math.min(100, focusTimePercent)} color="info" size="sm" showLabel label="Focus Time" />
            </div>
          </Card>

          {/* Goal Progress - from habits */}
          <Card variant="default" className="p-6">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">Monthly Goals</h3>
            <div className="flex flex-col gap-4.5">
              {(habitsData?.data ?? []).slice(0, 3).map((habit) => (
                <div key={habit.id} className="flex items-start gap-3">
                  <div 
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" 
                    style={{ 
                      background: habit.currentStreak > 0 ? 'var(--icon-bg-success)' : 'var(--icon-bg-accent)',
                      color: habit.currentStreak > 0 ? 'var(--icon-text-success)' : 'var(--icon-text-accent)'
                    }}
                  >
                    <Award size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-text-primary truncate">{habit.title}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {habit.completionsThisWeek}/{habit.targetPerWeek} completed this week
                      {habit.currentStreak > 0 && ` • ${habit.currentStreak}d streak`}
                    </p>
                  </div>
                </div>
              ))}
              {(habitsData?.data?.length ?? 0) === 0 && (
                <p className="text-xs text-text-muted">No habits tracked yet. Add habits to see your progress here.</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div 
        className="mt-6 pt-6 border-t text-center"
        style={{ borderColor: 'var(--color-border-subtle)' }}
      >
        <p className="text-[11px] font-bold text-text-muted tracking-wider uppercase">
          Last updated: {new Date().toLocaleTimeString()} • Live sync enabled
        </p>
      </div>
    </div>
  );
}

export default DashboardPage;