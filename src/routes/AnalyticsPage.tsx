import { BarChart2, TrendingUp, CheckCircle2, Flame, Timer, Target } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { LoadingScreen } from '../components/ui/Spinner';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import type { AnalyticsSummaryDTO, DailyAnalyticsDTO } from '../types';

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
    <div className="max-w-5xl mx-auto flex flex-col gap-6 sm:gap-8">
      {/* Header */}
      <PageHeader
        icon={<BarChart2 size={24} />}
        title="Analytics"
        subtitle="Insights on your productivity metrics"
      />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5 stagger animate-fade-in">
        <StatCard 
          icon={<CheckCircle2 size={20} />} 
          label="Tasks Completed" 
          value={summary?.tasksCompleted ?? 0}
          sub={`${summary?.taskCompletionRate ?? 0}% completion rate`} 
          color="success" 
        />
        <StatCard 
          icon={<Target size={20} />} 
          label="Habits Today" 
          value={`${summary?.habitsCompletedToday ?? 0}/${summary?.habitsTotal ?? 0}`} 
          color="accent" 
        />
        <StatCard 
          icon={<Flame size={20} />} 
          label="Best Streak" 
          value={`${summary?.longestHabitStreak ?? 0}d`} 
          color="warning" 
        />
        <StatCard 
          icon={<Timer size={20} />} 
          label="Focus Minutes" 
          value={summary?.focusMinutesTotal ?? 0} 
          sub={`${summary?.focusSessionsTotal ?? 0} sessions`} 
          color="info" 
        />
        <StatCard 
          icon={<TrendingUp size={20} />} 
          label="Total Tasks" 
          value={summary?.tasksTotal ?? 0} 
          color="accent" 
        />
      </div>

      {/* Tasks & Habits chart */}
      <Card variant="default" className="p-6 sm:p-8 animate-scale-in">
        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-5">Tasks & Habits — Last 14 Days</p>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gTasks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gHabits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontWeight: 'bold' }} 
                axisLine={false} 
                tickLine={false} 
              />
              <YAxis 
                tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontWeight: 'bold' }} 
                axisLine={false} 
                tickLine={false} 
                allowDecimals={false} 
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'var(--color-surface-raised)', 
                  border: '1px solid var(--color-border)', 
                  borderRadius: 12, 
                  boxShadow: 'var(--shadow-md)' 
                }} 
                labelStyle={{ 
                  color: 'var(--color-text-primary)', 
                  fontWeight: 'bold',
                  fontSize: 12
                }} 
                itemStyle={{
                  fontSize: 12,
                  fontWeight: 'bold'
                }}
              />
              <Area type="monotone" dataKey="Tasks" stroke="var(--color-accent)" fill="url(#gTasks)" strokeWidth={3} dot={false} />
              <Area type="monotone" dataKey="Habits" stroke="var(--color-success)" fill="url(#gHabits)" strokeWidth={3} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Focus minutes chart */}
      <Card variant="default" className="p-6 sm:p-8 animate-scale-in">
        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-5">Focus Minutes — Last 14 Days</p>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontWeight: 'bold' }} 
                axisLine={false} 
                tickLine={false} 
              />
              <YAxis 
                tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontWeight: 'bold' }} 
                axisLine={false} 
                tickLine={false} 
                allowDecimals={false} 
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'var(--color-surface-raised)', 
                  border: '1px solid var(--color-border)', 
                  borderRadius: 12, 
                  boxShadow: 'var(--shadow-md)' 
                }} 
                labelStyle={{ 
                  color: 'var(--color-text-primary)', 
                  fontWeight: 'bold',
                  fontSize: 12
                }}
                itemStyle={{
                  fontSize: 12,
                  fontWeight: 'bold'
                }}
              />
              <Bar dataKey="Focus" fill="var(--color-accent)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}