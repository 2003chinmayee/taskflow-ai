// ─── What is .tsx? ────────────────────────────────────────────────
// .tsx = TypeScript + JSX (HTML-like syntax inside JavaScript)
// .ts  = TypeScript only (no HTML)
// Use .tsx for React components, .ts for pure logic files

// ─── What are React Hooks? ────────────────────────────────────────
// Hooks are special functions that start with "use"
// They let functional components have state and side effects
// useState = remember a value that causes re-render when changed
// useNavigate = programmatically navigate to another page

import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Mail, Lock, Zap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function LoginPage() {
  // ─── useState ─────────────────────────────────────────────────
  // useState(initialValue) returns [currentValue, setterFunction]
  // When setter is called, React re-renders the component with new value

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // <string | null> = TypeScript: error can be string or null

  // ─── useNavigate ──────────────────────────────────────────────
  // From React Router — lets us navigate to another page in code
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const registerLink = redirectParam
    ? `/register?redirect=${encodeURIComponent(redirectParam)}`
    : '/register';

  // ─── Get setAuth from Zustand store ───────────────────────────
  const { login, isLoading: authLoading } = useAuth();

  // ─── handleSubmit ─────────────────────────────────────────────
  // Called when the form is submitted
  // async because we need to wait for the API call

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setIsLoading(true);
  try {
    await login({ email, password });
    navigate(redirectParam ? redirectParam : '/dashboard');
  } catch {
    setError('Login failed. Please check your credentials.');
  } finally {
    setIsLoading(false);
  }
};

  // ─── JSX Return ───────────────────────────────────────────────
  // This is what gets rendered to the screen
  // JSX looks like HTML but it's actually JavaScript

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'var(--bg-base)' }}>

      {/* ── Animated background gradient orbs ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #6366F1, transparent)' }} />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #8B5CF6, transparent)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #6366F1, transparent)' }} />
      </div>

      {/* ── Login Card ── */}
      {/* motion.div = Framer Motion animated div */}
      {/* initial = starting state, animate = end state */}
      {/* This creates a fade-in + slide-up animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md mx-4 relative z-10"
      >
        {/* Card container with glassmorphism */}
        <div className="glass rounded-2xl p-8"
          style={{ border: '1px solid var(--border-default)' }}>

          {/* ── Logo ── */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--brand-500)' }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              TaskFlow AI
            </span>
          </div>

          {/* ── Header ── */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Welcome back
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Sign in to your account to continue
            </p>
          </div>

          {/* ── Error Message ── */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 rounded-lg text-sm"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#F87171'
              }}>
              {error}
            </motion.div>
          )}

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email field */}
            <div>
              <label className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--text-secondary)' }}>
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: 'var(--text-tertiary)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm transition-all duration-200"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--brand-500)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: 'var(--text-tertiary)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg text-sm transition-all duration-200"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--brand-500)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
                />
                {/* Show/hide password toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-tertiary)' }}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me + Forgot password row */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: 'var(--brand-500)' }}
                />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Remember me
                </span>
              </label>
              <Link to="/forgot-password"
                className="text-sm transition-colors"
                style={{ color: 'var(--brand-400)' }}>
                Forgot password?
              </Link>
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-medium text-white
                         transition-all duration-200 flex items-center justify-center gap-2
                         disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={{ background: 'var(--brand-500)' }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </motion.button>
          </form>

          {/* ── Footer ── */}
          <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to={registerLink}
              className="font-medium transition-colors"
              style={{ color: 'var(--brand-400)' }}>
              Sign up for free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}