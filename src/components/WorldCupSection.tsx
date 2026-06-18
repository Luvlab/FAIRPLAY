import { useState, useEffect, useRef } from 'react';
import {
  fetchLeagueMatches,
  fetchWorldCupGroups,
  type LiveMatch,
  type WCGroup,
} from '../lib/footballApi';

// ── Country → flag emoji map ───────────────────────────────────────────────
const FLAG: Record<string, string> = {
  'Argentina': '🇦🇷', 'Australia': '🇦🇺', 'Austria': '🇦🇹',
  'Belgium': '🇧🇪', 'Bolivia': '🇧🇴', 'Bosnia-Herzegovina': '🇧🇦',
  'Brazil': '🇧🇷', 'Cameroon': '🇨🇲', 'Canada': '🇨🇦',
  'Chile': '🇨🇱', 'Colombia': '🇨🇴', 'Costa Rica': '🇨🇷',
  'Croatia': '🇭🇷', 'Czechia': '🇨🇿', 'Denmark': '🇩🇰',
  'Ecuador': '🇪🇨', 'Egypt': '🇪🇬', 'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'France': '🇫🇷', 'Germany': '🇩🇪', 'Ghana': '🇬🇭',
  'Haiti': '🇭🇹', 'Honduras': '🇭🇳', 'Hungary': '🇭🇺',
  'Iran': '🇮🇷', 'Israel': '🇮🇱', 'Italy': '🇮🇹',
  'Ivory Coast': '🇨🇮', 'Jamaica': '🇯🇲', 'Japan': '🇯🇵',
  'Jordan': '🇯🇴', 'Mexico': '🇲🇽', 'Morocco': '🇲🇦',
  'Netherlands': '🇳🇱', 'New Zealand': '🇳🇿', 'Nigeria': '🇳🇬',
  'Panama': '🇵🇦', 'Paraguay': '🇵🇾', 'Peru': '🇵🇪',
  'Poland': '🇵🇱', 'Portugal': '🇵🇹', 'Qatar': '🇶🇦',
  'Saudi Arabia': '🇸🇦', 'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'Senegal': '🇸🇳',
  'Serbia': '🇷🇸', 'Slovenia': '🇸🇮', 'South Africa': '🇿🇦',
  'South Korea': '🇰🇷', 'Spain': '🇪🇸', 'Switzerland': '🇨🇭',
  'Tunisia': '🇹🇳', 'Türkiye': '🇹🇷', 'Ukraine': '🇺🇦',
  'United States': '🇺🇸', 'Uruguay': '🇺🇾', 'Uzbekistan': '🇺🇿',
  'Venezuela': '🇻🇪', 'Congo DR': '🇨🇩',
  // common abbreviation variants from ESPN
  'USA': '🇺🇸', 'South Korea (Republic of Korea)': '🇰🇷',
  'Cote d\'Ivoire': '🇨🇮', 'Bosnia and Herzegovina': '🇧🇦',
  'Korea Republic': '🇰🇷', 'DR Congo': '🇨🇩',
  'Iran (Islamic Republic of)': '🇮🇷',
};

function teamFlag(name: string): string {
  if (FLAG[name]) return FLAG[name];
  // partial match fallback
  const key = Object.keys(FLAG).find(
    (k) => name.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(name.toLowerCase())
  );
  return key ? FLAG[key] : '🏳️';
}

// ── Props ───────────────────────────────────────────────────────────────────
export interface WorldCupSectionProps {
  onSelectMatch: (match: LiveMatch) => void;
  onImpact: (match: LiveMatch) => void;
}

// ── Match pill (horizontal scrollable row) ──────────────────────────────────
function MatchPill({
  match,
  onSelectMatch,
  onImpact,
}: {
  match: LiveMatch;
  onSelectMatch: (m: LiveMatch) => void;
  onImpact: (m: LiveMatch) => void;
}) {
  const isLive = match.status === 'live';
  const isHT   = match.status === 'ht';
  const isActive = isLive || isHT;

  const timeLabel =
    match.status === 'pre'
      ? new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : match.status === 'live'
      ? `${match.minute}'`
      : match.status === 'ht'
      ? 'HT'
      : 'FT';

  const hFlag = teamFlag(match.homeTeam);
  const aFlag = teamFlag(match.awayTeam);

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        padding: '8px 10px',
        borderRadius: 12,
        background: isActive
          ? 'linear-gradient(135deg, rgba(255,68,68,0.12), rgba(255,68,68,0.06))'
          : 'rgba(255,255,255,0.05)',
        border: isActive
          ? '1px solid rgba(255,68,68,0.25)'
          : '1px solid rgba(255,255,255,0.09)',
        minWidth: 110,
        maxWidth: 130,
        cursor: 'pointer',
        flexShrink: 0,
        position: 'relative',
      }}
      onClick={() => onSelectMatch(match)}
    >
      {/* Live pulse dot */}
      {isLive && (
        <span
          style={{
            position: 'absolute',
            top: 5,
            right: 5,
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#ff4444',
            boxShadow: '0 0 6px #ff4444',
            animation: 'wcPulse 1.4s ease-in-out infinite',
          }}
        />
      )}

      {/* Teams row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, width: '100%', justifyContent: 'center' }}>
        <span style={{ fontSize: 'clamp(14px, 2.2vw, 18px)' }}>{hFlag}</span>
        <span
          style={{
            fontSize: 'clamp(10px, 1.4vw, 13px)',
            fontWeight: 900,
            color: isActive ? '#ff5050' : '#00d4ff',
            minWidth: 28,
            textAlign: 'center',
          }}
        >
          {match.status === 'pre' ? 'vs' : `${match.homeScore}–${match.awayScore}`}
        </span>
        <span style={{ fontSize: 'clamp(14px, 2.2vw, 18px)' }}>{aFlag}</span>
      </div>

      {/* Team names abbreviated */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, width: '100%', justifyContent: 'center' }}>
        <span
          style={{
            fontSize: 'clamp(8px, 1.1vw, 10px)',
            color: 'rgba(255,255,255,0.5)',
            maxWidth: 38,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {match.homeTeamAbbr || match.homeTeam.slice(0, 3).toUpperCase()}
        </span>
        <span style={{ fontSize: 'clamp(8px, 1vw, 10px)', color: 'rgba(255,255,255,0.25)' }}>·</span>
        <span
          style={{
            fontSize: 'clamp(8px, 1.1vw, 10px)',
            color: 'rgba(255,255,255,0.5)',
            maxWidth: 38,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {match.awayTeamAbbr || match.awayTeam.slice(0, 3).toUpperCase()}
        </span>
      </div>

      {/* Time / status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span
          style={{
            fontSize: 'clamp(8px, 1.1vw, 10px)',
            fontWeight: 700,
            color: isActive ? '#ff5050' : 'rgba(255,255,255,0.35)',
          }}
        >
          {timeLabel}
        </span>
      </div>

      {/* Impact button */}
      <button
        style={{
          background: 'rgba(255,100,0,0.1)',
          border: '1px solid rgba(255,100,0,0.2)',
          color: 'rgba(255,100,0,0.7)',
          borderRadius: 4,
          padding: '1px 5px',
          fontSize: 'clamp(8px, 1vw, 10px)',
          cursor: 'pointer',
        }}
        onClick={(e) => { e.stopPropagation(); onImpact(match); }}
        title="View match impact"
      >
        🌡️
      </button>
    </div>
  );
}

// ── Group card ──────────────────────────────────────────────────────────────
function GroupCard({ group }: { group: WCGroup }) {
  // Sort: points desc, GD desc, GF desc
  const sorted = [...group.entries].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    return b.goalsFor - a.goalsFor;
  });

  const abbrev = (name: string) =>
    name.length > 12 ? name.slice(0, 12) + '…' : name;

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,215,0,0.12)',
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      {/* Group header */}
      <div
        style={{
          padding: '5px 10px',
          background: 'rgba(255,215,0,0.07)',
          borderBottom: '1px solid rgba(255,215,0,0.12)',
          fontWeight: 900,
          fontSize: 'clamp(9px, 1.2vw, 11px)',
          color: 'rgba(255,215,0,0.9)',
          letterSpacing: '0.06em',
        }}
      >
        {group.name.toUpperCase()}
      </div>

      {/* Column headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '16px 1fr 22px 18px 18px 18px 24px 24px',
          gap: 2,
          padding: '3px 8px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {['#', 'Team', 'P', 'W', 'D', 'L', 'GD', 'Pts'].map((h) => (
          <span
            key={h}
            style={{
              fontSize: 'clamp(7px, 0.9vw, 9px)',
              color: 'rgba(255,255,255,0.25)',
              fontWeight: 700,
              textAlign: h === 'Team' ? 'left' : 'center',
              letterSpacing: '0.04em',
            }}
          >
            {h}
          </span>
        ))}
      </div>

      {/* Team rows */}
      {sorted.map((team, i) => {
        const gd = team.goalsFor - team.goalsAgainst;
        const qualified = i < 2;
        const flag = teamFlag(team.teamName);

        return (
          <div
            key={team.teamName}
            style={{
              display: 'grid',
              gridTemplateColumns: '16px 1fr 22px 18px 18px 18px 24px 24px',
              gap: 2,
              padding: '4px 8px',
              borderLeft: qualified ? '2.5px solid rgba(0,200,100,0.5)' : '2.5px solid transparent',
              background: i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 'clamp(7px, 0.95vw, 10px)', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
              {i + 1}
            </span>
            <span
              style={{
                fontSize: 'clamp(8px, 1.05vw, 10px)',
                color: qualified ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.55)',
                fontWeight: qualified ? 700 : 400,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'flex',
                alignItems: 'center',
                gap: 3,
              }}
            >
              <span style={{ fontSize: 'clamp(10px, 1.4vw, 13px)', flexShrink: 0 }}>{flag}</span>
              {abbrev(team.teamName)}
            </span>
            {[team.played, team.won, team.drawn, team.lost].map((v, ci) => (
              <span
                key={ci}
                style={{
                  fontSize: 'clamp(8px, 1vw, 10px)',
                  color: 'rgba(255,255,255,0.45)',
                  textAlign: 'center',
                }}
              >
                {v}
              </span>
            ))}
            <span
              style={{
                fontSize: 'clamp(8px, 1vw, 10px)',
                color: gd > 0 ? 'rgba(0,200,100,0.8)' : gd < 0 ? 'rgba(255,80,80,0.7)' : 'rgba(255,255,255,0.4)',
                textAlign: 'center',
                fontWeight: 600,
              }}
            >
              {gd > 0 ? `+${gd}` : gd}
            </span>
            <span
              style={{
                fontSize: 'clamp(9px, 1.1vw, 11px)',
                color: qualified ? '#ffd700' : 'rgba(255,255,255,0.6)',
                textAlign: 'center',
                fontWeight: qualified ? 900 : 600,
              }}
            >
              {team.points}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── WorldCupSection (main export) ───────────────────────────────────────────
export default function WorldCupSection({ onSelectMatch, onImpact }: WorldCupSectionProps) {
  const [expanded, setExpanded]   = useState(true);
  const [matches, setMatches]     = useState<LiveMatch[]>([]);
  const [groups, setGroups]       = useState<WCGroup[]>([]);
  const [loading, setLoading]     = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = async () => {
    const [ms, gs] = await Promise.all([
      fetchLeagueMatches('fifa.world'),
      fetchWorldCupGroups(),
    ]);
    setMatches(ms);
    setGroups(gs);
    setLoading(false);
  };

  useEffect(() => {
    load();
    intervalRef.current = setInterval(load, 90_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div
      style={{
        marginBottom: 10,
        borderRadius: 14,
        overflow: 'hidden',
        border: '1px solid rgba(255,215,0,0.22)',
        background: 'linear-gradient(135deg, rgba(255,215,0,0.04), rgba(255,140,0,0.02))',
      }}
    >
      {/* ── Hero banner ─────────────────────────────────────────────────── */}
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          background: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,140,0,0.08))',
          border: 'none',
          borderBottom: expanded ? '1px solid rgba(255,215,0,0.15)' : 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 'clamp(18px, 2.8vw, 24px)', flexShrink: 0 }}>🏆</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 900,
              color: '#ffd700',
              fontSize: 'clamp(11px, 1.6vw, 14px)',
              letterSpacing: '0.06em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            FIFA WORLD CUP 2026
          </div>
          <div
            style={{
              color: 'rgba(255,200,0,0.55)',
              fontSize: 'clamp(8px, 1.1vw, 10px)',
              letterSpacing: '0.08em',
              fontWeight: 700,
              marginTop: 1,
            }}
          >
            GROUP STAGE · USA / CAN / MEX
          </div>
        </div>
        <span
          style={{
            color: 'rgba(255,215,0,0.6)',
            fontSize: 'clamp(12px, 1.8vw, 16px)',
            flexShrink: 0,
            display: 'inline-block',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        >
          ▼
        </span>
      </button>

      {/* ── Match pills row (always visible when at least partially open) ── */}
      <div style={{ padding: '8px 10px', borderBottom: expanded ? '1px solid rgba(255,215,0,0.1)' : 'none' }}>
        {loading ? (
          <div
            style={{
              color: 'rgba(255,215,0,0.45)',
              fontSize: 'clamp(10px, 1.3vw, 12px)',
              padding: '4px 0',
            }}
          >
            ⏳ Loading World Cup data...
          </div>
        ) : matches.length === 0 ? (
          <div
            style={{
              color: 'rgba(255,255,255,0.25)',
              fontSize: 'clamp(9px, 1.2vw, 11px)',
              padding: '4px 0',
            }}
          >
            No matches scheduled today
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              paddingBottom: 4,
              // hide scrollbar but keep scroll
              scrollbarWidth: 'none',
            }}
          >
            {matches.map((m) => (
              <MatchPill
                key={m.id}
                match={m}
                onSelectMatch={onSelectMatch}
                onImpact={onImpact}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Group tables (collapsed when !expanded) ──────────────────────── */}
      {expanded && !loading && groups.length > 0 && (
        <div
          style={{
            padding: '10px 10px 12px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 8,
          }}
        >
          {groups.map((g) => (
            <GroupCard key={g.name} group={g} />
          ))}
        </div>
      )}

      {/* Qualification legend */}
      {expanded && !loading && groups.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '0 12px 10px',
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderLeft: '3px solid rgba(0,200,100,0.5)',
              borderRadius: 1,
            }}
          />
          <span
            style={{
              fontSize: 'clamp(8px, 1vw, 10px)',
              color: 'rgba(255,255,255,0.25)',
            }}
          >
            Qualification zone (top 2 per group)
          </span>
        </div>
      )}

      {/* Pulse animation keyframes */}
      <style>{`
        @keyframes wcPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.75); }
        }
      `}</style>
    </div>
  );
}
