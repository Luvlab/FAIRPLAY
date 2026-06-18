import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { fetchAllMatches, LEAGUES, type LiveMatch } from '../lib/footballApi';

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  live: { label: 'LIVE', color: '#ff4444' },
  ht:   { label: 'HT',   color: '#ffaa00' },
  pre:  { label: 'UPCOMING', color: '#00d4ff' },
  ft:   { label: 'FT',   color: '#666' },
};

function formatDate(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffH = diffMs / 3600000;
  if (diffH > 0 && diffH < 24) return `in ${Math.round(diffH)}h`;
  if (diffH < 0 && diffH > -24) return `${Math.round(-diffH)}h ago`;
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function GameSelector({ onClose }: { onClose: () => void }) {
  const selectMatch   = useGameStore((s) => s.selectMatch);
  const currentGame   = useGameStore((s) => s.currentGame);
  const setImpactGame = useGameStore((s) => s.setImpactGame);
  const setActiveTab  = useGameStore((s) => s.setActiveTab);

  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'pre' | 'ft'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAllMatches().then((m) => { setMatches(m); setLoading(false); });
  }, []);

  const regions = ['All', ...Array.from(new Set(LEAGUES.map(l => l.region)))];

  const filtered = matches.filter((m) => {
    const matchStatus = statusFilter === 'all' || m.status === statusFilter || (statusFilter === 'live' && m.status === 'ht');
    const matchRegion = region === 'All' || LEAGUES.find(l => l.id === m.leagueId)?.region === region;
    const matchSearch = !search ||
      m.homeTeam.toLowerCase().includes(search.toLowerCase()) ||
      m.awayTeam.toLowerCase().includes(search.toLowerCase()) ||
      m.leagueName.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchRegion && matchSearch;
  });

  const liveCount = matches.filter(m => m.status === 'live' || m.status === 'ht').length;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(0,0,0,0.92)' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#0d1117' }}
      >
        <div>
          <div className="font-black text-base" style={{ color: '#00d4ff' }}>Select a Match</div>
          <div className="text-white/40 text-xs">
            {loading ? 'Fetching live data…' : `${matches.length} matches${liveCount > 0 ? ` · ${liveCount} LIVE` : ''}`}
          </div>
        </div>
        <button
          className="ml-auto call-btn px-3 py-1.5 rounded-lg text-sm font-bold"
          style={{ color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
          onClick={onClose}
        >
          ✕ Close
        </button>
      </div>

      {/* Filters */}
      <div className="flex-shrink-0 px-3 pt-2 pb-1 space-y-2" style={{ background: '#0d1117' }}>
        <input
          type="text"
          placeholder="Search teams or leagues…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg px-3 py-2 text-sm"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
        />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['all', 'live', 'pre', 'ft'] as const).map((s) => (
            <button
              key={s}
              className={`nav-tab flex-shrink-0 ${statusFilter === s ? 'active' : ''}`}
              style={statusFilter === s && s === 'live' ? { borderColor: '#ff4444', color: '#ff4444', background: 'rgba(255,68,68,0.15)' } : {}}
              onClick={() => setStatusFilter(s)}
            >
              {s === 'all' ? '📋 ALL' : s === 'live' ? `🔴 LIVE${liveCount > 0 ? ` (${liveCount})` : ''}` : s === 'pre' ? '⏰ UPCOMING' : '📁 RESULTS'}
            </button>
          ))}
          <div className="w-px h-6 self-center mx-1" style={{ background: 'rgba(255,255,255,0.1)' }} />
          {regions.map((r) => (
            <button
              key={r}
              className={`nav-tab flex-shrink-0 ${region === r ? 'active' : ''}`}
              onClick={() => setRegion(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Match list */}
      <div className="flex-1 scrollable px-3 py-2 space-y-2">
        {loading && (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-white/30">
            <div className="text-3xl">⚽</div>
            <div className="text-sm">Loading live matches…</div>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-white/30">
            <div className="text-3xl">📭</div>
            <div className="text-sm">No matches found</div>
          </div>
        )}

        {filtered.map((m) => {
          const st = STATUS_LABEL[m.status] ?? STATUS_LABEL.ft;
          const isSelected = currentGame?.id === m.id;
          return (
            <div
              key={m.id}
              className="rounded-xl"
              style={{
                background: isSelected ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.04)',
                border: isSelected ? '1px solid rgba(0,212,255,0.4)' : '1px solid rgba(255,255,255,0.07)',
                display: 'flex',
                alignItems: 'stretch',
                overflow: 'hidden',
              }}
            >
              {/* Main match row — select & close */}
              <button
                className="flex-1 call-btn p-3 text-left"
                onClick={() => { selectMatch(m); onClose(); }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">{m.leagueFlag}</span>
                  <span className="text-white/40 text-xs font-bold">{m.leagueName}</span>
                  <span
                    className="ml-auto font-black text-xs px-2 py-0.5 rounded-full"
                    style={{ background: `${st.color}22`, color: st.color, border: `1px solid ${st.color}44` }}
                  >
                    {m.status === 'live' || m.status === 'ht'
                      ? m.status === 'ht' ? 'HT' : `${m.displayClock || m.minute + "'"}`
                      : m.status === 'pre' ? formatDate(m.date) : 'FT'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 text-right">
                    <div className="font-bold text-sm truncate">{m.homeTeam}</div>
                  </div>
                  <div className="flex-shrink-0 text-center min-w-[60px]">
                    {m.status === 'pre' ? (
                      <span className="text-white/40 text-sm font-bold">vs</span>
                    ) : (
                      <span className="font-black text-lg" style={{ color: m.status === 'live' ? '#00d4ff' : 'white' }}>
                        {m.homeScore} — {m.awayScore}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold text-sm truncate">{m.awayTeam}</div>
                  </div>
                </div>

                {m.venue && (
                  <div className="text-white/25 text-xs mt-1.5 truncate">📍 {m.venue}</div>
                )}
              </button>

              {/* Thermometer button */}
              <button
                className="call-btn flex-shrink-0 flex items-center justify-center"
                style={{
                  background: 'rgba(255,100,0,0.08)',
                  borderLeft: '1px solid rgba(255,100,0,0.15)',
                  color: 'rgba(255,100,0,0.8)',
                  padding: '0 10px',
                  fontSize: 'clamp(14px,2vw,18px)',
                }}
                title="View match impact"
                onClick={() => {
                  setImpactGame({
                    id: m.id,
                    homeTeam: m.homeTeam,
                    awayTeam: m.awayTeam,
                    league: m.leagueName ?? '',
                    leagueId: m.leagueId ?? '',
                    status: m.status,
                    minute: m.minute,
                  });
                  setActiveTab('impact');
                  onClose();
                }}
              >
                🌡️
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
