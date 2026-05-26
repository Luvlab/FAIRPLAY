import { useState, useRef, useEffect } from 'react';
import { SOCCER_CALLS, CALL_CATEGORIES } from '../data/soccerCalls';
import { useGameStore } from '../store/gameStore';

export default function RefereePanel() {
  const showCardOverlay = useGameStore((s) => s.showCardOverlay);
  const submitLiveCall = useGameStore((s) => s.submitLiveCall);
  const activeCategory = useGameStore((s) => s.activeCategory);
  const setActiveCategory = useGameStore((s) => s.setActiveCategory);
  const currentGame = useGameStore((s) => s.currentGame);
  const isOnline = useGameStore((s) => s.isOnline);
  const [lastCall, setLastCall] = useState<string | null>(null);
  const lastCallTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [winW, setWinW] = useState(window.innerWidth);

  useEffect(() => {
    const handler = () => setWinW(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const filtered = activeCategory === 'all'
    ? SOCCER_CALLS
    : SOCCER_CALLS.filter((c) => c.category === activeCategory);

  const handleCall = (callId: string, callName: string) => {
    if (callId === 'yellow' || callId === 'second_yellow') showCardOverlay('yellow');
    else if (callId === 'red' || callId === 'spitting' || callId === 'violent' || callId === 'biting') showCardOverlay('red');

    submitLiveCall(callId, callName, currentGame?.minute ?? 0);

    setLastCall(callId);
    clearTimeout(lastCallTimer.current);
    lastCallTimer.current = setTimeout(() => setLastCall(null), 1200);
  };

  // Responsive columns: scale up on larger screens
  const catCount = filtered.length;
  const baseCols = catCount <= 6 ? 3 : catCount <= 12 ? 4 : catCount <= 20 ? 5 : 6;
  const extraCols = winW >= 1280 ? 3 : winW >= 1024 ? 2 : winW >= 768 ? 1 : 0;
  const cols = baseCols + extraCols;

  // Responsive emoji + text sizes
  const emojiSize = winW >= 1024 ? '2em' : winW >= 768 ? '1.7em' : '1.4em';
  const labelSize = `clamp(8px, ${winW >= 1024 ? '1.1vw' : winW >= 768 ? '1.3vw' : '1.6vw'}, ${winW >= 1024 ? '14px' : '12px'})`;

  return (
    <div className="flex flex-col h-full" style={{ background: 'linear-gradient(180deg, #0d1117 0%, #0a1420 100%)' }}>
      {/* Category filter bar */}
      <div
        className="flex gap-2 px-3 py-2 overflow-x-auto"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}
      >
        {CALL_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`nav-tab ${activeCategory === cat.id ? 'active' : ''}`}
            style={activeCategory === cat.id ? { borderColor: cat.color, color: cat.color, background: `${cat.color}22` } : {}}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Call grid — fills remaining height, no scroll */}
      <div
        className="flex-1 p-2 overflow-hidden"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridAutoRows: '1fr',
          gap: winW >= 768 ? 8 : 6,
        }}
      >
        {filtered.map((call) => {
          const isActive = lastCall === call.id;
          return (
            <button
              key={call.id}
              className="call-btn rounded-xl flex flex-col items-center justify-center gap-1 relative overflow-hidden"
              style={{
                background: isActive
                  ? `${call.color}33`
                  : 'rgba(255,255,255,0.04)',
                border: isActive
                  ? `1px solid ${call.color}`
                  : '1px solid rgba(255,255,255,0.07)',
                boxShadow: isActive ? `0 0 20px ${call.color}66` : 'none',
                transition: 'all 0.15s ease',
              }}
              onClick={() => handleCall(call.id, call.name)}
            >
              {/* Category color bar */}
              <div
                className="absolute top-0 left-0 right-0"
                style={{ height: winW >= 768 ? 3 : 2, background: call.color, opacity: isActive ? 1 : 0.4 }}
              />

              <span style={{ fontSize: emojiSize, lineHeight: 1 }}>{call.emoji}</span>

              <span
                className="font-black text-center leading-none"
                style={{
                  fontSize: labelSize,
                  color: isActive ? call.color : 'rgba(255,255,255,0.85)',
                  letterSpacing: '0.5px',
                  fontFamily: 'system-ui, sans-serif',
                }}
              >
                {call.shortName}
              </span>
            </button>
          );
        })}
      </div>

      {/* Last call indicator */}
      {lastCall && (
        <div
          className="flex items-center justify-center py-2 font-bold tracking-widest"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            color: SOCCER_CALLS.find((c) => c.id === lastCall)?.color ?? '#fff',
            flexShrink: 0,
            fontSize: 'clamp(10px, 1.5vw, 14px)',
          }}
        >
          {isOnline ? '🌐' : '📴'} CALL SUBMITTED — {SOCCER_CALLS.find((c) => c.id === lastCall)?.name.toUpperCase()}
        </div>
      )}
    </div>
  );
}
