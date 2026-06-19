import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { supabase } from '../lib/supabase';

type Tab = 'wishlist' | 'bug';

const WISHLIST_CATEGORIES = [
  'General',
  'Referee Tools',
  'Clubs & Leagues',
  'Player Dashboard',
  'Camera',
  'Marketplace',
  'Other',
];

const SEVERITY_OPTIONS = ['Minor', 'Medium', 'Critical'];

interface WishlistItem {
  id: string;
  text: string;
  category: string;
  ts: number;
}

interface BugItem {
  id: string;
  text: string;
  severity: string;
  ts: number;
}

export default function FeedbackButton() {
  const userId      = useGameStore((s) => s.userId);
  const activeTab   = useGameStore((s) => s.activeTab);
  const currentGame = useGameStore((s) => s.currentGame);

  // Only show after user has been in the app a while, and not on leagues/welcome views
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    // Appear after 30 seconds, and only if not on the opening leagues tab without a game
    const t = setTimeout(() => setVisible(true), 30_000);
    return () => clearTimeout(t);
  }, []);

  // Also show immediately if triggered by event
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('wishlist');

  // Wishlist state
  const [wishText, setWishText] = useState('');
  const [wishCategory, setWishCategory] = useState(WISHLIST_CATEGORIES[0]);
  const [wishSuccess, setWishSuccess] = useState(false);

  // Bug state
  const [bugText, setBugText] = useState('');
  const [bugSeverity, setBugSeverity] = useState(SEVERITY_OPTIONS[0]);
  const [bugSuccess, setBugSuccess] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Listen for fairplay:openFeedback custom event — also makes button visible immediately
  useEffect(() => {
    const handler = () => { setVisible(true); setOpen(true); };
    window.addEventListener('fairplay:openFeedback', handler);
    return () => window.removeEventListener('fairplay:openFeedback', handler);
  }, []);

  const handleSubmitWishlist = () => {
    if (wishText.trim().length < 3) return;
    const item: WishlistItem = {
      id: `w-${Date.now()}`,
      text: wishText.trim(),
      category: wishCategory,
      ts: Date.now(),
    };
    const existing: WishlistItem[] = JSON.parse(localStorage.getItem('fp_wishlist') ?? '[]');
    localStorage.setItem('fp_wishlist', JSON.stringify([...existing, item]));

    if (supabase) {
      void Promise.resolve(
        supabase
          .from('feedback')
          .insert({ type: 'wishlist', text: item.text, category: item.category, user_id: userId })
      ).then(() => {}, () => {});
    }

    setWishText('');
    setWishCategory(WISHLIST_CATEGORIES[0]);
    setWishSuccess(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setWishSuccess(false);
      setOpen(false);
    }, 1500);
  };

  const handleSubmitBug = () => {
    if (bugText.trim().length < 3) return;
    const item: BugItem = {
      id: `b-${Date.now()}`,
      text: bugText.trim(),
      severity: bugSeverity,
      ts: Date.now(),
    };
    const existing: BugItem[] = JSON.parse(localStorage.getItem('fp_bugs') ?? '[]');
    localStorage.setItem('fp_bugs', JSON.stringify([...existing, item]));

    if (supabase) {
      void Promise.resolve(
        supabase
          .from('feedback')
          .insert({ type: 'bug', text: item.text, category: item.severity, user_id: userId })
      ).then(() => {}, () => {});
    }

    setBugText('');
    setBugSeverity(SEVERITY_OPTIONS[0]);
    setBugSuccess(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setBugSuccess(false);
      setOpen(false);
    }, 1500);
  };

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#fff',
    outline: 'none',
    fontSize: 'clamp(12px, 1.5vw, 15px)',
    resize: 'none' as const,
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    background: 'rgba(255,255,255,0.07)',
  };

  // Hide on leagues tab when no game picked yet (the "start" state)
  const shouldHide = !visible || (activeTab === 'leagues' && !currentGame);

  return (
    <>
      {/* Floating trigger button — quiet, no pulse, appears after 30s */}
      <button
        className="call-btn"
        style={{
          position: 'fixed',
          bottom: 88,
          right: 14,
          zIndex: 40,
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'rgba(255,200,0,0.08)',
          border: '1px solid rgba(255,200,0,0.18)',
          color: 'rgba(255,200,0,0.55)',
          fontSize: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: shouldHide ? 0 : 1,
          pointerEvents: shouldHide ? 'none' : 'auto',
          transition: 'opacity 0.4s ease',
        }}
        onClick={() => setOpen(true)}
        title="Feedback & Wishlist"
      >
        💡
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: '0 0 max(env(safe-area-inset-bottom), 8px) 0',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div
            className="w-full max-w-lg rounded-t-2xl flex flex-col"
            style={{
              background: '#111827',
              border: '1px solid rgba(255,255,255,0.08)',
              borderBottom: 'none',
              maxHeight: '85dvh',
            }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)' }} />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 px-4 pb-3 pt-1">
              {([['wishlist', '💡 WISHLIST'], ['bug', '🐛 BUG REPORT']] as [Tab, string][]).map(([id, label]) => (
                <button
                  key={id}
                  className={`call-btn flex-1 py-2 rounded-lg font-bold ${tab === id ? 'active' : ''}`}
                  style={{
                    background: tab === id ? 'rgba(255,200,0,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${tab === id ? 'rgba(255,200,0,0.35)' : 'rgba(255,255,255,0.08)'}`,
                    color: tab === id ? '#ffc800' : 'rgba(255,255,255,0.4)',
                    fontSize: 'clamp(11px, 1.4vw, 14px)',
                    letterSpacing: '0.5px',
                  }}
                  onClick={() => setTab(id)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div
              className="flex-1 scrollable px-4 pb-5 space-y-3"
              style={{ overflowY: 'auto' }}
            >
              {/* WISHLIST tab */}
              {tab === 'wishlist' && (
                <>
                  {wishSuccess ? (
                    <div
                      className="flex flex-col items-center justify-center py-10 gap-3"
                      style={{ color: '#00ff88', fontSize: 'clamp(14px, 2vw, 18px)', fontWeight: 700 }}
                    >
                      <span style={{ fontSize: 'clamp(36px, 6vw, 52px)' }}>✅</span>
                      Added to wishlist! Thank you.
                    </div>
                  ) : (
                    <>
                      <div>
                        <label
                          className="block font-bold uppercase tracking-wider mb-1 text-white/50"
                          style={{ fontSize: 'clamp(9px, 1.1vw, 12px)' }}
                        >
                          Feature idea
                        </label>
                        <textarea
                          rows={4}
                          placeholder="Describe the feature you'd love to see…"
                          value={wishText}
                          onChange={(e) => setWishText(e.target.value)}
                          className="w-full rounded-xl px-3 py-2.5"
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label
                          className="block font-bold uppercase tracking-wider mb-1 text-white/50"
                          style={{ fontSize: 'clamp(9px, 1.1vw, 12px)' }}
                        >
                          Category
                        </label>
                        <select
                          value={wishCategory}
                          onChange={(e) => setWishCategory(e.target.value)}
                          className="w-full rounded-xl px-3 py-2.5"
                          style={selectStyle}
                        >
                          {WISHLIST_CATEGORIES.map((c) => (
                            <option key={c} value={c} style={{ background: '#0d1117' }}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        className="call-btn w-full py-3 rounded-xl font-bold"
                        disabled={wishText.trim().length < 3}
                        style={{
                          background: wishText.trim().length >= 3 ? 'rgba(255,200,0,0.2)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${wishText.trim().length >= 3 ? 'rgba(255,200,0,0.45)' : 'rgba(255,255,255,0.08)'}`,
                          color: wishText.trim().length >= 3 ? '#ffc800' : 'rgba(255,255,255,0.25)',
                          fontSize: 'clamp(12px, 1.6vw, 15px)',
                          letterSpacing: '0.5px',
                        }}
                        onClick={handleSubmitWishlist}
                      >
                        💡 SUBMIT WISHLIST ITEM
                      </button>
                    </>
                  )}
                </>
              )}

              {/* BUG REPORT tab */}
              {tab === 'bug' && (
                <>
                  {bugSuccess ? (
                    <div
                      className="flex flex-col items-center justify-center py-10 gap-3"
                      style={{ color: '#00ff88', fontSize: 'clamp(14px, 2vw, 18px)', fontWeight: 700 }}
                    >
                      <span style={{ fontSize: 'clamp(36px, 6vw, 52px)' }}>✅</span>
                      Bug reported! Thank you.
                    </div>
                  ) : (
                    <>
                      <div>
                        <label
                          className="block font-bold uppercase tracking-wider mb-1 text-white/50"
                          style={{ fontSize: 'clamp(9px, 1.1vw, 12px)' }}
                        >
                          What happened?
                        </label>
                        <textarea
                          rows={4}
                          placeholder="Describe what happened and what you expected…"
                          value={bugText}
                          onChange={(e) => setBugText(e.target.value)}
                          className="w-full rounded-xl px-3 py-2.5"
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label
                          className="block font-bold uppercase tracking-wider mb-1 text-white/50"
                          style={{ fontSize: 'clamp(9px, 1.1vw, 12px)' }}
                        >
                          Severity
                        </label>
                        <select
                          value={bugSeverity}
                          onChange={(e) => setBugSeverity(e.target.value)}
                          className="w-full rounded-xl px-3 py-2.5"
                          style={selectStyle}
                        >
                          {SEVERITY_OPTIONS.map((s) => (
                            <option key={s} value={s} style={{ background: '#0d1117' }}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        className="call-btn w-full py-3 rounded-xl font-bold"
                        disabled={bugText.trim().length < 3}
                        style={{
                          background: bugText.trim().length >= 3 ? 'rgba(255,80,80,0.2)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${bugText.trim().length >= 3 ? 'rgba(255,80,80,0.4)' : 'rgba(255,255,255,0.08)'}`,
                          color: bugText.trim().length >= 3 ? '#ff5555' : 'rgba(255,255,255,0.25)',
                          fontSize: 'clamp(12px, 1.6vw, 15px)',
                          letterSpacing: '0.5px',
                        }}
                        onClick={handleSubmitBug}
                      >
                        🐛 SUBMIT BUG REPORT
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
