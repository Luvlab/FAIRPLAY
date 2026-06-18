import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

export default function AuthModal() {
  const authModal = useGameStore((s) => s.authModal);
  const closeAuthModal = useGameStore((s) => s.closeAuthModal);
  const doSignUp = useGameStore((s) => s.doSignUp);
  const doSignIn = useGameStore((s) => s.doSignIn);
  const doSignOut = useGameStore((s) => s.doSignOut);
  const userProfile = useGameStore((s) => s.userProfile);

  const [mode, setMode] = useState<'login' | 'register'>(authModal === 'register' ? 'register' : 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  if (authModal === 'hidden') return null;

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    if (mode === 'register') {
      if (!name.trim()) { setError('Please enter your name'); setLoading(false); return; }
      const res = await doSignUp(email, password, name.trim());
      if (res?.error) { setError(res.error); setLoading(false); return; }
      setSuccess('Account created! Check your email to confirm.');
    } else {
      const res = await doSignIn(email, password);
      if (res?.error) { setError(res.error); setLoading(false); return; }
      closeAuthModal();
    }
    setLoading(false);
  };

  // Logged-in profile view
  if (userProfile) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.8)' }} onClick={closeAuthModal}>
        <div
          className="rounded-2xl p-6 w-full max-w-sm mx-4"
          style={{ background: '#0d1117', border: '1px solid rgba(0,212,255,0.2)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">👤</div>
            <div className="font-black text-lg" style={{ color: '#00d4ff' }}>{userProfile.displayName}</div>
            <div className="text-white/40 text-sm mt-1">{userProfile.email}</div>
          </div>
          <button
            className="w-full py-3 rounded-xl font-bold call-btn"
            style={{ background: 'rgba(255,68,68,0.15)', border: '1px solid rgba(255,68,68,0.3)', color: '#ff4444' }}
            onClick={() => { doSignOut(); closeAuthModal(); }}
          >
            Sign Out
          </button>
          <button
            className="w-full py-2 rounded-xl font-bold call-btn mt-2 text-white/40 text-sm"
            onClick={closeAuthModal}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.85)' }} onClick={closeAuthModal}>
      <div
        className="rounded-2xl p-6 w-full max-w-sm mx-4"
        style={{ background: '#0d1117', border: '1px solid rgba(0,212,255,0.2)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-5">
          <span style={{ fontSize: 36 }}>⚽</span>
          <div className="font-black text-xl mt-1" style={{ color: '#00d4ff' }}>
            {mode === 'register' ? 'Join FAIRPLAY' : 'Welcome back'}
          </div>
          <div className="text-white/40 text-sm mt-1">
            {mode === 'register'
              ? 'Create your free referee account'
              : 'Sign in to your account'}
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-lg p-1 mb-5" style={{ background: 'rgba(255,255,255,0.05)' }}>
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              className="flex-1 py-1.5 rounded-md font-bold text-sm transition-all"
              style={mode === m
                ? { background: 'rgba(0,212,255,0.2)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.3)' }
                : { color: 'rgba(255,255,255,0.4)' }
              }
              onClick={() => { setMode(m); setError(null); setSuccess(null); }}
            >
              {m === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {mode === 'register' && (
            <div>
              <label className="text-white/50 text-xs font-bold uppercase tracking-wider block mb-1">Display Name</label>
              <input
                type="text"
                placeholder="e.g. The Ref"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', outline: 'none' }}
              />
            </div>
          )}
          <div>
            <label className="text-white/50 text-xs font-bold uppercase tracking-wider block mb-1">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-sm"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', outline: 'none' }}
            />
          </div>
          <div>
            <label className="text-white/50 text-xs font-bold uppercase tracking-wider block mb-1">Password</label>
            <input
              type="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full rounded-lg px-3 py-2.5 text-sm"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', outline: 'none' }}
            />
          </div>

          {error && (
            <div className="text-xs text-center py-2 px-3 rounded-lg" style={{ background: 'rgba(255,68,68,0.1)', color: '#ff6666', border: '1px solid rgba(255,68,68,0.2)' }}>
              {error}
            </div>
          )}
          {success && (
            <div className="text-xs text-center py-2 px-3 rounded-lg" style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)' }}>
              {success}
            </div>
          )}

          <button
            className="w-full py-3 rounded-xl font-bold call-btn mt-1"
            style={{ background: loading ? 'rgba(0,212,255,0.1)' : 'rgba(0,212,255,0.2)', border: '1px solid rgba(0,212,255,0.4)', color: '#00d4ff' }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? '⏳ ...' : mode === 'register' ? '🚀 Create Account' : '🔐 Sign In'}
          </button>

          <div className="text-center text-xs text-white/25 pt-1">
            By signing up you agree to our terms. Your account is free forever.
          </div>
        </div>

        <button className="absolute top-3 right-4 text-white/30 text-xl call-btn" onClick={closeAuthModal}>×</button>
      </div>
    </div>
  );
}
