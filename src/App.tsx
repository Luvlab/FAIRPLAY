import { useState } from 'react';
import { useGameStore } from './store/gameStore';
import CardOverlay from './components/CardOverlay';
import RefereePanel from './components/RefereePanel';
import ComparePanel from './components/ComparePanel';
import LeaguesPanel from './components/LeaguesPanel';
import TimelinePanel from './components/TimelinePanel';
import StudioPanel from './components/StudioPanel';
import ShopPanel from './components/ShopPanel';
import AuthModal from './components/AuthModal';
import GameSelector from './components/GameSelector';
import WelcomeScreen from './components/WelcomeScreen';
import { useT } from './context/I18nContext';

export default function App() {
  const t              = useT();
  const activeTab      = useGameStore((s) => s.activeTab);
  const setActiveTab   = useGameStore((s) => s.setActiveTab);
  const currentGame    = useGameStore((s) => s.currentGame);
  const isOnline       = useGameStore((s) => s.isOnline);
  const isLoading      = useGameStore((s) => s.isLoading);
  const userProfile    = useGameStore((s) => s.userProfile);
  const openAuthModal  = useGameStore((s) => s.openAuthModal);

  const NAV_TABS = [
    { id: 'referee'  as const, label: t.navReferee,  emoji: '🏅' },
    { id: 'compare'  as const, label: t.navCompare,  emoji: '👥' },
    { id: 'leagues'  as const, label: t.navLeagues,  emoji: '🌍' },
    { id: 'timeline' as const, label: t.navTimeline, emoji: '📹' },
    { id: 'studio'   as const, label: t.navStudio,   emoji: '🔮' },
    { id: 'shop'     as const, label: t.navShop,     emoji: '🛒' },
  ];

  const [showGameSelector, setShowGameSelector] = useState(false);
  const [welcomed, setWelcomed] = useState(() => !!localStorage.getItem('fp_welcomed'));

  if (!welcomed) {
    return (
      <WelcomeScreen
        onEnter={() => {
          localStorage.setItem('fp_welcomed', '1');
          setWelcomed(true);
        }}
      />
    );
  }

  return (
    <div
      className="flex flex-col"
      style={{ width: '100dvw', height: '100dvh', overflow: 'hidden' }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header
        className="flex items-center px-3 md:px-5 gap-2"
        style={{
          height: 'clamp(52px, 7vw, 72px)',
          background: 'linear-gradient(90deg, #0d1117, #111827)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
          zIndex: 20,
        }}
      >
        {/* Logo — no background, clean */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            style={{
              fontSize: 'clamp(26px, 4vw, 42px)',
              lineHeight: 1,
              filter: 'drop-shadow(0 0 8px rgba(0,212,255,0.5))',
            }}
          >
            ⚽
          </span>
          <div>
            <div
              className="font-black tracking-widest"
              style={{ color: '#00d4ff', lineHeight: 1, fontSize: 'clamp(13px, 2vw, 20px)', textShadow: '0 0 20px rgba(0,212,255,0.4)' }}
            >
              FAIRPLAY
            </div>
            <div className="flex items-center gap-1" style={{ fontSize: 'clamp(8px, 1.2vw, 11px)', marginTop: 2 }}>
              <div
                className="rounded-full flex-shrink-0"
                style={{ width: 'clamp(5px, 0.8vw, 7px)', height: 'clamp(5px, 0.8vw, 7px)', background: isLoading ? '#ffaa00' : isOnline ? '#00ff88' : '#666' }}
              />
              <span className="text-white/25 tracking-wider">
                {isLoading ? 'CONNECTING' : isOnline ? t.statusLive : t.statusOffline}
              </span>
            </div>
          </div>
        </div>

        {/* Live game chip — tappable to open selector */}
        <button
          className="call-btn flex items-center gap-2 px-3 py-1.5 rounded-lg mx-auto flex-1 min-w-0 justify-center"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', maxWidth: 360 }}
          onClick={() => setShowGameSelector(true)}
        >
          {currentGame ? (
            <>
              <div className="rounded-full flex-shrink-0" style={{ width: 6, height: 6, background: '#ff4444', boxShadow: '0 0 6px #ff4444', animation: 'pulse 1s infinite' }} />
              <span className="font-bold text-white/60 truncate" style={{ fontSize: 'clamp(10px, 1.5vw, 14px)' }}>
                {currentGame.homeTeam}{' '}
                <span style={{ color: '#00d4ff' }}>{currentGame.homeScore}–{currentGame.awayScore}</span>{' '}
                {currentGame.awayTeam}
              </span>
              {(currentGame.status === 'live' || currentGame.status === 'ht') && (
                <span className="font-bold px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: 'rgba(255,68,68,0.15)', color: '#ff5555', fontSize: 'clamp(8px, 1vw, 11px)' }}>
                  {currentGame.status === 'ht' ? t.statusHt : `${currentGame.minute}'`}
                </span>
              )}
              {currentGame.status === 'pre' && (
                <span className="font-bold px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff', fontSize: 'clamp(8px, 1vw, 11px)' }}>{t.statusUpcoming}</span>
              )}
              {currentGame.status === 'ft' && (
                <span className="font-bold px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', fontSize: 'clamp(8px, 1vw, 11px)' }}>{t.statusFt}</span>
              )}
            </>
          ) : (
            <span className="text-white/40 text-xs">⚽ {t.selectAMatch}</span>
          )}
          <span className="text-white/20 text-xs flex-shrink-0">▼</span>
        </button>

        {/* Right side: sport name + auth */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div
            className="font-bold px-2 py-1 rounded hidden md:block"
            style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', fontSize: 'clamp(9px, 1.3vw, 13px)' }}
          >
            ⚽ {t.sport.toUpperCase()}
          </div>

          {/* Auth button */}
          <button
            className="call-btn flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold"
            style={{
              background: userProfile ? 'rgba(0,255,136,0.1)' : 'rgba(0,212,255,0.12)',
              border: `1px solid ${userProfile ? 'rgba(0,255,136,0.25)' : 'rgba(0,212,255,0.25)'}`,
              color: userProfile ? '#00ff88' : '#00d4ff',
              fontSize: 'clamp(9px, 1.2vw, 12px)',
            }}
            onClick={() => openAuthModal(userProfile ? 'login' : 'register')}
          >
            <span>{userProfile ? '✓' : '👤'}</span>
            <span className="hidden sm:inline">
              {userProfile ? userProfile.displayName : t.signUp}
            </span>
          </button>
        </div>
      </header>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <main className="flex-1 overflow-hidden">
        {activeTab === 'referee'  && <RefereePanel />}
        {activeTab === 'compare'  && <ComparePanel />}
        {activeTab === 'leagues'  && <LeaguesPanel />}
        {activeTab === 'timeline' && <TimelinePanel />}
        {activeTab === 'studio'   && <StudioPanel />}
        {activeTab === 'shop'     && <ShopPanel />}
      </main>

      {/* ── Bottom nav ─────────────────────────────────────────────────── */}
      <nav
        className="flex items-center justify-around px-2"
        style={{
          height: 'clamp(60px, 8vw, 80px)',
          background: 'linear-gradient(0deg, #0a0e14, #0d1117)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
          zIndex: 20,
          paddingBottom: 'max(env(safe-area-inset-bottom), 8px)',
        }}
      >
        {NAV_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className="call-btn flex flex-col items-center gap-1 flex-1 py-2 relative"
              onClick={() => setActiveTab(tab.id)}
            >
              <span style={{ fontSize: 'clamp(17px, 2.8vw, 26px)', filter: isActive ? 'none' : 'grayscale(0.8) opacity(0.5)' }}>
                {tab.emoji}
              </span>
              <span
                className="font-bold"
                style={{ fontSize: 'clamp(7px, 1vw, 11px)', letterSpacing: '0.5px', color: isActive ? '#00d4ff' : 'rgba(255,255,255,0.3)' }}
              >
                {tab.label}
              </span>
              {isActive && (
                <div
                  className="absolute"
                  style={{ bottom: 0, width: 'clamp(18px, 2.5vw, 28px)', height: 2, background: '#00d4ff', borderRadius: '2px 2px 0 0', boxShadow: '0 0 8px #00d4ff' }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Overlays ───────────────────────────────────────────────────── */}
      <CardOverlay />
      <AuthModal />
      {showGameSelector && <GameSelector onClose={() => setShowGameSelector(false)} />}
    </div>
  );
}
