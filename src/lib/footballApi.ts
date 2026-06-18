/**
 * Football / Soccer live data via ESPN's public scoreboard API.
 * No API key required.
 */

export interface LiveMatch {
  id: string;
  espnId: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamAbbr: string;
  awayTeamAbbr: string;
  homeLogo: string;
  awayLogo: string;
  homeScore: number;
  awayScore: number;
  status: 'pre' | 'live' | 'ht' | 'ft';
  statusDetail: string;
  displayClock: string;
  minute: number;
  leagueId: string;
  leagueName: string;
  leagueFlag: string;
  date: string;
  venue: string;
}

export const LEAGUES = [
  { id: 'fifa.world',   name: 'FIFA World Cup 2026',  flag: '🏆', region: 'International' },
  { id: 'eng.1',        name: 'Premier League',       flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', region: 'Europe' },
  { id: 'esp.1',        name: 'La Liga',               flag: '🇪🇸', region: 'Europe' },
  { id: 'ger.1',        name: 'Bundesliga',            flag: '🇩🇪', region: 'Europe' },
  { id: 'ita.1',        name: 'Serie A',               flag: '🇮🇹', region: 'Europe' },
  { id: 'fra.1',        name: 'Ligue 1',               flag: '🇫🇷', region: 'Europe' },
  { id: 'ned.1',        name: 'Eredivisie',            flag: '🇳🇱', region: 'Europe' },
  { id: 'por.1',        name: 'Primeira Liga',         flag: '🇵🇹', region: 'Europe' },
  { id: 'sco.1',        name: 'Scottish Premiership',  flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', region: 'Europe' },
  { id: 'tur.1',        name: 'Süper Lig',             flag: '🇹🇷', region: 'Europe' },
  { id: 'bel.1',        name: 'First Division A',      flag: '🇧🇪', region: 'Europe' },
  { id: 'usa.1',        name: 'MLS',                   flag: '🇺🇸', region: 'Americas' },
  { id: 'mex.1',        name: 'Liga MX',               flag: '🇲🇽', region: 'Americas' },
  { id: 'bra.1',        name: 'Brasileirão',           flag: '🇧🇷', region: 'Americas' },
  { id: 'arg.1',        name: 'Primera División',      flag: '🇦🇷', region: 'Americas' },
  { id: 'col.1',        name: 'Primera A',             flag: '🇨🇴', region: 'Americas' },
  { id: 'jpn.1',        name: 'J1 League',             flag: '🇯🇵', region: 'Asia' },
  { id: 'kor.1',        name: 'K League 1',            flag: '🇰🇷', region: 'Asia' },
  { id: 'chn.1',        name: 'Super League',          flag: '🇨🇳', region: 'Asia' },
  { id: 'sau.1',        name: 'Saudi Pro League',      flag: '🇸🇦', region: 'Asia' },
  { id: 'aus.1',        name: 'A-League',              flag: '🇦🇺', region: 'Oceania' },
  { id: 'rsa.1',        name: 'PSL',                   flag: '🇿🇦', region: 'Africa' },
  { id: 'uefa.champions', name: 'Champions League',   flag: '🏆', region: 'International' },
  { id: 'uefa.europa',  name: 'Europa League',         flag: '🥈', region: 'International' },
  { id: 'conmebol.libertadores', name: 'Copa Libertadores', flag: '🌎', region: 'International' },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseEvent(event: any, leagueId: string): LiveMatch {
  const league = LEAGUES.find(l => l.id === leagueId);
  const comp = event.competitions?.[0] ?? {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const home = comp.competitors?.find((c: any) => c.homeAway === 'home') ?? {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const away = comp.competitors?.find((c: any) => c.homeAway === 'away') ?? {};
  const statusType = event.status?.type ?? {};
  const state = statusType.state ?? 'post';
  const completed = statusType.completed ?? false;
  const description = statusType.description ?? '';

  let status: LiveMatch['status'] = 'ft';
  if (!completed && state === 'in') {
    status = description.toLowerCase().includes('half time') || description.toLowerCase().includes('halftime') ? 'ht' : 'live';
  } else if (!completed && state === 'pre') {
    status = 'pre';
  }

  return {
    id: `espn-${event.id}`,
    espnId: String(event.id),
    homeTeam: home.team?.displayName ?? 'TBD',
    awayTeam: away.team?.displayName ?? 'TBD',
    homeTeamAbbr: home.team?.abbreviation ?? '',
    awayTeamAbbr: away.team?.abbreviation ?? '',
    homeLogo: home.team?.logo ?? '',
    awayLogo: away.team?.logo ?? '',
    homeScore: parseInt(home.score ?? '0') || 0,
    awayScore: parseInt(away.score ?? '0') || 0,
    status,
    statusDetail: description,
    displayClock: event.status?.displayClock ?? '',
    minute: parseInt(event.status?.displayClock ?? '0') || 0,
    leagueId,
    leagueName: league?.name ?? leagueId,
    leagueFlag: league?.flag ?? '⚽',
    date: event.date ?? '',
    venue: comp.venue?.fullName ?? '',
  };
}

export async function fetchLeagueMatches(leagueId: string): Promise<LiveMatch[]> {
  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${leagueId}/scoreboard`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return [];
    const data = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data.events ?? []).map((e: any) => parseEvent(e, leagueId));
  } catch {
    return [];
  }
}

/** Fetch live + today's matches across the top leagues simultaneously */
export async function fetchAllMatches(): Promise<LiveMatch[]> {
  const topLeagues = [
    'fifa.world',  // 🏆 World Cup — always first
    'eng.1', 'esp.1', 'ger.1', 'ita.1', 'fra.1',
    'usa.1', 'ned.1', 'por.1', 'bra.1', 'arg.1',
    'uefa.champions', 'uefa.europa', 'jpn.1', 'sau.1',
  ];
  const results = await Promise.allSettled(topLeagues.map(id => fetchLeagueMatches(id)));
  const all: LiveMatch[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled') all.push(...r.value);
  }
  // Sort: live first, then pre (upcoming), then ft (past)
  return all.sort((a, b) => {
    const order = { live: 0, ht: 0, pre: 1, ft: 2 };
    return (order[a.status] ?? 3) - (order[b.status] ?? 3);
  });
}

// ── World Cup Group Standings ────────────────────────────────────────────────

export interface WCTeamStanding {
  teamName: string;
  logo: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface WCGroup {
  name: string;
  entries: WCTeamStanding[];
}

export async function fetchWorldCupGroups(): Promise<WCGroup[]> {
  try {
    const res = await fetch(
      'https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/standings',
      { signal: AbortSignal.timeout(6000) }
    );
    if (!res.ok) return [];
    const data = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const children: any[] = data.children ?? [];
    return children.map((g) => ({
      name: g.name ?? 'Group',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      entries: (g.standings?.entries ?? []).map((e: any) => {
        const stats: Record<string, string> = {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const s of e.stats ?? []) stats[s.name] = s.displayValue ?? '0';
        return {
          teamName: e.team?.displayName ?? '?',
          logo: e.team?.logo ?? '',
          played:       parseInt(stats['gamesPlayed']     ?? '0') || 0,
          won:          parseInt(stats['wins']            ?? '0') || 0,
          drawn:        parseInt(stats['ties']            ?? '0') || 0,
          lost:         parseInt(stats['losses']         ?? '0') || 0,
          goalsFor:     parseInt(stats['pointsFor']      ?? '0') || 0,
          goalsAgainst: parseInt(stats['pointsAgainst'] ?? '0') || 0,
          points:       parseInt(stats['points']         ?? '0') || 0,
        } as WCTeamStanding;
      }),
    }));
  } catch {
    return [];
  }
}

/** Convert a LiveMatch into the Game shape the store uses */
export function matchToGame(m: LiveMatch) {
  return {
    id: m.id,
    homeTeam: m.homeTeam,
    awayTeam: m.awayTeam,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    minute: m.minute || 0,
    status: m.status as 'pre' | 'live' | 'ht' | 'ft' | 'et' | 'pens',
    leagueId: m.leagueId,
    venueName: m.venue,
    date: m.date,
  };
}
