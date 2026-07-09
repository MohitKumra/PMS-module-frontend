import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { useAuthStore } from './store/authStore';

// Auth pages (public)
import { LoginPage }          from './routes/LoginPage';
import { SignupPage }         from './routes/SignupPage';
import { ForgotPasswordPage } from './routes/ForgotPasswordPage';

// Protected pages
import { DashboardPage }  from './routes/DashboardPage';
import { TasksPage }      from './routes/TasksPage';
import { PlannerPage }    from './routes/PlannerPage';
import { HabitsPage }     from './routes/HabitsPage';
import { NotesPage }      from './routes/NotesPage';
import { FocusPage }      from './routes/FocusPage';
import { AnalyticsPage }  from './routes/AnalyticsPage';

/** Redirects unauthenticated users to /login. */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login"           element={<LoginPage />} />
      <Route path="/signup"          element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Protected routes — inside AppLayout */}
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index               element={<DashboardPage />} />
        <Route path="tasks"        element={<TasksPage />} />
        <Route path="planner"      element={<PlannerPage />} />
        <Route path="habits"       element={<HabitsPage />} />
        <Route path="notes"        element={<NotesPage />} />
        <Route path="focus"        element={<FocusPage />} />
        <Route path="analytics"    element={<AnalyticsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
