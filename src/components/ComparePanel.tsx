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
          className="flex items-center justify-between px-4 py-3"
          style={{
            background: 'linear-gradient(90deg, rgba(0,212,255,0.08), rgba(0,212,255,0.04))',
            borderBottom: '1px solid rgba(0,212,255,0.2)',
            flexShrink: 0,
          }}
        >
          <div className="text-center">
            <div className="font-black text-lg">{currentGame.homeTeam}</div>
            <div className="text-white/40 text-xs">HOME</div>
          </div>
          <div className="text-center">
            <div className="font-black text-3xl" style={{ color: '#00d4ff' }}>
              {currentGame.homeScore} — {currentGame.awayScore}
            </div>
            <div
              className="text-xs font-bold px-2 py-0.5 rounded-full mt-1"
              style={{ background: 'rgba(255,80,80,0.2)', color: '#ff5050' }}
            >
              {currentGame.minute}' LIVE
            </div>
          </div>
          <div className="text-center">
            <div className="font-black text-lg">{currentGame.awayTeam}</div>
            <div className="text-white/40 text-xs">AWAY</div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 px-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        {(['all', 'official', 'fans'] as const).map((f) => (
          <button
            key={f}
            className={`nav-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'official' ? '🏅 OFFICIAL' : f === 'fans' ? '👥 FANS' : '📋 ALL CALLS'}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 text-xs self-center pr-1">
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
      <div className="flex-1 scrollable px-3 py-2 space-y-2">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-white/30">
            <div className="text-4xl mb-3">⚽</div>
            <div className="text-sm">No calls yet — be the first referee!</div>
          </div>
        )}
        {[...filtered].reverse().map((call) => {
          const cd = callData(call.callId);
          const rate = agreementRate(call);
          const total = call.agree + call.disagree;
          return (
            <div
              key={call.id}
              className="rounded-xl p-3"
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
                  className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm"
                  style={{ background: `${cd?.color ?? '#888'}22`, color: cd?.color ?? '#888', border: `1px solid ${cd?.color ?? '#888'}44` }}
                >
                  {call.minute}'
                </div>

                <div className="flex-1 min-w-0">
                  {/* Call name + user */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold truncate" style={{ color: cd?.color ?? '#fff' }}>
                      {cd?.emoji} {call.callName}
                    </span>
                    {call.isOfficial && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded font-bold"
                        style={{ background: 'rgba(0,212,255,0.2)', color: '#00d4ff', fontSize: 9 }}
                      >
                        OFFICIAL
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-white/40 mb-2 truncate">{call.userName}</div>

                  {/* Agreement bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${rate}%`,
                          background: rate > 60 ? '#00ff88' : rate > 40 ? '#ffdd00' : '#ff4444',
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold" style={{ color: rate > 60 ? '#00ff88' : rate > 40 ? '#ffdd00' : '#ff4444', width: 36, textAlign: 'right' }}>
                      {rate}%
                    </span>
                  </div>
                  <div className="text-xs text-white/25 mt-0.5">{total.toLocaleString()} fans voted</div>
                </div>

                {/* Vote buttons */}
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button
                    className="call-btn w-9 h-8 rounded-lg text-sm font-bold"
                    style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.2)', color: '#00ff88' }}
                    onClick={() => voteCall(call.id, 'agree')}
                  >
                    ✓
                  </button>
                  <button
                    className="call-btn w-9 h-8 rounded-lg text-sm font-bold"
                    style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)', color: '#ff4444' }}
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
