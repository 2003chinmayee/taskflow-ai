import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Lock, Zap, CheckCircle2, XCircle } from 'lucide-react';
import { authApi } from '../../api/authApi';

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authApi.resetPassword(token!, newPassword);
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err?.response?.data?.message ?? 'This reset link is invalid or expired.');
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

          {status === 'idle' && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Set a new password</h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Choose a new password for your account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    New password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg text-sm transition-all duration-200"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', outline: 'none' }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
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
                  {isLoading ? (<><Loader2 className="w-4 h-4 animate-spin" />Resetting...</>) : 'Reset password'}
                </motion.button>
              </form>
            </>
          )}

          {status === 'success' && (
            <div className="text-center py-4">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-4" style={{ color: '#34D399' }} />
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Password reset</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                Your password has been changed successfully.
              </p>
              <button onClick={() => navigate('/login')}
                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all">
                Go to login
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-4">
              <XCircle className="w-10 h-10 mx-auto mb-4" style={{ color: '#F87171' }} />
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Link expired</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{errorMsg}</p>
              <Link to="/forgot-password" className="text-sm font-medium" style={{ color: 'var(--brand-400)' }}>
                Request a new link
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}