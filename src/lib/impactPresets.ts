export interface ImpactPreset {
  attendance: number;
  km: number;          // avg fan travel distance (return trip factored in formula)
  players: number;     // pro players (0-22)
  ads: number;         // gambling ads visible
  tier: 'grassroots' | 'local' | 'regional' | 'national' | 'elite' | 'global';
  tierLabel: string;
  context: string;     // one-line human context
}

export const LEAGUE_PRESETS: Record<string, ImpactPreset> = {
  // Elite European / Global
  'uefa.champions':    { attendance: 62000, km: 480, players: 22, ads: 180, tier: 'global',   tierLabel: 'Global Elite',     context: 'Fans fly from across Europe. Max commercial saturation.' },
  'uefa.europa':       { attendance: 38000, km: 290, players: 22, ads: 140, tier: 'elite',    tierLabel: 'Elite Cup',        context: 'Continental competition with heavy broadcast deals.' },
  'uefa.conference':   { attendance: 22000, km: 220, players: 22, ads: 100, tier: 'elite',    tierLabel: 'Conference League',context: 'Third-tier European competition with growing fanbase.' },
  'eng.1':             { attendance: 54000, km: 85,  players: 22, ads: 200, tier: 'elite',    tierLabel: 'Premier League',   context: 'Highest gambling ad density of any league on earth.' },
  'esp.1':             { attendance: 47000, km: 95,  players: 22, ads: 160, tier: 'elite',    tierLabel: 'La Liga',          context: 'Historic clubs, growing global broadcast footprint.' },
  'ger.1':             { attendance: 51000, km: 88,  players: 22, ads: 95,  tier: 'elite',    tierLabel: 'Bundesliga',       context: 'Highest average attendance in world football.' },
  'fra.1':             { attendance: 29000, km: 76,  players: 22, ads: 120, tier: 'elite',    tierLabel: 'Ligue 1',          context: "Dominated by PSG's sovereign wealth model." },
  'ita.1':             { attendance: 34000, km: 82,  players: 22, ads: 150, tier: 'elite',    tierLabel: 'Serie A',          context: 'Ultra culture, historic stadiums, high commercial load.' },
  'por.1':             { attendance: 18000, km: 65,  players: 22, ads: 90,  tier: 'national', tierLabel: 'Primeira Liga',    context: 'Talent exporter — develops players for richer leagues.' },
  'ned.1':             { attendance: 21000, km: 55,  players: 22, ads: 80,  tier: 'national', tierLabel: 'Eredivisie',       context: 'World-famous academy pipeline. Low fan travel.' },
  'bel.1':             { attendance: 12000, km: 45,  players: 22, ads: 70,  tier: 'national', tierLabel: 'Pro League',       context: 'Compact country, short travel. Solid development league.' },
  'sco.1':             { attendance: 15000, km: 60,  players: 22, ads: 85,  tier: 'national', tierLabel: 'Scottish Prem',    context: 'Celtic-Rangers rivalry dominates. High fan passion.' },
  'tur.1':             { attendance: 27000, km: 90,  players: 22, ads: 110, tier: 'national', tierLabel: 'Süper Lig',        context: 'Passionate fan culture in a growing football market.' },
  'rus.1':             { attendance: 18000, km: 120, players: 22, ads: 75,  tier: 'national', tierLabel: 'RPL',              context: 'Vast country — some clubs travel thousands of km.' },
  'bra.1':             { attendance: 25000, km: 320, players: 22, ads: 110, tier: 'elite',    tierLabel: 'Brasileirão',      context: 'Continent-wide travel. Richest talent pool per wage paid.' },
  'arg.1':             { attendance: 28000, km: 180, players: 22, ads: 85,  tier: 'elite',    tierLabel: 'Liga Profesional', context: 'Global exports at a fraction of European wages.' },
  'mex.1':             { attendance: 22000, km: 140, players: 22, ads: 95,  tier: 'national', tierLabel: 'Liga MX',          context: "North America's highest-attended domestic league." },
  'usa.1':             { attendance: 24000, km: 420, players: 22, ads: 75,  tier: 'national', tierLabel: 'MLS',              context: 'Long domestic flights. Growing but still emerging.' },
  'col.1':             { attendance: 15000, km: 200, players: 22, ads: 60,  tier: 'national', tierLabel: 'Liga BetPlay',     context: 'Altitude adds complexity. Passionate supporter culture.' },
  'chi.1':             { attendance: 12000, km: 170, players: 22, ads: 55,  tier: 'national', tierLabel: 'Primera División', context: 'Long country spans mean significant travel distances.' },
  'jpn.1':             { attendance: 20000, km: 75,  players: 22, ads: 60,  tier: 'national', tierLabel: 'J-League',         context: 'High attendance, strong stadium culture, low ad load.' },
  'kor.1':             { attendance: 14000, km: 80,  players: 22, ads: 50,  tier: 'national', tierLabel: 'K-League',         context: 'Growing market with strong youth development.' },
  'chn.1':             { attendance: 28000, km: 350, players: 22, ads: 120, tier: 'national', tierLabel: 'Super League',     context: 'Vast distances and heavy state investment distort economics.' },
  'aus.1':             { attendance: 10000, km: 480, players: 22, ads: 45,  tier: 'national', tierLabel: 'A-League',         context: 'Intercity flights. Multi-sport market. Modest attendance.' },
  'eng.2':             { attendance: 18000, km: 60,  players: 22, ads: 140, tier: 'national', tierLabel: 'Championship',     context: 'High gambling exposure. Relegation/promotion pressure.' },
  'eng.3':             { attendance: 7000,  km: 40,  players: 20, ads: 80,  tier: 'regional', tierLabel: 'League One',       context: 'Regional travel. Clubs under financial stress.' },
  'eng.4':             { attendance: 4000,  km: 28,  players: 18, ads: 50,  tier: 'regional', tierLabel: 'League Two',       context: 'Community clubs. Lower commercial pressure.' },
  'eng.5':             { attendance: 1800,  km: 18,  players: 14, ads: 15,  tier: 'regional', tierLabel: 'National League',  context: 'Semi-professional. Fans travel short distances.' },
  'ger.2':             { attendance: 28000, km: 70,  players: 22, ads: 80,  tier: 'national', tierLabel: 'Bundesliga 2',     context: 'Strong second tier. High attendance for non-top-flight.' },
  'esp.2':             { attendance: 14000, km: 70,  players: 22, ads: 100, tier: 'national', tierLabel: 'La Liga 2',        context: 'Competitive second tier with strong regional identities.' },
  'ita.2':             { attendance: 12000, km: 65,  players: 22, ads: 90,  tier: 'national', tierLabel: 'Serie B',          context: 'Historic clubs navigating financial constraints.' },
  'fra.2':             { attendance: 10000, km: 58,  players: 22, ads: 70,  tier: 'national', tierLabel: 'Ligue 2',          context: 'Development league feeding the top flight.' },
  // Default fallbacks
  'default_elite':     { attendance: 45000, km: 120, players: 22, ads: 140, tier: 'elite',    tierLabel: 'Pro League',       context: 'Professional football at scale.' },
  'default_national':  { attendance: 15000, km: 60,  players: 22, ads: 70,  tier: 'national', tierLabel: 'National League',  context: 'National competition with moderate commercial load.' },
  'default_local':     { attendance: 400,   km: 8,   players: 8,  ads: 0,   tier: 'local',    tierLabel: 'Local Match',      context: 'Community football at its purest.' },
  'custom':            { attendance: 80,    km: 4,   players: 0,  ads: 0,   tier: 'grassroots', tierLabel: 'Grassroots',     context: 'Families, friends, and the love of the game.' },
};

export function getPresetForLeague(leagueId: string): ImpactPreset {
  return LEAGUE_PRESETS[leagueId] ?? LEAGUE_PRESETS['default_national'];
}

export function getPresetForCustomMatch(): ImpactPreset {
  return LEAGUE_PRESETS['custom'];
}
