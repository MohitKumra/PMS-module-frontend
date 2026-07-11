import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Target,
  Plus,
  Flame,
  TrendingUp,
  TrendingDown,
  Trophy,
  CalendarCheck2,
  Search,
} from 'lucide-react';
import { useHabits, useCreateHabit } from '../features/habits/hooks/useHabits';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingScreen } from '../components/ui/Spinner';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { Card } from '../components/ui/Card';
import { HabitCard } from '../components/habits/HabitCard';
import { getCategory } from '../features/habits/Habitpresentation';
import type { HabitDTO } from '../types';

type HabitFilter = 'all' | 'pending' | 'completed' | 'streaks';
type HabitSort = 'streak' | 'name' | 'progress';

function StatCard({
  icon, label, value, sub, accent,
}: {
  icon: React.ReactNode; label: string; value: string; sub?: React.ReactNode; accent: string;
}) {
  return (
    <Card variant="default" className="p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `color-mix(in srgb, ${accent} 14%, transparent)`, color: accent }}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted truncate">{label}</p>
          <p className="text-xl font-black text-text-primary leading-tight">{value}</p>
        </div>
      </div>
      {sub && <div className="mt-2.5 pt-2.5 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>{sub}</div>}
    </Card>
  );
}

interface TravelStyle extends React.CSSProperties {
  '--start-x'?: string;
  '--start-y'?: string;
  '--end-x'?: string;
  '--end-y'?: string;
  '--end-scale'?: string;
}

export function HabitsPage() {
  const { data, isLoading } = useHabits();
  const createHabit = useCreateHabit();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [targetPerWeek, setTargetPerWeek] = useState(7);
  const [reminderTime, setReminderTime] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<HabitFilter>('all');
  const [sort, setSort] = useState<HabitSort>('streak');

  // --- Traveling highlight for filter tabs --------------------------------
  const tabRefs = useRef<Record<HabitFilter, HTMLButtonElement | null>>({
    all: null, pending: null, completed: null, streaks: null,
  });
  const prevActiveRect = useRef<DOMRect | null>(null);
  const [travelStyle, setTravelStyle] = useState<TravelStyle | null>(null);
  const [travelKey, setTravelKey] = useState(0);

  const handleFilterClick = (f: HabitFilter) => {
    if (f === filter) return;
    const oldBtn = tabRefs.current[filter];
    prevActiveRect.current = oldBtn ? oldBtn.getBoundingClientRect() : null;
    setFilter(f);
  };

  useEffect(() => {
    const newBtn = tabRefs.current[filter];
    const prevRect = prevActiveRect.current;
    if (newBtn && prevRect) {
      const newRect = newBtn.getBoundingClientRect();
      const startX = prevRect.left + prevRect.width / 2;
      const startY = prevRect.top + prevRect.height / 2;
      const endX = newRect.left + newRect.width / 2;
      const endY = newRect.top + newRect.height / 2;
      const baseSize = 20;
      setTravelStyle({
        left: 0,
        top: 0,
        width: baseSize,
        height: baseSize,
        marginLeft: -baseSize / 2,
        marginTop: -baseSize / 2,
        background: 'var(--gradient-accent)',
        '--start-x': `${startX}px`,
        '--start-y': `${startY}px`,
        '--end-x': `${endX}px`,
        '--end-y': `${endY}px`,
        '--end-scale': `${Math.max(newRect.width, newRect.height) / baseSize}`,
      });
      setTravelKey((k) => k + 1);
      prevActiveRect.current = null;
    }
  }, [filter]);
  // -------------------------------------------------------------------------

  const habits = data?.data ?? [];
  const completedToday = habits.filter((h) => h.completedToday).length;

  const activeStreaks = habits.filter((h) => h.currentStreak > 0).length;
  const weeklyRate =
    habits.length > 0
      ? Math.round(
          (habits.reduce((sum, h) => sum + h.completionsThisWeek / Math.max(h.targetPerWeek, 1), 0) /
            habits.length) *
            100
        )
      : 0;
  const weeklyTrend = data?.meta.weeklyTrend ?? 0;

  const longestStreakHabit = useMemo(() => {
    if (habits.length === 0) return null;
    return habits.reduce<{ habit: HabitDTO; streak: number } | null>((best, h) => {
      if (!best || h.bestStreak > best.streak) return { habit: h, streak: h.bestStreak };
      return best;
    }, null);
  }, [habits]);

  const filteredHabits = useMemo(() => {
    let list = habits.filter((h) => h.title.toLowerCase().includes(searchQuery.toLowerCase()));

    switch (filter) {
      case 'pending': list = list.filter((h) => !h.completedToday); break;
      case 'completed': list = list.filter((h) => h.completedToday); break;
      case 'streaks': list = list.filter((h) => h.currentStreak > 0); break;
    }

    const sorted = [...list];
    switch (sort) {
      case 'name':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'progress':
        sorted.sort(
          (a, b) => b.completionsThisWeek / Math.max(b.targetPerWeek, 1) - a.completionsThisWeek / Math.max(a.targetPerWeek, 1)
        );
        break;
      default:
        sorted.sort((a, b) => b.currentStreak - a.currentStreak);
    }
    return sorted;
  }, [habits, searchQuery, filter, sort]);

  const filterCounts = {
    all: habits.length,
    pending: habits.filter((h) => !h.completedToday).length,
    completed: habits.filter((h) => h.completedToday).length,
    streaks: habits.filter((h) => h.currentStreak > 0).length,
  };

  const previewCategory = title.trim() ? getCategory(title) : null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createHabit.mutate(
      { title, targetPerWeek, reminderTime: reminderTime || undefined },
      {
        onSuccess: () => {
          setShowCreate(false);
          setTitle(''); setTargetPerWeek(7); setReminderTime('');
        }
      }
    );
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 sm:gap-8">
      <PageHeader
        icon={<Target size={24} />}
        title="Habits"
        subtitle={`${completedToday}/${habits.length} habits completed today`}
        action={
          <Button onClick={() => setShowCreate(true)} leftIcon={<Plus size={16} />} id="create-habit-btn">
            New Habit
          </Button>
        }
      />

      {habits.length > 0 && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard icon={<CalendarCheck2 size={18} />} label="Today" value={`${completedToday}/${habits.length}`} accent="var(--color-accent)" />
            <StatCard icon={<Flame size={18} />} label="Active Streaks" value={String(activeStreaks)} accent="var(--color-warning)" />
            <StatCard
              icon={weeklyTrend >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
              label="Weekly Rate"
              value={`${weeklyRate}%`}
              accent={weeklyTrend >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}
              sub={
                <p className="text-[11px] font-bold flex items-center gap-1" style={{ color: weeklyTrend >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  {weeklyTrend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {weeklyTrend >= 0 ? '+' : ''}{weeklyTrend}% vs last week
                </p>
              }
            />
            <StatCard
              icon={<Trophy size={18} />}
              label="Longest Streak"
              value={longestStreakHabit ? `${longestStreakHabit.streak}d` : '—'}
              accent="var(--color-info)"
              sub={longestStreakHabit && (
                <p className="text-[11px] font-bold text-text-muted truncate">{longestStreakHabit.habit.title}</p>
              )}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search habits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs font-bold border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {(['all', 'pending', 'completed', 'streaks'] as HabitFilter[]).map((f) => {
                const isActive = filter === f;
                return (
                  <button
                    key={f}
                    ref={(el) => { tabRefs.current[f] = el; }}
                    onClick={() => handleFilterClick(f)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      isActive ? 'text-white shadow-sm' : 'text-text-muted hover:text-text-primary'
                    }`}
                    style={
                      isActive
                        ? { background: 'var(--gradient-accent)' }
                        : { background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)' }
                    }
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                    <span className="ml-1.5 opacity-75">({filterCounts[f]})</span>
                  </button>
                );
              })}
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as HabitSort)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-accent transition-all shrink-0"
              style={{ background: 'var(--color-surface-raised)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              <option value="streak">Sort: Streak</option>
              <option value="name">Sort: Name</option>
              <option value="progress">Sort: Progress</option>
            </select>
          </div>
        </>
      )}

      {habits.length === 0 ? (
        <EmptyState
          icon={<Target size={32} />}
          title="No habits tracked"
          description="Start building consistency by adding your first daily habit above."
          action={<Button onClick={() => setShowCreate(true)} leftIcon={<Plus size={16} />}>Add Habit</Button>}
        />
      ) : filteredHabits.length === 0 ? (
        <Card variant="default" className="p-12 text-center">
          <p className="text-sm font-bold text-text-primary mb-1">No habits match this view</p>
          <p className="text-xs text-text-muted">Try a different filter or search term.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-4.5 stagger animate-fade-in">
          {filteredHabits.map((h) => <HabitCard key={h.id} habit={h} />)}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Habit">
        <form onSubmit={handleCreate} className="flex flex-col gap-6 pt-2">
          <div>
            <Input id="habit-title" label="Habit name" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Read 30 minutes" />
            {previewCategory && (
              <div className="flex items-center gap-1.5 mt-2">
                <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: previewCategory.bg, color: previewCategory.color }}>
                  <previewCategory.icon size={11} />
                </div>
                <p className="text-[11px] font-bold text-text-muted">
                  Detected category: <span style={{ color: previewCategory.color }}>{previewCategory.name}</span>
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Days per week target</label>
            <div className="flex gap-2">
              {[1,2,3,4,5,6,7].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setTargetPerWeek(n)}
                  className={[
                    'flex-1 py-3.5 rounded-xl text-base font-extrabold transition-all border tap-target',
                    targetPerWeek === n
                      ? 'text-text-onaccent shadow-sm border-transparent'
                      : 'bg-surface border-border text-text-secondary hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-text-primary'
                  ].join(' ')}
                  style={{ background: targetPerWeek === n ? 'var(--gradient-accent)' : undefined }}
                >{n}</button>
              ))}
            </div>
          </div>
          <Input id="habit-reminder" label="Reminder time (optional)" type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} />
          <Button type="submit" fullWidth loading={createHabit.isPending} className="mt-2">Create Habit</Button>
        </form>
      </Modal>

      {travelStyle &&
        createPortal(
          <div
            key={travelKey}
            className="filter-highlight-travel"
            style={travelStyle}
            onAnimationEnd={() => setTravelStyle(null)}
          />,
          document.body
        )}
    </div>
  );
}

export default HabitsPage;