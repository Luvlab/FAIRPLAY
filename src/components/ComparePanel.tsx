import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { SOCCER_CALLS } from '../data/soccerCalls';

export default function ComparePanel() {
  const allCalls = useGameStore((s) => s.allCalls);
  const voteCall = useGameStore((s) => s.voteCall);
  const currentGame = useGameStore((s) => s.currentGame);
  const isOnline = useGameStore((s) => s.isOnline);
  const isLoading = useGameStore((s) => s.isLoading);
  const [filter, setFilter] = useState<'all' | 'official' | 'fans'>('all');

  const filtered = allCalls.filter((c) => {
    if (filter === 'official') return c.isOfficial;
    if (filter === 'fans') return !c.isOfficial;
    return true;
  });

  const agreementRate = (call: typeof allCalls[0]) => {
    const total = call.agree + call.disagree;
    return total > 0 ? Math.round((call.agree / total) * 100) : 50;
  };

  const callData = (callId: string) => SOCCER_CALLS.find((c) => c.id === callId);

  return (
    <div className="flex flex-col h-full scrollable">
      {/* Live scoreboard */}
      {currentGame && (
        <div
          className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4"
          style={{
            background: 'linear-gradient(90deg, rgba(0,212,255,0.08), rgba(0,212,255,0.04))',
            borderBottom: '1px solid rgba(0,212,255,0.2)',
            flexShrink: 0,
          }}
        >
          <div className="text-center">
            <div className="font-black" style={{ fontSize: 'clamp(14px, 2.5vw, 22px)' }}>{currentGame.homeTeam}</div>
            <div className="text-white/40" style={{ fontSize: 'clamp(9px, 1.2vw, 12px)' }}>HOME</div>
          </div>
          <div className="text-center">
            <div className="font-black" style={{ fontSize: 'clamp(24px, 5vw, 42px)', color: '#00d4ff' }}>
              {currentGame.homeScore} — {currentGame.awayScore}
            </div>
            <div
              className="font-bold px-2 py-0.5 rounded-full mt-1 inline-block"
              style={{ background: 'rgba(255,80,80,0.2)', color: '#ff5050', fontSize: 'clamp(9px, 1.2vw, 12px)' }}
            >
              {currentGame.minute}' LIVE
            </div>
          </div>
          <div className="text-center">
            <div className="font-black" style={{ fontSize: 'clamp(14px, 2.5vw, 22px)' }}>{currentGame.awayTeam}</div>
            <div className="text-white/40" style={{ fontSize: 'clamp(9px, 1.2vw, 12px)' }}>AWAY</div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 px-3 py-2 md:px-4 md:py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        {(['all', 'official', 'fans'] as const).map((f) => (
          <button
            key={f}
            className={`nav-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'official' ? '🏅 OFFICIAL' : f === 'fans' ? '👥 FANS' : '📋 ALL CALLS'}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 self-center pr-1" style={{ fontSize: 'clamp(10px, 1.3vw, 13px)' }}>
          {isLoading && <span className="text-yellow-400/60">⏳</span>}
          {!isLoading && (
            <span style={{ color: isOnline ? '#00ff88' : '#555' }}>
              {isOnline ? '🌐' : '📴'}
            </span>
          )}
          <span className="text-white/30">{filtered.length} call{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Timeline of calls */}
      <div className="flex-1 scrollable px-3 md:px-5 py-2 md:py-3 space-y-2 md:space-y-3">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-white/30">
            <div className="mb-3" style={{ fontSize: 'clamp(32px, 5vw, 48px)' }}>⚽</div>
            <div style={{ fontSize: 'clamp(12px, 1.6vw, 15px)' }}>No calls yet — be the first referee!</div>
          </div>
        )}
        {[...filtered].reverse().map((call) => {
          const cd = callData(call.callId);
          const rate = agreementRate(call);
          const total = call.agree + call.disagree;
          return (
            <div
              key={call.id}
              className="rounded-xl p-3 md:p-4"
              style={{
                background: call.isOfficial
                  ? 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(0,212,255,0.03))'
                  : 'rgba(255,255,255,0.04)',
                border: call.isOfficial
                  ? '1px solid rgba(0,212,255,0.2)'
                  : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="flex items-start gap-3">
                {/* Minute badge */}
                <div
                  className="flex-shrink-0 rounded-lg flex items-center justify-center font-black"
                  style={{
                    width: 'clamp(36px, 5vw, 52px)',
                    height: 'clamp(36px, 5vw, 52px)',
                    fontSize: 'clamp(11px, 1.5vw, 15px)',
                    background: `${cd?.color ?? '#888'}22`,
                    color: cd?.color ?? '#888',
                    border: `1px solid ${cd?.color ?? '#888'}44`,
                  }}
                >
                  {call.minute}'
                </div>

                <div className="flex-1 min-w-0">
                  {/* Call name + badge */}
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="font-bold truncate"
                      style={{ color: cd?.color ?? '#fff', fontSize: 'clamp(12px, 1.8vw, 16px)' }}
                    >
                      {cd?.emoji} {call.callName}
                    </span>
                    {call.isOfficial && (
                      <span
                        className="font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                        style={{ background: 'rgba(0,212,255,0.2)', color: '#00d4ff', fontSize: 'clamp(8px, 1vw, 11px)' }}
                      >
                        OFFICIAL
                      </span>
                    )}
                  </div>
                  <div className="text-white/40 mb-2 truncate" style={{ fontSize: 'clamp(10px, 1.3vw, 13px)' }}>
                    {call.userName}
                  </div>

                  {/* Agreement bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-full" style={{ height: 'clamp(4px, 0.5vw, 6px)', background: 'rgba(255,255,255,0.08)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${rate}%`,
                          background: rate > 60 ? '#00ff88' : rate > 40 ? '#ffdd00' : '#ff4444',
                        }}
                      />
                    </div>
                    <span
                      className="font-bold"
                      style={{
                        color: rate > 60 ? '#00ff88' : rate > 40 ? '#ffdd00' : '#ff4444',
                        width: 'clamp(32px, 4vw, 44px)',
                        textAlign: 'right',
                        fontSize: 'clamp(10px, 1.3vw, 13px)',
                      }}
                    >
                      {rate}%
                    </span>
                  </div>
                  <div className="text-white/25 mt-0.5" style={{ fontSize: 'clamp(9px, 1.1vw, 12px)' }}>
                    {total.toLocaleString()} fans voted
                  </div>
                </div>

                {/* Vote buttons */}
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button
                    className="call-btn rounded-lg font-bold flex items-center justify-center"
                    style={{
                      width: 'clamp(34px, 4.5vw, 48px)',
                      height: 'clamp(30px, 4vw, 42px)',
                      fontSize: 'clamp(13px, 1.8vw, 18px)',
                      background: 'rgba(0,255,136,0.1)',
                      border: '1px solid rgba(0,255,136,0.2)',
                      color: '#00ff88',
                    }}
                    onClick={() => voteCall(call.id, 'agree')}
                  >
                    ✓
                  </button>
                  <button
                    className="call-btn rounded-lg font-bold flex items-center justify-center"
                    style={{
                      width: 'clamp(34px, 4.5vw, 48px)',
                      height: 'clamp(30px, 4vw, 42px)',
                      fontSize: 'clamp(13px, 1.8vw, 18px)',
                      background: 'rgba(255,68,68,0.1)',
                      border: '1px solid rgba(255,68,68,0.2)',
                      color: '#ff4444',
                    }}
                    onClick={() => voteCall(call.id, 'disagree')}
                  >
                    ✗
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
