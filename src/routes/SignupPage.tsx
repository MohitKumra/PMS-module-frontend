import { SignupForm } from '../features/auth/components/SignupForm';
import { Zap } from 'lucide-react';
import { Card } from '../components/ui/Card';

export function SignupPage() {
  return (
    <div 
      className="min-h-dvh flex items-center justify-center p-6"
      style={{
        background: 'radial-gradient(circle at top right, var(--color-accent-subtle), var(--color-bg))',
      }}
    >
      <div className="w-full max-w-sm animate-scale-in">
        <div className="flex flex-col items-center mb-8 select-none">
          <div 
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-accent/15"
            style={{ background: 'var(--gradient-accent)' }}
          >
            <Zap size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight">Create account</h1>
          <p className="text-sm text-text-muted mt-1.5 font-medium">Start your productivity journey today</p>
        </div>
        <Card variant="glass" className="p-6 sm:p-8 shadow-xl">
          <SignupForm />
        </Card>
      </div>
    </div>
  );
}