import { useState, useMemo, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { getPresetForLeague } from '../lib/impactPresets';

interface Preset {
  label: string;
  emoji: string;
  attendance: number;
  km: number;
  players: number;
  ads: number;
}

const OPEN_PRESETS: Preset[] = [
  { label: 'Sunday Youth',    emoji: '⚽', attendance: 80,    km: 4,    players: 0,  ads: 0   },
  { label: 'League Match',    emoji: '🏟️', attendance: 28000, km: 22,   players: 22, ads: 48  },
  { label: 'World Cup Match', emoji: '🌍', attendance: 67000, km: 2800, players: 22, ads: 180 },
];

interface Band {
  maxScore: number;
  dot: string;
  label: string;
  description: string;
  color: string;
}

const BANDS: Band[] = [
  { maxScore: 20,  dot: '🟢', label: 'GRASSROOTS SPIRIT',   description: 'Pure community football. This is the game.',       color: '#00ff88' },
  { maxScore: 40,  dot: '🟡', label: 'LOCAL LEAGUE',         description: 'Real football with a light footprint.',            color: '#ffdd00' },
  { maxScore: 65,  dot: '🟠', label: 'PROFESSIONAL CIRCUIT', description: 'The sport is a business here.',                    color: '#ffaa00' },
  { maxScore: 85,  dot: '🔴', label: 'COLOSSEUM MODE',       description: 'Entertainment product. The game is secondary.',    color: '#ff6633' },
  { maxScore: 100, dot: '⚫', label: 'EXTRACTION MACHINE',   description: 'Players, fans, and communities are the resource.', color: '#ff3333' },
];

const TIER_COLORS: Record<string, string> = {
  grassroots: '#00ff88',
  local:      '#88ff44',
  regional:   '#ffdd00',
  national:   '#ffaa00',
  elite:      '#ff6633',
  global:     '#ff3333',
};

function getBand(score: number): Band {
  return BANDS.find((b) => score <= b.maxScore) ?? BANDS[BANDS.length - 1];
}

interface DialCardProps {
  emoji: string;
  label: string;
  subLabel: string;
  color: string;
  min: number;
  max: number;
  step: number;
  value: number;
  displayValue: string;
  onChange: (v: number) => void;
}

function DialCard({ emoji, label, subLabel, color, min, max, step, value, displayValue, onChange }: DialCardProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div
      style={{
        borderRadius: 14,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Coloured header bar */}
      <div style={{ height: 4, background: color, width: '100%' }} />
      <div style={{ padding: 'clamp(12px,2vw,18px)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 'clamp(18px,2.5vw,24px)', lineHeight: 1 }}>{emoji}</span>
          <div>
            <div style={{ fontSize: 'clamp(10px,1.3vw,12px)', fontWeight: 700, letterSpacing: '0.12em', color: color, textTransform: 'uppercase' }}>
              {label}
            </div>
            <div style={{ fontSize: 'clamp(9px,1.2vw,11px)', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
              {subLabel}
            </div>
          </div>
        </div>

        {/* Value display */}
        <div style={{ fontSize: 'clamp(16px,2.5vw,22px)', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
          {displayValue}
        </div>

        {/* Slider */}
        <div style={{ position: 'relative' }}>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            style={{
              width: '100%',
              appearance: 'none',
              WebkitAppearance: 'none',
              height: 4,
              borderRadius: 2,
              outline: 'none',
              cursor: 'pointer',
              background: `linear-gradient(to right, ${color} ${pct}%, rgba(255,255,255,0.12) ${pct}%)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function ImpactPanel() {
  const impactGame    = useGameStore((s) => s.impactGame);
  const setImpactGame = useGameStore((s) => s.setImpactGame);

  const [attendance, setAttendance] = useState(5000);
  const [km,         setKm]         = useState(12);
  const [players,    setPlayers]    = useState(0);
  const [ads,        setAds]        = useState(0);

  // Auto-populate dials from preset whenever impactGame changes
  useEffect(() => {
    if (impactGame) {
      const preset = getPresetForLeague(impactGame.leagueId);
      setAttendance(preset.attendance);
      setKm(preset.km);
      setPlayers(preset.players);
      setAds(preset.ads);
    }
  }, [impactGame]);

  function applyPreset(p: Preset) {
    setAttendance(p.attendance);
    setKm(p.km);
    setPlayers(p.players);
    setAds(p.ads);
  }

  const { planetScore, transportScore, youthScore, societyScore, score } = useMemo(() => {
    const planetScore    = Math.min(25, (Math.log10(Math.max(1, attendance)) / Math.log10(90000)) * 25);
    const transportScore = Math.min(25, (Math.log10(Math.max(1, km))         / Math.log10(2800))  * 25);
    const youthScore     = (players / 22) * 25;
    const societyScore   = Math.min(25, (ads / 500) * 25);
    const score          = planetScore + transportScore + youthScore + societyScore;
    return { planetScore, transportScore, youthScore, societyScore, score };
  }, [attendance, km, players, ads]);

  const band = getBand(score);

  // Biggest lever
  const levers = [
    { name: 'Planet',    value: planetScore    },
    { name: 'Transport', value: transportScore },
    { name: 'Youth',     value: youthScore     },
    { name: 'Society',   value: societyScore   },
  ];
  const biggest = levers.reduce((a, b) => (b.value > a.value ? b : a));

  const LEVER_HINTS: Record<string, string> = {
    Planet:    'Smaller, more local events have a dramatically lower carbon spine.',
    Transport: 'Switch to public transport or active travel to cut this in half.',
    Youth:     'Grassroots and youth football avoids the commercial extraction economy.',
    Society:   'Zero gambling ads means no normalisation of betting to young audiences.',
  };

  const fillPct = Math.min(100, Math.max(0, score));

  // Derive status label for context banner
  function statusLabel(status: string, minute?: number): string {
    if (status === 'live') return minute ? `${minute}'` : 'LIVE';
    if (status === 'ht')   return 'HT';
    if (status === 'ft')   return 'FT';
    if (status === 'pre')  return 'Upcoming';
    return status.toUpperCase();
  }

  // Derive tier info for context banner
  const gamePreset = impactGame ? getPresetForLeague(impactGame.leagueId) : null;
  const tierColor  = gamePreset ? (TIER_COLORS[gamePreset.tier] ?? '#00d4ff') : '#00d4ff';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        background: '#0d1117',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          maxWidth: 760,
          margin: '0 auto',
          padding: 'clamp(16px,3vw,32px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(20px,3.5vw,36px)',
        }}
      >

        {/* ── A. Hero header ── */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: 'clamp(10px,1.4vw,12px)',
              fontWeight: 700,
              letterSpacing: '0.18em',
              color: 'rgba(255,255,255,0.3)',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            IMPACT CALCULATOR
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(20px,4vw,34px)',
              fontWeight: 900,
              color: '#fff',
              lineHeight: 1.1,
              letterSpacing: '0.03em',
            }}
          >
            🌡️ THE FAIRPLAY THERMOMETER
          </h1>
          <p
            style={{
              margin: '10px 0 6px',
              fontSize: 'clamp(13px,1.8vw,17px)',
              color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.5,
              maxWidth: 520,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            SCORING GOALS FOR HUMANITY
          </p>
          <div style={{ fontSize: 'clamp(10px,1.3vw,12px)', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.06em' }}>
            Per-attendee impact score · DEFRA-aligned carbon methodology
          </div>
        </div>

        {/* ── B. Game context banner (Mode A) OR preset pills (Mode B) ── */}
        {impactGame ? (
          /* Mode A — game context banner */
          <div
            style={{
              borderRadius: 16,
              background: `linear-gradient(135deg, rgba(255,100,0,0.1), rgba(255,100,0,0.04))`,
              border: '1px solid rgba(255,100,0,0.25)',
              padding: 'clamp(14px,2.2vw,22px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {/* Top row: teams + clear button */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 'clamp(15px,2.2vw,20px)',
                    fontWeight: 900,
                    color: '#fff',
                    lineHeight: 1.2,
                    marginBottom: 4,
                  }}
                >
                  ⚽ {impactGame.homeTeam} vs {impactGame.awayTeam}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 'clamp(11px,1.5vw,13px)', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                    {impactGame.league}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.25)' }}>·</span>
                  <span
                    style={{
                      fontSize: 'clamp(10px,1.3vw,12px)',
                      fontWeight: 700,
                      color: impactGame.status === 'live' ? '#ff5050' : impactGame.status === 'ht' ? '#ffaa00' : '#00d4ff',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {statusLabel(impactGame.status, impactGame.minute)}
                  </span>
                </div>
              </div>
              <button
                style={{
                  flexShrink: 0,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.4)',
                  borderRadius: 8,
                  padding: '4px 10px',
                  fontSize: 'clamp(10px,1.3vw,12px)',
                  cursor: 'pointer',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                }}
                onClick={() => setImpactGame(null)}
              >
                ✕ Clear game
              </button>
            </div>

            {/* Tier badge + context */}
            {gamePreset && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span
                  style={{
                    background: `${tierColor}20`,
                    border: `1px solid ${tierColor}40`,
                    color: tierColor,
                    borderRadius: 6,
                    padding: '2px 8px',
                    fontSize: 'clamp(9px,1.2vw,11px)',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  {gamePreset.tierLabel}
                </span>
                <span style={{ fontSize: 'clamp(10px,1.3vw,12px)', color: 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}>
                  {gamePreset.context}
                </span>
              </div>
            )}

            <div style={{ fontSize: 'clamp(9px,1.2vw,11px)', color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>
              Dials pre-loaded from league profile — adjust freely below.
            </div>
          </div>
        ) : (
          /* Mode B — open explorer preset pills */
          <div style={{ display: 'flex', gap: 'clamp(8px,1.5vw,14px)', flexWrap: 'wrap', justifyContent: 'center' }}>
            {OPEN_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: 'clamp(8px,1.2vw,12px) clamp(14px,2vw,20px)',
                  borderRadius: 99,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.75)',
                  fontSize: 'clamp(11px,1.5vw,14px)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,212,255,0.08)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,212,255,0.35)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.12)';
                }}
              >
                <span style={{ fontSize: 'clamp(14px,2vw,18px)' }}>{p.emoji}</span>
                {p.label}
              </button>
            ))}
          </div>
        )}

        {/* ── C. Four dials 2×2 grid ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
            gap: 'clamp(10px,1.5vw,16px)',
          }}
        >
          <DialCard
            emoji="🌍"
            label="PLANET"
            subLabel="Stadium footprint, energy, waste"
            color="#00ff88"
            min={10}
            max={90000}
            step={100}
            value={attendance}
            displayValue={`${attendance.toLocaleString()} people`}
            onChange={setAttendance}
          />
          <DialCard
            emoji="🚗"
            label="TRANSPORT"
            subLabel="Return trip. Car = 0.171 kg CO₂/km·person (DEFRA)"
            color="#ffaa00"
            min={1}
            max={5000}
            step={1}
            value={km}
            displayValue={`${km} km`}
            onChange={setKm}
          />
          <DialCard
            emoji="👶"
            label="YOUTH & HEALTH"
            subLabel="0 = grassroots/youth · 22 = full professional"
            color="#00d4ff"
            min={0}
            max={22}
            step={1}
            value={players}
            displayValue={`${players} pro players`}
            onChange={setPlayers}
          />
          <DialCard
            emoji="🎰"
            label="SOCIETY"
            subLabel="Pitch-side, shirts, broadcast. Avg Premier League: 700+ per game"
            color="#ff6b35"
            min={0}
            max={500}
            step={1}
            value={ads}
            displayValue={`${ads} ads`}
            onChange={setAds}
          />
        </div>

        {/* ── D. Thermometer gauge ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          {/* Score readout */}
          <div
            style={{
              fontSize: 'clamp(42px,7vw,64px)',
              fontWeight: 900,
              color: band.color,
              lineHeight: 1,
              textShadow: `0 0 32px ${band.color}55`,
              transition: 'color 0.3s, text-shadow 0.3s',
            }}
          >
            {score.toFixed(1)}°
          </div>

          {/* The gauge itself */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Tube */}
            <div style={{ position: 'relative', width: 40, height: 280, flexShrink: 0 }}>
              {/* Background tube */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 20,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  overflow: 'hidden',
                }}
              >
                {/* Mercury fill — animates from bottom */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: `${fillPct}%`,
                    background: `linear-gradient(to top, ${band.color}, #ff3333)`,
                    borderRadius: '0 0 20px 20px',
                    transition: 'height 0.4s cubic-bezier(0.4,0,0.2,1), background 0.4s',
                    boxShadow: `0 0 16px ${band.color}66`,
                  }}
                />
              </div>
            </div>

            {/* Scale markers */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: 280,
                paddingTop: 0,
              }}
            >
              {[100, 75, 50, 25, 0].map((mark) => (
                <div key={mark} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 1, background: 'rgba(255,255,255,0.2)' }} />
                  <span style={{ fontSize: 'clamp(10px,1.3vw,12px)', fontWeight: 700, color: 'rgba(255,255,255,0.3)', minWidth: 28 }}>
                    {mark}°
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              fontSize: 'clamp(10px,1.3vw,12px)',
              fontWeight: 700,
              letterSpacing: '0.15em',
              color: 'rgba(255,255,255,0.25)',
              textTransform: 'uppercase',
              marginTop: 4,
            }}
          >
            FAIRPLAY TEMPERATURE
          </div>
        </div>

        {/* ── E. Interpretation band ── */}
        <div
          style={{
            borderRadius: 16,
            background: `linear-gradient(135deg, ${band.color}10, ${band.color}06)`,
            border: `1px solid ${band.color}30`,
            padding: 'clamp(16px,2.5vw,24px)',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            transition: 'background 0.4s, border-color 0.4s',
          }}
        >
          <span style={{ fontSize: 'clamp(24px,4vw,36px)', lineHeight: 1, flexShrink: 0 }}>{band.dot}</span>
          <div>
            <div
              style={{
                fontSize: 'clamp(14px,2vw,18px)',
                fontWeight: 900,
                color: band.color,
                letterSpacing: '0.06em',
                marginBottom: 4,
                transition: 'color 0.4s',
              }}
            >
              {band.label}
            </div>
            <div style={{ fontSize: 'clamp(12px,1.6vw,15px)', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
              {band.description}
            </div>
          </div>
        </div>

        {/* ── F. Biggest lever hint ── */}
        <div
          style={{
            borderRadius: 14,
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            padding: 'clamp(14px,2vw,20px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 'clamp(16px,2.2vw,20px)' }}>💡</span>
            <span
              style={{
                fontSize: 'clamp(11px,1.4vw,13px)',
                fontWeight: 900,
                letterSpacing: '0.1em',
                color: 'rgba(255,255,255,0.6)',
                textTransform: 'uppercase',
              }}
            >
              BIGGEST IMPACT:
              <span style={{ color: '#ffdd00', marginLeft: 6 }}>
                {biggest.name} — {biggest.value.toFixed(1)}° of your {score.toFixed(1)}° total
              </span>
            </span>
          </div>
          <div style={{ fontSize: 'clamp(12px,1.6vw,14px)', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, paddingLeft: 28 }}>
            {LEVER_HINTS[biggest.name]}
          </div>

          {/* Mini breakdown bar */}
          <div style={{ display: 'flex', gap: 4, marginTop: 4, paddingLeft: 28 }}>
            {levers.map((l, i) => {
              const colors = ['#00ff88', '#ffaa00', '#00d4ff', '#ff6b35'];
              const w = score > 0 ? (l.value / score) * 100 : 0;
              return (
                <div key={l.name} style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: `${Math.max(w, 2)} 0 0` }}>
                  <div
                    style={{
                      height: 6,
                      borderRadius: 3,
                      background: colors[i],
                      opacity: l.name === biggest.name ? 1 : 0.35,
                      transition: 'flex 0.3s',
                    }}
                  />
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontWeight: 700, letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                    {l.name.slice(0, 3).toUpperCase()} {l.value.toFixed(0)}°
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── G. Footer ── */}
        <div
          style={{
            textAlign: 'center',
            fontSize: 'clamp(9px,1.2vw,11px)',
            color: 'rgba(255,255,255,0.18)',
            letterSpacing: '0.08em',
            paddingBottom: 16,
          }}
        >
          FAIRPLAY · The Modern Colosseum · Methodology based on DEFRA transport emission factors
        </div>
      </div>

      {/* Slider thumb global override — injected once */}
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          appearance: none;
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 0 6px rgba(0,0,0,0.4);
          cursor: pointer;
        }
        input[type=range]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff;
          border: none;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}


