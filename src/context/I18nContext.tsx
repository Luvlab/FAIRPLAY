import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getTranslations, type Translations } from '../lib/i18n';
import { detectLocale, getCachedLocale, setManualLocale } from '../lib/locale';

interface I18nCtx {
  t: Translations;
  lang: string;
  setLang: (l: string) => void;
}

const I18nContext = createContext<I18nCtx>({
  t: getTranslations('en'),
  lang: 'en',
  setLang: () => undefined,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  // Seed with whatever's already in localStorage so the first paint is correct
  const [lang, setLangState] = useState(() => getCachedLocale());
  const [t, setT] = useState(() => getTranslations(getCachedLocale()));

  useEffect(() => {
    detectLocale().then((l) => {
      setLangState(l);
      setT(getTranslations(l));
    });
  }, []);

  const setLang = (l: string) => {
    setManualLocale(l);          // stores as { lang, ts, manual: true }
    setLangState(l);
    setT(getTranslations(l));
  };

  return (
    <I18nContext.Provider value={{ t, lang, setLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useT(): Translations {
  return useContext(I18nContext).t;
}

export function useLang(): { lang: string; setLang: (l: string) => void } {
  const { lang, setLang } = useContext(I18nContext);
  return { lang, setLang };
}
