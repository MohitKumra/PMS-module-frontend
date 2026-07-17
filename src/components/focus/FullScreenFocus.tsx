import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Maximize2, Music, MoreHorizontal, X, Play, Pause, RotateCcw,
  Target, Flame, Coffee, Clock, Quote, Lightbulb,
} from 'lucide-react';
import { FocusScene } from './FocusScene';

type TimerMode = 'focus' | 'short_break' | 'long_break';

interface FullScreenFocusProps {
  mode: TimerMode;
  minutes: string;
  seconds: string;
  progress: number; // 0 → 1
  running: boolean;
  onStartPause: () => void;
  onReset: () => void;
  onExit: () => void;
  stats: {
    sessionsToday: number;
    focusMinToday: number;
    breaksTaken: number;
    longestStreakDays: number;
  };
}

const PURPLE = '#6d5ce6';

/** Ring diameter scales with viewport so the layout matches the design at any size */
function useRingSize() {
  const compute = () =>
    Math.round(Math.max(240, Math.min(460, window.innerHeight * 0.5, window.innerWidth * 0.42)));
  const [size, setSize] = useState(compute);
  useEffect(() => {
    const onResize = () => setSize(compute());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return size;
}

function formatFocusTime(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function EqualizerBars({ animated = false }: { animated?: boolean }) {
  return (
    <span className="flex items-end gap-[3px]" aria-hidden="true">
      {[10, 16, 7, 13, 9].map((h, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full"
          style={{
            height: h,
            background: PURPLE,
            opacity: 0.85,
            animation: animated ? `fs-eq 0.9s ease-in-out ${i * 0.12}s infinite alternate` : undefined,
          }}
        />
      ))}
    </span>
  );
}

function StatCard({
  icon, iconBg, iconColor, label, value, sub,
}: {
  icon: React.ReactNode; iconBg: string; iconColor: string;
  label: string; value: string; sub: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/60 bg-white/55 px-5 py-4 shadow-[0_8px_24px_-12px_rgba(99,80,200,0.25)] backdrop-blur-md">
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
        style={{ background: iconBg, color: iconColor }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
        <p className="text-2xl font-extrabold leading-tight text-slate-800">{value}</p>
        <p className="text-xs font-medium text-slate-400">{sub}</p>
      </div>
    </div>
  );
}

export function FullScreenFocus({
  mode, minutes, seconds, progress, running, onStartPause, onReset, onExit, stats,
}: FullScreenFocusProps) {
  // Browser fullscreen + keyboard shortcuts
  useEffect(() => {
    document.documentElement.requestFullscreen?.().catch(() => {});

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit();
      if (e.code === 'Space') { e.preventDefault(); onStartPause(); }
      if (e.key === 'r' || e.key === 'R') onReset();
    };
    const onFsChange = () => { if (!document.fullscreenElement) onExit(); };

    window.addEventListener('keydown', onKey);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('fullscreenchange', onFsChange);
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    };
  }, [onExit, onStartPause, onReset]);

  const RING_SIZE = useRingSize();
  const RING_STROKE = Math.max(9, Math.round(RING_SIZE * 0.028));
  const RING_R = (RING_SIZE - RING_STROKE * 2) / 2;

  const circumference = 2 * Math.PI * RING_R;
  // Knob position at progress tip (starts at 12 o'clock, clockwise)
  const angle = progress * 2 * Math.PI - Math.PI / 2;
  const knobX = RING_SIZE / 2 + RING_R * Math.cos(angle);
  const knobY = RING_SIZE / 2 + RING_R * Math.sin(angle);
  const knobSize = Math.round(RING_SIZE * 0.06);
  const timeFontPx = Math.round(RING_SIZE * 0.225);

  const modeLabel = mode === 'focus' ? 'FOCUS SESSION' : mode === 'short_break' ? 'SHORT BREAK' : 'LONG BREAK';

  return createPortal(
    <div
      className="fixed inset-0 z-[100] overflow-hidden font-sans"
      style={{ background: 'linear-gradient(160deg, #eef0fb 0%, #e9e6f9 45%, #e4ddf6 100%)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Focus mode full screen"
    >
      <style>{`@keyframes fs-eq { from { transform: scaleY(0.45); } to { transform: scaleY(1.15); } }`}</style>

      <FocusScene />

      {/* ===== Top bar ===== */}
      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5 rounded-full bg-white/75 px-5 py-2.5 shadow-sm backdrop-blur-md">
          <Maximize2 size={15} className="text-slate-700" />
          <span className="text-sm font-semibold text-slate-800">Focus Mode</span>
        </div>

        <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2.5 rounded-full bg-white/85 px-6 py-2.5 shadow-sm backdrop-blur-md">
          <span className="text-sm font-semibold text-slate-800">Press Esc to exit full screen</span>
          <kbd className="rounded-md bg-slate-800 px-2 py-0.5 text-xs font-bold text-white">Esc</kbd>
        </div>

        <div className="flex items-center gap-2.5">
          <button className="flex h-11 w-11 items-center justify-center rounded-full bg-white/75 shadow-sm backdrop-blur-md transition hover:bg-white" aria-label="Music" style={{ color: PURPLE }}>
            <Music size={17} />
          </button>
          <button className="flex h-11 w-11 items-center justify-center rounded-full bg-white/75 shadow-sm backdrop-blur-md transition hover:bg-white" aria-label="Sound settings" style={{ color: PURPLE }}>
            <EqualizerBars />
          </button>
          <button className="flex h-11 w-11 items-center justify-center rounded-full bg-white/75 text-slate-600 shadow-sm backdrop-blur-md transition hover:bg-white" aria-label="More options">
            <MoreHorizontal size={18} />
          </button>
          <button onClick={onExit} className="ml-2 flex h-11 w-11 items-center justify-center rounded-full text-slate-700 transition hover:bg-white/60" aria-label="Exit focus mode">
            <X size={24} />
          </button>
        </div>
      </header>

      {/* ===== Left column: stats ===== */}
      <aside className="absolute left-8 top-1/2 z-10 hidden w-60 -translate-y-1/2 flex-col gap-3 lg:flex" style={{ marginTop: '-40px' }}>
        <StatCard icon={<Target size={20} />} iconBg="#eceafd" iconColor={PURPLE} label="Focus Sessions" value={String(stats.sessionsToday)} sub="Today" />
        <StatCard icon={<Flame size={20} />} iconBg="#fdeee2" iconColor="#f0842c" label="Focus Time" value={formatFocusTime(stats.focusMinToday)} sub="Today" />
        <StatCard icon={<Coffee size={20} />} iconBg="#dff5ec" iconColor="#2fb783" label="Breaks Taken" value={String(stats.breaksTaken)} sub="Today" />
        <StatCard icon={<Clock size={20} />} iconBg="#e3edfd" iconColor="#3b82f6" label="Longest Streak" value={String(stats.longestStreakDays)} sub="Days" />
      </aside>

      {/* ===== Bottom-left: now playing ===== */}
      <div className="absolute bottom-6 left-8 z-10 hidden items-center gap-3.5 rounded-2xl border border-white/60 bg-white/55 px-5 py-3.5 shadow-[0_8px_24px_-12px_rgba(99,80,200,0.25)] backdrop-blur-md lg:flex">
        <span className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: '#eceafd', color: PURPLE }}>
          <Music size={17} />
        </span>
        <div>
          <p className="text-sm font-bold leading-tight text-slate-800">Lo-Fi Beats</p>
          <p className="text-xs font-medium text-slate-400">Concentration</p>
        </div>
        <span className="ml-3"><EqualizerBars animated={running} /></span>
      </div>

      {/* ===== Right column: quote + shortcuts ===== */}
      <div className="absolute bottom-6 right-8 z-10 hidden w-72 flex-col gap-4 lg:flex">
        <div className="rounded-2xl border border-white/60 bg-white/55 p-5 shadow-[0_8px_24px_-12px_rgba(99,80,200,0.25)] backdrop-blur-md">
          <Quote size={20} className="mb-2.5 -scale-x-100" style={{ color: PURPLE, fill: PURPLE }} />
          <p className="text-[15px] font-medium leading-relaxed text-slate-700 text-pretty">
            Discipline is choosing between what you want now and what you want most.
          </p>
          <p className="mt-2.5 text-sm font-semibold text-slate-500">
            <span style={{ color: PURPLE }}>—</span> Abraham Lincoln
          </p>
        </div>

        <div className="rounded-2xl border border-white/60 bg-white/55 px-5 py-4 shadow-[0_8px_24px_-12px_rgba(99,80,200,0.25)] backdrop-blur-md">
          <p className="mb-3 text-sm font-bold text-slate-800">Shortcuts</p>
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="flex items-center gap-2">
              <kbd className="rounded-md bg-white px-2 py-0.5 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200">Space</kbd>
              <span className="font-medium text-slate-500">Start / Pause</span>
            </span>
            <span className="flex items-center gap-2">
              <kbd className="rounded-md bg-white px-2 py-0.5 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200">R</kbd>
              <span className="font-medium text-slate-500">Reset</span>
            </span>
          </div>
        </div>
      </div>

      {/* ===== Center: title, timer, controls ===== */}
      <main className="relative z-[5] flex h-full flex-col items-center justify-center gap-4 px-4 pt-16">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold tracking-[0.45em] text-balance" style={{ color: PURPLE }}>
            FOCUS
          </h1>
          <p className="mt-2 text-base font-medium text-slate-500">
            {'Stay focused, you got this! \u{1F4AA}'}
          </p>
        </div>

        {/* Timer ring */}
        <div className="relative" style={{ width: RING_SIZE, height: RING_SIZE }}>
          {/* Inner face */}
          <div
            className="absolute rounded-full bg-white/40 shadow-[inset_0_2px_20px_rgba(120,100,220,0.08)] backdrop-blur-sm"
            style={{ inset: RING_STROKE + 10 }}
          />
          {/* Tick marks */}
          <svg className="absolute inset-0" width={RING_SIZE} height={RING_SIZE} aria-hidden="true">
            {Array.from({ length: 60 }).map((_, i) => {
              const a = (i / 60) * 2 * Math.PI - Math.PI / 2;
              const major = i % 5 === 0;
              const r1 = RING_R - RING_SIZE * 0.06;
              const r2 = r1 - RING_SIZE * (major ? 0.026 : 0.013);
              const cx = RING_SIZE / 2;
              return (
                <line
                  key={i}
                  x1={cx + r1 * Math.cos(a)} y1={cx + r1 * Math.sin(a)}
                  x2={cx + r2 * Math.cos(a)} y2={cx + r2 * Math.sin(a)}
                  stroke="#b8b2e0" strokeWidth={major ? 2 : 1} strokeLinecap="round" opacity={major ? 0.45 : 0.3}
                />
              );
            })}
          </svg>
          {/* Progress ring */}
          <svg className="absolute inset-0 -rotate-90" width={RING_SIZE} height={RING_SIZE} aria-hidden="true">
            <defs>
              <linearGradient id="fs-ring-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#c9c2f5" />
                <stop offset="1" stopColor={PURPLE} />
              </linearGradient>
            </defs>
            <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_R} fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth={RING_STROKE} />
            <circle
              cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_R} fill="none"
              stroke="url(#fs-ring-grad)" strokeWidth={RING_STROKE} strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * progress}
              style={{ transition: 'stroke-dashoffset 1s linear', filter: 'drop-shadow(0 6px 16px rgba(109,92,230,0.35))' }}
            />
          </svg>
          {/* Knob at the remaining-time tip */}
          <div
            className="absolute rounded-full bg-white shadow-[0_2px_10px_rgba(109,92,230,0.45)] ring-4"
            style={{
              width: knobSize, height: knobSize,
              left: knobX, top: knobY,
              transform: 'translate(-50%, -50%)',
              transition: 'left 1s linear, top 1s linear',
              // @ts-expect-error custom ring color via CSS var
              '--tw-ring-color': 'rgba(109,92,230,0.55)',
            }}
          />
          {/* Time + badge */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 select-none">
            <span
              className="font-mono font-extrabold leading-none tracking-tight text-slate-800 tabular-nums"
              style={{ fontSize: timeFontPx }}
            >
              {minutes}:{seconds}
            </span>
            <span className="flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold tracking-[0.08em]" style={{ background: '#eceafd', color: PURPLE }}>
              <Target size={14} />
              {modeLabel}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={onReset}
            className="flex items-center gap-2.5 rounded-full bg-white/85 px-7 py-4 text-base font-semibold text-slate-700 shadow-sm backdrop-blur-md transition hover:bg-white"
          >
            <RotateCcw size={18} />
            Reset
          </button>
          <button
            onClick={onStartPause}
            className="flex items-center gap-3 rounded-full px-10 py-4 text-lg font-bold text-white shadow-[0_12px_30px_-8px_rgba(109,92,230,0.6)] transition hover:brightness-110"
            style={{ background: PURPLE }}
          >
            {running ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            {running ? 'Pause' : 'Start Focus'}
          </button>
        </div>

        <p className="flex items-center gap-2 text-sm text-slate-500">
          <Lightbulb size={16} className="text-slate-400" />
          <span>
            <span className="font-bold text-slate-600">Tip:</span>{' '}
            {'Take short breaks to recharge. You\u2019ll come back stronger!'}
          </span>
        </p>
      </main>
    </div>,
    document.body,
  );
}
