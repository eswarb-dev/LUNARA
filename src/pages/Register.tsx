import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2 } from 'lucide-react';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      await register(email, password, fullName);
      setSuccess(true);
    } catch (err: any) {
      console.error("Supabase signup error:", err);
      const msg = err?.message || '';
      const status = err?.status;

      const isRateLimit =
        status === 429 ||
        msg.includes('rate limit') ||
        msg.includes('over_email_send_rate_limit') ||
        msg.includes('email rate limit');

      if (isRateLimit) {
        setError('Too many signup emails were requested. Please wait for some time before trying again.');
      } else if (msg.includes('already registered') || msg.includes('already been registered')) {
        setError('This email is already registered. Please login instead.');
      } else if (msg.includes('valid email')) {
        setError('Please enter a valid email address.');
      } else if (msg.includes('password')) {
        setError('Password must be at least 6 characters.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-8 relative overflow-hidden"
        style={{
          background: `url('/assets/lunara-moon-bg.webp') center/cover no-repeat, linear-gradient(180deg, #0B1020 0%, #121A2E 50%, #0B1020 100%)`
        }}
      >
        <div className="absolute inset-0 bg-lunara-primary/40" />
        <div className="lunara-glass-card w-full max-w-md p-8 rounded-2xl text-center relative z-10">
          <div className="mb-4">
            <span className="text-2xl tracking-[0.4em] font-garamond font-light text-pearl-mist">LUNARA</span>
          </div>
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-moon-gold/35 bg-moon-gold/10 text-moon-gold shadow-[0_0_22px_rgba(230,195,122,0.18)]">
            <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-garamond font-medium text-pearl-mist mb-3">
            Account created successfully
          </h2>
          <p className="text-lunara-silver font-garamond mb-2">
            Your Lunara account is ready.
          </p>
          <p className="text-muted-stardust font-garamond mb-6">
            You can now return to login and enter your journal.
          </p>
          <Button
            type="button"
            onClick={() => navigate('/login')}
            className="lunara-button font-garamond text-lg py-3 rounded-full"
          >
            Back to Login
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-8 relative overflow-hidden"
      style={{
        background: `url('/assets/lunara-moon-bg.webp') center/cover no-repeat, linear-gradient(180deg, #0B1020 0%, #121A2E 50%, #0B1020 100%)`
      }}
    >
      <div className="absolute inset-0 bg-lunara-primary/40" />

      <div className="lunara-glass-card w-full max-w-lg p-6 sm:p-8 rounded-2xl relative z-10">

        <div className="text-center mb-6">
          <div className="mb-4">
            <span className="text-2xl sm:text-3xl tracking-[0.4em] font-garamond font-light text-pearl-mist">LUNARA</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-garamond font-medium text-pearl-mist mb-2">
            Begin Your Journey
          </h2>
          <p className="text-sm sm:text-base font-garamond italic text-muted-stardust">
            "Reflect softly. Heal privately."
          </p>
        </div>

        <div className="ornamental-divider mb-6"></div>

        <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
          <div className="relative">
            <label htmlFor="fullName" className="block font-garamond text-sm sm:text-base text-pearl-mist mb-2 font-medium">
              Full Name
            </label>
            <Input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              className="lunara-auth-input mt-1 h-12 rounded-xl text-base transition-all duration-300"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
              autoComplete="name"
            />
          </div>

          <div className="relative">
            <label htmlFor="email" className="block font-garamond text-sm sm:text-base text-pearl-mist mb-2 font-medium">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="lunara-auth-input mt-1 h-12 rounded-xl text-base transition-all duration-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="block font-garamond text-sm sm:text-base text-pearl-mist mb-2 font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password (min 6 characters)"
              className="lunara-auth-input mt-1 h-12 rounded-xl text-base transition-all duration-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>

          <div className="relative">
            <label htmlFor="confirmPassword" className="block font-garamond text-sm sm:text-base text-pearl-mist mb-2 font-medium">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              className="lunara-auth-input mt-1 h-12 rounded-xl text-base transition-all duration-300"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>

          {error && <p className="text-error-rose text-center mb-4">{error}</p>}
          <Button
            type="submit"
            disabled={isLoading}
            className="lunara-button w-full font-garamond text-lg py-4 rounded-full mt-6 shadow-lg transition-all duration-300 relative overflow-hidden disabled:opacity-50 min-h-[48px]"
          >
            <span className="relative z-10">{isLoading ? 'Creating Account...' : 'Start Writing'}</span>
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-base text-muted-stardust font-garamond">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-lunara-glow hover:text-pearl-mist font-medium underline-offset-4 transition-all duration-300 hover:underline focus-visible:outline-none focus-visible:text-pearl-mist"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
