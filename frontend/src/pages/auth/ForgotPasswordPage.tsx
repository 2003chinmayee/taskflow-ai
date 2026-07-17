import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Mail, Zap, CheckCircle2 } from 'lucide-react';
import { authApi } from '../../api/authApi';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'var(--bg-base)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #6366F1, transparent)' }} />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #8B5CF6, transparent)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md mx-4 relative z-10"
      >
        <div className="glass rounded-2xl p-8" style={{ border: '1px solid var(--border-default)' }}>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--brand-500)' }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>TaskFlow AI</span>
          </div>

          {!submitted ? (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Reset your password</h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-3 rounded-lg text-sm"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm transition-all duration-200"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', outline: 'none' }}
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full py-2.5 px-4 rounded-lg text-sm font-medium text-white transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  style={{ background: 'var(--brand-500)' }}
                >
                  {isLoading ? (<><Loader2 className="w-4 h-4 animate-spin" />Sending...</>) : 'Send reset link'}
                </motion.button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-4" style={{ color: '#34D399' }} />
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Check your email</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                If an account exists for <strong>{email}</strong>, a reset link is on its way.
              </p>
            </div>
          )}

          <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            <Link to="/login" className="font-medium transition-colors" style={{ color: 'var(--brand-400)' }}>
              Back to login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}