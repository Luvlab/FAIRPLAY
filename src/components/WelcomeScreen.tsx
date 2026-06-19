import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useT } from '../context/I18nContext';

interface Props { onEnter: () => void }

export default function WelcomeScreen({ onEnter }: Props) {
  const t = useT();
  const setActiveTab   = useGameStore((s) => s.setActiveTab);
  const liveMatchCount = useGameStore((s) => s.liveMatchCount);
  const openAuthModal  = useGameStore((s) => s.openAuthModal);
  // Staggered reveal phases
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),   // logo
      setTimeout(() => setPhase(2), 500),   // tagline
      setTimeout(() => setPhase(3), 900),   // "choose" heading
      setTimeout(() => setPhase(4), 1100),  // card 1
      setTimeout(() => setPhase(5), 1280),  // card 2
      setTimeout(() => setPhase(6), 1440),  // card 3
      setTimeout(() => setPhase(7), 1700),  // footer
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const enter = (tab: 'leagues' | 'referee', view?: string) => {
    setActiveTab(tab);
    if (view) sessionStorage.setItem('fp_welcome_view', view);
    onEnter();
  };

  const show = (p: number) => phase >= p;

  const fade = (p: number, delay = 0): React.CSSProperties => ({
    opacity:   phase >= p ? 1 : 0,
    transform: phase >= p ? 'translateY(0)' : 'translateY(24px)',
    transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
  });

  return (
    <div
      style={{
        width: '100dvw', height: '100dvh',
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #050810 0%, #0d1117 50%, #0a1420 100%)',
        display: 'flex', flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* ── Ambient orbs ──────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
          width: 'clamp(300px,80vw,700px)', height: 'clamp(200px,50vh,500px)',
          background: 'radial-gradient(ellipse, rgba(0,212,255,0.10) 0%, transparent 70%)',
          animation: 'driftA 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '5%', right: '-5%',
          width: 'clamp(200px,40vw,400px)', height: 'clamp(200px,40vw,400px)',
          background: 'radial-gradient(ellipse, rgba(0,255,136,0.07) 0%, transparent 70%)',
          animation: 'driftB 11s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', top: '40%', left: '-8%',
          width: 'clamp(150px,30vw,300px)', height: 'clamp(150px,30vw,300px)',
          background: 'radial-gradient(ellipse, rgba(255,68,68,0.07) 0%, transparent 70%)',
          animation: 'driftC 9s ease-in-out infinite',
        }} />
      </div>

      {/* ── Scrollable body ───────────────────────────────────────────── */}
      <div
        className="scrollable"
        style={{
          flex: 1,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: 'clamp(24px,5vh,48px) clamp(16px,5vw,40px)',
          gap: 'clamp(16px,3vh,28px)',
          position: 'relative', zIndex: 1,
        }}
      >

        {/* ── Hero ──────────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', ...fade(1) }}>
          <div style={{
            fontSize: 'clamp(52px,12vw,88px)',
            lineHeight: 1,
            filter: 'drop-shadow(0 0 20px rgba(0,212,255,0.55)) drop-shadow(0 0 60px rgba(0,212,255,0.2))',
            marginBottom: 'clamp(8px,2vh,16px)',
            animation: phase >= 1 ? 'ballPop 0.5s cubic-bezier(0.34,1.56,0.64,1)' : 'none',
            display: 'inline-block',
          }}>⚽</div>

          <div style={{
            fontWeight: 900,
            letterSpacing: '0.14em',
            fontSize: 'clamp(28px,6.5vw,56px)',
            color: '#00d4ff',
            textShadow: '0 0 40px rgba(0,212,255,0.45)',
            lineHeight: 1,
          }}>FAIRPLAY</div>
        </div>

        {/* ── Tagline ───────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', ...fade(2) }}>
          <div style={{
            fontWeight: 700,
            fontSize: 'clamp(12px,2vw,17px)',
            color: 'rgba(255,255,255,0.45)',
            letterSpacing: '0.06em',
          }}>
            {t.welcomeTagline.replace('{sport}', t.sport)}
          </div>
          <div style={{
            marginTop: 6,
            fontSize: 'clamp(10px,1.5vw,13px)',
            color: 'rgba(255,255,255,0.22)',
            letterSpacing: '0.1em',
            fontWeight: 600,
          }}>
            {t.welcomeSubtags}
          </div>
        </div>

        {/* ── "What will you do?" heading ───────────────────────────── */}
        <div style={{ textAlign: 'center', ...fade(3) }}>
          <div style={{
            fontWeight: 900,
            fontSize: 'clamp(11px,1.6vw,14px)',
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}>
            {t.welcomeChoose}
          </div>
        </div>

        {/* ── 3 Entry cards ─────────────────────────────────────────── */}
        <div style={{
          width: '100%', maxWidth: 480,
          display: 'flex', flexDirection: 'column',
          gap: 'clamp(10px,2vh,14px)',
        }}>

          {/* Card 1 — Upcoming */}
          <button
            className="call-btn"
            style={{
              ...fade(4),
              display: 'flex', alignItems: 'center', gap: 'clamp(12px,3vw,20px)',
              padding: 'clamp(16px,3vh,22px) clamp(16px,4vw,24px)',
              background: 'linear-gradient(135deg, rgba(0,212,255,0.10), rgba(0,136,255,0.06))',
              border: '1.5px solid rgba(0,212,255,0.28)',
              borderRadius: 16,
              textAlign: 'left',
              boxShadow: show(4) ? '0 0 24px rgba(0,212,255,0.08)' : 'none',
              transition: 'all 0.12s ease',
            }}
            onClick={() => enter('leagues', 'world')}
          >
            <div style={{
              fontSize: 'clamp(28px,6vw,44px)',
              lineHeight: 1, flexShrink: 0,
              filter: 'drop-shadow(0 0 8px rgba(0,212,255,0.5))',
            }}>📅</div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontWeight: 900, fontSize: 'clamp(14px,2.5vw,18px)',
                color: '#00d4ff', letterSpacing: '0.04em', marginBottom: 4,
              }}>{t.welcomeUpcoming}</div>
              <div style={{
                fontSize: 'clamp(11px,1.6vw,13px)',
                color: 'rgba(255,255,255,0.45)', lineHeight: 1.4,
              }}>
                {t.welcomeUpcomingDesc}
              </div>
            </div>
            <div style={{ color: 'rgba(0,212,255,0.4)', fontSize: 20, flexShrink: 0 }}>›</div>
          </button>

          {/* Card 2 — Live now */}
          <button
            className="call-btn"
            style={{
              ...fade(5),
              display: 'flex', alignItems: 'center', gap: 'clamp(12px,3vw,20px)',
              padding: 'clamp(16px,3vh,22px) clamp(16px,4vw,24px)',
              background: liveMatchCount > 0
                ? 'linear-gradient(135deg, rgba(255,68,68,0.14), rgba(255,40,40,0.07))'
                : 'linear-gradient(135deg, rgba(255,68,68,0.07), rgba(255,40,40,0.03))',
              border: liveMatchCount > 0
                ? '1.5px solid rgba(255,68,68,0.45)'
                : '1.5px solid rgba(255,68,68,0.18)',
              borderRadius: 16,
              textAlign: 'left',
              boxShadow: liveMatchCount > 0 ? '0 0 24px rgba(255,68,68,0.12)' : 'none',
            }}
            onClick={() => enter('leagues', 'world')}
          >
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                fontSize: 'clamp(28px,6vw,44px)', lineHeight: 1,
                filter: 'drop-shadow(0 0 8px rgba(255,68,68,0.5))',
              }}>🔴</div>
              {liveMatchCount > 0 && (
                <div style={{
                  position: 'absolute', top: -4, right: -8,
                  background: '#ff4444', color: '#fff',
                  fontSize: 10, fontWeight: 900,
                  padding: '1px 5px', borderRadius: 99,
                  boxShadow: '0 0 8px rgba(255,68,68,0.7)',
                  animation: 'pulse 1s infinite',
                }}>{liveMatchCount}</div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontWeight: 900, fontSize: 'clamp(14px,2.5vw,18px)',
                color: '#ff5555', letterSpacing: '0.04em', marginBottom: 4,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                {t.welcomeLiveNow}
                {liveMatchCount > 0 && (
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    color: '#ff4444', background: 'rgba(255,68,68,0.15)',
                    border: '1px solid rgba(255,68,68,0.3)',
                    padding: '2px 7px', borderRadius: 99, letterSpacing: '0.1em',
                  }}>
                    {liveMatchCount} LIVE
                  </span>
                )}
              </div>
              <div style={{
                fontSize: 'clamp(11px,1.6vw,13px)',
                color: 'rgba(255,255,255,0.45)', lineHeight: 1.4,
              }}>
                {liveMatchCount > 0
                  ? t.welcomeLiveActive.replace('{count}', String(liveMatchCount))
                  : t.welcomeLiveEmpty}
              </div>
            </div>
            <div style={{ color: 'rgba(255,85,85,0.4)', fontSize: 20, flexShrink: 0 }}>›</div>
          </button>

          {/* Card 3 — Your league */}
          <button
            className="call-btn"
            style={{
              ...fade(6),
              display: 'flex', alignItems: 'center', gap: 'clamp(12px,3vw,20px)',
              padding: 'clamp(16px,3vh,22px) clamp(16px,4vw,24px)',
              background: 'linear-gradient(135deg, rgba(0,255,136,0.09), rgba(0,200,100,0.05))',
              border: '1.5px solid rgba(0,255,136,0.22)',
              borderRadius: 16,
              textAlign: 'left',
              boxShadow: show(6) ? '0 0 24px rgba(0,255,136,0.07)' : 'none',
            }}
            onClick={() => enter('leagues', 'add')}
          >
            <div style={{
              fontSize: 'clamp(28px,6vw,44px)',
              lineHeight: 1, flexShrink: 0,
              filter: 'drop-shadow(0 0 8px rgba(0,255,136,0.4))',
            }}>⚽</div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontWeight: 900, fontSize: 'clamp(14px,2.5vw,18px)',
                color: '#00ff88', letterSpacing: '0.04em', marginBottom: 4,
              }}>{t.welcomeYourLeague}</div>
              <div style={{
                fontSize: 'clamp(11px,1.6vw,13px)',
                color: 'rgba(255,255,255,0.45)', lineHeight: 1.4,
              }}>
                {t.welcomeYourLeagueDesc}
              </div>
            </div>
            <div style={{ color: 'rgba(0,255,136,0.4)', fontSize: 20, flexShrink: 0 }}>›</div>
          </button>
        </div>

        {/* ── Feature chips ─────────────────────────────────────────── */}
        <div style={{
          ...fade(7),
          display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center',
          maxWidth: 480,
        }}>
          {[
            { emoji: '🏅', label: 'Referee calls', color: '#00d4ff' },
            { emoji: '⚡', label: 'Oppose calls',  color: '#ffaa00' },
            { emoji: '🌡️', label: 'Match impact',  color: '#ff8800' },
            { emoji: '📹', label: 'Camera upload', color: '#aa88ff' },
            { emoji: '🌍', label: '20 languages',  color: '#00ff88' },
            { emoji: '📯', label: 'Whistle sounds', color: '#FFD700' },
          ].map(f => (
            <div key={f.label} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 10px',
              background: `${f.color}0f`,
              border: `1px solid ${f.color}25`,
              borderRadius: 99,
            }}>
              <span style={{ fontSize: 12 }}>{f.emoji}</span>
              <span style={{
                fontSize: 'clamp(9px,1.3vw,11px)',
                color: `${f.color}cc`,
                fontWeight: 700, letterSpacing: '0.06em',
              }}>{f.label}</span>
            </div>
          ))}
        </div>

        {/* ── Footer auth ───────────────────────────────────────────── */}
        <div style={{
          ...fade(7),
          textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        }}>
          <button
            className="call-btn"
            style={{
              fontSize: 'clamp(11px,1.5vw,13px)',
              color: 'rgba(0,212,255,0.5)',
              fontWeight: 700, letterSpacing: '0.06em',
              padding: '6px 14px',
              border: '1px solid rgba(0,212,255,0.15)',
              borderRadius: 99,
              background: 'rgba(0,212,255,0.05)',
            }}
            onClick={() => { onEnter(); setTimeout(() => openAuthModal('register'), 300); }}
          >
            {t.signUpFree}
          </button>
          <div style={{ fontSize: 'clamp(9px,1.2vw,11px)', color: 'rgba(255,255,255,0.18)' }}>
            {t.noAccount}
          </div>
        </div>

      </div>

      {/* ── Keyframes ─────────────────────────────────────────────────── */}
      <style>{`
        @keyframes ballPop {
          0%   { transform: scale(0.4) translateY(20px); opacity: 0; }
          60%  { transform: scale(1.15) translateY(-4px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes driftA {
          0%,100% { transform: translateX(-50%) translateY(0); }
          50%     { transform: translateX(-50%) translateY(-30px); }
        }
        @keyframes driftB {
          0%,100% { transform: translateX(0) translateY(0); }
          50%     { transform: translateX(-20px) translateY(-20px); }
        }
        @keyframes driftC {
          0%,100% { transform: translateX(0) translateY(0); }
          50%     { transform: translateX(20px) translateY(-15px); }
        }
      `}</style>
    </div>
  );
}
