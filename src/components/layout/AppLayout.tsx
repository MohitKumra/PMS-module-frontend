import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, Calendar, Target, FileText,
  Timer, BarChart2, LogOut, Menu, X, Zap, Moon, Sun
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { useLogout } from '../../features/auth/hooks/useAuth';
import { NotificationCenter } from '../../features/notifications/components/NotificationCenter';

const navItems = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tasks',     icon: CheckSquare,     label: 'Tasks'     },
  { to: '/planner',   icon: Calendar,        label: 'Planner'   },
  { to: '/habits',    icon: Target,          label: 'Habits'    },
  { to: '/notes',     icon: FileText,        label: 'Notes'     },
  { to: '/focus',     icon: Timer,           label: 'Focus'     },
  { to: '/analytics', icon: BarChart2,       label: 'Analytics' },
];

/** Active link styles */
const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150',
    'tap-target',
    isActive
      ? 'bg-accent text-text-onaccent shadow-md'
      : 'text-text-muted hover:bg-surface hover:text-text-primary',
  ].join(' ');

/**
 * App shell layout.
 * - Mobile: fixed bottom navigation bar (bottom-nav).
 * - Desktop (md+): fixed left sidebar.
 * One layout component — responsive via Tailwind.
 */
export function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const { sidebarOpen, toggleSidebar, theme, toggleTheme } = useUIStore();
  const logout = useLogout();

  return (
    <div className="flex h-dvh overflow-hidden bg-bg">
      {/* ── Desktop Sidebar ─────────────────────────────────────────────── */}
      <aside
        className={[
          'hidden md:flex flex-col shrink-0 border-r border-border',
          'bg-surface transition-all duration-300 ease-out',
          sidebarOpen ? 'w-56' : 'w-16',
        ].join(' ')}
      >
        {/* Logo + toggle */}
        <div className="flex items-center gap-3 px-3 py-4 border-b border-border">
          <button
            onClick={toggleSidebar}
            className="tap-target w-10 h-10 flex items-center justify-center rounded-md hover:bg-surface text-text-muted transition-colors"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          {sidebarOpen && (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center shrink-0">
                <Zap size={14} className="text-text-onaccent" />
              </div>
              <span className="font-bold text-text-primary truncate">FlowSpace</span>
            </div>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-2 flex flex-col gap-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'} className={linkClass}>
              <Icon size={18} className="shrink-0" />
              {sidebarOpen && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="p-2 border-t border-border">
          {sidebarOpen && user && (
            <div className="px-3 py-2 mb-1">
              <p className="text-xs text-text-muted truncate">{user.name ?? user.email}</p>
              <p className="text-xs text-text-muted truncate opacity-60">{user.email}</p>
            </div>
          )}
          <button
            onClick={() => logout.mutate()}
            className={`${linkClass({ isActive: false })} w-full`}
            aria-label="Log out"
          >
            <LogOut size={18} className="shrink-0" />
            {sidebarOpen && <span>Log out</span>}
          </button>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-2 border-b border-border bg-surface shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <Zap size={14} className="text-text-onaccent" />
            </div>
            <span className="font-bold text-text-primary">FlowSpace</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleTheme()}
              className="tap-target w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface text-text-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <NotificationCenter />
            {user && <span className="text-xs text-text-muted truncate max-w-[80px]">{user.name ?? user.email}</span>}
          </div>
        </header>

        {/* Desktop top bar */}
        <header className="hidden md:flex items-center justify-between px-6 py-3 border-b border-border bg-surface shrink-0">
          <div>
            <span className="text-sm font-medium text-text-muted">Workspace / Personal Hub</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => toggleTheme()}
              className="tap-target w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface text-text-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <NotificationCenter />
            {user && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent/10 text-accent font-bold text-xs flex items-center justify-center">
                  {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium text-text-primary">{user.name ?? user.email}</span>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <Outlet />
        </div>
      </main>

      {/* ── Mobile Bottom Navigation ─────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-surface border-t border-border z-40">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => [
                'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-[52px]',
                isActive
                  ? 'text-accent'
                  : 'text-text-muted',
              ].join(' ')}
            >
              <Icon size={20} className="shrink-0" />
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}