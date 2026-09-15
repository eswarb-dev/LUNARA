import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '../lib/supabaseClient';

type LoginMode = 'login' | 'reset-request';

export default function Login() {
  const [mode, setMode] = useState<LoginMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);

      toast({
        title: "Welcome back to Lunara!",
        description: "You have successfully signed in to your journal.",
        className: "font-garamond"
      });

      navigate('/profile');
    } catch (err: any) {
      console.error("Supabase login error:", err);
      const msg = err?.message || '';

      let userMessage: string;

      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        userMessage = 'Supabase is not configured. Check .env file.';
      } else if (msg.includes('Email not confirmed')) {
        userMessage = 'This account is not ready to sign in yet. Please try again later.';
      } else if (msg.includes('Invalid login credentials')) {
        userMessage = 'Invalid email or password.';
      } else if (msg.includes('rate limit') || err?.status === 429) {
        userMessage = 'Too many attempts. Please wait and try again.';
      } else {
        userMessage = 'Login failed. Please try again.';
      }

      setError(userMessage);

      toast({
        title: "Authentication Failed",
        description: userMessage,
        variant: "destructive",
        className: "bg-error-rose/10 border-error-rose/20 shadow-lg font-garamond"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = resetEmail.trim().toLowerCase();
    setResetError('');
    setResetMessage('');

    if (!trimmedEmail) {
      setResetError('Enter your email to receive a reset link.');
      return;
    }

    setResetLoading(true);
    try {
      const { error: resetRequestError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetRequestError) throw resetRequestError;

      setResetMessage('If an account exists for this email, a reset link has been sent.');
    } catch (err: any) {
      console.error('Supabase password reset request error:', err);
      setResetError('Could not send a reset link right now. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  const showResetRequest = () => {
    setMode('reset-request');
    setResetEmail(email);
    setError('');
    setResetError('');
    setResetMessage('');
  };

  const showLogin = () => {
    setMode('login');
    setResetError('');
    setResetMessage('');
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-8 relative overflow-hidden"
      style={{
        background: `url('/assets/lunara-moon-bg.webp') center/cover no-repeat, linear-gradient(180deg, #0B1020 0%, #121A2E 50%, #0B1020 100%)`
      }}
    >
      <div className="absolute inset-0 bg-lunara-primary/40" />

      <div className="lunara-glass-card w-full max-w-sm sm:max-w-lg p-6 sm:p-8 rounded-2xl relative z-10">

        <div className="text-center mb-6 sm:mb-8">
          <div className="mb-4">
            <span className="text-2xl sm:text-3xl tracking-[0.4em] font-garamond font-light text-pearl-mist">LUNARA</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-garamond font-medium text-pearl-mist mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Reset your password'}
          </h2>
          <p className="text-sm sm:text-base font-garamond italic text-muted-stardust">
            {mode === 'login'
              ? '"Reflect softly. Heal privately."'
              : "Enter your email and we'll send a secure reset link."}
          </p>
        </div>

        <div className="ornamental-divider mb-6 sm:mb-8"></div>

        {mode === 'login' ? (
          <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
            <div className="relative">
              <label htmlFor="email" className="block font-garamond text-sm sm:text-base text-pearl-mist mb-2 font-medium">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="lunara-auth-input mt-1 h-12 sm:h-14 rounded-xl text-base transition-all duration-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div className="relative">
              <div className="mb-2 flex items-center justify-between gap-3">
                <label htmlFor="password" className="block font-garamond text-sm sm:text-base text-pearl-mist font-medium">
                  Password
                </label>
                <button
                  type="button"
                  onClick={showResetRequest}
                  className="font-garamond text-sm text-lunara-silver transition-colors hover:text-lunara-glow hover:underline focus-visible:outline-none focus-visible:text-lunara-glow rounded-sm"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="lunara-auth-input mt-1 h-12 sm:h-14 rounded-xl text-base transition-all duration-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            {error && <p className="text-error-rose text-center mb-4 text-sm sm:text-base px-2">{error}</p>}
            <Button
              type="submit"
              disabled={isLoading}
              className="lunara-button w-full font-garamond text-base sm:text-lg py-3 sm:py-4 rounded-full mt-4 sm:mt-6 shadow-lg transition-all duration-300 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
            >
              <span className="relative z-10">
                {isLoading ? 'Signing In...' : 'Login'}
              </span>
            </Button>
          </form>
        ) : (
          <form className="space-y-4 sm:space-y-5" onSubmit={handleResetRequest}>
            <div className="relative">
              <label htmlFor="reset-email" className="block font-garamond text-sm sm:text-base text-pearl-mist mb-2 font-medium">
                Email Address
              </label>
              <Input
                id="reset-email"
                type="email"
                placeholder="Enter your email"
                className="lunara-auth-input mt-1 h-12 sm:h-14 rounded-xl text-base transition-all duration-300"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                disabled={resetLoading}
                autoComplete="email"
              />
            </div>

            {resetError && <p className="text-error-rose text-center mb-4 text-sm sm:text-base px-2">{resetError}</p>}
            {resetMessage && <p className="text-lunara-silver text-center mb-4 text-sm sm:text-base px-2 font-garamond">{resetMessage}</p>}

            <Button
              type="submit"
              disabled={resetLoading}
              className="lunara-button w-full font-garamond text-base sm:text-lg py-3 sm:py-4 rounded-full mt-4 sm:mt-6 shadow-lg transition-all duration-300 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
            >
              <span className="relative z-10">
                {resetLoading ? 'Sending...' : 'Send reset link'}
              </span>
            </Button>

            <button
              type="button"
              onClick={showLogin}
              disabled={resetLoading}
              className="mx-auto block font-garamond text-sm text-lunara-silver transition-colors hover:text-lunara-glow hover:underline focus-visible:outline-none focus-visible:text-lunara-glow disabled:opacity-50"
            >
              Back to login
            </button>
          </form>
        )}

        {mode === 'login' && (
        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-sm sm:text-base text-muted-stardust font-garamond px-2">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-lunara-glow hover:text-pearl-mist font-medium underline-offset-4 transition-all duration-300 hover:underline min-h-[44px] inline-flex items-center focus-visible:outline-none focus-visible:text-pearl-mist"
            >
              Register
            </Link>
          </p>
        </div>
        )}
      </div>
    </section>
  );
}
