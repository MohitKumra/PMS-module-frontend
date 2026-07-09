// frontend/src/features/notifications/components/NotificationCenter.tsx
// Notification Center modal component. Exposes Web Push permission controls,
// test triggers, and historical notification logs.

import { useState } from 'react';
import { Bell, Shield, ShieldAlert, Mail, Check, Sparkles } from 'lucide-react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { formatDate } from '../../../lib/dateUtils';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    isSubscribed,
    loading,
    subscribe,
    unsubscribe,
    logs,
    logsLoading,
    markAllAsRead,
    sendTest,
  } = usePushNotifications();

  const unreadCount = logs.filter((l) => !l.readAt).length;

  const handleToggleSubscription = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  return (
    <>
      {/* Bell Icon Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="tap-target relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-text-muted hover:text-text-primary transition-all duration-200"
        aria-label="Notification Center"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-accent animate-pulse" />
        )}
      </button>

      {/* Notification Center Modal */}
      <Modal open={isOpen} onClose={() => setIsOpen(false)} title="Notification Center">
        <div className="flex flex-col gap-5 pt-2">
          
          {/* Section: Subscription Controls */}
          <Card variant="glass" className="p-4 flex flex-col gap-3.5">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: isSubscribed ? 'var(--icon-bg-success)' : 'var(--icon-bg-warning)',
                  color: isSubscribed ? 'var(--icon-text-success)' : 'var(--icon-text-warning)',
                }}
              >
                {isSubscribed ? <Shield size={20} /> : <ShieldAlert size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text-primary">Browser Push Notifications</p>
                <p className="text-xs text-text-secondary mt-0.5 leading-snug">
                  {isSubscribed 
                    ? 'Subscribed to browser alerts.' 
                    : 'Get reminded of tasks and habits in real time.'}
                </p>
              </div>
            </div>

            <Button
              variant={isSubscribed ? 'danger' : 'primary'}
              size="sm"
              fullWidth
              loading={loading}
              onClick={handleToggleSubscription}
              className="mt-1"
            >
              {isSubscribed ? 'Disable Push Alerts' : 'Enable Push Alerts'}
            </Button>
          </Card>

          {/* Section: Test Trigger */}
          <Card variant="default" className="p-4 bg-neutral-50/50 dark:bg-neutral-900/30">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-3">
              Trigger test alerts
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Bell size={14} />}
                onClick={() => sendTest(['BROWSER_PUSH'])}
              >
                Test Push
              </Button>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Mail size={14} />}
                onClick={() => sendTest(['EMAIL'])}
              >
                Test Email
              </Button>
            </div>
          </Card>

          {/* Section: Logs / History */}
          <div>
            <div className="flex items-center justify-between mb-3 select-none">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                History
              </p>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-xs font-bold text-accent hover:text-accent-hover transition-colors flex items-center gap-1 tap-target"
                >
                  <Check size={12} /> Mark all read
                </button>
              )}
            </div>

            {logsLoading ? (
              <p className="text-xs text-text-secondary text-center py-6 font-medium animate-pulse">Loading logs…</p>
            ) : logs.length === 0 ? (
              <div className="text-center py-10 text-text-muted border border-dashed border-border rounded-2xl bg-neutral-50/20 dark:bg-neutral-950/10">
                <Sparkles size={24} className="mx-auto mb-2 opacity-30 text-accent" />
                <p className="text-xs font-bold">Clear history</p>
                <p className="text-[10px] text-text-muted mt-1 leading-snug">No notifications triggered yet</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1 no-scrollbar stagger">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl border text-xs transition-colors"
                    style={{
                      background: log.readAt ? 'var(--color-bg)' : 'var(--color-surface-raised)',
                      borderColor: log.readAt ? 'transparent' : 'var(--color-border)',
                      color: log.readAt ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5 gap-2">
                      <p className="font-bold truncate">{log.title}</p>
                      <Badge variant={log.channel === 'EMAIL' ? 'accent' : 'info'} size="sm">
                        {log.channel === 'EMAIL' ? 'email' : 'push'}
                      </Badge>
                    </div>
                    <p className="leading-relaxed opacity-90">{log.body}</p>
                    <p className="text-[9px] text-text-muted mt-2 font-bold opacity-75">
                      {formatDate(log.sentAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </Modal>
    </>
  );
}