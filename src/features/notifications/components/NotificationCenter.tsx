// frontend/src/features/notifications/components/NotificationCenter.tsx
// Notification Center modal component. Exposes Web Push permission controls,
// test triggers, and historical notification logs.

import { useState } from 'react';
import { Bell, Shield, ShieldAlert, Mail, Check, Sparkles } from 'lucide-react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
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
        className="tap-target relative w-10 h-10 flex items-center justify-center rounded-md hover:bg-surface text-text-muted hover:text-text-primary transition-colors"
        aria-label="Notification Center"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent animate-pulse" />
        )}
      </button>

      {/* Notification Center Modal */}
      <Modal open={isOpen} onClose={() => setIsOpen(false)} title="Notification Center">
        <div className="flex flex-col gap-5 pt-2">
          
          {/* Section: Subscription Controls */}
          <div className="glass rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                isSubscribed ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
              }`}>
                {isSubscribed ? <Shield size={18} /> : <ShieldAlert size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary">Browser Push Notifications</p>
                <p className="text-xs text-text-muted">
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
            >
              {isSubscribed ? 'Disable Push Alerts' : 'Enable Push Alerts'}
            </Button>
          </div>

          {/* Section: Test Trigger */}
          <div className="glass rounded-xl p-4">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Trigger test alerts
            </p>
            <div className="grid grid-cols-2 gap-2">
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
          </div>

          {/* Section: Logs / History */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                History
              </p>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-xs text-accent hover:underline flex items-center gap-1"
                >
                  <Check size={12} /> Mark all read
                </button>
              )}
            </div>

            {logsLoading ? (
              <p className="text-xs text-text-muted text-center py-4">Loading logs…</p>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-text-muted border border-dashed border-border rounded-xl">
                <Sparkles size={24} className="mx-auto mb-2 opacity-30 text-accent" />
                <p className="text-xs font-medium">Clear history</p>
                <p className="text-[10px] opacity-75 mt-0.5">No notifications triggered yet</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-3 rounded-xl border text-xs transition-colors ${
                      log.readAt 
                        ? 'bg-surface border-transparent text-text-muted' 
                        : 'bg-surface border-border text-text-primary'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <p className="font-semibold truncate">{log.title}</p>
                      <Badge variant={log.channel === 'EMAIL' ? 'accent' : 'info'}>
                        {log.channel === 'EMAIL' ? 'email' : 'push'}
                      </Badge>
                    </div>
                    <p className="leading-relaxed">{log.body}</p>
                    <p className="text-[9px] text-text-muted mt-1.5 opacity-75">
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