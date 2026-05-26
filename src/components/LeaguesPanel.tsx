import { useState } from 'react';
import { WORLD_LEAGUES } from '../data/leagues';
import { useGameStore } from '../store/gameStore';

const AGE_GROUPS = ['Open / Senior', 'U21', 'U18', 'U16', 'U14', 'U12', 'U10', 'U8', 'Veterans 35+', 'Veterans 45+'];
const CONTINENTS = ['All', 'Europe', 'Americas', 'Asia', 'Africa', 'Oceania', 'International'];

export default function LeaguesPanel() {
  const localLeagues = useGameStore((s) => s.localLeagues);
  const addLocalLeague = useGameStore((s) => s.addLocalLeague);
  const [view, setView] = useState<'world' | 'local' | 'add'>('world');
  const [continent, setContinent] = useState('All');
  const [search, setSearch] = useState('');
  const [newLeague, setNewLeague] = useState({ name: '', country: '', ageGroup: AGE_GROUPS[0], teams: '' });

  const continentMap: Record<string, string[]> = {
    Europe: ['England','Spain','Germany','Italy','France','Netherlands','Portugal','Sweden','Denmark','Norway','Switzerland','Belgium','Poland','Russia','Turkey','Greece','Czech Republic','Hungary'],
    Americas: ['USA','Mexico','Brazil','Argentina','Colombia','Chile','Uruguay'],
    Asia: ['Japan','South Korea','China','India','Saudi Arabia','UAE'],
    Africa: ['Nigeria','South Africa','Egypt'],
    Oceania: ['Australia'],
    International: ['Europe','World','South America'],
  };

  const filtered = WORLD_LEAGUES.filter((l) => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.country.toLowerCase().includes(search.toLowerCase());
    const matchContinent = continent === 'All' || (continentMap[continent]?.includes(l.country) ?? false);
    return matchSearch && matchContinent;
  });

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

  return (
    <div className="flex flex-col h-full">
      {/* Tab switcher */}
      <div className="flex gap-2 px-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        {(['world', 'local', 'add'] as const).map((v) => (
          <button
            key={v}
            className={`nav-tab ${view === v ? 'active' : ''}`}
            onClick={() => setView(v)}
          >
            {v === 'world' ? '🌍 WORLD' : v === 'local' ? `📍 LOCAL (${localLeagues.length})` : '➕ ADD LEAGUE'}
          </button>
        ))}
      </div>

      {view === 'world' && (
        <>
          {/* Search + filter */}
          <div className="px-3 py-2 space-y-2" style={{ flexShrink: 0 }}>
            <input
              type="text"
              placeholder="Search leagues & countries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
            />
            <div className="flex gap-1 overflow-x-auto pb-1">
              {CONTINENTS.map((c) => (
                <button
                  key={c}
                  className={`nav-tab flex-shrink-0 ${continent === c ? 'active' : ''}`}
                  onClick={() => setContinent(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 scrollable px-3 space-y-1.5 pb-4">
            {filtered.map((league) => (
              <div
                key={league.id}
                className="flex items-center gap-3 p-3 rounded-xl call-btn"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <span className="text-2xl flex-shrink-0">{league.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{league.name}</div>
                  <div className="text-xs text-white/40">{league.country}{league.founded ? ` • Est. ${league.founded}` : ''}</div>
                </div>
                <div
                  className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{
                    background: league.tier === 0 ? 'rgba(255,215,0,0.15)' : 'rgba(0,212,255,0.1)',
                    color: league.tier === 0 ? '#FFD700' : '#00d4ff',
                    border: `1px solid ${league.tier === 0 ? 'rgba(255,215,0,0.2)' : 'rgba(0,212,255,0.15)'}`,
                  }}
                >
                  {league.tier === 0 ? '★ INTL' : `DIV ${league.tier}`}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {view === 'local' && (
        <div className="flex-1 scrollable px-3 py-3 space-y-2">
          {localLeagues.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-white/30 text-center gap-3">
              <div className="text-5xl">📍</div>
              <div className="text-sm">No local leagues yet.</div>
              <button
                className="call-btn px-4 py-2 rounded-lg text-sm font-bold"
                style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff' }}
                onClick={() => setView('add')}
              >
                + Add Your League
              </button>
            </div>
          ) : localLeagues.map((l) => (
            <div
              key={l.id}
              className="p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="font-bold text-sm">{l.name}</div>
              <div className="text-xs text-white/40 mt-0.5">{l.country} • {l.ageGroup}</div>
              {l.teams.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {l.teams.map((t, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff' }}>{t}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {view === 'add' && (
        <div className="flex-1 scrollable px-3 py-3">
          <div className="space-y-3 max-w-sm mx-auto">
            <div className="text-center mb-4">
              <div className="text-2xl mb-1">📍</div>
              <div className="font-bold text-sm text-white/80">Add Your Local League</div>
              <div className="text-xs text-white/40 mt-1">For any age group, anywhere in the world</div>
            </div>

            {[
              { label: 'League / Tournament Name', key: 'name', placeholder: 'e.g. Sunday 5-a-side League' },
              { label: 'City / Country', key: 'country', placeholder: 'e.g. Stockholm, Sweden' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-1 block">{label}</label>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={(newLeague as any)[key]}
                  onChange={(e) => setNewLeague((n) => ({ ...n, [key]: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2.5 text-sm"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
                />
              </div>
            ))}

            <div>
              <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-1 block">Age Group</label>
              <select
                value={newLeague.ageGroup}
                onChange={(e) => setNewLeague((n) => ({ ...n, ageGroup: e.target.value }))}
                className="w-full rounded-lg px-3 py-2.5 text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
              >
                {AGE_GROUPS.map((ag) => <option key={ag} value={ag} style={{ background: '#0d1117' }}>{ag}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-1 block">Teams (comma-separated)</label>
              <textarea
                placeholder="e.g. Team Alpha, Team Beta, Red Lions..."
                value={newLeague.teams}
                onChange={(e) => setNewLeague((n) => ({ ...n, teams: e.target.value }))}
                rows={3}
                className="w-full rounded-lg px-3 py-2.5 text-sm resize-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
              />
            </div>

            <button
              className="w-full py-3 rounded-xl font-bold text-sm tracking-wider call-btn"
              style={{ background: 'rgba(0,212,255,0.2)', border: '1px solid rgba(0,212,255,0.4)', color: '#00d4ff' }}
              onClick={handleAddLeague}
            >
              ➕ CREATE LEAGUE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
