import { useState, useRef, useEffect } from 'react';
import { SOCCER_CALLS, CALL_CATEGORIES } from '../data/soccerCalls';
import { useGameStore, isGameLive, computeLiveMinute } from '../store/gameStore';

interface PendingCall {
  callId: string;
  callName: string;
  emoji: string;
  color: string;
  minute: number;
}

/** Ticks every 30 s, returns the computed live minute for the current game */
function useLiveMinute(): number {
  const currentGame    = useGameStore((s) => s.currentGame);
  const clockFetchedAt = useGameStore((s) => s.clockFetchedAt);
  const [, setTick]    = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  if (!currentGame) return 0;
  return computeLiveMinute(currentGame.minute, clockFetchedAt, currentGame.status);
}

export default function RefereePanel() {
  const showCardOverlay  = useGameStore((s) => s.showCardOverlay);
  const submitLiveCall   = useGameStore((s) => s.submitLiveCall);
  const activeCategory   = useGameStore((s) => s.activeCategory);
  const setActiveCategory = useGameStore((s) => s.setActiveCategory);
  const currentGame      = useGameStore((s) => s.currentGame);
  const isOnline         = useGameStore((s) => s.isOnline);

  const [lastCall, setLastCall]       = useState<string | null>(null);
  const [pendingCall, setPendingCall] = useState<PendingCall | null>(null);
  const [playerName, setPlayerName]   = useState('');
  const [countdown, setCountdown]     = useState(5);

  const lastCallTimer    = useRef<ReturnType<typeof setTimeout>>(undefined);
  const countdownTimer   = useRef<ReturnType<typeof setInterval>>(undefined);
  const playerInputRef   = useRef<HTMLInputElement>(null);

  const [winW, setWinW] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setWinW(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const liveMinute = useLiveMinute();
  const gameLive   = isGameLive(currentGame?.status);

  const filtered = activeCategory === 'all'
    ? SOCCER_CALLS
    : SOCCER_CALLS.filter((c) => c.category === activeCategory);

  // ── Handle countdown for pending call ────────────────────────────────────
  useEffect(() => {
    if (!pendingCall) return;
    setCountdown(5);
    // Focus the player input after the sheet animates in
    setTimeout(() => playerInputRef.current?.focus(), 150);
    countdownTimer.current = setInterval(() => {
      setCountdown((n) => {
        if (n <= 1) {
          clearInterval(countdownTimer.current);
          submitPendingCall(pendingCall, playerName);
          return 0;
        }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(countdownTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingCall]);

  const submitPendingCall = (call: PendingCall, name: string) => {
    clearInterval(countdownTimer.current);

    if (call.callId === 'yellow' || call.callId === 'second_yellow') showCardOverlay('yellow');
    else if (['red', 'spitting', 'violent', 'biting'].includes(call.callId)) showCardOverlay('red');

    submitLiveCall(call.callId, call.callName, call.minute, undefined, name.trim() || undefined);

    setLastCall(call.callId);
    clearTimeout(lastCallTimer.current);
    lastCallTimer.current = setTimeout(() => setLastCall(null), 2500);

    setPendingCall(null);
    setPlayerName('');
  };

  const handleCallTap = (callId: string, callName: string) => {
    if (!gameLive) return;
    const meta = SOCCER_CALLS.find((c) => c.id === callId)!;
    setPendingCall({ callId, callName, emoji: meta.emoji, color: meta.color, minute: liveMinute });
  };

  const cancelPending = () => {
    clearInterval(countdownTimer.current);
    setPendingCall(null);
    setPlayerName('');
  };

  // Responsive columns
  const catCount = filtered.length;
  const baseCols = catCount <= 6 ? 3 : catCount <= 12 ? 4 : catCount <= 20 ? 5 : 6;
  const extraCols = winW >= 1280 ? 3 : winW >= 1024 ? 2 : winW >= 768 ? 1 : 0;
  const cols = baseCols + extraCols;
  const emojiSize = winW >= 1024 ? '2em' : winW >= 768 ? '1.7em' : '1.4em';
  const labelSize = `clamp(8px, ${winW >= 1024 ? '1.1vw' : winW >= 768 ? '1.3vw' : '1.6vw'}, ${winW >= 1024 ? '14px' : '12px'})`;

  return (
    <div className="flex flex-col h-full relative" style={{ background: 'linear-gradient(180deg, #0d1117 0%, #0a1420 100%)' }}>

      {/* ── Category filter bar ─────────────────────────────────────────── */}
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

        {/* Live minute clock — right side of filter bar */}
        <div className="ml-auto flex items-center gap-2 flex-shrink-0 self-center pr-1">
          {gameLive ? (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-black"
              style={{
                background: 'rgba(255,68,68,0.12)',
                border: '1px solid rgba(255,68,68,0.25)',
                color: '#ff5555',
                fontSize: 'clamp(10px, 1.4vw, 13px)',
              }}
            >
              <div
                className="rounded-full"
                style={{ width: 6, height: 6, background: '#ff4444', boxShadow: '0 0 5px #ff4444', animation: 'pulse 1s infinite', flexShrink: 0 }}
              />
              {currentGame?.status === 'ht' ? 'HT' : `${liveMinute}'`}
            </div>
          ) : (
            <div
              className="px-2.5 py-1 rounded-lg font-bold"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', fontSize: 'clamp(9px, 1.2vw, 12px)' }}
            >
              {currentGame?.status === 'pre' ? 'NOT STARTED' : currentGame?.status === 'ft' ? 'FULL TIME' : 'OFFLINE'}
            </div>
          )}
        </div>
      </div>

      {/* ── Call grid ──────────────────────────────────────────────────── */}
      <div
        className="flex-1 p-2 overflow-hidden"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridAutoRows: '1fr',
          gap: winW >= 768 ? 8 : 6,
          opacity: gameLive ? 1 : 0.35,
          pointerEvents: gameLive ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      >
        {filtered.map((call) => {
          const isActive = lastCall === call.id;
          return (
            <button
              key={call.id}
              className="call-btn rounded-xl flex flex-col items-center justify-center gap-1 relative overflow-hidden"
              style={{
                background: isActive ? `${call.color}33` : 'rgba(255,255,255,0.04)',
                border: isActive ? `1px solid ${call.color}` : '1px solid rgba(255,255,255,0.07)',
                boxShadow: isActive ? `0 0 20px ${call.color}66` : 'none',
                transition: 'all 0.15s ease',
              }}
              onClick={() => handleCallTap(call.id, call.name)}
            >
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
                }}
              >
                {call.shortName}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Non-live overlay ───────────────────────────────────────────── */}
      {!gameLive && currentGame && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none"
          style={{ paddingBottom: 'clamp(40px, 8vw, 80px)' }}
        >
          <div
            className="rounded-2xl px-6 py-5 flex flex-col items-center gap-2 text-center"
            style={{ background: 'rgba(13,17,23,0.92)', border: '1px solid rgba(255,255,255,0.1)', maxWidth: 280 }}
          >
            <span style={{ fontSize: 'clamp(28px, 5vw, 40px)' }}>
              {currentGame.status === 'pre' ? '⏰' : '📋'}
            </span>
            <div className="font-black" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'clamp(13px, 1.8vw, 16px)' }}>
              {currentGame.status === 'pre' ? 'Match hasn\'t started' : 'Match has ended'}
            </div>
            <div className="text-white/35" style={{ fontSize: 'clamp(10px, 1.3vw, 13px)' }}>
              {currentGame.status === 'pre'
                ? 'Calls can only be made during the live match'
                : `Final score: ${currentGame.homeTeam} ${currentGame.homeScore}–${currentGame.awayScore} ${currentGame.awayTeam}`}
            </div>
          </div>
        </div>
      )}

      {/* ── Last call banner ───────────────────────────────────────────── */}
      {lastCall && !pendingCall && (
        <div
          className="flex items-center justify-center gap-2 py-2 font-bold tracking-widest"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            color: SOCCER_CALLS.find((c) => c.id === lastCall)?.color ?? '#fff',
            flexShrink: 0,
            fontSize: 'clamp(10px, 1.5vw, 14px)',
          }}
        >
          {isOnline ? '🌐' : '📴'} {SOCCER_CALLS.find((c) => c.id === lastCall)?.name.toUpperCase()} — SUBMITTED
        </div>
      )}

      {/* ── Player tag bottom sheet ────────────────────────────────────── */}
      {pendingCall && (
        <>
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.5)', zIndex: 10 }}
            onClick={cancelPending}
          />

          {/* Sheet */}
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-3xl"
            style={{
              background: 'linear-gradient(180deg, #111827, #0d1117)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderBottom: 'none',
              zIndex: 11,
              animation: 'slideUp 0.2s cubic-bezier(0.34,1.2,0.64,1)',
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
            </div>

            <div className="px-5 pb-6 pt-2">
              {/* Call info row */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 'clamp(48px, 7vw, 64px)',
                    height: 'clamp(48px, 7vw, 64px)',
                    background: `${pendingCall.color}22`,
                    border: `2px solid ${pendingCall.color}55`,
                    fontSize: 'clamp(22px, 3.5vw, 32px)',
                  }}
                >
                  {pendingCall.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black leading-tight" style={{ color: pendingCall.color, fontSize: 'clamp(15px, 2.5vw, 22px)' }}>
                    {pendingCall.callName}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className="font-bold px-2 py-0.5 rounded-md"
                      style={{ background: 'rgba(255,68,68,0.15)', color: '#ff5555', fontSize: 'clamp(10px, 1.4vw, 13px)' }}
                    >
                      {pendingCall.minute}'
                    </span>
                    <span className="text-white/30" style={{ fontSize: 'clamp(10px, 1.3vw, 12px)' }}>
                      {currentGame?.homeTeam} vs {currentGame?.awayTeam}
                    </span>
                  </div>
                </div>

                {/* Countdown ring */}
                <div className="flex-shrink-0 relative flex items-center justify-center" style={{ width: 44, height: 44 }}>
                  <svg className="absolute inset-0" width="44" height="44" viewBox="0 0 44 44">
                    <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                    <circle
                      cx="22" cy="22" r="18"
                      fill="none"
                      stroke={pendingCall.color}
                      strokeWidth="3"
                      strokeDasharray={`${2 * Math.PI * 18}`}
                      strokeDashoffset={`${2 * Math.PI * 18 * (1 - countdown / 5)}`}
                      strokeLinecap="round"
                      transform="rotate(-90 22 22)"
                      style={{ transition: 'stroke-dashoffset 0.9s linear' }}
                    />
                  </svg>
                  <span className="font-black" style={{ color: pendingCall.color, fontSize: 16 }}>{countdown}</span>
                </div>
              </div>

              {/* Player input */}
              <label
                className="block font-bold uppercase tracking-wider mb-1.5"
                style={{ color: 'rgba(255,255,255,0.45)', fontSize: 'clamp(9px, 1.2vw, 11px)' }}
              >
                #️⃣ Player name or number — optional
              </label>
              <input
                ref={playerInputRef}
                type="text"
                placeholder="e.g.  Salah  ·  #11  ·  No. 7"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitPendingCall(pendingCall, playerName);
                  if (e.key === 'Escape') cancelPending();
                }}
                maxLength={40}
                className="w-full rounded-xl px-4 py-3 mb-4"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: `1px solid ${pendingCall.color}44`,
                  color: '#fff',
                  outline: 'none',
                  fontSize: 'clamp(13px, 1.8vw, 16px)',
                }}
              />

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  className="flex-1 py-3.5 rounded-xl font-black call-btn"
                  style={{
                    background: `${pendingCall.color}25`,
                    border: `1.5px solid ${pendingCall.color}`,
                    color: pendingCall.color,
                    fontSize: 'clamp(13px, 1.8vw, 16px)',
                    letterSpacing: '0.5px',
                  }}
                  onClick={() => submitPendingCall(pendingCall, playerName)}
                >
                  ⚡ SUBMIT NOW
                </button>
                <button
                  className="call-btn px-4 rounded-xl font-bold"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.45)', fontSize: 'clamp(12px, 1.5vw, 14px)' }}
                  onClick={cancelPending}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
