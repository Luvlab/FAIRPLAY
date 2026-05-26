/** Returns the correct localised name for soccer/football based on browser locale */
const NAMES: Record<string, string> = {
  // American English, Canadian English, Australian English, New Zealand English — "Soccer"
  'en-US': 'Soccer', 'en-CA': 'Soccer', 'en-AU': 'Soccer', 'en-NZ': 'Soccer',
  'en-PH': 'Soccer',
  // All other English → Football
  'en': 'Football',
  // European
  'es': 'Fútbol', 'es-MX': 'Fútbol', 'es-AR': 'Fútbol', 'es-CO': 'Fútbol',
  'es-CL': 'Fútbol', 'es-PE': 'Fútbol', 'es-VE': 'Fútbol', 'es-EC': 'Fútbol',
  'fr': 'Football', 'fr-BE': 'Football', 'fr-CH': 'Football',
  'de': 'Fußball', 'de-AT': 'Fußball', 'de-CH': 'Fußball',
  'pt': 'Futebol', 'pt-BR': 'Futebol',
  'it': 'Calcio',
  'nl': 'Voetbal', 'nl-BE': 'Voetbal',
  'pl': 'Piłka nożna',
  'sv': 'Fotboll',
  'no': 'Fotball', 'nb': 'Fotball', 'nn': 'Fotball',
  'da': 'Fodbold',
  'fi': 'Jalkapallo',
  'cs': 'Fotbal',
  'sk': 'Futbal',
  'hu': 'Labdarúgás',
  'ro': 'Fotbal',
  'el': 'Ποδόσφαιρο',
  'hr': 'Nogomet',
  'sl': 'Nogomet',
  'sr': 'Фудбал',
  'bs': 'Fudbal',
  'bg': 'Футбол',
  'uk': 'Футбол',
  'ru': 'Футбол',
  'lt': 'Futbolas',
  'lv': 'Futbols',
  'et': 'Jalgpall',
  'ca': 'Futbol',
  'eu': 'Futbola',
  'gl': 'Fútbol',
  'is': 'Fótbolti',
  'tr': 'Futbol',
  'he': 'כדורגל',
  'ar': 'كرة القدم',
  'fa': 'فوتبال',
  'ur': 'فٹبال',
  // Asian
  'zh': '足球', 'zh-CN': '足球', 'zh-TW': '足球', 'zh-HK': '足球',
  'ja': 'サッカー',
  'ko': '축구',
  'hi': 'फुटबॉल',
  'bn': 'ফুটবল',
  'ta': 'கால்பந்து',
  'te': 'ఫుట్‌బాల్',
  'mr': 'फुटबॉल',
  'gu': 'ફૂટબૉલ',
  'pa': 'ਫੁੱਟਬਾਲ',
  'ml': 'ഫുട്ബോൾ',
  'th': 'ฟุตบอล',
  'vi': 'Bóng đá',
  'id': 'Sepak Bola',
  'ms': 'Bola Sepak',
  'km': 'បាល់ទាត់',
  'lo': 'ບານເຕະ',
  'my': 'ဘောလုံး',
  'ka': 'ფუტბოლი',
  'hy': 'Ֆուտբոլ',
  'az': 'Futbol',
  'kk': 'Футбол',
  'uz': 'Futbol',
  'tg': 'Футбол',
  'mn': 'Хөлбөмбөг',
  // African
  'sw': 'Mpira wa Miguu',
  'am': 'እግር ኳስ',
  'ha': 'Ƙwallon ƙafa',
  'yo': 'Bọọlu ẹsẹ',
  'ig': 'Egwuregwu bọọlụ ụkwụ',
  'af': 'Sokker',
  'zu': 'Ibhola lezinyawo',
  'xh': 'Ibhola elinonyawo',
};

export function getSportName(): string {
  const locale = navigator.language || 'en';
  if (NAMES[locale]) return NAMES[locale];
  // Try full locale first (e.g. en-GB → Football)
  const lang = locale.split('-')[0].toLowerCase();
  if (NAMES[lang]) return NAMES[lang];
  return 'Football';
}

export function getSportEmoji(): string {
  return '⚽';
}
