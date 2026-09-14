import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setHasSession(Boolean(data.session));
      setCheckingSession(false);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setHasSession(Boolean(session));
      setCheckingSession(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!hasSession) {
      setError('Your reset link may have expired. Please request a new one.');
      return;
    }

    if (!newPassword) {
      setError('Enter a new password.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setSuccess(true);
    } catch (err: any) {
      console.error('Supabase password update error:', err);
      setError('Could not update your password. Please request a new reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-8 relative overflow-hidden"
      style={{
        background: `url('/assets/lunara-moon-bg.webp') center/cover no-repeat, linear-gradient(180deg, #0B1020 0%, #121A2E 50%, #0B1020 100%)`,
      }}
    >
      <div className="absolute inset-0 bg-lunara-primary/40" />

      <div className="lunara-glass-card w-full max-w-sm sm:max-w-lg p-6 sm:p-8 rounded-2xl relative z-10">
        <div className="text-center mb-6 sm:mb-8">
          <div className="mb-4">
            <span className="text-2xl sm:text-3xl tracking-[0.4em] font-garamond font-light text-pearl-mist">
              LUNARA
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-garamond font-medium text-pearl-mist mb-2">
            Choose a new password
          </h2>
          <p className="text-sm sm:text-base font-garamond italic text-muted-stardust">
            Return softly with a password only you know.
          </p>
        </div>

        <div className="ornamental-divider mb-6 sm:mb-8"></div>

        {checkingSession ? (
          <p className="text-center font-garamond text-lunara-silver">Checking your reset link...</p>
        ) : success ? (
          <div className="space-y-5 text-center">
            <p className="font-garamond text-lunara-silver">Your password has been updated.</p>
            <Button
              type="button"
              onClick={() => navigate('/login')}
              className="lunara-button w-full font-garamond text-base sm:text-lg py-3 sm:py-4 rounded-full min-h-[48px]"
            >
              Back to login
            </Button>
          </div>
        ) : (
          <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
            {!hasSession && (
              <p className="text-error-rose text-center text-sm sm:text-base px-2">
                Your reset link may have expired. Please request a new one.
              </p>
            )}

            <div className="relative">
              <label htmlFor="new-password" className="block font-garamond text-sm sm:text-base text-pearl-mist mb-2 font-medium">
                New password
              </label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter a new password"
                className="lunara-auth-input mt-1 h-12 sm:h-14 rounded-xl text-base transition-all duration-300"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading || !hasSession}
                autoComplete="new-password"
              />
            </div>

            <div className="relative">
              <label htmlFor="confirm-new-password" className="block font-garamond text-sm sm:text-base text-pearl-mist mb-2 font-medium">
                Confirm password
              </label>
              <Input
                id="confirm-new-password"
                type="password"
                placeholder="Confirm your new password"
                className="lunara-auth-input mt-1 h-12 sm:h-14 rounded-xl text-base transition-all duration-300"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading || !hasSession}
                autoComplete="new-password"
              />
            </div>

            {error && <p className="text-error-rose text-center mb-4 text-sm sm:text-base px-2">{error}</p>}

            <Button
              type="submit"
              disabled={isLoading || !hasSession}
              className="lunara-button w-full font-garamond text-base sm:text-lg py-3 sm:py-4 rounded-full mt-4 sm:mt-6 shadow-lg transition-all duration-300 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
            >
              <span className="relative z-10">
                {isLoading ? 'Updating...' : 'Update password'}
              </span>
            </Button>

            <Link
              to="/login"
              className="mx-auto flex min-h-[44px] items-center justify-center font-garamond text-sm text-lunara-silver transition-colors hover:text-lunara-glow hover:underline focus-visible:outline-none focus-visible:text-lunara-glow"
            >
              Back to login
            </Link>
          </form>
        )}
      </div>
    </section>
  );
}
