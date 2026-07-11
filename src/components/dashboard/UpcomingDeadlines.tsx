import React from 'react';
import { Clock, CheckSquare, Folder } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';

interface UpcomingDeadlinesProps {
  deadlines: Array<{
    type: 'task' | 'project';
    id: string;
    title: string;
    dueDate: string;
    daysUntilDue: number;
  }>;
}

export function UpcomingDeadlines({ deadlines }: UpcomingDeadlinesProps) {
  const navigate = useNavigate();

  const getUrgencyColor = (days: number) => {
    if (days < 0) return 'danger';
    if (days === 0) return 'warning';
    if (days <= 2) return 'warning';
    return 'info';
  };

  const formatDeadline = (days: number) => {
    if (days < 0) return `${Math.abs(days)}d overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `Due in ${days}d`;
  };

  const handleClick = (deadline: typeof deadlines[0]) => {
    if (deadline.type === 'task') {
      navigate('/tasks');
    } else {
      navigate(`/projects/${deadline.id}`);
    }
  };

  return (
    <Card variant="default" className="overflow-hidden">
      {/* Header */}
      <div 
        className="px-5 py-4 border-b flex items-center justify-between"
        style={{ borderColor: 'var(--color-border-subtle)' }}
      >
        <div className="flex items-center gap-2.5">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: 'var(--icon-bg-warning)',
              color: 'var(--icon-text-warning)',
            }}
          >
            <Clock size={16} />
          </div>
          <h3 className="text-sm font-bold text-text-primary">Upcoming Deadlines</h3>
        </div>
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
          Next 7 Days
        </span>
      </div>

      {/* Deadlines List */}
      <div className="max-h-[280px] overflow-y-auto">
        {deadlines.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-xs text-text-muted">No upcoming deadlines</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
            {deadlines.map((deadline) => {
              const Icon = deadline.type === 'task' ? CheckSquare : Folder;
              const urgency = getUrgencyColor(deadline.daysUntilDue);

              return (
                <div
                  key={`${deadline.type}-${deadline.id}`}
                  onClick={() => handleClick(deadline)}
                  className="px-5 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div 
                      className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
                      style={{
                        background: `var(--icon-bg-${urgency})`,
                        color: `var(--icon-text-${urgency})`,
                      }}
                    >
                      <Icon size={14} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-text-primary mb-1 truncate">
                        {deadline.title}
                      </p>
                      
                      <div className="flex items-center gap-2">
                        <span 
                          className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                          style={{
                            background: 'var(--color-border-subtle)',
                            color: 'var(--color-text-muted)',
                          }}
                        >
                          {deadline.type}
                        </span>
                        <span 
                          className={`text-[10px] font-bold`}
                          style={{ color: `var(--color-${urgency})` }}
                        >
                          {formatDeadline(deadline.daysUntilDue)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
