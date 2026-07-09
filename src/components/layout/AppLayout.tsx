import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, Calendar, Target, FileText,
  Timer, BarChart2, LogOut, Menu, X, Sparkles, Moon, Sun,
  Search, MoreHorizontal, ChevronRight, User
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { useLogout } from '../../features/auth/hooks/useAuth';
import { NotificationCenter } from '../../features/notifications/components/NotificationCenter';
import { Tooltip } from '../ui/Tooltip';
import { BottomSheet } from '../ui/BottomSheet';
import { Badge } from '../ui/Badge';

const navItems = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard',  badge: undefined },
  { to: '/tasks',     icon: CheckSquare,     iconColor: 'indigo', label: 'Tasks',      badge: 4 },
  { to: '/planner',   icon: Calendar,        iconColor: 'info',   label: 'Planner',    badge: undefined },
  { to: '/habits',    icon: Target,          iconColor: 'success',label: 'Habits',     badge: 2 },
  { to: '/notes',     icon: FileText,        iconColor: 'warning',label: 'Notes',      badge: undefined },
  { to: '/focus',     icon: Timer,           iconColor: 'danger', label: 'Focus',      badge: undefined },
  { to: '/analytics', icon: BarChart2,       iconColor: 'accent', label: 'Analytics',  badge: undefined },
];

/** Active link styles for desktop sidebar */
const sidebarLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ease-out select-none relative',
    isActive
      ? 'sidebar-item-active shadow-sm font-extrabold'
      : 'sidebar-item text-text-secondary hover:text-text-primary',
  ].join(' ');

/** Active link styles for mobile bottom nav */
const mobileNavClass = ({ isActive }: { isActive: boolean }) =>
  [
    'flex flex-col items-center justify-center gap-1 flex-1 py-1 text-[10px] font-bold transition-all duration-200 select-none',
    isActive
      ? 'text-accent'
      : 'text-text-muted hover:text-text-secondary',
  ].join(' ');

export function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const { sidebarOpen, toggleSidebar, theme, toggleTheme } = useUIStore();
  const logout = useLogout();
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  // Primary bottom nav items (first 4 items + "More" item)
  const mobilePrimaryItems = navItems.slice(0, 4);
  const mobileOverflowItems = navItems.slice(4);

  return (
    <div className="flex h-dvh overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      {/* ── Desktop Sidebar ─────────────────────────────────────────────── */}
      <aside
        className={[
          'hidden md:flex flex-col shrink-0 border-r transition-all ease-out duration-300',
          sidebarOpen ? 'w-64' : 'w-20',
        ].join(' ')}
        style={{
          background: 'var(--sidebar-bg)',
          borderColor: 'var(--sidebar-border)',
          width: sidebarOpen ? 'var(--sidebar-width)' : 'var(--sidebar-width-collapsed)',
        }}
      >
        {/* Logo section */}
        <div 
          className="flex items-center gap-3 px-5 border-b shrink-0 justify-between"
          style={{ 
            height: 'var(--topbar-height)',
            borderColor: 'var(--sidebar-border)',
          }}
        >
          {sidebarOpen ? (
            <div className="flex items-center gap-2.5 overflow-hidden animate-scale-in">
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-accent/15"
                style={{ background: 'var(--gradient-accent)' }}
              >
                <Sparkles size={18} className="text-white" />
              </div>
              <span className="font-extrabold text-lg text-text-primary tracking-tight truncate">FlowSpace</span>
            </div>
          ) : (
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-accent/15 mx-auto"
              style={{ background: 'var(--gradient-accent)' }}
            >
              <Sparkles size={18} className="text-white" />
            </div>
          )}

          {sidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-text-muted hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Collapse sidebar"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto no-scrollbar">
          {sidebarOpen && (
            <span className="px-3 text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 select-none">
              Navigation
            </span>
          )}

          {navItems.map(({ to, icon: Icon, label, badge, iconColor }) => {
            const content = (
              <NavLink key={to} to={to} end={to === '/'} className={sidebarLinkClass}>
                {({ isActive }) => (
                  <>
                    <Icon 
                      size={20} 
                      className="shrink-0 transition-transform duration-200" 
                      style={{ 
                        color: isActive ? 'var(--color-accent)' : undefined 
                      }} 
                    />
                    {sidebarOpen && (
                      <span className="truncate flex-1">{label}</span>
                    )}
                    {sidebarOpen && badge && (
                      <Badge variant={iconColor as any || 'accent'} size="sm" className="ml-auto animate-scale-in">
                        {badge}
                      </Badge>
                    )}
                    {/* Collapsed Active Indicator Dot */}
                    {!sidebarOpen && isActive && (
                      <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-accent animate-scale-in" />
                    )}
                  </>
                )}
              </NavLink>
            );

            return sidebarOpen ? (
              content
            ) : (
              <Tooltip key={to} content={label} side="right">
                {content}
              </Tooltip>
            );
          })}
        </nav>

        {/* User profile & logout */}
        <div className="p-3 border-t shrink-0 flex flex-col gap-2" style={{ borderColor: 'var(--sidebar-border)' }}>
          {sidebarOpen && user && (
            <div 
              className="px-3 py-2.5 rounded-xl border flex items-center gap-3 min-w-0"
              style={{ 
                background: 'var(--color-surface-raised)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div 
                className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-sm text-text-onaccent shadow-sm"
                style={{ background: 'var(--gradient-accent)' }}
              >
                {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-text-primary truncate">
                  {user.name ?? user.email.split('@')[0]}
                </p>
                <p className="text-[10px] text-text-muted truncate mt-0.5">Manager</p>
              </div>
            </div>
          )}

          <button
            onClick={() => logout.mutate()}
            className={[
              'flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 select-none relative',
              'text-red-500 hover:bg-red-500/10 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400',
            ].join(' ')}
            aria-label="Log out"
          >
            <LogOut size={20} className="shrink-0" />
            {sidebarOpen && <span className="flex-1 text-left">Sign out</span>}
          </button>
        </div>
      </aside>

      {/* ── Main content area ──────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0 relative">
        {/* Top bar */}
        <header 
          className="flex items-center justify-between px-4 sm:px-6 md:px-8 border-b bg-white dark:bg-slate-900 shrink-0 gap-4"
          style={{ 
            height: 'var(--topbar-height)',
            background: 'var(--topbar-bg)',
            borderColor: 'var(--topbar-border)',
          }}
        >
          {/* Left Topbar */}
          <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-initial">
            <button
              onClick={toggleSidebar}
              className="hidden md:flex p-2 rounded-xl text-text-muted hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu size={20} />
            </button>

            {/* Mobile Header Logo */}
            <div className="md:hidden flex items-center gap-2.5 min-w-0">
              <div 
                className="w-8.5 h-8.5 rounded-lg flex items-center justify-center shrink-0 shadow-md shadow-accent/15"
                style={{ background: 'var(--gradient-accent)' }}
              >
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="font-extrabold text-base text-text-primary tracking-tight truncate">FlowSpace</span>
            </div>

            {/* Desktop header label */}
            <div className="hidden md:block">
              <span className="text-sm font-bold text-text-muted uppercase tracking-wider">Workspace</span>
            </div>
          </div>

          {/* Search bar (Enterprise SaaS Style) */}
          <div className="hidden sm:flex relative items-center max-w-md w-64 md:w-80 transition-all duration-300">
            <Search size={16} className="absolute left-3.5 text-text-muted" />
            <input
              type="text"
              placeholder="Search tasks, habits..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs font-bold border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              style={{
                background: 'var(--topbar-search-bg)',
                borderColor: 'var(--topbar-search-border)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          {/* User Settings, Theme, Notifications */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            <button
              onClick={() => toggleTheme()}
              className="p-2.5 rounded-xl text-text-muted hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="p-1">
              <NotificationCenter />
            </div>

            {user && (
              <div className="flex items-center gap-3 pl-1 sm:pl-2 border-l" style={{ borderColor: 'var(--color-border)' }}>
                <div 
                  className="w-9 h-9 rounded-xl text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-accent/15 shrink-0"
                  style={{ background: 'var(--gradient-accent)' }}
                >
                  {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                </div>
                <div className="hidden lg:flex flex-col min-w-0">
                  <span className="text-xs font-bold text-text-primary leading-tight truncate">
                    {user.name ?? user.email.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-text-muted leading-tight truncate mt-0.5">Manager</span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page content scroll container */}
        <div className="flex-1 overflow-y-auto pb-24 md:pb-0 relative min-w-0">
          <div className="page-enter p-4 sm:p-6 md:p-8">
            <Outlet />
          </div>
        </div>
      </main>

      {/* ── Mobile Bottom Navigation ─────────────────────────────────────── */}
      <nav 
        className="md:hidden fixed bottom-0 inset-x-0 border-t z-40 px-3 pb-5 pt-2 flex items-center justify-around"
        style={{
          background: 'var(--bottomnav-bg)',
          borderColor: 'var(--bottomnav-border)',
          height: 'var(--bottomnav-height)',
        }}
      >
        {mobilePrimaryItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={mobileNavClass}
          >
            {({ isActive }) => (
              <>
                <div 
                  className="p-1 rounded-xl flex items-center justify-center transition-all duration-200"
                  style={{
                    background: isActive ? 'var(--bottomnav-indicator)' : 'transparent',
                  }}
                >
                  <Icon size={20} />
                </div>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* "More" Trigger */}
        <button
          onClick={() => setMobileMoreOpen(true)}
          className="flex flex-col items-center justify-center gap-1 flex-1 py-1 text-[10px] font-bold text-text-muted hover:text-text-secondary"
        >
          <div className="p-1 rounded-xl flex items-center justify-center">
            <MoreHorizontal size={20} />
          </div>
          <span>More</span>
        </button>
      </nav>

      {/* ── Mobile Bottom Sheet More Menu ─────────────────────────────────── */}
      <BottomSheet 
        isOpen={mobileMoreOpen} 
        onClose={() => setMobileMoreOpen(false)} 
        title="More Features"
      >
        <div className="flex flex-col gap-2 stagger">
          {mobileOverflowItems.map(({ to, icon: Icon, label, badge, iconColor }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileMoreOpen(false)}
              className="flex items-center gap-3.5 p-4 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all font-bold text-text-primary text-sm"
              style={{
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              <div 
                className="w-10 h-10 icon-container"
                style={{
                  background: `var(--icon-bg-${iconColor || 'accent'})`,
                  color: `var(--icon-text-${iconColor || 'accent'})`,
                }}
              >
                <Icon size={20} />
              </div>
              <span className="flex-1">{label}</span>
              {badge && (
                <Badge variant={iconColor as any || 'accent'} size="sm">
                  {badge}
                </Badge>
              )}
              <ChevronRight size={16} className="text-text-muted" />
            </NavLink>
          ))}

          {/* Settings / Extra visual actions to make it look premium */}
          <div className="h-px bg-border my-2" />

          {user && (
            <div 
              className="flex items-center gap-3.5 p-4 rounded-2xl border"
              style={{
                borderColor: 'var(--color-border)',
                background: 'var(--color-surface-raised)',
              }}
            >
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-text-onaccent shadow-sm"
                style={{ background: 'var(--gradient-accent)' }}
              >
                <User size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text-primary truncate">
                  {user.name ?? user.email.split('@')[0]}
                </p>
                <p className="text-xs text-text-muted truncate mt-0.5">{user.email}</p>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              setMobileMoreOpen(false);
              logout.mutate();
            }}
            className="flex items-center gap-3.5 p-4 rounded-2xl hover:bg-red-500/10 text-red-500 font-bold text-sm text-left"
            style={{
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-red-500/10 text-red-500">
              <LogOut size={20} />
            </div>
            <span className="flex-1">Sign out</span>
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}