import { useGameStore } from '../store/gameStore';
import { getSportName } from '../lib/sportName';

const sport = getSportName();

const FEATURES = [
  {
    emoji: '🏅',
    name: 'Referee',
    desc: `Call every foul, card and restart in real time on any live ${sport} match`,
    color: '#00d4ff',
  },
  {
    emoji: '👥',
    name: 'Compare',
    desc: 'See how your calls stack up against every fan — and the official game',
    color: '#aa88ff',
  },
  {
    emoji: '🌍',
    name: 'Leagues',
    desc: 'Every league on the planet, or create your own local one for any age group',
    color: '#00ff88',
  },
  {
    emoji: '📹',
    name: 'Timeline',
    desc: 'Upload photos and videos pinned to the exact match minute with GPS',
    color: '#ff8800',
  },
  {
    emoji: '🔮',
    name: 'Studio',
    desc: 'Orbit a live 3D pitch and edit match clips from any classic camera angle',
    color: '#ff69b4',
  },
  {
    emoji: '🛒',
    name: 'Shop',
    desc: 'FAIRPLAY gear printed and shipped worldwide on demand via Printful',
    color: '#FFD700',
  },
];

export default function WelcomeScreen({ onEnter }: { onEnter: () => void }) {
  const openAuthModal = useGameStore((s) => s.openAuthModal);

  const handleSignUp = () => {
    onEnter();
    setTimeout(() => openAuthModal('register'), 300);
  };

  return (
    <div
      className="flex flex-col"
      style={{
        width: '100dvw',
        height: '100dvh',
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #070b10 0%, #0d1117 40%, #0a1520 100%)',
        animation: 'welcomeFadeIn 0.5s ease-out',
      }}
    >
      {/* ── Top glow ──────────────────────────────────────────────────── */}
      <div
        className="absolute top-0 left-1/2 pointer-events-none"
        style={{
          width: 'clamp(300px, 70vw, 600px)',
          height: 'clamp(200px, 40vh, 400px)',
          background: 'radial-gradient(ellipse at center top, rgba(0,212,255,0.12) 0%, transparent 70%)',
          transform: 'translateX(-50%)',
        }}
      />

      {/* ── Scrollable body ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-between overflow-y-auto px-5 py-6 md:py-10">

        {/* ── Hero ──────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center" style={{ animation: 'welcomeSlideDown 0.5s ease-out' }}>
          <span
            style={{
              fontSize: 'clamp(56px, 12vw, 96px)',
              lineHeight: 1,
              filter: 'drop-shadow(0 0 24px rgba(0,212,255,0.6)) drop-shadow(0 0 60px rgba(0,212,255,0.25))',
              marginBottom: 'clamp(12px, 2vh, 24px)',
              display: 'block',
            }}
          >
            ⚽
          </span>

          <div
            className="font-black tracking-widest"
            style={{
              fontSize: 'clamp(32px, 7vw, 64px)',
              color: '#00d4ff',
              textShadow: '0 0 40px rgba(0,212,255,0.5)',
              letterSpacing: '0.12em',
              lineHeight: 1,
            }}
          >
            FAIRPLAY
          </div>

          <div
            className="font-bold tracking-wide mt-2"
            style={{
              fontSize: 'clamp(13px, 2.2vw, 20px)',
              color: 'rgba(255,255,255,0.5)',
              letterSpacing: '0.08em',
            }}
          >
            The {sport} referee app for everyone
          </div>
        </div>

        {/* ── Feature grid ──────────────────────────────────────────── */}
        <div
          className="w-full"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 'clamp(8px, 2vw, 16px)',
            maxWidth: 640,
            margin: 'clamp(20px, 4vh, 40px) auto',
            animation: 'welcomeSlideUp 0.55s ease-out',
          }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.name}
              className="rounded-2xl flex flex-col gap-1.5"
              style={{
                padding: 'clamp(12px, 2.5vw, 20px)',
                background: `linear-gradient(135deg, ${f.color}0e, ${f.color}06)`,
                border: `1px solid ${f.color}28`,
              }}
            >
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 'clamp(18px, 3.5vw, 28px)', lineHeight: 1 }}>{f.emoji}</span>
                <span
                  className="font-black tracking-wide"
                  style={{ color: f.color, fontSize: 'clamp(12px, 1.8vw, 16px)' }}
                >
                  {f.name.toUpperCase()}
                </span>
              </div>
              <p
                className="text-white/45 leading-snug"
                style={{ fontSize: 'clamp(10px, 1.4vw, 13px)' }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        {/* ── CTA ───────────────────────────────────────────────────── */}
        <div
          className="flex flex-col items-center gap-3 w-full"
          style={{ maxWidth: 360, animation: 'welcomeSlideUp 0.6s ease-out' }}
        >
          <button
            className="w-full call-btn font-black tracking-widest rounded-2xl"
            style={{
              padding: 'clamp(14px, 2.5vh, 20px)',
              background: 'linear-gradient(135deg, rgba(0,212,255,0.22), rgba(0,136,255,0.18))',
              border: '1.5px solid rgba(0,212,255,0.5)',
              color: '#00d4ff',
              fontSize: 'clamp(14px, 2.2vw, 18px)',
              boxShadow: '0 0 30px rgba(0,212,255,0.2)',
              letterSpacing: '0.1em',
            }}
            onClick={onEnter}
          >
            ENTER APP
          </button>

          <button
            className="call-btn font-bold"
            style={{
              color: 'rgba(255,255,255,0.35)',
              fontSize: 'clamp(11px, 1.5vw, 14px)',
            }}
            onClick={handleSignUp}
          >
            Sign up for a free account →
          </button>

          <p
            className="text-white/20 text-center"
            style={{ fontSize: 'clamp(9px, 1.2vw, 11px)', marginTop: 4 }}
          >
            No account required · Works on any device · Free forever
          </p>
        </div>

      </div>
    </div>
  );
}
