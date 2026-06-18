import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useT } from '../context/I18nContext';
import { LEAGUES, fetchLeagueMatches, type LiveMatch } from '../lib/footballApi';
import WorldCupSection from './WorldCupSection';

// ── Types ──────────────────────────────────────────────────────────────────
type MainView = 'world' | 'local' | 'add' | 'match' | 'club';

interface ClubMatch {
  id: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  notes: string;
  callCount: number;
}

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
  onImpact,
  refereeLabel,
}: {
  match: LiveMatch;
  onReferee: (m: LiveMatch) => void;
  onImpact: (m: LiveMatch) => void;
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

      {/* Impact thermometer button */}
      <button
        className="call-btn flex-shrink-0"
        style={{
          background: 'rgba(255,100,0,0.1)',
          border: '1px solid rgba(255,100,0,0.2)',
          color: 'rgba(255,100,0,0.8)',
          borderRadius: 6,
          padding: '2px 6px',
          fontSize: 'clamp(10px,1.2vw,12px)',
        }}
        title="View match impact"
        onClick={(e) => { e.stopPropagation(); onImpact(match); }}
      >
        🌡️
      </button>
    </div>
  );
}

// ── League detail view ─────────────────────────────────────────────────────
function LeagueDetail({
  league,
  onBack,
  onReferee,
  onImpact,
  t,
}: {
  league: LeagueInfo;
  onBack: () => void;
  onReferee: (m: LiveMatch) => void;
  onImpact: (m: LiveMatch) => void;
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
            onImpact={onImpact}
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
  const setImpactGame  = useGameStore((s) => s.setImpactGame);

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

  // Club Manager state
  const [clubLeague, setClubLeague] = useState<typeof localLeagues[0] | null>(null);
  const [clubMatches, setClubMatches] = useState<ClubMatch[]>([]);
  const [showAddMatch, setShowAddMatch] = useState(false);
  const [newMatch, setNewMatch] = useState({
    date: new Date().toISOString().slice(0, 10),
    homeTeam: '',
    awayTeam: '',
    homeScore: '0',
    awayScore: '0',
    notes: '',
  });
  const [copiedInvite, setCopiedInvite] = useState(false);

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

  const handleImpact = (match: LiveMatch) => {
    setImpactGame({
      id: match.id,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      league: match.leagueName ?? '',
      leagueId: match.leagueId ?? '',
      status: match.status,
      minute: match.minute,
    });
    setActiveTab('impact');
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

  const openClubManager = (league: typeof localLeagues[0]) => {
    setClubLeague(league);
    const stored = localStorage.getItem(`fp_club_matches_${league.id}`);
    setClubMatches(stored ? (JSON.parse(stored) as ClubMatch[]) : []);
    setShowAddMatch(false);
    setNewMatch({
      date: new Date().toISOString().slice(0, 10),
      homeTeam: league.teams[0] ?? '',
      awayTeam: '',
      homeScore: '0',
      awayScore: '0',
      notes: '',
    });
    setView('club');
  };

  const handleAddClubMatch = () => {
    if (!clubLeague || !newMatch.homeTeam.trim() || !newMatch.awayTeam.trim()) return;
    const match: ClubMatch = {
      id: `cm-${Date.now()}`,
      date: newMatch.date,
      homeTeam: newMatch.homeTeam.trim(),
      awayTeam: newMatch.awayTeam.trim(),
      homeScore: parseInt(newMatch.homeScore) || 0,
      awayScore: parseInt(newMatch.awayScore) || 0,
      notes: newMatch.notes.trim(),
      callCount: 0,
    };
    const updated = [match, ...clubMatches];
    setClubMatches(updated);
    localStorage.setItem(`fp_club_matches_${clubLeague.id}`, JSON.stringify(updated));
    setShowAddMatch(false);
    setNewMatch({
      date: new Date().toISOString().slice(0, 10),
      homeTeam: clubLeague.teams[0] ?? '',
      awayTeam: '',
      homeScore: '0',
      awayScore: '0',
      notes: '',
    });
  };

  const handleClubReferee = () => {
    if (!clubLeague) return;
    const home = clubLeague.teams[0] ?? clubLeague.name;
    setCustomMatch(home, 'Opponent', clubLeague.name);
    setActiveTab('referee');
  };

  const handleCopyInvite = (leagueId: string) => {
    const link = `https://fairplay.app/join/${leagueId}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedInvite(true);
      setTimeout(() => setCopiedInvite(false), 2000);
    }).catch(() => {});
  };

  // ── League detail overlay ─────────────────────────────────────────────
  if (selectedLeague) {
    return (
      <LeagueDetail
        league={selectedLeague}
        onBack={() => setSelected(null)}
        onReferee={handleReferee}
        onImpact={handleImpact}
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
            onClick={() => setView(v as MainView)}
          >
            {label}
          </button>
        ))}
        {view === 'club' && clubLeague && (
          <button
            className="nav-tab flex-shrink-0 active"
            style={{ background: 'rgba(255,200,0,0.15)', border: '1px solid rgba(255,200,0,0.35)', color: '#ffc800' }}
          >
            ⚽ {clubLeague.name}
          </button>
        )}
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
            {/* World Cup 2026 — pinned above the regular league list */}
            <WorldCupSection
              onSelectMatch={(match) => { selectMatch(match); }}
              onImpact={handleImpact}
            />

            {filteredLeagues.filter((l) => l.id !== 'fifa.world').map((league) => (
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

              {/* Actions row */}
              <div className="flex gap-2 mt-3">
                <button
                  className="call-btn flex-1 py-2 rounded-lg font-bold"
                  style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', fontSize: 'clamp(10px, 1.3vw, 13px)' }}
                  onClick={() => {
                    setCustomLeague(l.name);
                    setView('match');
                  }}
                >
                  ⚽ {t.tabSingleMatch}
                </button>
                <button
                  className="call-btn flex-1 py-2 rounded-lg font-bold"
                  style={{ background: 'rgba(255,200,0,0.1)', border: '1px solid rgba(255,200,0,0.25)', color: '#ffc800', fontSize: 'clamp(10px, 1.3vw, 13px)' }}
                  onClick={() => openClubManager(l)}
                >
                  ⚽ Manage Club
                </button>
              </div>
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

      {/* ── CLUB MANAGER tab ──────────────────────────────────────── */}
      {view === 'club' && clubLeague && (
        <div className="flex-1 scrollable px-3 py-3 md:py-4 space-y-3">
          {/* Club header */}
          <div
            className="rounded-xl p-3 md:p-4 flex items-center gap-3"
            style={{ background: 'rgba(255,200,0,0.07)', border: '1px solid rgba(255,200,0,0.2)' }}
          >
            <div style={{ fontSize: 'clamp(28px, 4.5vw, 40px)' }}>⚽</div>
            <div className="flex-1 min-w-0">
              <div className="font-black truncate" style={{ color: '#ffc800', fontSize: 'clamp(13px, 2vw, 18px)' }}>
                {clubLeague.name}
              </div>
              <div className="text-white/40" style={{ fontSize: 'clamp(10px, 1.3vw, 12px)' }}>
                {clubLeague.country} · {clubLeague.ageGroup}
              </div>
            </div>
            <button
              className="call-btn px-3 py-1.5 rounded-lg font-bold"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(10px, 1.3vw, 13px)' }}
              onClick={() => setView('local')}
            >
              ← Back
            </button>
          </div>

          {/* Invite panel */}
          <div
            className="rounded-xl p-3 md:p-4"
            style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)' }}
          >
            <div className="font-bold mb-2" style={{ color: '#00d4ff', fontSize: 'clamp(10px, 1.3vw, 13px)', letterSpacing: '0.5px' }}>
              👥 INVITE SUPPORTERS AS RECORDERS
            </div>
            <div className="flex items-center gap-2">
              <div
                className="flex-1 rounded-lg px-3 py-2 truncate font-mono"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 'clamp(9px, 1.2vw, 12px)', color: 'rgba(255,255,255,0.6)' }}
              >
                https://fairplay.app/join/{clubLeague.id}
              </div>
              <button
                className="call-btn px-3 py-2 rounded-lg font-bold flex-shrink-0"
                style={{
                  background: copiedInvite ? 'rgba(0,255,136,0.15)' : 'rgba(0,212,255,0.15)',
                  border: `1px solid ${copiedInvite ? 'rgba(0,255,136,0.35)' : 'rgba(0,212,255,0.35)'}`,
                  color: copiedInvite ? '#00ff88' : '#00d4ff',
                  fontSize: 'clamp(10px, 1.3vw, 13px)',
                }}
                onClick={() => handleCopyInvite(clubLeague.id)}
              >
                {copiedInvite ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
          </div>

          {/* Quick REFEREE button */}
          <button
            className="call-btn w-full py-3 rounded-xl font-black"
            style={{
              background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,136,255,0.15))',
              border: '1.5px solid rgba(0,212,255,0.4)',
              color: '#00d4ff',
              fontSize: 'clamp(12px, 1.7vw, 16px)',
              letterSpacing: '0.5px',
            }}
            onClick={handleClubReferee}
          >
            🏅 QUICK REFEREE — {clubLeague.teams[0] ?? clubLeague.name} vs ...
          </button>

          {/* Match Log header */}
          <div className="flex items-center justify-between">
            <div className="font-bold text-white/60" style={{ fontSize: 'clamp(10px, 1.3vw, 13px)', letterSpacing: '0.8px' }}>
              📋 MATCH LOG ({clubMatches.length})
            </div>
            <button
              className="call-btn px-3 py-1.5 rounded-lg font-bold"
              style={{ background: 'rgba(255,200,0,0.12)', border: '1px solid rgba(255,200,0,0.3)', color: '#ffc800', fontSize: 'clamp(10px, 1.3vw, 12px)' }}
              onClick={() => setShowAddMatch((v) => !v)}
            >
              {showAddMatch ? '✕ Cancel' : '+ Add Result'}
            </button>
          </div>

          {/* Add match form */}
          {showAddMatch && (
            <div
              className="rounded-xl p-3 space-y-2"
              style={{ background: 'rgba(255,200,0,0.05)', border: '1px solid rgba(255,200,0,0.18)' }}
            >
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-white/40 block font-bold mb-1" style={{ fontSize: 'clamp(9px, 1.1vw, 11px)' }}>DATE</label>
                  <input
                    type="date"
                    value={newMatch.date}
                    onChange={(e) => setNewMatch((m) => ({ ...m, date: e.target.value }))}
                    className="w-full rounded-lg px-2 py-2"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="text-white/40 block font-bold mb-1" style={{ fontSize: 'clamp(9px, 1.1vw, 11px)' }}>HOME TEAM</label>
                  <input
                    type="text"
                    placeholder={clubLeague.teams[0] ?? 'Home'}
                    value={newMatch.homeTeam}
                    onChange={(e) => setNewMatch((m) => ({ ...m, homeTeam: e.target.value }))}
                    className="w-full rounded-lg px-2 py-2"
                    style={inputStyle}
                    maxLength={40}
                  />
                </div>
                <div>
                  <label className="text-white/40 block font-bold mb-1" style={{ fontSize: 'clamp(9px, 1.1vw, 11px)' }}>AWAY TEAM</label>
                  <input
                    type="text"
                    placeholder="Away"
                    value={newMatch.awayTeam}
                    onChange={(e) => setNewMatch((m) => ({ ...m, awayTeam: e.target.value }))}
                    className="w-full rounded-lg px-2 py-2"
                    style={inputStyle}
                    maxLength={40}
                  />
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="text-white/40 block font-bold mb-1" style={{ fontSize: 'clamp(9px, 1.1vw, 11px)' }}>SCORE</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="99"
                        value={newMatch.homeScore}
                        onChange={(e) => setNewMatch((m) => ({ ...m, homeScore: e.target.value }))}
                        className="w-full rounded-lg px-2 py-2 text-center"
                        style={inputStyle}
                      />
                      <span className="text-white/40 font-black">–</span>
                      <input
                        type="number"
                        min="0"
                        max="99"
                        value={newMatch.awayScore}
                        onChange={(e) => setNewMatch((m) => ({ ...m, awayScore: e.target.value }))}
                        className="w-full rounded-lg px-2 py-2 text-center"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-white/40 block font-bold mb-1" style={{ fontSize: 'clamp(9px, 1.1vw, 11px)' }}>NOTES (optional)</label>
                <input
                  type="text"
                  placeholder="Any notes..."
                  value={newMatch.notes}
                  onChange={(e) => setNewMatch((m) => ({ ...m, notes: e.target.value }))}
                  className="w-full rounded-lg px-2 py-2"
                  style={inputStyle}
                  maxLength={120}
                />
              </div>
              <button
                className="call-btn w-full py-2.5 rounded-lg font-bold"
                disabled={!newMatch.homeTeam.trim() || !newMatch.awayTeam.trim()}
                style={{
                  background: newMatch.homeTeam && newMatch.awayTeam ? 'rgba(255,200,0,0.18)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${newMatch.homeTeam && newMatch.awayTeam ? 'rgba(255,200,0,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  color: newMatch.homeTeam && newMatch.awayTeam ? '#ffc800' : 'rgba(255,255,255,0.25)',
                  fontSize: 'clamp(11px, 1.4vw, 14px)',
                }}
                onClick={handleAddClubMatch}
              >
                SAVE RESULT
              </button>
            </div>
          )}

          {/* Match list */}
          {clubMatches.length === 0 && !showAddMatch && (
            <div className="flex flex-col items-center justify-center py-10 text-white/30 gap-2">
              <span style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}>📋</span>
              <div style={{ fontSize: 'clamp(12px, 1.6vw, 15px)' }}>No match results yet</div>
            </div>
          )}
          {clubMatches.map((m) => (
            <div
              key={m.id}
              className="rounded-xl p-3"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center gap-3">
                <div className="text-white/40 flex-shrink-0" style={{ fontSize: 'clamp(9px, 1.1vw, 11px)', minWidth: 60 }}>
                  {new Date(m.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </div>
                <div className="flex-1 font-bold truncate" style={{ fontSize: 'clamp(11px, 1.5vw, 14px)' }}>
                  {m.homeTeam}
                  <span className="mx-2 font-black" style={{ color: '#00d4ff' }}>{m.homeScore}–{m.awayScore}</span>
                  {m.awayTeam}
                </div>
                {m.callCount > 0 && (
                  <div className="flex-shrink-0 text-white/40" style={{ fontSize: 'clamp(9px, 1.1vw, 11px)' }}>
                    {m.callCount} calls
                  </div>
                )}
              </div>
              {m.notes && (
                <div className="text-white/35 mt-1 truncate" style={{ fontSize: 'clamp(9px, 1.1vw, 11px)' }}>
                  {m.notes}
                </div>
              )}
            </div>
          ))}
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
