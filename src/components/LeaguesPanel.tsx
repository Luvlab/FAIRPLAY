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
      <div className="flex gap-2 px-3 py-2 md:px-4 md:py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
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
          <div className="px-3 py-2 md:px-4 md:py-3 space-y-2" style={{ flexShrink: 0 }}>
            <input
              type="text"
              placeholder="Search leagues & countries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg px-3 py-2 md:py-2.5"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                outline: 'none',
                fontSize: 'clamp(12px, 1.5vw, 15px)',
              }}
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
          <div className="flex-1 scrollable px-3 md:px-4 space-y-1.5 md:space-y-2 pb-4">
            {filtered.map((league) => (
              <div
                key={league.id}
                className="flex items-center gap-3 p-3 md:p-4 rounded-xl call-btn"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <span className="flex-shrink-0" style={{ fontSize: 'clamp(20px, 3vw, 30px)' }}>{league.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate" style={{ fontSize: 'clamp(12px, 1.6vw, 16px)' }}>{league.name}</div>
                  <div className="text-white/40" style={{ fontSize: 'clamp(10px, 1.3vw, 13px)' }}>
                    {league.country}{league.founded ? ` • Est. ${league.founded}` : ''}
                  </div>
                </div>
                <div
                  className="font-bold px-2 py-0.5 rounded flex-shrink-0"
                  style={{
                    background: league.tier === 0 ? 'rgba(255,215,0,0.15)' : 'rgba(0,212,255,0.1)',
                    color: league.tier === 0 ? '#FFD700' : '#00d4ff',
                    border: `1px solid ${league.tier === 0 ? 'rgba(255,215,0,0.2)' : 'rgba(0,212,255,0.15)'}`,
                    fontSize: 'clamp(9px, 1.2vw, 12px)',
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
        <div className="flex-1 scrollable px-3 md:px-5 py-3 space-y-2 md:space-y-3">
          {localLeagues.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-white/30 text-center gap-3">
              <div style={{ fontSize: 'clamp(36px, 6vw, 56px)' }}>📍</div>
              <div style={{ fontSize: 'clamp(12px, 1.6vw, 15px)' }}>No local leagues yet.</div>
              <button
                className="call-btn px-4 py-2 rounded-lg font-bold"
                style={{
                  background: 'rgba(0,212,255,0.15)',
                  border: '1px solid rgba(0,212,255,0.3)',
                  color: '#00d4ff',
                  fontSize: 'clamp(11px, 1.5vw, 14px)',
                }}
                onClick={() => setView('add')}
              >
                + Add Your League
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
                {l.country} • {l.ageGroup}
              </div>
              {l.teams.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {l.teams.map((t, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded"
                      style={{
                        background: 'rgba(0,212,255,0.1)',
                        color: '#00d4ff',
                        fontSize: 'clamp(10px, 1.3vw, 13px)',
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {view === 'add' && (
        <div className="flex-1 scrollable px-3 py-3 md:py-5">
          <div className="space-y-3 md:space-y-4 max-w-lg mx-auto">
            <div className="text-center mb-4">
              <div style={{ fontSize: 'clamp(24px, 4vw, 36px)' }}>📍</div>
              <div className="font-bold mt-1 text-white/80" style={{ fontSize: 'clamp(13px, 1.8vw, 17px)' }}>
                Add Your Local League
              </div>
              <div className="text-white/40 mt-1" style={{ fontSize: 'clamp(10px, 1.3vw, 13px)' }}>
                For any age group, anywhere in the world
              </div>
            </div>

            {[
              { label: 'League / Tournament Name', key: 'name', placeholder: 'e.g. Sunday 5-a-side League' },
              { label: 'City / Country', key: 'country', placeholder: 'e.g. Stockholm, Sweden' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label
                  className="text-white/50 font-bold uppercase tracking-wider mb-1 block"
                  style={{ fontSize: 'clamp(9px, 1.1vw, 12px)' }}
                >
                  {label}
                </label>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={(newLeague as any)[key]}
                  onChange={(e) => setNewLeague((n) => ({ ...n, [key]: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2.5"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    outline: 'none',
                    fontSize: 'clamp(12px, 1.5vw, 15px)',
                  }}
                />
              </div>
            ))}

            <div>
              <label
                className="text-white/50 font-bold uppercase tracking-wider mb-1 block"
                style={{ fontSize: 'clamp(9px, 1.1vw, 12px)' }}
              >
                Age Group
              </label>
              <select
                value={newLeague.ageGroup}
                onChange={(e) => setNewLeague((n) => ({ ...n, ageGroup: e.target.value }))}
                className="w-full rounded-lg px-3 py-2.5"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  outline: 'none',
                  fontSize: 'clamp(12px, 1.5vw, 15px)',
                }}
              >
                {AGE_GROUPS.map((ag) => (
                  <option key={ag} value={ag} style={{ background: '#0d1117' }}>{ag}</option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="text-white/50 font-bold uppercase tracking-wider mb-1 block"
                style={{ fontSize: 'clamp(9px, 1.1vw, 12px)' }}
              >
                Teams (comma-separated)
              </label>
              <textarea
                placeholder="e.g. Team Alpha, Team Beta, Red Lions..."
                value={newLeague.teams}
                onChange={(e) => setNewLeague((n) => ({ ...n, teams: e.target.value }))}
                rows={3}
                className="w-full rounded-lg px-3 py-2.5 resize-none"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  outline: 'none',
                  fontSize: 'clamp(12px, 1.5vw, 15px)',
                }}
              />
            </div>

            <button
              className="w-full py-3 md:py-4 rounded-xl font-bold tracking-wider call-btn"
              style={{
                background: 'rgba(0,212,255,0.2)',
                border: '1px solid rgba(0,212,255,0.4)',
                color: '#00d4ff',
                fontSize: 'clamp(12px, 1.6vw, 16px)',
              }}
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
