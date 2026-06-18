import { useState } from 'react';
import { WHISTLE_TYPES } from '../lib/whistle';
import { playWhistle } from '../lib/whistle';
import { useGameStore } from '../store/gameStore';
import { useT } from '../context/I18nContext';

interface Props {
  onClose: () => void;
}

export default function WhistlePicker({ onClose }: Props) {
  const t            = useT();
  const whistleType  = useGameStore((s) => s.whistleType);
  const setWhistleType = useGameStore((s) => s.setWhistleType);

  const [previewId, setPreviewId] = useState<string | null>(null);

  const handlePreview = (id: string) => {
    setPreviewId(id);
    playWhistle(id);
    setTimeout(() => setPreviewId(null), 1000);
  };

  const handleSelect = (id: string) => {
    setWhistleType(id);
    playWhistle(id);
  };

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ zIndex: 60, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(13,17,23,0.9)' }}
      >
        <div>
          <div className="font-black tracking-widest" style={{ color: '#00d4ff', fontSize: 'clamp(14px, 2vw, 20px)' }}>
            🎙️ {t.whistlePickerTitle ?? 'WHISTLE SOUNDS'}
          </div>
          <div className="text-white/35 mt-0.5" style={{ fontSize: 'clamp(10px, 1.3vw, 13px)' }}>
            {t.whistlePickerSub ?? 'Choose your official referee whistle'}
          </div>
        </div>
        <button
          className="call-btn flex items-center justify-center rounded-xl font-black"
          style={{
            width: 'clamp(36px, 5vw, 46px)', height: 'clamp(36px, 5vw, 46px)',
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.6)', fontSize: 'clamp(14px, 2vw, 18px)',
          }}
          onClick={onClose}
        >
          ✕
        </button>
      </div>

      {/* Whistle grid */}
      <div className="flex-1 scrollable p-3 md:p-5">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(140px, 30vw, 220px), 1fr))',
            gap: 'clamp(8px, 1.5vw, 14px)',
          }}
        >
          {WHISTLE_TYPES.map((w) => {
            const isSelected = whistleType === w.id;
            const isPreviewing = previewId === w.id;

            return (
              <div
                key={w.id}
                className="rounded-2xl flex flex-col gap-2 overflow-hidden"
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(0,212,255,0.14), rgba(0,212,255,0.06))'
                    : 'rgba(255,255,255,0.04)',
                  border: isSelected
                    ? '1.5px solid rgba(0,212,255,0.5)'
                    : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: isSelected
                    ? '0 0 20px rgba(0,212,255,0.15), inset 0 1px 0 rgba(255,255,255,0.08)'
                    : 'none',
                  transition: 'all 0.15s ease',
                  padding: 'clamp(12px, 2vw, 18px)',
                }}
              >
                {/* Emoji + selected checkmark */}
                <div className="flex items-start justify-between">
                  <div
                    className="rounded-xl flex items-center justify-center"
                    style={{
                      width: 'clamp(44px, 6vw, 58px)', height: 'clamp(44px, 6vw, 58px)',
                      background: isSelected ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.06)',
                      border: isSelected ? '1px solid rgba(0,212,255,0.3)' : '1px solid rgba(255,255,255,0.1)',
                      fontSize: 'clamp(20px, 3vw, 28px)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isPreviewing ? (
                      <span style={{ animation: 'pulse 0.4s ease infinite' }}>〰️</span>
                    ) : w.emoji}
                  </div>
                  {isSelected && (
                    <div
                      className="rounded-full flex items-center justify-center font-black"
                      style={{ width: 22, height: 22, background: '#00d4ff', color: '#0d1117', fontSize: 13 }}
                    >
                      ✓
                    </div>
                  )}
                </div>

                {/* Name + description */}
                <div>
                  <div
                    className="font-black leading-tight"
                    style={{
                      color: isSelected ? '#00d4ff' : 'rgba(255,255,255,0.9)',
                      fontSize: 'clamp(12px, 1.6vw, 15px)',
                    }}
                  >
                    {w.name}
                  </div>
                  <div
                    className="text-white/40 mt-1 leading-snug"
                    style={{ fontSize: 'clamp(9px, 1.2vw, 12px)' }}
                  >
                    {w.description}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 mt-auto pt-1">
                  {/* Preview */}
                  <button
                    className="call-btn flex items-center justify-center gap-1.5 rounded-xl font-bold flex-shrink-0"
                    style={{
                      height: 'clamp(32px, 4.5vw, 42px)',
                      width: 'clamp(32px, 4.5vw, 42px)',
                      background: isPreviewing ? 'rgba(255,200,0,0.2)' : 'rgba(255,255,255,0.07)',
                      border: isPreviewing ? '1px solid rgba(255,200,0,0.4)' : '1px solid rgba(255,255,255,0.12)',
                      color: isPreviewing ? '#ffc800' : 'rgba(255,255,255,0.5)',
                      fontSize: 'clamp(13px, 1.8vw, 17px)',
                      transition: 'all 0.1s ease',
                    }}
                    onClick={() => handlePreview(w.id)}
                    title="Preview"
                  >
                    {isPreviewing ? '〰' : '▶'}
                  </button>

                  {/* Select */}
                  <button
                    className="call-btn flex-1 rounded-xl font-black"
                    style={{
                      height: 'clamp(32px, 4.5vw, 42px)',
                      background: isSelected
                        ? 'rgba(0,212,255,0.2)'
                        : 'rgba(0,212,255,0.08)',
                      border: isSelected
                        ? '1px solid rgba(0,212,255,0.45)'
                        : '1px solid rgba(0,212,255,0.15)',
                      color: isSelected ? '#00d4ff' : 'rgba(0,212,255,0.7)',
                      fontSize: 'clamp(10px, 1.3vw, 13px)',
                      letterSpacing: '0.5px',
                      transition: 'all 0.15s ease',
                    }}
                    onClick={() => handleSelect(w.id)}
                  >
                    {isSelected
                      ? (t.whistleSelected ?? '✓ SELECTED')
                      : (t.whistleUse ?? 'USE THIS')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom hint */}
        <div className="text-center text-white/20 mt-6 mb-2" style={{ fontSize: 'clamp(10px, 1.3vw, 12px)' }}>
          {t.whistleHint ?? '▶ Preview any whistle before selecting · Your choice is saved automatically'}
        </div>
      </div>
    </div>
  );
}
