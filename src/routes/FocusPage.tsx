import { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';
import { Button } from '../components/ui/Button';
import type { FocusSessionDTO, CreateFocusSessionRequest, ListResponse } from '../../../shared/types';

type TimerMode = 'focus' | 'short_break' | 'long_break';
const DURATIONS: Record<TimerMode, number> = {
  focus: 25, short_break: 5, long_break: 15,
};

export function FocusPage() {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [secondsLeft, setSecondsLeft] = useState(DURATIONS.focus * 60);
  const [running, setRunning] = useState(false);
  const [startedAt, setStartedAt] = useState<string | null>(null);
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
            // Log completed session
            if (mode === 'focus' && startedAt) {
              logSession.mutate({ durationMin: DURATIONS.focus, startedAt, completed: true });
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

  const handleStartPause = () => {
    if (!running && !startedAt) setStartedAt(new Date().toISOString());
    setRunning((r) => !r);
  };

  const handleReset = () => {
    setRunning(false);
    setSecondsLeft(DURATIONS[mode] * 60);
    setStartedAt(null);
  };

  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
  const seconds = (secondsLeft % 60).toString().padStart(2, '0');
  const progress = 1 - secondsLeft / (DURATIONS[mode] * 60);
  const circumference = 2 * Math.PI * 90;

  const totalFocusMin = sessions?.data.filter((s) => s.completed).reduce((acc, s) => acc + s.durationMin, 0) ?? 0;

  return (
    <div className="p-4 md:p-6 max-w-md mx-auto flex flex-col items-center">
      <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2 mb-6 self-start">
        <Timer className="text-accent" size={24} /> Focus
      </h1>

      {/* Mode selector */}
      <div className="flex gap-2 mb-8 w-full">
        {(['focus', 'short_break', 'long_break'] as TimerMode[]).map((m) => (
          <button key={m} onClick={() => changeMode(m)}
            className={`flex-1 py-2 rounded-xl text-xs font-medium tap-target transition-colors ${
              mode === m ? 'bg-accent text-text-onaccent' : 'bg-surface text-text-muted'
            }`}
          >
            {m === 'focus' ? 'Focus' : m === 'short_break' ? 'Short Break' : 'Long Break'}
          </button>
        ))}
      </div>

      {/* Circular timer */}
      <div className="relative flex items-center justify-center mb-8">
        <svg width="220" height="220" className="-rotate-90">
          <circle cx="110" cy="110" r="90" fill="none" stroke="var(--color-surface)" strokeWidth="8" />
          <circle
            cx="110" cy="110" r="90" fill="none"
            stroke={mode === 'focus' ? 'var(--color-accent)' : 'var(--color-success)'}
            strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-5xl font-bold font-mono text-text-primary">{minutes}:{seconds}</span>
          <span className="text-sm text-text-muted mt-1 capitalize">{mode.replace('_', ' ')}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={handleReset}
          className="tap-target w-12 h-12 flex items-center justify-center rounded-full bg-surface text-text-muted hover:text-text-primary transition-colors"
        >
          <RotateCcw size={18} />
        </button>
        <Button
          onClick={handleStartPause}
          size="lg"
          className="w-32"
          leftIcon={running ? <Pause size={18} /> : <Play size={18} />}
        >
          {running ? 'Pause' : 'Start'}
        </Button>
      </div>

      {/* Stats */}
      <div className="glass rounded-xl p-4 w-full">
        <p className="text-sm font-medium text-text-muted mb-3">Today's sessions</p>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-text-primary">{sessions?.meta.total ?? 0}</p>
            <p className="text-xs text-text-muted">Sessions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-text-primary">{totalFocusMin}</p>
            <p className="text-xs text-text-muted">Minutes</p>
          </div>
        </div>
      </div>
    </div>
  );
}