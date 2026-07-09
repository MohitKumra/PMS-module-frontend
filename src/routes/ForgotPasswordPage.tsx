import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Mail } from 'lucide-react';
import { useForgotPassword } from '../features/auth/hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const { mutate, isPending, isSuccess } = useForgotPassword();

  return (
    <div className="min-h-dvh bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-4">
            <Zap size={28} className="text-text-onaccent" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Reset password</h1>
          <p className="text-sm text-text-muted mt-1">We'll send you a reset link</p>
        </div>
        <div className="glass rounded-2xl p-6">
          {isSuccess ? (
            <div className="text-center py-4">
              <Mail size={40} className="mx-auto mb-3 text-accent" />
              <p className="text-text-primary font-medium">Check your inbox</p>
              <p className="text-sm text-text-muted mt-1">
                If that email exists, a reset link has been sent.
              </p>
              <Link to="/login" className="mt-4 inline-block text-sm text-accent hover:underline">
                Back to login
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
              <Button type="submit" fullWidth loading={isPending}>
                Send Reset Link
              </Button>
              <Link to="/login" className="text-center text-sm text-text-muted hover:text-text-primary">
                ← Back to login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}