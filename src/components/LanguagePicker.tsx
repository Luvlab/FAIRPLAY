import { useState } from 'react';
import { useLang } from '../context/I18nContext';
import { resetAndDetectLocale } from '../lib/locale';

interface Props {
  onClose: () => void;
}

interface LangOption {
  code: string;
  flag: string;
  nativeName: string;
  englishName: string;
}

const LANGUAGES: LangOption[] = [
  { code: 'en', flag: '🇬🇧', nativeName: 'English',    englishName: 'English' },
  { code: 'fr', flag: '🇫🇷', nativeName: 'Français',   englishName: 'French' },
  { code: 'es', flag: '🇪🇸', nativeName: 'Español',    englishName: 'Spanish' },
  { code: 'pt', flag: '🇧🇷', nativeName: 'Português',  englishName: 'Portuguese' },
  { code: 'de', flag: '🇩🇪', nativeName: 'Deutsch',    englishName: 'German' },
  { code: 'it', flag: '🇮🇹', nativeName: 'Italiano',   englishName: 'Italian' },
  { code: 'nl', flag: '🇳🇱', nativeName: 'Nederlands', englishName: 'Dutch' },
  { code: 'ar', flag: '🇸🇦', nativeName: 'العربية',    englishName: 'Arabic' },
  { code: 'ru', flag: '🇷🇺', nativeName: 'Русский',    englishName: 'Russian' },
  { code: 'tr', flag: '🇹🇷', nativeName: 'Türkçe',     englishName: 'Turkish' },
  { code: 'pl', flag: '🇵🇱', nativeName: 'Polski',     englishName: 'Polish' },
  { code: 'sv', flag: '🇸🇪', nativeName: 'Svenska',    englishName: 'Swedish' },
  { code: 'da', flag: '🇩🇰', nativeName: 'Dansk',      englishName: 'Danish' },
  { code: 'nb', flag: '🇳🇴', nativeName: 'Norsk',      englishName: 'Norwegian' },
  { code: 'hi', flag: '🇮🇳', nativeName: 'हिन्दी',     englishName: 'Hindi' },
  { code: 'id', flag: '🇮🇩', nativeName: 'Bahasa',     englishName: 'Indonesian' },
  { code: 'th', flag: '🇹🇭', nativeName: 'ภาษาไทย',   englishName: 'Thai' },
  { code: 'ja', flag: '🇯🇵', nativeName: '日本語',      englishName: 'Japanese' },
  { code: 'ko', flag: '🇰🇷', nativeName: '한국어',      englishName: 'Korean' },
  { code: 'zh', flag: '🇨🇳', nativeName: '中文',        englishName: 'Chinese' },
];

export default function LanguagePicker({ onClose }: Props) {
  const { lang, setLang } = useLang();
  const [detecting, setDetecting] = useState(false);
  const [detected, setDetected]   = useState<string | null>(null);

  const handleSelect = (code: string) => {
    setLang(code);
    onClose();
  };

  const handleAutoDetect = async () => {
    setDetecting(true);
    setDetected(null);
    try {
      const result = await resetAndDetectLocale();
      setLang(result);
      setDetected(result);
      // Short delay so user sees the result, then close
      setTimeout(() => onClose(), 900);
    } catch {
      setDetecting(false);
    }
  };

  const currentOption = LANGUAGES.find((l) => l.code === lang);

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ zIndex: 60, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Sheet — slides up from bottom on mobile, centred on desktop */}
      <div
        className="mt-auto md:m-auto w-full md:max-w-lg rounded-t-3xl md:rounded-2xl flex flex-col"
        style={{
          background: 'linear-gradient(180deg, #111827, #0d1117)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderBottom: 'none',
          maxHeight: '90vh',
          animation: 'slideUp 0.22s cubic-bezier(0.34,1.2,0.64,1)',
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 md:hidden flex-shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div>
            <div className="font-black tracking-widest" style={{ color: '#00d4ff', fontSize: 'clamp(14px, 2vw, 18px)' }}>
              🌐 LANGUAGE
            </div>
            <div className="text-white/35 mt-0.5" style={{ fontSize: 'clamp(10px, 1.3vw, 12px)' }}>
              Now: {currentOption?.flag} {currentOption?.nativeName ?? lang.toUpperCase()}
            </div>
          </div>
          <button
            className="call-btn flex items-center justify-center rounded-xl"
            style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: 17 }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Auto-detect button */}
        <div className="px-4 py-3 flex-shrink-0">
          <button
            className="call-btn w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black"
            style={{
              background: detecting
                ? 'rgba(0,212,255,0.15)'
                : detected
                ? 'rgba(0,255,136,0.12)'
                : 'rgba(0,212,255,0.08)',
              border: `1.5px solid ${detected ? 'rgba(0,255,136,0.4)' : 'rgba(0,212,255,0.3)'}`,
              color: detected ? '#00ff88' : '#00d4ff',
              fontSize: 'clamp(12px, 1.6vw, 15px)',
              letterSpacing: '0.5px',
              transition: 'all 0.2s ease',
            }}
            disabled={detecting}
            onClick={handleAutoDetect}
          >
            {detecting ? (
              <>
                <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>↻</span>
                Detecting from IP…
              </>
            ) : detected ? (
              <>
                ✓ Detected: {LANGUAGES.find((l) => l.code === detected)?.flag}{' '}
                {LANGUAGES.find((l) => l.code === detected)?.nativeName ?? detected.toUpperCase()}
              </>
            ) : (
              <>📍 Auto-detect from my location</>
            )}
          </button>
        </div>

        {/* Divider */}
        <div
          className="flex items-center gap-3 px-5 mb-2 flex-shrink-0"
          style={{ fontSize: 'clamp(9px, 1.2vw, 11px)', color: 'rgba(255,255,255,0.2)', letterSpacing: '1px' }}
        >
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
          OR CHOOSE MANUALLY
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
        </div>

        {/* Language list */}
        <div className="scrollable flex-1 pb-safe">
          {LANGUAGES.map((l) => {
            const isActive = lang === l.code;
            return (
              <button
                key={l.code}
                className="call-btn w-full flex items-center gap-4 px-5 py-3.5 text-left"
                style={{
                  background: isActive ? 'rgba(0,212,255,0.07)' : 'transparent',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  transition: 'background 0.12s ease',
                }}
                onClick={() => handleSelect(l.code)}
              >
                {/* Flag */}
                <span style={{ fontSize: 'clamp(22px, 3.5vw, 30px)', lineHeight: 1, flexShrink: 0 }}>
                  {l.flag}
                </span>

                {/* Names */}
                <div className="flex-1 min-w-0">
                  <div
                    className="font-black leading-tight"
                    style={{ color: isActive ? '#00d4ff' : 'rgba(255,255,255,0.9)', fontSize: 'clamp(13px, 1.8vw, 16px)' }}
                  >
                    {l.nativeName}
                  </div>
                  <div className="text-white/35" style={{ fontSize: 'clamp(10px, 1.3vw, 12px)' }}>
                    {l.englishName} · {l.code.toUpperCase()}
                  </div>
                </div>

                {/* Active checkmark */}
                {isActive && (
                  <div
                    className="rounded-full flex items-center justify-center font-black flex-shrink-0"
                    style={{ width: 24, height: 24, background: '#00d4ff', color: '#0d1117', fontSize: 13 }}
                  >
                    ✓
                  </div>
                )}
              </button>
            );
          })}
          {/* Bottom safe area padding */}
          <div style={{ height: 'max(env(safe-area-inset-bottom), 20px)' }} />
        </div>
      </div>
    </div>
  );
}
