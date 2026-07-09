import { BarChart2, TrendingUp, CheckCircle2, Flame, Timer, Target } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { LoadingScreen } from '../components/ui/Spinner';
import type { AnalyticsSummaryDTO, DailyAnalyticsDTO } from '../types';

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub?: string }) {
  return (
    <div className="glass rounded-xl p-4 flex items-center gap-4 animate-fade-in">
      <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-2xl font-bold text-text-primary">{value}</p>
        {sub && <p className="text-xs text-text-muted">{sub}</p>}
      </div>
    </div>
  );
}

export function AnalyticsPage() {
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: () => apiClient.get<AnalyticsSummaryDTO>('/analytics/summary').then((r) => r.data),
  });

  const { data: daily, isLoading: loadingDaily } = useQuery({
    queryKey: ['analytics', 'daily'],
    queryFn: () => apiClient.get<DailyAnalyticsDTO[]>('/analytics/daily').then((r) => r.data),
  });

  if (loadingSummary || loadingDaily) return <LoadingScreen />;

  const chartData = (daily ?? []).slice(-14).map((d) => ({
    date: d.date.slice(5), // "MM-DD"
    Tasks: d.tasksCompleted,
    Habits: d.habitsCompleted,
    Focus: d.focusMinutes,
  }));

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2 mb-6">
        <BarChart2 className="text-accent" size={24} /> Analytics
      </h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8 stagger">
        <StatCard icon={<CheckCircle2 size={20} />} label="Tasks Completed" value={summary?.tasksCompleted ?? 0}
          sub={`${summary?.taskCompletionRate ?? 0}% completion rate`} />
        <StatCard icon={<Target size={20} />} label="Habits Today" value={`${summary?.habitsCompletedToday ?? 0}/${summary?.habitsTotal ?? 0}`} />
        <StatCard icon={<Flame size={20} />} label="Best Streak" value={`${summary?.longestHabitStreak ?? 0}d`} />
        <StatCard icon={<Timer size={20} />} label="Focus Minutes" value={summary?.focusMinutesTotal ?? 0} sub={`${summary?.focusSessionsTotal ?? 0} sessions`} />
        <StatCard icon={<TrendingUp size={20} />} label="Total Tasks" value={summary?.tasksTotal ?? 0} />
      </div>

      {/* Tasks & Habits chart */}
      <div className="glass rounded-xl p-4 mb-4">
        <p className="text-sm font-medium text-text-primary mb-4">Tasks & Habits — Last 14 Days</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="gTasks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" style={{ stopColor: 'var(--color-accent)', stopOpacity: 0.3 }} />
                <stop offset="95%" style={{ stopColor: 'var(--color-accent)', stopOpacity: 0 }} />
              </linearGradient>
              <linearGradient id="gHabits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" style={{ stopColor: 'var(--color-success)', stopOpacity: 0.3 }} />
                <stop offset="95%" style={{ stopColor: 'var(--color-success)', stopOpacity: 0 }} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 8 }} labelStyle={{ color: 'var(--color-text-primary)' }} />
            <Area type="monotone" dataKey="Tasks" stroke="var(--color-accent)" fill="url(#gTasks)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="Habits" stroke="var(--color-success)" fill="url(#gHabits)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Focus minutes chart */}
      <div className="glass rounded-xl p-4">
        <p className="text-sm font-medium text-text-primary mb-4">Focus Minutes — Last 14 Days</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 8 }} labelStyle={{ color: 'var(--color-text-primary)' }} />
            <Bar dataKey="Focus" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}