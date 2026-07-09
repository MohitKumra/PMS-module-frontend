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

interface ActivityItem {
  id: string;
  type: 'task' | 'habit' | 'streak' | 'achievement';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
  color: 'accent' | 'success' | 'warning' | 'danger' | 'info';
}

interface StatItem {
  id: string;
  label: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: 'accent' | 'success' | 'warning' | 'danger' | 'info';
  isLive?: boolean;
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
        {activities.map((activity) => (
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
        ))}
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

export function DashboardPage() {
  const user = {
    name: 'Gaurav Kumar',
    email: 'gaurav@gmail.com',
  };

  // Mock stats
  const stats: StatItem[] = [
    {
      id: '1',
      label: 'Tasks This Week',
      value: '8/12',
      change: 12,
      icon: <CheckSquare size={20} />,
      color: 'accent',
      isLive: true,
    },
    {
      id: '2',
      label: 'Habits Today',
      value: '5/7',
      change: 8,
      icon: <Target size={20} />,
      color: 'success',
      isLive: true,
    },
    {
      id: '3',
      label: 'Best Streak',
      value: '42d',
      change: -2,
      icon: <Flame size={20} />,
      color: 'warning',
      isLive: false,
    },
    {
      id: '4',
      label: 'Focus Time',
      value: '185m',
      change: 24,
      icon: <Timer size={20} />,
      color: 'info',
      isLive: true,
    },
  ];

  // Mock activity
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'task',
      title: 'Completed: Design Landing Page',
      description: 'Marked as done after 2 hours of focused work',
      timestamp: '2 hours ago',
      icon: <CheckSquare size={16} />,
      color: 'accent',
    },
    {
      id: '2',
      type: 'streak',
      title: 'Streak Milestone: 42 Days!',
      description: 'Meditation habit streak reached 42 consecutive days',
      timestamp: '5 hours ago',
      icon: <Flame size={16} />,
      color: 'warning',
    },
    {
      id: '3',
      type: 'habit',
      title: 'Logged: Morning Workout',
      description: 'Completed 45 minutes of cardio and strength training',
      timestamp: '8 hours ago',
      icon: <Target size={16} />,
      color: 'success',
    },
    {
      id: '4',
      type: 'achievement',
      title: 'Achievement Unlocked: Perfect Day',
      description: 'Completed all tasks and habits for today',
      timestamp: 'Yesterday',
      icon: <Award size={16} />,
      color: 'info',
    },
    {
      id: '5',
      type: 'task',
      title: 'Created: Q3 Planning Document',
      description: 'Added to Tasks list with priority high',
      timestamp: '2 days ago',
      icon: <CheckSquare size={16} />,
      color: 'accent',
    },
  ];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-6xl mx-auto">
      {/* Welcome Section */}
      <PageHeader
        icon={<Sparkles size={24} />}
        title={`${greeting()}, ${user.name ? user.name.split(' ')[0] : 'User'}`}
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
              You have <span className="font-extrabold text-text-primary">4 pending tasks</span> and{' '}
              <span className="font-extrabold text-text-primary">2 habits to complete</span> today
            </p>
          </div>
          <button className="px-5 py-2.5 rounded-xl font-bold text-xs text-text-onaccent transition-all shrink-0 hover:shadow-md tap-target" style={{ background: 'var(--gradient-accent)' }}>
            View Details
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5 stagger">
        {stats.map((stat) => (
          <StatCard
            key={stat.id}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            color={stat.color}
            isLive={stat.isLive}
          />
        ))}
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
              <ProgressBar value={78} color="accent" size="sm" showLabel label="Completion Rate" />
              <ProgressBar value={94} color="success" size="sm" showLabel label="Habit Streak" />
              <ProgressBar value={68} color="info" size="sm" showLabel label="Focus Time" />
            </div>
          </Card>

          {/* Goal Progress */}
          <Card variant="default" className="p-6">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">Monthly Goals</h3>
            <div className="flex flex-col gap-4.5">
              <div className="flex items-start gap-3">
                <div 
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" 
                  style={{ background: 'var(--icon-bg-success)', color: 'var(--icon-text-success)' }}
                >
                  <Award size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text-primary truncate">Exercise 4x/week</p>
                  <p className="text-xs text-text-muted mt-0.5">3/4 weeks completed</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div 
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" 
                  style={{ background: 'var(--icon-bg-accent)', color: 'var(--icon-text-accent)' }}
                >
                  <Award size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text-primary truncate">Read 1 hour/day</p>
                  <p className="text-xs text-text-muted mt-0.5">6/7 days completed</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div 
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" 
                  style={{ background: 'var(--icon-bg-warning)', color: 'var(--icon-text-warning)' }}
                >
                  <Award size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text-primary truncate">Meditate daily</p>
                  <p className="text-xs text-text-muted mt-0.5">42 consecutive days</p>
                </div>
              </div>
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
