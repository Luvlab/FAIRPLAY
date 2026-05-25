import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

export default function CardOverlay() {
  const showCard = useGameStore((s) => s.showCard);
  const cardType = useGameStore((s) => s.cardType);
  const dismissCard = useGameStore((s) => s.dismissCard);
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleTap = () => {
    tapCount.current += 1;
    clearTimeout(tapTimer.current);
    if (tapCount.current >= 2) {
      tapCount.current = 0;
      dismissCard();
    } else {
      tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 400);
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismissCard();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dismissCard]);

  if (!showCard || !cardType) return null;

  const isYellow = cardType === 'yellow';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer select-none"
      style={{ background: isYellow ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.9)' }}
      onClick={handleTap}
      onTouchEnd={handleTap}
    >
      {/* Background flash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isYellow
            ? 'radial-gradient(ellipse at center, rgba(255,215,0,0.25) 0%, transparent 70%)'
            : 'radial-gradient(ellipse at center, rgba(220,20,60,0.3) 0%, transparent 70%)',
        }}
      />

      {/* Card */}
      <div className="card-enter flex flex-col items-center gap-8" style={{ perspective: '600px' }}>
        <div
          className="rounded-2xl"
          style={{
            width: 180,
            height: 240,
            background: isYellow
              ? 'linear-gradient(145deg, #FFE44D, #FFD700, #CC9E00)'
              : 'linear-gradient(145deg, #FF4060, #DC143C, #8B0000)',
            boxShadow: isYellow
              ? '0 0 80px rgba(255,215,0,0.9), 0 0 160px rgba(255,215,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)'
              : '0 0 80px rgba(220,20,60,0.9), 0 0 160px rgba(220,20,60,0.4), inset 0 1px 0 rgba(255,100,100,0.3)',
            border: `3px solid ${isYellow ? 'rgba(255,255,255,0.4)' : 'rgba(255,150,150,0.3)'}`,
          }}
        />

        <div className="text-center">
          <div
            className="text-5xl font-black tracking-widest mb-2"
            style={{
              color: isYellow ? '#FFD700' : '#FF4444',
              textShadow: isYellow
                ? '0 0 30px rgba(255,215,0,0.8)'
                : '0 0 30px rgba(255,0,0,0.8)',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            {isYellow ? 'YELLOW' : 'RED'}
          </div>
          <div
            className="text-6xl font-black tracking-wider"
            style={{ color: isYellow ? '#FFD700' : '#FF4444', fontFamily: 'system-ui, sans-serif' }}
          >
            CARD
          </div>
        </div>

        <div className="text-center mt-2">
          <p className="text-white/40 text-sm font-medium tracking-widest">DOUBLE-TAP TO DISMISS</p>
        </div>
      </div>

      {/* Corner labels */}
      <div className="absolute top-8 left-8 text-white/20 text-xs font-mono tracking-widest">FAIRPLAY</div>
      <div className="absolute top-8 right-8 text-white/20 text-xs font-mono tracking-widest">REFEREE</div>
    </div>
  );
}
