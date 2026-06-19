/**
 * Detects the user's preferred language.
 * Priority: manual user pick (never expires) → fresh IP geo (TTL 12h) → navigator.language → 'fr'
 *
 * Storage format: JSON  { lang: string, ts: number, manual?: true }
 * Old plain-string format is treated as expired so IP detection re-runs.
 */

const STORAGE_KEY = 'fp_locale';
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

interface LocaleCache {
  lang: string;
  ts: number;
  manual?: boolean; // true = user explicitly chose this; never override with geo
}

/** Best-effort country→language map for IP geo fallback */
const COUNTRY_LANG: Record<string, string> = {
  // English-speaking
  GB: 'en', US: 'en', CA: 'en', AU: 'en', NZ: 'en', IE: 'en',
  ZA: 'en', NG: 'en', GH: 'en', KE: 'en', UG: 'en', TZ: 'en',
  // Spanish
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es',
  VE: 'es', EC: 'es', BO: 'es', PY: 'es', UY: 'es', CR: 'es',
  GT: 'es', HN: 'es', SV: 'es', NI: 'es', PA: 'es', DO: 'es', CU: 'es',
  // Portuguese
  BR: 'pt', PT: 'pt', AO: 'pt', MZ: 'pt',
  // German
  DE: 'de', AT: 'de',
  // French
  FR: 'fr', LU: 'fr', MC: 'fr', SN: 'fr', CI: 'fr', CM: 'fr', BF: 'fr',
  ML: 'fr', NE: 'fr', TD: 'fr', CF: 'fr', CG: 'fr', CD: 'fr', GA: 'fr',
  GN: 'fr', TG: 'fr', BJ: 'fr', MG: 'fr', HT: 'fr', CH: 'fr',
  // Italian
  IT: 'it',
  // Dutch
  NL: 'nl', BE: 'nl',
  // Arabic
  SA: 'ar', AE: 'ar', EG: 'ar', MA: 'ar', DZ: 'ar', TN: 'ar',
  IQ: 'ar', JO: 'ar', KW: 'ar', QA: 'ar', BH: 'ar', OM: 'ar',
  YE: 'ar', LB: 'ar', SY: 'ar', LY: 'ar', SD: 'ar',
  // Japanese
  JP: 'ja',
  // Korean
  KR: 'ko',
  // Chinese
  CN: 'zh', TW: 'zh', HK: 'zh', MO: 'zh', SG: 'zh',
  // Russian
  RU: 'ru', BY: 'ru', KZ: 'ru', KG: 'ru', TJ: 'ru',
  // Turkish
  TR: 'tr', AZ: 'tr',
  // Polish
  PL: 'pl',
  // Swedish
  SE: 'sv',
  // Danish
  DK: 'da',
  // Norwegian
  NO: 'nb',
  // Hindi
  IN: 'hi',
  // Indonesian / Malay
  ID: 'id', MY: 'id',
  // Thai
  TH: 'th',
};

/** Strip region tag: 'pt-BR' → 'pt', 'zh-TW' → 'zh' */
function baseLang(l: string): string {
  const i = l.indexOf('-');
  return i > 0 ? l.slice(0, i) : l;
}

function navLang(): string {
  return baseLang(navigator.language.toLowerCase());
}

// ── Cache read/write ──────────────────────────────────────────────────────────

function readCache(): LocaleCache | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    // Must be an object with a string `lang` field (new format)
    if (parsed && typeof parsed === 'object' && typeof parsed.lang === 'string') {
      return parsed as LocaleCache;
    }
    // Old plain-string format (e.g. stored "en" without JSON) → expired
    return null;
  } catch {
    // Not valid JSON at all → expired
    return null;
  }
}

function writeCache(lang: string, manual = false): void {
  const cache: LocaleCache = { lang, ts: Date.now(), manual };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Synchronously return whatever language is cached (for immediate first render).
 * Returns 'fr' by default until geo detection resolves.
 */
export function getCachedLocale(): string {
  return readCache()?.lang ?? 'fr';
}

/**
 * Detect the user's locale. Called once on app mount.
 *
 * - Manual pick → returned immediately, never overridden by geo.
 * - Auto-detected + fresh (< 12 h) → returned immediately.
 * - Stale, missing, or old plain-string format → IP geo round-trip, then stored.
 */
export async function detectLocale(): Promise<string> {
  const c = readCache();

  // Always respect a deliberate manual selection
  if (c?.manual) return c.lang;

  // Use a recent auto-detected value without hitting the network
  if (c && Date.now() - c.ts < CACHE_TTL_MS) return c.lang;

  // Cache is missing, stale (> 12 h), or in the old plain-string format
  // → ask ipapi.co for the current country
  try {
    const res = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(3500),
    });
    if (res.ok) {
      const data = await res.json() as { country_code?: string };
      const cc = data.country_code ?? '';
      const lang = COUNTRY_LANG[cc.toUpperCase()] ?? navLang();
      writeCache(lang, false);
      return lang;
    }
  } catch {
    // Timeout, CORS block, or network error — fall back to browser language
  }

  const lang = navLang();
  writeCache(lang, false);
  return lang;
}

/**
 * Store a language chosen explicitly by the user.
 * Marked `manual: true` — detectLocale() will never override it with geo.
 */
export function setManualLocale(lang: string): void {
  writeCache(lang, true);
}

/**
 * Clear the cache and force a fresh IP geo-detection round-trip.
 * Called when the user taps "Auto-detect language" in LanguagePicker.
 */
export async function resetAndDetectLocale(): Promise<string> {
  localStorage.removeItem(STORAGE_KEY);
  return detectLocale();
}
