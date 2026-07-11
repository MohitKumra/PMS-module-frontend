interface ProgressBarProps {
  /** Current value (0 to max) */
  value: number;
  /** Maximum value (default 100) */
  max?: number;
  /** Color variant using gradient tokens */
  color?: 'accent' | 'success' | 'warning' | 'danger' | 'info';
  /** Bar height */
  size?: 'sm' | 'md' | 'lg';
  /** Show percentage label on the right */
  showLabel?: boolean;
  /** Optional label text shown on the left */
  label?: string;
  /** Animate the fill on mount */
  animated?: boolean;
  className?: string;
}

const sizeMap = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-3.5' };

/**
 * Reusable progress bar component with gradient fill and optional labels.
 * Uses design token gradients for consistent theming.
 */
export function ProgressBar({
  value,
  max = 100,
  color = 'accent',
  size = 'md',
  showLabel = false,
  label,
  animated = true,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {(label || showLabel) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              {label}
            </span>
          )}
          {showLabel && (
            <span className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full rounded-full overflow-hidden ${sizeMap[size]}`}
        style={{ background: 'var(--color-border)' }}
      >
        <div
          className={`h-full rounded-full ${animated ? 'transition-all duration-700 ease-out' : ''}`}
          style={{
            width: `${percentage}%`,
            background: `var(--gradient-${color})`,
            transformOrigin: 'left',
          }}
        />
      </div>
    </div>
  );
}
