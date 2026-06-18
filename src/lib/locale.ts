/**
 * Detects the user's preferred language.
 * Priority: localStorage cache → IP geolocation (ipapi.co) → navigator.language → 'en'
 */

const STORAGE_KEY = 'fp_locale';

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
  FR: 'fr', LU: 'fr', MC: 'fr', SN: 'fr', CI: 'fr', CM: 'fr',
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

export async function detectLocale(): Promise<string> {
  // Return cached value immediately
  const cached = localStorage.getItem(STORAGE_KEY);
  if (cached) return cached;

  // Try IP geolocation first
  try {
    const res = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(3500),
    });
    if (res.ok) {
      const data = await res.json() as { country_code?: string };
      const cc = data.country_code ?? '';
      const lang = COUNTRY_LANG[cc.toUpperCase()] ?? navLang();
      localStorage.setItem(STORAGE_KEY, lang);
      return lang;
    }
  } catch {
    // Network blocked, CORS issue, timeout — fall through
  }

  // Fall back to browser language
  const lang = navLang();
  localStorage.setItem(STORAGE_KEY, lang);
  return lang;
}

/** Synchronously read whatever's already cached (for immediate first render).
 *  Defaults to French until geo detection resolves. */
export function getCachedLocale(): string {
  return localStorage.getItem(STORAGE_KEY) ?? 'fr';
}

/** Clear the cache and force a fresh IP geo-detection round-trip.
 *  Call this when the user taps "Auto-detect language". */
export async function resetAndDetectLocale(): Promise<string> {
  localStorage.removeItem(STORAGE_KEY);
  return detectLocale();
}
