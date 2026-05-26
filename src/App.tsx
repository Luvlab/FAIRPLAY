import { useGameStore } from './store/gameStore';
import CardOverlay from './components/CardOverlay';
import RefereePanel from './components/RefereePanel';
import ComparePanel from './components/ComparePanel';
import LeaguesPanel from './components/LeaguesPanel';
import TimelinePanel from './components/TimelinePanel';
import StudioPanel from './components/StudioPanel';

const NAV_TABS = [
  { id: 'referee' as const, label: 'REFEREE', emoji: '🏅' },
  { id: 'compare' as const, label: 'COMPARE', emoji: '👥' },
  { id: 'leagues' as const, label: 'LEAGUES', emoji: '🌍' },
  { id: 'timeline' as const, label: 'TIMELINE', emoji: '📹' },
  { id: 'studio' as const, label: 'STUDIO', emoji: '🔮' },
];

export default function App() {
  const activeTab = useGameStore((s) => s.activeTab);
  const setActiveTab = useGameStore((s) => s.setActiveTab);
  const currentGame = useGameStore((s) => s.currentGame);
  const isOnline = useGameStore((s) => s.isOnline);
  const isLoading = useGameStore((s) => s.isLoading);

  return (
    <div
      className="flex flex-col"
      style={{ width: '100dvw', height: '100dvh', overflow: 'hidden' }}
    >
      {/* Header */}
      <header
        className="flex items-center px-3 md:px-6"
        style={{
          height: 'clamp(52px, 7vw, 72px)',
          background: 'linear-gradient(90deg, #0d1117, #111827)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
          zIndex: 20,
        }}
      >
        {/* Logo — no background, clean emoji + wordmark */}
        <div className="flex items-center gap-2 mr-4">
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
              style={{
                color: '#00d4ff',
                lineHeight: 1,
                fontSize: 'clamp(13px, 2vw, 20px)',
                textShadow: '0 0 20px rgba(0,212,255,0.4)',
              }}
            >
              FAIRPLAY
            </div>
            <div className="flex items-center gap-1" style={{ fontSize: 'clamp(8px, 1.2vw, 11px)', marginTop: 2 }}>
              <div
                className="rounded-full"
                style={{
                  width: 'clamp(5px, 0.8vw, 7px)',
                  height: 'clamp(5px, 0.8vw, 7px)',
                  background: isLoading ? '#ffaa00' : isOnline ? '#00ff88' : '#666',
                  flexShrink: 0,
                }}
              />
              <span className="text-white/25 tracking-wider">
                {isLoading ? 'CONNECTING' : isOnline ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>
          </div>
        </div>

        {/* Live game chip */}
        {currentGame && (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg mx-auto"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div
              className="rounded-full"
              style={{
                width: 6,
                height: 6,
                background: '#ff4444',
                boxShadow: '0 0 6px #ff4444',
                animation: 'pulse 1s infinite',
                flexShrink: 0,
              }}
            />
            <span
              className="font-bold text-white/60"
              style={{ fontSize: 'clamp(10px, 1.5vw, 14px)' }}
            >
              {currentGame.homeTeam}{' '}
              <span style={{ color: '#00d4ff' }}>
                {currentGame.homeScore}–{currentGame.awayScore}
              </span>{' '}
              {currentGame.awayTeam}
            </span>
            <span
              className="font-bold px-1.5 py-0.5 rounded"
              style={{
                background: 'rgba(255,68,68,0.15)',
                color: '#ff5555',
                fontSize: 'clamp(8px, 1vw, 11px)',
              }}
            >
              {currentGame.minute}'
            </span>
          </div>
        )}

        {/* Sport badge */}
        <div className="ml-auto">
          <div
            className="font-bold px-2 py-1 rounded"
            style={{
              background: 'rgba(0,212,255,0.1)',
              border: '1px solid rgba(0,212,255,0.2)',
              color: '#00d4ff',
              fontSize: 'clamp(9px, 1.3vw, 13px)',
            }}
          >
            ⚽ SOCCER
          </div>
        </div>
      </header>

      {/* Main content — fills remaining height */}
      <main className="flex-1 overflow-hidden">
        {activeTab === 'referee' && <RefereePanel />}
        {activeTab === 'compare' && <ComparePanel />}
        {activeTab === 'leagues' && <LeaguesPanel />}
        {activeTab === 'timeline' && <TimelinePanel />}
        {activeTab === 'studio' && <StudioPanel />}
      </main>

      {/* Bottom nav */}
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
              <span
                style={{
                  fontSize: 'clamp(18px, 3vw, 28px)',
                  filter: isActive ? 'none' : 'grayscale(0.8) opacity(0.5)',
                }}
              >
                {tab.emoji}
              </span>
              <span
                className="font-bold"
                style={{
                  fontSize: 'clamp(8px, 1.2vw, 12px)',
                  letterSpacing: '0.6px',
                  color: isActive ? '#00d4ff' : 'rgba(255,255,255,0.3)',
                }}
              >
                {tab.label}
              </span>
              {isActive && (
                <div
                  className="absolute"
                  style={{
                    bottom: 0,
                    width: 'clamp(20px, 3vw, 32px)',
                    height: 2,
                    background: '#00d4ff',
                    borderRadius: '2px 2px 0 0',
                    boxShadow: '0 0 8px #00d4ff',
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Card overlay — top layer */}
      <CardOverlay />
    </div>
  );
}
