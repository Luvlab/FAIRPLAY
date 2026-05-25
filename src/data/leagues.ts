export interface League {
  id: string;
  name: string;
  shortName: string;
  country: string;
  countryCode: string;
  flag: string;
  tier: number;
  founded?: number;
  logo?: string;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  leagueId: string;
  colors: [string, string];
  isCustom?: boolean;
}

export const WORLD_LEAGUES: League[] = [
  // Europe - Top 5
  { id: 'epl', name: 'Premier League', shortName: 'EPL', country: 'England', countryCode: 'GB', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', tier: 1, founded: 1992 },
  { id: 'laliga', name: 'La Liga', shortName: 'LA LIGA', country: 'Spain', countryCode: 'ES', flag: '🇪🇸', tier: 1, founded: 1929 },
  { id: 'bundesliga', name: 'Bundesliga', shortName: 'BL', country: 'Germany', countryCode: 'DE', flag: '🇩🇪', tier: 1, founded: 1963 },
  { id: 'seriea', name: 'Serie A', shortName: 'SERIE A', country: 'Italy', countryCode: 'IT', flag: '🇮🇹', tier: 1, founded: 1929 },
  { id: 'ligue1', name: 'Ligue 1', shortName: 'L1', country: 'France', countryCode: 'FR', flag: '🇫🇷', tier: 1, founded: 1932 },
  // Europe - Other
  { id: 'eredivisie', name: 'Eredivisie', shortName: 'ERE', country: 'Netherlands', countryCode: 'NL', flag: '🇳🇱', tier: 1, founded: 1956 },
  { id: 'primeira', name: 'Primeira Liga', shortName: 'PL', country: 'Portugal', countryCode: 'PT', flag: '🇵🇹', tier: 1, founded: 1934 },
  { id: 'allsvenskan', name: 'Allsvenskan', shortName: 'ALLSV', country: 'Sweden', countryCode: 'SE', flag: '🇸🇪', tier: 1, founded: 1924 },
  { id: 'superligaen', name: 'Superligaen', shortName: 'SL', country: 'Denmark', countryCode: 'DK', flag: '🇩🇰', tier: 1, founded: 1991 },
  { id: 'tippeligaen', name: 'Eliteserien', shortName: 'ELITE', country: 'Norway', countryCode: 'NO', flag: '🇳🇴', tier: 1, founded: 1963 },
  { id: 'superliga_ch', name: 'Super League', shortName: 'SL-CH', country: 'Switzerland', countryCode: 'CH', flag: '🇨🇭', tier: 1, founded: 1931 },
  { id: 'jupiler', name: 'Jupiler Pro League', shortName: 'JPL', country: 'Belgium', countryCode: 'BE', flag: '🇧🇪', tier: 1, founded: 1895 },
  { id: 'ekstraklasa', name: 'Ekstraklasa', shortName: 'EKS', country: 'Poland', countryCode: 'PL', flag: '🇵🇱', tier: 1, founded: 1927 },
  { id: 'premier_russia', name: 'Russian Premier League', shortName: 'RPL', country: 'Russia', countryCode: 'RU', flag: '🇷🇺', tier: 1, founded: 1992 },
  { id: 'super_turkey', name: 'Süper Lig', shortName: 'SL-TR', country: 'Turkey', countryCode: 'TR', flag: '🇹🇷', tier: 1, founded: 1959 },
  { id: 'premier_greece', name: 'Super League Greece', shortName: 'SLG', country: 'Greece', countryCode: 'GR', flag: '🇬🇷', tier: 1, founded: 1959 },
  { id: 'fortuna_cz', name: 'Fortuna liga', shortName: 'FL-CZ', country: 'Czech Republic', countryCode: 'CZ', flag: '🇨🇿', tier: 1, founded: 1925 },
  { id: 'nemzeti', name: 'OTP Bank Liga', shortName: 'NB1', country: 'Hungary', countryCode: 'HU', flag: '🇭🇺', tier: 1, founded: 1901 },
  { id: 'mls', name: 'Major League Soccer', shortName: 'MLS', country: 'USA', countryCode: 'US', flag: '🇺🇸', tier: 1, founded: 1993 },
  { id: 'liga_mx', name: 'Liga MX', shortName: 'LIGA MX', country: 'Mexico', countryCode: 'MX', flag: '🇲🇽', tier: 1, founded: 1943 },
  // South America
  { id: 'brasileirao', name: 'Brasileirão Série A', shortName: 'BSA', country: 'Brazil', countryCode: 'BR', flag: '🇧🇷', tier: 1, founded: 1959 },
  { id: 'primera_arg', name: 'Primera División', shortName: 'PD-ARG', country: 'Argentina', countryCode: 'AR', flag: '🇦🇷', tier: 1, founded: 1891 },
  { id: 'primera_col', name: 'Liga BetPlay', shortName: 'LBP', country: 'Colombia', countryCode: 'CO', flag: '🇨🇴', tier: 1, founded: 1948 },
  { id: 'primera_chi', name: 'Primera División', shortName: 'PD-CHI', country: 'Chile', countryCode: 'CL', flag: '🇨🇱', tier: 1, founded: 1933 },
  { id: 'primera_uru', name: 'Primera División', shortName: 'PD-URU', country: 'Uruguay', countryCode: 'UY', flag: '🇺🇾', tier: 1, founded: 1900 },
  // Asia
  { id: 'j_league', name: 'J1 League', shortName: 'J1', country: 'Japan', countryCode: 'JP', flag: '🇯🇵', tier: 1, founded: 1992 },
  { id: 'k_league', name: 'K League 1', shortName: 'KL1', country: 'South Korea', countryCode: 'KR', flag: '🇰🇷', tier: 1, founded: 1983 },
  { id: 'csl', name: 'Chinese Super League', shortName: 'CSL', country: 'China', countryCode: 'CN', flag: '🇨🇳', tier: 1, founded: 1994 },
  { id: 'isl', name: 'Indian Super League', shortName: 'ISL', country: 'India', countryCode: 'IN', flag: '🇮🇳', tier: 1, founded: 2013 },
  { id: 'saudi_pro', name: 'Saudi Pro League', shortName: 'SPL', country: 'Saudi Arabia', countryCode: 'SA', flag: '🇸🇦', tier: 1, founded: 1976 },
  { id: 'uae_pro', name: 'UAE Pro League', shortName: 'UAEPL', country: 'UAE', countryCode: 'AE', flag: '🇦🇪', tier: 1, founded: 1973 },
  // Africa
  { id: 'npfl', name: 'NPFL', shortName: 'NPFL', country: 'Nigeria', countryCode: 'NG', flag: '🇳🇬', tier: 1, founded: 1972 },
  { id: 'psl', name: 'Premier Soccer League', shortName: 'PSL', country: 'South Africa', countryCode: 'ZA', flag: '🇿🇦', tier: 1, founded: 1996 },
  { id: 'egyptpl', name: 'Egyptian Premier League', shortName: 'EPL-EG', country: 'Egypt', countryCode: 'EG', flag: '🇪🇬', tier: 1, founded: 1948 },
  // Oceania
  { id: 'a_league', name: 'A-League Men', shortName: 'ALM', country: 'Australia', countryCode: 'AU', flag: '🇦🇺', tier: 1, founded: 2004 },
  // International
  { id: 'ucl', name: 'UEFA Champions League', shortName: 'UCL', country: 'Europe', countryCode: 'EU', flag: '🏆', tier: 0, founded: 1955 },
  { id: 'uel', name: 'UEFA Europa League', shortName: 'UEL', country: 'Europe', countryCode: 'EU', flag: '🥇', tier: 0, founded: 1971 },
  { id: 'uecl', name: 'UEFA Conference League', shortName: 'UECL', country: 'Europe', countryCode: 'EU', flag: '🥈', tier: 0, founded: 2021 },
  { id: 'worldcup', name: 'FIFA World Cup', shortName: 'WC', country: 'World', countryCode: 'WW', flag: '🌍', tier: 0, founded: 1930 },
  { id: 'euro', name: 'UEFA Euro', shortName: 'EURO', country: 'Europe', countryCode: 'EU', flag: '🇪🇺', tier: 0, founded: 1960 },
  { id: 'copa', name: 'Copa América', shortName: 'COPA', country: 'South America', countryCode: 'SA', flag: '🌎', tier: 0, founded: 1916 },
  { id: 'conmebol', name: 'CONMEBOL Libertadores', shortName: 'LIBERTAD', country: 'South America', countryCode: 'SA', flag: '🌎', tier: 0, founded: 1960 },
  { id: 'afcon', name: 'Africa Cup of Nations', shortName: 'AFCON', country: 'Africa', countryCode: 'AF', flag: '🌍', tier: 0, founded: 1957 },
];

export const EPL_TEAMS: Team[] = [
  { id: 'arsenal', name: 'Arsenal', shortName: 'ARS', leagueId: 'epl', colors: ['#EF0107', '#FFFFFF'] },
  { id: 'chelsea', name: 'Chelsea', shortName: 'CHE', leagueId: 'epl', colors: ['#034694', '#DBA111'] },
  { id: 'liverpool', name: 'Liverpool', shortName: 'LIV', leagueId: 'epl', colors: ['#C8102E', '#00B2A9'] },
  { id: 'mancity', name: 'Manchester City', shortName: 'MCI', leagueId: 'epl', colors: ['#6CABDD', '#1C2C5B'] },
  { id: 'manutd', name: 'Manchester United', shortName: 'MUN', leagueId: 'epl', colors: ['#DA291C', '#FBE122'] },
  { id: 'spurs', name: 'Tottenham Hotspur', shortName: 'TOT', leagueId: 'epl', colors: ['#132257', '#FFFFFF'] },
];
