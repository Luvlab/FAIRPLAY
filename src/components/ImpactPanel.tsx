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

function barColor(pct: number): string {
  if (pct < 33) return '#00ff88';
  if (pct < 66) return '#ffaa00';
  return '#ff4444';
}

function fmtEur(n: number): string {
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `€${(n / 1_000).toFixed(0)}K`;
  return `€${n.toFixed(0)}`;
}

function fmtNox(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)} tonnes`;
  return `${kg.toFixed(0)} kg`;
}

// ── Severity bar ─────────────────────────────────────────────────────────────
function SeverityBar({ pct }: { pct: number }) {
  const clamped = Math.min(100, Math.max(0, pct));
  return (
    <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)', overflow: 'hidden', margin: '8px 0 4px' }}>
      <div
        style={{
          height: '100%',
          width: `${clamped}%`,
          borderRadius: 2,
          background: barColor(clamped),
          transition: 'width 0.35s ease, background 0.35s ease',
        }}
      />
    </div>
  );
}

// ── Metric card wrapper ───────────────────────────────────────────────────────
function MetricCard({ children, fullWidth }: { children: React.ReactNode; fullWidth?: boolean }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: 16,
        gridColumn: fullWidth ? '1 / -1' : undefined,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      {children}
    </div>
  );
}

// ── Dial card (input slider) ──────────────────────────────────────────────────
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
      <div style={{ height: 4, background: color, width: '100%' }} />
      <div style={{ padding: 'clamp(10px,1.8vw,16px)', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 'clamp(16px,2.2vw,20px)', lineHeight: 1 }}>{emoji}</span>
          <div>
            <div style={{ fontSize: 'clamp(9px,1.2vw,11px)', fontWeight: 700, letterSpacing: '0.12em', color: color, textTransform: 'uppercase' }}>
              {label}
            </div>
            <div style={{ fontSize: 'clamp(8px,1.1vw,10px)', color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>
              {subLabel}
            </div>
          </div>
        </div>
        <div style={{ fontSize: 'clamp(14px,2.2vw,18px)', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
          {displayValue}
        </div>
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
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ImpactPanel() {
  const impactGame    = useGameStore((s) => s.impactGame);
  const setImpactGame = useGameStore((s) => s.setImpactGame);

  const [attendance, setAttendance] = useState(5000);
  const [km,         setKm]         = useState(12);
  const [players,    setPlayers]    = useState(0);
  const [ads,        setAds]        = useState(0);

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

  // ── All metrics computed together ─────────────────────────────────────────
  const metrics = useMemo(() => {
    // ── Extraction Index (0-100) ──────────────────────────────────────────
    const planetScore    = Math.min(25, (Math.log10(Math.max(1, attendance)) / Math.log10(90000)) * 25);
    const transportScore = Math.min(25, (Math.log10(Math.max(1, km))         / Math.log10(2800))  * 25);
    const youthScore     = (players / 22) * 25;
    const societyScore   = Math.min(25, (ads / 500) * 25);
    const extractionIndex = planetScore + transportScore + youthScore + societyScore;

    // ── Air Toxins ────────────────────────────────────────────────────────
    const carFans       = attendance * 0.4;
    const carTrips      = carFans / 1.6;
    const roadKm        = carTrips * km * 2;

    const planeFans     = km > 300 ? attendance * 0.25 : 0;
    const planePassKm   = planeFans * km * 2;

    const noxRoad  = roadKm      * 0.00052;
    const noxAir   = planePassKm * 0.000038;
    const noxStad  = attendance  * 0.0008;
    const totalNox = noxRoad + noxAir + noxStad;

    const pm25Road  = roadKm     * 0.00004;
    const pm25Stad  = attendance * 0.0002;
    const totalPm25 = pm25Road + pm25Stad;

    const noxSeverity = Math.min(100, (totalNox / 5000) * 100);

    let noxInsight: string;
    if (totalNox < 10)   noxInsight = 'Equivalent to a few diesel vans. Negligible local air impact.';
    else if (totalNox < 500)  noxInsight = 'Similar to a heavy traffic day on a busy street.';
    else if (totalNox < 5000) noxInsight = `Equivalent to ${Math.round(totalNox / 5)} diesel trucks idling for 8 hours.`;
    else                       noxInsight = 'Industrial-scale pollution event. Affects air quality for nearby communities for days.';

    // ── Economic Drain ────────────────────────────────────────────────────
    const retentionRate =
      players === 0 ? 0.90 :
      players <= 6  ? 0.70 :
      players <= 14 ? 0.45 :
      km < 100      ? 0.30 :
      km < 500      ? 0.18 : 0.08;

    const avgTicket =
      players === 0 ? 5 :
      players <= 14 ? 25 :
      km < 200      ? 55 : 120;

    const grossRevenue   = attendance * avgTicket;
    const drainedRevenue = grossRevenue * (1 - retentionRate);
    const drainPct       = (1 - retentionRate) * 100;

    let economicInsight: string;
    if      (retentionRate > 0.7) economicInsight = 'Most money stays in the community. This is how football should work.';
    else if (retentionRate > 0.4) economicInsight = 'Significant share flows to national bodies and sponsors.';
    else if (retentionRate > 0.2) economicInsight = 'Multinational broadcast deals and sponsors capture most of the value.';
    else                           economicInsight = 'The local community hosts the spectacle. Global corporations take the profit.';

    // ── Human Cost (0-100) ────────────────────────────────────────────────
    const proScore    = (players / 22) * 40;
    const youthRisk   = Math.min(30, (ads * attendance * 0.3) / 100000 * 10);
    const originScore = players > 0 ? Math.min(30, (km / 2800) * 30) : 0;
    const humanCost   = proScore + youthRisk + originScore;

    let humanInsight: string;
    if      (humanCost < 20) humanInsight = 'Community sport. No significant exploitation dynamic.';
    else if (humanCost < 45) humanInsight = 'Some commercial pressure. Young players are a resource here.';
    else if (humanCost < 70) humanInsight = 'Significant extraction of player value and youth attention.';
    else                      humanInsight = "Elite football: global labour market where producing nations get agents' fees, not development.";

    // ── Talent Pipeline ───────────────────────────────────────────────────
    const talentDrainPerMatch =
      players === 0 ? 0 :
      players <= 8  ? 500 :
      players <= 14 ? 50000 :
      km < 100      ? 200000 :
      km < 500      ? 1500000 :
      km < 1000     ? 4000000 :
                      8000000;

    const scoutedChildren = players >= 18 ? Math.round(attendance / 12) : 0;

    return {
      // Extraction Index
      extractionIndex, planetScore, transportScore, youthScore, societyScore,
      // Air Toxins
      totalNox, totalPm25, noxSeverity, noxInsight,
      // Economic
      drainedRevenue, drainPct, retentionRate, economicInsight,
      // Human
      humanCost, proScore, youthRisk, originScore, humanInsight,
      // Talent
      talentDrainPerMatch, scoutedChildren,
    };
  }, [attendance, km, players, ads]);

  const band = getBand(metrics.extractionIndex);

  const levers = [
    { name: 'Planet',    value: metrics.planetScore    },
    { name: 'Transport', value: metrics.transportScore },
    { name: 'Human',     value: metrics.youthScore     },
    { name: 'Society',   value: metrics.societyScore   },
  ];
  const biggest = levers.reduce((a, b) => (b.value > a.value ? b : a));

  const LEVER_HINTS: Record<string, string> = {
    Planet:    'Smaller, more local events have a dramatically lower carbon spine.',
    Transport: 'Switch to public transport or active travel to cut this in half.',
    Human:     'Grassroots and youth football avoids the commercial extraction economy.',
    Society:   'Zero gambling ads means no normalisation of betting to young audiences.',
  };

  function statusLabel(status: string, minute?: number): string {
    if (status === 'live') return minute ? `${minute}'` : 'LIVE';
    if (status === 'ht')   return 'HT';
    if (status === 'ft')   return 'FT';
    if (status === 'pre')  return 'Upcoming';
    return status.toUpperCase();
  }

  const gamePreset = impactGame ? getPresetForLeague(impactGame.leagueId) : null;
  const tierColor  = gamePreset ? (TIER_COLORS[gamePreset.tier] ?? '#00d4ff') : '#00d4ff';

  // ── Render ───────────────────────────────────────────────────────────────
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
          gap: 'clamp(16px,3vw,28px)',
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
            SCORING GOALS FOR HUMANITY
          </h1>
          <p
            style={{
              margin: '10px 0 6px',
              fontSize: 'clamp(12px,1.6vw,15px)',
              color: 'rgba(255,255,255,0.45)',
              lineHeight: 1.5,
              maxWidth: 520,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            What does football really cost — and who pays the price?
          </p>
          <div style={{ fontSize: 'clamp(10px,1.3vw,12px)', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.06em' }}>
            Adjust the four dials below to see concrete real-world impact metrics
          </div>
        </div>

        {/* ── B. Game context banner (Mode A) OR preset pills (Mode B) ── */}
        {impactGame ? (
          <div
            style={{
              borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(255,100,0,0.1), rgba(255,100,0,0.04))',
              border: '1px solid rgba(255,100,0,0.25)',
              padding: 'clamp(14px,2.2vw,22px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
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
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
            gap: 'clamp(8px,1.4vw,14px)',
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
            subLabel="Return trip distance (DEFRA factors)"
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
            subLabel="Gambling ads: pitch-side, shirts, broadcast"
            color="#ff6b35"
            min={0}
            max={500}
            step={1}
            value={ads}
            displayValue={`${ads} ads`}
            onChange={setAds}
          />
        </div>

        {/* ── D. Dashboard section header ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
          <span
            style={{
              fontSize: 'clamp(9px,1.2vw,11px)',
              fontWeight: 700,
              letterSpacing: '0.2em',
              color: 'rgba(255,255,255,0.25)',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            MATCH IMPACT DASHBOARD
          </span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
        </div>

        {/* ── E. 5-card grid ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
            gap: 'clamp(10px,1.6vw,16px)',
          }}
        >

          {/* Card 1 — Extraction Index */}
          <MetricCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 20 }}>🌡️</span>
              <span style={{ fontSize: 'clamp(9px,1.2vw,11px)', fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
                Extraction Index
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 'clamp(22px,3.5vw,32px)', fontWeight: 900, color: band.color, transition: 'color 0.3s' }}>
                {metrics.extractionIndex.toFixed(0)}
              </span>
              <span style={{ fontSize: 'clamp(11px,1.4vw,13px)', color: 'rgba(255,255,255,0.5)' }}>/100</span>
              <span
                style={{
                  marginLeft: 6,
                  fontSize: 'clamp(9px,1.2vw,11px)',
                  fontWeight: 700,
                  color: band.color,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                {band.dot} {band.label}
              </span>
            </div>
            <SeverityBar pct={metrics.extractionIndex} />
            <div style={{ fontSize: 'clamp(10px,1.3vw,12px)', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
              {band.description}
            </div>
            <div style={{ fontSize: 'clamp(9px,1.1vw,11px)', color: 'rgba(255,255,255,0.2)', marginTop: 4, lineHeight: 1.6 }}>
              Planet {metrics.planetScore.toFixed(0)} · Transport {metrics.transportScore.toFixed(0)} · Human {metrics.youthScore.toFixed(0)} · Society {metrics.societyScore.toFixed(0)}
            </div>
          </MetricCard>

          {/* Card 2 — Air Toxins */}
          <MetricCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 20 }}>🌬️</span>
              <span style={{ fontSize: 'clamp(9px,1.2vw,11px)', fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
                Air Toxins
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 'clamp(22px,3.5vw,32px)', fontWeight: 900, color: '#fff' }}>
                  {fmtNox(metrics.totalNox)}
                </span>
                <span style={{ fontSize: 'clamp(11px,1.4vw,13px)', color: 'rgba(255,255,255,0.5)' }}>NOₓ</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 'clamp(14px,2vw,18px)', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>
                  {metrics.totalPm25.toFixed(1)} kg
                </span>
                <span style={{ fontSize: 'clamp(10px,1.3vw,12px)', color: 'rgba(255,255,255,0.4)' }}>PM₂.₅</span>
              </div>
            </div>
            <SeverityBar pct={metrics.noxSeverity} />
            <div style={{ fontSize: 'clamp(10px,1.3vw,12px)', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
              {metrics.noxInsight}
            </div>
          </MetricCard>

          {/* Card 3 — Economic Drain */}
          <MetricCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 20 }}>💰</span>
              <span style={{ fontSize: 'clamp(9px,1.2vw,11px)', fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
                Economic Drain
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 'clamp(22px,3.5vw,32px)', fontWeight: 900, color: '#fff' }}>
                {fmtEur(metrics.drainedRevenue)}
              </span>
              <span style={{ fontSize: 'clamp(11px,1.4vw,13px)', color: 'rgba(255,255,255,0.5)' }}>leaves locally</span>
            </div>
            <div style={{ fontSize: 'clamp(10px,1.3vw,12px)', fontWeight: 700, color: barColor(metrics.drainPct) }}>
              {Math.round(metrics.drainPct)}% extracted from local economy
            </div>
            <SeverityBar pct={metrics.drainPct} />
            <div style={{ fontSize: 'clamp(10px,1.3vw,12px)', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
              {metrics.economicInsight}
            </div>
          </MetricCard>

          {/* Card 4 — Human Cost */}
          <MetricCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 20 }}>⛓️</span>
              <span style={{ fontSize: 'clamp(9px,1.2vw,11px)', fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
                Human Cost
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 'clamp(22px,3.5vw,32px)', fontWeight: 900, color: '#fff' }}>
                {metrics.humanCost.toFixed(0)}
              </span>
              <span style={{ fontSize: 'clamp(11px,1.4vw,13px)', color: 'rgba(255,255,255,0.5)' }}>/100</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 2 }}>
              {[
                { label: 'Labour extraction', value: metrics.proScore,    max: 40 },
                { label: 'Youth exposure',     value: metrics.youthRisk,  max: 30 },
                { label: 'Origin disparity',   value: metrics.originScore, max: 30 },
              ].map(({ label, value, max }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'clamp(9px,1.1vw,11px)', color: 'rgba(255,255,255,0.3)' }}>
                  <span>{label}</span>
                  <span style={{ fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>{value.toFixed(0)}/{max}</span>
                </div>
              ))}
            </div>
            <SeverityBar pct={metrics.humanCost} />
            <div style={{ fontSize: 'clamp(10px,1.3vw,12px)', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
              {metrics.humanInsight}
            </div>
          </MetricCard>

          {/* Card 5 — Talent Pipeline (full width) */}
          <MetricCard fullWidth>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 20 }}>🌍</span>
              <span style={{ fontSize: 'clamp(9px,1.2vw,11px)', fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
                Talent Pipeline Drain
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 'clamp(22px,3.5vw,32px)', fontWeight: 900, color: '#fff' }}>
                {fmtEur(metrics.talentDrainPerMatch)}
              </span>
              <span style={{ fontSize: 'clamp(11px,1.4vw,13px)', color: 'rgba(255,255,255,0.5)' }}>
                extracted from producing nations per match of this type
              </span>
            </div>

            {/* Flow diagram */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                flexWrap: 'wrap',
                margin: '8px 0',
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {[
                { text: 'Africa / S.America / E.Europe', color: 'rgba(255,255,255,0.7)' },
                { text: '→', color: 'rgba(255,255,255,0.25)' },
                { text: 'TALENT', color: '#00d4ff', bold: true },
                { text: '→', color: 'rgba(255,255,255,0.25)' },
                { text: 'Western Leagues', color: 'rgba(255,255,255,0.7)' },
                { text: '→', color: 'rgba(255,255,255,0.25)' },
                { text: 'WEALTH', color: '#ffaa00', bold: true },
                { text: '→', color: 'rgba(255,255,255,0.25)' },
                { text: 'Back? ❌', color: '#ff4444' },
              ].map((item, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: 'clamp(10px,1.4vw,13px)',
                    fontWeight: item.bold ? 900 : 500,
                    color: item.color,
                    letterSpacing: item.bold ? '0.08em' : 0,
                  }}
                >
                  {item.text}
                </span>
              ))}
            </div>

            {metrics.scoutedChildren > 0 && (
              <div style={{ fontSize: 'clamp(11px,1.4vw,13px)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                ~{metrics.scoutedChildren.toLocaleString()} children are scouted from developing nations for every match like this played
              </div>
            )}

            <div style={{ fontSize: 'clamp(10px,1.3vw,12px)', color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>
              FIFA distributes ~6% of World Cup revenue to football development globally. The other 94% stays in European football's financial ecosystem.
            </div>

            <div style={{ fontSize: 'clamp(8px,1.1vw,10px)', color: 'rgba(255,255,255,0.18)', marginTop: 4, fontStyle: 'italic' }}>
              Estimates based on CIES Football Observatory, FIFA Financial Report 2022, UEFA HatTrick Programme data
            </div>
          </MetricCard>

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
              BIGGEST LEVER:
              <span style={{ color: '#ffdd00', marginLeft: 6 }}>
                {biggest.name} — {biggest.value.toFixed(1)} of {metrics.extractionIndex.toFixed(1)} extraction points
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
              const w = metrics.extractionIndex > 0 ? (l.value / metrics.extractionIndex) * 100 : 0;
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
                    {l.name.slice(0, 3).toUpperCase()} {l.value.toFixed(0)}
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
          FAIRPLAY · The Modern Colosseum · Methodology based on DEFRA transport emission factors · CIES Football Observatory · FIFA Financial Reports
        </div>
      </div>

      {/* Slider thumb global override */}
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
