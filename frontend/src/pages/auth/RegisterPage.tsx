import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Mail, Lock, User, Zap, Check } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

// ─── Password strength checker ────────────────────────────────────
// Returns a score 0-4 based on password complexity
function getPasswordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;   // Has uppercase
  if (/[0-9]/.test(password)) score++;   // Has number
  if (/[^A-Za-z0-9]/.test(password)) score++; // Has special char
  return score;
}

const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColors = ['', '#EF4444', '#F59E0B', '#3B82F6', '#10B981'];

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();

  // Calculate password strength reactively
  const passwordStrength = getPasswordStrength(password);

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setIsLoading(true);
  try {
    await register({ name, email, password });
    const redirect = searchParams.get('redirect');
    navigate(redirect ? redirect : '/dashboard');
  } catch {
    setError('Registration failed. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-8"
      style={{ background: 'var(--bg-base)' }}>

      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #6366F1, transparent)' }} />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #8B5CF6, transparent)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md mx-4 relative z-10"
      >
        <div className="glass rounded-2xl p-8"
          style={{ border: '1px solid var(--border-default)' }}>

          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--brand-500)' }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold"
              style={{ color: 'var(--text-primary)' }}>
              TaskFlow AI
            </span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2"
              style={{ color: 'var(--text-primary)' }}>
              Create your account
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Start managing projects smarter with AI
            </p>
          </div>

          {/* Error */}
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

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name field */}
            <div>
              <label className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--text-secondary)' }}>
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: 'var(--text-tertiary)' }} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Foxy Dev"
                  required
                  minLength={2}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm"
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm"
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
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg text-sm"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--brand-500)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-tertiary)' }}>
                  {showPassword
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength indicator */}
              {password.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{
                          background: passwordStrength >= level
                            ? strengthColors[passwordStrength]
                            : 'var(--border-default)'
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs" style={{
                    color: strengthColors[passwordStrength] || 'var(--text-tertiary)'
                  }}>
                    {strengthLabels[passwordStrength]}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Terms notice */}
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              By creating an account, you agree to our{' '}
              <span style={{ color: 'var(--brand-400)' }} className="cursor-pointer">
                Terms of Service
              </span>{' '}
              and{' '}
              <span style={{ color: 'var(--brand-400)' }} className="cursor-pointer">
                Privacy Policy
              </span>
            </p>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-medium text-white
                         flex items-center justify-center gap-2
                         disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--brand-500)' }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Create account
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm"
            style={{ color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to={`/login${searchParams.get('redirect') ? `?redirect=${searchParams.get('redirect')}` : ''}`}
              className="font-medium"
              style={{ color: 'var(--brand-400)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}