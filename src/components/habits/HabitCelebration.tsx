import React, { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Flame, PartyPopper, Sparkles } from 'lucide-react';
import { getAchievement } from '../../features/habits/Habitpresentation';

interface HabitCelebrationModalProps {
  open: boolean;
  onClose: () => void;
  habitTitle: string;
  currentStreak: number;
  color: string;
}

const MESSAGES = [
  "Nice work — that's one more day in the books.",
  "Consistency wins. See you tomorrow.",
  "Small steps, real progress. Keep going.",
  "That's how streaks are built — one day at a time.",
  "Locked in for today. Same time tomorrow?",
];

const CONFETTI_COLORS = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

export function HabitCelebrationModal({
  open, onClose, habitTitle, currentStreak, color,
}: HabitCelebrationModalProps) {
  const achievement = getAchievement(currentStreak);
  const message = useMemo(
    () => MESSAGES[(currentStreak + habitTitle.length) % MESSAGES.length],
    [currentStreak, habitTitle]
  );

  const confetti = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.3,
        duration: 1.4 + Math.random() * 0.8,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        w: 5 + Math.random() * 5,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open]
  );

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onClose, 3400);
    return () => clearTimeout(timer);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ background: 'color-mix(in srgb, black 50%, transparent)', zIndex: 9999 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <style>{`
        @keyframes habitConfettiFall {
          0% { transform: translateY(-16px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(220px) rotate(480deg); opacity: 0; }
        }
        @keyframes habitCelebrationPop {
          0% { transform: scale(0.85) translateY(8px); opacity: 0; }
          60% { transform: scale(1.03) translateY(0); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes habitRingPulse {
          0% { box-shadow: 0 0 0 0 color-mix(in srgb, ${color} 45%, transparent); }
          100% { box-shadow: 0 0 0 24px color-mix(in srgb, ${color} 0%, transparent); }
        }
        @keyframes habitBackdropFade {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>

      <div
        className="relative w-full max-w-sm rounded-3xl p-6 sm:p-8 text-center overflow-hidden shadow-2xl"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          animation: 'habitCelebrationPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-x-0 top-0 h-full pointer-events-none overflow-hidden">
          {confetti.map((p) => (
            <span
              key={p.id}
              className="absolute rounded-sm"
              style={{
                left: `${p.left}%`,
                top: '-10px',
                width: p.w,
                height: p.w * 0.4,
                background: p.color,
                animation: `habitConfettiFall ${p.duration}s ease-in ${p.delay}s forwards`,
              }}
            />
          ))}
        </div>

        <div
          className="relative mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{
            background: `color-mix(in srgb, ${color} 16%, transparent)`,
            color,
            animation: 'habitRingPulse 1.4s ease-out',
          }}
        >
          <PartyPopper size={28} />
        </div>

        <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1 truncate px-4">
          {habitTitle}
        </p>
        <h3 className="text-xl font-black text-text-primary mb-2">Done for today!</h3>
        <p className="text-sm font-medium text-text-secondary mb-5 px-2 leading-relaxed">{message}</p>

        <div className="flex items-center justify-center gap-2 flex-wrap mb-5">
          <span
            className="flex items-center gap-1.5 text-sm font-extrabold px-3 py-1.5 rounded-full"
            style={{ color: 'var(--color-warning)', background: 'color-mix(in srgb, var(--color-warning) 14%, transparent)' }}
          >
            <Flame size={15} /> {currentStreak} day{currentStreak === 1 ? '' : 's'} streak
          </span>
          {achievement && (
            <span
              className="flex items-center gap-1.5 text-sm font-extrabold px-3 py-1.5 rounded-full"
              style={{ color: achievement.color, background: `color-mix(in srgb, ${achievement.color} 14%, transparent)` }}
            >
              <Sparkles size={15} /> {achievement.label}
            </span>
          )}
        </div>

        <p className="text-xs font-bold text-text-muted mb-5">Come back tomorrow to keep it going.</p>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl text-sm font-extrabold text-white transition-transform active:scale-95"
          style={{ background: 'var(--gradient-accent)' }}
        >
          Nice!
        </button>
      </div>
    </div>,
    document.body
  );
}