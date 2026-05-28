import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

export default function CardOverlay() {
  const showCard    = useGameStore((s) => s.showCard);
  const cardType    = useGameStore((s) => s.cardType);
  const dismissCard = useGameStore((s) => s.dismissCard);
  const setActiveTab = useGameStore((s) => s.setActiveTab);

  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const dismiss = () => {
    dismissCard();
    setActiveTab('compare');
  };

  const handleTap = () => {
    tapCount.current += 1;
    clearTimeout(tapTimer.current);
    if (tapCount.current >= 2) {
      tapCount.current = 0;
      dismiss();
    } else {
      tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 400);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!showCard || !cardType) return null;

  return (
    <div
      className="fixed inset-0 z-50 cursor-pointer select-none"
      style={{
        width: '100vw',
        height: '100vh',
        background: cardType === 'yellow' ? '#FFD700' : '#DC143C',
        animation: 'cardFlash 0.15s ease-out',
      }}
      onClick={handleTap}
      onTouchEnd={(e) => { e.preventDefault(); handleTap(); }}
    />
  );
}
