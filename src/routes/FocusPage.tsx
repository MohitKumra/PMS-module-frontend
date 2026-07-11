import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Timer, Play, Pause, RotateCcw, Maximize2, X, Flame, CheckCircle2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';
import { TabBar } from '../components/ui/TabBar';
import { Card } from '../components/ui/Card';
import { useUIStore } from '../store/uiStore';
import type { FocusSessionDTO, CreateFocusSessionRequest, ListResponse } from '../types';

type TimerMode = 'focus' | 'short_break' | 'long_break';
const DURATIONS: Record<TimerMode, number> = {
  focus: 25, short_break: 5, long_break: 15,
};

const getModeColors = (mode: TimerMode) => {
  switch (mode) {
    case 'focus':
      return { primary: 'var(--color-accent)', subtle: 'var(--color-accent-subtle)', glow: 'color-mix(in srgb, var(--color-accent) 25%, transparent)' };
    case 'short_break':
      return { primary: 'var(--color-success)', subtle: 'color-mix(in srgb, var(--color-success) 15%, transparent)', glow: 'color-mix(in srgb, var(--color-success) 25%, transparent)' };
    case 'long_break':
      return { primary: 'var(--color-info)', subtle: 'color-mix(in srgb, var(--color-info) 15%, transparent)', glow: 'color-mix(in srgb, var(--color-info) 25%, transparent)' };
  }
};

function requestFullscreen(el: HTMLElement) {
  const anyEl = el as any;
  const fn = el.requestFullscreen || anyEl.webkitRequestFullscreen || anyEl.msRequestFullscreen;
  return fn ? fn.call(el) : Promise.reject(new Error('Fullscreen API unsupported'));
}
function exitFullscreen() {
  const anyDoc = document as any;
  const fn = document.exitFullscreen || anyDoc.webkitExitFullscreen || anyDoc.msExitFullscreen;
  return fn ? fn.call(document) : Promise.resolve();
}
function isFullscreenActive() {
  const anyDoc = document as any;
  return !!(document.fullscreenElement || anyDoc.webkitFullscreenElement || anyDoc.msFullscreenElement);
}

function ProgressRing({ size, progress, colors, running }: { size: number; progress: number; colors: ReturnType<typeof getModeColors>; running: boolean }) {
  const stroke = size > 200 ? 12 : 10;
  const r = size / 2 - stroke;
  const circumference = 2 * Math.PI * r;
  const tickCount = 24;

  return (
    <svg width={size} height={size} className="-rotate-90" style={{ filter: running ? `drop-shadow(0 0 18px ${colors.glow})` : 'none', transition: 'filter 600ms ease' }}>
      <defs>
        <linearGradient id={`ring-gradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.primary} stopOpacity="0.55" />
          <stop offset="100%" stopColor={colors.primary} stopOpacity="1" />
        </linearGradient>
      </defs>

      {Array.from({ length: tickCount }).map((_, i) => {
        const angle = (i / tickCount) * 2 * Math.PI;
        const inner = r - stroke / 2 - 4;
        const outer = r - stroke / 2 - 9;
        const cx = size / 2, cy = size / 2;
        return (
          <line
            key={i}
            x1={cx + inner * Math.cos(angle)}
            y1={cy + inner * Math.sin(angle)}
            x2={cx + outer * Math.cos(angle)}
            y2={cy + outer * Math.sin(angle)}
            stroke="var(--color-border-subtle)"
            strokeWidth={1.5}
          />
        );
      })}

      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-border-subtle)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={`url(#ring-gradient-${size})`}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - progress)}
        style={{ transition: 'stroke-dashoffset 1s linear' }}
      />
    </svg>
  );
}

function FocusModeFullScreen({
  mode, minutes, seconds, progress, running, onExit, onReset, onStartPause,
}: {
  mode: TimerMode; minutes: string; seconds: string; progress: number; running: boolean;
  onExit: () => void; onReset: () => void; onStartPause: () => void;
}) {
  const colors = getModeColors(mode);

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{ background: 'var(--color-bg)', zIndex: 9999 }}
    >
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{ background: `radial-gradient(circle at 50% 40%, ${colors.glow} 0%, transparent 60%)`, opacity: running ? 0.5 : 0.25 }}
      />

      <div className="relative flex flex-col items-center gap-10 p-8">
        <button
          onClick={onExit}
          className="absolute -top-2 right-0 sm:top-2 sm:right-2 p-3 rounded-xl text-text-secondary hover:text-text-primary hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
          aria-label="Exit focus mode"
        >
          <X size={22} />
        </button>

        <div className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider" style={{ background: colors.subtle, color: colors.primary }}>
          {mode.replace('_', ' ')}
        </div>

        <div
          className="relative flex items-center justify-center"
          style={{ animation: running ? 'focus-breathe 4s ease-in-out infinite' : 'none' }}
        >
          <ProgressRing size={340} progress={progress} colors={colors} running={running} />
          <div className="absolute flex flex-col items-center select-none">
            <span className="text-6xl sm:text-7xl font-black tabular-nums text-text-primary tracking-tight">
              {minutes}:{seconds}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={onReset}
            className="w-16 h-16 flex items-center justify-center rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-text-secondary hover:text-text-primary transition-all border border-border"
            aria-label="Reset timer"
          >
            <RotateCcw size={24} />
          </button>
          <Button
            onClick={onStartPause}
            size="lg"
            className="w-52 h-16 text-lg font-bold shadow-xl"
            leftIcon={running ? <Pause size={24} /> : <Play size={24} />}
          >
            {running ? 'Pause' : 'Start'}
          </Button>
        </div>

        <p className="text-xs font-semibold text-text-muted">Press Esc or the × to exit fullscreen</p>
      </div>

      <style>{`
        @keyframes focus-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.015); }
        }
        @media (prefers-reduced-motion: reduce) {
          div[style*="focus-breathe"] { animation: none !important; }
        }
      `}</style>
    </div>,
    document.body
  );
}

export function FocusPage() {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [secondsLeft, setSecondsLeft] = useState(DURATIONS.focus * 60);
  const [running, setRunning] = useState(false);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const qc = useQueryClient();
  const { focusMode, setFocusMode } = useUIStore();

  const { data: sessions } = useQuery({
    queryKey: ['focus'],
    queryFn: () => apiClient.get<ListResponse<FocusSessionDTO>>('/focus').then((r) => r.data),
  });

  const logSession = useMutation({
    mutationFn: (data: CreateFocusSessionRequest) =>
      apiClient.post<FocusSessionDTO>('/focus', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['focus'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const getElapsedMinutes = useCallback(() => Math.floor(elapsedSeconds / 60), [elapsedSeconds]);

  const saveSession = useCallback((completed: boolean) => {
    if (!startedAt) return;
    const elapsedMin = getElapsedMinutes();
    if (elapsedMin >= 1 && mode === 'focus') {
      logSession.mutate({ durationMin: elapsedMin, startedAt, completed });
    }
  }, [startedAt, getElapsedMinutes, mode, logSession]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            if (mode === 'focus' && startedAt) {
              const elapsedMin = getElapsedMinutes() + 1;
              if (elapsedMin >= 1) {
                logSession.mutate({ durationMin: elapsedMin, startedAt, completed: true });
              }
            }
            return 0;
          }
          setElapsedSeconds((prev) => prev + 1);
          return s - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, mode, startedAt, getElapsedMinutes, logSession]);

  useEffect(() => {
    const handler = () => {
      if (!isFullscreenActive() && focusMode) {
        saveSession(false);
        setFocusMode(false);
      }
    };
    document.addEventListener('fullscreenchange', handler);
    document.addEventListener('webkitfullscreenchange', handler);
    return () => {
      document.removeEventListener('fullscreenchange', handler);
      document.removeEventListener('webkitfullscreenchange', handler);
    };
  }, [focusMode, setFocusMode, saveSession]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (running && startedAt && mode === 'focus') {
        const elapsedMin = getElapsedMinutes();
        if (elapsedMin >= 1) {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', '/api/focus', false);
          xhr.setRequestHeader('Content-Type', 'application/json');
          const token = useAuthStore.getState().accessToken;
          if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          xhr.send(JSON.stringify({ durationMin: elapsedMin, startedAt, completed: false }));
        }
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [running, startedAt, mode, getElapsedMinutes]);

  const enterFocusMode = async () => {
    try {
      await requestFullscreen(document.documentElement);
    } catch {
      // Fullscreen can be denied (e.g. inside an iframe) — the overlay still covers the viewport either way.
    }
    setFocusMode(true);
  };

  const exitFocusMode = async () => {
    saveSession(false);
    if (isFullscreenActive()) {
      try { await exitFullscreen(); } catch { /* no-op */ }
    }
    setFocusMode(false);
  };

  const changeMode = (m: TimerMode) => {
    if (mode === 'focus' && startedAt) saveSession(false);
    setMode(m);
    setSecondsLeft(DURATIONS[m] * 60);
    setRunning(false);
    setStartedAt(null);
    setElapsedSeconds(0);
  };

  const handleStartPause = () => {
    if (!running && !startedAt) setStartedAt(new Date().toISOString());
    setRunning((r) => !r);
  };

  const handleReset = () => {
    if (startedAt) saveSession(false);
    setRunning(false);
    setSecondsLeft(DURATIONS[mode] * 60);
    setStartedAt(null);
    setElapsedSeconds(0);
  };

  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
  const seconds = (secondsLeft % 60).toString().padStart(2, '0');
  const progress = 1 - secondsLeft / (DURATIONS[mode] * 60);
  const colors = getModeColors(mode);

  const totalFocusMin = sessions?.data.reduce((acc, s) => acc + s.durationMin, 0) ?? 0;

  const weekBars = useMemo(() => {
    const dateKeys = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d.toISOString().split('T')[0];
    });

    const days = dateKeys.map((key, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { date: d, label: d.toLocaleDateString(undefined, { weekday: 'narrow' }), minutes: 0, key };
    });

    (sessions?.data ?? []).forEach((s) => {
      const sd = new Date(s.startedAt);
      sd.setHours(0, 0, 0, 0);
      const sessionKey = sd.toISOString().split('T')[0];
      const match = days.find((d) => d.key === sessionKey);
      if (match) match.minutes += s.durationMin;
    });

    const max = Math.max(...days.map((d) => d.minutes), 1);
    return days.map((d) => ({ ...d, pct: d.minutes > 0 ? Math.round((d.minutes / max) * 100) : 0 }));
  }, [sessions]);

  const modeTabs = [
    { id: 'focus', label: 'Focus' },
    { id: 'short_break', label: 'Short Break' },
    { id: 'long_break', label: 'Long Break' },
  ];

  return (
    <>
      {focusMode && (
        <FocusModeFullScreen
          mode={mode}
          minutes={minutes}
          seconds={seconds}
          progress={progress}
          running={running}
          onExit={exitFocusMode}
          onReset={handleReset}
          onStartPause={handleStartPause}
        />
      )}

      <div className="max-w-2xl mx-auto flex flex-col items-center gap-6 sm:gap-8">
        <div className="w-full flex items-center justify-between">
          <PageHeader icon={<Timer size={24} />} title="Focus Timer" subtitle="Stay productive using the Pomodoro technique" />
          <button
            onClick={enterFocusMode}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-text-secondary hover:text-text-primary hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all border border-border"
            aria-label="Enter focus mode"
          >
            <Maximize2 size={16} />
            Focus Mode
          </button>
        </div>

        <TabBar tabs={modeTabs} activeTab={mode} onTabChange={(m) => changeMode(m as TimerMode)} variant="pill" className="w-full justify-center" />

        <div
          className="relative flex items-center justify-center my-4 p-8 rounded-full transition-all duration-500"
          style={{
            boxShadow: running ? `0 0 40px ${colors.glow}, inset 0 0 24px ${colors.glow}` : '0 10px 30px -10px rgba(0,0,0,0.08), inset 0 0 10px rgba(0,0,0,0.02)',
            background: 'var(--color-surface-raised)',
            border: '1px solid var(--color-border)',
          }}
        >
          <ProgressRing size={260} progress={progress} colors={colors} running={running} />
          <div className="absolute flex flex-col items-center select-none">
            <span className="text-5xl font-black tabular-nums text-text-primary tracking-tight">{minutes}:{seconds}</span>
            <span className="text-[10px] font-black uppercase tracking-widest mt-2 px-2.5 py-0.5 rounded-full" style={{ background: colors.subtle, color: colors.primary }}>
              {mode.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4.5">
          <button
            onClick={handleReset}
            className="w-14 h-14 flex items-center justify-center rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-text-secondary hover:text-text-primary transition-all border border-border tap-target"
            aria-label="Reset timer"
          >
            <RotateCcw size={20} />
          </button>
          <Button onClick={handleStartPause} size="lg" className="w-44 shadow-lg font-bold" leftIcon={running ? <Pause size={18} /> : <Play size={18} />}>
            {running ? 'Pause' : 'Start'}
          </Button>
        </div>

        <div className="w-full grid grid-cols-2 gap-4">
          <Card variant="default" className="p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'color-mix(in srgb, var(--color-accent) 14%, transparent)', color: 'var(--color-accent)' }}>
                <CheckCircle2 size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Sessions</p>
                <p className="text-xl font-black text-text-primary leading-tight">{sessions?.meta.total ?? 0}</p>
              </div>
            </div>
          </Card>
          <Card variant="default" className="p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'color-mix(in srgb, var(--color-warning) 14%, transparent)', color: 'var(--color-warning)' }}>
                <Flame size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Minutes Logged</p>
                <p className="text-xl font-black text-text-primary leading-tight">{totalFocusMin}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card variant="default" className="p-6 sm:p-8 w-full">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-5">This Week</p>
          {totalFocusMin > 0 ? (
            <div className="flex items-stretch justify-between gap-2 h-24">
              {weekBars.map((d, i) => (
                <div key={i} className="flex-1 h-full flex flex-col items-center gap-2">
                  <div className="w-full flex-1 flex items-end rounded-md overflow-hidden" style={{ background: 'var(--color-border-subtle)' }}>
                    <div
                      className="w-full rounded-md transition-all duration-500"
                      style={{ height: `${Math.max(d.pct, d.minutes > 0 ? 8 : 0)}%`, background: 'var(--gradient-accent)' }}
                      title={`${d.minutes} min`}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-text-muted uppercase shrink-0">{d.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-24 flex items-center justify-center">
              <p className="text-xs text-text-muted">No focus sessions yet</p>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}