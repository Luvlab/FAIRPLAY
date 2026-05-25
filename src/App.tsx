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
  const { activeTab, setActiveTab, currentGame } = useGameStore();

  return (
    <div
      className="flex flex-col"
      style={{ width: '100dvw', height: '100dvh', overflow: 'hidden' }}
    >
      {/* Header */}
      <header
        className="flex items-center px-4"
        style={{
          height: 52,
          background: 'linear-gradient(90deg, #0d1117, #111827)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
          zIndex: 20,
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mr-4">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
            style={{
              background: 'linear-gradient(135deg, #00d4ff, #0066ff)',
              boxShadow: '0 0 12px rgba(0,212,255,0.4)',
            }}
          >
            ⚽
          </div>
          <div>
            <div className="font-black text-sm tracking-widest" style={{ color: '#00d4ff', lineHeight: 1 }}>FAIRPLAY</div>
            <div className="text-xs text-white/25 tracking-wider" style={{ fontSize: 9 }}>REFEREE ENGINE</div>
          </div>
        </div>

        {/* Live game chip */}
        {currentGame && (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg mx-auto"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#ff4444', boxShadow: '0 0 6px #ff4444', animation: 'pulse 1s infinite' }} />
            <span className="text-xs font-bold text-white/60">
              {currentGame.homeTeam} <span style={{ color: '#00d4ff' }}>{currentGame.homeScore}–{currentGame.awayScore}</span> {currentGame.awayTeam}
            </span>
            <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,68,68,0.15)', color: '#ff5555', fontSize: 9 }}>
              {currentGame.minute}'
            </span>
          </div>
        )}

        {/* Sport badge */}
        <div className="ml-auto">
          <div
            className="text-xs font-bold px-2 py-1 rounded"
            style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff' }}
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
        className="flex items-center justify-around px-2 pb-safe"
        style={{
          height: 60,
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
              className="call-btn flex flex-col items-center gap-0.5 flex-1 py-2"
              onClick={() => setActiveTab(tab.id)}
            >
              <span style={{ fontSize: 18, filter: isActive ? 'none' : 'grayscale(0.8) opacity(0.5)' }}>
                {tab.emoji}
              </span>
              <span
                className="font-bold"
                style={{
                  fontSize: 8,
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
                    width: 24,
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
