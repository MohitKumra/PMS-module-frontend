type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent';

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-surface text-text-muted',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger:  'bg-danger/15 text-danger',
  info:    'bg-info/15 text-info',
  accent:  'bg-accent/15 text-accent',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}

/** Maps task priority to a badge variant. */
export function PriorityBadge({ priority }: { priority: 'LOW' | 'MEDIUM' | 'HIGH' }) {
  const map: Record<string, BadgeVariant> = { LOW: 'info', MEDIUM: 'warning', HIGH: 'danger' };
  return <Badge variant={map[priority]}>{priority}</Badge>;
}

/** Maps task status to a badge variant. */
export function StatusBadge({ status }: { status: 'TODO' | 'IN_PROGRESS' | 'DONE' }) {
  const map: Record<string, BadgeVariant> = { TODO: 'default', IN_PROGRESS: 'info', DONE: 'success' };
  const labels: Record<string, string> = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' };
  return <Badge variant={map[status]}>{labels[status]}</Badge>;
}