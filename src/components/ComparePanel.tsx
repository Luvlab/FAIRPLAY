import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { SOCCER_CALLS } from '../data/soccerCalls';
import { useT } from '../context/I18nContext';
import { isGameLive } from '../store/gameStore';

interface DeletedCall {
  id: string;
  callId: string;
  callName: string;
  minute: number;
  agree: number;
  disagree: number;
  playerName?: string;
}

export default function ComparePanel() {
  const t              = useT();
  const allCalls        = useGameStore((s) => s.allCalls);
  const userCalls       = useGameStore((s) => s.userCalls);
  const voteCall        = useGameStore((s) => s.voteCall);
  const deleteCall      = useGameStore((s) => s.deleteCall);
  const updateCallData  = useGameStore((s) => s.updateCallData);
  const compareFilter   = useGameStore((s) => s.compareFilter);
  const setCompareFilter = useGameStore((s) => s.setCompareFilter);
  const currentGame     = useGameStore((s) => s.currentGame);
  const isOnline        = useGameStore((s) => s.isOnline);
  const isLoading       = useGameStore((s) => s.isLoading);
  const userId          = useGameStore((s) => s.userId);
  const submitLiveCall  = useGameStore((s) => s.submitLiveCall);

  // Soft-deleted calls for unerase
  const [deleted, setDeleted] = useState<DeletedCall[]>([]);

  // Edit state: which call is being edited
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCallId, setEditCallId] = useState('');
  const [editPlayerName, setEditPlayerName] = useState('');

  // Oppose state: which official call card has the oppose panel open
  const [opposeOpenId, setOpposeOpenId] = useState<string | null>(null);
  const [opposeCallId, setOpposeCallId] = useState('');
  const [opposePlayerName, setOpposePlayerName] = useState('');

  const callData = (callId: string) => SOCCER_CALLS.find((c) => c.id === callId);

  const agreementRate = (agree: number, disagree: number) => {
    const total = agree + disagree;
    return total > 0 ? Math.round((agree / total) * 100) : 50;
  };

  // Compute displayed calls based on active filter
  const filtered = (() => {
    if (compareFilter === 'mine') {
      return userCalls;
    }
    if (compareFilter === 'official') return allCalls.filter((c) => c.isOfficial);
    if (compareFilter === 'fans') return allCalls.filter((c) => !c.isOfficial);
    return allCalls;
  })();

  const handleDelete = (id: string) => {
    const call = allCalls.find((c) => c.id === id) ?? userCalls.find((c) => c.id === id);
    if (!call) return;
    setDeleted((prev) => [...prev, { id: call.id, callId: call.callId, callName: call.callName, minute: call.minute, agree: call.agree, disagree: call.disagree, playerName: call.playerName }]);
    deleteCall(id);
    if (editingId === id) setEditingId(null);
  };

  const handleUnerase = (item: DeletedCall) => {
    // Re-add via makeCall equivalent — use updateCallData won't work since it's deleted.
    // We restore it via store's makeCall-like approach by dispatching to store directly.
    // Simplest: push back via zustand set — but we can use updateCallData on a ghost.
    // Instead, we restore through the store's makeCall (imported from store via zustand action).
    const { makeCall } = useGameStore.getState();
    makeCall({
      id: item.id,
      callId: item.callId,
      callName: item.callName,
      minute: item.minute,
      userId: userId ?? 'me',
      userName: 'You',
      playerName: item.playerName,
      timestamp: Date.now(),
      agree: item.agree,
      disagree: item.disagree,
      isOfficial: false,
    });
    setDeleted((prev) => prev.filter((d) => d.id !== item.id));
  };

  const startEdit = (id: string, initialCallId: string, playerName: string | undefined) => {
    setEditingId(id);
    setEditCallId(initialCallId);
    setEditPlayerName(playerName ?? '');
  };

  const commitEdit = (id: string) => {
    const meta = SOCCER_CALLS.find((c) => c.id === editCallId);
    if (!meta) return;
    updateCallData(id, editCallId, meta.name, editPlayerName.trim() || undefined);
    setEditingId(null);
  };

  const openOppose = (id: string) => {
    setOpposeOpenId(id);
    setOpposeCallId('');
    setOpposePlayerName('');
  };

  const submitOppose = (call: { minute: number }) => {
    if (!opposeCallId) return;
    const meta = SOCCER_CALLS.find((c) => c.id === opposeCallId);
    if (!meta) return;
    submitLiveCall(opposeCallId, meta.name, call.minute, undefined, opposePlayerName.trim() || undefined);
    setOpposeOpenId(null);
  };

  const TABS: { id: typeof compareFilter; label: string }[] = [
    { id: 'all',      label: t.tabAll },
    { id: 'official', label: t.tabOfficial },
    { id: 'fans',     label: t.tabFans },
    { id: 'mine',     label: t.tabMine ?? 'Mine' },
  ];

  return (
    <div className="flex flex-col h-full scrollable">
      {/* Scoreboard */}
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
              {currentGame.minute}' {currentGame.status === 'live' ? 'LIVE' : currentGame.status.toUpperCase()}
            </div>
          </div>
          <div className="text-center">
            <div className="font-black" style={{ fontSize: 'clamp(14px, 2.5vw, 22px)' }}>{currentGame.awayTeam}</div>
            <div className="text-white/40" style={{ fontSize: 'clamp(9px, 1.2vw, 12px)' }}>AWAY</div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1.5 px-3 py-2 md:px-4 md:py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab ${compareFilter === tab.id ? 'active' : ''}`}
            onClick={() => setCompareFilter(tab.id)}
          >
            {tab.label}
            {tab.id === 'mine' && userCalls.length > 0 && (
              <span
                className="ml-1 font-black px-1 rounded"
                style={{ background: compareFilter === 'mine' ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.1)', fontSize: '0.75em' }}
              >
                {userCalls.length}
              </span>
            )}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 self-center pr-1" style={{ fontSize: 'clamp(10px, 1.3vw, 13px)' }}>
          {isLoading && <span className="text-yellow-400/60">⏳</span>}
          {!isLoading && (
            <span style={{ color: isOnline ? '#00ff88' : '#555' }}>
              {isOnline ? '🌐' : '📴'}
            </span>
          )}
          <span className="text-white/30">{filtered.length} {filtered.length !== 1 ? t.callsLabelPlural : t.callsLabel}</span>
        </div>
      </div>

      {/* Unerase tray — shown when there are soft-deleted calls in 'mine' tab */}
      {compareFilter === 'mine' && deleted.length > 0 && (
        <div className="px-3 pt-2" style={{ flexShrink: 0 }}>
          <div
            className="rounded-xl px-3 py-2 flex flex-col gap-1"
            style={{ background: 'rgba(255,170,0,0.06)', border: '1px solid rgba(255,170,0,0.2)' }}
          >
            <div className="font-bold text-white/40" style={{ fontSize: 'clamp(9px, 1.1vw, 11px)', letterSpacing: '0.8px' }}>
              🗑 DELETED — tap to restore
            </div>
            <div className="flex flex-wrap gap-2">
              {deleted.map((d) => {
                const cd = callData(d.callId);
                return (
                  <button
                    key={d.id}
                    className="call-btn flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                    style={{ background: `${cd?.color ?? '#888'}18`, border: `1px solid ${cd?.color ?? '#888'}40`, fontSize: 'clamp(10px, 1.3vw, 13px)' }}
                    onClick={() => handleUnerase(d)}
                  >
                    <span>{cd?.emoji}</span>
                    <span style={{ color: cd?.color ?? '#aaa' }}>{d.minute}'</span>
                    <span className="text-white/50">↩</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Call list */}
      <div className="flex-1 scrollable px-3 md:px-5 py-2 md:py-3 space-y-2 md:space-y-3">
        {filtered.length === 0 && deleted.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-white/30">
            <div className="mb-3" style={{ fontSize: 'clamp(32px, 5vw, 48px)' }}>⚽</div>
            <div style={{ fontSize: 'clamp(12px, 1.6vw, 15px)' }}>
              {compareFilter === 'mine' ? (t.noCallsYet ?? 'No calls yet') : t.beFirstRef}
            </div>
          </div>
        )}
        {[...filtered].reverse().map((call) => {
          const cd = callData(call.callId);
          const rate = agreementRate(call.agree, call.disagree);
          const total = call.agree + call.disagree;
          const isMine = compareFilter === 'mine' || call.userId === userId;
          const isEditing = editingId === call.id;

          return (
            <div
              key={call.id}
              className="rounded-xl p-3 md:p-4"
              style={{
                background: call.isOfficial
                  ? 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(0,212,255,0.03))'
                  : isMine
                  ? 'rgba(0,212,255,0.04)'
                  : 'rgba(255,255,255,0.04)',
                border: call.isOfficial
                  ? '1px solid rgba(0,212,255,0.2)'
                  : isMine
                  ? '1px solid rgba(0,212,255,0.12)'
                  : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {/* Main row */}
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
                  {/* Call name + badges */}
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold truncate" style={{ color: cd?.color ?? '#fff', fontSize: 'clamp(12px, 1.8vw, 16px)' }}>
                      {cd?.emoji} {call.callName}
                    </span>
                    {call.isOfficial && (
                      <span className="font-bold px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: 'rgba(0,212,255,0.2)', color: '#00d4ff', fontSize: 'clamp(8px, 1vw, 11px)' }}>
                        OFFICIAL
                      </span>
                    )}
                    {isMine && !call.isOfficial && (
                      <span className="font-bold px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff', fontSize: 'clamp(8px, 1vw, 11px)' }}>
                        YOU
                      </span>
                    )}
                    {call.playerName && !isEditing && (
                      <span className="font-bold px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: `${cd?.color ?? '#888'}22`, color: cd?.color ?? '#aaa', border: `1px solid ${cd?.color ?? '#888'}44`, fontSize: 'clamp(8px, 1vw, 11px)' }}>
                        #{call.playerName}
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
                        style={{ width: `${rate}%`, background: rate > 60 ? '#00ff88' : rate > 40 ? '#ffdd00' : '#ff4444' }}
                      />
                    </div>
                    <span
                      className="font-bold"
                      style={{ color: rate > 60 ? '#00ff88' : rate > 40 ? '#ffdd00' : '#ff4444', width: 'clamp(32px, 4vw, 44px)', textAlign: 'right', fontSize: 'clamp(10px, 1.3vw, 13px)' }}
                    >
                      {rate}%
                    </span>
                  </div>
                  <div className="text-white/25 mt-0.5" style={{ fontSize: 'clamp(9px, 1.1vw, 12px)' }}>
                    {total.toLocaleString()} {t.fansVoted}
                  </div>
                </div>

                {/* Right side: vote buttons (non-mine) OR edit+delete (mine) */}
                {isMine && !call.isOfficial ? (
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button
                      className="call-btn rounded-lg flex items-center justify-center"
                      style={{ width: 'clamp(34px, 4.5vw, 46px)', height: 'clamp(30px, 3.5vw, 40px)', fontSize: 'clamp(13px, 1.5vw, 17px)', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff' }}
                      onClick={() => isEditing ? setEditingId(null) : startEdit(call.id, call.callId, call.playerName ?? undefined)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className="call-btn rounded-lg flex items-center justify-center"
                      style={{ width: 'clamp(34px, 4.5vw, 46px)', height: 'clamp(30px, 3.5vw, 40px)', fontSize: 'clamp(13px, 1.5vw, 17px)', background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)', color: '#ff5555' }}
                      onClick={() => handleDelete(call.id)}
                      title="Delete"
                    >
                      🗑
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    {/* OPPOSE button — only on official calls when not in 'mine' filter */}
                    {call.isOfficial && compareFilter !== 'mine' && isGameLive(currentGame?.status) && (
                      <button
                        className="call-btn rounded-lg font-bold flex items-center justify-center"
                        style={{
                          width: 'clamp(50px, 6vw, 68px)',
                          height: 'clamp(28px, 3.5vw, 38px)',
                          fontSize: 'clamp(9px, 1.1vw, 12px)',
                          background: 'rgba(255,165,0,0.12)',
                          border: '1px solid rgba(255,165,0,0.3)',
                          color: '#ffaa00',
                          letterSpacing: '0.5px',
                        }}
                        onClick={() => opposeOpenId === call.id ? setOpposeOpenId(null) : openOppose(call.id)}
                      >
                        ⚡ OPPOSE
                      </button>
                    )}
                    <button
                      className="call-btn rounded-lg font-bold flex items-center justify-center"
                      style={{ width: call.isOfficial && compareFilter !== 'mine' && isGameLive(currentGame?.status) ? 'clamp(50px, 6vw, 68px)' : 'clamp(34px, 4.5vw, 48px)', height: 'clamp(30px, 4vw, 42px)', fontSize: 'clamp(13px, 1.8vw, 18px)', background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.2)', color: '#00ff88' }}
                      onClick={() => voteCall(call.id, 'agree')}
                    >
                      ✓
                    </button>
                    <button
                      className="call-btn rounded-lg font-bold flex items-center justify-center"
                      style={{ width: call.isOfficial && compareFilter !== 'mine' && isGameLive(currentGame?.status) ? 'clamp(50px, 6vw, 68px)' : 'clamp(34px, 4.5vw, 48px)', height: 'clamp(30px, 4vw, 42px)', fontSize: 'clamp(13px, 1.8vw, 18px)', background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)', color: '#ff4444' }}
                      onClick={() => voteCall(call.id, 'disagree')}
                    >
                      ✗
                    </button>
                  </div>
                )}
              </div>

              {/* Oppose inline panel */}
              {opposeOpenId === call.id && (
                <div
                  className="mt-3 rounded-xl p-3 flex flex-col gap-2"
                  style={{ background: 'rgba(255,165,0,0.06)', border: '1px solid rgba(255,165,0,0.2)' }}
                >
                  <div className="font-bold" style={{ color: '#ffaa00', fontSize: 'clamp(10px, 1.4vw, 13px)', letterSpacing: '0.5px' }}>
                    ⚡ What would YOU have called?
                  </div>
                  {/* Call picker grid */}
                  <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                    {SOCCER_CALLS.slice(0, 12).map((sc) => (
                      <button
                        key={sc.id}
                        className="call-btn px-1.5 py-1.5 rounded-lg font-bold flex flex-col items-center gap-0.5"
                        style={{
                          background: opposeCallId === sc.id ? `${sc.color}33` : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${opposeCallId === sc.id ? sc.color : 'rgba(255,255,255,0.1)'}`,
                          color: opposeCallId === sc.id ? sc.color : 'rgba(255,255,255,0.6)',
                          fontSize: 'clamp(8px, 1vw, 11px)',
                        }}
                        onClick={() => setOpposeCallId(sc.id)}
                      >
                        <span style={{ fontSize: 'clamp(13px, 1.6vw, 16px)' }}>{sc.emoji}</span>
                        <span>{sc.shortName}</span>
                      </button>
                    ))}
                  </div>
                  {/* Optional player name */}
                  <input
                    type="text"
                    placeholder="Player name / number (optional)"
                    value={opposePlayerName}
                    onChange={(e) => setOpposePlayerName(e.target.value)}
                    maxLength={40}
                    className="w-full rounded-lg px-3 py-2"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,165,0,0.2)', color: '#fff', outline: 'none', fontSize: 'clamp(11px, 1.5vw, 14px)' }}
                  />
                  <div className="flex gap-2">
                    <button
                      className="call-btn flex-1 py-2 rounded-lg font-bold"
                      disabled={!opposeCallId}
                      style={{
                        background: opposeCallId ? 'rgba(255,165,0,0.2)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${opposeCallId ? 'rgba(255,165,0,0.45)' : 'rgba(255,255,255,0.1)'}`,
                        color: opposeCallId ? '#ffaa00' : 'rgba(255,255,255,0.25)',
                        fontSize: 'clamp(11px, 1.4vw, 14px)',
                      }}
                      onClick={() => submitOppose(call)}
                    >
                      SUBMIT MY CALL
                    </button>
                    <button
                      className="call-btn px-4 py-2 rounded-lg font-bold"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)', fontSize: 'clamp(11px, 1.4vw, 14px)' }}
                      onClick={() => setOpposeOpenId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Inline edit panel */}
              {isEditing && (
                <div
                  className="mt-3 rounded-xl p-3 flex flex-col gap-2"
                  style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)' }}
                >
                  {/* Call type picker */}
                  <div>
                    <div className="text-white/40 font-bold mb-1" style={{ fontSize: 'clamp(9px, 1.1vw, 11px)', letterSpacing: '0.8px' }}>CALL TYPE</div>
                    <div className="flex flex-wrap gap-1.5">
                      {SOCCER_CALLS.slice(0, 12).map((sc) => (
                        <button
                          key={sc.id}
                          className="call-btn px-2 py-1 rounded-lg font-bold"
                          style={{
                            background: editCallId === sc.id ? `${sc.color}33` : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${editCallId === sc.id ? sc.color : 'rgba(255,255,255,0.1)'}`,
                            color: editCallId === sc.id ? sc.color : 'rgba(255,255,255,0.6)',
                            fontSize: 'clamp(9px, 1.2vw, 12px)',
                          }}
                          onClick={() => setEditCallId(sc.id)}
                        >
                          {sc.emoji} {sc.shortName}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Player name */}
                  <input
                    type="text"
                    placeholder="Player name / number (optional)"
                    value={editPlayerName}
                    onChange={(e) => setEditPlayerName(e.target.value)}
                    maxLength={40}
                    className="w-full rounded-lg px-3 py-2"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(0,212,255,0.2)', color: '#fff', outline: 'none', fontSize: 'clamp(11px, 1.5vw, 14px)' }}
                  />
                  <div className="flex gap-2">
                    <button
                      className="call-btn flex-1 py-2 rounded-lg font-bold"
                      style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.35)', color: '#00d4ff', fontSize: 'clamp(11px, 1.4vw, 14px)' }}
                      onClick={() => commitEdit(call.id)}
                    >
                      Save
                    </button>
                    <button
                      className="call-btn px-4 py-2 rounded-lg font-bold"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)', fontSize: 'clamp(11px, 1.4vw, 14px)' }}
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
