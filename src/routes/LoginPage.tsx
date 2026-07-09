import { LoginForm } from '../features/auth/components/LoginForm';
import { Zap } from 'lucide-react';
import { Card } from '../components/ui/Card';

export function LoginPage() {
  return (
    <div 
      className="min-h-dvh flex items-center justify-center p-6"
      style={{
        background: 'radial-gradient(circle at top right, var(--color-accent-subtle), var(--color-bg))',
      }}
    >
      <div className="w-full max-w-sm animate-scale-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 select-none">
          <div 
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-accent/15"
            style={{ background: 'var(--gradient-accent)' }}
          >
            <Zap size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight">Welcome back</h1>
          <p className="text-sm text-text-muted mt-1.5 font-medium">Sign in to your productivity workspace</p>
        </div>

        <Card variant="glass" className="p-6 sm:p-8 shadow-xl">
          <LoginForm />
        </Card>
      </div>
    </div>
  );
}