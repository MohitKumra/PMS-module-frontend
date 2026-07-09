import React, { useState } from 'react';
import { Target, Plus, Trash2, Flame, CheckCircle2, Circle } from 'lucide-react';
import { useHabits, useCreateHabit, useToggleHabit, useDeleteHabit } from '../features/habits/hooks/useHabits';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingScreen } from '../components/ui/Spinner';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Card } from '../components/ui/Card';
import type { HabitDTO } from '../types';

function HabitCard({ habit }: { habit: HabitDTO }) {
  const toggle = useToggleHabit();
  const remove = useDeleteHabit();

  return (
    <Card
      variant="default"
      hoverable
      className="p-5 sm:p-6"
    >
      <div className="flex items-start gap-4">
        <button
          onClick={() => toggle.mutate(habit.id)}
          className="shrink-0 mt-0.5 tap-target animate-scale-in"
          aria-label={habit.completedToday ? 'Unmark today' : 'Mark done today'}
        >
          {habit.completedToday ? (
            <CheckCircle2 size={24} className="text-success" />
          ) : (
            <Circle size={24} className="text-text-muted hover:text-accent transition-colors" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <p className={[
              'text-base sm:text-lg font-bold transition-all duration-200',
              habit.completedToday ? 'text-success' : 'text-text-primary',
            ].join(' ')}>
              {habit.title}
            </p>
            {habit.currentStreak > 0 && (
              <span className="flex items-center gap-1 text-xs text-warning font-extrabold bg-warning/10 px-2 py-0.5 rounded-full animate-scale-in">
                <Flame size={14} /> {habit.currentStreak}d
              </span>
            )}
          </div>

          {/* Progress bar using our new component */}
          <div className="mt-4 mb-2">
            <ProgressBar
              value={habit.completionsThisWeek}
              max={habit.targetPerWeek}
              color="accent"
              size="sm"
              showLabel
              label={`${habit.completionsThisWeek}/${habit.targetPerWeek} completed this week`}
            />
          </div>

          {habit.reminderTime && (
            <p className="text-xs text-text-muted font-bold flex items-center gap-1.5 mt-2">
              ⏰ Reminds at {habit.reminderTime}
            </p>
          )}
        </div>

        <button
          onClick={() => remove.mutate(habit.id)}
          className="opacity-0 group-hover:opacity-100 p-2 rounded-xl hover:bg-red-500/10 text-red-500 hover:text-red-600 transition-all shrink-0 tap-target"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </Card>
  );
}

export function HabitsPage() {
  const { data, isLoading } = useHabits();
  const createHabit = useCreateHabit();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [targetPerWeek, setTargetPerWeek] = useState(7);
  const [reminderTime, setReminderTime] = useState('');

  const habits = data?.data ?? [];
  const completedToday = habits.filter((h) => h.completedToday).length;

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
      {/* Header */}
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

      {habits.length === 0 ? (
        <EmptyState
          icon={<Target size={32} />}
          title="No habits tracked"
          description="Start building consistency by adding your first daily habit above."
          action={
            <Button onClick={() => setShowCreate(true)} leftIcon={<Plus size={16} />}>
              Add Habit
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-4.5 stagger animate-fade-in">
          {habits.map((h) => <HabitCard key={h.id} habit={h} />)}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Habit">
        <form onSubmit={handleCreate} className="flex flex-col gap-6 pt-2">
          <Input id="habit-title" label="Habit name" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Read 30 minutes" />
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
                  style={{
                    background: targetPerWeek === n ? 'var(--gradient-accent)' : undefined,
                  }}
                >{n}</button>
              ))}
            </div>
          </div>
          <Input id="habit-reminder" label="Reminder time (optional)" type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} />
          <Button type="submit" fullWidth loading={createHabit.isPending} className="mt-2">Create Habit</Button>
        </form>
      </Modal>
    </div>
  );
}