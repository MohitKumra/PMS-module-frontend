import React, { useState } from 'react';
import { Target, Plus, Trash2, Flame, CheckCircle2, Circle } from 'lucide-react';
import { useHabits, useCreateHabit, useToggleHabit, useDeleteHabit } from '../features/habits/hooks/useHabits';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingScreen } from '../components/ui/Spinner';
import type { HabitDTO } from '../types';

function HabitCard({ habit }: { habit: HabitDTO }) {
  const toggle = useToggleHabit();
  const remove = useDeleteHabit();

  const progress = Math.min((habit.completionsThisWeek / habit.targetPerWeek) * 100, 100);

  return (
    <div className="glass rounded-xl p-4 animate-fade-in group">
      <div className="flex items-start gap-3">
        <button
          onClick={() => toggle.mutate(habit.id)}
          className="tap-target shrink-0 mt-0.5"
          aria-label={habit.completedToday ? 'Unmark today' : 'Mark done today'}
        >
          {habit.completedToday
            ? <CheckCircle2 size={22} className="text-success" />
            : <Circle size={22} className="text-text-muted group-hover:text-accent" />
          }
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`text-sm font-medium ${habit.completedToday ? 'text-success' : 'text-text-primary'}`}>
              {habit.title}
            </p>
            {habit.currentStreak > 0 && (
              <span className="flex items-center gap-1 text-xs text-warning font-medium">
                <Flame size={12} /> {habit.currentStreak}d
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-2 mb-1">
            <div className="flex justify-between text-xs text-text-muted mb-1">
              <span>{habit.completionsThisWeek}/{habit.targetPerWeek} this week</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {habit.reminderTime && (
            <p className="text-xs text-text-muted">⏰ {habit.reminderTime}</p>
          )}
        </div>

        <button
          onClick={() => remove.mutate(habit.id)}
          className="tap-target opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-all"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
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
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Target className="text-accent" size={24} /> Habits
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            {completedToday}/{habits.length} done today
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} leftIcon={<Plus size={16} />} id="create-habit-btn">
          New Habit
        </Button>
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <Target size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No habits yet</p>
          <p className="text-sm mt-1">Build your first daily habit</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 stagger">
          {habits.map((h) => <HabitCard key={h.id} habit={h} />)}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Habit">
        <form onSubmit={handleCreate} className="flex flex-col gap-4 pt-2">
          <Input id="habit-title" label="Habit name" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Read 30 minutes" />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-muted">Days per week target</label>
            <div className="flex gap-2">
              {[1,2,3,4,5,6,7].map((n) => (
                <button key={n} type="button" onClick={() => setTargetPerWeek(n)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium tap-target transition-colors ${
                    targetPerWeek === n ? 'bg-accent text-text-onaccent' : 'bg-surface text-text-muted'
                  }`}
                >{n}</button>
              ))}
            </div>
          </div>
          <Input id="habit-reminder" label="Reminder time (optional)" type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} />
          <Button type="submit" fullWidth loading={createHabit.isPending}>Create Habit</Button>
        </form>
      </Modal>
    </div>
  );
}