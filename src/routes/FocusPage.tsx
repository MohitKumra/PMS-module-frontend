import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Timer, Play, Pause, RotateCcw, Maximize2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';
import { TabBar } from '../components/ui/TabBar';
import { Card } from '../components/ui/Card';
import { FullScreenFocus } from '../components/focus/FullScreenFocus';
import type { FocusSessionDTO, CreateFocusSessionRequest, ListResponse } from '../types';

type TimerMode = 'focus' | 'short_break' | 'long_break';
const DURATIONS: Record<TimerMode, number> = {
  focus: 25, short_break: 5, long_break: 15,
};

export function FocusPage() {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [secondsLeft, setSecondsLeft] = useState(DURATIONS.focus * 60);
  const [running, setRunning] = useState(false);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [fullScreen, setFullScreen] = useState(false);
  const [breaksTaken, setBreaksTaken] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const qc = useQueryClient();

  const { data: sessions } = useQuery({
    queryKey: ['focus'],
    queryFn: () => apiClient.get<ListResponse<FocusSessionDTO>>('/focus').then((r) => r.data),
  });

  const logSession = useMutation({
    mutationFn: (data: CreateFocusSessionRequest) =>
      apiClient.post<FocusSessionDTO>('/focus', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['focus'] }),
  });

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            if (mode === 'focus' && startedAt) {
              logSession.mutate({ durationMin: DURATIONS.focus, startedAt, completed: true });
            } else if (mode !== 'focus') {
              setBreaksTaken((b) => b + 1);
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const changeMode = (m: TimerMode) => {
    setMode(m);
    setSecondsLeft(DURATIONS[m] * 60);
    setRunning(false);
  };

  const handleStartPause = useCallback(() => {
    setRunning((r) => {
      if (!r) setStartedAt((s) => s ?? new Date().toISOString());
      return !r;
    });
  }, []);

  const handleReset = useCallback(() => {
    setRunning(false);
    setSecondsLeft(DURATIONS[mode] * 60);
    setStartedAt(null);
  }, [mode]);

  const exitFullScreen = useCallback(() => setFullScreen(false), []);

  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
  const seconds = (secondsLeft % 60).toString().padStart(2, '0');
  const progress = 1 - secondsLeft / (DURATIONS[mode] * 60);

  const totalFocusMin = sessions?.data.filter((s) => s.completed).reduce((acc, s) => acc + s.durationMin, 0) ?? 0;

  const fullScreenStats = useMemo(() => {
    const completed = sessions?.data.filter((s) => s.completed) ?? [];
    const todayKey = new Date().toDateString();
    const todaySessions = completed.filter((s) => new Date(s.startedAt).toDateString() === todayKey);

    // Longest streak of consecutive days with at least one completed session
    const dayMs = 24 * 60 * 60 * 1000;
    const days = [...new Set(completed.map((s) => {
      const d = new Date(s.startedAt);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    }))].sort((a, b) => a - b);
    let longest = days.length > 0 ? 1 : 0;
    let run = 1;
    for (let i = 1; i < days.length; i++) {
      run = days[i] - days[i - 1] === dayMs ? run + 1 : 1;
      longest = Math.max(longest, run);
    }

    return {
      sessionsToday: todaySessions.length,
      focusMinToday: todaySessions.reduce((acc, s) => acc + s.durationMin, 0),
      breaksTaken,
      longestStreakDays: longest,
    };
  }, [sessions, breaksTaken]);

  const modeTabs = [
    { id: 'focus', label: 'Focus' },
    { id: 'short_break', label: 'Short Break' },
    { id: 'long_break', label: 'Long Break' },
  ];

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center gap-6 sm:gap-8">
      {fullScreen && (
        <FullScreenFocus
          mode={mode}
          minutes={minutes}
          seconds={seconds}
          progress={progress}
          running={running}
          onStartPause={handleStartPause}
          onReset={handleReset}
          onExit={exitFullScreen}
          stats={fullScreenStats}
        />
      )}

      {/* Header */}
      <PageHeader
        icon={<Timer size={24} />}
        title="Focus Timer"
        subtitle="Stay productive using Pomodoro technique"
      />

      {/* Enter fullscreen focus mode */}
      <button
        onClick={() => setFullScreen(true)}
        className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-text-secondary transition-all hover:text-text-primary hover:bg-neutral-100 dark:hover:bg-neutral-800"
      >
        <Maximize2 size={15} />
        Focus Mode
      </button>

      {/* Mode Selector TabBar */}
      <TabBar
        tabs={modeTabs}
        activeTab={mode}
        onTabChange={(m) => changeMode(m as TimerMode)}
        variant="pill"
        className="w-full justify-center"
      />

      {/* Circular Timer Visuals */}
      <div 
        className="relative flex items-center justify-center my-6 animate-scale-in p-8 rounded-full transition-all duration-500"
        style={{
          boxShadow: running 
            ? (mode === 'focus' 
                ? '0 0 50px rgba(99, 102, 241, 0.25), inset 0 0 30px rgba(99, 102, 241, 0.15)' 
                : '0 0 50px rgba(52, 211, 153, 0.25), inset 0 0 30px rgba(52, 211, 153, 0.15)')
            : '0 10px 30px -10px rgba(0,0,0,0.08), inset 0 0 10px rgba(0,0,0,0.02)',
          background: 'var(--color-surface-raised)',
          border: '1px solid var(--color-border)',
        }}
      >
        <svg width="260" height="260" className="-rotate-90">
          <circle 
            cx="130" 
            cy="130" 
            r="105" 
            fill="none" 
            stroke="var(--color-border-subtle)" 
            strokeWidth="8" 
          />
          <circle
            cx="130" 
            cy="130" 
            r="105" 
            fill="none"
            stroke={mode === 'focus' ? 'var(--color-accent)' : 'var(--color-success)'}
            strokeWidth="10" 
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 105}
            strokeDashoffset={2 * Math.PI * 105 * (1 - progress)}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center select-none">
          <span className="text-5xl font-black font-mono text-text-primary tracking-tight">
            {minutes}:{seconds}
          </span>
          <span 
            className="text-[10px] font-black uppercase tracking-widest mt-2 px-2.5 py-0.5 rounded-full"
            style={{
              background: mode === 'focus' ? 'var(--icon-bg-accent)' : 'var(--icon-bg-success)',
              color: mode === 'focus' ? 'var(--icon-text-accent)' : 'var(--icon-text-success)',
            }}
          >
            {mode.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4.5">
        <button 
          onClick={handleReset}
          className="w-14 h-14 flex items-center justify-center rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-text-secondary hover:text-text-primary transition-all border border-border tap-target"
          aria-label="Reset timer"
        >
          <RotateCcw size={20} />
        </button>
        <Button
          onClick={handleStartPause}
          size="lg"
          className="w-44 shadow-lg shadow-accent/15 font-bold"
          leftIcon={running ? <Pause size={18} /> : <Play size={18} />}
        >
          {running ? 'Pause' : 'Start'}
        </Button>
      </div>

      {/* Stats Widget */}
      <Card variant="default" className="p-6 sm:p-8 w-full">
        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-5">Today's Focus Activity</p>
        <div className="flex items-center gap-8 divide-x" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <div className="text-center flex-1">
            <p className="text-3xl font-extrabold text-text-primary">{sessions?.meta.total ?? 0}</p>
            <p className="text-xs text-text-secondary font-bold uppercase tracking-wide mt-1.5">Sessions Completed</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-3xl font-extrabold text-text-primary">{totalFocusMin}</p>
            <p className="text-xs text-text-secondary font-bold uppercase tracking-wide mt-1.5">Minutes Logged</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
