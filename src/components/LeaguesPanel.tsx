import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useT } from '../context/I18nContext';
import { LEAGUES, fetchLeagueMatches, type LiveMatch } from '../lib/footballApi';

// ── Types ──────────────────────────────────────────────────────────────────
type MainView = 'world' | 'local' | 'add' | 'match';

interface LeagueInfo {
  id: string;
  name: string;
  flag: string;
  region: string;
}

// ── Age groups (static, not translated for brevity) ──────────────────────
const AGE_GROUPS = [
  'Open / Senior', 'U21', 'U18', 'U16', 'U14', 'U12', 'U10', 'U8',
  'Veterans 35+', 'Veterans 45+',
];

const REGIONS = ['All', 'Europe', 'Americas', 'Asia', 'Africa', 'Oceania', 'International'];

// ── Status badge colours ──────────────────────────────────────────────────
function statusStyle(status: LiveMatch['status']) {
  switch (status) {
    case 'live': return { bg: 'rgba(255,68,68,0.2)', color: '#ff5050', label: '🔴 LIVE' };
    case 'ht':   return { bg: 'rgba(255,165,0,0.2)', color: '#ffaa00', label: '⏸ HT' };
    case 'ft':   return { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', label: 'FT' };
    default:     return { bg: 'rgba(0,212,255,0.12)', color: '#00d4ff', label: '🕐' };
  }
}

// ── Match card ─────────────────────────────────────────────────────────────
function MatchCard({
  match,
  onReferee,
  refereeLabel,
}: {
  match: LiveMatch;
  onReferee: (m: LiveMatch) => void;
  refereeLabel: string;
}) {
  const s = statusStyle(match.status);
  const isLive = match.status === 'live' || match.status === 'ht';

  const timeLabel = match.status === 'pre'
    ? new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : match.status === 'live'
    ? `${match.minute}'`
    : match.status === 'ht'
    ? 'HT'
    : 'FT';

  return (
    <div
      className="rounded-xl p-3 md:p-4 flex items-center gap-3"
      style={{
        background: isLive
          ? 'linear-gradient(135deg, rgba(255,68,68,0.07), rgba(255,68,68,0.03))'
          : 'rgba(255,255,255,0.04)',
        border: isLive
          ? '1px solid rgba(255,68,68,0.2)'
          : '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Teams + score */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {/* Home logo */}
          {match.homeLogo && (
            <img src={match.homeLogo} alt="" className="w-5 h-5 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          )}
          <span className="font-bold truncate" style={{ fontSize: 'clamp(11px, 1.6vw, 14px)' }}>{match.homeTeamAbbr || match.homeTeam}</span>

          <span
            className="font-black flex-shrink-0"
            style={{
              fontSize: 'clamp(13px, 2vw, 18px)',
              color: isLive ? '#ff5050' : '#00d4ff',
              minWidth: 40,
              textAlign: 'center',
            }}
          >
            {match.status === 'pre' ? 'vs' : `${match.homeScore}–${match.awayScore}`}
          </span>

          <span className="font-bold truncate" style={{ fontSize: 'clamp(11px, 1.6vw, 14px)' }}>{match.awayTeamAbbr || match.awayTeam}</span>
          {match.awayLogo && (
            <img src={match.awayLogo} alt="" className="w-5 h-5 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          )}
        </div>

        {/* Venue */}
        {match.venue && (
          <div className="text-white/30 truncate" style={{ fontSize: 'clamp(9px, 1.1vw, 11px)' }}>{match.venue}</div>
        )}
      </div>

      {/* Status + time */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <div
          className="rounded-md px-2 py-0.5 font-bold"
          style={{ background: s.bg, color: s.color, fontSize: 'clamp(9px, 1.2vw, 11px)' }}
        >
          {s.label}
        </div>
        <div className="text-white/40 font-bold" style={{ fontSize: 'clamp(10px, 1.3vw, 12px)' }}>
          {timeLabel}
        </div>
      </div>

      {/* Referee button */}
      <button
        className="call-btn flex-shrink-0 rounded-lg font-black px-3 py-2"
        style={{
          background: 'rgba(0,212,255,0.15)',
          border: '1px solid rgba(0,212,255,0.3)',
          color: '#00d4ff',
          fontSize: 'clamp(10px, 1.3vw, 13px)',
          letterSpacing: '0.5px',
        }}
        onClick={() => onReferee(match)}
      >
        {refereeLabel}
      </button>
    </div>
  );
}

// ── League detail view ─────────────────────────────────────────────────────
function LeagueDetail({
  league,
  onBack,
  onReferee,
  t,
}: {
  league: LeagueInfo;
  onBack: () => void;
  onReferee: (m: LiveMatch) => void;
  t: ReturnType<typeof useT>;
}) {
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'live' | 'upcoming' | 'results'>('all');

  useEffect(() => {
    setLoading(true);
    fetchLeagueMatches(league.id).then((ms) => {
      setMatches(ms);
      setLoading(false);
    });
  }, [league.id]);

  const filtered = matches.filter((m) => {
    if (tab === 'live') return m.status === 'live' || m.status === 'ht';
    if (tab === 'upcoming') return m.status === 'pre';
    if (tab === 'results') return m.status === 'ft';
    return true;
  });

  const tabs = [
    { id: 'all' as const,      label: t.allMatches },
    { id: 'live' as const,     label: t.liveMatches },
    { id: 'upcoming' as const, label: t.upcomingMatches },
    { id: 'results' as const,  label: t.recentResults },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-3 py-2 md:px-4 md:py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}
      >
        <button
          className="call-btn font-bold text-white/50 hover:text-white/80 flex-shrink-0"
          style={{ fontSize: 'clamp(11px, 1.4vw, 14px)' }}
          onClick={onBack}
        >
          {t.backBtn}
        </button>
        <span style={{ fontSize: 'clamp(22px, 3.5vw, 32px)' }}>{league.flag}</span>
        <div className="font-black truncate" style={{ fontSize: 'clamp(13px, 2vw, 18px)', color: '#00d4ff' }}>
          {league.name}
        </div>
      </div>

      {/* Sub-tabs */}
      <div
        className="flex gap-1.5 px-3 py-2 overflow-x-auto"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}
      >
        {tabs.map((tb) => (
          <button
            key={tb.id}
            className={`nav-tab flex-shrink-0 ${tab === tb.id ? 'active' : ''}`}
            onClick={() => setTab(tb.id)}
          >
            {tb.label}
          </button>
        ))}
        <div className="ml-auto self-center pr-1 text-white/30 flex-shrink-0" style={{ fontSize: 'clamp(9px, 1.2vw, 12px)' }}>
          {loading ? '⏳' : `${filtered.length}`}
        </div>
      </div>

      {/* Match list */}
      <div className="flex-1 scrollable px-3 md:px-4 py-2 space-y-2">
        {loading && (
          <div className="flex items-center justify-center h-40 text-white/30" style={{ fontSize: 'clamp(12px, 1.6vw, 15px)' }}>
            {t.loadingMatches}
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-white/30 gap-2">
            <span style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}>📅</span>
            <div style={{ fontSize: 'clamp(12px, 1.6vw, 15px)' }}>{t.noMatchesScheduled}</div>
          </div>
        )}
        {!loading && filtered.map((m) => (
          <MatchCard
            key={m.id}
            match={m}
            onReferee={onReferee}
            refereeLabel={t.refereeThis}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main LeaguesPanel ──────────────────────────────────────────────────────
export default function LeaguesPanel() {
  const t = useT();
  const localLeagues   = useGameStore((s) => s.localLeagues);
  const addLocalLeague = useGameStore((s) => s.addLocalLeague);
  const selectMatch    = useGameStore((s) => s.selectMatch);
  const setCustomMatch = useGameStore((s) => s.setCustomMatch);
  const setActiveTab   = useGameStore((s) => s.setActiveTab);

  const [view, setView]               = useState<MainView>('world');
  const [selectedLeague, setSelected] = useState<LeagueInfo | null>(null);
  const [region, setRegion]           = useState('All');
  const [search, setSearch]           = useState('');

  const [newLeague, setNewLeague] = useState({
    name: '', country: '', ageGroup: AGE_GROUPS[0], teams: '',
  });

  const [customHome, setCustomHome]   = useState('');
  const [customAway, setCustomAway]   = useState('');
  const [customLeague, setCustomLeague] = useState('');

  // ── World league list ────────────────────────────────────────────────
  const filteredLeagues = LEAGUES.filter((l) => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase());
    const matchRegion = region === 'All' || l.region === region;
    return matchSearch && matchRegion;
  });

  // ── Handlers ─────────────────────────────────────────────────────────
  const handleLeagueTap = (league: LeagueInfo) => {
    setSelected(league);
  };

  const handleReferee = (match: LiveMatch) => {
    selectMatch(match);
    setActiveTab('referee');
  };

  const handleAddLeague = () => {
    if (!newLeague.name || !newLeague.country) return;
    addLocalLeague({
      name: newLeague.name,
      country: newLeague.country,
      ageGroup: newLeague.ageGroup,
      teams: newLeague.teams.split(',').map((t) => t.trim()).filter(Boolean),
    });
    setNewLeague({ name: '', country: '', ageGroup: AGE_GROUPS[0], teams: '' });
    setView('local');
  };

  const handleCreateMatch = () => {
    if (!customHome.trim() || !customAway.trim()) return;
    setCustomMatch(customHome.trim(), customAway.trim(), customLeague.trim() || undefined);
    setActiveTab('referee');
  };

  // ── League detail overlay ─────────────────────────────────────────────
  if (selectedLeague) {
    return (
      <LeagueDetail
        league={selectedLeague}
        onBack={() => setSelected(null)}
        onReferee={handleReferee}
        t={t}
      />
    );
  }

  // ── Input style helper ────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    outline: 'none',
    fontSize: 'clamp(12px, 1.5vw, 15px)',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 'clamp(9px, 1.1vw, 12px)',
  };

  return (
    <div className="flex flex-col h-full">

      {/* ── Top tab bar ──────────────────────────────────────────────── */}
      <div
        className="flex gap-1.5 px-3 py-2 md:px-4 md:py-3 overflow-x-auto"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}
      >
        {([
          ['world', t.tabWorld],
          ['local', `${t.tabLocal} (${localLeagues.length})`],
          ['add',   t.tabAddLeague],
          ['match', t.tabSingleMatch],
        ] as [MainView, string][]).map(([v, label]) => (
          <button
            key={v}
            className={`nav-tab flex-shrink-0 ${view === v ? 'active' : ''}`}
            onClick={() => setView(v)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── WORLD tab ─────────────────────────────────────────────────── */}
      {view === 'world' && (
        <>
          <div className="px-3 py-2 md:px-4 md:py-3 space-y-2" style={{ flexShrink: 0 }}>
            <input
              type="text"
              placeholder={t.searchLeagues}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg px-3 py-2 md:py-2.5"
              style={inputStyle}
            />
            <div className="flex gap-1 overflow-x-auto pb-1">
              {REGIONS.map((r) => (
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

          <div className="flex-1 scrollable px-3 md:px-4 space-y-1.5 md:space-y-2 pb-4">
            {filteredLeagues.map((league) => (
              <button
                key={league.id}
                className="w-full call-btn flex items-center gap-3 p-3 md:p-4 rounded-xl text-left"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                onClick={() => handleLeagueTap(league)}
              >
                <span className="flex-shrink-0" style={{ fontSize: 'clamp(22px, 3.5vw, 32px)' }}>{league.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate" style={{ fontSize: 'clamp(12px, 1.7vw, 16px)' }}>{league.name}</div>
                  <div className="text-white/40" style={{ fontSize: 'clamp(10px, 1.3vw, 13px)' }}>{league.region}</div>
                </div>
                <div
                  className="font-bold px-2 py-0.5 rounded flex-shrink-0 text-white/30"
                  style={{ fontSize: 'clamp(16px, 2vw, 20px)' }}
                >
                  ›
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* ── LOCAL tab ────────────────────────────────────────────────── */}
      {view === 'local' && (
        <div className="flex-1 scrollable px-3 md:px-5 py-3 space-y-2 md:space-y-3">
          {localLeagues.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-white/30 text-center gap-3">
              <div style={{ fontSize: 'clamp(36px, 6vw, 56px)' }}>📍</div>
              <div style={{ fontSize: 'clamp(12px, 1.6vw, 15px)' }}>{t.noLocalLeagues}</div>
              <button
                className="call-btn px-4 py-2 rounded-lg font-bold"
                style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff', fontSize: 'clamp(11px, 1.5vw, 14px)' }}
                onClick={() => setView('add')}
              >
                {t.addYourLeague}
              </button>
            </div>
          ) : localLeagues.map((l) => (
            <div
              key={l.id}
              className="p-3 md:p-4 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="font-bold" style={{ fontSize: 'clamp(13px, 1.8vw, 17px)' }}>{l.name}</div>
              <div className="text-white/40 mt-0.5" style={{ fontSize: 'clamp(10px, 1.3vw, 13px)' }}>
                {l.country} · {l.ageGroup}
              </div>
              {l.teams.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {l.teams.map((tm, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded"
                      style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff', fontSize: 'clamp(10px, 1.3vw, 13px)' }}
                    >
                      {tm}
                    </span>
                  ))}
                </div>
              )}

              {/* Create match in this league */}
              <button
                className="call-btn mt-3 w-full py-2 rounded-lg font-bold"
                style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', fontSize: 'clamp(10px, 1.3vw, 13px)' }}
                onClick={() => {
                  setCustomLeague(l.name);
                  setView('match');
                }}
              >
                ⚽ {t.tabSingleMatch}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── ADD LEAGUE tab ──────────────────────────────────────────── */}
      {view === 'add' && (
        <div className="flex-1 scrollable px-3 py-3 md:py-5">
          <div className="space-y-3 md:space-y-4 max-w-lg mx-auto">
            <div className="text-center mb-4">
              <div style={{ fontSize: 'clamp(24px, 4vw, 36px)' }}>📍</div>
              <div className="font-bold mt-1 text-white/80" style={{ fontSize: 'clamp(13px, 1.8vw, 17px)' }}>
                {t.addLocalLeagueTitle}
              </div>
              <div className="text-white/40 mt-1" style={{ fontSize: 'clamp(10px, 1.3vw, 13px)' }}>
                {t.forAnyAgeGroup}
              </div>
            </div>

            {[
              { label: t.leagueName,  key: 'name' as const,    placeholder: t.leagueNamePlaceholder },
              { label: t.cityCountry, key: 'country' as const, placeholder: t.cityPlaceholder },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="text-white/50 font-bold uppercase tracking-wider mb-1 block" style={labelStyle}>{label}</label>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={newLeague[key]}
                  onChange={(e) => setNewLeague((n) => ({ ...n, [key]: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2.5"
                  style={inputStyle}
                />
              </div>
            ))}

            <div>
              <label className="text-white/50 font-bold uppercase tracking-wider mb-1 block" style={labelStyle}>{t.ageGroupLabel}</label>
              <select
                value={newLeague.ageGroup}
                onChange={(e) => setNewLeague((n) => ({ ...n, ageGroup: e.target.value }))}
                className="w-full rounded-lg px-3 py-2.5"
                style={inputStyle}
              >
                {AGE_GROUPS.map((ag) => (
                  <option key={ag} value={ag} style={{ background: '#0d1117' }}>{ag}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-white/50 font-bold uppercase tracking-wider mb-1 block" style={labelStyle}>{t.teamsLabel}</label>
              <textarea
                placeholder={t.teamsPlaceholder}
                value={newLeague.teams}
                onChange={(e) => setNewLeague((n) => ({ ...n, teams: e.target.value }))}
                rows={3}
                className="w-full rounded-lg px-3 py-2.5 resize-none"
                style={inputStyle}
              />
            </div>

            <button
              className="w-full py-3 md:py-4 rounded-xl font-bold tracking-wider call-btn"
              style={{ background: 'rgba(0,212,255,0.2)', border: '1px solid rgba(0,212,255,0.4)', color: '#00d4ff', fontSize: 'clamp(12px, 1.6vw, 16px)' }}
              onClick={handleAddLeague}
            >
              {t.createLeagueBtn}
            </button>
          </div>
        </div>
      )}

      {/* ── SINGLE MATCH tab ───────────────────────────────────────── */}
      {view === 'match' && (
        <div className="flex-1 scrollable px-3 py-4 md:py-6">
          <div className="space-y-4 max-w-md mx-auto">
            <div className="text-center mb-2">
              <div style={{ fontSize: 'clamp(28px, 5vw, 44px)' }}>⚽</div>
              <div className="font-black mt-1" style={{ color: '#00d4ff', fontSize: 'clamp(14px, 2.2vw, 20px)' }}>
                {t.singleMatchTitle}
              </div>
              <div className="text-white/40 mt-1" style={{ fontSize: 'clamp(10px, 1.3vw, 13px)' }}>
                {t.singleMatchDesc}
              </div>
            </div>

            {/* Home vs Away */}
            <div
              className="rounded-2xl p-4 md:p-5 space-y-4"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,212,255,0.15)' }}
            >
              <div className="flex items-center gap-3">
                {/* Home */}
                <div className="flex-1">
                  <label className="text-white/50 font-bold uppercase tracking-wider mb-1 block" style={labelStyle}>
                    🏠 {t.homeTeam}
                  </label>
                  <input
                    type="text"
                    placeholder={t.homeTeamPlaceholder}
                    value={customHome}
                    onChange={(e) => setCustomHome(e.target.value)}
                    className="w-full rounded-xl px-3 py-2.5"
                    style={inputStyle}
                    maxLength={50}
                  />
                </div>

                <div
                  className="flex-shrink-0 font-black"
                  style={{ color: 'rgba(255,255,255,0.25)', fontSize: 'clamp(16px, 2.5vw, 22px)', paddingTop: 20 }}
                >
                  vs
                </div>

                {/* Away */}
                <div className="flex-1">
                  <label className="text-white/50 font-bold uppercase tracking-wider mb-1 block" style={labelStyle}>
                    ✈️ {t.awayTeam}
                  </label>
                  <input
                    type="text"
                    placeholder={t.awayTeamPlaceholder}
                    value={customAway}
                    onChange={(e) => setCustomAway(e.target.value)}
                    className="w-full rounded-xl px-3 py-2.5"
                    style={inputStyle}
                    maxLength={50}
                  />
                </div>
              </div>

              {/* Optional league name */}
              <div>
                <label className="text-white/50 font-bold uppercase tracking-wider mb-1 block" style={labelStyle}>
                  🏆 {t.leagueName} <span className="normal-case font-normal text-white/30">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder={t.leagueNamePlaceholder}
                  value={customLeague}
                  onChange={(e) => setCustomLeague(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5"
                  style={inputStyle}
                  maxLength={60}
                />
              </div>
            </div>

            <button
              className="w-full py-4 rounded-2xl font-black tracking-widest call-btn"
              disabled={!customHome.trim() || !customAway.trim()}
              style={{
                background: customHome && customAway
                  ? 'linear-gradient(135deg, rgba(0,212,255,0.25), rgba(0,136,255,0.2))'
                  : 'rgba(255,255,255,0.05)',
                border: `1.5px solid ${customHome && customAway ? 'rgba(0,212,255,0.5)' : 'rgba(255,255,255,0.1)'}`,
                color: customHome && customAway ? '#00d4ff' : 'rgba(255,255,255,0.25)',
                fontSize: 'clamp(13px, 1.8vw, 17px)',
                letterSpacing: '0.08em',
                boxShadow: customHome && customAway ? '0 0 30px rgba(0,212,255,0.2)' : 'none',
              }}
              onClick={handleCreateMatch}
            >
              {t.createMatchBtn}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
