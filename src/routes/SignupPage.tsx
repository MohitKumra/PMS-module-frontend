import { SignupForm } from '../features/auth/components/SignupForm';
import { Zap } from 'lucide-react';

export function SignupPage() {
  return (
    <div className="min-h-dvh bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-4">
            <Zap size={28} className="text-text-onaccent" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Create account</h1>
          <p className="text-sm text-text-muted mt-1">Start your productivity journey</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}