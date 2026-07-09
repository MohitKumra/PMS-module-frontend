import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Mail } from 'lucide-react';
import { useForgotPassword } from '../features/auth/hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const { mutate, isPending, isSuccess } = useForgotPassword();

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
          <h1 className="text-2xl font-black text-text-primary tracking-tight">Reset password</h1>
          <p className="text-sm text-text-muted mt-1.5 font-medium">We'll send you a password reset link</p>
        </div>
        <Card variant="glass" className="p-6 sm:p-8 shadow-xl">
          {isSuccess ? (
            <div className="text-center py-4">
              <Mail size={40} className="mx-auto mb-3 text-accent" />
              <p className="text-text-primary font-bold">Check your inbox</p>
              <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                If that email exists, a reset link has been sent.
              </p>
              <Link to="/login" className="mt-6 inline-block">
                <Button variant="secondary" size="sm">Back to login</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); mutate(email); }} className="flex flex-col gap-4">
              <Input
                id="forgot-email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail size={16} />}
                required
              />
              <Button type="submit" fullWidth loading={isPending} className="mt-2">
                Send Reset Link
              </Button>
              <Link to="/login" className="text-center text-xs font-bold text-text-muted hover:text-text-primary mt-2">
                ← Back to login
              </Link>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}