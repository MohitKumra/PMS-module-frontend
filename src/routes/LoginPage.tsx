import { LoginForm } from '../features/auth/components/LoginForm';
import { Zap } from 'lucide-react';

export function LoginPage() {
  return (
    <div className="min-h-dvh bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-4">
            <Zap size={28} className="text-text-onaccent" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Welcome back</h1>
          <p className="text-sm text-text-muted mt-1">Sign in to your workspace</p>
        </div>

        <div className="glass rounded-2xl p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}